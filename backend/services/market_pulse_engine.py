"""
Market Pulse Analytics Engine
Analyzes market data: Trend, Momentum, Volatility, Sentiment
"""
from typing import Dict, Any, List
import math


def calculate_sma(prices: List[float], period: int = 20) -> float:
    """Calculate Simple Moving Average"""
    if len(prices) < period:
        period = len(prices)
    if period == 0:
        return 0
    return sum(prices[-period:]) / period


def calculate_rsi(prices: List[float], period: int = 14) -> float:
    """
    Calculate RSI (Relative Strength Index)
    Returns value 0-100
    """
    if len(prices) < period + 1:
        return 50  # Neutral
    
    gains = []
    losses = []
    
    for i in range(-period, 0):
        change = prices[i + 1] - prices[i]
        if change > 0:
            gains.append(change)
            losses.append(0)
        else:
            gains.append(0)
            losses.append(abs(change))
    
    avg_gain = sum(gains) / period if gains else 0
    avg_loss = sum(losses) / period if losses else 0
    
    if avg_loss == 0:
        return 100
    
    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))
    return round(rsi, 2)


def calculate_volatility(prices: List[float]) -> float:
    """Calculate volatility (standard deviation of % changes)"""
    if len(prices) < 2:
        return 0
    
    changes = []
    for i in range(1, len(prices)):
        pct_change = (prices[i] - prices[i-1]) / prices[i-1] * 100
        changes.append(pct_change)
    
    if not changes:
        return 0
    
    mean = sum(changes) / len(changes)
    variance = sum((c - mean) ** 2 for c in changes) / len(changes)
    return round(math.sqrt(variance), 2)


def detect_support_resistance(prices: List[float]) -> Dict[str, float]:
    """
    Simple Support & Resistance detection
    Uses recent min/max with buffer
    """
    if len(prices) < 5:
        return {"support": min(prices) if prices else 0, "resistance": max(prices) if prices else 0}
    
    # Use last 20 candles for S/R
    recent = prices[-20:]
    support = min(recent)
    resistance = max(recent)
    
    return {
        "support": round(support, 2),
        "resistance": round(resistance, 2)
    }


def detect_breakout(prices: List[float], high: float, low: float) -> str:
    """Detect if price broke out of daily range"""
    if not prices:
        return "No"
    
    current = prices[-1]
    
    if current > high * 0.998:  # Near high
        return "Upside"
    elif current < low * 1.002:  # Near low
        return "Downside"
    else:
        return "No"


def analyze_trend(prices: List[float], period: int = 20) -> str:
    """
    Determine trend: Bullish, Bearish, or Sideways
    Uses SMA crossover logic
    """
    if len(prices) < period:
        return "Sideways"
    
    sma_current = calculate_sma(prices, period)
    sma_prev = calculate_sma(prices[:-5], period) if len(prices) > 5 else sma_current
    
    current_price = prices[-1]
    
    # Strong uptrend
    if current_price > sma_current and sma_current > sma_prev:
        return "Bullish"
    # Strong downtrend
    elif current_price < sma_current and sma_current < sma_prev:
        return "Bearish"
    # Weak/no trend
    else:
        return "Sideways"


def analyze_momentum(prices: List[float], volume: List[int]) -> str:
    """
    Determine momentum: Strong or Weak
    Based on price velocity and volume
    """
    if len(prices) < 5:
        return "Weak"
    
    # Price momentum (last 5 candles)
    price_change = (prices[-1] - prices[-5]) / prices[-5] * 100
    
    # Volume momentum
    avg_volume = sum(volume[-10:]) / 10 if len(volume) > 10 else sum(volume) / len(volume)
    recent_volume = sum(volume[-3:]) / 3
    volume_ratio = recent_volume / avg_volume if avg_volume > 0 else 1
    
    score = 0
    
    if abs(price_change) > 3:
        score += 2
    elif abs(price_change) > 1:
        score += 1
    
    if volume_ratio > 1.3:
        score += 2
    elif volume_ratio > 1:
        score += 1
    
    if score >= 3:
        return "Strong"
    else:
        return "Weak"


def analyze_volatility(prices: List[float]) -> str:
    """
    Calculate volatility: Low, Medium, High
    """
    if len(prices) < 5:
        return "Medium"
    
    vol = calculate_volatility(prices)
    
    if vol < 1:
        return "Low"
    elif vol < 3:
        return "Medium"
    else:
        return "High"


def calculate_sentiment(price_change_pct: float, rsi: float, trend: str, momentum: str) -> int:
    """
    Calculate sentiment score: 0-100
    - price_change_pct: daily change %
    - rsi: 0-100
    - trend: Bullish/Bearish/Sideways
    - momentum: Strong/Weak
    """
    score = 50  # Base
    
    # Price change contribution (-20 to +20)
    score += max(-20, min(20, price_change_pct * 2))
    
    # RSI contribution
    if rsi > 70:
        score -= 10  # Overbought
    elif rsi < 30:
        score += 10  # Oversold (potential bounce)
    elif rsi > 55:
        score += 5
    elif rsi < 45:
        score -= 5
    
    # Trend contribution
    if trend == "Bullish":
        score += 15
    elif trend == "Bearish":
        score -= 15
    
    # Momentum contribution
    if momentum == "Strong":
        score += 10
    else:
        score -= 5
    
    return max(0, min(100, int(score)))


