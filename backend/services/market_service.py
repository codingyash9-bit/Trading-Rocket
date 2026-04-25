"""
Market Data Service
Fetches stock market data using yfinance
"""
import yfinance as yf
from typing import Dict, List, Any
from datetime import datetime, timedelta


def get_stock_data(symbol: str, period: str = "6mo") -> Dict[str, Any]:
    """
    Fetch stock data for a given symbol
    
    Args:
        symbol: Stock ticker symbol (e.g., "RELIANCE.NS" for NSE)
        period: Data period (1d, 5d, 1mo, 3mo, 6mo, 1y, etc.)
    
    Returns:
        Dictionary with prices, dates, and volume data
    """
    try:
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period=period)
        
        if hist.empty:
            return {
                "success": False,
                "error": f"No data found for {symbol}"
            }
        
        prices = hist['Close'].tolist()
        dates = hist.index.strftime('%Y-%m-%d').tolist()
        volumes = hist['Volume'].tolist()
        highs = hist['High'].tolist()
        lows = hist['Low'].tolist()
        opens = hist['Open'].tolist()
        
        current_price = prices[-1] if prices else 0
        price_change = prices[-1] - prices[0] if len(prices) > 1 else 0
        price_change_pct = (price_change / prices[0] * 100) if prices[0] else 0
        
        return {
            "success": True,
            "data": {
                "symbol": symbol,
                "current_price": round(current_price, 2),
                "price_change": round(price_change, 2),
                "price_change_pct": round(price_change_pct, 2),
                "dates": dates,
                "prices": [round(p, 2) for p in prices],
                "volumes": volumes,
                "highs": [round(h, 2) for h in highs],
                "lows": [round(l, 2) for l in lows],
                "opens": [round(o, 2) for o in opens],
            }
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


def get_intraday_data(symbol: str, interval: str = "5m") -> Dict[str, Any]:
    """
    Fetch intraday stock data
    
    Args:
        symbol: Stock ticker symbol
        interval: Data interval (1m, 2m, 5m, 15m, 30m, 60m)
    
    Returns:
        Dictionary with intraday data
    """
    try:
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period="1d", interval=interval)
        
        if hist.empty:
            return {
                "success": False,
                "error": f"No intraday data for {symbol}"
            }
        
        return {
            "success": True,
            "data": {
                "symbol": symbol,
                "prices": hist['Close'].tolist(),
                "dates": hist.index.strftime('%Y-%m-%d %H:%M:%S').tolist(),
                "volumes": hist['Volume'].tolist(),
            }
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


def get_market_summary(symbols: List[str]) -> Dict[str, Any]:
    """
    Get market summary for multiple symbols
    
    Args:
        symbols: List of stock ticker symbols
    
    Returns:
        Dictionary with summary data for all symbols
    """
    results = []
    
    for symbol in symbols:
        data = get_stock_data(symbol)
        if data["success"]:
            results.append(data["data"])
    
    return {
        "success": True,
        "data": results
    }


# Indian stock symbols (NSE)
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
    "TITAN": "TITAN.NS",
}