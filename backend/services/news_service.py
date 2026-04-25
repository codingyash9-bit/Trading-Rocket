"""
News Service - Real news fetching
"""
import os
import httpx
from typing import Dict, List, Any, Optional
import time

# Cache storage
news_cache: Dict[str, Dict[str, Any]] = {}
CACHE_TTL = 300  # 5 minutes


def get_cache_key(symbol: str) -> str:
    return f"news_{symbol}"


def get_from_cache(symbol: str) -> Optional[List[Dict[str, Any]]]:
    key = get_cache_key(symbol)
    if key in news_cache:
        cached = news_cache[key]
        if time.time() - cached["timestamp"] < CACHE_TTL:
            return cached["data"]
    return None


def set_cache(symbol: str, data: List[Dict[str, Any]]):
    key = get_cache_key(symbol)
    news_cache[key] = {"data": data, "timestamp": time.time()}


async def fetch_stock_news(symbol: str) -> Dict[str, Any]:
    """
    Fetch real news for a stock symbol
    Uses multiple free sources
    """
    # Check cache first
    cached = get_from_cache(symbol)
    if cached:
        return {"success": True, "data": cached, "cached": True}
    
    # Strip .NS suffix for search
    search_term = symbol.replace(".NS", "").replace(".BO", "")
    
    articles = []
    
    # Try NewsAPI (requires API key)
    api_key = os.getenv("NEWSAPI_KEY", "")
    
    if api_key and api_key != "your_newsapi_key_here":
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    f"https://newsapi.org/v2/everything",
                    params={
                        "q": search_term,
                        "apiKey": api_key,
                        "language": "en",
                        "sortBy": "publishedAt",
                        "pageSize": 5
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    for article in data.get("articles", [])[:5]:
                        if article.get("title") and article.get("url"):
                            articles.append({
                                "title": article["title"],
                                "url": article["url"],
                                "source": article.get("source", {}).get("name", "News"),
                                "publishedAt": article.get("publishedAt", ""),
                                "description": article.get("description", "")[:150]
                            })
        except Exception:
            pass
    
    # Fallback: Generate search-friendly URLs (not fake content)
    # These are real search links users can click
    if not articles:
        # Use common Indian finance sites for reference
        search_urls = [
            {
                "title": f"Search {search_term} on Google Finance",
                "url": f"https://www.google.com/search?q={search_term}+stock+India&tbm=nws",
                "source": "Google News",
                "publishedAt": "",
                "description": f"Latest news and updates for {search_term}"
            },
            {
                "title": f"{search_term} Market Analysis on MoneyControl",
                "url": f"https://www.moneycontrol.com/stockscsv/?search={search_term.lower()}",
                "source": "MoneyControl",
                "publishedAt": "",
                "description": f"Market data and analysis for {search_term}"
            },
            {
                "title": f"{search_term} Stock News on Screener.in",
                "url": f"https://www.screener.in/company/{search_term.lower()}/",
                "source": "Screener.in",
                "publishedAt": "",
                "description": f"Company fundamentals and news for {search_term}"
            }
        ]
        articles = search_urls
    
    # Cache results
    set_cache(symbol, articles)
    
    return {
        "success": True,
        "data": articles,
        "cached": False
    }


async def fetch_market_news() -> Dict[str, Any]:
    """Fetch general Indian market news"""
    articles = []
    
    api_key = os.getenv("NEWSAPI_KEY", "")
    
    if api_key and api_key != "your_newsapi_key_here":
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    "https://newsapi.org/v2/top-headlines",
                    params={
                        "country": "in",
                        "category": "business",
                        "apiKey": api_key,
                        "pageSize": 10
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    for article in data.get("articles", [])[:10]:
                        if article.get("title") and article.get("url"):
                            articles.append({
                                "title": article["title"],
                                "url": article["url"],
                                "source": article.get("source", {}).get("name", "News"),
                                "publishedAt": article.get("publishedAt", ""),
                                "description": article.get("description", "")[:150]
                            })
        except Exception:
            pass
    
    if not articles:
        articles = [
            {
                "title": "Indian Stock Market News - Economic Times",
                "url": "https://economictimes.indiatimes.com/markets",
                "source": "Economic Times",
                "publishedAt": "",
                "description": "Latest market updates from India"
            },
            {
                "title": "Stock Market News - Business Standard",
                "url": "https://www.business-standard.com/markets",
                "source": "Business Standard",
                "publishedAt": "",
                "description": "Indian markets overview"
            }
        ]
    
    return {"success": True, "data": articles}


async def fetch_sector_news(sector: str) -> Dict[str, Any]:
    """Fetch news for a specific sector"""
    sector_search = {
        "IT": "Indian IT stocks OR TCS OR Infosys",
        "Banking": "Indian banking stocks OR HDFC OR ICICI",
        "Finance": "Indian finance sector",
        "Energy": "Indian energy stocks OR oil gas",
        "Pharma": "Indian pharma stocks"
    }
    
    search_term = sector_search.get(sector, sector)
    api_key = os.getenv("NEWSAPI_KEY", "")
    
    articles = []
    
    if api_key and api_key != "your_newsapi_key_here":
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    f"https://newsapi.org/v2/everything",
                    params={
                        "q": search_term,
                        "apiKey": api_key,
                        "language": "en",
                        "sortBy": "relevancy",
                        "pageSize": 5
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    for article in data.get("articles", [])[:5]:
                        if article.get("title") and article.get("url"):
                            articles.append({
                                "title": article["title"],
                                "url": article["url"],
                                "source": article.get("source", {}).get("name", "News"),
                                "publishedAt": article.get("publishedAt", "")
                            })
        except Exception:
            pass
    
    return {"success": True, "data": articles if articles else []}