# Blobis Exchange - Setup Guide

## Backend API Endpoints (Phase 1 Complete)

### Market Trading API

#### 1. Get Global Pool State
```
GET /api/market/pool
```
Returns current liquidity pool state:
```json
{
  "pool_bc": 1000000.0,
  "pool_blob": 10000.0,
  "k": 10000000000.0,
  "current_price": 100.0,
  "last_update": "2026-05-10T10:55:00Z"
}
```

#### 2. Execute Trade
```
POST /api/market/trade
```
Request body:
```json
{
  "user_id": 123456,
  "trade_type": "BUY",  // or "SELL"
  "amount": 100.0,
  "max_slippage": 5.0
}
```

Response:
```json
{
  "success": true,
  "trade_id": "123456_1715342100000",
  "amount_in": 100.0,
  "amount_out": 0.997,
  "price": 100.3,
  "slippage": 0.3,
  "fee": 0.3,
  "new_balance_bc": 900.0,
  "new_balance_blob": 0.997,
  "hash": "sha256_hash_here",
  "timestamp": "2026-05-10T10:55:00Z"
}
```

#### 3. Get Candles
```
GET /api/market/candles/{timeframe}?limit=100
```
Timeframes: `1m`, `5m`, `15m`, `1h`, `4h`, `1d`

Response:
```json
{
  "timeframe": "1m",
  "candles": [
    {
      "timestamp": 1715342100,
      "open": 100.0,
      "high": 102.5,
      "low": 99.5,
      "close": 101.0,
      "volume": 1500.0,
      "trades": 25
    }
  ]
}
```

#### 4. Get 24h Statistics
```
GET /api/market/stats
```
Response:
```json
{
  "volume_24h": 150000.0,
  "high_24h": 105.5,
  "low_24h": 92.3,
  "change_24h": 5.2,
  "change_percent_24h": 5.46,
  "trades_24h": 1250,
  "current_price": 100.5
}
```

## Firebase Setup

### 1. Create Firebase Service Account

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **blobis**
3. Go to **Project Settings** → **Service Accounts**
4. Click **Generate New Private Key**
5. Save the JSON file as `firebase-credentials.json` in project root

### 2. Configure Firebase Admin SDK

The `firebase-credentials.json` should look like:
```json
{
  "type": "service_account",
  "project_id": "blobis",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@blobis.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

### 3. Deploy to Render.com

#### Option A: Upload credentials via Render Dashboard
1. Go to your service on Render.com
2. Navigate to **Environment** tab
3. Add **Secret File**:
   - **Filename**: `firebase-credentials.json`
   - **Contents**: Paste your Firebase credentials JSON

#### Option B: Use environment variable
Convert the JSON to base64 and add as env var:
```bash
cat firebase-credentials.json | base64 > firebase-credentials.base64
```

Then in `market_service.py`, decode it:
```python
import base64
import json
import os

firebase_creds_base64 = os.getenv('FIREBASE_CREDENTIALS_BASE64')
if firebase_creds_base64:
    creds_json = base64.b64decode(firebase_creds_base64)
    cred = credentials.Certificate(json.loads(creds_json))
```

### 4. Update Firestore Security Rules

Go to Firebase Console → Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Global pool - read only for clients
    match /market/globalPool {
      allow read: if true;
      allow write: if false;  // Only backend can write
    }
    
    // Trades - read only for clients
    match /market/trades/{document=**} {
      allow read: if true;
      allow write: if false;  // Only backend can write
    }
    
    // Candles - read only for clients
    match /market/candles/{document=**} {
      allow read: if true;
      allow write: if false;  // Only backend can write
    }
    
    // User balances - authenticated users can read their own
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if false;  // Only backend can write
    }
  }
}
```

## Security Features Implemented

✅ **Global liquidity pool** - All players trade in one pool (no local manipulation)
✅ **Backend validation** - All trades validated on server
✅ **Firebase Transactions** - Atomic operations prevent race conditions
✅ **Rate limiting** - Max 10 trades per minute per user
✅ **Trade hashing** - SHA256 hash for validation
✅ **Slippage protection** - Configurable max slippage per trade
✅ **No localStorage for critical data** - Balances only in Firebase
✅ **Firebase Security Rules** - Clients can only read, not write

## Testing Locally

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Add `firebase-credentials.json` to project root

3. Run backend:
```bash
python backend.py
```

4. Test API:
```bash
# Get pool state
curl http://localhost:10000/api/market/pool

# Execute trade
curl -X POST http://localhost:10000/api/market/trade \
  -H "Content-Type: application/json" \
  -d '{"user_id": 123, "trade_type": "BUY", "amount": 100, "max_slippage": 5.0}'
```

## Next Steps (Phase 2)

- [ ] Market maker bots for liquidity
- [ ] Candle aggregation system
- [ ] Multiple timeframes support
- [ ] Technical indicators (MA/EMA)
- [ ] Professional UI components

## Architecture

```
Frontend (React)
  ↓
  useMarket.js hook
  ↓
  API calls to backend
  ↓
Backend (FastAPI)
  ↓
  market_service.py
  ↓
Firebase Firestore
  - /market/globalPool (single source of truth)
  - /market/trades/recent (last 1000 trades)
  - /market/candles/{timeframe} (OHLC data)
  - /users/{userId} (balances)
```

## Rate Limits

- **Trades**: 10 per minute per user
- **Pool refresh**: Every 10 seconds (frontend)
- **Stats refresh**: Every 10 seconds (frontend)

## Trading Fees

- **Fee**: 0.3% per trade
- **Slippage**: Calculated using AMM formula (x*y=k)
- **Price impact**: Depends on trade size relative to pool
