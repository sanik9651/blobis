@echo off
echo ===================================
echo 🎣 BLOBIS - Game Launcher
echo ===================================
echo.

REM Проверка Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python не найден!
    pause
    exit /b 1
)

echo.
echo Выбери режим запуска:
echo.
echo 1. Запустить Backend (FastAPI)
echo 2. Запустить Telegram Bot
echo 3. Запустить ВСЁ (Backend + Bot)
echo.
set /p choice="Введите номер (1/2/3): "

if "%choice%"=="1" (
    echo.
    echo 🚀 Запуск Backend...
    echo Сервер запустится на http://localhost:8000
    echo Swagger UI: http://localhost:8000/docs
    echo.
    python backend.py
    goto end
)

if "%choice%"=="2" (
    echo.
    echo 🤖 Запуск Telegram Bot...
    echo.
    python telegram_bot.py
    goto end
)

if "%choice%"=="3" (
    echo.
    echo 🚀 Запуск ВСЕГО...
    echo.
    echo Откроешь 2 терминала:
    echo Терминал 1: python backend.py
    echo Терминал 2: python telegram_bot.py
    echo.
    echo Или используй отдельные окна терминала!
    echo.
    
    REM Запускаем backend в фоновом режиме
    start "BLOBIS Backend" cmd /k "python backend.py"
    timeout /t 3 /nobreak >nul
    
    echo.
    echo Запуск Telegram Bot...
    python telegram_bot.py
    goto end
)

echo.
echo ❌ Неверный выбор!
echo.

:end
pause
