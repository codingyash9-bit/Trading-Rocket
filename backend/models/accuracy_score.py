from pydantic import BaseModel

class AccuracyScore(BaseModel):
    id: str
    prediction_id: str
    direction_score: int
    range_score: int
    time_score: int
    falsification_score: int
    total_score: int
    calculated_at: str
