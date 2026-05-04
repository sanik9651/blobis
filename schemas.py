from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    username: Optional[str] = None

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int
    telegram_id: str
    first_name: Optional[str] = None
    coins: float
    level: int
    experience: float
    bite_speed: int
    critical_chance: int
    auto_hook: bool
    basket_capacity: int
    premium: bool
    total_fish_caught: int
    total_auctions_won: int
    total_auctions_sold: int
    current_combo: int
    created_at: datetime

    class Config:
        from_attributes = True

# Fish schemas
class FishBase(BaseModel):
    name: str
    rarity: str
    biome: str
    coin_value: int

class FishCreate(FishBase):
    owner_id: int

class Fish(FishBase):
    id: str
    owner_id: int
    description: Optional[str] = None
    image_url: Optional[str] = None
    color: Optional[str] = None
    weight: Optional[float] = None
    size: Optional[float] = None
    is_on_auction: bool
    caught_at: datetime

    class Config:
        from_attributes = True

# Auction schemas
class AuctionBase(BaseModel):
    initial_price: int
    duration_hours: int = 12

class AuctionCreate(AuctionBase):
    fish_id: str
    seller_id: int

class AuctionItem(AuctionBase):
    id: str
    fish_id: str
    seller_id: int
    winner_id: Optional[int] = None
    current_price: int
    created_at: datetime
    end_time: datetime
    is_completed: bool

    class Config:
        from_attributes = True

# Bid schemas
class BidBase(BaseModel):
    amount: int

class BidCreate(BidBase):
    auction_id: str
    bidder_id: int

class Bid(BidBase):
    id: str
    auction_id: str
    bidder_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Tournament schemas
class TournamentBase(BaseModel):
    name: str

class Tournament(TournamentBase):
    id: str
    created_at: datetime
    start_time: datetime
    end_time: datetime
    is_completed: bool
    first_place_reward: int
    participant_reward: int

    class Config:
        from_attributes = True

# AI Message schema
class AIMessage(BaseModel):
    text: str

# Location schema
class Location(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    unlock_level: int
    base_coin_multiplier: float
    biome_type: str

    class Config:
        from_attributes = True
