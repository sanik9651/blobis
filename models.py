from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime, timedelta
import uuid

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True)
    telegram_id = Column(String(50), unique=True, nullable=False)
    username = Column(String(100), unique=True, nullable=True)
    first_name = Column(String(100), nullable=True)
    
    # Fishing progress
    coins = Column(Float, default=0)
    blob_balance = Column(Float, default=0)  # $BLOB token balance
    level = Column(Integer, default=1)
    experience = Column(Float, default=0)
    
    # Upgrades
    bite_speed = Column(Integer, default=1)  # Reduces wait time
    critical_chance = Column(Integer, default=5)  # Critical catch chance %
    auto_hook = Column(Boolean, default=False)  # Auto hook
    basket_capacity = Column(Integer, default=10)  # Basket capacity
    
    # Current location
    current_location_id = Column(Integer, ForeignKey("locations.id"), default=1)
    
    # Premium
    premium = Column(Boolean, default=False)
    premium_until = Column(DateTime, nullable=True)
    
    # Referral
    referrer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    referrer = relationship("User", remote_side=[id], backref="referrals")
    referral_coins_earned = Column(Float, default=0)
    referral_code = Column(String(20), unique=True, nullable=True)
    
    # Stats
    total_fish_caught = Column(Integer, default=0)
    total_auctions_won = Column(Integer, default=0)
    total_auctions_sold = Column(Integer, default=0)
    last_daily_bonus = Column(DateTime, nullable=True)
    current_combo = Column(Integer, default=0)  # Current fishing combo
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    fish_inventory = relationship("Fish", back_populates="owner")
    auctions = relationship("Auction", back_populates="seller", foreign_keys="Auction.seller_id")
    bids = relationship("Bid", back_populates="bidder")
    quests = relationship("Quest", back_populates="user")
    location = relationship("Location", backref="users")


class Location(Base):
    __tablename__ = "locations"
    
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    unlock_level = Column(Integer, default=1)
    base_coin_multiplier = Column(Float, default=1.0)
    biome_type = Column(String(50), nullable=False)  # river, lake, ocean, swamp, mountain, cave
    
    created_at = Column(DateTime, default=datetime.utcnow)


class Fish(Base):
    __tablename__ = "fish"
    
    id = Column(String(50), primary_key=True, default=lambda: str(uuid.uuid4()))
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    owner = relationship("User", back_populates="fish_inventory")
    
    # Fish data
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    rarity = Column(String(20), nullable=False)  # common, rare, epic, legendary, mythical
    biome = Column(String(50), nullable=False)  # river, lake, ocean, etc.
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=True)
    
    # Visual
    image_url = Column(String(500), nullable=True)
    color = Column(String(30), nullable=True)
    
    # Stats
    weight = Column(Float, nullable=True)  # Weight in kg
    size = Column(Float, nullable=True)  # Size in cm
    coin_value = Column(Integer, nullable=False)  # Base value
    
    # Special effects
    special_effects = Column(Text, nullable=True)  # JSON string with effects
    
    # Metadata
    is_on_auction = Column(Boolean, default=False)
    caught_at = Column(DateTime, default=datetime.utcnow)


class Auction(Base):
    __tablename__ = "auctions"
    
    id = Column(String(50), primary_key=True, default=lambda: str(uuid.uuid4()))
    fish_id = Column(String(50), ForeignKey("fish.id"), nullable=False)
    fish = relationship("Fish", backref="auction")
    
    seller_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    seller = relationship("User", back_populates="auctions", foreign_keys=[seller_id])
    
    winner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    winner = relationship("User", foreign_keys=[winner_id])
    
    initial_price = Column(Integer, nullable=False)
    current_price = Column(Integer, nullable=False)
    duration_hours = Column(Integer, default=12)  # 4, 12, 24
    
    created_at = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=False)
    is_completed = Column(Boolean, default=False)
    
    # Relationships
    bids = relationship("Bid", back_populates="auction", cascade="all, delete-orphan")
    
    def is_active(self):
        return not self.is_completed and datetime.utcnow() < self.end_time


class Bid(Base):
    __tablename__ = "bids"
    
    id = Column(String(50), primary_key=True, default=lambda: str(uuid.uuid4()))
    auction_id = Column(String(50), ForeignKey("auctions.id"), nullable=False)
    auction = relationship("Auction", back_populates="bids")
    
    bidder_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    bidder = relationship("User", back_populates="bids")
    
    amount = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Quest(Base):
    __tablename__ = "quests"
    
    id = Column(String(50), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user = relationship("User", back_populates="quests")
    
    quest_type = Column(String(50), nullable=False)  # catch_fish, rare_fish, combo, etc.
    description = Column(String(255), nullable=False)
    progress = Column(Integer, default=0)
    target = Column(Integer, default=30)
    reward = Column(Integer, nullable=False)
    completed = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    def is_daily_reset(self):
        """Check if daily reset is needed"""
        if self.created_at:
            return datetime.utcnow() - self.created_at > timedelta(days=1)
        return False


class NPCFisherman(Base):
    __tablename__ = "npc_fishermen"
    
    id = Column(Integer, primary_key=True)
    name = Column(String(100), unique=True, nullable=False)
    coins = Column(Float, default=1000)
    total_fish_caught = Column(Integer, default=0)
    total_auctions_sold = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    last_action = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    fish_inventory = relationship("NPCFish", back_populates="owner")


class NPCFish(Base):
    __tablename__ = "npc_fish"
    
    id = Column(String(50), primary_key=True, default=lambda: str(uuid.uuid4()))
    owner_id = Column(Integer, ForeignKey("npc_fishermen.id"), nullable=False)
    owner = relationship("NPCFisherman", back_populates="fish_inventory")
    
    name = Column(String(200), nullable=False)
    rarity = Column(String(20), nullable=False)
    coin_value = Column(Integer, default=50)
    
    created_at = Column(DateTime, default=datetime.utcnow)


class Tournament(Base):
    __tablename__ = "tournaments"
    
    id = Column(String(50), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=False)
    is_completed = Column(Boolean, default=False)
    
    # Rewards
    first_place_reward = Column(Integer, default=1000)
    participant_reward = Column(Integer, default=50)
    
    def is_active(self):
        return not self.is_completed and datetime.utcnow() < self.end_time


class TournamentResult(Base):
    __tablename__ = "tournament_results"
    
    id = Column(String(50), primary_key=True, default=lambda: str(uuid.uuid4()))
    tournament_id = Column(String(50), ForeignKey("tournaments.id"), nullable=False)
    tournament = relationship("Tournament", backref="results")
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user = relationship("User", backref="tournament_results")
    
    total_value = Column(Integer, default=0)  # Total value of caught fish
    rank = Column(Integer, nullable=True)
    reward = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.utcnow)


class Achievement(Base):
    __tablename__ = "achievements"
    
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    requirement_type = Column(String(50), nullable=False)  # total_fish, level, coins, etc.
    requirement_value = Column(Integer, nullable=False)
    reward = Column(Integer, nullable=False)
    is_hidden = Column(Boolean, default=False)


class UserAchievement(Base):
    __tablename__ = "user_achievements"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user = relationship("User", backref="user_achievements")
    achievement_id = Column(Integer, ForeignKey("achievements.id"), nullable=False)
    achievement = relationship("Achievement", backref="user_achievements")
    
    unlocked_at = Column(DateTime, default=datetime.utcnow)
