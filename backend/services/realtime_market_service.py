"""
Real-Time Market Data Service
Near real-time stock, gold, and index data with 10-second caching
"""
import yfinance as yf
import asyncio
import time
from typing import Dict, List, Any, Optional
from datetime import datetime


# Real-time cache storage
market_cache: Dict[str, Dict[str, Any]] = {}
CACHE_TTL = 10  # 10 seconds TTL


def get_market_cache_key(symbol: str) -> str:
    return f"market_{symbol}"


def get_from_market_cache(symbol: str) -> Optional[Dict[str, Any]]:
    """Get cached data if not expired"""
    key = get_market_cache_key(symbol)
    if key in market_cache:
        cached = market_cache[key]
        if time.time() - cached["timestamp"] < CACHE_TTL:
            return cached["data"]
    return None


def set_market_cache(symbol: str, data: Dict[str, Any]):
    """Set cache with timestamp"""
    key = get_market_cache_key(symbol)
    market_cache[key] = {"data": data, "timestamp": time.time()}


def get_stock_realtime(symbol: str) -> Dict[str, Any]:
    """
    Fetch near real-time stock data
    Returns: price, change, percent_change, timestamp
    """
    # Check cache first
    cached = get_from_market_cache(symbol)
    if cached:
        cached["cached"] = True
        return cached
    
    try:
        ticker = yf.Ticker(symbol)
        
        # Get fast info (realtime-like)
        info = ticker.fast_info
        
        price = getattr(info, 'last_price', 0)
        if price == 0:
            # Fallback to history
            hist = ticker.history(period="1d", interval="1m")
            if not hist.empty:
                price = hist['Close'].iloc[-1]
        
        # Get previous close
        prev_close = getattr(info, 'previous_close', price)
        
        change = price - prev_close if prev_close else 0
        percent_change = (change / prev_close * 100) if prev_close else 0
        
        # Year high/low
        year_high = getattr(info, 'year_high', price * 1.2)
        year_low = getattr(info, 'year_low', price * 0.8)
        
        result = {
            "symbol": symbol,
            "price": round(price, 2),
            "change": round(change, 2),
            "percent_change": round(percent_change, 2),
            "previous_close": round(prev_close, 2) if prev_close else 0,
            "year_high": round(year_high, 2),
            "year_low": round(year_low, 2),
            "timestamp": datetime.now().isoformat(),
            "cached": False
        }
        
        set_market_cache(symbol, result)
        return result
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


def get_gold_price() -> Dict[str, Any]:
    """Fetch real-time gold price (MCX Gold or USD Gold in INR)"""
    symbol = "GC=F"  # Gold futures
    
    cached = get_from_market_cache("GOLD")
    if cached:
        cached["cached"] = True
        return cached
    
    try:
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period="1d", interval="5m")
        
        if not hist.empty:
            price = hist['Close'].iloc[-1]
            # Convert to INR approximation (gold in INR per 10g)
            inr_price = price * 75 / 31.1  # Approximate conversion
            
            result = {
                "symbol": "GOLD",
                "name": "Gold (24K)",
                "price": round(inr_price, 2),
                "unit": "per 10g",
                "currency": "INR",
                "timestamp": datetime.now().isoformat(),
                "cached": False
            }
            
            set_market_cache("GOLD", result)
            return result
        
        return {"success": False, "error": "No gold data available"}
        
    except Exception as e:
        return {"success": False, "error": str(e)}


def get_nifty50() -> Dict[str, Any]:
    """Fetch NIFTY 50 index"""
    return get_stock_realtime("^NSEI")


def get_sensex() -> Dict[str, Any]:
    """Fetch BSE SENSEX index"""
    return get_stock_realtime("^BSESN")


def get_bank_nifty() -> Dict[str, Any]:
    """Fetch NIFTY BANK index"""
    return get_stock_realtime("^NSEBANK")


def get_indian_indices() -> Dict[str, Any]:
    """Fetch all major Indian indices in parallel"""
    indices = {}
    
    symbols = {
        "NIFTY 50": "^NSEI",
        "SENSEX": "^BSESN", 
        "NIFTY BANK": "^NSEBANK",
        "NIFTY IT": "^CNXIT",
        "NIFTY AUTO": "^CNXAUTO"
    }
    
    # Use cached data if available
    for name, symbol in symbols.items():
        cached = get_from_market_cache(symbol)
        if cached:
            indices[name] = cached
        else:
            data = get_stock_realtime(symbol)
            if data.get("success", True):
                indices[name] = data
    
    return {
        "success": True,
        "indices": indices,
        "timestamp": datetime.now().isoformat()
    }


def get_multiple_stocks(symbols: List[str]) -> List[Dict[str, Any]]:
    """Get multiple stocks efficiently"""
    results = []
    
    for symbol in symbols:
        data = get_stock_realtime(symbol)
        if data.get("success", True):
            results.append(data)
    
    return results


async def get_realtime_data_async(symbol: str) -> Dict[str, Any]:
    """Async wrapper for real-time data"""
    return await asyncio.to_thread(get_stock_realtime, symbol)


async def get_all_realtime_async(symbols: List[str]) -> Dict[str, Any]:
    """Get multiple stocks in parallel"""
    tasks = [get_realtime_data_async(s) for s in symbols]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    valid_results = [r for r in results if isinstance(r, dict) and r.get("success", True)]
    
    return {
        "success": True,
        "data": valid_results,
        "timestamp": datetime.now().isoformat(),
        "count": len(valid_results)
    }


# Predefined Indian stock symbols
INDIAN_STOCKS = {
    "RELIANCE": "RELIANCE.NS",
    "TCS": "TCS.NS",
    "HDFCBANK": "HDFCBANK.NS",
    "INFY": "INFY.NS",
    "ICICIBANK": "ICICIBANK.NS",
    "SBIN": "SBIN.NS",
    "BHARTIARTL": "BHARTIARTL.NS",
    "ITC": "ITC.NS",
    "ADANIENT": "ADANIENT.NS",
    "TITAN": "TITAN.NS"
}