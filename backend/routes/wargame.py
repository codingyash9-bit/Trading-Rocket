# backend/routes/wargame.py
from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta
from decimal import Decimal
import yfinance
import logging

from services.wargame_service import WargameService
from services.wargame_scoring import WargameScoring
from services.autopsy_service import AutopsyService

router = APIRouter(prefix="/api/wargame", tags=["wargame"])
logger = logging.getLogger(__name__)


class SealPositionRequest(BaseModel):
    scenario_type: str
    position_type: str
    entry_price: Optional[float] = None


class ResolveWargameRequest(BaseModel):
    actual_price_move: float
    actual_direction: str
    trigger_hit: Optional[str] = None


class WargameReport(BaseModel):
    event_id: str
    ticker: str
    earnings_date: datetime
    status: str
    scenarios: List[dict]
    position: Optional[dict]
    outcome: Optional[dict]
    score: Optional[dict]


class TrackRecordResponse(BaseModel):
    user_id: str
    total_events: int
    sharp_count: int
    solid_count: int
    partial_count: int
    wrong_count: int
    avg_score: float
    win_rate: float


def get_current_user():
    from routes.auth import get_current_firebase_user
    return get_current_firebase_user()


@router.get("/detect/{user_id}")
async def detect_wargame_opportunities(user_id: str):
    try:
        watchlist = await get_user_watchlist(user_id)
        events = []

        for ticker in watchlist:
            try:
                stock = yfinance.Ticker(ticker)
                earnings = stock.calendar

                if earnings is None or earnings.empty:
                    continue

                earnings_date = earnings.get('Earnings Date')
                if earnings_date is None:
                    continue

                if isinstance(earnings_date, list):
                    earnings_date = earnings_date[0]

                days_until = (earnings_date - datetime.now()).days

                if 0 <= days_until <= 7:
                    event = await upsert_wargame_event(
                        user_id=user_id,
                        ticker=ticker,
                        earnings_date=earnings_date,
                        status="PENDING"
                    )
                    events.append(event)
            except Exception as e:
                logger.warning(f"yfinance error for {ticker}: {str(e)}")
                continue

        return {"events": events, "cached": False}
    except Exception as e:
        logger.error(f"Detection error: {str(e)}")
        return {"events": [], "cached": False}


async def get_user_watchlist(user_id: str) -> List[str]:
    from db import get_watchlist_by_user
    watchlist = await get_watchlist_by_user(user_id)
    return [w['ticker'] for w in watchlist]


async def upsert_wargame_event(user_id: str, ticker: str, earnings_date: datetime, status: str) -> dict:
    from db import upsert_wargame_event_db
    event = await upsert_wargame_event_db(
        user_id=user_id,
        ticker=ticker,
        earnings_date=earnings_date,
        status=status
    )
    return {
        "event_id": event.get("id"),
        "ticker": ticker,
        "earnings_date": earnings_date.isoformat(),
        "days_until": (earnings_date - datetime.now()).days,
        "status": status
    }


