#!/bin/bash

echo "🎣 BLOBIS - Setup Script"
echo "========================"
echo ""

# Проверка Python
echo "✓ Проверка Python..."
python3 --version
if [ $? -ne 0 ]; then
    echo "❌ Python не найден!"
    exit 1
fi

# Проверка pip
echo "✓ Проверка pip..."
pip3 --version
if [ $? -ne 0 ]; then
    echo "❌ pip не найден!"
    exit 1
fi

# Установка зависимостей
echo ""
echo "📦 Установка зависимостей..."
pip3 install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "❌ Ошибка при установке зависимостей!"
    exit 1
fi

# Проверка .env файла
echo ""
echo "🔧 Проверка .env файла..."
if [ ! -f .env ]; then
    echo "⚠️  Файл .env не найден!"
    echo "Создаю .env из .env.example..."
    cp .env.example .env
    echo "⚠️  Пожалуйста, отредактируй файл .env и добавь TELEGRAM_BOT_TOKEN!"
    exit 1
fi

echo ""
echo "✅ Настройка завершена!"
echo ""
echo "🚀 Запуск проекта:"
echo "   1. Терминал 1: python backend.py"
echo "   2. Терминал 2: python telegram_bot.py"
echo ""
echo "Или:"
echo "   uvicorn backend:app --reload"
echo ""
