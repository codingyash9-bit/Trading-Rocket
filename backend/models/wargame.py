from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum
from datetime import datetime

class WargameStatus(str, Enum):
    PENDING = "PENDING"
    ACTIVE = "ACTIVE"
    RESOLVED = "RESOLVED"
    EXPIRED = "EXPIRED"

class EarningsTime(str, Enum):
    PRE_MARKET = "PRE_MARKET"
    POST_MARKET = "POST_MARKET"
    UNKNOWN = "UNKNOWN"

class ScenarioType(str, Enum):
    BULL = "BULL"
    BASE = "BASE"
    BEAR = "BEAR"

class PositionDirection(str, Enum):
    LONG = "LONG"
    SHORT = "SHORT"

class WargameVerdict(str, Enum):
    SHARP = "SHARP"
    SOLID = "SOLID"
    PARTIAL = "PARTIAL"
    WRONG = "WRONG"

class WargameEvent(BaseModel):
    id: str # UUID
    event_id: str # WG-XXXX
    user_id: str
    ticker: str
    company_name: str
    earnings_date: str
    earnings_time: EarningsTime = EarningsTime.UNKNOWN
    quarter: str
    status: WargameStatus = WargameStatus.PENDING
    detected_at: str
    sealed_at: Optional[str] = None
    resolved_at: Optional[str] = None

class WargameScenario(BaseModel):
    id: str
    event_id: str
    scenario_type: ScenarioType
    probability: int
    price_move_low: float
    price_move_high: float
    price_target_low: float
    price_target_high: float
    primary_trigger: str
    killer_condition: str
    ai_reasoning: str
    generated_at: str

class WargamePosition(BaseModel):
    id: str
    event_id: str
    user_id: str
    chosen_scenario: ScenarioType
    paper_position_size: float
    paper_position_direction: PositionDirection
    price_at_seal: float
    sealed_at: str
    is_locked: bool = False

class WargameOutcome(BaseModel):
    id: str
    event_id: str
    actual_revenue_vs_estimate: float
    actual_eps_vs_estimate: float
    actual_price_move: float
    actual_close_price: float
    winning_scenario: ScenarioType
    trigger_fired: str
    resolved_at: str

class WargameScore(BaseModel):
    id: str
    event_id: str
    user_id: str
    direction_score: int
    price_range_score: int
    trigger_score: int
    probability_score: int
    total_score: int
    verdict: WargameVerdict
    calculated_at: str

class WargameTrackRecord(BaseModel):
    id: str
    user_id: str
    total_wargames: int = 0
    bull_picks: int = 0
    base_picks: int = 0
    bear_picks: int = 0
    correct_scenario_rate: float = 0.0
    avg_score: float = 0.0
    last_updated: str
