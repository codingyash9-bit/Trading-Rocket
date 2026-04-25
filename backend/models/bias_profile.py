from pydantic import BaseModel
from models.prediction import MarketCapCategory

class BiasProfile(BaseModel):
    id: str
    user_id: str
    sector: str
    market_cap_category: MarketCapCategory
    total_cases: int
    direction_accuracy_rate: float
    avg_time_error_days: float
    range_hit_rate: float
    over_bullish_rate: float
    speed_underestimate_rate: float
    last_updated: str
