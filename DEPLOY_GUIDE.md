# 🚀 Деплой на Render.com с Firebase

## Шаг 1: Настройка Firebase

### 1.1 Создайте Firebase проект
1. Откройте [Firebase Console](https://console.firebase.google.com/)
2. Создайте проект `blobis`
3. Включите Firestore Database

### 1.2 Настройте Firestore Rules
В Firebase Console → Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if true;
    }
    match /leaderboard/{entry} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

⚠️ **Важно:** Эти правила открытые для разработки. В продакшене добавьте валидацию Telegram initData!

### 1.3 Получите Firebase конфигурацию
1. Firebase Console → Project Settings → General
2. Прокрутите до "Your apps"
3. Нажмите Web icon `</>`
4. Скопируйте конфигурацию

## Шаг 2: Настройка переменных окружения на Render

### 2.1 Откройте Render Dashboard
Перейдите на https://dashboard.render.com/web/srv-d7rg9qugvqtc73bfq5i0

### 2.2 Добавьте переменные окружения
Environment → Add Environment Variable:

```bash
# Telegram Bot
TELEGRAM_BOT_TOKEN=8710086427:AAF0evFD9H8asJ4fcNUXr9z3zbAKUyvxUGA

# Database
DATABASE_URL=sqlite:///./blobis.db

# App Settings
DEBUG=False
SERVER_HOST=0.0.0.0
SERVER_PORT=8000

# URLs
WEBAPP_URL=https://blobis-gqla.onrender.com
WEBHOOK_URL=https://blobis-gqla.onrender.com/webhook

# Firebase Configuration (замените на ваши значения)
VITE_FIREBASE_API_KEY=AIzaSyDilJciJIZWlZfzNBG95B8AyQpNCq9_SBQ
VITE_FIREBASE_AUTH_DOMAIN=blobis.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=blobis
VITE_FIREBASE_STORAGE_BUCKET=blobis.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=414925110586
VITE_FIREBASE_APP_ID=1:414925110586:web:29f5c931542d554b722403
```

### 2.3 Сохраните изменения
Нажмите "Save Changes" - Render автоматически перезапустит сервис.

## Шаг 3: Обновление кода (если нужно)

### 3.1 Проверьте firestore.rules
Файл `firestore.rules` уже создан в проекте. Скопируйте его содержимое в Firebase Console.

### 3.2 Деплой правил через Firebase CLI (опционально)
```bash
# Установите Firebase CLI
npm install -g firebase-tools

# Войдите в аккаунт
firebase login

# Инициализируйте проект
firebase init firestore

# Деплой правил
firebase deploy --only firestore:rules
```

## Шаг 4: Билд и деплой

### 4.1 Локальный тест
```bash
# Установите зависимости
npm install

# Соберите проект
npm run build

# Проверьте dist/
ls -la dist/
```

### 4.2 Пуш на GitHub
```bash
git add .
git commit -m "Add Firebase integration and NotCoin UI"
git push origin main
```

### 4.3 Render автоматически задеплоит
Render обнаружит изменения и запустит билд:
1. `npm install`
2. `npm run build`
3. Запуск `backend.py`

## Шаг 5: Проверка

### 5.1 Откройте приложение
https://blobis-gqla.onrender.com

### 5.2 Проверьте консоль браузера
Не должно быть ошибок Firebase:
- ✅ Firebase initialized
- ✅ User data loaded
- ❌ Missing or insufficient permissions (если есть - проверьте правила)

### 5.3 Проверьте Firestore
Firebase Console → Firestore Database → Data

Должна появиться коллекция `users` с данными пользователей:
```
users/
  ├─ telegram_123456789/
  │   ├─ balanceBC: 1000
  │   ├─ balanceBLOB: 0
  │   ├─ username: "user123"
  │   ├─ telegramId: "123456789"
  │   └─ lastUpdated: Timestamp
```

## Шаг 6: Настройка Telegram Bot

### 6.1 Установите Web App URL
```bash
# Через BotFather
/setmenubutton
# Выберите бота
# Button text: Play Blobis
# URL: https://blobis-gqla.onrender.com
```

### 6.2 Проверьте webhook
```bash
curl https://api.telegram.org/bot8710086427:AAF0evFD9H8asJ4fcNUXr9z3zbAKUyvxUGA/getWebhookInfo
```

Должно быть:
```json
{
  "url": "https://blobis-gqla.onrender.com/webhook",
  "has_custom_certificate": false,
  "pending_update_count": 0
}
```

## Troubleshooting

### Ошибка: "Missing or insufficient permissions"
**Решение:**
1. Проверьте Firestore Rules в Firebase Console
2. Убедитесь, что правила разрешают `allow read, write: if true`
3. Подождите 1-2 минуты после изменения правил

### Ошибка: "Firebase: Error (auth/invalid-api-key)"
**Решение:**
1. Проверьте переменные окружения на Render
2. Убедитесь, что все переменные начинаются с `VITE_`
3. Пересоберите проект: Manual Deploy → Clear build cache & deploy

### Данные не сохраняются
**Решение:**
1. Откройте DevTools → Console
2. Проверьте ошибки Firebase
3. Убедитесь, что `userId` корректный (должен быть Telegram ID)

### Render не билдится
**Решение:**
1. Проверьте логи: Logs → Build Logs
2. Убедитесь, что `package.json` содержит все зависимости
3. Проверьте `render.yaml` конфигурацию

## Мониторинг

### Firebase Usage
Firebase Console → Usage and billing
- Следите за количеством reads/writes
- Бесплатный план: 50K reads, 20K writes в день

### Render Logs
Dashboard → Logs
- Следите за ошибками backend
- Проверяйте время отклика

## Безопасность (для продакшена)

### 1. Валидация Telegram initData
Добавьте проверку на backend:
```python
import hmac
import hashlib

def validate_telegram_data(init_data, bot_token):
    # Проверка подписи Telegram
    # Реализация в backend.py
    pass
```

### 2. Rate Limiting
Добавьте ограничение запросов:
```python
from slowapi import Limiter
limiter = Limiter(key_func=get_remote_address)
```

### 3. Firestore Rules с auth
```javascript
match /users/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

## Готово! 🎉

Ваше приложение теперь:
- ✅ Работает на Render.com
- ✅ Сохраняет данные в Firebase
- ✅ Привязано к Telegram username
- ✅ Имеет NotCoin-стиль интерфейс
- ✅ Готово к тестированию

Откройте бота в Telegram и начните играть!
