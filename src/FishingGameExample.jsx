import React, { useState } from 'react';
import FishingGame from './FishingGame';

/**
 * Пример использования компонента FishingGame
 */
const FishingGameExample = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedFish, setSelectedFish] = useState({
    type: 'common',
    name: 'Обычная рыба'
  });

  const fishTypes = [
    { type: 'common', name: 'Обычная рыба', emoji: '🐟' },
    { type: 'rare', name: 'Редкая рыба', emoji: '🐠' },
    { type: 'epic', name: 'Эпическая рыба', emoji: '🐡' },
    { type: 'legendary', name: 'Легендарная рыба', emoji: '🦈' },
  ];

  const handleCatchSuccess = () => {
    console.log('Рыба поймана!');
    setResult('success');
    setTimeout(() => {
      setIsPlaying(false);
      setResult(null);
    }, 2000);
  };

  const handleCatchFail = () => {
    console.log('Леска порвалась!');
    setResult('fail');
    setTimeout(() => {
      setIsPlaying(false);
      setResult(null);
    }, 2000);
  };

  const startGame = (fish) => {
    setSelectedFish(fish);
    setIsPlaying(true);
    setResult(null);
  };

  if (isPlaying) {
    return (
      <FishingGame
        fishType={selectedFish.type}
        fishName={selectedFish.name}
        onCatchSuccess={handleCatchSuccess}
        onCatchFail={handleCatchFail}
      />
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full">
        <h1 className="text-4xl font-bold text-white text-center mb-2">
          🎣 Рыбалка
        </h1>
        <p className="text-gray-400 text-center mb-8">
          Выбери рыбу для вылова
        </p>

        {result && (
          <div className={`mb-6 p-4 rounded-lg text-center font-bold ${
            result === 'success'
              ? 'bg-green-500/20 text-green-300 border-2 border-green-500'
              : 'bg-red-500/20 text-red-300 border-2 border-red-500'
          }`}>
            {result === 'success' ? '🎉 Рыба поймана!' : '💔 Леска порвалась!'}
          </div>
        )}

        <div className="space-y-3">
          {fishTypes.map((fish) => (
            <button
              key={fish.type}
              onClick={() => startGame(fish)}
              className="w-full bg-white/5 hover:bg-white/10 border-2 border-white/10 rounded-xl p-4 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{fish.emoji}</span>
                  <div className="text-left">
                    <div className="text-white font-semibold">{fish.name}</div>
                    <div className="text-gray-400 text-sm capitalize">{fish.type}</div>
                  </div>
                </div>
                <span className="text-white/50">→</span>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 p-4 bg-white/5 rounded-lg border border-white/10">
          <h3 className="text-white font-semibold mb-2">📖 Как играть:</h3>
          <ul className="text-gray-400 text-sm space-y-1">
            <li>• Удерживай кнопку, чтобы тянуть леску</li>
            <li>• Держи натяжение в зеленой зоне (60-85)</li>
            <li>• Заполни шкалу прогресса до 100%</li>
            <li>• Не дай натяжению достичь 100 - леска порвется!</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FishingGameExample;