# 🚀 Deployment Guide - Render.com

## Предварительные требования

- ✅ GitHub репозиторий: https://github.com/sanik9651/blobis
- ✅ Firebase проект настроен (см. FIREBASE_SETUP.md)
- ✅ Telegram Bot создан через @BotFather

## Шаг 1: Подготовка кода

```bash
# Убедитесь, что все изменения закоммичены
git add .
git commit -m "Add Firebase integration and NotCoin UI"
git push origin main
```

## Шаг 2: Настройка Render.com

### 2.1 Подключение репозитория

1. Откройте [Render Dashboard](https://dashboard.render.com/)
2. Ваш сервис `blobis` уже существует
3. Render автоматически подхватит изменения из `render.yaml`

### 2.2 Добавление переменных окружения

Перейдите в **Environment** и добавьте:

#### Firebase переменные:
```
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=blobis-exchange.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=blobis-exchange
VITE_FIREBASE_STORAGE_BUCKET=blobis-exchange.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abc...
```

#### Существующие переменные (проверьте):
```
TELEGRAM_BOT_TOKEN=your_bot_token
WEBAPP_URL=https://blobis-gqla.onrender.com
WEBHOOK_URL=https://blobis-gqla.onrender.com/webhook
```

### 2.3 Триггер деплоя

1. Нажмите **Manual Deploy** → **Deploy latest commit**
2. Или просто сделайте `git push` — автодеплой включен

## Шаг 3: Мониторинг деплоя

### Логи сборки:
```
==> Building...
npm install
npm run build
  ✓ built in 15s
pip install -r requirements.txt

==> Starting service...
uvicorn backend:app --host 0.0.0.0 --port 10000
INFO: Application startup complete
```

### Проверка статуса:
- ✅ Build успешен
- ✅ Service запущен
- ✅ Health check проходит

## Шаг 4: Настройка Telegram Bot

### 4.1 Установка Web App кнопки

Отправьте @BotFather:
```
/setmenubutton
@YourBotName
https://blobis-gqla.onrender.com/webapp
⛏️ Play Blobis
```

### 4.2 Установка webhook

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://blobis-gqla.onrender.com/webhook",
    "secret_token": "<WEBHOOK_SECRET_FROM_RENDER>"
  }'
```

Или через Python:
```python
import requests

BOT_TOKEN = "your_bot_token"
WEBHOOK_URL = "https://blobis-gqla.onrender.com/webhook"
WEBHOOK_SECRET = "your_webhook_secret"

response = requests.post(
    f"https://api.telegram.org/bot{BOT_TOKEN}/setWebhook",
    json={
        "url": WEBHOOK_URL,
        "secret_token": WEBHOOK_SECRET
    }
)
print(response.json())
```

## Шаг 5: Тестирование

### 5.1 Проверка Web App
1. Откройте бота в Telegram
2. Нажмите кнопку меню "⛏️ Play Blobis"
3. Должен открыться интерфейс майнинга

### 5.2 Проверка функционала
- ✅ Клик по кнопке MINE → начисляются BC
- ✅ Покупка апгрейдов → работает
- ✅ Переход в Trade → открывается биржа
- ✅ Покупка/продажа $BLOB → исполняется
- ✅ Данные сохраняются в Firebase

### 5.3 Проверка Firebase
1. Откройте Firebase Console → Firestore
2. Коллекция `users` → должны появиться записи
3. Проверьте структуру данных

## Шаг 6: Мониторинг

### Render.com метрики:
- **CPU Usage** — должно быть <50%
- **Memory** — должно быть <512MB
- **Response Time** — <500ms

### Firebase метрики:
- **Reads/day** — следите за квотой (50K бесплатно)
- **Writes/day** — следите за квотой (20K бесплатно)

## Troubleshooting

### Проблема: Build fails
```
Error: Cannot find module 'vite'
```
**Решение:** Проверьте `package.json`, убедитесь что vite в devDependencies

### Проблема: Static files not found
```
Static directory not found: dist
```
**Решение:** 
```bash
npm run build  # Локально проверьте сборку
git add dist/  # Если нужно закоммитить
```

### Проблема: Firebase connection error
```
Firebase: Error (auth/invalid-api-key)
```
**Решение:** Проверьте переменные окружения в Render, они должны начинаться с `VITE_`

### Проблема: Telegram WebApp не открывается
**Решение:**
1. Проверьте URL в @BotFather
2. Убедитесь что сервис запущен на Render
3. Проверьте логи: `curl https://blobis-gqla.onrender.com/webapp`

## Обновление приложения

```bash
# 1. Внесите изменения
git add .
git commit -m "Update feature X"
git push origin main

# 2. Render автоматически задеплоит
# 3. Проверьте логи в Render Dashboard
```

## Откат к предыдущей версии

1. Render Dashboard → **Manual Deploy**
2. Выберите предыдущий коммит
3. Нажмите **Deploy**

## Масштабирование

### Бесплатный план Render:
- ✅ 750 часов/месяц
- ✅ Автоматический sleep после 15 мин неактивности
- ✅ Пробуждение при первом запросе (~30 сек)

### Для production:
- Upgrade до **Starter** ($7/мес) — без sleep
- Добавьте **Redis** для кэширования
- Настройте **CDN** для статики

## Безопасность

### Обязательно:
- ✅ Валидация Telegram initData на backend
- ✅ Rate limiting для API
- ✅ HTTPS (автоматически на Render)
- ✅ Firestore security rules

### Рекомендуется:
- Мониторинг через Sentry
- Backup базы данных
- Логирование критических операций

---

✅ **Готово!** Ваше приложение доступно по адресу:
**https://blobis-gqla.onrender.com/webapp**
