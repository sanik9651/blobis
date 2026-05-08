import { useState, useEffect, useRef, useCallback } from 'react';

const INITIAL_HASHRATE = 1; // Base hashrate per click
const INITIAL_BALANCE = 1000; // Starting BC balance

const UPGRADES = {
  clickPower: {
    name: 'Click Power',
    description: 'Increase BC per click',
    baseCost: 50,
    costMultiplier: 1.5,
    effect: 1,
    icon: '👆'
  },
  cpuMiner: {
    name: 'CPU Miner',
    description: 'Passive BC generation',
    baseCost: 100,
    costMultiplier: 1.6,
    effect: 0.5,
    icon: '💻'
  },
  gpuRig: {
    name: 'GPU Rig',
    description: 'Better passive income',
    baseCost: 500,
    costMultiplier: 1.7,
    effect: 5,
    icon: '🎮'
  },
  asicMiner: {
    name: 'ASIC Miner',
    description: 'Professional mining',
    baseCost: 2000,
    costMultiplier: 1.8,
    effect: 25,
    icon: '⚡'
  },
  miningFarm: {
    name: 'Mining Farm',
    description: 'Industrial scale',
    baseCost: 10000,
    costMultiplier: 2.0,
    effect: 150,
    icon: '🏭'
  },
  quantumMiner: {
    name: 'Quantum Miner',
    description: 'Next-gen technology',
    baseCost: 50000,
    costMultiplier: 2.2,
    effect: 1000,
    icon: '🔮'
  }
};

export const useMining = (onEarnBC) => {
  const [totalMined, setTotalMined] = useState(0);
  const [upgrades, setUpgrades] = useState({
    clickPower: 0,
    cpuMiner: 0,
    gpuRig: 0,
    asicMiner: 0,
    miningFarm: 0,
    quantumMiner: 0
  });

  const lastUpdateRef = useRef(Date.now());
  const animationFrameRef = useRef(null);

  // Calculate current click power
  const getClickPower = useCallback(() => {
    return INITIAL_HASHRATE + (upgrades.clickPower * UPGRADES.clickPower.effect);
  }, [upgrades.clickPower]);

  // Calculate passive income per second
  const getPassiveIncome = useCallback(() => {
    let income = 0;
    income += upgrades.cpuMiner * UPGRADES.cpuMiner.effect;
    income += upgrades.gpuRig * UPGRADES.gpuRig.effect;
    income += upgrades.asicMiner * UPGRADES.asicMiner.effect;
    income += upgrades.miningFarm * UPGRADES.miningFarm.effect;
    income += upgrades.quantumMiner * UPGRADES.quantumMiner.effect;
    return income;
  }, [upgrades]);

  // Calculate upgrade cost
  const getUpgradeCost = useCallback((upgradeKey) => {
    const upgrade = UPGRADES[upgradeKey];
    const level = upgrades[upgradeKey];
    return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, level));
  }, [upgrades]);

  // Handle mining click
  const mine = useCallback(() => {
    const power = getClickPower();
    if (onEarnBC) onEarnBC(power);
    setTotalMined(prev => prev + power);
    return power;
  }, [getClickPower, onEarnBC]);

  // Purchase upgrade (now takes balance as parameter)
  const purchaseUpgrade = useCallback((upgradeKey, currentBalance, onDeductBC) => {
    const cost = getUpgradeCost(upgradeKey);
    if (currentBalance >= cost) {
      if (onDeductBC && onDeductBC(cost)) {
        setUpgrades(prev => ({
          ...prev,
          [upgradeKey]: prev[upgradeKey] + 1
        }));
        return true;
      }
    }
    return false;
  }, [getUpgradeCost]);

  // Passive income loop
  useEffect(() => {
    const loop = () => {
      const now = Date.now();
      const deltaTime = (now - lastUpdateRef.current) / 1000;
      lastUpdateRef.current = now;

      const passiveIncome = getPassiveIncome();
      if (passiveIncome > 0) {
        const earned = passiveIncome * deltaTime;
        if (onEarnBC) onEarnBC(earned);
        setTotalMined(prev => prev + earned);
      }

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    lastUpdateRef.current = Date.now();
    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [getPassiveIncome, onEarnBC]);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('mining_state');
    if (saved) {
      try {
        const state = JSON.parse(saved);
        setTotalMined(state.totalMined || 0);
        setUpgrades(state.upgrades || upgrades);

        // Calculate offline earnings
        if (state.lastSave && onEarnBC) {
          const offlineTime = (Date.now() - state.lastSave) / 1000;
          const maxOfflineTime = 3600 * 4; // 4 hours max
          const actualOfflineTime = Math.min(offlineTime, maxOfflineTime);

          const passiveIncome = Object.keys(state.upgrades || {}).reduce((total, key) => {
            return total + (state.upgrades[key] * UPGRADES[key].effect);
          }, 0);

          const offlineEarnings = passiveIncome * actualOfflineTime;
          if (offlineEarnings > 0) {
            onEarnBC(offlineEarnings);
            setTotalMined(prev => prev + offlineEarnings);
          }
        }
      } catch (e) {
        console.error('Failed to load mining state:', e);
      }
    }
  }, [onEarnBC]);

  // Save to localStorage
  useEffect(() => {
    const state = {
      totalMined,
      upgrades,
      lastSave: Date.now()
    };
    localStorage.setItem('mining_state', JSON.stringify(state));
  }, [totalMined, upgrades]);

  return {
    totalMined,
    upgrades,
    clickPower: getClickPower(),
    passiveIncome: getPassiveIncome(),
    mine,
    purchaseUpgrade,
    getUpgradeCost,
    UPGRADES
  };
};
