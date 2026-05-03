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
3. **Frontend** (React) - Web-интерфейс для Telegram Web App

## 📋 Требования

- Python 3.12+
- pip
- Telegram Bot Token (получите у [@BotFather](https://t.me/BotFather))

## 🚀 Деплой на Render.com (Бесплатно 24/7)

Проект полностью настроен для работы на **Render.com**.

1. **GitHub**: Убедитесь, что ваш код загружен в репозиторий [https://github.com/sanik9651/blobis](https://github.com/sanik9651/blobis).
2. **Создание Web Service**:
   - Зайдите в [Render Dashboard](https://dashboard.render.com/).
   - Нажмите **New +** -> **Web Service**.
   - Подключите ваш репозиторий `blobis`.
   - Render автоматически подхватит настройки из файла `render.yaml`.
3. **Настройка Переменных (Environment Variables)**:
   В настройках сервиса на Render добавьте:
   - `TELEGRAM_BOT_TOKEN`: Токен вашего бота от @BotFather.
   - `WEBAPP_URL`: URL, который выдаст Render (например, `https://blobis-backend.onrender.com`).
   - `DATABASE_URL`: Можно оставить пустым (будет использован SQLite) или подключить внешнюю PostgreSQL.

## 🛠 Настройка Menu Button в Telegram

Чтобы игра открывалась по нажатию кнопки в меню бота:

1. Напишите [@BotFather](https://t.me/BotFather).
2. Выберите вашего бота: `/mybots` -> `@YourBotName`.
3. Перейдите в **Bot Settings** -> **Menu Button** -> **Configure menu button**.
4. Отправьте ссылку на ваше приложение: `https://your-render-url.onrender.com/webapp`.
5. Введите название кнопки: `🎮 Играть в Blobis`.

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
 
 Для запуска всех компонентов используйте `start_all.py`:
 ```bash
 ./venv/bin/python start_all.py
 ```
 
 Backend будет доступен на `http://localhost:8000`, Web App на `http://localhost:8000/webapp`.
 
 **Важно:** Для полноценной работы Telegram Web App нужен публичный HTTPS URL. Вы можете использовать `ngrok` для локальной разработки или развернуть проект на хостинге. Подробнее см. `DEPLOYMENT.md`.
 
 После запуска, откройте вашего бота в Telegram и отправьте команду `/start`\\.
 
 **Установка Web App Menu Button:**
 В @BotFather используйте команду `/setwebapp` для вашего бота, выберите его, затем вставьте URL вашего Web App (например, `https://yourdomain.com/webapp` или ваш ngrok URL). Задайте текст кнопки, например, "Играть в Blobis".

## 📚 Документация

- [Руководство по развертыванию](DEPLOYMENT.md)
- [Дизайн-документ игры](GAME_DESIGN_DOCUMENT.md)
- [API документация](http://localhost:8000/docs) (после запуска backend)

## 🎯 Игровой процесс (через Telegram Web App)
 
 1. **Начните игру** - Откройте Web App через кнопку "Играть в Blobis" в меню бота или по команде `/start`.
 2. **Рыбачьте** - В Web App нажимайте кнопку "🎣 Рыбачить", ждите поклевку и подсекайте.
 3. **Прокачивайтесь** - Повышайте уровень, получайте монеты и открывайте новые локации.
 4. **Управляйте инвентарем** - Просматривайте пойманную рыбу.
 5. **Торгуйте на аукционе** - Выставляйте редкую рыбу на продажу или покупайте у других игроков.
 6. **Выполняйте квесты** - Получайте ежедневные награды.

## 🗺️ Локации
 
 | Локация | Уровень | Множитель | Биом |
 |---------|---------|-----------|------|
 | Речной берег | 1 | 1.0x | river |
 | Озеро у леса | 5 | 1.5x | lake |
 | Горная река | 10 | 2.0x | mountain |
 | Болотные топи | 15 | 2.5x | swamp |
 | Океанский берег | 20 | 3.0x | ocean |
 | Подводная пещера | 30 | 5.0x | cave |

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

## 🧪 Тестирование (через API)
 
 ```bash
 # Проверка здоровья API
 curl http://localhost:8000/api/health
 
 # Получить или создать пользователя
 curl http://localhost:8000/api/user/123456789
 
 # Начать рыбалку (для пользователя 123456789)
 curl -X POST http://localhost:8000/api/fish/123456789/cast
 
 # Поймать рыбу (для пользователя 123456789)
 curl -X POST http://localhost:8000/api/fish/123456789/hook
 ```
 
 **Тестирование Web App:**
 Откройте `http://localhost:8000/webapp` в браузере. Для полной функциональности используйте Web App внутри Telegram.

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
 
 - Telegram: [@Blobis_game_bot](https://t.me/Blobis_game_bot)
 - Email: support@blobis.game

---

**Приятной рыбалки! 🎣**