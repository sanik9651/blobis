# 🔥 Firebase Setup Guide

## Шаг 1: Создание проекта Firebase

1. Перейдите на [Firebase Console](https://console.firebase.google.com/)
2. Нажмите **Add project** (Добавить проект)
3. Введите название: `blobis-exchange`
4. Отключите Google Analytics (не обязательно для этого проекта)
5. Нажмите **Create project**

## Шаг 2: Настройка Firestore Database

1. В левом меню выберите **Build** → **Firestore Database**
2. Нажмите **Create database**
3. Выберите режим: **Start in production mode**
4. Выберите регион: `europe-west1` (или ближайший к вашим пользователям)
5. Нажмите **Enable**

## Шаг 3: Настройка правил безопасности

В разделе **Rules** замените правила на:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Пользователи могут читать и писать только свои данные
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Лидерборд доступен всем для чтения
    match /leaderboard/{entry} {
      allow read: if true;
      allow write: if false; // Только через Cloud Functions
    }
  }
}
```

**Важно:** Для Telegram Mini App без Firebase Auth используйте упрощенные правила:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if true; // Временно для разработки
    }
  }
}
```

⚠️ **В продакшене** добавьте валидацию Telegram initData на backend!

## Шаг 4: Получение конфигурации

1. В левом меню нажмите на ⚙️ → **Project settings**
2. Прокрутите вниз до раздела **Your apps**
3. Нажмите на иконку **</>** (Web)
4. Введите название: `blobis-web`
5. **НЕ** включайте Firebase Hosting
6. Нажмите **Register app**
7. Скопируйте конфигурацию `firebaseConfig`

## Шаг 5: Настройка переменных окружения

### Локальная разработка

Создайте файл `.env` в корне проекта:

```bash
cp .env.example .env
```

Заполните значения из Firebase Console:

```env
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=blobis-exchange.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=blobis-exchange
VITE_FIREBASE_STORAGE_BUCKET=blobis-exchange.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

### Render.com деплой

1. Откройте [Render Dashboard](https://dashboard.render.com/)
2. Выберите ваш сервис `blobis`
3. Перейдите в **Environment**
4. Добавьте переменные из `.env` файла (по одной)
5. Нажмите **Save Changes**

## Шаг 6: Тестирование

```bash
# Локально
npm run dev

# Откройте http://localhost:3000
# Проверьте консоль браузера на ошибки Firebase
```

## Шаг 7: Структура данных в Firestore

### Коллекция `users`

```javascript
{
  "telegram_123456789": {
    balanceBC: 1500.50,
    balanceBLOB: 12.3456,
    totalMined: 5000,
    upgrades: {
      clickPower: 5,
      cpuMiner: 2,
      gpuRig: 1,
      asicMiner: 0,
      miningFarm: 0,
      quantumMiner: 0
    },
    poolBC: 1000000,
    poolBLOB: 10000,
    candles: [...],
    trades: [...],
    lastSave: 1715160316890,
    lastUpdated: Timestamp
  }
}
```

## Шаг 8: Мониторинг

В Firebase Console → **Firestore Database** → **Data** вы увидите:
- Количество пользователей
- Их балансы
- Историю сделок

## Troubleshooting

### Ошибка: "Missing or insufficient permissions"
- Проверьте правила безопасности в Firestore Rules
- Убедитесь, что userId корректный

### Ошибка: "Firebase: Error (auth/invalid-api-key)"
- Проверьте `.env` файл
- Убедитесь, что переменные начинаются с `VITE_`
- Перезапустите dev-сервер

### Данные не сохраняются
- Откройте DevTools → Console
- Проверьте ошибки Firebase
- Убедитесь, что Firestore включен в проекте

## Безопасность в продакшене

1. **Валидация Telegram initData** на backend
2. **Rate limiting** для предотвращения спама
3. **Правила Firestore** с проверкой auth
4. **Мониторинг** использования квоты

## Квоты бесплатного плана

- **Хранилище:** 1 GB
- **Чтения:** 50,000 / день
- **Записи:** 20,000 / день
- **Удаления:** 20,000 / день

Для ~1000 активных пользователей этого достаточно.

---

✅ После настройки Firebase проект готов к деплою на Render.com!
