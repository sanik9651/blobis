from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from contextlib import asynccontextmanager
from sqlalchemy import func
from datetime import datetime, timedelta
from pydantic import BaseModel
import random
import json
import uuid

from database import SessionLocal, get_db, init_db, create_initial_locations, create_npc_fishermen
from models import (
    User, Location, Fish, Auction, Bid, Quest, 
    NPCFisherman, NPCFish, Tournament, TournamentResult
)

# ============ PYDANTIC MODELS ============

class UserResponse(BaseModel):
    model_config = {"from_attributes": True}
    
    id: int
    telegram_id: str
    username: str
    level: int
    coins: float
    experience: float
    current_combo: int
    total_fish_caught: int
    location: str
    premium: bool

class FishResponse(BaseModel):
    id: str
    name: str
    rarity: str
    coin_value: int
    weight: float
    size: float
    biome: str
    special_effects: list
    color: str
    image_url: str
    is_critical: bool

class AuctionResponse(BaseModel):
    model_config = {"from_attributes": True}
    
    id: str
    fish_id: str
    current_price: int
    initial_price: int
    end_time: datetime
    is_completed: bool

# ============ FASTAPI APP ============

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Инициализация БД при старте
    try:
        initialize_database()
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")
    yield

app = FastAPI(title="Blobis API", version="1.0.0", lifespan=lifespan)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============ STARTUP ============

# Инициализация БД при старте модуля
def initialize_database():
    """Инициализирует БД при запуске"""
    init_db()
    # Создать начальные локации если их нет
    db_gen = get_db()
    db = next(db_gen)
    try:
        if db.query(Location).count() == 0:
            create_initial_locations(db)
        # Создать NPC рыбаков
        if db.query(NPCFisherman).count() == 0:
            create_npc_fishermen(db)
    finally:
        db.close()
    print("✅ Database initialized")

# AI Fish Generation
def generate_fish_data(location: Location, db: Session) -> dict:
    """Генерация данных рыбы (в будущем с AI)"""
    rarity_weights = {
        "common": 0.30,
        "rare": 0.40,
        "epic": 0.20,
        "legendary": 0.09,
        "mythical": 0.01
    }
    
    # Выбираем редкость
    rand = random.random()
    cumulative = 0
    rarity = "common"
    for r, weight in rarity_weights.items():
        cumulative += weight
        if rand <= cumulative:
            rarity = r
            break
    
    # Базовые имена рыб по биому
    fish_names = {
        "river": ["Карась", "Окунь", "Плотва", "Лещ", "Щука"],
        "lake": ["Карп", "Судак", "Линь", "Толстолобик", "Белый амур"],
        "mountain": ["Форель", "Хариус", "Гольян", "Нерка", "Кумжа"],
        "swamp": ["Сом", "Угорь", "Щука", "Карась", "Плотва"],
        "ocean": ["Тунец", "Лосось", "Скумбрия", "Сардина", "Макрель"],
        "cave": ["Древний Сом", "Пещерный Лосось", "Мифическая Форель", 
                 "Тёмный Окунь", "Кристальная Щука"]
    }
    
    base_names = fish_names.get(location.biome_type, fish_names["river"])
    base_name = random.choice(base_names)
    
    # Добавляем префиксы для редких рыб
    prefixes = {
        "common": ["Обычный", "Маленький", "Молодой"],
        "rare": ["Крупный", "Сильный", "Быстрый"],
        "epic": ["Золотистый", "Багровый", "Серебристый"],
        "legendary": ["Древний", "Могучий", "Таинственный"],
        "mythical": ["Мифический", "Божественный", "Космический"]
    }
    
    prefix = random.choice(prefixes.get(rarity, ["Обычный"]))
    name = f"{prefix} {base_name}"
    
    # Характеристики
    rarity_values = {
        "common": {"min": 10, "max": 20, "weight_min": 0.5, "weight_max": 2.0},
        "rare": {"min": 20, "max": 40, "weight_min": 1.0, "weight_max": 4.0},
        "epic": {"min": 40, "max": 60, "weight_min": 2.0, "weight_max": 8.0},
        "legendary": {"min": 60, "max": 100, "weight_min": 5.0, "weight_max": 15.0},
        "mythical": {"min": 100, "max": 300, "weight_min": 10.0, "weight_max": 50.0}
    }
    
    values = rarity_values[rarity]
    coin_value = random.randint(values["min"], values["max"])
    weight = round(random.uniform(values["weight_min"], values["weight_max"]), 2)
    size = round(random.uniform(weight * 10, weight * 20), 1)
    
    # Особые эффекты
    effects_pool = [
        "Ночная охота", "Глубинный житель", "Быстрый темп", 
        "Светящаяся чешуя", "Древний род", "Золотая чешуя",
        "Ледяное дыхание", "Огненная кровь", "Теневой ход"
    ]

    special_effects = []
    if rarity in ["epic"]:
        special_effects = [random.choice(effects_pool)]
    elif rarity == "legendary":
        special_effects = random.sample(effects_pool, 2)
    elif rarity == "mythical":
        special_effects = random.sample(effects_pool, 3)
    
    # Цвет для UI
    colors = {
        "common": "#808080",
        "rare": "#0000FF",
        "epic": "#FFA500",
        "legendary": "#FFD700",
        "mythical": "#800080"
    }
    
    description = f"Уникальная рыба из {location.name}. Редкость: {rarity}."
    
    return {
        "name": name,
        "description": description,
        "rarity": rarity,
        "biome": location.biome_type,
        "location_id": location.id,
        "coin_value": coin_value,
        "weight": weight,
        "size": size,
        "special_effects": json.dumps(special_effects),
        "color": colors[rarity],
        "image_url": None  # Будет сгенерировано через Hugging Face
    }

