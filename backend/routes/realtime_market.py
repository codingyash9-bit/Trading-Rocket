"""
Real-Time Market Data Routes
Near real-time stock, gold, and index data with 10-second caching
"""
import asyncio
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

from services.realtime_market_service import (
    get_stock_realtime,
    get_gold_price,
    get_nifty50,
    get_sensex,
    get_bank_nifty,
    get_indian_indices,
    get_multiple_stocks,
    get_all_realtime_async,
    INDIAN_STOCKS
)

router = APIRouter()


@router.get("/realtime/{symbol}")
async def realtime_stock(symbol: str):
    """
    Get near real-time stock data (10-second cache)
    Returns: price, change, percent_change, timestamp
    """
    if not symbol.endswith('.NS') and not symbol.endswith('.BO'):
        symbol = f"{symbol}.NS"
    
    result = get_stock_realtime(symbol)
    
    if not result.get("success", True):
        raise HTTPException(status_code=404, detail=result.get("error", "Data not found"))
    
    return result


@router.get("/realtime/gold")
async def realtime_gold():
    """Get real-time gold price"""
    return get_gold_price()


@router.get("/realtime/indices")
async def realtime_indices():
    """Get all major Indian indices"""
    return get_indian_indices()


@router.get("/realtime/nifty")
async def realtime_nifty():
    """Get NIFTY 50"""
    return get_nifty50()


@router.get("/realtime/sensex")
async def realtime_sensex():
    """Get SENSEX"""
    return get_sensex()


class MultiStocksRequest(BaseModel):
    symbols: List[str]


@router.post("/realtime/multiple")
async def realtime_multiple(request: MultiStocksRequest):
    """Get multiple stocks in parallel"""
    # Add .NS suffix if missing
    symbols = [s if s.endswith('.NS') else f"{s}.NS" for s in request.symbols]
    
    return await get_all_realtime_async(symbols)


@router.get("/realtime/indian-stocks")
async def indian_stocks_list():
    """List available Indian stock symbols"""
    return {
        "success": True,
        "data": [{"symbol": k, "full": v} for k, v in INDIAN_STOCKS.items()]
    }


@router.get("/realtime/status")
async def realtime_status():
    """Check real-time data system status"""
    from services.realtime_market_service import market_cache, CACHE_TTL
    return {
        "status": "operational",
        "cache_items": len(market_cache),
        "cache_ttl_seconds": CACHE_TTL
    }