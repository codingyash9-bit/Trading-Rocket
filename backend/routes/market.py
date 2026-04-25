"""
Market Data Routes - Async optimized
"""
import asyncio
import time
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import hashlib

from services.market_service import get_stock_data, get_intraday_data, INDIAN_STOCKS

router = APIRouter()

# Cache
cache = {}
CACHE_TTL = 30


def get_cache_key(symbol: str) -> str:
    return hashlib.md5(symbol.encode()).hexdigest()


def get_cached(symbol: str):
    key = get_cache_key(symbol)
    if key in cache:
        if time.time() - cache[key]["time"] < CACHE_TTL:
            return cache[key]["data"]
    return None


def set_cache(symbol: str, data):
    key = get_cache_key(symbol)
    cache[key] = {"data": data, "time": time.time()}


@router.get("/market/{symbol}")
async def get_market_data(symbol: str, period: str = "6mo"):
    """Get stock data - async with caching"""
    if not symbol.endswith('.NS') and not symbol.endswith('.BO'):
        symbol = f"{symbol}.NS"
    
    # Check cache
    cached = get_cached(symbol)
    if cached:
        return {"success": True, "data": cached, "cached": True}
    
    # Fetch async
    result = await asyncio.to_thread(get_stock_data, symbol, period)
    
    if not result["success"]:
        raise HTTPException(status_code=404, detail=result.get("error"))
    
    data = result["data"]
    set_cache(symbol, data)
    
    return {"success": True, "data": data, "cached": False}


@router.get("/market/{symbol}/intraday")
async def get_intraday_data_api(symbol: str, interval: str = "5m"):
    """Get intraday data"""
    if not symbol.endswith('.NS'):
        symbol = f"{symbol}.NS"
    
    result = await asyncio.to_thread(get_intraday_data, symbol, interval)
    
    if not result["success"]:
        raise HTTPException(status_code=404, detail=result.get("error"))
    
    return result


@router.post("/market/summary")
async def market_summary(request: dict):
    """Get multiple stocks - parallel fetch"""
    symbols = request.get("symbols", [])
    
    async def fetch_one(s):
        if not s.endswith('.NS'):
            s = f"{s}.NS"
        return await asyncio.to_thread(get_stock_data, s, "1mo")
    
    # Parallel fetch
    tasks = [fetch_one(s) for s in symbols]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    data = [r["data"] for r in results if isinstance(r, dict) and r.get("success")]
    
    return {"success": True, "data": data, "count": len(data)}


@router.get("/market/indian/stocks")
async def indian_stocks():
    """List available Indian stocks"""
    return {"success": True, "data": [{"symbol": k, "full": v} for k, v in INDIAN_STOCKS.items()]}


@router.get("/market/quick/{symbol}")
async def quick_data(symbol: str):
    """Quick data without period"""
    if not symbol.endswith('.NS'):
        symbol = f"{symbol}.NS"
    
    cached = get_cached(symbol)
    if cached:
        return {"success": True, "data": cached, "cached": True}
    
    result = await asyncio.to_thread(get_stock_data, symbol, "1mo")
    
    if not result["success"]:
        raise HTTPException(status_code=404, detail=result.get("error"))
    
    return {"success": True, "data": result["data"], "cached": False}