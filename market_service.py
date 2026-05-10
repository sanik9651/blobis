import hashlib
import json
import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from firestore_client import firestore

logger = logging.getLogger(__name__)

# Constants
INITIAL_POOL_BC = 1000000.0
INITIAL_POOL_BLOB = 10000.0
TRADE_FEE = 0.003  # 0.3% fee
MAX_TRADES_PER_MINUTE = 10

class MarketService:
    def __init__(self):
        self.firestore = firestore
        logger.info("Market service initialized with Firestore REST API")

    def initialize_global_pool(self):
        """Initialize global liquidity pool if it doesn't exist"""
        pool = self.firestore.get_document('market/globalPool')

        if not pool:
            initial_data = {
                'poolBC': INITIAL_POOL_BC,
                'poolBLOB': INITIAL_POOL_BLOB,
                'k': INITIAL_POOL_BC * INITIAL_POOL_BLOB,
                'lastUpdate': datetime.utcnow(),
                'version': 1
            }
            success = self.firestore.set_document('market/globalPool', initial_data)
            if success:
                logger.info(f"Global pool initialized: BC={INITIAL_POOL_BC}, BLOB={INITIAL_POOL_BLOB}")
            return success

        logger.info(f"Global pool already exists: BC={pool.get('poolBC')}, BLOB={pool.get('poolBLOB')}")
        return True

    def get_global_pool(self) -> Optional[Dict[str, Any]]:
        """Get current global pool state"""
        pool = self.firestore.get_document('market/globalPool')
        if not pool:
            # Initialize if doesn't exist
            self.initialize_global_pool()
            pool = self.firestore.get_document('market/globalPool')
        return pool

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
        # For now, always allow (rate limiting can be added later with Firestore queries)
        return True

    def generate_trade_hash(self, trade_data: Dict[str, Any]) -> str:
        """Generate SHA256 hash for trade validation"""
        trade_string = json.dumps(trade_data, sort_keys=True, default=str)
        return hashlib.sha256(trade_string.encode()).hexdigest()

    def execute_trade(self, user_id: int, trade_type: str, amount: float, max_slippage: float = 5.0) -> Optional[Dict[str, Any]]:
        """Execute a trade with validation"""
        # Validate inputs
        if amount <= 0:
            raise ValueError("Amount must be positive")

        if trade_type not in ["BUY", "SELL"]:
            raise ValueError("Trade type must be BUY or SELL")

        # Check rate limit
        if not self.check_rate_limit(user_id):
            raise ValueError("Rate limit exceeded. Maximum 10 trades per minute.")

        try:
            # Get current pool
            pool = self.get_global_pool()
            if not pool:
                raise ValueError("Pool not initialized")

            pool_bc = pool['poolBC']
            pool_blob = pool['poolBLOB']

            # Calculate trade
            is_buy = trade_type == "BUY"
            calc = self.calculate_trade(pool_bc, pool_blob, amount, is_buy)

            # Check slippage
            if calc['slippage'] > max_slippage:
                raise ValueError(f"Slippage {calc['slippage']:.2f}% exceeds maximum {max_slippage}%")

            # Update pool in Firestore
            new_pool = {
                'poolBC': calc['new_pool_bc'],
                'poolBLOB': calc['new_pool_blob'],
                'k': calc['new_pool_bc'] * calc['new_pool_blob'],
                'lastUpdate': datetime.utcnow(),
                'version': pool.get('version', 1)
            }

            success = self.firestore.set_document('market/globalPool', new_pool)
            if not success:
                raise ValueError("Failed to update pool")

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
                'timestamp': datetime.utcnow()
            }

            # Generate hash
            hash_data = {**trade_data, 'tradeId': trade_id}
            trade_hash = self.generate_trade_hash(hash_data)
            trade_data['hash'] = trade_hash

            # Save trade to Firestore
            self.firestore.set_document(f'market/trades/{trade_id}', trade_data)

            logger.info(f"Trade executed: user={user_id}, type={trade_type}, amount={amount}, price={calc['price']:.2f}")

            return {
                'trade_id': trade_id,
                'hash': trade_hash,
                **calc
            }

        except Exception as e:
            logger.error(f"Failed to execute trade: {e}")
            raise

    def get_candles(self, timeframe: str = '1m', limit: int = 100) -> list:
        """Get candles for specified timeframe"""
        # Return empty for now, will be populated by aggregation system
        return []

    def get_24h_stats(self) -> Optional[Dict[str, Any]]:
        """Calculate 24h market statistics"""
        pool = self.get_global_pool()
        current_price = pool['poolBC'] / pool['poolBLOB'] if pool and pool['poolBLOB'] > 0 else 0

        # Return basic stats (can be enhanced with trade history later)
        return {
            'volume_24h': 0,
            'high_24h': current_price,
            'low_24h': current_price,
            'change_24h': 0,
            'change_percent_24h': 0,
            'trades_24h': 0,
            'current_price': current_price
        }

# Global instance
market_service = MarketService()
