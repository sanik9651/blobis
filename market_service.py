import hashlib
import json
import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud.firestore_v1 import transactional

logger = logging.getLogger(__name__)

# Initialize Firebase Admin SDK
try:
    cred = credentials.Certificate("firebase-credentials.json")
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    logger.info("Firebase Admin SDK initialized successfully")
except Exception as e:
    logger.warning(f"Firebase Admin SDK not initialized: {e}")
    db = None

# Constants
INITIAL_POOL_BC = 1000000.0
INITIAL_POOL_BLOB = 10000.0
TRADE_FEE = 0.003  # 0.3% fee
MAX_TRADES_PER_MINUTE = 10

class MarketService:
    def __init__(self):
        self.db = db
        self.pool_ref = db.collection('market').document('globalPool') if db else None
        self.trades_ref = db.collection('market').document('trades') if db else None
        self.candles_ref = db.collection('market').document('candles') if db else None

    def initialize_global_pool(self):
        """Initialize global liquidity pool if it doesn't exist"""
        if not self.pool_ref:
            return False

        try:
            pool_doc = self.pool_ref.get()
            if not pool_doc.exists:
                initial_data = {
                    'poolBC': INITIAL_POOL_BC,
                    'poolBLOB': INITIAL_POOL_BLOB,
                    'k': INITIAL_POOL_BC * INITIAL_POOL_BLOB,
                    'lastUpdate': firestore.SERVER_TIMESTAMP,
                    'version': 1
                }
                self.pool_ref.set(initial_data)
                logger.info(f"Global pool initialized: BC={INITIAL_POOL_BC}, BLOB={INITIAL_POOL_BLOB}")
                return True
            return True
        except Exception as e:
            logger.error(f"Failed to initialize global pool: {e}")
            return False

    def get_global_pool(self) -> Optional[Dict[str, Any]]:
        """Get current global pool state"""
        if not self.pool_ref:
            return None

        try:
            pool_doc = self.pool_ref.get()
            if pool_doc.exists:
                return pool_doc.to_dict()
            return None
        except Exception as e:
            logger.error(f"Failed to get global pool: {e}")
            return None

    def calculate_trade(self, pool_bc: float, pool_blob: float, amount: float, is_buy: bool) -> Dict[str, float]:
        """Calculate trade output using AMM formula x*y=k"""
        k = pool_bc * pool_blob

        if is_buy:
            # Buy BLOB with BC
            amount_with_fee = amount * (1 - TRADE_FEE)
            new_pool_bc = pool_bc + amount_with_fee
            new_pool_blob = k / new_pool_bc
            amount_out = pool_blob - new_pool_blob
            price = amount / amount_out if amount_out > 0 else 0
        else:
            # Sell BLOB for BC
            amount_with_fee = amount * (1 - TRADE_FEE)
            new_pool_blob = pool_blob + amount_with_fee
            new_pool_bc = k / new_pool_blob
            amount_out = pool_bc - new_pool_bc
            price = amount_out / amount if amount > 0 else 0

        # Calculate slippage
        current_price = pool_bc / pool_blob
        slippage = abs((price - current_price) / current_price * 100) if current_price > 0 else 0

        return {
            'amount_out': amount_out,
            'price': price,
            'slippage': slippage,
            'fee': amount * TRADE_FEE,
            'new_pool_bc': new_pool_bc,
            'new_pool_blob': new_pool_blob
        }

    def check_rate_limit(self, user_id: int) -> bool:
        """Check if user exceeded rate limit (max 10 trades per minute)"""
        if not self.db:
            return True

        try:
            one_minute_ago = datetime.utcnow() - timedelta(minutes=1)
            trades_query = self.db.collection('market').document('trades').collection('recent') \
                .where('userId', '==', str(user_id)) \
                .where('timestamp', '>=', one_minute_ago) \
                .limit(MAX_TRADES_PER_MINUTE + 1)

            trades = list(trades_query.stream())
            return len(trades) < MAX_TRADES_PER_MINUTE
        except Exception as e:
            logger.error(f"Failed to check rate limit: {e}")
            return True  # Allow trade if check fails

    def generate_trade_hash(self, trade_data: Dict[str, Any]) -> str:
        """Generate SHA256 hash for trade validation"""
        trade_string = json.dumps(trade_data, sort_keys=True)
        return hashlib.sha256(trade_string.encode()).hexdigest()

    @transactional
    def execute_trade_transaction(self, transaction, user_id: int, trade_type: str, amount: float, max_slippage: float) -> Dict[str, Any]:
        """Execute trade in a Firebase transaction for atomicity"""
        # Get current pool state
        pool_snapshot = self.pool_ref.get(transaction=transaction)
        pool_data = pool_snapshot.to_dict()

        pool_bc = pool_data['poolBC']
        pool_blob = pool_data['poolBLOB']

        # Calculate trade
        is_buy = trade_type == "BUY"
        calc = self.calculate_trade(pool_bc, pool_blob, amount, is_buy)

        # Check slippage
        if calc['slippage'] > max_slippage:
            raise ValueError(f"Slippage {calc['slippage']:.2f}% exceeds maximum {max_slippage}%")

        # Update pool
        transaction.update(self.pool_ref, {
            'poolBC': calc['new_pool_bc'],
            'poolBLOB': calc['new_pool_blob'],
            'lastUpdate': firestore.SERVER_TIMESTAMP
        })

        # Create trade record
        trade_id = f"{user_id}_{int(datetime.utcnow().timestamp() * 1000)}"
        trade_data = {
            'userId': str(user_id),
            'type': trade_type,
            'amountIn': amount,
            'amountOut': calc['amount_out'],
            'price': calc['price'],
            'fee': calc['fee'],
            'slippage': calc['slippage'],
            'timestamp': firestore.SERVER_TIMESTAMP
        }

        # Generate hash
        hash_data = {**trade_data, 'tradeId': trade_id}
        trade_hash = self.generate_trade_hash(hash_data)
        trade_data['hash'] = trade_hash

        # Save trade
        trade_ref = self.db.collection('market').document('trades').collection('recent').document(trade_id)
        transaction.set(trade_ref, trade_data)

        return {
            'trade_id': trade_id,
            'hash': trade_hash,
            **calc
        }

    def execute_trade(self, user_id: int, trade_type: str, amount: float, max_slippage: float = 5.0) -> Optional[Dict[str, Any]]:
        """Execute a trade with validation and atomicity"""
        if not self.db or not self.pool_ref:
            logger.error("Firebase not initialized")
            return None

        # Check rate limit
        if not self.check_rate_limit(user_id):
            raise ValueError("Rate limit exceeded. Maximum 10 trades per minute.")

        # Validate inputs
        if amount <= 0:
            raise ValueError("Amount must be positive")

        if trade_type not in ["BUY", "SELL"]:
            raise ValueError("Trade type must be BUY or SELL")

        try:
            # Execute in transaction
            transaction = self.db.transaction()
            result = self.execute_trade_transaction(transaction, user_id, trade_type, amount, max_slippage)

            logger.info(f"Trade executed: user={user_id}, type={trade_type}, amount={amount}, price={result['price']:.2f}")
            return result

        except Exception as e:
            logger.error(f"Failed to execute trade: {e}")
            raise

    def get_candles(self, timeframe: str = '1m', limit: int = 100) -> list:
        """Get candles for specified timeframe"""
        if not self.db:
            return []

        try:
            candles_query = self.db.collection('market').document('candles').collection(timeframe) \
                .order_by('timestamp', direction=firestore.Query.DESCENDING) \
                .limit(limit)

            candles = []
            for doc in candles_query.stream():
                candle_data = doc.to_dict()
                candles.append(candle_data)

            return list(reversed(candles))  # Return in chronological order
        except Exception as e:
            logger.error(f"Failed to get candles: {e}")
            return []

    def get_24h_stats(self) -> Optional[Dict[str, Any]]:
        """Calculate 24h market statistics"""
        if not self.db:
            return None

        try:
            # Get trades from last 24 hours
            twenty_four_hours_ago = datetime.utcnow() - timedelta(hours=24)
            trades_query = self.db.collection('market').document('trades').collection('recent') \
                .where('timestamp', '>=', twenty_four_hours_ago)

            trades = list(trades_query.stream())

            if not trades:
                pool = self.get_global_pool()
                current_price = pool['poolBC'] / pool['poolBLOB'] if pool else 0
                return {
                    'volume_24h': 0,
                    'high_24h': current_price,
                    'low_24h': current_price,
                    'change_24h': 0,
                    'change_percent_24h': 0,
                    'trades_24h': 0,
                    'current_price': current_price
                }

            # Calculate stats
            prices = [t.to_dict()['price'] for t in trades]
            volumes = [t.to_dict()['amountIn'] for t in trades]

            first_price = prices[0]
            current_price = prices[-1]

            stats = {
                'volume_24h': sum(volumes),
                'high_24h': max(prices),
                'low_24h': min(prices),
                'change_24h': current_price - first_price,
                'change_percent_24h': ((current_price - first_price) / first_price * 100) if first_price > 0 else 0,
                'trades_24h': len(trades),
                'current_price': current_price
            }

            return stats
        except Exception as e:
            logger.error(f"Failed to get 24h stats: {e}")
            return None

# Global instance
market_service = MarketService()
