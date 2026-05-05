#!/bin/bash

# Скрипт для обновления переменных окружения на Render.com
# Использование: ./update_render_env.sh

SERVICE_ID="srv-d7rg9qugvqtc73bfq5i0"
RENDER_API_KEY="${RENDER_API_KEY}"

if [ -z "$RENDER_API_KEY" ]; then
    echo "❌ Ошибка: RENDER_API_KEY не установлен"
    echo ""
    echo "Получите API ключ здесь: https://dashboard.render.com/u/settings#api-keys"
    echo "Затем выполните: export RENDER_API_KEY='your_key_here'"
    echo ""
    echo "Или настройте переменные вручную:"
    echo "1. Откройте: https://dashboard.render.com/web/$SERVICE_ID/env"
    echo "2. Добавьте переменную:"
    echo "   - Key: WEBAPP_URL"
    echo "   - Value: https://blobis-gqla.onrender.com"
    echo "3. Добавьте переменную:"
    echo "   - Key: WEBHOOK_URL"
    echo "   - Value: https://blobis-gqla.onrender.com/webhook"
    echo "4. Нажмите 'Save Changes'"
    exit 1
fi

echo "🔧 Обновление переменных окружения на Render.com..."

# Обновляем WEBAPP_URL
curl -X PUT "https://api.render.com/v1/services/$SERVICE_ID/env-vars/WEBAPP_URL" \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"value": "https://blobis-gqla.onrender.com"}'

echo ""

# Добавляем WEBHOOK_URL
curl -X POST "https://api.render.com/v1/services/$SERVICE_ID/env-vars" \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"key": "WEBHOOK_URL", "value": "https://blobis-gqla.onrender.com/webhook"}'

echo ""
echo "✅ Переменные обновлены!"
echo "🔄 Render автоматически начнёт редеплой"
echo "📊 Проверьте логи: https://dashboard.render.com/web/$SERVICE_ID/logs"
