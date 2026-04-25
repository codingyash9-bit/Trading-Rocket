# backend/routes/graveyard.py
from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter(prefix="/api/graveyard", tags=["graveyard"])


class GraveyardStats(BaseModel):
    total_graves: int
    worst_sector: Optional[str]
    worst_pattern: Optional[str]
    avg_confidence_of_fails: float


class PatternAnalysis(BaseModel):
    pattern: str
    count: int
    avg_confidence: float
    sector_breakdown: dict


def get_current_user():
    from routes.auth import get_current_firebase_user
    return get_current_firebase_user()


@router.get("/graves/{user_id}")
async def get_graves(
    user_id: str,
    sector: Optional[str] = None,
    pattern: Optional[str] = None,
    timeframe: Optional[str] = None,
    sort: str = Query("date", pattern="^(date|confidence|ticker)$"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=50),
    user=Depends(get_current_user)
):
    from db import get_invalidated_predictions

    graves = await get_invalidated_predictions(
        user_id=user_id,
        sector=sector,
        pattern=pattern,
        timeframe=timeframe,
        sort=sort,
        page=page,
        limit=limit
    )

    return {
        "graves": graves,
        "page": page,
        "limit": limit,
        "total": len(graves)
    }


@router.get("/epitaph/{prediction_id}")
async def get_epitaph(prediction_id: str, user=Depends(get_current_user)):
    from db import get_prediction

    prediction = await get_prediction(prediction_id)
    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction not found")

    if prediction.get('epitaph'):
        return {"epitaph": prediction['epitaph'], "cached": True}

    from services.graveyard_service import GraveyardService
    service = GraveyardService()

    epitaph = await service.generate_epitaph(
        ticker=prediction['ticker'],
        predicted_direction=prediction.get('predicted_direction'),
        confidence=prediction.get('confidence'),
        invalidation_reason=prediction.get('invalidation_reason'),
        actual_move=prediction.get('actual_move'),
        source=prediction.get('source', 'SIGNAL')
    )

    await save_epitaph(prediction_id, epitaph)

    return {"epitaph": epitaph, "cached": False}


async def save_epitaph(prediction_id: str, epitaph: str):
    from db import update_prediction_epitaph
    await update_prediction_epitaph(prediction_id, epitaph)


@router.get("/stats/{user_id}")
async def get_graveyard_stats(user_id: str, user=Depends(get_current_user)):
    from db import get_graveyard_stats

    stats = await get_graveyard_stats(user_id)

    if not stats:
        return GraveyardStats(
            total_graves=0,
            worst_sector=None,
            worst_pattern=None,
            avg_confidence_of_fails=0.0
        )

    return GraveyardStats(
        total_graves=stats.get('total_graves', 0),
        worst_sector=stats.get('worst_sector'),
        worst_pattern=stats.get('worst_pattern'),
        avg_confidence_of_fails=stats.get('avg_confidence_of_fails', 0.0)
    )


@router.get("/pattern-analysis/{user_id}")
async def get_pattern_analysis(user_id: str, user=Depends(get_current_user)):
    from db import get_pattern_analysis_for_user

    analysis = await get_pattern_analysis_for_user(user_id)

    patterns = []
    for item in analysis:
        patterns.append(PatternAnalysis(
            pattern=item['pattern'],
            count=item['count'],
            avg_confidence=item['avg_confidence'],
            sector_breakdown=item.get('sector_breakdown', {})
        ))

    return {"patterns": patterns}


@router.get("/wargame-graves/{user_id}")
async def get_wargame_graves(
    user_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=50),
    user=Depends(get_current_user)
):
    from db import get_wargame_invalidated_predictions

    graves = await get_wargame_invalidated_predictions(
        user_id=user_id,
        page=page,
        limit=limit
    )

    return {
        "graves": graves,
        "page": page,
        "limit": limit
    }