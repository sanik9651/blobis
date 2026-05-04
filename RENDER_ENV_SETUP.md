# Инструкция по настройке переменных окружения на Render.com

## Проблема
Render.com не подхватывает новые переменные из render.yaml автоматически. Их нужно добавить вручную через dashboard.

## Решение

### Вариант 1: Через веб-интерфейс (рекомендуется)

1. Откройте: https://dashboard.render.com/web/srv-d7rg9qugvqtc73bfq5i0/env
2. Нажмите "Add Environment Variable"
3. Добавьте:
   - **Key:** `WEBHOOK_URL`
   - **Value:** `https://blobis-gqla.onrender.com/webhook`
4. Нажмите "Save Changes"
5. Render.com автоматически сделает редеплой

### Вариант 2: Через render.yaml (уже сделано)

Переменная уже добавлена в render.yaml, но для существующих сервисов нужно добавить её вручную через dashboard (см. Вариант 1).

## Проверка

После редеплоя проверьте логи: https://dashboard.render.com/web/srv-d7rg9qugvqtc73bfq5i0/logs

Должно быть:
```
Setting webhook for bot to https://blobis-gqla.onrender.com/webhook
🤖 Blobis Bot is configured for webhooks.
```

Если видите `http://0.0.0.0:8000/webhook` - значит переменная не установлена.

## Альтернатива: Запуск без вебхука

Если не хотите настраивать вебхук, можно запустить бота в режиме polling локально:

```bash
python telegram_bot.py
```

Но для продакшена на Render.com нужен вебхук.

## Список всех необходимых переменных

Убедитесь, что на Render.com установлены:

1. ✅ `TELEGRAM_BOT_TOKEN` - токен вашего бота (должен быть установлен)
2. ✅ `WEBAPP_URL` - https://blobis-gqla.onrender.com (должен быть установлен)
3. ⚠️ `WEBHOOK_URL` - https://blobis-gqla.onrender.com/webhook (НУЖНО ДОБАВИТЬ ВРУЧНУЮ)
4. ✅ `WEBHOOK_SECRET` - автоматически генерируется
5. ✅ `DATABASE_URL` - sqlite:///./blobis.db
6. ⚠️ `HF_API_TOKEN` - опционально, для генерации изображений

## После настройки

1. Дождитесь завершения деплоя (3-5 минут)
2. Откройте бота в Telegram
3. Отправьте `/start`
4. Нажмите кнопку "🎮 Играть в Blobis"
