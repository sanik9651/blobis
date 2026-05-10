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
from market_service import market_service
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
# Vite build создает dist/ директорию
import os
static_dir = os.path.join(os.path.dirname(__file__), "dist")
static_files_mounted = False

logger.info(f"Checking for static directory: {static_dir}")
logger.info(f"Current working directory: {os.getcwd()}")
logger.info(f"Directory exists: {os.path.exists(static_dir)}")

if os.path.exists(static_dir):
    # Список файлов в dist/
    try:
        files = os.listdir(static_dir)
        logger.info(f"Files in dist/: {files}")
    except Exception as e:
        logger.error(f"Error listing dist/ files: {e}")

    # Монтируем статические файлы на корневой путь в конце (после всех API роутов)
    static_files_mounted = True
    logger.info(f"Static files will be mounted from {static_dir}")
else:
    logger.warning(f"Static directory not found: {static_dir}. Run 'npm run build' first.")

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/api/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return {"status": "ok", "service": "blobis-api"}

# Монтируем статические файлы для assets (JS, CSS)
if static_files_mounted:
    app.mount("/assets", StaticFiles(directory=os.path.join(static_dir, "assets")), name="assets")
    logger.info(f"Assets mounted from {static_dir}/assets")

# Catch-all route для SPA - должен быть ПОСЛЕДНИМ
@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    """Serve SPA for all non-API routes"""
    if static_files_mounted:
        index_file = os.path.join(static_dir, "index.html")
        if os.path.exists(index_file):
            from fastapi.responses import FileResponse
            return FileResponse(index_file)
    return {"detail": "Not Found"}

@app.post(WEBHOOK_PATH)
async def bot_webhook(request: Request, background_tasks: BackgroundTasks):
    """Обработка обновлений от Telegram."""
    logger.info(f"Received webhook request from {request.client.host}")

    if WEBHOOK_SECRET is None or request.headers.get("X-Telegram-Bot-Api-Secret-Token") == WEBHOOK_SECRET:
        update_json = await request.json()
        logger.info(f"Processing update: {update_json.get('update_id', 'unknown')}")
        background_tasks.add_task(telegram_bot.process_update, update_json)
        return {"status": "ok"}

    logger.warning(f"Invalid webhook secret from {request.client.host}")
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

# ============ MARKET API ============

@app.get("/api/market/pool", response_model=schemas.MarketPool)
async def get_market_pool():
    """Get current global liquidity pool state"""
    pool = market_service.get_global_pool()
    if pool is None:
        raise HTTPException(status_code=503, detail="Market service unavailable")

    current_price = pool['poolBC'] / pool['poolBLOB'] if pool['poolBLOB'] > 0 else 0

    return schemas.MarketPool(
        pool_bc=pool['poolBC'],
        pool_blob=pool['poolBLOB'],
        k=pool['k'],
        current_price=current_price,
        last_update=pool.get('lastUpdate', datetime.utcnow())
    )

@app.post("/api/market/trade", response_model=schemas.TradeResponse)
async def execute_market_trade(trade_request: schemas.TradeRequest, db: Session = Depends(get_db)):
    """Execute a trade with validation and atomicity"""
    # Get or create user
    user = crud.get_user(db, trade_request.user_id)
    if not user:
        # Auto-create user if doesn't exist
        user = crud.create_user(db=db, user_id=trade_request.user_id, username=f"user_{trade_request.user_id}")
        logger.info(f"Auto-created user {trade_request.user_id} for trading")

    # Check user balance (this should be in Firebase, but for now check SQLite)
    if trade_request.trade_type == "BUY":
        # User needs BC to buy BLOB
        if user.coins < trade_request.amount:
            raise HTTPException(status_code=400, detail="Insufficient BC balance")
    else:
        # User needs BLOB to sell (check Firebase balance)
        # TODO: Implement Firebase balance check
        pass

    try:
        # Execute trade through market service
        result = market_service.execute_trade(
            user_id=trade_request.user_id,
            trade_type=trade_request.trade_type,
            amount=trade_request.amount,
            max_slippage=trade_request.max_slippage
        )

        if not result:
            raise HTTPException(status_code=500, detail="Trade execution failed")

        # Update user balance in SQLite (temporary - should be in Firebase)
        if trade_request.trade_type == "BUY":
            # Spent BC, received BLOB
            crud.add_coins(db, trade_request.user_id, -trade_request.amount)
            new_balance_bc = user.coins - trade_request.amount
            new_balance_blob = 0  # TODO: Get from Firebase
        else:
            # Spent BLOB, received BC
            crud.add_coins(db, trade_request.user_id, result['amount_out'])
            new_balance_bc = user.coins + result['amount_out']
            new_balance_blob = 0  # TODO: Get from Firebase

        return schemas.TradeResponse(
            success=True,
            trade_id=result['trade_id'],
            amount_in=trade_request.amount,
            amount_out=result['amount_out'],
            price=result['price'],
            slippage=result['slippage'],
            fee=result['fee'],
            new_balance_bc=new_balance_bc,
            new_balance_blob=new_balance_blob,
            hash=result['hash'],
            timestamp=datetime.utcnow()
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Trade execution error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/market/candles/{timeframe}")
async def get_market_candles(timeframe: str, limit: int = 100):
    """Get candlestick data for specified timeframe"""
    valid_timeframes = ['1m', '5m', '15m', '1h', '4h', '1d']
    if timeframe not in valid_timeframes:
        raise HTTPException(status_code=400, detail=f"Invalid timeframe. Must be one of: {valid_timeframes}")

    if limit < 1 or limit > 1000:
        raise HTTPException(status_code=400, detail="Limit must be between 1 and 1000")

    candles = market_service.get_candles(timeframe, limit)
    return {"timeframe": timeframe, "candles": candles}

@app.get("/api/market/stats", response_model=schemas.MarketStats)
async def get_market_stats():
    """Get 24h market statistics"""
    stats = market_service.get_24h_stats()
    if stats is None:
        raise HTTPException(status_code=503, detail="Market service unavailable")

    return schemas.MarketStats(**stats)

@app.on_event("startup")
async def startup_event():
    """Настройка бота при запуске приложения"""
    # Инициализируем базу данных
    from database import init_db, create_initial_locations, create_npc_fishermen
    db = SessionLocal()
    try:
        init_db()
        create_initial_locations(db)
        create_npc_fishermen(db)
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
    finally:
        db.close()

    # Initialize global market pool
    try:
        market_service.initialize_global_pool()
        logger.info("Global market pool initialized")
    except Exception as e:
        logger.error(f"Failed to initialize market pool: {e}")

    # Настраиваем бота
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