# 🆓 Бесплатный хостинг для Blobis Web App

## Проблема с ngrok

ERR_NGROK_3200 означает, что туннель ngrok не работает. Причины:
- Туннель закрылся (бесплатный план имеет ограничения)
- Authtoken не настроен
- ngrok не запущен

**Решение: используйте бесплатный постоянный хостинг!**

---

## ✅ Рекомендуемые бесплатные хостинги

### 1. **Render.com** (Рекомендуется)

**Преимущества:**
- ✅ Бесплатно навсегда
- ✅ HTTPS из коробки
- ✅ Автоматический деплой из GitHub
- ✅ 750 часов в месяц бесплатно

**Как развернуть:**

1. Зарегистрируйтесь на https://render.com
2. Создайте новый Web Service
3. Подключите GitHub репозиторий
4. Настройки:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `python backend.py`
   - Environment Variables: добавьте переменные из .env
5. Deploy!

Вы получите URL типа: `https://blobis.onrender.com`

---

### 2. **Railway.app**

**Преимущества:**
- ✅ $5 бесплатно каждый месяц
- ✅ HTTPS автоматически
- ✅ Простой деплой

**Как развернуть:**

1. Зарегистрируйтесь на https://railway.app
2. New Project → Deploy from GitHub
3. Выберите репозиторий
4. Railway автоматически определит Python
5. Добавьте переменные окружения
6. Deploy!

---

### 3. **Fly.io**

**Преимущества:**
- ✅ Бесплатный tier
- ✅ Глобальная CDN
- ✅ HTTPS

**Как развернуть:**

1. Установите CLI: `curl -L https://fly.io/install.sh | sh`
2. Зарегистрируйтесь: `fly auth signup`
3. В папке проекта: `fly launch`
4. Следуйте инструкциям
5. Deploy: `fly deploy`

---

### 4. **PythonAnywhere** (Простейший)

**Преимущества:**
- ✅ Специально для Python
- ✅ Бесплатный tier
- ✅ Веб-интерфейс

**Как развернуть:**

1. Зарегистрируйтесь на https://www.pythonanywhere.com
2. Создайте Web App
3. Загрузите файлы через Files
4. Настройте WSGI
5. Reload!

---

### 5. **Glitch.com**

**Преимущества:**
- ✅ Полностью бесплатно
- ✅ Редактор кода в браузере
- ✅ Мгновенный деплой

**Как развернуть:**

1. Зайдите на https://glitch.com
2. New Project → Import from GitHub
3. Вставьте URL репозитория
4. Glitch автоматически запустит проект

---

## 🇺🇦 Украинские хостинги с .pp.ua

Ваш друг использует домен .pp.ua - это бесплатный украинский хостинг!

### **HostPro.ua**

**Бесплатный тариф:**
- ✅ Домен .pp.ua бесплатно
- ✅ 500 МБ места
- ✅ PHP/MySQL

**Проблема:** Не поддерживает Python напрямую

**Решение:** Используйте как прокси:
1. Разверните backend на Render/Railway
2. Настройте редирект с .pp.ua на ваш Render URL

---

## 📋 Пошаговая инструкция (Render.com)

### Шаг 1: Подготовка проекта

Создайте файл `render.yaml` в корне проекта:

```yaml
services:
  - type: web
    name: blobis-backend
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: python backend.py
    envVars:
      - key: TELEGRAM_BOT_TOKEN
        sync: false
      - key: SERVER_HOST
        value: 0.0.0.0
      - key: SERVER_PORT
        value: 8000
```

### Шаг 2: Загрузка на GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/ваш-username/blobis.git
git push -u origin main
```

### Шаг 3: Деплой на Render

1. Зайдите на https://render.com
2. New → Web Service
3. Connect GitHub → выберите репозиторий
4. Name: `blobis`
5. Build Command: `pip install -r requirements.txt`
6. Start Command: `python backend.py`
7. Add Environment Variable:
   - `TELEGRAM_BOT_TOKEN` = ваш токен
8. Create Web Service

### Шаг 4: Получение URL

После деплоя вы получите URL типа:
```
https://blobis.onrender.com
```

### Шаг 5: Настройка в BotFather

1. Откройте @BotFather
2. `/mybots` → ваш бот → Bot Settings → Menu Button
3. Configure menu button
4. Text: `🎮 Играть`
5. URL: `https://blobis.onrender.com/webapp`

### Шаг 6: Обновление .env

Добавьте в `.env`:
```
WEBAPP_URL=https://blobis.onrender.com
```

Перезапустите бота:
```bash
python start_all.py
```

---

## ⚡ Быстрый старт (без GitHub)

Если не хотите возиться с Git, используйте **Glitch**:

1. Зайдите на https://glitch.com
2. New Project → hello-webpage
3. Удалите все файлы
4. Загрузите ваши файлы (перетащите в браузер)
5. В терминале Glitch:
   ```bash
   pip install -r requirements.txt
   python backend.py
   ```
6. Glitch даст вам URL типа: `https://your-project.glitch.me`

---

## 🤖 Запуск бота

После деплоя backend на хостинг:

1. **Локально запустите только бота:**
   ```bash
   python telegram_bot.py
   ```

2. **Или используйте start_all.py** (backend будет локальный, но можно настроить на удаленный)

---

## 💡 Рекомендация

**Для вашего случая лучше всего:**

1. **Backend** → Render.com (бесплатно, HTTPS, надежно)
2. **Bot** → запускайте локально на вашем компьютере
3. **Web App** → будет доступен через Render URL

**Преимущества:**
- ✅ Бесплатно навсегда
- ✅ HTTPS для Mini App
- ✅ Не нужен ngrok
- ✅ Стабильный URL (не меняется)

---

## 🆘 Помощь

Если нужна помощь с деплоем:
1. Render.com документация: https://render.com/docs
2. Railway.app документация: https://docs.railway.app
3. Fly.io документация: https://fly.io/docs

**Удачи с деплоем! 🚀**