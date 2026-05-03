# 🚀 Быстрый старт Blobis

## Минимальная инструкция для запуска

### 1. Установка (5 минут)

```bash
# Создайте виртуальное окружение
python3 -m venv venv

# Активируйте его
source venv/bin/activate  # Linux/Mac
# или venv\Scripts\activate для Windows

# Установите зависимости
pip install -r requirements.txt
```

### 2. Настройка (2 минуты)

Создайте файл `.env` и добавьте ваш Telegram Bot Token:

```env
TELEGRAM_BOT_TOKEN=ваш_токен_от_BotFather
DATABASE_URL=sqlite:///./blobis.db
```

**Как получить токен:**
1. Откройте [@BotFather](https://t.me/BotFather) в Telegram
2. Отправьте `/newbot`
3. Следуйте инструкциям
4. Скопируйте полученный токен в `.env`

### 3. Запуск (1 минута)

**Терминал 1 - Backend:**
```bash
./venv/bin/python backend.py
```

**Терминал 2 - Telegram Bot:**
```bash
./venv/bin/python telegram_bot.py
```

### 4. Проверка

1. Откройте вашего бота в Telegram
2. Отправьте `/start`
3. Начните рыбачить! 🎣

## Готово! 🎉

Backend работает на: `http://localhost:8000`  
API документация: `http://localhost:8000/docs`

## Что дальше?

- Прочитайте [README.md](README.md) для полной информации
- Изучите [DEPLOYMENT.md](DEPLOYMENT.md) для production развертывания
- Посмотрите [GAME_DESIGN_DOCUMENT.md](GAME_DESIGN_DOCUMENT.md) для понимания игровой механики

## Проблемы?

**Backend не запускается:**
```bash
# Проверьте, что venv активирован
which python  # должен показать путь к venv/bin/python

# Переустановите зависимости
pip install -r requirements.txt --force-reinstall
```

**Bot не отвечает:**
- Проверьте правильность токена в `.env`
- Убедитесь, что backend запущен
- Проверьте логи в терминале

**База данных:**
- SQLite база создается автоматически при первом запуске
- Файл: `blobis.db` в корне проекта

## Тестирование API

```bash
# Проверка здоровья
curl http://localhost:8000/api/health

# Создание пользователя
curl http://localhost:8000/api/user/123456789

# Рыбалка
curl -X POST http://localhost:8000/api/fish/123456789/cast
curl -X POST http://localhost:8000/api/fish/123456789/hook
```

---

**Приятной рыбалки! 🎣**