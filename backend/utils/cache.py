import time
from typing import Any, Dict, Optional, Callable
import functools
import asyncio

class AsyncCache:
    """
    Simple in-memory cache for async functions with TTL support.
    """
    def __init__(self):
        self._cache: Dict[str, Dict[str, Any]] = {}

    def set(self, key: str, value: Any, ttl: int = 60):
        self._cache[key] = {
            "value": value,
            "expiry": time.time() + ttl
        }

    def get(self, key: str) -> Optional[Any]:
        if key in self._cache:
            item = self._cache[key]
            if time.time() < item["expiry"]:
                return item["value"]
            else:
                del self._cache[key]
        return None

    def clear(self):
        self._cache.clear()

# Global cache instance
global_cache = AsyncCache()

def cached(ttl: int = 60):
    """
    Decorator for caching async function results.
    """
    def decorator(func: Callable):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            # Create a cache key based on function name and arguments
            key = f"{func.__name__}:{args}:{kwargs}"
            
            cached_value = global_cache.get(key)
            if cached_value is not None:
                return cached_value
            
            result = await func(*args, **kwargs)
            global_cache.set(key, result, ttl)
            return result
        return wrapper
    return decorator
