from pydantic import BaseModel
from enum import Enum

class Verdict(str, Enum):
    CONFIRMED = "CONFIRMED"
    PARTIAL = "PARTIAL"
    INVALIDATED = "INVALIDATED"

class Outcome(BaseModel):
    id: str
    prediction_id: str
    actual_close_price: float
    actual_move_percent: float
    actual_days_to_resolve: int
    falsification_triggered: bool
    falsification_closest_price: float
    resolved_at: str
    verdict: Verdict
