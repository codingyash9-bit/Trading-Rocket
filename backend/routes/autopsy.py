"""
Autopsy Routes
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.autopsy_service import autopsy_service
from services.autopsy_engine import autopsy_engine
from typing import List, Dict, Any
from models.confidence_snapshot import ConfidenceSnapshot
import uuid
from datetime import datetime
from models.prediction import PredictionStatus

router = APIRouter()

class AutopsyRequest(BaseModel):
    symbol: str
    timeframe: str = "1mo"

@router.post("/autopsy")
async def perform_autopsy(request: AutopsyRequest):
    try:
        result = await autopsy_service.perform_autopsy(request.symbol, request.timeframe)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/autopsy/report/{case_id}")
async def get_autopsy_report(case_id: str):
    report = autopsy_engine.get_full_report(case_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return {"success": True, "data": report}

@router.get("/autopsy/report/user/{user_id}")
async def get_user_reports(user_id: str, page: int = 1, limit: int = 10):
    preds = autopsy_engine.get_predictions()
    closed_preds = [p for p in preds if p.user_id == user_id and p.status == PredictionStatus.RESOLVED]
    closed_preds.sort(key=lambda x: x.sealed_at, reverse=True)
    
    start = (page - 1) * limit
    end = start + limit
    paginated_preds = closed_preds[start:end]
    
    reports = []
    for p in paginated_preds:
        rep = autopsy_engine.get_full_report(p.case_id)
        if rep:
            reports.append(rep)
            
    return {"success": True, "data": reports, "total": len(closed_preds)}

class SnapshotRequest(BaseModel):
    prediction_id: str
    price_on_date: float

@router.post("/autopsy/snapshot")
async def log_snapshot(request: SnapshotRequest):
    preds = autopsy_engine.get_predictions()
    pred = next((p for p in preds if p.id == request.prediction_id), None)
    if not pred:
        raise HTTPException(status_code=404, detail="Prediction not found")
        
    distance = ((request.price_on_date - pred.falsification_price) / pred.falsification_price) * 100
    distance = abs(distance) # ensuring absolute distance
    
    original = pred.confidence_score
    if distance < 1:
        confidence = original * 0.40
    elif distance < 3:
        confidence = original * 0.60
    elif distance < 5:
        confidence = original * 0.80
    else:
        # Simplification: assuming moving towards target if price > price_at_call (for bullish)
        # For true implementation, would need trend logic
        compounded = original * 1.05
        confidence = min(compounded, 95)
        
    snapshot = ConfidenceSnapshot(
        id=str(uuid.uuid4()),
        prediction_id=request.prediction_id,
        snapshot_date=datetime.now().isoformat(),
        price_on_date=request.price_on_date,
        confidence_on_date=int(confidence),
        distance_from_falsification=distance
    )
    autopsy_engine.save_snapshot(snapshot)
    return {"success": True, "data": snapshot}

@router.get("/autopsy/snapshots/{prediction_id}")
async def get_snapshots(prediction_id: str):
    snapshots = [s for s in autopsy_engine.get_snapshots() if s.prediction_id == prediction_id]
    snapshots.sort(key=lambda x: x.snapshot_date)
    return {"success": True, "data": snapshots}
