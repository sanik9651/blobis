#!/bin/bash
# Простой скрипт запуска Blobis для Linux/Mac

echo "🎣 BLOBIS - Запуск приложения"
echo "=============================="
echo ""

# Проверка виртуального окружения
if [ ! -d "venv" ]; then
    echo "❌ Виртуальное окружение не найдено!"
    echo "📦 Создайте его: python3 -m venv venv"
    echo "📦 Активируйте: source venv/bin/activate"
    echo "📦 Установите зависимости: pip install -r requirements.txt"
    exit 1
fi

# Активация виртуального окружения
source venv/bin/activate

# Проверка .env
if [ ! -f ".env" ]; then
    echo "❌ Файл .env не найден!"
    echo "📝 Создайте .env на основе .env.example"
    exit 1
fi

# Запуск
echo "🚀 Запуск..."
python start_all.py