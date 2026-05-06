# 🎣 Fishing Game Component

Мини-игра "Вытягивание рыбы" для Telegram Web App с плавной механикой и тактильной обратной связью.

## 🎮 Особенности

- ✅ Плавный геймплей на 60 FPS (requestAnimationFrame)
- ✅ Тактильная вибрация через Telegram WebApp API
- ✅ Динамическая система зон натяжения
- ✅ Визуальные эффекты (тряска, пульсация)
- ✅ Настраиваемая сложность для разных типов рыб
- ✅ Адаптивный дизайн с Tailwind CSS
- ✅ Поддержка touch и mouse событий

## 📦 Установка

```bash
npm install react lucide-react
# или
yarn add react lucide-react
```

Убедитесь, что у вас настроен Tailwind CSS в проекте.

## 🚀 Использование

### Базовый пример

```jsx
import FishingGame from './FishingGame';

function App() {
  const handleSuccess = () => {
    console.log('Рыба поймана!');
    // Ваша логика (добавить рыбу в инвентарь, начислить монеты и т.д.)
  };

  const handleFail = () => {
    console.log('Леска порвалась!');
    // Ваша логика (показать сообщение, отнять энергию и т.д.)
  };

  return (
    <FishingGame
      fishType="common"
      fishName="Карась"
      onCatchSuccess={handleSuccess}
      onCatchFail={handleFail}
    />
  );
}
```

### Продвинутый пример с выбором рыбы

См. файл `FishingGameExample.jsx` для полного примера с меню выбора рыбы.

## 🎛️ Props

| Prop | Тип | По умолчанию | Описание |
|------|-----|--------------|----------|
| `fishType` | `'common' \| 'rare' \| 'epic' \| 'legendary'` | `'common'` | Тип рыбы (определяет сложность) |
| `fishName` | `string` | `'Рыба'` | Название рыбы для отображения |
| `onCatchSuccess` | `() => void` | - | Callback при успешном вылове |
| `onCatchFail` | `() => void` | - | Callback при обрыве лески |

## ⚙️ Конфигурация сложности

Каждый тип рыбы имеет свои параметры:

```javascript
const FISH_CONFIGS = {
  common: {
    resistance: 0.15,        // Сопротивление рыбы
    jerkInterval: 2000,      // Интервал между рывками (мс)
    jerkStrength: 15,        // Сила рывка
    tensionIncreaseRate: 25, // Скорость роста натяжения
    tensionDecreaseRate: 20, // Скорость падения натяжения
    catchProgressRate: 15,   // Скорость заполнения прогресса
  },
  // ... другие типы
};
```

### Настройка под свою игру

Вы можете легко добавить новые типы рыб или изменить существующие параметры в объекте `FISH_CONFIGS` внутри компонента `FishingGame.jsx`.

## 🎨 Механика игры

### Зоны натяжения

| Зона | Диапазон | Цвет | Эффект |
|------|----------|------|--------|
| Слабо | 0-60 | Серый | Прогресс падает |
| Оптимально | 60-85 | Зеленый | Прогресс растет |
| Критично | 85-95 | Красный | Тряска экрана |
| Обрыв | 95-100 | - | Игра окончена |

### Управление

- **Удержание кнопки**: Натяжение растет
- **Отпускание кнопки**: Натяжение падает
- **Рывки рыбы**: Случайные скачки натяжения
- **Сопротивление**: Постоянное снижение натяжения

### Цель

Заполнить шкалу "Прогресс вылова" до 100%, удерживая натяжение в зеленой зоне (60-85).

## 📱 Интеграция с Telegram

Компонент автоматически использует Telegram WebApp API для:

- Тактильной вибрации (`HapticFeedback`)
- Адаптации под тему Telegram
- Полноэкранного режима

```javascript
// Вибрация происходит автоматически при:
// - Нажатии кнопки (light)
// - Рывках рыбы (medium)
// - Критической зоне (light, периодически)
// - Завершении игры (heavy)
```

## 🎯 Интеграция в существующий проект

### Вариант 1: Модальное окно

```jsx
const [showFishing, setShowFishing] = useState(false);

return (
  <>
    <button onClick={() => setShowFishing(true)}>
      Начать рыбалку
    </button>

    {showFishing && (
      <div className="fixed inset-0 z-50">
        <FishingGame
          fishType="rare"
          fishName="Золотая рыбка"
          onCatchSuccess={() => {
            // Добавить рыбу
            setShowFishing(false);
          }}
          onCatchFail={() => {
            setShowFishing(false);
          }}
        />
      </div>
    )}
  </>
);
```

### Вариант 2: Отдельная страница/роут

```jsx
// В вашем роутере
<Route path="/fishing" element={
  <FishingGame
    fishType={selectedFishType}
    fishName={selectedFishName}
    onCatchSuccess={handleSuccess}
    onCatchFail={handleFail}
  />
} />
```

## 🔧 Кастомизация

### Изменение цветов

Измените классы Tailwind в компоненте:

```jsx
// Фон игры
className="bg-gradient-to-b from-blue-900 via-blue-700 to-blue-500"

// Цвета зон натяжения
const getTensionColor = (tensionValue) => {
  if (tensionValue >= 85) return 'bg-red-500';    // Красная зона
  if (tensionValue >= 60) return 'bg-green-500';  // Зеленая зона
  return 'bg-gray-400';                           // Белая зона
};
```

### Добавление звуков

```jsx
const playSound = (soundName) => {
  const audio = new Audio(`/sounds/${soundName}.mp3`);
  audio.play();
};

// В функции applyJerk
applyJerk = () => {
  // ... существующий код
  playSound('jerk');
};
```

## 🐛 Troubleshooting

### Игра лагает

- Убедитесь, что используется `requestAnimationFrame`
- Проверьте, что нет тяжелых вычислений в игровом цикле
- Используйте `useRef` для значений, которые обновляются каждый кадр

### Вибрация не работает

- Проверьте, что приложение запущено в Telegram WebApp
- Убедитесь, что `window.Telegram.WebApp` доступен
- Некоторые устройства могут не поддерживать вибрацию

### Кнопка не реагирует на touch

- Убедитесь, что обработчики `onTouchStart` и `onTouchEnd` установлены
- Проверьте, что нет конфликтов с другими обработчиками событий
- Добавьте `touch-action: none` если нужно

## 📄 Лицензия

MIT

## 🤝 Вклад

Не стесняйтесь создавать issues и pull requests для улучшения компонента!

---

Создано для Telegram игры Blobis 🎣