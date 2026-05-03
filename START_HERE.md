# 🎣 BLOBIS - Быстрый старт

## 🚀 САМЫЙ ПРОСТОЙ ЗАПУСК - ОДНОЙ КОМАНДОЙ!

```bash
python start_all.py
```

Эта команда запустит:
- ✅ Backend сервер (http://localhost:8000)
- ✅ Telegram бота
- ✅ Все в одном окне с логами

**Для остановки:** нажмите `Ctrl+C`

---

## 🌐 Способ 1: Тестирование в браузере (самый быстрый)

Откройте в браузере:
```
http://localhost:8000/webapp
```

Вы увидите полноценное web-приложение игры!

---

## 🤖 Способ 2: Telegram Bot с inline кнопками

### Запуск бота:
```bash
cd /media/sanik/2256C00A56BFDCAB/PyProjects/Blobis
source venv/bin/activate
python telegram_bot.py
```

### Тестирование:
1. Откройте вашего бота в Telegram
2. Отправьте `/start`
3. Используйте кнопки:
   - 🎣 Начать рыбалку
   - 🎒 Мой инвентарь
   - 🏪 Аукцион
   - 📊 Лидерборд

---

## 📱 Способ 3: Mini App в Telegram (БЕСПЛАТНЫЙ ХОСТИНГ!)

### ⚠️ Проблема с ngrok (ERR_NGROK_3200)

Если вы видите ошибку ERR_NGROK_3200 - это значит туннель ngrok не работает.

### ✅ РЕШЕНИЕ: Бесплатный постоянный хостинг!

**Рекомендуется: Render.com** (бесплатно навсегда, HTTPS, стабильный URL)

#### Быстрая настройка (10 минут):

1. **Зарегистрируйтесь на Render.com:**
   - Перейдите: https://render.com
   - Зарегистрируйтесь через GitHub

2. **Загрузите проект на GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/ваш-username/blobis.git
   git push -u origin main
   ```

3. **Создайте Web Service на Render:**
   - New → Web Service
   - Connect GitHub → выберите репозиторий
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `python backend.py`
   - Добавьте переменные окружения (TELEGRAM_BOT_TOKEN)
   - Deploy!

4. **Получите URL:**
   - После деплоя: `https://blobis.onrender.com`

5. **Настройте в BotFather:**
   - @BotFather → /mybots → Bot Settings → Menu Button
   - Text: `🎮 Играть`
   - URL: `https://blobis.onrender.com/webapp`

6. **Обновите .env:**
   ```bash
   echo "WEBAPP_URL=https://blobis.onrender.com" >> .env
   ```

7. **Перезапустите бота:**
   ```bash
   python start_all.py
   ```

**Подробная инструкция:** **FREE_HOSTING.md**

### Альтернативы:
- Railway.app ($5/месяц бесплатно)
- Fly.io (бесплатный tier)
- Glitch.com (без GitHub, просто загрузите файлы)

**Все с HTTPS и бесплатно!**

---

## 🎮 Что можно тестировать:

### Игровая механика:
- ✅ Рыбалка с системой ожидания поклевки
- ✅ 5 уровней редкости рыб (обычная → мифическая)
- ✅ Система комбо (3/5/10 рыб подряд)
- ✅ Критические уловы (x1.5 к ценности)
- ✅ Особые эффекты у редких рыб

### Прогрессия:
- ✅ Система уровней и опыта
- ✅ Монеты за каждую рыбу
- ✅ 6 локаций (открываются по уровню)
- ✅ Инвентарь с ограничением

### Социальное:
- ✅ Аукцион для торговли
- ✅ Лидерборд игроков
- ✅ Ежедневные квесты

### Web интерфейс:
- ✅ Адаптивный дизайн
- ✅ Красивые градиенты
- ✅ Интеграция с Telegram Web App API
- ✅ Рыбалка в реальном времени

---

## 🔧 Проверка работы:

### Backend:
```bash
curl http://localhost:8000/api/health
# Должно вернуть: {"status":"ok","timestamp":"..."}
```

### Web App:
```bash
curl http://localhost:8000/webapp | head -5
# Должно вернуть HTML код
```

### API тест:
```bash
# Создать пользователя
curl -X POST http://localhost:8000/api/user/test123/update \
  -H "Content-Type: application/json" \
  -d '{"username":"TestUser"}'

# Начать рыбалку
curl -X POST http://localhost:8000/api/fish/test123/cast

# Подсечь рыбу
curl -X POST http://localhost:8000/api/fish/test123/hook
```

---

## 📚 Документация:

- **README.md** - общая информация о проекте
- **QUICKSTART.md** - быстрый старт для разработчиков
- **TELEGRAM_SETUP.md** - настройка Telegram бота
- **NGROK_SETUP.md** - настройка Mini App через ngrok
- **DEPLOYMENT.md** - развертывание на production
- **setup_miniapp.sh** - автоматическая настройка Mini App

---

## ❓ Проблемы?

### Backend не отвечает:
```bash
# Проверьте процесс
ps aux | grep "python.*backend.py"

# Перезапустите
cd /media/sanik/2256C00A56BFDCAB/PyProjects/Blobis
source venv/bin/activate
python backend.py
```

### Бот не отвечает:
- Проверьте токен в `.env`
- Убедитесь что backend запущен
- Проверьте логи бота

### Mini App не открывается:
- Убедитесь что используете HTTPS URL (через ngrok)
- Проверьте настройки в BotFather
- См. NGROK_SETUP.md

---

## 🎯 Рекомендуемый порядок тестирования:

1. **Сначала**: Откройте http://localhost:8000/webapp в браузере
2. **Затем**: Запустите бота и протестируйте inline кнопки
3. **Опционально**: Настройте Mini App через ngrok

**Приятной игры! 🎣**