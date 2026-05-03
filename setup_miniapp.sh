#!/bin/bash

echo "🎮 Настройка Mini App для Blobis"
echo "================================"
echo ""

# Проверяем ngrok
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok не установлен"
    exit 1
fi

echo "✅ ngrok установлен"
echo ""

# Проверяем authtoken
if ! ngrok config check &> /dev/null; then
    echo "⚠️  ngrok authtoken не настроен"
    echo ""
    echo "Пожалуйста, выполните следующие шаги:"
    echo ""
    echo "1. Зарегистрируйтесь: https://dashboard.ngrok.com/signup"
    echo "2. Получите authtoken: https://dashboard.ngrok.com/get-started/your-authtoken"
    echo "3. Выполните: ngrok config add-authtoken ВАШ_ТОКЕН"
    echo ""
    read -p "Нажмите Enter после настройки authtoken..."
fi

# Проверяем backend
echo "Проверяем backend..."
if ! curl -s http://localhost:8000/api/health > /dev/null 2>&1; then
    echo "❌ Backend не запущен на порту 8000"
    echo "Запустите: python backend.py"
    exit 1
fi

echo "✅ Backend работает"
echo ""

# Запускаем ngrok в фоне
echo "Запускаем ngrok туннель..."
pkill -f "ngrok http" 2>/dev/null
nohup ngrok http 8000 > /tmp/ngrok.log 2>&1 &
sleep 3

# Получаем URL
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | grep -o '"public_url":"https://[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$NGROK_URL" ]; then
    echo "❌ Не удалось получить ngrok URL"
    echo "Проверьте логи: cat /tmp/ngrok.log"
    exit 1
fi

echo "✅ ngrok туннель запущен"
echo ""
echo "🌐 Ваш HTTPS URL: $NGROK_URL"
echo ""

# Обновляем .env
if [ -f .env ]; then
    # Удаляем старую строку WEBAPP_URL если есть
    sed -i '/^WEBAPP_URL=/d' .env
fi

# Добавляем новый URL
echo "WEBAPP_URL=$NGROK_URL" >> .env

echo "✅ .env обновлен"
echo ""

# Инструкции для BotFather
echo "📱 Следующие шаги:"
echo ""
echo "1. Откройте @BotFather в Telegram"
echo "2. Отправьте: /mybots"
echo "3. Выберите вашего бота"
echo "4. Нажмите: Bot Settings → Menu Button → Configure menu button"
echo "5. Введите текст: 🎮 Играть"
echo "6. Введите URL: $NGROK_URL/webapp"
echo ""
echo "7. Перезапустите бота:"
echo "   python telegram_bot.py"
echo ""
echo "8. Откройте бота в Telegram и нажмите кнопку меню (≡)"
echo ""
echo "✅ Готово! Mini App настроен!"
echo ""
echo "⚠️  Важно: ngrok туннель работает в фоне."
echo "   Для остановки: pkill -f 'ngrok http'"