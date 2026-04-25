from pydantic import BaseModel

class ConfidenceSnapshot(BaseModel):
    id: str
    prediction_id: str
    snapshot_date: str
    price_on_date: float
    confidence_on_date: int
    distance_from_falsification: float
