from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from config import DATABASE_URL
from models import Base

# Create engine
is_sqlite = DATABASE_URL.startswith("sqlite")

engine = create_engine(
    DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    connect_args={"check_same_thread": False} if is_sqlite else {},
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db() -> Session:
    """Dependency для FastAPI"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Создаёт все таблицы"""
    Base.metadata.create_all(bind=engine)

def drop_db():
    """Удаляет все таблицы (ТОЛЬКО ДЛЯ РАЗРАБОТКИ!)"""
    Base.metadata.drop_all(bind=engine)

def create_initial_locations(db: Session):
    """Создаёт начальные локации, если их нет"""
    from models import Location
    
    # Список начальных локаций
    initial_locations_data = [
        {"name": "Речной берег", "description": "Тихое место у реки, идеально для начинающих рыболовов", 
                 "unlock_level": 1, "base_coin_multiplier": 1.0, "biome_type": "river"},
        {"name": "Озеро у леса", "description": "Глубокое озеро в окружении векового леса", 
                 "unlock_level": 5, "base_coin_multiplier": 1.5, "biome_type": "lake"},
        {"name": "Горная река", "description": "Быстрая горная река с чистой водой", 
                 "unlock_level": 10, "base_coin_multiplier": 2.0, "biome_type": "mountain"},
        {"name": "Болотные топи", "description": "Загадочное болото с редкими видами рыб", 
                 "unlock_level": 15, "base_coin_multiplier": 2.5, "biome_type": "swamp"},
        {"name": "Океанский берег", "description": "Могучий океан полон удивительных существ", 
                 "unlock_level": 20, "base_coin_multiplier": 3.0, "biome_type": "ocean"},
        {"name": "Подводная пещера", "description": "Таинственная пещера на глубине", 
                 "unlock_level": 30, "base_coin_multiplier": 5.0, "biome_type": "cave"},
    ]

    for loc_data in initial_locations_data:
        if not db.query(Location).filter_by(name=loc_data["name"]).first():
            location = Location(**loc_data)
            db.add(location)
    db.commit()

def create_npc_fishermen(db: Session):
    """Создание NPC рыбаков"""
    from models import NPCFisherman
    npc_names = ["Fisherman_Alex", "Angler_Maria", "ProFisherman_Ivan", 
                 "SeaHunter_Bob", "DeepSea_Lisa", "RiverKing_Tom"]
    for name in npc_names:
        if not db.query(NPCFisherman).filter_by(name=name).first():
            npc = NPCFisherman(name=name)
            db.add(npc)
    db.commit()
