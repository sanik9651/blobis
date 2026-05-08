import { useState, useEffect, useRef, useCallback } from 'react';

const INITIAL_POOL_BC = 1000000; // 1M Blobis Coins
const INITIAL_POOL_BLOB = 10000; // 10K $BLOB tokens
const TRADING_FEE = 0.003; // 0.3% fee
const CANDLE_INTERVAL = 60000; // 1 minute candles

export const useMarket = () => {
  const [poolBC, setPoolBC] = useState(INITIAL_POOL_BC);
  const [poolBLOB, setPoolBLOB] = useState(INITIAL_POOL_BLOB);
  const [candles, setCandles] = useState([]);
  const [currentCandle, setCurrentCandle] = useState(null);
  const [trades, setTrades] = useState([]);
  const [orderBook, setOrderBook] = useState({ bids: [], asks: [] });

  const lastCandleTime = useRef(Date.now());
  const k = useRef(INITIAL_POOL_BC * INITIAL_POOL_BLOB);

  // Calculate current price using AMM formula
  const getCurrentPrice = useCallback(() => {
    return poolBC / poolBLOB;
  }, [poolBC, poolBLOB]);

  // Calculate slippage for a given trade
  const calculateSlippage = useCallback((amountIn, isBuying) => {
    const currentPrice = getCurrentPrice();
    let amountOut, newPrice, slippage;

    if (isBuying) {
      // Buying $BLOB with BC
      const amountInAfterFee = amountIn * (1 - TRADING_FEE);
      const newPoolBC = poolBC + amountInAfterFee;
      const newPoolBLOB = k.current / newPoolBC;
      amountOut = poolBLOB - newPoolBLOB;
      newPrice = newPoolBC / newPoolBLOB;
      slippage = ((newPrice - currentPrice) / currentPrice) * 100;
    } else {
      // Selling $BLOB for BC
      const amountInAfterFee = amountIn * (1 - TRADING_FEE);
      const newPoolBLOB = poolBLOB + amountInAfterFee;
      const newPoolBC = k.current / newPoolBLOB;
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
  }, [poolBC, poolBLOB, getCurrentPrice]);

  // Execute market order
  const executeMarketOrder = useCallback((amountIn, isBuying) => {
    const result = calculateSlippage(amountIn, isBuying);

    if (isBuying) {
      const amountInAfterFee = amountIn * (1 - TRADING_FEE);
      const newPoolBC = poolBC + amountInAfterFee;
      const newPoolBLOB = k.current / newPoolBC;

      setPoolBC(newPoolBC);
      setPoolBLOB(newPoolBLOB);
    } else {
      const amountInAfterFee = amountIn * (1 - TRADING_FEE);
      const newPoolBLOB = poolBLOB + amountInAfterFee;
      const newPoolBC = k.current / newPoolBLOB;

      setPoolBC(newPoolBC);
      setPoolBLOB(newPoolBLOB);
    }

    const trade = {
      timestamp: Date.now(),
      type: isBuying ? 'BUY' : 'SELL',
      price: result.effectivePrice,
      amount: result.amountOut,
      amountIn,
      fee: result.fee,
      slippage: result.slippage
    };

    setTrades(prev => [trade, ...prev].slice(0, 100));
    updateCandle(result.effectivePrice, result.amountOut);

    return { ...result, trade };
  }, [poolBC, poolBLOB, calculateSlippage]);

  // Update current candle with new trade
  const updateCandle = useCallback((price, volume) => {
    const now = Date.now();

    setCurrentCandle(prev => {
      if (!prev) {
        return {
          timestamp: now,
          open: price,
          high: price,
          low: price,
          close: price,
          volume: volume
        };
      }

      return {
        ...prev,
        high: Math.max(prev.high, price),
        low: Math.min(prev.low, price),
        close: price,
        volume: prev.volume + volume
      };
    });
  }, []);

  // Finalize candle and start new one
  const finalizeCandle = useCallback(() => {
    if (currentCandle) {
      setCandles(prev => [...prev, currentCandle].slice(-500)); // Keep last 500 candles
      setCurrentCandle(null);
    }
    lastCandleTime.current = Date.now();
  }, [currentCandle]);

  // Place limit order
  const placeLimitOrder = useCallback((price, amount, isBuy) => {
    const order = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      price,
      amount,
      type: isBuy ? 'BID' : 'ASK',
      timestamp: Date.now(),
      filled: 0
    };

    setOrderBook(prev => {
      const newBook = { ...prev };
      if (isBuy) {
        newBook.bids = [...prev.bids, order].sort((a, b) => b.price - a.price);
      } else {
        newBook.asks = [...prev.asks, order].sort((a, b) => a.price - b.price);
      }
      return newBook;
    });

    return order;
  }, []);

  // Cancel limit order
  const cancelLimitOrder = useCallback((orderId) => {
    setOrderBook(prev => ({
      bids: prev.bids.filter(o => o.id !== orderId),
      asks: prev.asks.filter(o => o.id !== orderId)
    }));
  }, []);

  // Check and execute limit orders
  const checkLimitOrders = useCallback(() => {
    const currentPrice = getCurrentPrice();

    setOrderBook(prev => {
      const newBook = { bids: [...prev.bids], asks: [...prev.asks] };
      let ordersExecuted = false;

      // Check bid orders (buy orders)
      newBook.bids = newBook.bids.filter(order => {
        if (currentPrice <= order.price) {
          const remaining = order.amount - order.filled;
          executeMarketOrder(remaining * order.price, true);
          ordersExecuted = true;
          return false;
        }
        return true;
      });

      // Check ask orders (sell orders)
      newBook.asks = newBook.asks.filter(order => {
        if (currentPrice >= order.price) {
          const remaining = order.amount - order.filled;
          executeMarketOrder(remaining, false);
          ordersExecuted = true;
          return false;
        }
        return true;
      });

      return ordersExecuted ? newBook : prev;
    });
  }, [getCurrentPrice, executeMarketOrder]);

  // Candle management interval
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastCandleTime.current >= CANDLE_INTERVAL) {
        finalizeCandle();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [finalizeCandle]);

  // Check limit orders periodically
  useEffect(() => {
    const interval = setInterval(checkLimitOrders, 500);
    return () => clearInterval(interval);
  }, [checkLimitOrders]);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('market_state');
    if (saved) {
      try {
        const state = JSON.parse(saved);
        setPoolBC(state.poolBC || INITIAL_POOL_BC);
        setPoolBLOB(state.poolBLOB || INITIAL_POOL_BLOB);
        setCandles(state.candles || []);
        setTrades(state.trades || []);
        setOrderBook(state.orderBook || { bids: [], asks: [] });
        k.current = state.poolBC * state.poolBLOB;
      } catch (e) {
        console.error('Failed to load market state:', e);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    const state = {
      poolBC,
      poolBLOB,
      candles,
      trades: trades.slice(0, 100),
      orderBook
    };
    localStorage.setItem('market_state', JSON.stringify(state));
  }, [poolBC, poolBLOB, candles, trades, orderBook]);

  return {
    // State
    poolBC,
    poolBLOB,
    currentPrice: getCurrentPrice(),
    candles,
    currentCandle,
    trades,
    orderBook,

    // Actions
    executeMarketOrder,
    calculateSlippage,
    placeLimitOrder,
    cancelLimitOrder,

    // Constants
    tradingFee: TRADING_FEE,
    k: k.current
  };
};
