@echo off
echo 🎣 BLOBIS - Setup Script
echo ========================
echo.

REM Проверка Python
echo ✓ Проверка Python...
python --version
if %errorlevel% neq 0 (
    echo ❌ Python не найден!
    exit /b 1
)

REM Проверка pip
echo ✓ Проверка pip...
pip --version
if %errorlevel% neq 0 (
    echo ❌ pip не найден!
    exit /b 1
)

REM Установка зависимостей
echo.
echo 📦 Установка зависимостей...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ❌ Ошибка при установке зависимостей!
    exit /b 1
)

REM Проверка .env файла
echo.
echo 🔧 Проверка .env файла...
if not exist .env (
    echo ⚠️  Файл .env не найден!
    echo Создаю .env из .env.example...
    copy .env.example .env
    echo ⚠️  Пожалуйста, отредактируй файл .env и добавь TELEGRAM_BOT_TOKEN!
    pause
    exit /b 1
)

echo.
echo ✅ Настройка завершена!
echo.
echo 🚀 Запуск проекта:
echo    1. Терминал 1: python backend.py
echo    2. Терминал 2: python telegram_bot.py
echo.
echo Или:
echo    uvicorn backend:app --reload
echo.
pause
