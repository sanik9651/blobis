# 🎣 BLOBIS - Инструкция по запуску

## 📋 Что нужно сделать

### 1️⃣ Установить зависимости

```bash
pip install -r requirements.txt
```

### 2️⃣ Настроить PostgreSQL

**Вариант А: Локальная установка**
```bash
# Установить PostgreSQL (если ещё нет)
# Создать базу данных:
createdb blobis_db
```

**Вариант Б: Docker (рекомендуется)**
```bash
docker run --name blobis-db -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres
```

### 3️⃣ Настроить переменные окружения

Открой файл `.env.example`, скопируй его в `.env` и заполни:

```env
# Получи токен у @BotFather в Telegram
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz

# База данных (по умолчанию подходит для Docker)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/blobis_db

# Опционально для AI генерации изображений
HF_API_TOKEN=

# Сервер
HOST=0.0.0.0
PORT=8000
ENVIRONMENT=development
```

**ВАЖНО:** Замени `TELEGRAM_BOT_TOKEN` на настоящий токен от @BotFather!

### 4️⃣ Запустить проект

#### Вариант А: Через графический интерфейс (Windows)

Просто запусти файл `run.bat` и выбери режим:
- 1 = Запустить только Backend
- 2 = Запустить только Telegram Bot  
- 3 = Запустить всё

#### Вариант Б: Через терминал

**Терминал 1 - Backend:**
```bash
python backend.py
```

Должно появиться: `✅ Database initialized`

**Терминал 2 - Telegram Bot:**
```bash
python telegram_bot.py
```

Должно появиться: `🤖 Blobis Bot is running...`

### 5️⃣ Протестировать

1. Открой Telegram
2. Найди своего бота (по имени, которое дал @BotFather)
3. Напиши `/start`
4. Играй! 🎣

## 🔍 Проверка работы

### Backend

Открой в браузере:
- `http://localhost:8000` - Главная страница
- `http://localhost:8000/docs` - Swagger UI (документация API)
- `http://localhost:8000/api/health` - Health check

Должно вернуться: `{"status": "ok"}`

### Telegram Bot

Напиши `/start` боту - должно появиться приветственное сообщение с кнопками.

## 🐛 Частые проблемы

### ❌ "ModuleNotFoundError: No module named 'fastapi'"

**Решение:**
```bash
pip install -r requirements.txt
```

### ❌ "Database connection error"

**Решение:**
1. Проверь, что PostgreSQL запущен
2. Проверь `DATABASE_URL` в `.env`
3. Убедись, что база данных `blobis_db` создана

### ❌ "Telegram bot не отвечает"

**Решение:**
1. Проверь `TELEGRAM_BOT_TOKEN` в `.env`
2. Убедись, что токен правильный (попробуй открыть `https://api.telegram.org/bot<ТВОЙ_ТОКЕН>/getMe`)
3. Перезапусти бота

### ❌ "Port 8000 is already in use"

**Решение:**
1. Измени порт в `.env`: `PORT=8001`
2. Или закрой процесс, использующий порт 8000

## 📊 Структура файлов

```
blobis/
├── backend.py          # FastAPI сервер (запуск: python backend.py)
├── telegram_bot.py     # Telegram бот (запуск: python telegram_bot.py)
├── main.py            # Точка входа
├── config.py          # Конфигурация
├── database.py        # Подключение к БД
├── models.py          # Базы данных (таблицы)
├── requirements.txt   # Зависимости Python
├── .env              # Переменные окружения (СЮДА ВСТАВИТЬ ТОКЕН!)
├── .env.example      # Пример .env
├── run.bat           # Запуск на Windows
├── setup.bat         # Установка на Windows
├── README.md         # Документация
└── GAME_DESIGN_DOCUMENT.md  # ТЗ
```

## 🎮 Как играть

1. **Отправь `/start`** боту
2. **Нажми "Начать рыбалку"**
3. **Жди поклевку** (3-15 секунд)
4. **Нажми "Подсечь!"** когда появится поклевка
5. **Поймай уникальную рыбу!** 🐟
6. **Выставь на аукцион** или сохрани в инвентаре

## 🎯 Следующие шаги

После того как всё заработало:

1. **Добавь AI генерацию изображений** - используй Hugging Face API
2. **Настрой WebSocket** для real-time обновлений
3. **Добавь красивые UI элементы** в Telegram Web App
4. **Разверни на production** (Railway, Render, Heroku)

## 📞 Помощь

Если что-то не работает:
1. Проверь логи в терминале
2. Посмотри Swagger UI (`/docs`) для тестирования API
3. Убедись, что все зависимости установлены

---

**Удачной рыбалки!** 🎣🐟
