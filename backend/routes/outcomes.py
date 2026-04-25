from fastapi import APIRouter, HTTPException
import uuid
from datetime import datetime

from models.outcome import Outcome
from models.prediction import PredictionStatus
from services.autopsy_engine import autopsy_engine
from services.scoring import calculate_accuracy_score
from services.bias_engine import update_bias_profile

router = APIRouter(prefix="/api/autopsy", tags=["Autopsy Outcomes"])

@router.post("/outcomes/{prediction_id}", response_model=Outcome)
def submit_outcome(prediction_id: str, outcome_data: dict):
    # Fetch prediction
    preds = autopsy_engine.get_predictions()
    pred = next((p for p in preds if p.id == prediction_id), None)
    if not pred:
        raise HTTPException(status_code=404, detail="Prediction not found")
        
    if pred.status == PredictionStatus.RESOLVED:
        raise HTTPException(status_code=400, detail="Prediction already resolved")

    # Create and save outcome
    outcome = Outcome(
        id=str(uuid.uuid4()),
        prediction_id=prediction_id,
        resolved_at=datetime.now().isoformat(),
        **outcome_data
    )
    autopsy_engine.save_outcome(outcome)
    
    # Update Prediction status
    pred.status = PredictionStatus.RESOLVED
    autopsy_engine.save_prediction(pred)
    
    # Calculate score
    score = calculate_accuracy_score(pred, outcome)
    autopsy_engine.save_accuracy_score(score)
    
    # Update bias profile
    update_bias_profile(pred.user_id, pred.sector, pred.market_cap_category)
    
    return outcome
