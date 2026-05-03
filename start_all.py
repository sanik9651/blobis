import subprocess
import sys
import os
import time
from pathlib import Path

def check_env():
    """Проверка .env файла для локального запуска"""
    if not Path('.env').exists():
        print("📝 Для локального запуска: Создайте .env файл на основе .env.example")
        return False
    
    with open('.env', 'r') as f:
        content = f.read()
        if 'TELEGRAM_BOT_TOKEN=' not in content or 'YOUR_BOT_TOKEN_HERE' in content:
            print("📝 Для локального запуска: TELEGRAM_BOT_TOKEN не настроен в .env")
            return False
    
    return True

def check_dependencies():
    """Проверка зависимостей"""
    try:
        import fastapi # type: ignore
        import telegram # type: ignore
        import sqlalchemy # type: ignore
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

    # Проверки для локального запуска
    if "RENDER" not in os.environ: # Пропускаем проверки на Render.com, т.к. переменные окружения устанавливаются там
        if not check_env():
            print("⚠️ Пропускаем запуск из-за отсутствия .env или токена. Это нормально для Render.com.")
            # sys.exit(1) # Не выходим, так как на Render.com эти проверки не нужны
        
        if not check_dependencies():
            print("⚠️ Пропускаем запуск из-за отсутствия зависимостей. Это нормально для Render.com.")
            # sys.exit(1) # Не выходим, так как на Render.com зависимости устанавливаются отдельно
    
    print()
    print("🚀 Запуск компонентов...")
    print()
    
    processes = []

    # Запускаем backend
    print("📡 Запуск backend сервера...")
    backend_command = [sys.executable, 'backend.py']
    backend_process = subprocess.Popen(
        backend_command,
        stdout=sys.stdout, # Перенаправляем stdout в основной процесс
        stderr=sys.stderr, # Перенаправляем stderr в основной процесс
        universal_newlines=True,
        bufsize=1
    )
    processes.append(backend_process)
    print(f"✅ Backend запущен как PID: {backend_process.pid}")
    
    # Запускаем telegram bot
    print("🤖 Запуск Telegram бота...")
    bot_command = [sys.executable, 'telegram_bot.py']
    bot_process = subprocess.Popen(
        bot_command,
        stdout=sys.stdout, # Перенаправляем stdout в основной процесс
        stderr=sys.stderr, # Перенаправляем stderr в основной процесс
        universal_newlines=True,
        bufsize=1
    )
    processes.append(bot_process)
    print(f"✅ Telegram бот запущен как PID: {bot_process.pid}")
    
    print()
    print("=" * 60)
    print("✅ ВСЁ ЗАПУЩЕНО!")
    print("=" * 60)
    print()
    
    if "RENDER" not in os.environ:
        print("📱 Откройте вашего бота в Telegram и отправьте /start")
        print("🌐 Web App доступен на http://localhost:8000/webapp (для локальной разработки)")
        print("⚠️ Для полноценной работы Telegram Web App нужен публичный HTTPS URL. Инструкции в `README.md`.")
        print("⚙️  Для работы Web App в Telegram: Настройте @BotFather, как описано в `README.md`.")
    else:
        print("ℹ️ Приложение запущено на Render.com. Проверьте логи сервиса для вывода.")
        print("📱 Убедитесь, что TELEGRAM_BOT_TOKEN и WEBAPP_URL установлены в переменных окружения Render.")
        print("⚙️  Настройте @BotFather, как описано в `README.md`, используя ваш публичный URL Web App.")

    print()
    print("🛑 Для остановки нажмите Ctrl+C")
    print()
    
    try:
        # Ждем завершения всех процессов
        while True:
            all_alive = True
            for p in processes:
                if p.poll() is not None: # Процесс завершился
                    print(f"❌ Процесс с PID {p.pid} завершился с кодом {p.poll()}")
                    all_alive = False
            if not all_alive:
                break
            time.sleep(1) # Проверяем каждую секунду
    
    except KeyboardInterrupt:
        print()
        print("🛑 Остановка...")
        
    finally:
        for p in processes:
            if p.poll() is None: # Если процесс еще не завершен
                p.terminate()
        
        for p in processes:
            try:
                p.wait(timeout=5) # Ждем завершения с таймаутом
            except subprocess.TimeoutExpired:
                p.kill() # Если не завершился, убиваем
        
        print("✅ Всё остановлено")

if __name__ == "__main__":
    main()