@router.post("/generate/{event_id}")
async def generate_scenarios(event_id: str, user=Depends(get_current_user)):
    from db import get_wargame_event, get_quarter_data

    event = await get_wargame_event(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    if event['status'] not in ['PENDING', 'ACTIVE']:
        raise HTTPException(status_code=400, detail="Cannot generate scenarios for this event")

    ticker = event['ticker']
    earnings_date = event['earnings_date']
    quarter = event.get('quarter', 'Q1')

    wargame_service = WargameService()
    context = wargame_service.get_earnings_context(ticker)

    try:
        scenarios = await wargame_service.generate_scenarios(
            event_id=event_id,
            ticker=ticker,
            earnings_date=earnings_date,
            quarter=quarter,
            context=context
        )
    except Exception as e:
        logger.error(f"Scenario generation failed: {str(e)}")
        raise HTTPException(status_code=422, detail="Failed to generate scenarios")

    await update_event_status(event_id, "ACTIVE")

    return {"scenarios": scenarios, "event_id": event_id}


@router.post("/seal/{event_id}")
async def seal_position(event_id: str, request: SealPositionRequest, user=Depends(get_current_user)):
    from db import get_wargame_event, get_wargame_by_event_and_user, create_wargame_position, update_event_status

    event = await get_wargame_event(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    if event['status'] != 'ACTIVE':
        raise HTTPException(status_code=400, detail="Event must be ACTIVE to seal position")

    if event['earnings_date'] <= datetime.now():
        raise HTTPException(status_code=400, detail="Cannot seal position after earnings date")

    existing = await get_wargame_by_event_and_user(event_id, user['uid'])
    if existing and existing.get('is_locked'):
        raise HTTPException(status_code=400, detail="Position already locked")

    position = await create_wargame_position(
        event_id=event_id,
        user_id=user['uid'],
        scenario_type=request.scenario_type,
        position_type=request.position_type,
        entry_price=request.entry_price
    )

    await update_event_status(event_id, "ACTIVE")

    return {
        "message": "Position sealed successfully",
        "position": position,
        "event_id": event_id
    }


@router.post("/resolve/{event_id}")
async def resolve_wargame(event_id: str, request: ResolveWargameRequest, user=Depends(get_current_user)):
    from db import get_wargame_event, get_wargame_position, create_wargame_outcome

    event = await get_wargame_event(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    if event['status'] != 'ACTIVE':
        raise HTTPException(status_code=400, detail="Event must be ACTIVE to resolve")

    position = await get_wargame_position(event_id, user['uid'])
    if not position:
        raise HTTPException(status_code=404, detail="Position not found")

    outcome = await create_wargame_outcome(
        event_id=event_id,
        actual_price_move=request.actual_price_move,
        actual_direction=request.actual_direction,
        trigger_hit=request.trigger_hit
    )

    scoring_service = WargameScoring()
    score = await scoring_service.calculate(
        event_id=event_id,
        position=position,
        outcome=outcome
    )

    try:
        autopsy_service = AutopsyService()
        await autopsy_service.create_from_wargame(event_id, outcome, score)
    except Exception as e:
        logger.error(f"Autopsy creation failed: {str(e)}")

    await update_event_status(event_id, "RESOLVED")

    return {
        "outcome": outcome,
        "score": score
    }


@router.get("/report/{event_id}")
async def get_report(event_id: str, user=Depends(get_current_user)):
    from db import (
        get_wargame_event, get_wargame_scenarios,
        get_wargame_position, get_wargame_outcome, get_wargame_score
    )

    event = await get_wargame_event(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    scenarios = await get_wargame_scenarios(event_id)
    position = await get_wargame_position(event_id, user['uid'])
    outcome = await get_wargame_outcome(event_id)
    score = await get_wargame_score(event_id)

    return WargameReport(
        event_id=event_id,
        ticker=event['ticker'],
        earnings_date=event['earnings_date'],
        status=event['status'],
        scenarios=[s for s in scenarios],
        position=position,
        outcome=outcome,
        score=score
    )


@router.get("/active/{user_id}")
async def get_active_events(user_id: str, user=Depends(get_current_user)):
    from db import get_active_wargame_events
    events = await get_active_wargame_events(user_id)
    return {"events": events}


@router.get("/history/{user_id}")
async def get_history(
    user_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    user=Depends(get_current_user)
):
    from db import get_resolved_wargame_events
    events = await get_resolved_wargame_events(user_id, page, limit)
    return {"events": events, "page": page, "limit": limit}


@router.get("/track-record/{user_id}")
async def get_track_record(user_id: str, user=Depends(get_current_user)):
    from db import get_wargame_track_record

    record = await get_wargame_track_record(user_id)

    if not record:
        return TrackRecordResponse(
            user_id=user_id,
            total_events=0,
            sharp_count=0,
            solid_count=0,
            partial_count=0,
            wrong_count=0,
            avg_score=0.0,
            win_rate=0.0
        )

    total = record.get('total_events', 0)
    sharp = record.get('sharp_count', 0)
    solid = record.get('solid_count', 0)
    partial = record.get('partial_count', 0)
    wrong = record.get('wrong_count', 0)
    avg_score = record.get('avg_score', 0.0)
    win_rate = (sharp + solid) / total if total > 0 else 0.0

    return TrackRecordResponse(
        user_id=user_id,
        total_events=total,
        sharp_count=sharp,
        solid_count=solid,
        partial_count=partial,
        wrong_count=wrong,
        avg_score=avg_score,
        win_rate=win_rate
    )


async def update_event_status(event_id: str, status: str):
    from db import update_wargame_event_status
    await update_wargame_event_status(event_id, status)