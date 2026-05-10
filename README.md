# 🎮 Blobis Exchange - DeFi Trading Simulator

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Platform](https://img.shields.io/badge/platform-Telegram%20Mini%20App-blue)

**Blobis Exchange** - это DeFi симулятор с майнингом и торговлей криптовалютой, созданный как Telegram Mini App в стиле NotCoin.

## ✨ Особенности

### 🎨 Дизайн
- **NotCoin-стиль интерфейс** - черно-белый дизайн с золотыми акцентами
- **Нижняя навигация** - удобное переключение между вкладками
- **Минималистичный UI** - фокус на главном
- **Адаптивный дизайн** - идеально работает на мобильных

### ⛏️ Майнинг
- **Tap-to-earn** механика - кликай и зарабатывай BC
- **Пассивный доход** - автоматический майнинг в фоне
- **Система апгрейдов** - улучшай мощность майнинга
- **Визуальные эффекты** - анимации и частицы

### 📈 Трейдинг
- **AMM (Automated Market Maker)** - реалистичная математика DeFi
- **Slippage расчет** - как в настоящих DEX
- **Комиссия 0.3%** - стандарт индустрии
- **История сделок** - отслеживай свои трейды

### 🔥 Firebase интеграция
- **Облачное хранилище** - данные сохраняются в Firestore
- **Привязка к Telegram** - username и user_id
- **Синхронизация** - играй с любого устройства
- **Лидерборд** - соревнуйся с другими игроками

## 🚀 Быстрый старт

### Локальная разработка

```bash
# Клонируйте репозиторий
git clone https://github.com/sanik9651/blobis.git
cd blobis

# Установите зависимости
npm install

# Создайте .env файл
cp .env.example .env
# Заполните Firebase конфигурацию

# Запустите dev-сервер
npm run dev

# Откройте http://localhost:5173
```

### Деплой на Render.com

Следуйте инструкциям в [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md)

## 📁 Структура проекта

```
blobis/
├── src/
│   ├── components/
│   │   ├── TradingTerminal.jsx  # Главный компонент
│   │   ├── MiningInterface.jsx  # Интерфейс майнинга
│   │   └── ...
│   ├── hooks/
│   │   ├── useFirebase.js       # Firebase интеграция
│   │   ├── useBalance.js        # Управление балансом
│   │   ├── useMarket.js         # AMM логика
│   │   └── useMining.js         # Майнинг логика
│   ├── firebase.config.js       # Firebase конфигурация
│   ├── main.jsx                 # Точка входа
│   └── index.css                # Стили
├── backend.py                   # FastAPI backend
├── telegram_bot.py              # Telegram bot
├── firestore.rules              # Firebase правила
├── DEPLOY_GUIDE.md              # Гайд по деплою
├── TOKENOMICS.md                # Документация по токенам
└── package.json
```

## 🎮 Как играть

### 1. Майнинг (⛏️)
- Кликай на золотую монету для майнинга BC
- Покупай апгрейды для увеличения дохода
- Получай пассивный доход каждую секунду

### 2. Трейдинг (📈)
- Покупай $BLOB токены за BC
- Продавай $BLOB обратно за BC
- Следи за ценой и slippage
- Зарабатывай на волатильности

### 3. Профиль (👤)
- Смотри свою статистику
- Отслеживай общий баланс
- Проверяй майнинг показатели

## 🔧 Технологии

### Frontend
- **React 18** - UI библиотека
- **Vite** - сборщик
- **Tailwind CSS** - стили
- **Firebase SDK** - облачное хранилище

### Backend
- **FastAPI** - Python веб-фреймворк
- **SQLite** - локальная БД
- **python-telegram-bot** - Telegram интеграция

### Инфраструктура
- **Render.com** - хостинг
- **Firebase Firestore** - облачная БД
- **Telegram Mini Apps** - платформа

## 📊 Токеномика

Подробная информация в [TOKENOMICS.md](./TOKENOMICS.md)

### Текущая реализация
- **BC (Blobis Coin)** - игровая валюта (симулятор)
- **$BLOB** - торговый токен (симулятор)
- **AMM** - Constant Product формула (x * y = k)

### Будущее
- Интеграция с TON Blockchain
- Реальный токен $BLOB
- Bridge система BC → $BLOB
- Листинг на DEX

## 🔐 Безопасность

### Текущие меры
- ✅ Firebase Firestore для хранения данных
- ✅ Привязка к Telegram user_id
- ✅ Валидация на клиенте

### Для продакшена
- ⚠️ Добавить валидацию Telegram initData на backend
- ⚠️ Настроить строгие Firestore Rules
- ⚠️ Добавить rate limiting
- ⚠️ Включить HTTPS only

## 📈 Roadmap

### v2.0 (Текущая версия) ✅
- [x] NotCoin-стиль UI
- [x] Firebase интеграция
- [x] Telegram username привязка
- [x] Черно-белый дизайн с золотом

### v2.1 (Планируется)
- [ ] Лидерборд
- [ ] Реферальная система
- [ ] Ежедневные награды
- [ ] Достижения

### v3.0 (Будущее)
- [ ] TON Blockchain интеграция
- [ ] Реальный токен $BLOB
- [ ] NFT система
- [ ] Мультиплеер режим

## 🤝 Вклад

Приветствуются pull requests! Для больших изменений сначала откройте issue.

## 📝 Лицензия

MIT License - см. [LICENSE](./LICENSE)

## 👨‍💻 Автор

**sanik9651**
- GitHub: [@sanik9651](https://github.com/sanik9651)
- Telegram: [@sanik9651](https://t.me/sanik9651)

## 🙏 Благодарности

- **NotCoin** - за вдохновение дизайна
- **Uniswap** - за AMM формулу
- **Telegram** - за Mini Apps платформу
- **Firebase** - за облачную инфраструктуру

## 📞 Поддержка

Если у вас есть вопросы или проблемы:
1. Откройте [Issue](https://github.com/sanik9651/blobis/issues)
2. Напишите в Telegram: [@sanik9651](https://t.me/sanik9651)
3. Проверьте [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md)

---

**Сделано с ❤️ для Telegram Mini Apps**
