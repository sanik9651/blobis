import os
from dotenv import load_dotenv

load_dotenv()

# ============ TELEGRAM ============
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "your_token_here")

# ============ DATABASE ============
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/blobis_db"
)

# ============ HUGGING FACE ============
HF_API_TOKEN = os.getenv("HF_API_TOKEN", "")

# ============ APP ============
DEBUG = os.getenv("DEBUG", "True") == "True"
SERVER_HOST = os.getenv("SERVER_HOST", "0.0.0.0")
SERVER_PORT = int(os.getenv("SERVER_PORT", 8000))

# ============ GAME SETTINGS ============
DAILY_BONUS = 5
AUCTION_COMMISSION = 0.10  # 10%
REFERRAL_PERCENTAGE = 0.05  # 5% от улова реферала
REFERRAL_BONUS = 50  # Бонус за приглашение друга

# ============ PREMIUM ============
PREMIUM_PRICE_USD = 1.99
PREMIUM_DAILY_RARE_FISH = 5  # возможность чаще ловить редких рыб
FREE_DAILY_RARE_FISH = 1

# ============ FISHING ============
BASE_BITE_WAIT_TIME_MIN = 3  # секунды
BASE_BITE_WAIT_TIME_MAX = 15  # секунды
AUTO_HOOK_SUCCESS_RATE = 0.7  # 70% шанс успеха при автоподсечке
CRITICAL_FISH_CHANCE = 0.05  # 5%

# ============ COMBO ============
COMBO_3_BONUS = 1.1
COMBO_5_BONUS = 1.25
COMBO_10_BONUS = 1.5
COMBO_THRESHOLD_3 = 3
COMBO_THRESHOLD_5 = 5
COMBO_THRESHOLD_10 = 10

# ============ LEVEL ============
XP_PER_LEVEL_BASE = 100
LEVEL_COIN_BONUS = 50

# ============ TOURNAMENT ============
TOURNAMENT_DURATION_HOURS = 1
TOURNAMENT_FIRST_PLACE_REWARD = 1000
TOURNAMENT_PARTICIPANT_REWARD = 50
TOURNAMENT_TOP_10_REWARD = 200

# ============ FISH RARITY ============
RARITY_PROBABILITIES = {
    "common": 0.30,
    "rare": 0.40,
    "epic": 0.20,
    "legendary": 0.09,
    "mythical": 0.01
}

RARITY_COLORS = {
    "common": "#808080",
    "rare": "#0000FF",
    "epic": "#FFA500",
    "legendary": "#FFD700",
    "mythical": "#800080"
}
