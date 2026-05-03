import asyncio
import logging
import os
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, ContextTypes
import aiohttp
from config import TELEGRAM_BOT_TOKEN, SERVER_HOST, SERVER_PORT

# Logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

API_BASE_URL = f"http://{SERVER_HOST}:{SERVER_PORT}"

# ============ COMMAND HANDLERS ============

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Команда /start"""
    user = update.effective_user
    
    # Регистрируем пользователя через API
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(f"{API_BASE_URL}/api/user/{user.id}/update", 
                                  json={"username": user.username}) as resp:
                if resp.status == 200:
                    data = await resp.json()
    except Exception as e:
        logger.error(f"Error registering user: {e}")
    
    welcome_text = f"""
🎣 **Добро пожаловать в BLOBIS!** 🐟

Привет, {user.first_name}!

Это игра про рыбалку с AI-генерацией уникальных рыб!

🎮 **Как играть:**
• Лови уникальных рыб
• Генерируй AI-изображения
• Продавай на аукционе
• Собирай коллекции
• Зарабатывай монеты!

📍 **Твоя первая локация:** Речной берег
🐟 **Начни рыбалку прямо сейчас!**

Нажми ⬇️ кнопку ниже чтобы начать!
"""
    
    # Проверяем, настроен ли Web App URL
    webapp_url = os.getenv("WEBAPP_URL")
    
    keyboard = []
    
    # Добавляем Web App кнопку, если URL настроен
    if webapp_url and webapp_url.startswith("https://"):
        keyboard.append([InlineKeyboardButton("🎮 Открыть игру", web_app=WebAppInfo(url=f"{webapp_url}/webapp"))])
    
    # Добавляем обычные кнопки
    keyboard.extend([
        [InlineKeyboardButton("🎣 Начать рыбалку", callback_data="start_fishing")],
        [InlineKeyboardButton("🎒 Мой инвентарь", callback_data="inventory")],
        [InlineKeyboardButton("🏪 Аукцион", callback_data="auction")],
        [InlineKeyboardButton("📊 Лидерборд", callback_data="leaderboard")],
        [InlineKeyboardButton("❓ Помощь", callback_data="help")],
    ])
    
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(welcome_text, reply_markup=reply_markup)

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Команда /help"""
    help_text = """
🎣 **BLOBIS - Инструкция**

**Основной геймплей:**
1️⃣ Нажми "Начать рыбалку"
2️⃣ Подожди поклевку (3-15 секунд)
3️⃣ Успей нажать "Подсечь" когда появится поклевка
4️⃣ Получи уникальную рыбу!

**Редкость рыб:**
• ⚪ Обычная - 10-20 монет
• 🔵 Редкая - 20-40 монет
• 🟠 Эпическая - 40-60 монет + эффект
• 🟡 Легендарная - 60-100 монет + 2 эффекта
• 🟣 Мифическая - 100+ монет + 3 эффекта

**Комбо система:**
• 3 рыбы подряд = +10%
• 5 рыб подряд = +25%
• 10 рыб подряд = +50%

**Аукцион:**
• Выставляй рыбу на продажу
• Ставь на чужие рыбы
• Зарабатывай монеты!

**Локации:**
Открываются по мере повышения уровня
"""
    
    keyboard = [
        [InlineKeyboardButton("⬅️ Назад", callback_data="open_game")],
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(help_text, reply_markup=reply_markup)

# ============ CALLBACK HANDLERS ============

async def open_game(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Открыть главное меню"""
    query = update.callback_query
    await query.answer()
    
    user_id = query.from_user.id
    
    # Получаем информацию о пользователе
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{API_BASE_URL}/api/user/{user_id}") as resp:
                if resp.status == 200:
                    user_data = await resp.json()
                else:
                    user_data = None
    except Exception as e:
        logger.error(f"Error fetching user data: {e}")
        user_data = None
    
    if user_data:
        game_text = f"""
🎣 **BLOBIS - Главное меню**

👤 {user_data['username']}
📊 Уровень: {user_data['level']}
💰 Монеты: {user_data['coins']:.0f}
🐟 Поймано рыб: {user_data['total_fish_caught']}
🔥 Комбо: {user_data['current_combo']}
📍 Локация: {user_data['location']}

**Что делаем?**
"""
    else:
        game_text = """
🎣 **BLOBIS - Главное меню**

Загрузка данных...
"""
    
    keyboard = [
        [InlineKeyboardButton("🎣 Рыбалка", callback_data="start_fishing")],
        [InlineKeyboardButton("🎒 Инвентарь", callback_data="inventory")],
        [InlineKeyboardButton("🏪 Аукцион", callback_data="auction")],
        [InlineKeyboardButton("📊 Лидерборд", callback_data="leaderboard")],
        [InlineKeyboardButton("🎯 Квесты", callback_data="quests")],
        [InlineKeyboardButton("❓ Помощь", callback_data="help")],
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    try:
        await query.edit_message_text(game_text, reply_markup=reply_markup)
    except Exception as e:
        logger.error(f"Error editing message: {e}")

async def start_fishing(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Начать рыбалку"""
    query = update.callback_query
    await query.answer()
    
    user_id = query.from_user.id
    
    # Бросаем удочку
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(f"{API_BASE_URL}/api/fish/{user_id}/cast") as resp:
                if resp.status == 200:
                    data = await resp.json()
                else:
                    await query.edit_message_text("❌ Ошибка при рыбалке")
                    return
    except Exception as e:
        logger.error(f"Error casting fishing line: {e}")
        await query.edit_message_text("❌ Ошибка при рыбалке")
        return
    
    fishing_text = f"""
🎣 **Рыбалка...**

📍 Локация: {data['location']}
⏱️ Ждём поклевку: {data['wait_time']} сек

Нажми **"Подсечь!"** когда появится поклевка!
"""
    
    keyboard = [
        [InlineKeyboardButton("🎣 Подсечь!", callback_data="hook_fish")],
        [InlineKeyboardButton("⬅️ Выход", callback_data="open_game")],
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await query.edit_message_text(fishing_text, reply_markup=reply_markup)

async def hook_fish(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Подсечь рыбу"""
    query = update.callback_query
    await query.answer()
    
    user_id = query.from_user.id
    
    # Подсекаем рыбу
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(f"{API_BASE_URL}/api/fish/{user_id}/hook") as resp:
                if resp.status == 200:
                    data = await resp.json()
                else:
                    await query.edit_message_text("❌ Ошибка при подсечке")
                    return
    except Exception as e:
        logger.error(f"Error hooking fish: {e}")
        await query.edit_message_text("❌ Ошибка при подсечке")
        return
    
    fish = data['fish']
    
    fish_text = f"""
🐟 **ПОЙМАЛ!**

{fish['is_critical'] and '🔥 КРИТИЧЕСКИЙ УЛОВ! 🔥\n' or ''}
**{fish['name']}**

🎨 Редкость: {fish['rarity']}
💰 Ценность: {fish['coin_value']} монет
⚖️ Вес: {fish['weight']} кг
📏 Размер: {fish['size']} см
"""
    
    if fish['special_effects']:
        fish_text += "\n✨ Эффекты:\n"
        for effect in fish['special_effects']:
            fish_text += f"• {effect}\n"
    
    fish_text += f"""
🔥 Комбо: {data['combo']}
💰 Всего монет: {data['total_coins']:.0f}
⭐ Опыт: {data['experience']}
📊 Уровень: {data['level']}
"""
    
    keyboard = [
        [InlineKeyboardButton("🎣 Рыбачить ещё", callback_data="start_fishing")],
        [InlineKeyboardButton("🎒 В инвентарь", callback_data="inventory")],
        [InlineKeyboardButton("⬅️ Меню", callback_data="open_game")],
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await query.edit_message_text(fish_text, reply_markup=reply_markup)

async def show_inventory(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Показать инвентарь"""
    query = update.callback_query
    await query.answer()
    
    user_id = query.from_user.id
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{API_BASE_URL}/api/fish/{user_id}/inventory") as resp:
                if resp.status == 200:
                    data = await resp.json()
                else:
                    await query.edit_message_text("❌ Ошибка при загрузке инвентаря")
                    return
    except Exception as e:
        logger.error(f"Error fetching inventory: {e}")
        await query.edit_message_text("❌ Ошибка при загрузке инвентаря")
        return
    
    if not data['fish']:
        inventory_text = "🎒 **Твой инвентарь пуст**\n\nПоймай свою первую рыбу!"
    else:
        inventory_text = f"🎒 **Инвентарь** ({data['total']}/{data['capacity']})\n\n"
        
        for i, fish in enumerate(data['fish'][:10], 1):
            inventory_text += f"{i}. **{fish['name']}** ({fish['rarity']}) - {fish['coin_value']}💰\n"
        
        if len(data['fish']) > 10:
            inventory_text += f"\n...и ещё {len(data['fish']) - 10} рыб"
    
    keyboard = [
        [InlineKeyboardButton("🎣 Рыбалка", callback_data="start_fishing")],
        [InlineKeyboardButton("⬅️ Назад", callback_data="open_game")],
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await query.edit_message_text(inventory_text, reply_markup=reply_markup)

async def show_auction(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Показать аукцион"""
    query = update.callback_query
    await query.answer()
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{API_BASE_URL}/api/auction/active") as resp:
                if resp.status == 200:
                    data = await resp.json()
                else:
                    await query.edit_message_text("❌ Ошибка при загрузке аукциона")
                    return
    except Exception as e:
        logger.error(f"Error fetching auctions: {e}")
        await query.edit_message_text("❌ Ошибка при загрузке аукциона")
        return
    
    if not data['auctions']:
        auction_text = "🏪 **Аукцион пуст**\n\nВыставь свою первую рыбу!"
    else:
        auction_text = "🏪 **Активные аукционы**\n\n"
        
        for i, auction in enumerate(data['auctions'][:5], 1):
            auction_text += f"{i}. **{auction['fish_name']}** ({auction['fish_rarity']})\n"
            auction_text += f"   Продавец: {auction['seller']}\n"
            auction_text += f"   Цена: {auction['current_price']}💰\n"
            auction_text += f"   Заканчивается: {auction['ends_at'][:19]}\n\n"
        
        if len(data['auctions']) > 5:
            auction_text += f"...и ещё {len(data['auctions']) - 5} лотов"
    
    keyboard = [
        [InlineKeyboardButton("🎒 Мои рыбы", callback_data="inventory")],
        [InlineKeyboardButton("⬅️ Назад", callback_data="open_game")],
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await query.edit_message_text(auction_text, reply_markup=reply_markup)

async def show_leaderboard(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Показать лидерборд"""
    query = update.callback_query
    await query.answer()
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{API_BASE_URL}/api/leaderboard") as resp:
                if resp.status == 200:
                    data = await resp.json()
                else:
                    await query.edit_message_text("❌ Ошибка при загрузке лидерборда")
                    return
    except Exception as e:
        logger.error(f"Error fetching leaderboard: {e}")
        await query.edit_message_text("❌ Ошибка при загрузке лидерборда")
        return
    
    leaderboard_text = "📊 **Топ игроков**\n\n"
    
    for entry in data['leaderboard'][:10]:
        emoji = "🥇" if entry['rank'] == 1 else "🥈" if entry['rank'] == 2 else "🥉" if entry['rank'] == 3 else f"{entry['rank']}."
        leaderboard_text += f"{emoji} **{entry['username']}** - {entry['coins']:.0f}💰 (Lvl {entry['level']})\n"
    
    keyboard = [
        [InlineKeyboardButton("⬅️ Назад", callback_data="open_game")],
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await query.edit_message_text(leaderboard_text, reply_markup=reply_markup)

async def show_quests(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Показать квесты"""
    query = update.callback_query
    await query.answer()
    
    user_id = query.from_user.id
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{API_BASE_URL}/api/quests/{user_id}") as resp:
                if resp.status == 200:
                    data = await resp.json()
                else:
                    await query.edit_message_text("❌ Ошибка при загрузке квестов")
                    return
    except Exception as e:
        logger.error(f"Error fetching quests: {e}")
        await query.edit_message_text("❌ Ошибка при загрузке квестов")
        return
    
    if not data['quests']:
        quests_text = "🎯 **Квестов нет**\n\nЗаходи завтра за новыми!"
    else:
        quests_text = "🎯 **Ежедневные квесты**\n\n"
        
        for quest in data['quests']:
            progress = "✅" if quest['completed'] else f"🔄 {quest['progress']}/{quest['target']}"
            quests_text += f"{progress} **{quest['description']}**\n"
            quests_text += f"   Награда: {quest['reward']}💰\n\n"
    
    keyboard = [
        [InlineKeyboardButton("🎣 Рыбалка", callback_data="start_fishing")],
        [InlineKeyboardButton("⬅️ Назад", callback_data="open_game")],
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await query.edit_message_text(quests_text, reply_markup=reply_markup)

# ============ MAIN ============

def main():
    """Запуск бота"""
    # Создаём приложение
    application = Application.builder().token(TELEGRAM_BOT_TOKEN).build()
    
    # Команды
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help_command))
    
    # Callbacks
    application.add_handler(CallbackQueryHandler(open_game, pattern="^open_game$"))
    application.add_handler(CallbackQueryHandler(start_fishing, pattern="^start_fishing$"))
    application.add_handler(CallbackQueryHandler(hook_fish, pattern="^hook_fish$"))
    application.add_handler(CallbackQueryHandler(show_inventory, pattern="^inventory$"))
    application.add_handler(CallbackQueryHandler(show_auction, pattern="^auction$"))
    application.add_handler(CallbackQueryHandler(show_leaderboard, pattern="^leaderboard$"))
    application.add_handler(CallbackQueryHandler(show_quests, pattern="^quests$"))
    application.add_handler(CallbackQueryHandler(help_command, pattern="^help$"))
    
    # Запуск
    print("🤖 Blobis Bot is running...")
    application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == "__main__":
    main()
