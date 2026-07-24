import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

# JWT Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "tournament-platform-super-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Database
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./tournament.db")

# Server
PORT = int(os.getenv("PORT", 8000))
HOST = os.getenv("HOST", "0.0.0.0")

# ===== PAYMENT CONFIGURATION =====
OWNER_UPI_ID = "sunnyapi@ptyes"
OWNER_BUSINESS_NAME = "Tournament Platform"
COMMISSION_PERCENTAGE = 15

# Binance Configuration
BINANCE_CONFIG = {
    "uid": "1054543146",
    "usdt_tron_address": "TLwAWcJ7Tm34jqyYqV6qhizQHy8pe7US1",
    "usdt_ton_address": "UQBVBgYY2ephk6XPdFWqdELGRCkQHQ9D60QzSJS6GbV11Qat",
}

# Prize Configuration
PRIZE_CONFIG = {
    "booyah_prize": 150,
    "per_kill_low": 5,
    "per_kill_high": 7,
}

# Default Tournament Settings
DEFAULT_TOURNAMENT = {
    "entry_fee": 30,
    "max_participants": 50,
    "min_participants": 5,
}

# UPI Payment Settings
UPI_TIMEOUT = 300
UPI_RETRY_ATTEMPTS = 3
