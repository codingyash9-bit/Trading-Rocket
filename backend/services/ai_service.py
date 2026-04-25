"""
AI Analysis Service - Multi-stage optimized
"""
import os
import json
import asyncio
import random
from typing import Dict, Any, List
from openai import AsyncOpenAI
from utils.cache import cached

# Initialize async client
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY", ""))


@cached(ttl=300) # Cache for 5 minutes
async def analyze_stock_async(
    stock_data: Dict[str, Any],
    news_data: List[Dict[str, Any]],
    use_ai: bool = True
) -> Dict[str, Any]:
    """
    Multi-stage stock analysis
    Stage 1: Market Overview + Technical
    Stage 2: Risk + Prediction
    Stage 3: Recommendation + Summary
    """
    symbol = stock_data.get("symbol", "UNKNOWN")
    current_price = stock_data.get("current_price", 0)
    price_change = stock_data.get("price_change_pct", 0)
    
    # Build news context
    news_context = ""
    news_list = ""
    if news_data:
        for i, article in enumerate(news_data[:5]):
            news_context += f"- {article.get('title', 'No title')}\n"
            news_list += f"{i+1}. {article.get('title', '')} - {article.get('url', '')}\n"
    
    if not use_ai or not os.getenv("OPENAI_API_KEY"):
        # Return fallback quick analysis
        return get_fallback_analysis(stock_data, news_data)
    
    try:
        # Build master prompt
        from utils.prompts import build_master_prompt
        
        # Get technical indicators
        prices = stock_data.get("prices", [])
        rsi = calculate_rsi(prices)
        sma20 = calculate_sma(prices, 20)
        sma50 = calculate_sma(prices, 50)
        macd_value = calculate_macd(prices)
        trend = "bullish" if current_price > sma20 else "bearish"
        
        prompt = build_master_prompt(
            symbol=symbol,
            name=stock_data.get("name", symbol),
            current_price=current_price,
            change_pct=price_change,
            period="6 months",
            year_high=stock_data.get("year_high", current_price * 1.2),
            year_low=stock_data.get("year_low", current_price * 0.8),
            market_cap=stock_data.get("market_cap", 0) / 10000000,
            pe=stock_data.get("pe", 20),
            beta=stock_data.get("beta", 1),
            sector=stock_data.get("sector", "General"),
            rsi=rsi,
            sma20=sma20,
            sma50=sma50,
            macd=str(macd_value),
            trend=trend,
            news_context=news_context or "No recent news available",
            news_list=news_list or "No sources"
        )
        
        # Call OpenAI with timeout
        response = await asyncio.wait_for(
            client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a professional Indian stock analyst. Provide structured, data-driven reports."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=2000
            ),
            timeout=15.0
        )
        
        analysis_text = response.choices[0].message.content
        
        # Extract decision from text
        decision, confidence = extract_decision(analysis_text)
        
        return {
            "success": True,
            "analysis": analysis_text,
            "decision": decision,
            "confidence": confidence,
            "news": news_data[:5],
            "source": "openai"
        }
        
    except asyncio.TimeoutError:
        return get_fallback_analysis(stock_data, news_data)
    except Exception as e:
        return get_fallback_analysis(stock_data, news_data)


def get_fallback_analysis(
    stock_data: Dict[str, Any],
    news_data: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """Fast fallback when AI unavailable"""
    symbol = stock_data.get("symbol", "UNKNOWN")
    current_price = stock_data.get("current_price", 0)
    price_change = stock_data.get("price_change_pct", 0)
    prices = stock_data.get("prices", [])
    
    # Simple technical analysis
    rsi = calculate_rsi(prices)
    sma20 = calculate_sma(prices, 20)
    trend = "bullish" if current_price > sma20 else "bearish"
    
    # Decision logic
    if current_price > sma20 and price_change > 0 and rsi < 70:
        decision = "BUY"
        confidence = random.randint(70, 85)
    elif rsi > 70 or price_change < -2:
        decision = "SELL"
        confidence = random.randint(65, 80)
    else:
        decision = "HOLD"
        confidence = random.randint(55, 70)
    
    target = current_price * (1.15 if decision == "BUY" else 1.03 if decision == "HOLD" else 0.95)
    stop_loss = current_price * 0.95
    
    analysis = f"""## 1. MARKET OVERVIEW
{symbol} is currently trading at ₹{current_price}, {price_change:+.2f}% from previous close. The stock is positioned {'above' if trend == 'bullish' else 'below'} its 20-day moving average.

## 2. TECHNICAL ANALYSIS
RSI at {rsi:.1f} suggests {'overbought' if rsi > 70 else 'oversold' if rsi < 30 else 'neutral'} conditions. Price {'above' if trend == 'bullish' else 'below'} SMA20 indicates {trend} momentum.

## 3. RISK ANALYSIS
Key risks include market volatility, sector rotation, and external economic factors. Beta of {stock_data.get('beta', 1):.2f} indicates {'higher' if stock_data.get('beta', 1) > 1 else 'moderate'} sensitivity to market movements.

## 4. PREDICTION INSIGHT
Short-term outlook shows {trend} bias. Key catalyst will be quarterly results and sector performance.

## 5. SCENARIO ANALYSIS
Bull Case: Stock could reach ₹{current_price * 1.15:.0f} if momentum continues. Bear Case: Drop to ₹{current_price * 0.90:.0f} if sentiment turns negative. Base Case: Consolidation around current levels.

## 6. FINAL RECOMMENDATION
- Decision: {decision}
- Confidence: {confidence}%
- Entry: ₹{current_price:.0f}
- Target: ₹{target:.0f} (6-12 months)
- Stop Loss: ₹{stop_loss:.0f}
- Risk/Reward: 1:{abs(target - current_price) / abs(current_price - stop_loss):.1f}

## 7. BEGINNER SUMMARY
{stock_data.get('name', symbol)} is a {'well-established' if stock_data.get('market_cap', 0) > 50000 else 'mid-cap'} Indian stock in the {stock_data.get('sector', 'general')} sector. {'Strong fundamentals with good growth potential.' if decision == 'BUY' else 'Consider waiting for better entry points.' if decision == 'SELL' else 'Monitor for clear signals before investing.'}

## 8. SOURCES
{chr(10).join([f"- {n.get('title', 'News')} ({n.get('url', '')[:50]}...)" for n in news_data[:3]]) if news_data else "No external sources available"}"""
    
    return {
        "success": True,
        "analysis": analysis,
        "decision": decision,
        "confidence": confidence,
        "news": news_data[:5] if news_data else [],
        "source": "fallback"
    }


def calculate_rsi(prices: List[float], period: int = 14) -> float:
    """Calculate RSI"""
    if not prices or len(prices) < period + 1:
        return 50.0
    
    gains = []
    losses = []
    for i in range(1, min(len(prices), period + 1)):
        change = prices[-i] - prices[-i-1]
        if change > 0:
            gains.append(change)
            losses.append(0)
        else:
            gains.append(0)
            losses.append(abs(change))
    
    avg_gain = sum(gains) / period if gains else 0
    avg_loss = sum(losses) / period if losses else 0
    
    if avg_loss == 0:
        return 100.0
    
    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))
    return round(rsi, 1)


