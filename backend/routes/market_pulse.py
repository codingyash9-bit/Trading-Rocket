"""
Market Pulse API Routes
Unified endpoint for all market data + analysis
"""
import asyncio
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional

from services.market_data_engine import (
    fetch_market_data, get_market_data_async, get_live_market_data,
    get_multiple_market_data, TICKER_MAP
)
from services.market_pulse_engine import analyze_market_pulse, analyze_multiple_pulse
from services.ipo_analyzer import analyze_ipo, get_upcoming_ipos, track_listed_ipo


router = APIRouter(prefix="/pulse", tags=["market-pulse"])


# ============ CORE ENDPOINTS ============

@router.get("/ticker/{ticker}")
async def get_ticker_pulse(ticker: str, period: str = "1mo"):
    """
    Get complete market pulse for ONE ticker
    
    Returns: price + analysis (trend, momentum, RSI, SMA, signal, insight)
    """
    # Fetch data
    data = await get_market_data_async(ticker, period)
    
    if not data.get("success"):
        raise HTTPException(status_code=404, detail=data.get("error"))
    
    # Analyze
    analysis = analyze_market_pulse(data)
    
    return analysis


@router.get("/ticker/{ticker}/live")
async def get_live_pulse(ticker: str, use_cache: bool = True):
    """
    Get live/real-time pulse (2-5 sec refresh via smart polling)
    """
    result = await get_live_market_data(ticker, use_cache)
    
    if not result.get("success"):
        raise HTTPException(status_code=404, detail=result.get("error"))
    
    # Analyze
    analysis = analyze_market_pulse(result)
    
    return {
        **analysis,
        "cached": result.get("cached", False)
    }


@router.get("/ticker/{ticker}/price")
async def get_price_only(ticker: str):
    """Quick price endpoint - minimal data"""
    result = await get_live_market_data(ticker, use_cache=False)
    
    if not result.get("success"):
        raise HTTPException(status_code=404, detail=result.get("error"))
    
    data = result["data"]
    return {
        "ticker": data["ticker"],
        "price": data["price"],
        "change": data["change"],
        "change_percent": data["change_percent"],
        "timestamp": data["timestamp"]
    }


# ============ MULTI-TICKER ENDPOINTS ============

@router.post("/multi")
async def get_multi_pulse(request: dict):
    """
    Get pulse for multiple tickers
    
    Body: {"tickers": ["NIFTY", "RELIANCE", "GOLD"], "period": "1mo"}
    """
    tickers = request.get("tickers", [])
    period = request.get("period", "1mo")
    
    if not tickers:
        raise HTTPException(status_code=400, detail="No tickers provided")
    
    # Parallel fetch
    data_list = await get_multiple_market_data(tickers, period)
    
    # Analyze all
    result = analyze_multiple_pulse(data_list)
    
    return result


@router.get("/summary")
async def get_market_summary():
    """
    Get global market summary
    
    Includes: Nifty, Sensex, S&P 500, Gold, USD/INR
    """
    tickers = [
        "^NSEI",    # Nifty 50
        "^BSESN",   # Sensex
        "^GSPC",    # S&P 500
        "GC=F",     # Gold
        "USDINR=X", # USD/INR
    ]
    
    # Fetch all in parallel
    data_list = await get_multiple_market_data(tickers, "1d")
    
    # Analyze
    result = analyze_multiple_pulse(data_list)
    
    return result


# ============ IPO ENDPOINTS ============

@router.get("/ipo/upcoming")
async def get_upcoming():
    """Get upcoming IPOs"""
    return {"success": True, "ipos": get_upcoming_ipos()}


@router.get("/ipo/{name}")
async def get_ipo_analysis(name: str, retail: Optional[int] = None, qib: Optional[int] = None, nii: Optional[int] = None):
    """
    Analyze IPO
    
    Query params: retail=X, qib=Y, nii=Z (subscription oversubscription)
    """
    sub_data = None
    if retail or qib or nii:
        sub_data = {"retail": retail or 0, "qib": qib or 0, "nii": nii or 0}
    
    result = analyze_ipo(name, sub_data)
    
    if not result.get("success"):
        raise HTTPException(status_code=404, detail=result.get("error"))
    
    return result


@router.get("/ipo/{ticker}/track")
async def track_ipo_after_listing(ticker: str):
    """Track listed IPO using market data"""
    result = track_listed_ipo(ticker)
    
    if not result.get("success"):
        raise HTTPException(status_code=404, detail=result.get("error"))
    
    return result


# ============ CATEGORY ENDPOINTS ============

@router.get("/category/{category}")
async def get_category_pulse(category: str):
    """
    Get pulse for asset category
    
    Categories: indices, stocks, commodities, forex, crypto, etf
    """
    category_map = {
        "indices": ["^NSEI", "^BSESN", "^GSPC", "^DJI", "^IXIC"],
        "stocks": ["RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "INFY.NS"],
        "commodities": ["GC=F", "SI=F", "CL=F"],
        "forex": ["USDINR=X", "USDJPY=X", "EURUSD=X"],
        "crypto": ["BTC-USD", "ETH-USD"],
        "etf": ["NIFTYBEES.NS", "GOLDBEES.NS", "SPY"],
    }
    
    tickers = category_map.get(category.lower())
    if not tickers:
        raise HTTPException(status_code=400, detail=f"Invalid category: {category}")
    
    # Fetch all
    data_list = await get_multiple_market_data(tickers, "1d")
    
    # Analyze
    result = analyze_multiple_pulse(data_list)
    
    return result


# ============ TECHNICAL ENDPOINTS ============

@router.get("/ticker/{ticker}/technical")
async def get_technical(ticker: str):
    """Get technical indicators only"""
    data = await get_market_data_async(ticker, "1mo")
    
    if not data.get("success"):
        raise HTTPException(status_code=404, detail=data.get("error"))
    
    analysis = analyze_market_pulse(data)
    
    if not analysis.get("success"):
        raise HTTPException(status_code=404, detail=analysis.get("error"))
    
    return {
        "ticker": ticker,
        "technical": analysis["pulse"]["technical"],
        "sentiment": analysis["pulse"]["sentiment"],
        "trend": analysis["pulse"]["trend"],
        "momentum": analysis["pulse"]["momentum"],
        "volatility": analysis["pulse"]["volatility"]
    }


# ============ AVAILABLE ASSETS ============

@router.get("/assets")
async def list_available_assets():
    """List all available tickers"""
    assets = {}
    
    for ticker, info in TICKER_MAP.items():
        if info["type"] not in assets:
            assets[info["type"]] = []
        assets[info["type"]].append({
            "ticker": ticker,
            "name": info["name"],
            "exchange": info["exchange"]
        })
    
    return {"success": True, "assets": assets}