"""
Unified Market Data Engine
Supports: Stocks, ETFs, Indices, Commodities, Forex, Crypto
"""
import yfinance as yf
from typing import Dict, Any, Optional, List
from datetime import datetime
import asyncio
import time
from utils.cache import cached


TICKER_MAP = {
    # Indian Indices
    "^NSEI": {"name": "Nifty 50", "type": "index", "exchange": "NSE"},
    "^BSESN": {"name": "BSE Sensex", "type": "index", "exchange": "BSE"},
    # US Indices
    "^GSPC": {"name": "S&P 500", "type": "index", "exchange": "US"},
    "^DJI": {"name": "Dow Jones", "type": "index", "exchange": "US"},
    "^IXIC": {"name": "Nasdaq", "type": "index", "exchange": "US"},
    # Commodities
    "GC=F": {"name": "Gold", "type": "commodity", "exchange": "COMEX"},
    "SI=F": {"name": "Silver", "type": "commodity", "exchange": "COMEX"},
    "CL=F": {"name": "Crude Oil", "type": "commodity", "exchange": "NYMEX"},
    "NG=F": {"name": "Natural Gas", "type": "commodity", "exchange": "NYMEX"},
    # Forex (USD pairs)
    "USDINR=X": {"name": "USD/INR", "type": "forex", "exchange": "FX"},
    "USDJPY=X": {"name": "USD/JPY", "type": "forex", "exchange": "FX"},
    "EURUSD=X": {"name": "EUR/USD", "type": "forex", "exchange": "FX"},
    "GBPUSD=X": {"name": "GBP/USD", "type": "forex", "exchange": "FX"},
    # Crypto
    "BTC-USD": {"name": "Bitcoin", "type": "crypto", "exchange": "CRYPTO"},
    "ETH-USD": {"name": "Ethereum", "type": "crypto", "exchange": "CRYPTO"},
    "DOGE-USD": {"name": "Dogecoin", "type": "crypto", "exchange": "CRYPTO"},
    # Indian Stocks
    "RELIANCE.NS": {"name": "Reliance", "type": "stock", "exchange": "NSE"},
    "TCS.NS": {"name": "TCS", "type": "stock", "exchange": "NSE"},
    "HDFCBANK.NS": {"name": "HDFC Bank", "type": "stock", "exchange": "NSE"},
    "INFY.NS": {"name": "Infosys", "type": "stock", "exchange": "NSE"},
    "ICICIBANK.NS": {"name": "ICICI Bank", "type": "stock", "exchange": "NSE"},
    "SBIN.NS": {"name": "SBI Bank", "type": "stock", "exchange": "NSE"},
    "ADANIENT.NS": {"name": "Adani Enter", "type": "stock", "exchange": "NSE"},
    "TITAN.NS": {"name": "Titan", "type": "stock", "exchange": "NSE"},
    "META.NS": {"name": "Meta (Facebook)", "type": "stock", "exchange": "NSE"},
    "GOOGL": {"name": "Alphabet", "type": "stock", "exchange": "NASDAQ"},
    "AAPL": {"name": "Apple", "type": "stock", "exchange": "NASDAQ"},
    "MSFT": {"name": "Microsoft", "type": "stock", "exchange": "NASDAQ"},
    "NVDA": {"name": "NVIDIA", "type": "stock", "exchange": "NASDAQ"},
    # ETFs
    "NIFTYBEES.NS": {"name": "Nifty Bees", "type": "etf", "exchange": "NSE"},
    "GOLDBEES.NS": {"name": "Gold Bees", "type": "etf", "exchange": "NSE"},
    "SPY": {"name": "S&P 500 ETF", "type": "etf", "exchange": "US"},
    "QQQ": {"name": "Nasdaq 100 ETF", "type": "etf", "exchange": "US"},
}


