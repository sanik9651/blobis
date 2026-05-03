@echo off
echo ===================================
echo 🎣 BLOBIS - Запуск игры
echo ===================================
echo.

REM Останавливаем старые процессы
taskkill /F /IM python.exe >nul 2>&1

echo 📦 Проверка зависимостей...
pip install python-telegram-bot fastapi uvicorn sqlalchemy python-dotenv aiohttp requests Pillow python-multipart pydantic pydantic-settings httpx psycopg2-binary >nul 2>&1

echo.
echo 🚀 Запуск Backend (FastAPI)...
echo Открой НОВЫЙ терминал и введи:
echo.
echo python telegram_bot.py
echo.
echo А пока - сервер запустится автоматически через 3 секунды...
echo.
timeout /t 3 /nobreak >nul

start "BLOBIS Backend" cmd /k "python -m uvicorn backend:app --host 0.0.0.0 --port 8000 --reload"

echo.
echo ⏳ Ждём запуска сервера...
timeout /t 5 /nobreak >nul

echo.
echo 🤖 Теперь запусти Telegram Bot в НОВОМ терминале:
echo python telegram_bot.py
echo.
echo Или используй run.bat
echo.
echo 📡 Проверка сервера...
powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:8000/api/health' -UseBasicParsing; if ($r.StatusCode -eq 200) { Write-Output '✅ Backend запущен!' } } catch { Write-Output '❌ Backend не отвечает' }"
echo.
echo ===================================
echo Готово! Отправь /start в Telegram боте
echo ===================================
pause
