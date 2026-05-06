import React, { useState, useRef, useEffect } from 'react';

// Конфигурация для разных типов рыб
const FISH_CONFIGS = {
  common: {
    resistance: 0.15,        // Сопротивление рыбы (снижение натяжения в секунду)
    jerkInterval: 2000,      // Интервал между рывками (мс)
    jerkStrength: 15,        // Сила рывка
    tensionIncreaseRate: 25, // Скорость роста натяжения при удержании
    tensionDecreaseRate: 20, // Скорость падения натяжения при отпускании
    catchProgressRate: 15,   // Скорость заполнения прогресса в зеленой зоне
  },
  rare: {
    resistance: 0.25,
    jerkInterval: 1500,
    jerkStrength: 20,
    tensionIncreaseRate: 22,
    tensionDecreaseRate: 25,
    catchProgressRate: 12,
  },
  epic: {
    resistance: 0.35,
    jerkInterval: 1200,
    jerkStrength: 25,
    tensionIncreaseRate: 20,
    tensionDecreaseRate: 30,
    catchProgressRate: 10,
  },
  legendary: {
    resistance: 0.45,
    jerkInterval: 1000,
    jerkStrength: 30,
    tensionIncreaseRate: 18,
    tensionDecreaseRate: 35,
    catchProgressRate: 8,
  },
};

