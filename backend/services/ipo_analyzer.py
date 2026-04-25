"""
IPO Analysis Engine
Analyzes IPOs: Subscription, GMP, Listing Gain Probability
"""
from typing import Dict, Any, List
from datetime import datetime, timedelta
import random


# Known IPOs (can be extended with real data)
KNOWN_IPOS = [
    {
        "name": "Credgen Pure",
        "ticker": "CREDGEN.NS",
        "sector": "Finance",
        "issue_price": 100,
        "lot_size": 125,
        "min_investment": 12500,
    },
    {
        "name": "Mato",
        "ticker": "MATO.NS", 
        "sector": "Manufacturing",
        "issue_price": 250,
        "lot_size": 50,
        "min_investment": 12500,
    },
    {
        "name": "Apex",
        "ticker": "APEX.NS",
        "sector": "IT Services",
        "issue_price": 450,
        "lot_size": 30,
        "min_investment": 13500,
    },
]


def get_ipo_info(name_or_ticker: str) -> Dict[str, Any]:
    """Get IPO details"""
    for ipo in KNOWN_IPOS:
        if name_or_ticker.upper() in ipo["ticker"].upper() or name_or_ticker.lower() in ipo["name"].lower():
            return ipo
    return None


def analyze_subscription(quota_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Analyze subscription data
    
    Expected format:
    {
        "retail": x,
        "qib": y,
        "nii": z
    }
    
    Returns subscription strength analysis
    """
    retail = quota_data.get("retail", 0)
    qib = quota_data.get("qib", 0)
    nii = quota_data.get("nii", 0)
    
    # Calculate oversubscription
    total = retail + qib + nii
    
    # Determine hype
    if total > 50:
        hype = "Very High"
        hype_score = 90
    elif total > 20:
        hype = "High"
        hype_score = 75
    elif total > 10:
        hype = "Medium"
        hype_score = 60
    elif total > 5:
        hype = "Low"
        hype_score = 40
    else:
        hype = "Minimal"
        hype_score = 20
    
    # Segment analysis
    retail_hype = "High" if retail > 10 else "Low"
    qib_hype = "High" if qib > 5 else "Low"
    
    return {
        "total_oversubscription": total,
        "hype": hype,
        "hype_score": hype_score,
        "retail": retail,
        "qib": qib,
        "nii": nii,
        "retail_mood": retail_hype,
        "qib_mood": qib_hype,
    }


def estimate_gmp(issue_price: int, sector: str, hype_score: int) -> int:
    """
    Estimate Grey Market Premium (GMP)
    Based on sector, hype, and historical patterns
    """
    # Base premium by sector
    sector_premiums = {
        "Finance": 15,
        "IT Services": 25,
        "Manufacturing": 10,
        "FMCG": 8,
        "Pharma": 12,
        "Realty": -5,
    }
    
    base = sector_premiums.get(sector, 10)
    
    # Adjust by hype
    hype_adjustment = (hype_score - 50) * 0.5
    
    # Calculate GMP
    gmp = int(issue_price * (base + hype_adjustment) / 100)
    
    return max(0, gmp)


def estimate_listing_gain(issue_price: int, gmp: int) -> Dict[str, Any]:
    """
    Estimate listing day performance
    """
    if gmp > issue_price * 0.3:
        probability = "Very High"
        expected_gain = 20
    elif gmp > issue_price * 0.15:
        probability = "High"
        expected_gain = 10
    elif gmp > 0:
        probability = "Medium"
        expected_gain = 5
    else:
        probability = "Low"
        expected_gain = -5
    
    return {
        "gmp": gmp,
        "gmp_percent": round(gmp / issue_price * 100, 1),
        "listing_gain_probability": probability,
        "expected_listing_gain": expected_gain,
        "recommendation": "Apply" if expected_gain > 5 else "Skip"
    }


def analyze_ipo(name_or_ticker: str, subscription_data: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Complete IPO analysis
    
    Returns:
    {
        name, ticker, sector, issue_price,
        hype_score, risk_level, recommendation,
        gmp, listing_gain_probability,
        insight
    }
    """
    # Get IPO info
    ipo = get_ipo_info(name_or_ticker)
    
    if not ipo:
        # Return sample for unknown
        return {
            "success": False,
            "error": f"IPO not found: {name_or_ticker}"
        }
    
    # Analyze subscription if provided
    subscription = None
    if subscription_data:
        subscription = analyze_subscription(subscription_data)
        hype_score = subscription["hype_score"]
    else:
        # Generate estimates
        hype_score = random.randint(40, 80)
        subscription = {
            "hype_score": hype_score,
            "hype": "Medium" if hype_score > 50 else "Low"
        }
    
    # Calculate GMP
    gmp = estimate_gmp(ipo["issue_price"], ipo["sector"], hype_score)
    
    # Calculate listing gain
    listing = estimate_listing_gain(ipo["issue_price"], gmp)
    
    # Risk level
    risk = "High"
    if gmp < 0:
        risk = "Very High"
    elif listing["expected_listing_gain"] > 15:
        risk = "Low"
    elif listing["expected_listing_gain"] > 5:
        risk = "Medium"
    
    # Generate recommendation
    if hype_score > 70 and listing["expected_listing_gain"] > 10:
        recommendation = "Strong Apply"
    elif hype_score > 50 or listing["expected_listing_gain"] > 5:
        recommendation = "Apply"
    elif listing["expected_listing_gain"] > 0:
        recommendation = "Neutral"
    else:
        recommendation = "Avoid"
    
    # Generate insight
    insight = generate_ipo_insight(
        ipo["name"],
        hype_score,
        listing["expected_listing_gain"],
        gmp,
        ipo["sector"]
    )
    
    return {
        "success": True,
        "ipo": {
            "name": ipo["name"],
            "ticker": ipo["ticker"],
            "sector": ipo["sector"],
            "issue_price": ipo["issue_price"],
            "lot_size": ipo["lot_size"],
            "min_investment": ipo["min_investment"],
            "subscription": subscription,
            "hype_score": hype_score,
            "risk_level": risk,
            "recommendation": recommendation,
            "gmp": gmp,
            "listing": listing,
            "insight": insight,
            "status": "Active"  # or "Listed"
        }
    }


def generate_ipo_insight(name: str, hype_score: int, expected_gain: int, gmp: int, sector: str) -> str:
    """Generate human-like IPO insight"""
    insights = []
    
    # Hype insight
    if hype_score > 70:
        insights.append(f"{name} is generating exceptional interest")
    elif hype_score > 50:
        insights.append(f"{name} has good subscription demand")
    else:
        insights.append(f"{name} sees muted interest from investors")
    
    # GMP insight
    if gmp > 0:
        insights.append(f"GMP suggests {gmp}% premium at listing")
    else:
        insights.append("Grey market shows limited upside")
    
    # Gain insight
    if expected_gain > 15:
        insights.append("Strong listing day gains expected")
    elif expected_gain > 5:
        insights.append("Moderate listing gains likely")
    else:
        insights.append("Listing gains may be muted")
    
    # Sector insight
    if sector in ["IT Services", "Finance"]:
        insights.append(f"{sector} sector showing strength")
    
    return ". ".join(insights) + "."


def get_upcoming_ipos() -> List[Dict[str, Any]]:
    """Get list of upcoming IPOs"""
    return [
        {
            "name": ipo["name"],
            "ticker": ipo["ticker"],
            "sector": ipo["sector"],
            "issue_price": ipo["issue_price"],
            "status": "Upcoming"
        }
        for ipo in KNOWN_IPOS
    ]


def track_listed_ipo(ticker: str) -> Dict[str, Any]:
    """
    After IPO lists, switch to market tracking
    Uses market_data_engine
    """
    from services.market_data_engine import fetch_market_data
    
    data = fetch_market_data(ticker, "1mo")
    
    if not data.get("success"):
        return data
    
    market = data["data"]
    
    return {
        "success": True,
        "listed": {
            "ticker": ticker,
            "name": market["name"],
            "price": market["price"],
            "change_percent": market["change_percent"],
            "listing_day_change": market["change_percent"],
            "trend": "Bullish" if market["change_percent"] > 0 else "Bearish",
            "status": "Listed"
        }
    }