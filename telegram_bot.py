import logging
import os
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, ContextTypes
import aiohttp
from config import TELEGRAM_BOT_TOKEN, SERVER_HOST, SERVER_PORT, WEBAPP_URL

# Logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

API_BASE_URL = f"http://{SERVER_HOST}:{SERVER_PORT}"

# ============ COMMAND HANDLERS ============

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Команда /start - Приветствие и кнопка Web App"""
    user = update.effective_user
    
    # Регистрируем пользователя через API (чтобы он был в базе до открытия WebApp)
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(f"{API_BASE_URL}/api/user/{user.id}/update", 
                                  json={"username": user.username}) as resp:
                pass
    except Exception as e:
        logger.error(f"Error registering user: {e}")
    
    welcome_text = (
        f"🎣 *Добро пожаловать в BLOBIS\\!* 🐟\n\n"
        f"Привет, {user.first_name}\\!\n\n"
        "Это игра про рыбалку с AI\\-генерацией уникальных рыб\\.\n\n"
        "⚠️ *Весь игровой процесс перенесен в Web App\\.*\n"
        "Нажми на кнопку ниже, чтобы начать рыбачить, торговать на аукционе и выполнять квесты\\!"
    )
    
    keyboard = [
        [InlineKeyboardButton("🎮 Играть в Blobis", web_app=WebAppInfo(url=f"{WEBAPP_URL}/webapp"))]
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

# ============ MAIN ============

def main():
    """Запуск бота"""
    if not TELEGRAM_BOT_TOKEN:
        logger.error("TELEGRAM_BOT_TOKEN not found!")
        return

    application = Application.builder().token(TELEGRAM_BOT_TOKEN).build()
    
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help_command))
    
    print("🤖 Blobis Bot is running (Web App only mode)...")
    application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == "__main__":
    main()