# Настройка Telegram Bot для Blobis

## Шаг 1: Создание бота (если ещё не создан)

1. Откройте [@BotFather](https://t.me/BotFather) в Telegram
2. Отправьте команду `/newbot`
3. Введите имя бота (например: `Blobis Fishing Game`)
4. Введите username бота (например: `BlobisGameBot`)
5. Скопируйте полученный токен

## Шаг 2: Настройка Mini App (Web App)

### Вариант 1: Через команду /newapp (рекомендуется)

1. Откройте [@BotFather](https://t.me/BotFather)
2. Отправьте команду `/newapp`
3. Выберите вашего бота из списка
4. Введите название приложения: `Blobis Fishing`
5. Введите описание: `Увлекательная игра-рыбалка с AI-генерацией уникальных рыб`
6. Загрузите иконку приложения (512x512 px, квадратная)
7. Загрузите GIF демонстрацию (опционально)
8. Введите URL вашего Web App:
   - **Для локального тестирования**: используйте ngrok (см. ниже)
   - **Для production**: `https://your-domain.com/webapp`

### Вариант 2: Через Menu Button

1. Откройте [@BotFather](https://t.me/BotFather)
2. Отправьте команду `/mybots`
3. Выберите вашего бота
4. Нажмите `Bot Settings` → `Menu Button`
5. Выберите `Configure menu button`
6. Введите текст кнопки: `🎮 Играть`
7. Введите URL: `https://your-domain.com/webapp`

## Шаг 3: Локальное тестирование с ngrok

Для тестирования Web App локально нужен публичный URL. Используйте ngrok:

### Установка ngrok

```bash
# Linux
wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz
tar xvzf ngrok-v3-stable-linux-amd64.tgz
sudo mv ngrok /usr/local/bin/

# Или через snap
sudo snap install ngrok
```

### Использование ngrok

1. Зарегистрируйтесь на [ngrok.com](https://ngrok.com)
2. Получите authtoken
3. Настройте ngrok:
```bash
ngrok config add-authtoken YOUR_AUTHTOKEN
```

4. Запустите туннель:
```bash
ngrok http 8000
```

5. Скопируйте публичный URL (например: `https://abc123.ngrok.io`)
6. Используйте этот URL в BotFather: `https://abc123.ngrok.io/webapp`

## Шаг 4: Обновление конфигурации

Обновите файл `.env`:

```env
TELEGRAM_BOT_TOKEN=ваш_токен_от_BotFather
DATABASE_URL=sqlite:///./blobis.db
SERVER_HOST=0.0.0.0
SERVER_PORT=8000
```

## Шаг 5: Запуск приложения

### Терминал 1 - Backend
```bash
source venv/bin/activate
python backend.py
```

### Терминал 2 - Telegram Bot
```bash
source venv/bin/activate
python telegram_bot.py
```

### Терминал 3 - ngrok (для локального тестирования)
```bash
ngrok http 8000
```

## Шаг 6: Тестирование

1. Откройте вашего бота в Telegram
2. Отправьте `/start`
3. Нажмите кнопку "🎮 Открыть игру"
4. Web App должен открыться внутри Telegram!

## Альтернатива: Тестирование без Mini App

Если не хотите настраивать Mini App, можете использовать inline кнопки:

1. Откройте бота
2. Отправьте `/start`
3. Используйте кнопки:
   - 🎣 Начать рыбалку
   - 🎒 Мой инвентарь
   - 🏪 Аукцион
   - 📊 Лидерборд

## Production развертывание

Для production рекомендуется:

1. **Хостинг**: VPS (DigitalOcean, AWS, Hetzner)
2. **Домен**: Купите домен и настройте DNS
3. **SSL**: Используйте Let's Encrypt (certbot)
4. **Reverse Proxy**: Настройте nginx
5. **Process Manager**: Используйте systemd или supervisor
6. **База данных**: Переключитесь на PostgreSQL

### Пример nginx конфигурации

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Troubleshooting

### Web App не открывается

1. Проверьте, что backend запущен и доступен
2. Проверьте URL в BotFather
3. Убедитесь, что ngrok работает (для локального тестирования)
4. Проверьте логи backend на наличие ошибок

### Бот не отвечает

1. Проверьте правильность токена в `.env`
2. Убедитесь, что `telegram_bot.py` запущен
3. Проверьте логи бота

### База данных не создается

1. Проверьте права на запись в директорию
2. Убедитесь, что `DATABASE_URL` правильный
3. База SQLite создается автоматически при первом запуске

## Полезные ссылки

- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Telegram Web Apps](https://core.telegram.org/bots/webapps)
- [ngrok Documentation](https://ngrok.com/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)

---

**Готово! Теперь можно тестировать игру! 🎣**