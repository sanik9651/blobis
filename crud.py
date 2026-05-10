import random
import uuid
import logging
from datetime import datetime, timedelta
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import desc

import models
from config import (
    RARITY_PROBABILITIES, RARITY_COLORS, DAILY_BONUS,
    XP_PER_LEVEL_BASE, LEVEL_COIN_BONUS, AUCTION_COMMISSION,
    REFERRAL_BONUS, REFERRAL_PERCENTAGE, TOURNAMENT_DURATION_HOURS,
    TOURNAMENT_FIRST_PLACE_REWARD, TOURNAMENT_PARTICIPANT_REWARD
)

logger = logging.getLogger(__name__)

# ============ USER CRUD ============
def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_telegram_id(db: Session, telegram_id: str):
    return db.query(models.User).filter(models.User.telegram_id == telegram_id).first()

def create_user(db: Session, user_id: int, username: str, first_name: str = None):
    referral_code = str(uuid.uuid4())[:8]
    db_user = models.User(
        id=user_id,
        telegram_id=str(user_id),
        username=username,
        first_name=first_name,
        referral_code=referral_code,
        current_location_id=1
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user_username(db: Session, user_id: int, username: str):
    db_user = get_user(db, user_id)
    if db_user:
        db_user.username = username
        db.commit()
        db.refresh(db_user)
    return db_user

def add_coins(db: Session, user_id: int, amount: float):
    db_user = get_user(db, user_id)
    if db_user:
        db_user.coins += amount
        db.commit()
        db.refresh(db_user)
    return db_user

def add_blob(db: Session, user_id: int, amount: float):
    """Add BLOB tokens to user balance"""
    db_user = get_user(db, user_id)
    if db_user:
        db_user.blob_balance += amount
        db.commit()
        db.refresh(db_user)
    return db_user

def get_blob_balance(db: Session, user_id: int) -> float:
    """Get user's BLOB token balance"""
    db_user = get_user(db, user_id)
    return db_user.blob_balance if db_user else 0.0

def add_experience(db: Session, user_id: int, xp: float):
    db_user = get_user(db, user_id)
    if db_user:
        db_user.experience += xp
        # Check level up
        xp_needed = XP_PER_LEVEL_BASE * db_user.level
        while db_user.experience >= xp_needed:
            db_user.experience -= xp_needed
            db_user.level += 1
            db_user.coins += LEVEL_COIN_BONUS
            xp_needed = XP_PER_LEVEL_BASE * db_user.level
        db.commit()
        db.refresh(db_user)
    return db_user

def get_daily_bonus(db: Session, user_id: int):
    db_user = get_user(db, user_id)
    if not db_user:
        return None

    now = datetime.utcnow()
    if db_user.last_daily_bonus:
        time_since_last = now - db_user.last_daily_bonus
        if time_since_last < timedelta(days=1):
            return None

    db_user.coins += DAILY_BONUS
    db_user.last_daily_bonus = now
    db.commit()
    db.refresh(db_user)
    return db_user

# ============ FISH CRUD ============
def generate_random_fish(db: Session, user_id: int, location_id: int = 1):
    """Generate a random fish based on rarity probabilities"""
    location = db.query(models.Location).filter(models.Location.id == location_id).first()
    if not location:
        # Если локация не найдена, создаём дефолтную
        logger.warning(f"Location {location_id} not found, using default")
        location = models.Location(
            id=1,
            name="Речной берег",
            description="Тихое место у реки",
            unlock_level=1,
            base_coin_multiplier=1.0,
            biome_type="river"
        )
        db.add(location)
        db.commit()
        db.refresh(location)

    # Select rarity
    rand = random.random()
    cumulative = 0
    selected_rarity = "common"
    for rarity, prob in RARITY_PROBABILITIES.items():
        cumulative += prob
        if rand <= cumulative:
            selected_rarity = rarity
            break

    # Generate fish properties
    base_value = {
        "common": random.randint(5, 15),
        "rare": random.randint(20, 50),
        "epic": random.randint(60, 150),
        "legendary": random.randint(200, 500),
        "mythical": random.randint(600, 2000)
    }

    fish_names = [
        "Карп", "Щука", "Окунь", "Судак", "Сом", "Лещ", "Плотва",
        "Форель", "Лосось", "Тунец", "Акула", "Скат", "Угорь",
        "Золотая рыбка", "Дракон", "Левиафан", "Кракен"
    ]

    fish_name = random.choice(fish_names)
    coin_value = int(base_value[selected_rarity] * location.base_coin_multiplier)

    db_fish = models.Fish(
        id=str(uuid.uuid4()),
        owner_id=user_id,
        name=fish_name,
        rarity=selected_rarity,
        biome=location.biome_type,
        location_id=location_id,
        coin_value=coin_value,
        color=RARITY_COLORS.get(selected_rarity, "#FFFFFF"),
        weight=round(random.uniform(0.5, 50.0), 2),
        size=round(random.uniform(10.0, 200.0), 2)
    )

    db.add(db_fish)
    db.commit()
    db.refresh(db_fish)
    return db_fish

def perform_fishing(db: Session, user_id: int):
    """Perform fishing action for user"""
    db_user = get_user(db, user_id)
    if not db_user:
        return None

    # Generate fish
    fish = generate_random_fish(db, user_id, db_user.current_location_id)

    # Update user stats
    db_user.total_fish_caught += 1
    db_user.current_combo += 1

    # Add XP
    xp_gain = fish.coin_value * 0.1
    add_experience(db, user_id, xp_gain)

    db.commit()

    return type('FishingResult', (), {'fish': fish, 'user': db_user})()

def get_fish(db: Session, fish_id: str):
    return db.query(models.Fish).filter(models.Fish.id == fish_id).first()

def get_user_inventory(db: Session, user_id: int):
    return db.query(models.Fish).filter(
        models.Fish.owner_id == user_id,
        models.Fish.is_on_auction == False
    ).all()

def sell_fish_to_shop(db: Session, fish_id: str, user_id: int):
    """Sell fish to shop for coins"""
    db_fish = get_fish(db, fish_id)
    if not db_fish or db_fish.owner_id != user_id or db_fish.is_on_auction:
        return None

    db_user = get_user(db, user_id)
    if not db_user:
        return None

    # Add coins to user
    db_user.coins += db_fish.coin_value

    # Delete fish
    db.delete(db_fish)
    db.commit()
    db.refresh(db_user)

    return db_user

# ============ AUCTION CRUD ============
def add_fish_to_auction(db: Session, fish_id: str, user_id: int, starting_price: float, duration_hours: int = 12):
    db_fish = get_fish(db, fish_id)
    if not db_fish or db_fish.owner_id != user_id or db_fish.is_on_auction:
        return None

    db_fish.is_on_auction = True

    auction = models.Auction(
        id=str(uuid.uuid4()),
        fish_id=fish_id,
        seller_id=user_id,
        initial_price=int(starting_price),
        current_price=int(starting_price),
        duration_hours=duration_hours,
        end_time=datetime.utcnow() + timedelta(hours=duration_hours)
    )

    db.add(auction)
    db.commit()
    db.refresh(auction)
    return auction

def place_bid(db: Session, item_id: str, user_id: int, bid_amount: float):
    auction = db.query(models.Auction).filter(models.Auction.id == item_id).first()
    if not auction or not auction.is_active():
        return None

    if bid_amount <= auction.current_price:
        return None

    db_user = get_user(db, user_id)
    if not db_user or db_user.coins < bid_amount:
        return None

    # Create bid
    bid = models.Bid(
        id=str(uuid.uuid4()),
        auction_id=item_id,
        bidder_id=user_id,
        amount=int(bid_amount)
    )

    auction.current_price = int(bid_amount)
    auction.winner_id = user_id

    db.add(bid)
    db.commit()
    db.refresh(auction)
    return auction

def finalize_auction(db: Session, item_id: str):
    auction = db.query(models.Auction).filter(models.Auction.id == item_id).first()
    if not auction or auction.is_completed:
        return None

    auction.is_completed = True

    if auction.winner_id:
        # Transfer fish to winner
        fish = get_fish(db, auction.fish_id)
        if fish:
            fish.owner_id = auction.winner_id
            fish.is_on_auction = False

        # Deduct coins from winner
        winner = get_user(db, auction.winner_id)
        if winner:
            winner.coins -= auction.current_price
            winner.total_auctions_won += 1

        # Add coins to seller (minus commission)
        seller = get_user(db, auction.seller_id)
        if seller:
            seller.coins += auction.current_price * (1 - AUCTION_COMMISSION)
            seller.total_auctions_sold += 1
    else:
        # No winner, return fish to seller
        fish = get_fish(db, auction.fish_id)
        if fish:
            fish.is_on_auction = False

    db.commit()
    db.refresh(auction)
    return auction

def get_active_auctions(db: Session):
    return db.query(models.Auction).filter(
        models.Auction.is_completed == False,
        models.Auction.end_time > datetime.utcnow()
    ).all()

# ============ LEADERBOARD ============
def get_leaderboard(db: Session, limit: int = 100):
    return db.query(models.User).order_by(desc(models.User.coins)).limit(limit).all()

# ============ REFERRAL ============
def add_referral(db: Session, user_id: int, referrer_id: int):
    db_user = get_user(db, user_id)
    db_referrer = get_user(db, referrer_id)

    if not db_user or not db_referrer or db_user.referrer_id:
        return None

    db_user.referrer_id = referrer_id
    db_referrer.coins += REFERRAL_BONUS

    db.commit()
    db.refresh(db_user)
    return db_user

# ============ TOURNAMENT ============
def get_current_tournament(db: Session):
    return db.query(models.Tournament).filter(
        models.Tournament.is_completed == False,
        models.Tournament.end_time > datetime.utcnow()
    ).first()

def start_new_tournament(db: Session):
    tournament = models.Tournament(
        id=str(uuid.uuid4()),
        name=f"Tournament {datetime.utcnow().strftime('%Y-%m-%d %H:%M')}",
        end_time=datetime.utcnow() + timedelta(hours=TOURNAMENT_DURATION_HOURS),
        first_place_reward=TOURNAMENT_FIRST_PLACE_REWARD,
        participant_reward=TOURNAMENT_PARTICIPANT_REWARD
    )
    db.add(tournament)
    db.commit()
    db.refresh(tournament)
    return tournament

def end_tournament(db: Session, tournament_id: str):
    tournament = db.query(models.Tournament).filter(models.Tournament.id == tournament_id).first()
    if not tournament:
        return None

    tournament.is_completed = True
    db.commit()
    db.refresh(tournament)
    return tournament
