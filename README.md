# 🎣 Blobis - Telegram Fishing Game

Blobis - это увлекательная игра-рыбалка в Telegram с элементами коллекционирования, аукционов и соревнований.

## 🎮 Особенности

- **Рыбалка в реальном времени** - Забрасывайте удочку и ловите уникальных рыб
- **AI-генерация рыб** - Каждая рыба уникальна благодаря AI
- **Система редкости** - Common, Rare, Epic, Legendary, Mythical
- **Множество локаций** - Река, озеро, горы, болото, океан, пещера
- **Аукционная система** - Продавайте редких рыб другим игрокам
- **Система квестов** - Выполняйте задания и получайте награды
- **Прогрессия** - Повышайте уровень и открывайте новые локации
- **Турниры** - Соревнуйтесь с другими игроками
- **Таблица лидеров** - Станьте лучшим рыбаком
- **Система комбо** - Ловите рыбу подряд для бонусов
- **Улучшения** - Прокачивайте скорость клёва, шанс критического улова и другое

## 🏗️ Архитектура

Проект состоит из трёх основных компонентов:

1. **Backend API** (FastAPI) - REST API для игровой логики
2. **Telegram Bot** (python-telegram-bot) - Интерфейс для игроков
3. **Frontend** (React) - Web-интерфейс (опционально)

## 📋 Требования

- Python 3.12+
- pip
- Telegram Bot Token (получите у [@BotFather](https://t.me/BotFather))

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
# Создайте виртуальное окружение
python3 -m venv venv

# Активируйте его
source venv/bin/activate  # Linux/Mac
# или
venv\Scripts\activate  # Windows

# Установите зависимости
pip install -r requirements.txt
```

### 2. Настройка

Создайте файл `.env`:

```bash
cp .env.example .env
```

Отредактируйте `.env` и укажите ваш Telegram Bot Token:

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
DATABASE_URL=sqlite:///./blobis.db
```

### 3. Запуск

**Backend:**
```bash
./venv/bin/python backend.py
```

Backend будет доступен на `http://localhost:8000`

**Telegram Bot:**
```bash
./venv/bin/python telegram_bot.py
```

## 📚 Документация

- [Руководство по развертыванию](DEPLOYMENT.md)
- [Дизайн-документ игры](GAME_DESIGN_DOCUMENT.md)
- [API документация](http://localhost:8000/docs) (после запуска backend)

## 🎯 Игровой процесс

1. **Начните игру** - Напишите `/start` боту в Telegram
2. **Забросьте удочку** - Нажмите кнопку "🎣 Рыбачить"
3. **Подождите клёва** - Время ожидания зависит от локации и улучшений
4. **Подсеките рыбу** - Нажмите кнопку вовремя
5. **Соберите коллекцию** - Ловите редких рыб
6. **Продавайте на аукционе** - Зарабатывайте монеты
7. **Улучшайтесь** - Покупайте апгрейды
8. **Исследуйте локации** - Открывайте новые места для рыбалки

## 🗺️ Локации

| Локация | Уровень | Множитель | Биом |
|---------|---------|-----------|------|
| Речной берег | 1 | 1.0x | river |
| Лесное озеро | 5 | 1.5x | lake |
| Горная река | 10 | 2.0x | mountain |
| Тёмное болото | 15 | 2.5x | swamp |
| Открытый океан | 20 | 3.0x | ocean |
| Подземная пещера | 30 | 5.0x | cave |

## 🐟 Редкость рыб

- **Common** (Обычная) - 60% шанс
- **Rare** (Редкая) - 25% шанс
- **Epic** (Эпическая) - 10% шанс
- **Legendary** (Легендарная) - 4% шанс
- **Mythical** (Мифическая) - 1% шанс

## 🛠️ Технологии

- **Backend**: FastAPI, SQLAlchemy, Uvicorn
- **Bot**: python-telegram-bot
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **AI**: Hugging Face (опционально)
- **Frontend**: React, Vite

## 📊 API Endpoints

### Основные endpoints:

- `GET /api/health` - Проверка здоровья сервера
- `GET /api/user/{telegram_id}` - Информация о пользователе
- `POST /api/fish/{telegram_id}/cast` - Начать рыбалку
- `POST /api/fish/{telegram_id}/hook` - Поймать рыбу
- `GET /api/fish/{telegram_id}/inventory` - Инвентарь
- `GET /api/auction/active` - Активные аукционы
- `GET /api/locations` - Список локаций
- `GET /api/leaderboard` - Таблица лидеров

Полная документация доступна на `/docs` после запуска backend.

## 🧪 Тестирование

```bash
# Проверка здоровья API
curl http://localhost:8000/api/health

# Создание пользователя
curl http://localhost:8000/api/user/123456789

# Начать рыбалку
curl -X POST http://localhost:8000/api/fish/123456789/cast

# Поймать рыбу
curl -X POST http://localhost:8000/api/fish/123456789/hook
```

## 🤝 Вклад в проект

Мы приветствуем вклад в развитие проекта! Пожалуйста:

1. Форкните репозиторий
2. Создайте ветку для вашей функции (`git checkout -b feature/AmazingFeature`)
3. Закоммитьте изменения (`git commit -m 'Add some AmazingFeature'`)
4. Запушьте в ветку (`git push origin feature/AmazingFeature`)
5. Откройте Pull Request

## 📝 Лицензия

Этот проект распространяется под лицензией MIT.

## 👥 Авторы

- Разработка и дизайн - Blobis Team

## 🐛 Сообщить о проблеме

Если вы нашли баг или у вас есть предложение, создайте [issue](https://github.com/yourusername/blobis/issues).

## 📞 Контакты

- Telegram: [@your_bot](https://t.me/your_bot)
- Email: support@blobis.game

---

**Приятной рыбалки! 🎣**