def get_signal(sma20: float, sma50: float, rsi: float, current_price: float) -> str:
    """
    Generate trading signal: Buy, Sell, Hold
    """
    buy_signals = []
    sell_signals = []
    
    # SMA signals
    if sma20 > sma50:
        buy_signals.append("SMA gold cross")
    else:
        sell_signals.append("SMA death cross")
    
    # Price vs SMA
    if current_price > sma20:
        buy_signals.append("Price above SMA20")
    else:
        sell_signals.append("Price below SMA20")
    
    # RSI signals
    if rsi < 30:
        buy_signals.append("RSI oversold")
    elif rsi > 70:
        sell_signals.append("RSI overbought")
    
    # Decision
    if len(buy_signals) > len(sell_signals):
        return "Buy"
    elif len(sell_signals) > len(buy_signals):
        return "Sell"
    else:
        return "Hold"


def analyze_market_pulse(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Complete market pulse analysis for ONE asset
    
    Input: data from market_data_engine
    Output: trend, momentum, volatility, sentiment, technical indicators
    """
    if not data.get("success"):
        return {"success": False, "error": data.get("error")}
    
    market_data = data["data"]
    prices = market_data.get("prices", [])
    volumes = market_data.get("volumes", [])
    
    if not prices:
        return {"success": False, "error": "No price data"}
    
    # Calculate indicators
    sma20 = calculate_sma(prices, 20)
    sma50 = calculate_sma(prices, 50)
    rsi = calculate_rsi(prices, 14)
    volatility = calculate_volatility(prices)
    sr = detect_support_resistance(prices)
    
    # Calculate pulse metrics
    trend = analyze_trend(prices)
    momentum = analyze_momentum(prices, volumes)
    volatility_level = analyze_volatility(prices)
    
    # Sentiment score
    sentiment = calculate_sentiment(
        market_data.get("change_percent", 0),
        rsi,
        trend,
        momentum
    )
    
    # Signal
    current_price = prices[-1] if prices else 0
    signal = get_signal(sma20, sma50, rsi, current_price)
    
    # Breakout
    breakout = detect_breakout(
        prices,
        market_data.get("day_high", current_price),
        market_data.get("day_low", current_price)
    )
    
    return {
        "success": True,
        "pulse": {
            "ticker": market_data.get("ticker"),
            "name": market_data.get("name"),
            "type": market_data.get("type"),
            "price": market_data.get("price"),
            "change_percent": market_data.get("change_percent"),
            # Pulse metrics
            "trend": trend,
            "momentum": momentum,
            "volatility": volatility_level,
            "sentiment": sentiment,
            # Technical indicators
            "technical": {
                "rsi": rsi,
                "sma20": round(sma20, 2) if sma20 else None,
                "sma50": round(sma50, 2) if sma50 else None,
                "signal": signal,
                "breakout": breakout,
                "support": sr["support"],
                "resistance": sr["resistance"],
            },
            # Insights
            "insight": generate_insight(
                market_data.get("name"),
                trend,
                momentum,
                sentiment,
                market_data.get("change_percent", 0)
            ),
            "timestamp": market_data.get("timestamp")
        }
    }


def generate_insight(name: str, trend: str, momentum: str, sentiment: int, change_pct: float) -> str:
    """Generate human-like market insight"""
    insights = []
    
    # Trend insight
    if trend == "Bullish":
        insights.append(f"{name} is in an uptrend")
    elif trend == "Bearish":
        insights.append(f"{name} shows bearish momentum")
    else:
        insights.append(f"{name} is moving sideways")
    
    # Momentum insight
    if momentum == "Strong":
        insights.append("strong price action")
    else:
        insights.append("weak momentum")
    
    # Change insight
    if change_pct > 2:
        insights.append("gaining strength today")
    elif change_pct < -2:
        insights.append("under pressure")
    
    # Sentiment insight
    if sentiment > 70:
        insights.append("bullish sentiment dominates")
    elif sentiment < 30:
        insights.append("fear is evident")
    
    return ". ".join(insights) + "."


def analyze_multiple_pulse(data_list: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Analyze multiple assets and generate market summary"""
    if not data_list:
        return {"success": False, "error": "No data"}
    
    pulses = []
    for data in data_list:
        result = analyze_market_pulse(data)
        if result.get("success"):
            pulses.append(result["pulse"])
    
    if not pulses:
        return {"success": False, "error": "No valid analyses"}
    
    # Calculate market summary
    sentiments = [p["sentiment"] for p in pulses]
    avg_sentiment = sum(sentiments) / len(sentiments)
    
    # Count trends
    trends = {"Bullish": 0, "Bearish": 0, "Sideways": 0}
    for p in pulses:
        trends[p["trend"]] = trends.get(p["trend"], 0) + 1
    
    # Determine overall market
    overall = "Sideways"
    if trends["Bullish"] > trends["Bearish"]:
        overall = "Bullish"
    elif trends["Bearish"] > trends["Bullish"]:
        overall = "Bearish"
    
    # Safe vs aggressive assets
    safe = [p["name"] for p in pulses if p["type"] in ["commodity", "etf"] and p["sentiment"] > 50]
    aggressive = [p["name"] for p in pulses if p["type"] in ["stock", "crypto"] and p["sentiment"] > 60]
    
    return {
        "success": True,
        "summary": {
            "overall_market": overall,
            "avg_sentiment": round(avg_sentiment, 1),
            "asset_count": len(pulses),
            "trends": trends,
            "safe_assets": safe[:3],
            "aggressive_assets": aggressive[:3],
            "pulses": pulses,
            "timestamp": pulses[0].get("timestamp")
        }
    }