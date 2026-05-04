import logging
import os
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, ContextTypes
import aiohttp
from config import TELEGRAM_BOT_TOKEN, WEBAPP_URL, WEBHOOK_URL, WEBHOOK_PATH, WEBHOOK_SECRET

# Logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Для Web App кнопки нужен HTTPS URL
# Если WEBAPP_URL не HTTPS, используем явный URL
if WEBAPP_URL and WEBAPP_URL.startswith("https://"):
    WEB_APP_URL = WEBAPP_URL
else:
    # Fallback для продакшена
    WEB_APP_URL = os.getenv("WEBAPP_URL", "https://blobis-gqla.onrender.com")
    logger.warning(f"WEBAPP_URL is not HTTPS ({WEBAPP_URL}), using fallback: {WEB_APP_URL}")

API_BASE_URL = WEB_APP_URL  # Используем для доступа к бэкенду

# Инициализация приложения Telegram Bot
application = Application.builder().token(TELEGRAM_BOT_TOKEN).build()

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Команда /start - Приветствие и кнопка Web App"""
    user = update.effective_user

    welcome_text = (
        f"🎣 *Добро пожаловать в BLOBIS\\!* 🐟\n\n"
        f"Привет, {user.first_name}\\!\n\n"
        "Это игра про рыбалку с AI\\-генерацией уникальных рыб\\.\n\n"
        "⚠️ *Весь игровой процесс перенесен в Web App\\.*\n"
        "Нажми на кнопку ниже, чтобы начать рыбачить, торговать на аукционе и выполнять квесты\\!"
    )

    keyboard = [
        [InlineKeyboardButton("🎮 Играть в Blobis", web_app=WebAppInfo(url=f"{WEB_APP_URL}/webapp/"))]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)

    await update.message.reply_text(welcome_text, reply_markup=reply_markup, parse_mode='MarkdownV2')

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Команда /help"""
    help_text = (
        "❓ *Как играть в Blobis?*\n\n"
        "1\\. Нажми кнопку *Играть* в меню бота или в приветственном сообщении\\.\n"
        "2\\. В открывшемся окне нажимай кнопку *Рыбачить*\\.\n"
        "3\\. Собирай улов, повышай уровень и зарабатывай монеты\\!\n\n"
        "Все функции (инвентарь, аукцион, лидерборд) доступны внутри игрового интерфейса\\."
    )
    await update.message.reply_text(help_text, parse_mode="MarkdownV2")

def setup_bot():
    """Настройка обработчиков команд бота."""
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help_command))
    return application

async def start_webhook_bot():
    """Запуск бота в режиме вебхуков."""
    if not TELEGRAM_BOT_TOKEN:
        logger.error("TELEGRAM_BOT_TOKEN не найден!")
        raise ValueError("TELEGRAM_BOT_TOKEN is required")

    # Проверяем, что WEBHOOK_URL это HTTPS
    if not WEBHOOK_URL or not WEBHOOK_URL.startswith("https://"):
        logger.error(f"WEBHOOK_URL должен быть HTTPS! Текущее значение: {WEBHOOK_URL}")
        logger.error("Установите переменную окружения WEBHOOK_URL с https:// адресом")
        logger.error("Например: WEBHOOK_URL=https://blobis-gqla.onrender.com/webhook")
        raise ValueError("WEBHOOK_URL must be HTTPS")

    # Инициализируем application
    await application.initialize()

    logger.info(f"Setting webhook for bot to {WEBHOOK_URL}")
    try:
        await application.bot.set_webhook(url=WEBHOOK_URL, secret_token=WEBHOOK_SECRET)
        logger.info("🤖 Blobis Bot is configured for webhooks.")
    except Exception as e:
        logger.error(f"Failed to set webhook: {e}")
        raise

async def process_update(request_body: dict):
    """Обработка входящих обновлений от Telegram."""
    try:
        logger.info(f"Processing Telegram update: {request_body.get('update_id', 'unknown')}")
        update = Update.de_json(request_body, application.bot)
        await application.initialize()  # Убедимся, что application инициализирован
        await application.process_update(update)
        logger.info(f"Update {request_body.get('update_id', 'unknown')} processed successfully")
    except Exception as e:
        logger.error(f"Error processing update: {e}", exc_info=True)

if __name__ == "__main__":
    # Локальный запуск (long polling)
    if not TELEGRAM_BOT_TOKEN:
        logger.error("TELEGRAM_BOT_TOKEN не найден! Пожалуйста, установите его в .env")
    else:
        logger.info("🤖 Blobis Bot is running (local polling mode)...")
        setup_bot()
        application.run_polling(allowed_updates=Update.ALL_TYPES)