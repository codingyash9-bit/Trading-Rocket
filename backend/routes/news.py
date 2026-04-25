"""
Intelligent News Routes
Market intelligence with AI impact analysis
"""
import asyncio
from fastapi import APIRouter
from pydantic import BaseModel

from services.intelligent_news_service import (
    fetch_market_news,
    fetch_stock_news,
    get_news_summary
)

router = APIRouter()


@router.get("/news/market")
async def market_news():
    """
    Get comprehensive market news with AI impact analysis
    
    Returns:
    [
      {
        title,
        url,
        image,
        source,
        sentiment (positive/negative/neutral),
        impact (high/medium/low),
        sector (banking/it/energy/etc)
      }
    ]
    """
    return await fetch_market_news()


@router.get("/news/stock/{symbol}")
async def stock_news(symbol: str):
    """Get news specific to a stock with impact analysis"""
    if not symbol.endswith('.NS'):
        symbol = f"{symbol}.NS"
    
    return await fetch_stock_news(symbol)


@router.get("/news/summary")
async def news_summary():
    """Get news summary with sentiment analysis"""
    return await get_news_summary()


@router.get("/news/status")
async def news_status():
    """Check news system status"""
    from services.intelligent_news_service import news_cache, NEWS_CACHE_TTL
    return {
        "status": "operational",
        "cache_items": len(news_cache),
        "cache_ttl_seconds": NEWS_CACHE_TTL
    }