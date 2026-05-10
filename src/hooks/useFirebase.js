import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import firebaseConfig from '../firebase.config.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Get Telegram user data
const getTelegramUserData = () => {
  if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
    const user = window.Telegram.WebApp.initDataUnsafe.user;
    return {
      id: user.id.toString(),
      username: user.username || `user_${user.id}`,
      firstName: user.first_name || '',
      lastName: user.last_name || '',
      languageCode: user.language_code || 'en'
    };
  }
  // Fallback for development
  const devId = localStorage.getItem('dev_user_id') || 'dev_user_' + Math.random().toString(36).substr(2, 9);
  localStorage.setItem('dev_user_id', devId);
  return {
    id: devId,
    username: `dev_${devId}`,
    firstName: 'Dev',
    lastName: 'User',
    languageCode: 'en'
  };
};

export const useFirebase = () => {
  const userData = getTelegramUserData();
  const userId = userData.id;

  // Save user data to Firestore
  const saveUserData = async (data) => {
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        ...data,
        // Telegram user info
        telegramId: userData.id,
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        languageCode: userData.languageCode,
        lastUpdated: serverTimestamp()
      }, { merge: true });
      return true;
    } catch (error) {
      console.error('Error saving user data:', error);
      return false;
    }
  };

  // Load user data from Firestore
  const loadUserData = async () => {
    try {
      const userRef = doc(db, 'users', userId);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        return docSnap.data();
      }
      return null;
    } catch (error) {
      console.error('Error loading user data:', error);
      return null;
    }
  };

  // Save balance
  const saveBalance = async (balanceBC, balanceBLOB) => {
    return saveUserData({
      balanceBC,
      balanceBLOB
    });
  };

  // Save mining state
  const saveMiningState = async (totalMined, upgrades) => {
    return saveUserData({
      totalMined,
      upgrades,
      lastSave: Date.now()
    });
  };

  // Save market state
  const saveMarketState = async (poolBC, poolBLOB, candles, trades) => {
    return saveUserData({
      poolBC,
      poolBLOB,
      candles: candles.slice(-100), // Keep last 100 candles
      trades: trades.slice(0, 50)   // Keep last 50 trades
    });
  };

  // Increment total mined (atomic operation)
  const incrementTotalMined = async (amount) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        totalMined: increment(amount),
        lastUpdated: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error incrementing total mined:', error);
      return false;
    }
  };

  // Get leaderboard
  const getLeaderboard = async () => {
    try {
      // This would require a Cloud Function or backend endpoint
      // For now, return empty array
      return [];
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return [];
    }
  };

  return {
    userId,
    userData,
    saveUserData,
    loadUserData,
    saveBalance,
    saveMiningState,
    saveMarketState,
    incrementTotalMined,
    getLeaderboard
  };
};