def check_level_up(user: User):
    """Проверка повышения уровня"""
    xp_needed = user.level * 100
    if user.experience >= xp_needed:
        user.level += 1
        user.experience = user.experience - xp_needed
        user.coins += 50  # Бонус за уровень

def get_or_create_user(telegram_id: str, db: Session) -> User:
    """Получить или создать пользователя"""
    user = db.query(User).filter(User.telegram_id == telegram_id).first()
    if not user:
        user = User(
            telegram_id=telegram_id,
            referral_code=str(uuid.uuid4())[:8]
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

# ============ USER ENDPOINTS ============

@app.get("/")
async def root():
    return {"message": "Blobis API", "version": "1.0.0"}

@app.get("/api/user/{telegram_id}", response_model=UserResponse)
async def get_user_info(telegram_id: str, db: Session = Depends(get_db)):
    """Получить информацию о пользователе"""
    user = get_or_create_user(telegram_id, db)
    
    location_name = user.location.name if user.location else "Неизвестно"
    
    return UserResponse(
        id=user.id,
        telegram_id=user.telegram_id,
        username=user.username or f"User_{user.telegram_id}",
        level=user.level,
        coins=user.coins,
        experience=user.experience,
        current_combo=user.current_combo,
        total_fish_caught=user.total_fish_caught,
        location=location_name,
        premium=user.premium
    )
    
@app.post("/api/user/{telegram_id}/update")
async def update_user(telegram_id: str, db: Session = Depends(get_db), username: str = None):
    """Обновить информацию о пользователе"""
    user = get_or_create_user(telegram_id, db)
    if username:
        user.username = username
        db.commit()
    return {"success": True, "user_id": user.id}
    
# ============ FISHING ENDPOINTS ============

@app.post("/api/fish/{telegram_id}/cast")
async def cast_fishing_line(telegram_id: str, db: Session = Depends(get_db)):
    """Бросить удочку (начать рыбалку)"""
    user = get_or_create_user(telegram_id, db)
    location = user.location
    
    if not location:
        raise HTTPException(status_code=400, detail="Локация не найдена")
    
    # Время ожидания поклевки (3-15 секунд с учётом улучшений)
    base_wait_time = random.uniform(3, 15)
    wait_time = max(1, base_wait_time - (user.bite_speed - 1) * 0.5)
    
    return {
        "success": True,
        "wait_time": round(wait_time, 2),
        "location": location.name,
        "message": "Ждёте поклевку..."
    }

@app.post("/api/fish/{telegram_id}/hook")
async def hook_fish(telegram_id: str, db: Session = Depends(get_db)):
    """Подсекнуть рыбу (успешная рыбалка)"""
    user = get_or_create_user(telegram_id, db)
    location = user.location
    
    if not location:
        raise HTTPException(status_code=400, detail="Локация не найдена")
    
    # Шанс критического улова
    is_critical = random.random() * 100 < user.critical_chance
    
    # Генерация рыбы
    fish_data = generate_fish_data(location, db)
    
    # Увеличиваем ценность при критическом улове
    if is_critical:
        fish_data["coin_value"] = int(fish_data["coin_value"] * 1.5)
        fish_data["name"] = f"КРИТИЧЕСКИЙ {fish_data['name']}"
    
    # Множитель локации
    fish_data["coin_value"] = int(fish_data["coin_value"] * location.base_coin_multiplier)
    
    # Создаём рыбу
    fish = Fish(
        owner_id=user.id,
        **fish_data
    )

    # Комбо система
    user.current_combo += 1
    combo_bonus = 1.0
    if user.current_combo >= 10:
        combo_bonus = 1.5
    elif user.current_combo >= 5:
        combo_bonus = 1.25
    elif user.current_combo >= 3:
        combo_bonus = 1.1
    
    fish_data["coin_value"] = int(fish_data["coin_value"] * combo_bonus)
    fish.coin_value = fish_data["coin_value"]
    
    # Добавляем рыбу в инвентарь
    db.add(fish)
    
    # Обновляем статистику
    user.total_fish_caught += 1
    user.coins += fish_data["coin_value"]
    
    # Опыт за рыбу
    xp_gain = fish_data["coin_value"]
    user.experience += xp_gain
    
    # Проверка уровня
    check_level_up(user)
    
    db.commit()
    db.refresh(user)
    
    return {
        "success": True,
        "fish": {
            "id": fish.id,
            "name": fish.name,
            "rarity": fish.rarity,
            "coin_value": fish.coin_value,
            "weight": fish.weight,
            "size": fish.size,
            "special_effects": json.loads(fish.special_effects) if fish.special_effects else [],
            "color": fish.color,
            "image_url": fish.image_url,
            "is_critical": is_critical
        },
        "combo": user.current_combo,
        "combo_bonus": combo_bonus,
        "coins_earned": fish.coin_value,
        "total_coins": user.coins,
        "experience": user.experience,
        "level": user.level
    }

@app.get("/api/fish/{telegram_id}/inventory")
async def get_fish_inventory(telegram_id: str, db: Session = Depends(get_db)):
    """Получить инвентарь рыб"""
    user = get_or_create_user(telegram_id, db)
    fish_list = db.query(Fish).filter(Fish.owner_id == user.id, Fish.is_on_auction == False).all()
    
    return {
        "fish": [
            {
                "id": f.id,
                "name": f.name,
                "rarity": f.rarity,
                "coin_value": f.coin_value,
                "weight": f.weight,
                "size": f.size,
                "biome": f.biome,
                "special_effects": json.loads(f.special_effects) if f.special_effects else [],
                "color": f.color,
                "image_url": f.image_url,
                "caught_at": f.caught_at.isoformat()
            }
            for f in fish_list
        ],
        "total": len(fish_list),
        "capacity": user.basket_capacity
    }

# ============ AUCTION ENDPOINTS ============

@app.post("/api/fish/{telegram_id}/auction/{fish_id}")
async def put_fish_on_auction(
    telegram_id: str,
    fish_id: str,
    starting_price: int,
    duration_hours: int = 12,
    db: Session = Depends(get_db)
):
    """Выставить рыбу на аукцион"""
    user = get_or_create_user(telegram_id, db)
    fish = db.query(Fish).filter(Fish.id == fish_id, Fish.owner_id == user.id).first()
    
    if not fish:
        raise HTTPException(status_code=404, detail="Рыба не найдена")
    
    if fish.is_on_auction:
        raise HTTPException(status_code=400, detail="Рыба уже на аукционе")
    
    if starting_price < 10:
        raise HTTPException(status_code=400, detail="Минимальная цена 10 монет")
    
    if duration_hours not in [4, 12, 24]:
        raise HTTPException(status_code=400, detail="Длительность может быть 4, 12 или 24 часа")
    
    # Создаём аукцион
    auction = Auction(
        fish_id=fish.id,
        seller_id=user.id,
        initial_price=starting_price,
        current_price=starting_price,
        duration_hours=duration_hours,
        end_time=datetime.utcnow() + timedelta(hours=duration_hours)
    )
    
    fish.is_on_auction = True
    
    db.add(auction)
    db.commit()
    
    return {
        "success": True,
        "auction_id": auction.id,
        "fish_name": fish.name,
        "starting_price": starting_price,
        "ends_at": auction.end_time.isoformat()
    }

@app.get("/api/auction/active")
async def get_active_auctions(db: Session = Depends(get_db)):
    """Получить активные аукционы"""
    auctions = db.query(Auction).filter(
        Auction.is_completed == False,
        Auction.end_time > datetime.utcnow()
    ).all()
    
    return {
        "auctions": [
            {
                "id": a.id,
                "fish_name": a.fish.name,
                "fish_rarity": a.fish.rarity,
                "fish_color": a.fish.color,
                "fish_image": a.fish.image_url,
                "seller": a.seller.username or f"ID:{a.seller_id}",
                "current_price": a.current_price,
                "starting_price": a.initial_price,
                "ends_at": a.end_time.isoformat(),
                "bid_count": len(a.bids)
            }
            for a in auctions[:20]  # Ограничиваем до 20
        ]
    }

@app.post("/api/auction/{auction_id}/bid")
async def place_bid(auction_id: str, telegram_id: str, amount: int, db: Session = Depends(get_db)):
    """Поставить ставку на аукцион"""
    user = get_or_create_user(telegram_id, db)
    auction = db.query(Auction).filter(Auction.id == auction_id).first()
    
    if not auction:
        raise HTTPException(status_code=404, detail="Аукцион не найден")
    
    if not auction.is_active():
        raise HTTPException(status_code=400, detail="Аукцион завершен или не активен")
    
    if user.id == auction.seller_id:
        raise HTTPException(status_code=400, detail="Нельзя ставить на свой аукцион")
    
    if amount <= auction.current_price:
        raise HTTPException(status_code=400, detail="Ставка должна быть выше текущей цены")
    
    if user.coins < amount:
        raise HTTPException(status_code=400, detail="Недостаточно монет")
    
    # Списываем монеты (в реальной версии - резервирование)
    user.coins -= amount
    
    # Создаём ставку
    bid = Bid(
        auction_id=auction_id,
        user_id=user.id,
        amount=amount
    )

    # Обновляем цену
    auction.current_price = amount
    
    # Продлеваем время если ставка близко к концу
    if datetime.utcnow() > auction.end_time - timedelta(minutes=5):
        auction.end_time = datetime.utcnow() + timedelta(minutes=5)
    
    db.add(bid)
    db.commit()
    
    return {
        "success": True,
        "new_price": amount,
        "remaining_coins": user.coins
    }

@app.post("/api/auction/{auction_id}/complete")
async def complete_auction(auction_id: str, db: Session = Depends(get_db)):
    """Завершить аукцион (когда истекло время)"""
    auction = db.query(Auction).filter(Auction.id == auction_id).first()
    
    if not auction:
        raise HTTPException(status_code=404, detail="Аукцион не найден")
    
    if auction.is_completed:
        raise HTTPException(status_code=400, detail="Аукцион уже завершен")
    
    if datetime.utcnow() < auction.end_time:
        raise HTTPException(status_code=400, detail="Аукцион ещё активен")
    
    # Получаем последнюю ставку
    last_bid = db.query(Bid).filter(
        Bid.auction_id == auction.id
    ).order_by(Bid.created_at.desc()).first()
    
    if last_bid:
        # Есть ставки
        auction.winner_id = last_bid.bidder_id
        auction.current_price = last_bid.amount
        
        # Переводим монеты
        winner = db.query(User).filter(User.id == last_bid.bidder_id).first()
        seller = db.query(User).filter(User.id == auction.seller_id).first()
        
        winner.coins -= last_bid.amount
        seller.coins += int(last_bid.amount * (1 - 0.10))  # 10% комиссия
        seller.total_auctions_sold += 1
        winner.total_auctions_won += 1
        
        # Переводим рыбу
        fish = db.query(Fish).filter(Fish.id == auction.fish_id).first()
        fish.owner_id = last_bid.bidder_id
        fish.is_on_auction = False
    else:
        # Нет ставок, рыба возвращается владельцу
        fish = db.query(Fish).filter(Fish.id == auction.fish_id).first()
        fish.is_on_auction = False
    
    auction.is_completed = True
    db.commit()
    
    return {"status": "completed", "winner_id": auction.winner_id}

# ============ QUEST ENDPOINTS ============

@app.get("/api/quests/{telegram_id}")
async def get_user_quests(telegram_id: str, db: Session = Depends(get_db)):
    """Получить текущие квесты пользователя"""
    user = get_or_create_user(telegram_id, db)
    
    # Сбрасываем квесты если нужно (ежедневно)
    today = datetime.utcnow().date()
    if user.last_daily_bonus and user.last_daily_bonus.date() < today:
        # Сбрасываем все квесты
        db.query(Quest).filter(Quest.user_id == user.id).delete()
        user.last_daily_bonus = datetime.utcnow()
        db.commit()
    
    quests = db.query(Quest).filter(Quest.user_id == user.id, Quest.completed == False).all()
    
    # Если квестов нет, создаём новые
    if len(quests) < 3:
        create_daily_quests(user, db)
        quests = db.query(Quest).filter(Quest.user_id == user.id, Quest.completed == False).all()
    
    return {
        "quests": [
            {
                "id": quest.id,
                "quest_type": quest.quest_type,
                "description": quest.description,
                "progress": quest.progress,
                "target": quest.target,
                "reward": quest.reward,
                "completed": quest.completed,
            }
            for quest in quests
        ]
    }

def create_daily_quests(user: User, db: Session):
    """Создание ежедневных квестов"""
    quest_templates = [
        ("catch_fish", "Поймай 30 рыб", 30, 50),
        ("rare_fish", "Поймай рыбу редкости Эпик или выше", 1, 100),
        ("combo", "Выполни комбо из 10 рыб", 1, 50),
        ("earn_coins", "Заработай 500 монет за рыбалку", 500, 75),
        ("different_biomes", "Поймай рыбу в 3 разных локациях", 3, 100)
    ]

    for quest_type, description, target, reward in quest_templates:
        if db.query(Quest).filter(
            Quest.user_id == user.id,
            Quest.quest_type == quest_type,
            Quest.completed == False
        ).first():
            continue
        
        quest = Quest(
            user_id=user.id,
            quest_type=quest_type,
            description=description,
            target=target,
            reward=reward
        )
        db.add(quest)
    
    db.commit()

@app.post("/api/quests/{telegram_id}/update")
async def update_quest_progress(
    telegram_id: str,
    quest_type: str,
    amount: int = 1,
    db: Session = Depends(get_db)
):
    """Обновить прогресс квеста"""
    user = get_or_create_user(telegram_id, db)
    
    quest = db.query(Quest).filter(
        Quest.user_id == user.id,
        Quest.quest_type == quest_type,
        Quest.completed == False
    ).first()
    
    if not quest:
        raise HTTPException(status_code=404, detail="Quest not found or already completed")
    
    quest.progress += amount
    
    # Проверяем, выполнен ли квест
    if quest.progress >= quest.target:
        quest.completed = True
        quest.completed_at = datetime.utcnow()
        
        # Начисляем награду
        user.coins += quest.reward
    
    db.commit()
    db.refresh(quest)
    
    return {
        "progress": quest.progress,
        "completed": quest.completed,
        "reward_claimed": quest.completed and quest.reward or 0
    }

# ============ LOCATION ENDPOINTS ============

@app.get("/api/locations")
async def get_locations(db: Session = Depends(get_db)):
    """Получить все локации"""
    locations = db.query(Location).all()
    
    return {
        "locations": [
            {
                "id": l.id,
                "name": l.name,
                "description": l.description,
                "unlock_level": l.unlock_level,
                "base_coin_multiplier": l.base_coin_multiplier,
                "biome_type": l.biome_type
            }
            for l in locations
        ]
    }

@app.post("/api/locations/{telegram_id}/change/{location_id}")
async def change_location(telegram_id: str, location_id: int, db: Session = Depends(get_db)):
    """Сменить локацию"""
    user = get_or_create_user(telegram_id, db)
    location = db.query(Location).filter(Location.id == location_id).first()
    
    if not location:
        raise HTTPException(status_code=404, detail="Локация не найдена")
    
    if user.level < location.unlock_level:
        raise HTTPException(
            status_code=403, 
            detail=f"Нужен уровень {location.unlock_level} для открытия этой локации"
        )
    
    user.current_location_id = location.id
    db.commit()
    
    return {
        "success": True,
        "location": {
            "id": location.id,
            "name": location.name,
            "description": location.description
        }
    }

# ============ LEADERBOARD ENDPOINTS ============

@app.get("/api/leaderboard")
async def get_leaderboard(limit: int = 100, db: Session = Depends(get_db)):
    """Получить топ игроков"""
    users = db.query(User).order_by(User.coins.desc()).limit(limit).all()
    
    return {
        "leaderboard": [
            {
                "rank": i + 1,
                "username": user.username or f"User_{user.telegram_id}",
                "coins": user.coins,
                "level": user.level,
                "total_fish_caught": user.total_fish_caught
            }
            for i, user in enumerate(users)
        ]
    }

# ============ HEALTH CHECK ============

@app.get("/api/health")
async def health_check():
    """Проверка здоровья сервера"""
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}

