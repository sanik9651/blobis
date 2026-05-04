# Инструкция по деплою на Render.com

## Автоматический деплой

Render.com автоматически задеплоит изменения из GitHub репозитория.

Изменения уже запушены в GitHub: https://github.com/sanik9651/blobis

Render.com автоматически обнаружит изменения и начнет деплой в течение 1-2 минут.

## Ручной деплой (если нужно)

1. Перейдите на https://dashboard.render.com/web/srv-d7rg9qugvqtc73bfq5i0
2. Нажмите кнопку "Manual Deploy" → "Deploy latest commit"
3. Дождитесь завершения деплоя (обычно 3-5 минут)

## Проверка деплоя

После завершения деплоя проверьте:
- Веб-приложение: https://blobis-gqla.onrender.com/webapp
- API документация: https://blobis-gqla.onrender.com/docs
- Главная страница: https://blobis-gqla.onrender.com/

## Что было исправлено

1. ✅ Создан `crud.py` - функции для работы с базой данных
2. ✅ Создан `schemas.py` - Pydantic схемы для API
3. ✅ Упрощена команда `/start` в боте - теперь только приветствие
4. ✅ Исправлен `backend.py` - убраны ошибки с lifespan
5. ✅ Создано веб-приложение `src/index.html`
6. ✅ Обновлен `render.yaml` - убраны npm зависимости
7. ✅ Все изменения закоммичены и запушены в GitHub

## Настройка вебхука для Telegram бота

После успешного деплоя бот автоматически настроит вебхук при запуске сервера.

Если нужно проверить статус вебхука:
```bash
curl https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo
```

## Переменные окружения на Render.com

Убедитесь, что на Render.com установлены следующие переменные:
- `TELEGRAM_BOT_TOKEN` - токен вашего бота
- `WEBAPP_URL` - https://blobis-gqla.onrender.com
- `WEBHOOK_SECRET` - автоматически генерируется
- `HF_API_TOKEN` - токен Hugging Face (опционально)