def get_asset_info(ticker: str) -> Dict[str, str]:
    """Get asset metadata"""
    if ticker in TICKER_MAP:
        return TICKER_MAP[ticker]
    
    # Try to detect type
    if ticker.startswith("^"):
        return {"name": ticker, "type": "index", "exchange": "US"}
    elif "-" in ticker:
        return {"name": ticker, "type": "crypto", "exchange": "CRYPTO"}
    elif "=X" in ticker:
        return {"name": ticker, "type": "forex", "exchange": "FX"}
    elif ticker.endswith("NS"):
        return {"name": ticker.replace(".NS", ""), "type": "stock", "exchange": "NSE"}
    else:
        return {"name": ticker, "type": "unknown", "exchange": "US"}


def fetch_market_data(ticker: str, period: str = "1mo") -> Dict[str, Any]:
    """
    Universal function to get market data for any asset
    
    Returns:
    {
        name, type, exchange,
        price, change, change_percent,
        volume, high, low, open, previous_close,
        prices (history), volumes (history), timestamps,
        timestamp
    }
    """
    # Normalize ticker
    ticker = ticker.upper().strip()
    
    # Add suffix if needed
    if not any(suffix in ticker for suffix in [".NS", ".BO", "-USD", "=X", "^", "F"]):
        ticker = f"{ticker}.NS"
    
    try:
        ticker_obj = yf.Ticker(ticker)
        hist = ticker_obj.history(period=period)
        
        if hist.empty:
            return {"success": False, "error": f"No data for {ticker}"}
        
        # Get current data
        current = hist.iloc[-1]
        previous = hist.iloc[-2] if len(hist) > 1 else current
        
        price = float(current.get("Close", 0))
        prev_close = float(previous.get("Close", price))
        change = price - prev_close
        change_pct = (change / prev_close * 100) if prev_close > 0 else 0
        volume = int(current.get("Volume", 0))
        high = float(current.get("High", 0))
        low = float(current.get("Low", 0))
        open_price = float(current.get("Open", 0))
        
        # Get day range
        day_high = hist["High"].max()
        day_low = hist["Low"].min()
        
        info = get_asset_info(ticker)
        
        return {
            "success": True,
            "data": {
                "ticker": ticker,
                "name": info.get("name", ticker),
                "type": info.get("type", "stock"),
                "exchange": info.get("exchange", "NSE"),
                "price": round(price, 2),
                "change": round(change, 2),
                "change_percent": round(change_pct, 2),
                "volume": volume,
                "high": round(high, 2),
                "low": round(low, 2),
                "open": round(open_price, 2),
                "previous_close": round(prev_close, 2),
                "day_high": round(day_high, 2),
                "day_low": round(day_low, 2),
                "prices": [round(p, 2) for p in hist["Close"].tolist()],
                "volumes": [int(v) for v in hist["Volume"].tolist()],
                "timestamps": hist.index.strftime("%Y-%m-%d").tolist(),
                "timestamp": datetime.now().isoformat(),
            }
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


@cached(ttl=60) # Cache general market data for 1 minute
async def get_market_data_async(ticker: str, period: str = "1mo") -> Dict[str, Any]:
    """Async wrapper"""
    return await asyncio.to_thread(fetch_market_data, ticker, period)


async def get_multiple_market_data(tickers: List[str], period: str = "1mo") -> List[Dict[str, Any]]:
    """Fetch multiple tickers in parallel"""
    tasks = [get_market_data_async(t, period) for t in tickers]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    return [r["data"] for r in results if isinstance(r, dict) and r.get("success")]


async def get_live_market_data(ticker: str, use_cache: bool = True) -> Dict[str, Any]:
    """
    Get live data with smart caching
    """
    ticker = ticker.upper()
    
    # Check cache via the _get_live internal function to have a separate TTL
    @cached(ttl=10) # 10 second cache for live/ticker data
    async def _get_live(t):
        return await get_market_data_async(t, "1d")
    
    if use_cache:
        return await _get_live(ticker)
    
    return await get_market_data_async(ticker, "1d")