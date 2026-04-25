"""
Company Radar API Routes
Tracks analyzed stocks with market data and news using SQLite database
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import json
import uuid
from models.company_radar import RadarStock as RadarStockModel
from utils.db import db
from services.market_data_engine import get_live_market_data

router = APIRouter(prefix="/api/company-radar", tags=["Company Radar"])

class NewsItem(BaseModel):
    headline: str
    sentiment: str
    source: str
    timestamp: str

class RadarStockRequest(BaseModel):
    userId: Optional[str] = "user"
    symbol: str
    name: Optional[str] = None
    exchange: Optional[str] = "NSE"
    last_analysis: Optional[Dict[str, Any]] = None
    price: Optional[float] = None
    change_percent: Optional[float] = None
    sentiment: Optional[str] = "neutral"
    key_news: Optional[List[NewsItem]] = []

@router.on_event("startup")
async def startup():
    if db.is_closed():
        db.connect()
    db.create_tables([RadarStockModel])

@router.get("", response_model=List[Dict])
async def get_radar(userId: str = "user"):
    """Get all tracked stocks for a user"""
    try:
        query = RadarStockModel.select().where(RadarStockModel.user_id == userId)
        stocks = []
        for s in query.order_by(RadarStockModel.updated_at.desc()):
            stocks.append({
                "id": s.id,
                "userId": s.user_id,
                "symbol": s.symbol,
                "name": s.name,
                "exchange": s.exchange,
                "price": s.price,
                "change_percent": s.change_percent,
                "sentiment": s.sentiment,
                "last_analysis": json.loads(s.last_analysis_json) if s.last_analysis_json else None,
                "key_news": json.loads(s.key_news_json) if s.key_news_json else [],
                "added_at": s.added_at.isoformat(),
                "updated_at": s.updated_at.isoformat()
            })
        
        if not stocks:
            return get_sample_radar()
        return stocks
    except Exception as e:
        print(f"Error getting radar: {e}")
        return get_sample_radar()

@router.post("")
async def add_to_radar(request: RadarStockRequest):
    """Add or update a stock in radar"""
    try:
        userId = request.userId or "user"
        symbol = request.symbol.upper()
        
        # Try to get live data if price not provided
        price = request.price
        change_pct = request.change_percent
        
        if price is None:
            market_data = await get_live_market_data(symbol)
            if market_data.get("success"):
                price = market_data["data"]["price"]
                change_pct = market_data["data"]["change_percent"]

        # Check for existing
        existing = RadarStockModel.get_or_none(
            (RadarStockModel.user_id == userId) & 
            (RadarStockModel.symbol == symbol)
        )
        
        now = datetime.now()
        
        if existing:
            existing.name = request.name or existing.name
            existing.exchange = request.exchange or existing.exchange
            if price: existing.price = price
            if change_pct: existing.change_percent = change_pct
            if request.sentiment: existing.sentiment = request.sentiment
            if request.last_analysis: existing.last_analysis_json = json.dumps(request.last_analysis)
            if request.key_news: existing.key_news_json = json.dumps([n.model_dump() for n in request.key_news])
            existing.updated_at = now
            existing.save()
            stock_id = existing.id
        else:
            new_stock = RadarStockModel.create(
                id=str(uuid.uuid4()),
                user_id=userId,
                symbol=symbol,
                name=request.name or symbol,
                exchange=request.exchange or "NSE",
                price=price or 0,
                change_percent=change_pct or 0,
                sentiment=request.sentiment or "neutral",
                last_analysis_json=json.dumps(request.last_analysis) if request.last_analysis else None,
                key_news_json=json.dumps([n.model_dump() for n in request.key_news]) if request.key_news else "[]",
                added_at=now,
                updated_at=now
            )
            stock_id = new_stock.id
            
        return {"success": True, "id": stock_id}
    except Exception as e:
        return {"success": False, "error": str(e)}

@router.delete("/{symbol}")
async def remove_from_radar(symbol: str, userId: str = "user"):
    """Remove a stock from radar"""
    try:
        q = RadarStockModel.delete().where(
            (RadarStockModel.user_id == userId) & 
            (RadarStockModel.symbol == symbol.upper())
        )
        count = q.execute()
        if count == 0:
            raise HTTPException(status_code=404, detail="Stock not found")
        return {"success": True, "message": f"Removed {symbol}"}
    except Exception as e:
        return {"success": False, "error": str(e)}

def get_sample_radar():
    """Generate sample radar data (fallback)"""
    samples = [
        {"symbol": "RELIANCE", "name": "Reliance Industries", "price": 2856.45, "change_percent": 1.2, "sentiment": "positive"},
        {"symbol": "TCS", "name": "Tata Consultancy Services", "price": 4125.60, "change_percent": -0.5, "sentiment": "positive"},
        {"symbol": "HDFCBANK", "name": "HDFC Bank", "price": 1723.85, "change_percent": 0.8, "sentiment": "neutral"}
    ]
    
    result = []
    for s in samples:
        result.append({
            "id": str(uuid.uuid4()),
            "userId": "user",
            "symbol": s["symbol"],
            "name": s["name"],
            "exchange": "NSE",
            "price": s["price"],
            "change_percent": s["change_percent"],
            "sentiment": s["sentiment"],
            "last_analysis": None,
            "key_news": [],
            "added_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        })
    return result