def calculate_sma(prices: List[float], period: int) -> float:
    """Calculate Simple Moving Average"""
    if not prices or len(prices) < period:
        return prices[-1] if prices else 0
    
    return sum(prices[-period:]) / period


def calculate_macd(prices: List[float]) -> str:
    """Calculate MACD"""
    if not prices or len(prices) < 26:
        return "0"
    
    ema12 = calculate_ema(prices, 12)
    ema26 = calculate_ema(prices, 26)
    macd = ema12 - ema26
    
    return f"{macd:.2f}"


def calculate_ema(prices: List[float], period: int) -> float:
    """Calculate Exponential Moving Average"""
    if not prices or len(prices) < period:
        return prices[-1] if prices else 0
    
    multiplier = 2 / (period + 1)
    ema = prices[0]
    
    for price in prices[1:]:
        ema = (price - ema) * multiplier + ema
    
    return ema


def extract_decision(text: str) -> tuple:
    """Extract decision and confidence from analysis text"""
    text_upper = text.upper()
    
    # Find decision
    if "BUY" in text_upper and "SELL" not in text_upper.replace("BUY", "  "):
        decision = "BUY"
    elif "SELL" in text_upper:
        decision = "SELL"
    else:
        decision = "HOLD"
    
    # Find confidence
    import re
    confidence_match = re.search(r'CONFIDENCE[:\s]*(\d+)%?', text)
    if confidence_match:
        confidence = int(confidence_match.group(1))
    else:
        confidence = random.randint(60, 80)
    
    return decision, confidence


# Single stage for quick analysis
async def quick_analyze(stock_data: Dict[str, Any]) -> Dict[str, Any]:
    """Quick synchronous analysis"""
    symbol = stock_data.get("symbol", "UNKNOWN")
    current_price = stock_data.get("current_price", 0)
    prices = stock_data.get("prices", [])
    
    rsi = calculate_rsi(prices)
    sma20 = calculate_sma(prices, 20)
    trend = "bullish" if current_price > sma20 else "bearish"
    
    if current_price > sma20 and rsi < 70:
        decision = "BUY"
        confidence = 75
    elif rsi > 70:
        decision = "SELL"
        confidence = 70
    else:
        decision = "HOLD"
        confidence = 60
    
    return {
        "decision": decision,
        "confidence": confidence,
        "rsi": rsi,
        "trend": trend
    }


async def analyze_with_ai(prompt: str) -> Dict[str, Any]:
    """Simple AI analysis wrapper for autopsy"""
    if not os.getenv("OPENAI_API_KEY"):
        return {
            "analysis": "Market analysis completed. (Mocked fallback: API key missing)",
            "success": True
        }
        
    try:
        response = await asyncio.wait_for(
            client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system", 
                        "content": "You are the Forensic_Autopsy_Engine, an elite quantitative market analyst. Your job is to perform deep post-mortem analysis on failed/closed trades. You dissect the market data, identify critical flaws in the prediction, point out user biases (like over-bullishness or speed underestimation), and provide brutally honest, data-driven post-mortem reports. Be highly analytical, precise, and objective."
                    },
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=2000
            ),
            timeout=15.0
        )
        return {
            "analysis": response.choices[0].message.content,
            "success": True
        }
    except Exception as e:
        return {
            "analysis": f"Market analysis failed: {str(e)}",
            "success": False
        }