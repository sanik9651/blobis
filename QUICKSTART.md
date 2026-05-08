# 🎯 Quick Start Guide

## Что было сделано

✅ **Полная переработка проекта:**
- Рыбалка → DeFi Trading Simulator
- AMM движок с формулой x*y=k
- Mining система с апгрейдами
- UI в стиле NotCoin (минималистичный)
- Firebase интеграция для хранения данных
- Готов к деплою на Render.com

## Локальная разработка

```bash
# 1. Установить зависимости
npm install

# 2. Настроить Firebase (см. FIREBASE_SETUP.md)
cp .env.example .env
# Заполните .env вашими Firebase credentials

# 3. Запустить dev-сервер
npm run dev

# Откройте http://localhost:3000
```

## Деплой на Render.com

```bash
# 1. Закоммитить изменения
git add .
git commit -m "Add DeFi simulator with Firebase"
git push origin main

# 2. Render автоматически задеплоит
# 3. Настроить переменные окружения (см. DEPLOYMENT.md)
# 4. Настроить Telegram Bot (см. DEPLOYMENT.md)
```

## Структура проекта

```
src/
├── hooks/
│   ├── useMarket.js      # AMM движок (x*y=k)
│   ├── useMining.js      # Система майнинга
│   ├── useBalance.js     # Управление балансами
│   └── useFirebase.js    # Firebase интеграция
├── components/
│   ├── TradingTerminal.jsx    # Главный компонент
│   └── MiningInterface.jsx    # NotCoin-style UI
├── firebase.config.js    # Firebase конфигурация
└── main.jsx             # Entry point
```

## Документация

- 📖 [README.md](README.md) — Полное описание проекта
- 🔥 [FIREBASE_SETUP.md](FIREBASE_SETUP.md) — Настройка Firebase
- 🚀 [DEPLOYMENT.md](DEPLOYMENT.md) — Деплой на Render.com
- 🏗️ [ARCHITECTURE.md](ARCHITECTURE.md) — Техническая архитектура

## Основные фичи

### Mining (NotCoin Style)
- Большая круглая кнопка для тапов
- 6 типов апгрейдов (CPU → Quantum Miner)
- Пассивный доход
- Офлайн-заработок до 4 часов

### Trading (Упрощенный)
- Покупка/продажа $BLOB за BC
- Расчет slippage в реальном времени
- История сделок
- Минималистичный UI

### Firebase
- Автоматическое сохранение прогресса
- Синхронизация между устройствами
- Готовность к мультиплееру

## Технологии

- React 18 + Vite
- Tailwind CSS
- Firebase Firestore
- Telegram WebApp API
- Python FastAPI (backend)

## Следующие шаги

1. **Настроить Firebase** — создать проект и получить credentials
2. **Задеплоить на Render** — push в GitHub
3. **Настроить Telegram Bot** — установить Web App кнопку
4. **Тестировать** — открыть бота и проверить функционал

## Поддержка

- GitHub: https://github.com/sanik9651/blobis
- Issues: https://github.com/sanik9651/blobis/issues

---

**Powered by AMM • x*y=k Protocol • NotCoin UI Style**
