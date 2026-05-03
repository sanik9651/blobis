#!/usr/bin/env python3
"""
Blobis - Запуск всего приложения одной командой
Запускает backend и telegram bot одновременно
"""

import subprocess
import sys
import time
import os
from pathlib import Path

def check_env():
    """Проверка .env файла"""
    if not Path('.env').exists():
        print("❌ Файл .env не найден!")
        print("📝 Создайте .env файл на основе .env.example")
        print("   Минимально необходимо:")
        print("   - TELEGRAM_BOT_TOKEN=ваш_токен")
        return False
    
    # Проверяем наличие токена
    with open('.env', 'r') as f:
        content = f.read()
        if 'TELEGRAM_BOT_TOKEN=' not in content or 'YOUR_BOT_TOKEN_HERE' in content:
            print("❌ TELEGRAM_BOT_TOKEN не настроен в .env")
            print("📝 Получите токен у @BotFather и добавьте в .env")
            return False
    
    return True

def check_dependencies():
    """Проверка зависимостей"""
    try:
        import fastapi
        import telegram
        import sqlalchemy
        print("✅ Все зависимости установлены")
        return True
    except ImportError as e:
        print(f"❌ Не установлены зависимости: {e}")
        print("📦 Установите: pip install -r requirements.txt")
        return False

def main():
    print("=" * 60)
    print("🎣 BLOBIS - Запуск приложения")
    print("=" * 60)
    print()
    
    # Проверки
    if not check_env():
        sys.exit(1)
    
    if not check_dependencies():
        sys.exit(1)
    
    print()
    print("🚀 Запуск компонентов...")
    print()
    
    # Запускаем backend
    print("📡 Запуск backend сервера...")
    backend_process = subprocess.Popen(
        [sys.executable, 'backend.py'],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        universal_newlines=True,
        bufsize=1
    )
    
    # Ждем запуска backend
    time.sleep(3)
    
    # Проверяем что backend запустился
    if backend_process.poll() is not None:
        print("❌ Backend не запустился!")
        print("Проверьте логи выше")
        sys.exit(1)
    
    print("✅ Backend запущен на http://localhost:8000")
    print()
    
    # Запускаем telegram bot
    print("🤖 Запуск Telegram бота...")
    bot_process = subprocess.Popen(
        [sys.executable, 'telegram_bot.py'],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        universal_newlines=True,
        bufsize=1
    )
    
    time.sleep(2)
    
    # Проверяем что бот запустился
    if bot_process.poll() is not None:
        print("❌ Telegram бот не запустился!")
        backend_process.terminate()
        sys.exit(1)
    
    print("✅ Telegram бот запущен")
    print()
    print("=" * 60)
    print("✅ ВСЁ ЗАПУЩЕНО!")
    print("=" * 60)
    print()
    print("📱 Откройте вашего бота в Telegram и отправьте /start")
    print()
    print("🌐 Web App доступен на http://localhost:8000/webapp")
    print()
    print("⚠️ Для полноценной работы Telegram Web App нужен публичный HTTPS URL:")
    print("   - Для локальной разработки: используйте ngrok. Пример: `ngrok http 8000`")
    print("     Затем установите URL из ngrok (`https://<your-ngrok-id>.ngrok-free.app/webapp`) в .env как WEBAPP_URL.")
    print("   - Для продакшена: разверните проект на хостинге с HTTPS. Подробнее в `DEPLOYMENT.md`.")
    print("     Установите WEBAPP_URL в .env на ваш публичный URL.")
    print()
    print("⚙️  Для работы Web App в Telegram:")
    print("   Используйте @BotFather, чтобы установить Web App Menu Button:")
    print("   `/setwebapp` -> выберите бота -> вставьте URL (например, `https://yourdomain.com/webapp`) -> укажите текст кнопки.")
    print()
    print("🛑 Для остановки нажмите Ctrl+C")
    print()
    
    try:
        # Выводим логи в реальном времени
        while True:
            # Читаем логи backend
            line = backend_process.stdout.readline()
            if line:
                print(f"[BACKEND] {line.strip()}")
            
            # Читаем логи bot
            line = bot_process.stdout.readline()
            if line:
                print(f"[BOT] {line.strip()}")
            
            # Проверяем что процессы живы
            if backend_process.poll() is not None:
                print("❌ Backend остановился!")
                break
            if bot_process.poll() is not None:
                print("❌ Bot остановился!")
                break
            
            time.sleep(0.1)
    
    except KeyboardInterrupt:
        print()
        print("🛑 Остановка...")
        backend_process.terminate()
        bot_process.terminate()
        
        # Ждем завершения
        backend_process.wait(timeout=5)
        bot_process.wait(timeout=5)
        
        print("✅ Всё остановлено")

if __name__ == "__main__":
    main()