# ============ WEB APP ============

@app.get("/webapp", response_class=HTMLResponse)
async def web_app():
    """Telegram Web App интерфейс"""
    from config import WEBAPP_URL
    html_content = """
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blobis - Рыбалка</title>
    <script src="https://telegram.org/js/telegram-web-app.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
            color: white;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .header h1 {
            font-size: 32px;
            margin-bottom: 10px;
        }
        
        .stats {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            padding: 20px;
            margin-bottom: 20px;
            backdrop-filter: blur(10px);
        }
        
        .stat-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            font-size: 18px;
        }
        
        .fishing-area {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            padding: 30px;
            text-align: center;
            margin-bottom: 20px;
            backdrop-filter: blur(10px);
        }
        
        .fish-button {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            border: none;
            border-radius: 50px;
            padding: 20px 40px;
            font-size: 24px;
            color: white;
            cursor: pointer;
            transition: transform 0.2s;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
        
        .fish-button:active {
            transform: scale(0.95);
        }
        
        .fish-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        .message {
            margin-top: 20px;
            font-size: 18px;
            min-height: 60px;
        }
        
        .fish-result {
            background: rgba(255, 255, 255, 0.15);
            border-radius: 15px;
            padding: 20px;
            margin-top: 20px;
            backdrop-filter: blur(10px);
        }
        
        .fish-name {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .fish-stats {
            font-size: 16px;
            line-height: 1.6;
        }
        
        .inventory {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            padding: 20px;
            backdrop-filter: blur(10px);
        }
        
        .inventory h2 {
            margin-bottom: 15px;
        }
        
        .fish-item {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            padding: 15px;
            margin-bottom: 10px;
        }
        
        .loading {
            text-align: center;
            font-size: 20px;
            padding: 40px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎣 Blobis</h1>
            <p>Рыбалка в Telegram</p>
        </div>
        
        <div class="stats" id="stats">
            <div class="stat-row">
                <span>👤 Игрок:</span>
                <span id="username">Загрузка...</span>
            </div>
            <div class="stat-row">
                <span>📊 Уровень:</span>
                <span id="level">-</span>
            </div>
            <div class="stat-row">
                <span>💰 Монеты:</span>
                <span id="coins">-</span>
            </div>
            <div class="stat-row">
                <span>🐟 Поймано:</span>
                <span id="total_fish">-</span>
            </div>
            <div class="stat-row">
                <span>🔥 Комбо:</span>
                <span id="combo">-</span>
            </div>
        </div>
        
        <div class="fishing-area">
            <button class="fish-button" id="fishButton" onclick="startFishing()">
                🎣 Рыбачить
            </button>
            <div class="message" id="message"></div>
            <div class="fish-result" id="fishResult" style="display: none;"></div>
        </div>
        
        <div class="inventory" id="inventory" style="display: none;">
            <h2>🎒 Последние уловы</h2>
            <div id="inventoryList"></div>
        </div>
    </div>
    
    <script>
        const tg = window.Telegram.WebApp;
        tg.expand();
        
        const API_URL = "__WEBAPP_URL__";
        let userId = null;
        let isFishing = false;
        
        // Получаем ID пользователя из Telegram
        if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
            userId = tg.initDataUnsafe.user.id;
        } else {
            // Для тестирования вне Telegram
            userId = 'test_user_' + Math.floor(Math.random() * 1000000);
        }
        
        // Загрузка данных пользователя
        async function loadUserData() {
            try {
                const response = await fetch(`${API_URL}/api/user/${userId}`);
                const data = await response.json();
                
                document.getElementById('username').textContent = data.username;
                document.getElementById('level').textContent = data.level;
                document.getElementById('coins').textContent = Math.floor(data.coins);
                document.getElementById('total_fish').textContent = data.total_fish_caught;
                document.getElementById('combo').textContent = data.current_combo;
            } catch (error) {
                console.error('Error loading user data:', error);
                document.getElementById('username').textContent = 'Ошибка загрузки';
            }
        }
        
        // Начать рыбалку
        async function startFishing() {
            if (isFishing) return;
            
            isFishing = true;
            const button = document.getElementById('fishButton');
            const message = document.getElementById('message');
            const fishResult = document.getElementById('fishResult');
            
            button.disabled = true;
            fishResult.style.display = 'none';
            message.textContent = '🎣 Забрасываем удочку...';
            
            try {
                // Бросаем удочку
                const castResponse = await fetch(`${API_URL}/api/fish/${userId}/cast`, {
                    method: 'POST'
                });
                const castData = await castResponse.json();
                
                message.textContent = `⏱️ Ждём поклёвку... (${castData.wait_time.toFixed(1)}с)`;
                
                // Ждём
                await new Promise(resolve => setTimeout(resolve, castData.wait_time * 1000));
                
                message.textContent = '🎣 Подсекаем!';
                
                // Подсекаем рыбу
                const hookResponse = await fetch(`${API_URL}/api/fish/${userId}/hook`, {
                    method: 'POST'
                });
                const hookData = await hookResponse.json();
                
                // Показываем результат
                const fish = hookData.fish;
                fishResult.innerHTML = `
                    <div class="fish-name" style="color: ${fish.color}">
                        ${fish.is_critical ? '🔥 ' : ''}${fish.name}
                    </div>
                    <div class="fish-stats">
                        🎨 Редкость: ${fish.rarity}<br>
                        💰 Ценность: ${fish.coin_value} монет<br>
                        ⚖️ Вес: ${fish.weight} кг<br>
                        📏 Размер: ${fish.size} см<br>
                        ${fish.special_effects.length > 0 ? '✨ Эффекты: ' + fish.special_effects.join(', ') : ''}
                    </div>
                `;
                fishResult.style.display = 'block';
                
                message.textContent = `🎉 Поймано! +${fish.coin_value}💰 | Комбо: ${hookData.combo}🔥`;
                
                // Обновляем статистику
                await loadUserData();
                await loadInventory();
                
            } catch (error) {
                console.error('Error fishing:', error);
                message.textContent = '❌ Ошибка при рыбалке';
            } finally {
                button.disabled = false;
                isFishing = false;
            }
        }
        
        // Загрузка инвентаря
        async function loadInventory() {
            try {
                const response = await fetch(`${API_URL}/api/fish/${userId}/inventory`);
                const data = await response.json();
                
                const inventory = document.getElementById('inventory');
                const inventoryList = document.getElementById('inventoryList');
                
                if (data.fish.length > 0) {
                    inventory.style.display = 'block';
                    inventoryList.innerHTML = data.fish.slice(0, 5).map(fish => `
                        <div class="fish-item">
                            <strong style="color: ${fish.color}">${fish.name}</strong><br>
                            ${fish.rarity} | ${fish.coin_value}💰 | ${fish.weight}кг
                        </div>
                    `).join('');
                }
            } catch (error) {
                console.error('Error loading inventory:', error);
            }
        }
        
        // Инициализация
        loadUserData();
        loadInventory();
        
        // Настройка кнопки Telegram
        tg.MainButton.text = "Закрыть";
        tg.MainButton.show();
        tg.MainButton.onClick(() => tg.close());
    </script>
</body>
</html>
    """.replace("__WEBAPP_URL__", WEBAPP_URL)
    return html_content

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "backend:app",
        host="0.0.0.0",
        port=port,
        reload=False,
    )
