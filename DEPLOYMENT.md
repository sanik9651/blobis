# Руководство по развертыванию Blobis

## Требования

- Python 3.12+
- pip
- Telegram Bot Token

## Установка

### 1. Клонирование репозитория

```bash
cd /path/to/Blobis
```

### 2. Создание виртуального окружения

```bash
python3 -m venv venv
```

### 3. Активация виртуального окружения

**Linux/Mac:**
```bash
source venv/bin/activate
```

**Windows:**
```bash
venv\Scripts\activate
```

### 4. Установка зависимостей

```bash
pip install -r requirements.txt
```

### 5. Настройка переменных окружения

Создайте файл `.env` на основе `.env.example`:

```bash
cp .env.example .env
```

Отредактируйте `.env` и укажите:
- `TELEGRAM_BOT_TOKEN` - токен вашего Telegram бота (получите у @BotFather)
- `DATABASE_URL` - URL базы данных (по умолчанию SQLite: `sqlite:///./blobis.db`)

## Запуск

### Backend API

```bash
./venv/bin/python backend.py
```

Backend будет доступен по адресу: `http://localhost:8000`

API документация (Swagger): `http://localhost:8000/docs`

### Telegram Bot

В отдельном терминале:

```bash
./venv/bin/python telegram_bot.py
```

## Тестирование

### Проверка здоровья API

```bash
curl http://localhost:8000/api/health
```

### Создание пользователя

```bash
curl http://localhost:8000/api/user/YOUR_TELEGRAM_ID
```

### Начать рыбалку

```bash
curl -X POST http://localhost:8000/api/fish/YOUR_TELEGRAM_ID/cast
```

### Поймать рыбу

```bash
curl -X POST http://localhost:8000/api/fish/YOUR_TELEGRAM_ID/hook
```

### Просмотр инвентаря

```bash
curl http://localhost:8000/api/fish/YOUR_TELEGRAM_ID/inventory
```

## Структура проекта

```
Blobis/
├── backend.py          # FastAPI backend сервер
├── telegram_bot.py     # Telegram bot
├── models.py           # SQLAlchemy модели базы данных
├── database.py         # Настройка базы данных
├── config.py           # Конфигурация приложения
├── ai_utils.py         # AI генерация рыб
├── requirements.txt    # Python зависимости
├── .env               # Переменные окружения (не в git)
├── .env.example       # Пример переменных окружения
└── src/               # Frontend (React)
    ├── App.jsx
    ├── main.jsx
    └── components/
        └── VideoGenerator.jsx
```

## API Endpoints

### Пользователи
- `GET /api/user/{telegram_id}` - Получить информацию о пользователе
- `POST /api/user/{telegram_id}/update` - Обновить пользователя

### Рыбалка
- `POST /api/fish/{telegram_id}/cast` - Начать рыбалку
- `POST /api/fish/{telegram_id}/hook` - Поймать рыбу
- `GET /api/fish/{telegram_id}/inventory` - Просмотр инвентаря
- `POST /api/fish/{telegram_id}/auction/{fish_id}` - Выставить рыбу на аукцион

### Аукционы
- `GET /api/auction/active` - Активные аукционы
- `POST /api/auction/{auction_id}/bid` - Сделать ставку
- `POST /api/auction/{auction_id}/complete` - Завершить аукцион

### Квесты
- `GET /api/quests/{telegram_id}` - Получить квесты
- `POST /api/quests/{telegram_id}/update` - Обновить прогресс

### Локации
- `GET /api/locations` - Список локаций
- `POST /api/locations/{telegram_id}/change/{location_id}` - Сменить локацию

### Прочее
- `GET /api/leaderboard` - Таблица лидеров
- `GET /api/health` - Проверка здоровья сервера

## Troubleshooting

### Backend не запускается

1. Проверьте, что виртуальное окружение активировано
2. Убедитесь, что все зависимости установлены: `pip install -r requirements.txt`
3. Проверьте файл `.env` на наличие всех необходимых переменных

### Telegram bot не отвечает

1. Проверьте правильность `TELEGRAM_BOT_TOKEN` в `.env`
2. Убедитесь, что backend запущен и доступен
3. Проверьте логи бота на наличие ошибок

### База данных не создается

1. Убедитесь, что у вас есть права на запись в директорию проекта
2. Проверьте `DATABASE_URL` в `.env`
3. Для SQLite база создается автоматически при первом запуске

## Производственное развертывание

Для production рекомендуется:

1. Использовать PostgreSQL вместо SQLite
2. Настроить reverse proxy (nginx)
3. Использовать process manager (systemd, supervisor)
4. Настроить SSL/TLS сертификаты
5. Настроить мониторинг и логирование

## Поддержка

При возникновении проблем создайте issue в репозитории проекта.