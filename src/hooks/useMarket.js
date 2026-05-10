import { useState, useEffect, useCallback } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase.config.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const API_BASE = import.meta.env.VITE_API_URL || 'https://blobis-gqla.onrender.com';
const TRADING_FEE = 0.003; // 0.3% fee

export const useMarket = (userId) => {
  const [poolBC, setPoolBC] = useState(0);
  const [poolBLOB, setPoolBLOB] = useState(0);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [candles, setCandles] = useState([]);
  const [trades, setTrades] = useState([]);
  const [stats24h, setStats24h] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch global pool state
  const fetchPool = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/market/pool`);
      if (!response.ok) throw new Error('Failed to fetch pool');

      const data = await response.json();
      setPoolBC(data.pool_bc);
      setPoolBLOB(data.pool_blob);
      setCurrentPrice(data.current_price);
      setError(null);
    } catch (err) {
      console.error('Error fetching pool:', err);
      setError(err.message);
    }
  }, []);

  // Fetch 24h statistics
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/market/stats`);
      if (!response.ok) throw new Error('Failed to fetch stats');

      const data = await response.json();
      setStats24h(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, []);

  // Fetch candles for timeframe
  const fetchCandles = useCallback(async (timeframe = '1m', candleLimit = 100) => {
    try {
      const response = await fetch(`${API_BASE}/api/market/candles/${timeframe}?limit=${candleLimit}`);
      if (!response.ok) throw new Error('Failed to fetch candles');

      const data = await response.json();
      setCandles(data.candles || []);
    } catch (err) {
      console.error('Error fetching candles:', err);
    }
  }, []);

  // Calculate slippage for a given trade (client-side preview)
  const calculateSlippage = useCallback((amountIn, isBuying) => {
    if (!poolBC || !poolBLOB) return null;

    const k = poolBC * poolBLOB;
    let amountOut, newPrice, slippage;

    if (isBuying) {
      // Buying $BLOB with BC
      const amountInAfterFee = amountIn * (1 - TRADING_FEE);
      const newPoolBC = poolBC + amountInAfterFee;
      const newPoolBLOB = k / newPoolBC;
      amountOut = poolBLOB - newPoolBLOB;
      newPrice = newPoolBC / newPoolBLOB;
      slippage = ((newPrice - currentPrice) / currentPrice) * 100;
    } else {
      // Selling $BLOB for BC
      const amountInAfterFee = amountIn * (1 - TRADING_FEE);
      const newPoolBLOB = poolBLOB + amountInAfterFee;
      const newPoolBC = k / newPoolBLOB;
      amountOut = poolBC - newPoolBC;
      newPrice = newPoolBC / newPoolBLOB;
      slippage = ((currentPrice - newPrice) / currentPrice) * 100;
    }

    return {
      amountOut,
      newPrice,
      slippage,
      priceImpact: slippage,
      effectivePrice: isBuying ? amountIn / amountOut : amountOut / amountIn,
      fee: amountIn * TRADING_FEE
    };
  }, [poolBC, poolBLOB, currentPrice]);

  // Execute market order through backend API
  const executeMarketOrder = useCallback(async (amountIn, isBuying, maxSlippage = 5.0) => {
    if (!userId) {
      throw new Error('User ID required for trading');
    }

    try {
      const response = await fetch(`${API_BASE}/api/market/trade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          trade_type: isBuying ? 'BUY' : 'SELL',
          amount: amountIn,
          max_slippage: maxSlippage
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Trade failed');
      }

      const result = await response.json();

      // Refresh pool state after trade
      await fetchPool();
      await fetchStats();

      return result;
    } catch (err) {
      console.error('Error executing trade:', err);
      throw err;
    }
  }, [userId, fetchPool, fetchStats]);

  // Subscribe to real-time pool updates from Firebase
  useEffect(() => {
    if (!db) return;

    const poolRef = collection(db, 'market');
    const unsubscribe = onSnapshot(poolRef, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.doc.id === 'globalPool') {
          const data = change.doc.data();
          setPoolBC(data.poolBC || 0);
          setPoolBLOB(data.poolBLOB || 0);
          setCurrentPrice(data.poolBC / data.poolBLOB);
        }
      });
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to real-time trades from Firebase
  useEffect(() => {
    if (!db) return;

    const tradesRef = collection(db, 'market', 'trades', 'recent');
    const q = query(tradesRef, orderBy('timestamp', 'desc'), limit(100));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newTrades = [];
      snapshot.forEach((doc) => {
        newTrades.push({ id: doc.id, ...doc.data() });
      });
      setTrades(newTrades);
    });

    return () => unsubscribe();
  }, []);

  // Initial data fetch
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchPool(),
          fetchStats(),
          fetchCandles('1m', 100)
        ]);
      } catch (err) {
        console.error('Error loading initial data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [fetchPool, fetchStats, fetchCandles]);

  // Refresh pool and stats periodically
  useEffect(() => {
    const interval = setInterval(() => {
      fetchPool();
      fetchStats();
    }, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, [fetchPool, fetchStats]);

  return {
    // State
    poolBC,
    poolBLOB,
    currentPrice,
    candles,
    trades,
    stats24h,
    loading,
    error,

    // Actions
    executeMarketOrder,
    calculateSlippage,
    fetchCandles,
    refreshPool: fetchPool,
    refreshStats: fetchStats,

    // Constants
    tradingFee: TRADING_FEE,
    k: poolBC * poolBLOB
  };
};
