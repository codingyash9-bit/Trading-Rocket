# WARGAME_NOTE: The spec requested Alembic migrations and SQLAlchemy/Postgres models.
# However, the existing codebase uses a file-based JSON storage pattern without an ORM.
# Following the instruction: "If anything in this spec conflicts with existing code patterns,
# follow the existing code, not this spec, and flag the conflict in a comment."
# These models are implemented as Pydantic models instead of ORM models, and storage is handled via JSON.

from pydantic import BaseModel
from typing import Optional
from enum import Enum

class Direction(str, Enum):
    BULLISH = "BULLISH"
    BEARISH = "BEARISH"
    NEUTRAL = "NEUTRAL"

class MarketCapCategory(str, Enum):
    SMALL = "SMALL"
    MID = "MID"
    LARGE = "LARGE"

class PredictionStatus(str, Enum):
    OPEN = "OPEN"
    RESOLVED = "RESOLVED"

class Prediction(BaseModel):
    id: str
    case_id: str
    ticker: str
    user_id: str
    direction: Direction
    confidence_score: int
    price_at_call: float
    predicted_range_low: float
    predicted_range_high: float
    time_horizon_days: int
    falsification_condition: str
    falsification_price: float
    sector: str
    market_cap_category: MarketCapCategory
    sealed_at: str
    status: PredictionStatus
    epitaph: Optional[str] = None
    source: Optional[str] = None
