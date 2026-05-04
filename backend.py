import logging
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException, Depends, Request, BackgroundTasks
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
import uvicorn
import asyncio
import os
import sys

# Добавляем текущую директорию в sys.path для корректного импорта локальных модулей на Render.com
sys.path.append(os.path.dirname(__file__))

import crud, models, schemas
from database import SessionLocal, engine
from ai_utils import generate_fish_image, generate_fish_description, get_ai_response
from config import (
    SERVER_HOST, SERVER_PORT, TELEGRAM_BOT_TOKEN, WEBAPP_URL, WEBHOOK_URL, WEBHOOK_PATH, WEBHOOK_SECRET,
    DAILY_BONUS, AUCTION_COMMISSION, REFERRAL_PERCENTAGE, REFERRAL_BONUS,
    PREMIUM_PRICE_USD, PREMIUM_DAILY_RARE_FISH, FREE_DAILY_RARE_FISH,
    BASE_BITE_WAIT_TIME_MIN, BASE_BITE_WAIT_TIME_MAX, AUTO_HOOK_SUCCESS_RATE, CRITICAL_FISH_CHANCE,
    COMBO_3_BONUS, COMBO_5_BONUS, COMBO_10_BONUS,
    COMBO_THRESHOLD_3, COMBO_THRESHOLD_5, COMBO_THRESHOLD_10,
    XP_PER_LEVEL_BASE, LEVEL_COIN_BONUS,
    TOURNAMENT_DURATION_HOURS, TOURNAMENT_FIRST_PLACE_REWARD, TOURNAMENT_PARTICIPANT_REWARD, TOURNAMENT_TOP_10_REWARD,
    RARITY_PROBABILITIES, RARITY_COLORS
)

# Импорт telegram_bot как модуля
import telegram_bot

# Создаем все таблицы базы данных
models.Base.metadata.create_all(bind=engine)

# Logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Инициализация FastAPI приложения
app = FastAPI(
    title="Blobis API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Монтируем статические файлы для Web App
# Убедитесь, что папка `src` существует и содержит `index.html` и другие статические ресурсы.
# На Render.com путь должен быть корректным относительно корня проекта.
app.mount("/webapp", StaticFiles(directory="src"), name="webapp")

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/", response_class=HTMLResponse)
async def read_root():
    return """
    <html>
        <head>
            <title>Blobis API</title>
        </head>
        <body>
            <h1>Blobis API</h1>
            <p>Welcome to the Blobis API. Access the docs at <a href="/docs">/docs</a></p>
            <p>Go to the WebApp at <a href="/webapp">/webapp</a></p>
        </body>
    </html>
    """

@app.post(WEBHOOK_PATH)
async def bot_webhook(request: Request, background_tasks: BackgroundTasks):
    """Обработка обновлений от Telegram."""
    if WEBHOOK_SECRET is None or request.headers.get("X-Telegram-Bot-Api-Secret-Token") == WEBHOOK_SECRET:
        update_json = await request.json()
        background_tasks.add_task(telegram_bot.process_update, update_json)
        return {"status": "ok"}
    raise HTTPException(status_code=403, detail="Invalid webhook secret")

@app.post("/api/user/{user_id}/update", response_model=schemas.User)
def register_or_update_user(user_id: int, user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, user_id=user_id)
    if not db_user:
        db_user = crud.create_user(db=db, user_id=user_id, username=user_data.username or f"user_{user_id}")
        logger.info(f"New user registered: {db_user.username} (ID: {db_user.id})")
    else:
        # Обновляем имя пользователя, если оно изменилось
        if db_user.username != user_data.username:
            crud.update_user_username(db, user_id, user_data.username)
            db_user.username = user_data.username
            logger.info(f"User {user_id} updated username to {user_data.username}")
    return db_user

@app.get("/api/user/{user_id}", response_model=schemas.User)
def get_user_data(user_id: int, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@app.post("/api/user/{user_id}/fish", response_model=schemas.Fish)
async def user_fish(user_id: int, db: Session = Depends(get_db)):
    fish_data = crud.perform_fishing(db, user_id)
    if not fish_data:
        raise HTTPException(status_code=400, detail="Fishing failed or user not found")
    
    # Генерация изображения и описания в фоновом режиме
    background_tasks = BackgroundTasks()
    if fish_data.fish.image_url is None:
        background_tasks.add_task(generate_fish_image, fish_data.fish.id, fish_data.fish.name, db)
    if fish_data.fish.description is None:
        background_tasks.add_task(generate_fish_description, fish_data.fish.id, fish_data.fish.name, db)

    return fish_data.fish

@app.get("/api/user/{user_id}/inventory", response_model=List[schemas.Fish])
def get_user_inventory(user_id: int, db: Session = Depends(get_db)):
    inventory = crud.get_user_inventory(db, user_id)
    return inventory

@app.get("/api/fish/{fish_id}", response_model=schemas.Fish)
def get_fish_by_id(fish_id: int, db: Session = Depends(get_db)):
    db_fish = crud.get_fish(db, fish_id)
    if db_fish is None:
        raise HTTPException(status_code=404, detail="Fish not found")
    return db_fish

@app.post("/api/fish/{fish_id}/sell", response_model=schemas.User)
def sell_fish(fish_id: int, user_id: int, db: Session = Depends(get_db)):
    user = crud.sell_fish_to_shop(db, fish_id, user_id)
    if user is None:
        raise HTTPException(status_code=400, detail="Cannot sell fish")
    return user

@app.get("/api/daily_bonus/{user_id}", response_model=schemas.User)
def get_daily_bonus_route(user_id: int, db: Session = Depends(get_db)):
    user = crud.get_daily_bonus(db, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found or bonus already claimed today")
    return user

@app.post("/api/chat_ai/{user_id}")
async def chat_with_ai_route(user_id: int, message: schemas.AIMessage, db: Session = Depends(get_db)):
    ai_response = await get_ai_response(user_id, message.text, db)
    return {"response": ai_response}

@app.post("/api/fish/{fish_id}/add_to_auction", response_model=schemas.AuctionItem)
def add_fish_to_auction_route(fish_id: int, user_id: int, starting_price: float, db: Session = Depends(get_db)):
    auction_item = crud.add_fish_to_auction(db, fish_id, user_id, starting_price)
    if auction_item is None:
        raise HTTPException(status_code=400, detail="Could not add fish to auction (e.g., fish not found or already on auction)")
    return auction_item

@app.post("/api/auction/{item_id}/place_bid", response_model=schemas.AuctionItem)
def place_bid_route(item_id: int, user_id: int, bid_amount: float, db: Session = Depends(get_db)):
    auction_item = crud.place_bid(db, item_id, user_id, bid_amount)
    if auction_item is None:
        raise HTTPException(status_code=400, detail="Could not place bid (e.g., item not found, bid too low, or not enough coins)")
    return auction_item

@app.post("/api/auction/{item_id}/finalize", response_model=schemas.AuctionItem)
def finalize_auction_route(item_id: int, db: Session = Depends(get_db)):
    auction_item = crud.finalize_auction(db, item_id)
    if auction_item is None:
        raise HTTPException(status_code=400, detail="Could not finalize auction (e.g., item not found or not ended)")
    return auction_item

@app.get("/api/auction/active", response_model=List[schemas.AuctionItem])
def get_active_auctions_route(db: Session = Depends(get_db)):
    return crud.get_active_auctions(db)

@app.get("/api/leaderboard", response_model=List[schemas.User])
def get_leaderboard_route(db: Session = Depends(get_db)):
    return crud.get_leaderboard(db)

@app.post("/api/user/{user_id}/referral/{referrer_id}", response_model=schemas.User)
def add_referral_route(user_id: int, referrer_id: int, db: Session = Depends(get_db)):
    user = crud.add_referral(db, user_id, referrer_id)
    if user is None:
        raise HTTPException(status_code=400, detail="Could not add referral (e.g., user or referrer not found, or already referred)")
    return user

@app.get("/api/tournament/current", response_model=Optional[schemas.Tournament])
def get_current_tournament_route(db: Session = Depends(get_db)):
    return crud.get_current_tournament(db)

@app.post("/api/tournament/start", response_model=schemas.Tournament)
def start_tournament_route(db: Session = Depends(get_db)):
    tournament = crud.start_new_tournament(db)
    return tournament

@app.post("/api/tournament/{tournament_id}/end", response_model=schemas.Tournament)
def end_tournament_route(tournament_id: int, db: Session = Depends(get_db)):
    tournament = crud.end_tournament(db, tournament_id)
    if tournament is None:
        raise HTTPException(status_code=400, detail="Could not end tournament")
    return tournament

@app.on_event("startup")
async def startup_event():
    """Настройка бота при запуске приложения"""
    telegram_bot.setup_bot()
    if TELEGRAM_BOT_TOKEN:
        try:
            await telegram_bot.start_webhook_bot()
        except Exception as e:
            logger.error(f"Failed to start webhook bot: {e}")
            logger.warning("Bot will continue without webhook. You can set it up manually later.")
    else:
        logger.error("TELEGRAM_BOT_TOKEN не найден. Бот не будет запущен.")

@app.on_event("shutdown")
async def shutdown_event():
    """Очистка ресурсов при остановке"""
    logger.info("Приложение завершает работу.")

# Если запускаем локально, то используем uvicorn
if __name__ == "__main__":
    import os
    port = int(os.getenv("PORT", SERVER_PORT))
    uvicorn.run(app, host=SERVER_HOST, port=port)