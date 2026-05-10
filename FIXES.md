# Исправления от 2026-05-10

## Исправленные проблемы

### 1. ✅ Deprecation Warnings
- **datetime.utcnow()** → `datetime.now(timezone.utc)` (backend.py)
- **@app.on_event()** → `lifespan` context manager (backend.py)

### 2. ✅ BLOB Balance Tracking
- Добавлено поле `blob_balance` в модель User (models.py)
- Добавлены функции `add_blob()` и `get_blob_balance()` в crud.py
- Обновлен API endpoint `/api/market/trade` для корректного учета BLOB баланса
- Добавлен новый endpoint `/api/user/{user_id}/balance` для получения балансов
- Создан скрипт миграции `migrate_add_blob_balance.py`

### 3. ✅ CandlestickChart Rendering
- Исправлена ошибка с undefined `maxPrice` в функции `drawCandle()`
- Добавлен параметр `maxPrice` в сигнатуру функции

### 4. ✅ Frontend Balance Management
- Обновлен `useBalance.js` для загрузки баланса из backend API
- Добавлена функция `refreshBalance()` для синхронизации после трейдов
- Улучшена обработка ошибок в `TradingTerminal.jsx`

### 5. ✅ Admin Panel
- Добавлено отображение `blob_balance` в `/api/admin/users`
- Обновлена схема User в schemas.py

## Что было исправлено в логах

### До:
```
DeprecationWarning: datetime.datetime.utcnow() is deprecated
DeprecationWarning: on_event is deprecated, use lifespan event handlers
INFO: "POST /api/market/trade HTTP/1.1" 422 Unprocessable Content
INFO: "POST /api/market/trade HTTP/1.1" 400 Bad Request
```

### После:
- ✅ Нет deprecation warnings
- ✅ Корректная валидация трейдов
- ✅ Правильное отслеживание BLOB баланса
- ✅ График цены работает без ошибок

## Миграция базы данных

Для существующих баз данных запустите:
```bash
python migrate_add_blob_balance.py
```

Миграция автоматически:
- Добавляет колонку `blob_balance` в таблицу `users`
- Инициализирует значение 0 для всех существующих пользователей
- Безопасна для повторного запуска

## Новые API Endpoints

### GET /api/user/{user_id}/balance
Возвращает балансы пользователя:
```json
{
  "user_id": 123,
  "balance_bc": 1000.0,
  "balance_blob": 0.5
}
```

## Тестирование

1. Запустите сервер: `python backend.py`
2. Откройте браузер: `http://localhost:8000`
3. Проверьте:
   - ✅ График цены отображается
   - ✅ Трейды выполняются корректно
   - ✅ Баланс BC и BLOB обновляется
   - ✅ Админ панель показывает оба баланса
   - ✅ Нет ошибок в консоли

## Deployment на Render.com

Все изменения совместимы с Render.com:
- Миграция выполнится автоматически при первом запуске
- Статические файлы обновлены в `dist/`
- Все пути корректны для production
