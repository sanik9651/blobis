#!/bin/bash

# Скрипт для установки переменных окружения на Render.com через API
# Использование: ./set_render_env.sh

SERVICE_ID="srv-d7rg9qugvqtc73bfq5i0"
RENDER_API_KEY="YOUR_RENDER_API_KEY"  # Получите на https://dashboard.render.com/u/settings#api-keys

# Установка WEBHOOK_URL
curl -X PUT "https://api.render.com/v1/services/${SERVICE_ID}/env-vars/WEBHOOK_URL" \
  -H "Authorization: Bearer ${RENDER_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "value": "https://blobis-gqla.onrender.com/webhook"
  }'

echo "Переменная WEBHOOK_URL установлена. Теперь нужно сделать редеплой."
