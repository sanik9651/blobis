# ✅ Чеклист для тестирования и деплоя

## 🔥 Firebase Setup

### 1. Настройка Firebase Console
- [ ] Открыть https://console.firebase.google.com/u/0/project/blobis
- [ ] Перейти в Firestore Database
- [ ] Открыть вкладку "Rules"
- [ ] Скопировать содержимое файла `firestore.rules`
- [ ] Вставить в редактор правил
- [ ] Нажать "Publish"
- [ ] Подождать 1-2 минуты для применения

### 2. Проверка правил
Правила должны выглядеть так:
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

## 🚀 Render.com Deployment

### 1. Обновление переменных окружения
- [ ] Открыть https://dashboard.render.com/web/srv-d7rg9qugvqtc73bfq5i0
- [ ] Перейти в "Environment"
- [ ] Проверить/добавить переменные:

```bash
VITE_FIREBASE_API_KEY=AIzaSyDilJciJIZWlZfzNBG95B8AyQpNCq9_SBQ
VITE_FIREBASE_AUTH_DOMAIN=blobis.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=blobis
VITE_FIREBASE_STORAGE_BUCKET=blobis.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=414925110586
VITE_FIREBASE_APP_ID=1:414925110586:web:29f5c931542d554b722403
```

- [ ] Нажать "Save Changes"
- [ ] Дождаться автоматического редеплоя (3-5 минут)

### 2. Проверка деплоя
- [ ] Открыть Logs → Deploy Logs
- [ ] Убедиться, что билд прошел успешно
- [ ] Проверить, что нет ошибок в Runtime Logs

## 🧪 Тестирование

### 1. Локальное тестирование (опционально)
```bash
# В директории проекта
npm run dev
# Открыть http://localhost:5173
```

Проверить:
- [ ] Интерфейс загружается
- [ ] Черно-белый дизайн с золотыми акцентами
- [ ] Нижняя навигация работает
- [ ] Майнинг работает (клик по монете)
- [ ] Трейдинг работает (покупка/продажа)
- [ ] Профиль отображается

### 2. Тестирование на Render
- [ ] Открыть https://blobis-gqla.onrender.com
- [ ] Открыть DevTools (F12) → Console
- [ ] Проверить отсутствие ошибок Firebase

Ожидаемые логи:
```
✅ Firebase initialized
✅ User data loaded
✅ Telegram WebApp ready
```

НЕ должно быть:
```
❌ Missing or insufficient permissions
❌ Firebase: Error (auth/invalid-api-key)
❌ Failed to load user data
```

### 3. Проверка Firebase данных
- [ ] Открыть Firebase Console → Firestore Database → Data
- [ ] Должна появиться коллекция `users`
- [ ] Внутри должен быть документ с вашим Telegram ID
- [ ] Проверить поля:
  - `balanceBC` (число)
  - `balanceBLOB` (число)
  - `username` (строка)
  - `telegramId` (строка)
  - `lastUpdated` (timestamp)

### 4. Функциональное тестирование

#### Майнинг
- [ ] Кликнуть на золотую монету
- [ ] Появляется анимация "+X"
- [ ] Баланс BC увеличивается
- [ ] Открыть "Upgrades"
- [ ] Купить апгрейд
- [ ] Проверить, что пассивный доход работает

#### Трейдинг
- [ ] Перейти на вкладку "Trade"
- [ ] Ввести сумму BC
- [ ] Нажать "Buy $BLOB"
- [ ] Проверить, что баланс $BLOB увеличился
- [ ] Попробовать продать $BLOB обратно
- [ ] Проверить историю сделок

#### Профиль
- [ ] Перейти на вкладку "Profile"
- [ ] Проверить отображение балансов
- [ ] Проверить статистику майнинга

### 5. Проверка синхронизации
- [ ] Закрыть приложение
- [ ] Открыть снова
- [ ] Проверить, что баланс сохранился
- [ ] Открыть на другом устройстве (если возможно)
- [ ] Проверить, что данные синхронизированы

## 📱 Telegram Bot Setup

### 1. Настройка Web App
```bash
# Открыть @BotFather в Telegram
/mybots
# Выбрать вашего бота
# Menu Button → Edit menu button URL
# URL: https://blobis-gqla.onrender.com
```

### 2. Проверка webhook
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

### 3. Тестирование в Telegram
- [ ] Открыть бота в Telegram
- [ ] Нажать кнопку Menu или команду /start
- [ ] Приложение должно открыться
- [ ] Проверить, что Telegram username отображается
- [ ] Проверить тактильную обратную связь (вибрация при клике)

## 🐛 Troubleshooting

### Ошибка: "Missing or insufficient permissions"
**Решение:**
1. Проверить Firestore Rules в Firebase Console
2. Убедиться, что правила: `allow read, write: if true`
3. Подождать 1-2 минуты после изменения правил
4. Очистить кэш браузера (Ctrl+Shift+R)

### Ошибка: "Firebase: Error (auth/invalid-api-key)"
**Решение:**
1. Проверить переменные окружения на Render
2. Убедиться, что все переменные начинаются с `VITE_`
3. Пересобрать проект: Manual Deploy → Clear build cache & deploy

### Данные не сохраняются
**Решение:**
1. Открыть DevTools → Console
2. Проверить ошибки Firebase
3. Проверить Network tab → Firestore запросы
4. Убедиться, что userId корректный

### Render не билдится
**Решение:**
1. Проверить Build Logs
2. Убедиться, что все зависимости установлены
3. Проверить `package.json` и `vite.config.js`

## ✅ Финальная проверка

Перед релизом убедитесь:
- [ ] Firebase правила настроены
- [ ] Render переменные окружения добавлены
- [ ] Приложение успешно задеплоено
- [ ] Нет ошибок в консоли
- [ ] Данные сохраняются в Firestore
- [ ] Telegram username привязан
- [ ] Все 3 вкладки работают
- [ ] Майнинг работает
- [ ] Трейдинг работает
- [ ] Профиль отображается
- [ ] Дизайн соответствует NotCoin стилю
- [ ] Мобильная версия работает корректно

## 🎉 Готово к релизу!

Если все пункты выполнены - приложение готово к использованию!

## 📊 Мониторинг

### Firebase Usage
Проверяйте ежедневно:
- Firebase Console → Usage and billing
- Reads: < 50,000/день (бесплатный лимит)
- Writes: < 20,000/день (бесплатный лимит)

### Render Metrics
Проверяйте:
- Dashboard → Metrics
- Response time
- Error rate
- Memory usage

## 🔄 Следующие шаги

После успешного деплоя:
1. Добавить лидерборд
2. Добавить реферальную систему
3. Добавить ежедневные награды
4. Рассмотреть интеграцию TON токена (см. TOKENOMICS.md)

---

**Удачи с запуском! 🚀**
