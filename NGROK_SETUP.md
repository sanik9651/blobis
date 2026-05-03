# Настройка ngrok для Mini App

## Проблема
ngrok требует авторизации для работы. Без authtoken туннель не запустится.

## Решение

### Шаг 1: Регистрация на ngrok

1. Перейдите на https://dashboard.ngrok.com/signup
2. Зарегистрируйтесь (можно через GitHub/Google)
3. Подтвердите email

### Шаг 2: Получение authtoken

1. Войдите в https://dashboard.ngrok.com
2. Перейдите в раздел "Your Authtoken"
3. Скопируйте ваш authtoken

### Шаг 3: Настройка ngrok

```bash
ngrok config add-authtoken ВАШ_ТОКЕН_ЗДЕСЬ
```

### Шаг 4: Запуск туннеля

```bash
ngrok http 8000
```

Вы увидите что-то вроде:
```
Forwarding  https://abc123.ngrok-free.app -> http://localhost:8000
```

### Шаг 5: Копирование HTTPS URL

Скопируйте HTTPS URL (например: `https://abc123.ngrok-free.app`)

### Шаг 6: Настройка в BotFather

1. Откройте @BotFather в Telegram
2. Отправьте `/mybots`
3. Выберите вашего бота
4. Нажмите `Bot Settings` → `Menu Button`
5. Выберите `Configure menu button`
6. Введите текст: `🎮 Играть`
7. Введите URL: `https://abc123.ngrok-free.app/webapp`

### Шаг 7: Тестирование

1. Откройте вашего бота в Telegram
2. Нажмите кнопку меню (≡) рядом с полем ввода
3. Нажмите "🎮 Играть"
4. Mini App должен открыться!

## Альтернатива: Использование без Mini App

Если не хотите настраивать ngrok, можете использовать бота через inline кнопки:

1. Откройте бота
2. Отправьте `/start`
3. Используйте кнопки:
   - 🎣 Начать рыбалку
   - 🎒 Мой инвентарь
   - 🏪 Аукцион
   - 📊 Лидерборд

## Troubleshooting

### ngrok не запускается
```bash
# Проверьте версию
ngrok version

# Проверьте конфигурацию
ngrok config check

# Посмотрите логи
cat ~/.ngrok2/ngrok.log
```

### Туннель закрывается
- Бесплатный план ngrok имеет ограничения
- Туннель закрывается при неактивности
- Нужно перезапускать ngrok и обновлять URL в BotFather

### Mini App не открывается
1. Проверьте, что backend запущен: `curl http://localhost:8000/api/health`
2. Проверьте, что ngrok работает: `curl https://ваш-url.ngrok-free.app/api/health`
3. Проверьте URL в BotFather - должен быть HTTPS

## Production решение

Для production рекомендуется:
1. VPS с публичным IP
2. Домен с SSL сертификатом
3. Nginx как reverse proxy

См. DEPLOYMENT.md для подробностей.