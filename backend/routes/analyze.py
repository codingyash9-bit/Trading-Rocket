"""
Stock Analysis Routes - Optimized with Fast Response
Multi-stage AI analysis with staged news fetching
"""
import asyncio
import time
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, validator
from typing import Optional, List, Literal
import hashlib

from services.ai_service import analyze_stock_async, quick_analyze
from services.market_service import get_stock_data
from services.news_service import fetch_stock_news
from utils.prompts import build_quick_prompt

router = APIRouter()

# Cache storage
cache = {}
CACHE_TTL = 60


def get_cache_key(symbol: str, period: str) -> str:
    return hashlib.md5(f"{symbol}:{period}".encode()).hexdigest()


def get_cached(symbol: str, period: str = "6mo"):
    key = get_cache_key(symbol, period)
    if key in cache:
        if time.time() - cache[key]["time"] < CACHE_TTL:
            return cache[key]["data"]
    return None


def set_cache(symbol: str, period: str, data):
    key = get_cache_key(symbol, period)
    cache[key] = {"data": data, "time": time.time()}


class AnalyzeRequest(BaseModel):
    symbol: str = Field(..., min_length=1, max_length=20, description="Stock ticker symbol (e.g. RELIANCE, TCS.NS)")
    period: Optional[Literal["1d", "5d", "1mo", "3mo", "6mo", "1y", "2y", "5y", "10y", "ytd", "max"]] = "6mo"
    risk_tolerance: Optional[Literal["low", "medium", "high"]] = "medium"
    wait_for_ai: Optional[bool] = False

    @validator('symbol')
    def validate_symbol(cls, v):
        return v.upper().strip()


@router.post("/analyze", status_code=200)
async def analyze(request: AnalyzeRequest):
    """
    STAGED AI ANALYSIS SYSTEM
    
    1. Quick response: If wait_for_ai is False, returns technical indicators.
    2. Deep response: If wait_for_ai is True, returns full AI report with news.
    """
    symbol = request.symbol
    if not any(suffix in symbol for suffix in ['.NS', '.BO']):
        symbol = f"{symbol}.NS"
    
    period = request.period or "6mo"
    
    try:
        # Check cache
        cached_data = get_cached(symbol, period)
        
        # If user doesn't want to wait, return quick
        if not request.wait_for_ai:
            if cached_data:
                data = cached_data
            else:
                stock_data = get_stock_data(symbol, period)
                if not stock_data["success"]:
                    raise HTTPException(status_code=404, detail=stock_data.get("error", f"Stock {symbol} not found"))
                data = stock_data["data"]
                set_cache(symbol, period, data)
            
            # Quick analysis
            quick = await quick_analyze(data)
            
            return {
                "success": True,
                "status": "quick",
                "decision": quick["decision"],
                "confidence": quick["confidence"],
                "rsi": quick["rsi"],
                "trend": quick["trend"],
                "current_price": data["current_price"],
                "symbol": data["symbol"]
            }
        
        # Full analysis with news
        # PARALLEL: fetch stock data + news
        stock_task = asyncio.to_thread(get_stock_data, symbol, period)
        news_task = fetch_stock_news(symbol.split('.')[0])
        
        stock_result, news_result = await asyncio.gather(stock_task, news_task)
        
        if not stock_result["success"]:
            raise HTTPException(
                status_code=404, 
                detail=stock_result.get("error", f"Could not fetch data for {symbol}")
            )
        
        data = stock_result["data"]
        news = news_result.get("data", []) if news_result.get("success") else []
        
        set_cache(symbol, period, data)
        
        # AI analysis with news
        analysis_result = await analyze_stock_async(data, news, use_ai=True)
        
        return {
            "success": True,
            "status": "complete",
            "analysis": analysis_result.get("analysis", ""),
            "decision": analysis_result.get("decision", "HOLD"),
            "confidence": analysis_result.get("confidence", 60),
            "news": analysis_result.get("news", news[:5]),
            "current_price": data["current_price"],
            "source": analysis_result.get("source", "unknown")
        }
    
    except HTTPException as he:
        raise he
    except Exception as e:
        import logging
        logging.error(f"Analysis error for {symbol}: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"An internal error occurred during analysis: {str(e)}"
        )


@router.post("/analyze/fast")
async def fast_analyze(request: AnalyzeRequest):
    """
    Super fast analysis (<200ms)
    Uses cached data + quick indicators
    """
    symbol = request.symbol
    if not any(suffix in symbol for suffix in ['.NS', '.BO']):
        symbol = f"{symbol}.NS"
    
    period = request.period or "1mo"
    
    # Check cache
    cached_data = get_cached(symbol, period)
    
    if cached_data:
        quick = await quick_analyze(cached_data)
        return {
            "success": True,
            "status": "fast",
            "data": quick,
            "cached": True
        }
    
    stock_data = get_stock_data(symbol, period)
    
    if not stock_data["success"]:
        raise HTTPException(status_code=404, detail=stock_data.get("error"))
    
    data = stock_data["data"]
    set_cache(symbol, period, data)
    
    quick = await quick_analyze(data)
    
    return {
        "success": True,
        "status": "fast",
        "data": quick,
        "cached": False
    }


@router.get("/analyze/news/{symbol}")
async def get_stock_news(symbol: str):
    """Get news for a stock"""
    ticker = symbol
    if not any(suffix in ticker for suffix in ['.NS', '.BO']):
        ticker = f"{ticker}.NS"
    
    result = await fetch_stock_news(ticker.split('.')[0])
    
    return result


@router.get("/analyze/status")
async def analysis_status():
    """Check analysis system status"""
    return {
        "status": "operational",
        "cache_items": len(cache),
        "cache_ttl": CACHE_TTL
    }
