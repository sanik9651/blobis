import React, { useState, useRef } from 'react';

const MiningInterface = ({
  balance,
  clickPower,
  passiveIncome,
  onMine,
  upgrades,
  onPurchaseUpgrade,
  getUpgradeCost,
  UPGRADES
}) => {
  const [particles, setParticles] = useState([]);
  const [isPressed, setIsPressed] = useState(false);
  const [showUpgrades, setShowUpgrades] = useState(false);
  const particleIdRef = useRef(0);

  const handleMine = (e) => {
    const earned = onMine();

    // Create particle effect
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.width / 2;
    const y = rect.height / 2;

    const newParticle = {
      id: particleIdRef.current++,
      x: x + (Math.random() - 0.5) * 100,
      y: y + (Math.random() - 0.5) * 100,
      value: earned
    };

    setParticles(prev => [...prev, newParticle]);

    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== newParticle.id));
    }, 1000);

    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return Math.floor(num).toString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 to-blue-800 text-white flex flex-col">
      {/* Header */}
      <div className="p-4 text-center">
        <div className="text-6xl font-bold mb-2">{formatNumber(balance)}</div>
        <div className="text-xl opacity-80">BC</div>
      </div>

      {/* Main Mining Button */}
      <div className="flex-1 flex items-center justify-center relative px-4">
        <div className="relative">
          <button
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            onMouseLeave={() => setIsPressed(false)}
            onTouchStart={() => setIsPressed(true)}
            onTouchEnd={() => setIsPressed(false)}
            onClick={handleMine}
            className={`
              relative w-72 h-72 rounded-full bg-white
              shadow-2xl transition-all duration-100
              ${isPressed ? 'scale-95' : 'scale-100'}
              flex items-center justify-center
              cursor-pointer select-none
            `}
          >
            <div className="text-9xl">⛏️</div>

            {/* Glow effect */}
            <div className="absolute inset-0 rounded-full bg-blue-400/30 animate-pulse" />
          </button>

          {/* Particles */}
          {particles.map(particle => (
            <div
              key={particle.id}
              className="absolute pointer-events-none text-yellow-300 font-bold text-2xl"
              style={{
                left: particle.x,
                top: particle.y,
                animation: 'floatUp 1s ease-out forwards'
              }}
            >
              +{particle.value.toFixed(0)}
            </div>
          ))}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-black/20 backdrop-blur-sm p-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-sm opacity-70">Per Tap</div>
            <div className="text-xl font-bold">+{formatNumber(clickPower)}</div>
          </div>
          <div className="text-center">
            <div className="text-sm opacity-70">Per Second</div>
            <div className="text-xl font-bold">+{formatNumber(passiveIncome)}</div>
          </div>
        </div>

        {/* Upgrades Button */}
        <button
          onClick={() => setShowUpgrades(!showUpgrades)}
          className="w-full bg-white text-blue-600 py-4 rounded-2xl font-bold text-lg shadow-lg"
        >
          {showUpgrades ? '✕ Close' : '⚡ Upgrades'}
        </button>
      </div>

      {/* Upgrades Modal */}
      {showUpgrades && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto">
          <div className="min-h-screen p-4 pb-20">
            <div className="max-w-md mx-auto">
              <div className="flex justify-between items-center mb-6 mt-4">
                <h2 className="text-2xl font-bold">Upgrades</h2>
                <button
                  onClick={() => setShowUpgrades(false)}
                  className="text-3xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                {Object.keys(UPGRADES).map(key => {
                  const upgrade = UPGRADES[key];
                  const level = upgrades[key];
                  const cost = getUpgradeCost(key);
                  const canAfford = balance >= cost;

                  return (
                    <button
                      key={key}
                      onClick={() => canAfford && onPurchaseUpgrade(key)}
                      disabled={!canAfford}
                      className={`
                        w-full bg-white/10 backdrop-blur-sm rounded-2xl p-4
                        transition-all
                        ${canAfford ? 'opacity-100' : 'opacity-50'}
                      `}
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-5xl">{upgrade.icon}</div>
                        <div className="flex-1 text-left">
                          <div className="font-bold text-lg">{upgrade.name}</div>
                          <div className="text-sm opacity-70">Level {level}</div>
                          <div className="text-sm text-yellow-300">
                            +{(upgrade.effect * level).toFixed(1)} {key === 'clickPower' ? 'per tap' : 'BC/s'}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">{formatNumber(cost)}</div>
                          <div className="text-xs opacity-70">BC</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes floatUp {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-150px) scale(1.5);
          }
        }
      `}</style>
    </div>
  );
};

export default MiningInterface;