const FishingGame = ({
  fishType = 'common',
  onCatchSuccess,
  onCatchFail,
  fishName = 'Рыба'
}) => {
  const [tension, setTension] = useState(0);
  const [catchProgress, setCatchProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [shake, setShake] = useState(false);
  const [lastJerkTime, setLastJerkTime] = useState(0);

  const animationFrameRef = useRef(null);
  const lastUpdateTimeRef = useRef(Date.now());
  const tensionRef = useRef(0);
  const catchProgressRef = useRef(0);
  const isHoldingRef = useRef(false);
  const lastHapticRef = useRef(0);

  const config = FISH_CONFIGS[fishType] || FISH_CONFIGS.common;

  // Telegram WebApp Haptic Feedback
  const triggerHaptic = (type = 'light') => {
    const now = Date.now();
    if (now - lastHapticRef.current < 100) return; // Throttle
    lastHapticRef.current = now;

    if (window.Telegram?.WebApp?.HapticFeedback) {
      if (type === 'light') {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
      } else if (type === 'medium') {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
      } else if (type === 'heavy') {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('heavy');
      }
    }
  };

  // Получить цвет зоны натяжения
  const getTensionColor = (tensionValue) => {
    if (tensionValue >= 85) return 'bg-red-500';
    if (tensionValue >= 60) return 'bg-green-500';
    return 'bg-gray-400';
  };

  // Получить текст зоны
  const getTensionZoneText = (tensionValue) => {
    if (tensionValue >= 95) return 'ОБРЫВ!';
    if (tensionValue >= 85) return 'КРИТИЧНО!';
    if (tensionValue >= 60) return 'ОТЛИЧНО!';
    return 'СЛАБО';
  };

  // Применить рывок рыбы
  const applyJerk = () => {
    const jerkDirection = Math.random() > 0.5 ? 1 : -1;
    const jerkAmount = config.jerkStrength * jerkDirection * (0.7 + Math.random() * 0.6);

    tensionRef.current = Math.max(0, Math.min(100, tensionRef.current + jerkAmount));
    setTension(tensionRef.current);
    setLastJerkTime(Date.now());

    triggerHaptic('medium');
  };

  // Основной игровой цикл
  const gameLoop = () => {
    if (gameOver) return;

    const now = Date.now();
    const deltaTime = (now - lastUpdateTimeRef.current) / 1000; // в секундах
    lastUpdateTimeRef.current = now;

    let newTension = tensionRef.current;
    let newProgress = catchProgressRef.current;

    // Изменение натяжения в зависимости от удержания
    if (isHoldingRef.current) {
      newTension += config.tensionIncreaseRate * deltaTime;
    } else {
      newTension -= config.tensionDecreaseRate * deltaTime;
    }

    // Применяем сопротивление рыбы
    newTension -= config.resistance * deltaTime * 100;

    // Ограничиваем натяжение
    newTension = Math.max(0, Math.min(100, newTension));

    // Проверка на обрыв
    if (newTension >= 100) {
      setGameOver(true);
      triggerHaptic('heavy');
      if (onCatchFail) onCatchFail();
      return;
    }

    // Обновление прогресса вылова
    if (newTension >= 60 && newTension < 85) {
      // Зеленая зона - прогресс растет
      newProgress += config.catchProgressRate * deltaTime;
    } else if (newTension < 60) {
      // Белая зона - прогресс падает
      newProgress -= 5 * deltaTime;
    }

    newProgress = Math.max(0, Math.min(100, newProgress));

    // Проверка на успешный вылов
    if (newProgress >= 100) {
      setGameOver(true);
      triggerHaptic('heavy');
      if (onCatchSuccess) onCatchSuccess();
      return;
    }

    // Рывки рыбы
    if (now - lastJerkTime > config.jerkInterval) {
      applyJerk();
    }

    // Тряска в красной зоне
    if (newTension >= 85 && newTension < 95) {
      setShake(true);
      if (Math.random() > 0.7) triggerHaptic('light');
    } else {
      setShake(false);
    }

    // Обновляем состояние
    tensionRef.current = newTension;
    catchProgressRef.current = newProgress;
    setTension(newTension);
    setCatchProgress(newProgress);

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  };

  // Запуск игрового цикла
  useEffect(() => {
    lastUpdateTimeRef.current = Date.now();
    setLastJerkTime(Date.now());
    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameOver]);

  // Обработчики нажатия
  const handlePressStart = () => {
    if (gameOver) return;
    setIsHolding(true);
    isHoldingRef.current = true;
    triggerHaptic('light');
  };

  const handlePressEnd = () => {
    setIsHolding(false);
    isHoldingRef.current = false;
  };

  return (
    <div className="w-full h-screen bg-gradient-to-b from-blue-900 via-blue-700 to-blue-500 flex flex-col items-center justify-center p-4 select-none">
      {/* Контейнер с тряской */}
      <div className={`w-full max-w-md ${shake ? 'animate-shake' : ''}`}>
        {/* Название рыбы */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-white drop-shadow-lg">
            {fishName}
          </h2>
          <p className="text-white/80 text-sm mt-1">
            {gameOver ? (catchProgress >= 100 ? '🎉 Поймана!' : '💔 Леска порвалась') : 'Удерживай натяжение в зеленой зоне!'}
          </p>
        </div>

        {/* Прогресс вылова */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white font-semibold">Прогресс вылова</span>
            <span className="text-white font-bold">{Math.floor(catchProgress)}%</span>
          </div>
          <div className="w-full h-6 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm border-2 border-white/30">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all duration-200 ease-out"
              style={{ width: `${catchProgress}%` }}
            />
          </div>
        </div>

        {/* Шкала натяжения */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white font-semibold">Натяжение лески</span>
            <span className={`font-bold text-lg ${
              tension >= 85 ? 'text-red-300 animate-pulse' :
              tension >= 60 ? 'text-green-300' :
              'text-gray-300'
            }`}>
              {getTensionZoneText(tension)}
            </span>
          </div>
          <div className="w-full h-8 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm border-2 border-white/30 relative">
            {/* Зоны (визуальная подсказка) */}
            <div className="absolute inset-0 flex">
              <div className="w-[60%] bg-gray-500/20" />
              <div className="w-[25%] bg-green-500/20" />
              <div className="w-[15%] bg-red-500/20" />
            </div>

            {/* Текущее натяжение */}
            <div
              className={`h-full ${getTensionColor(tension)} transition-all duration-100 ease-out relative`}
              style={{ width: `${tension}%` }}
            >
              {tension >= 85 && (
                <div className="absolute inset-0 animate-pulse bg-white/30" />
              )}
            </div>
          </div>

          {/* Маркеры зон */}
          <div className="flex justify-between text-xs text-white/60 mt-1 px-1">
            <span>0</span>
            <span>60</span>
            <span>85</span>
            <span>100</span>
          </div>
        </div>

        {/* Кнопка управления */}
        <div className="flex justify-center">
          <button
            onMouseDown={handlePressStart}
            onMouseUp={handlePressEnd}
            onMouseLeave={handlePressEnd}
            onTouchStart={handlePressStart}
            onTouchEnd={handlePressEnd}
            disabled={gameOver}
            className={`
              w-48 h-48 rounded-full font-bold text-2xl
              transition-all duration-150 ease-out
              ${isHolding ? 'scale-95' : 'scale-100'}
              ${gameOver ? 'bg-gray-500 cursor-not-allowed' : 'bg-white hover:bg-gray-100 active:bg-gray-200'}
              shadow-2xl border-4 border-white/50
              ${!gameOver && 'active:shadow-xl'}
            `}
          >
            {gameOver ? (
              catchProgress >= 100 ? '✅' : '❌'
            ) : (
              <div className="flex flex-col items-center gap-2">
                <span className="text-4xl">🎣</span>
                <span className="text-sm">
                  {isHolding ? 'Тянем!' : 'Держи'}
                </span>
              </div>
            )}
          </button>
        </div>

        {/* Подсказка */}
        {!gameOver && (
          <div className="text-center mt-6 text-white/70 text-sm">
            Удерживай кнопку, чтобы тянуть леску
          </div>
        )}
      </div>

      {/* CSS для анимации тряски */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default FishingGame;