import { useState, useEffect, useCallback } from 'react';
import { useFirebase } from './useFirebase';

const INITIAL_BC_BALANCE = 1000;
const INITIAL_BLOB_BALANCE = 0;

export const useBalance = () => {
  const [balanceBC, setBalanceBC] = useState(INITIAL_BC_BALANCE);
  const [balanceBLOB, setBalanceBLOB] = useState(INITIAL_BLOB_BALANCE);
  const [isLoaded, setIsLoaded] = useState(false);
  const firebase = useFirebase();

  // Add BC (from mining)
  const addBC = useCallback((amount) => {
    setBalanceBC(prev => {
      const newBalance = prev + amount;
      firebase.saveBalance(newBalance, balanceBLOB);
      return newBalance;
    });
  }, [balanceBLOB, firebase]);

  // Deduct BC (for trading)
  const deductBC = useCallback((amount) => {
    if (balanceBC >= amount) {
      setBalanceBC(prev => {
        const newBalance = prev - amount;
        firebase.saveBalance(newBalance, balanceBLOB);
        return newBalance;
      });
      return true;
    }
    return false;
  }, [balanceBC, balanceBLOB, firebase]);

  // Add $BLOB (from trading)
  const addBLOB = useCallback((amount) => {
    setBalanceBLOB(prev => {
      const newBalance = prev + amount;
      firebase.saveBalance(balanceBC, newBalance);
      return newBalance;
    });
  }, [balanceBC, firebase]);

  // Deduct $BLOB (for trading)
  const deductBLOB = useCallback((amount) => {
    if (balanceBLOB >= amount) {
      setBalanceBLOB(prev => {
        const newBalance = prev - amount;
        firebase.saveBalance(balanceBC, newBalance);
        return newBalance;
      });
      return true;
    }
    return false;
  }, [balanceBLOB, balanceBC, firebase]);

  // Load from Firebase on mount
  useEffect(() => {
    const loadData = async () => {
      const data = await firebase.loadUserData();
      if (data) {
        setBalanceBC(data.balanceBC || INITIAL_BC_BALANCE);
        setBalanceBLOB(data.balanceBLOB || INITIAL_BLOB_BALANCE);
      }
      setIsLoaded(true);
    };
    loadData();
  }, [firebase]);

  return {
    balanceBC,
    balanceBLOB,
    addBC,
    deductBC,
    addBLOB,
    deductBLOB,
    isLoaded
  };
};
