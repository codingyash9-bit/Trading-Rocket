from fastapi import APIRouter, HTTPException
from typing import List, Optional
import uuid
from datetime import datetime

from models.prediction import Prediction, PredictionStatus
from services.autopsy_engine import autopsy_engine

router = APIRouter(prefix="/api/autopsy", tags=["Autopsy Predictions"])

@router.post("/predictions", response_model=Prediction)
def create_prediction(prediction_data: dict):
    case_id = autopsy_engine.generate_case_id()
    new_prediction = Prediction(
        id=str(uuid.uuid4()),
        case_id=case_id,
        sealed_at=datetime.now().isoformat(),
        status=PredictionStatus.OPEN,
        **prediction_data
    )
    autopsy_engine.save_prediction(new_prediction)
    return new_prediction

@router.get("/predictions/{user_id}", response_model=List[Prediction])
def get_user_predictions(user_id: str, status: Optional[PredictionStatus] = None):
    preds = autopsy_engine.get_predictions()
    user_preds = [p for p in preds if p.user_id == user_id]
    if status:
        user_preds = [p for p in user_preds if p.status == status]
    return user_preds

@router.get("/predictions/case/{case_id}", response_model=Prediction)
def get_prediction_by_case(case_id: str):
    preds = autopsy_engine.get_predictions()
    pred = next((p for p in preds if p.case_id == case_id), None)
    if not pred:
        raise HTTPException(status_code=404, detail="Prediction not found")
    return pred
