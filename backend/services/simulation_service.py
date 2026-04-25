"""
Aether Alpha Engine - Portfolio Rebalancing & Correlation Service
"""
import numpy as np
import random
from typing import List, Dict, Any
from services.market_data_engine import get_multiple_market_data
from utils.cache import cached

class AetherAlphaEngine:
    def __init__(self):
        self.risk_free_rate = 0.07 # 7% (Standard Indian FD/Liquid Rate)

    @cached(ttl=600) # Cache portfolio simulations for 10 minutes
    async def calculate_portfolio_alpha(self, portfolio: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analyzes a portfolio and suggests optimization 'Swaps'
        """
        if not portfolio:
            return {"error": "Portfolio is empty"}

        tickers = [p['ticker'] for p in portfolio]
        market_data = await get_multiple_market_data(tickers)
        
        # Calculate individual metrics
        scores = []
        for item in market_data:
            # Mock scoring logic based on volatility and trend
            volatility = np.random.uniform(0.1, 0.4)
            returns = item.get('change_percent', 0) / 100
            sharpe = (returns - self.risk_free_rate/252) / (volatility / np.sqrt(252))
            
            scores.append({
                "ticker": item['ticker'],
                "sharpe": round(sharpe, 2),
                "volatility": round(volatility, 3),
                "momentum": item.get('change_percent', 0)
            })

        # Identify 'Laggards' (Low Sharpe, High Volatility)
        laggards = sorted(scores, key=lambda x: x['sharpe'])[:1]
        
        # Suggest 'Alpha Swaps' (High Sharpe alternatives in same sector)
        # In production, this would query a database of all NSE stocks
        suggestions = [
            {"from": laggards[0]['ticker'], "to": "ICICIBANK.NS", "reason": "Higher risk-adjusted returns in Banking sector"},
            {"from": "TCS.NS", "to": "INFY.NS", "reason": "Superior relative strength in IT index"}
        ]

        return {
            "overall_health": random.randint(65, 92),
            "metrics": scores,
            "suggestions": suggestions,
            "diversification_score": random.randint(40, 85)
        }

alpha_engine = AetherAlphaEngine()

def simulate_investment(initial_amount, expected_return, years, monthly_investment=0):
    total = initial_amount
    yearly_returns = []
    for _ in range(years):
        total = (total + monthly_investment * 12) * (1 + expected_return / 100)
        yearly_returns.append(total)
    
    return {
        "success": True,
        "data": {
            "final_amount": round(total, 2),
            "total_invested": initial_amount + monthly_investment * 12 * years,
            "estimated_growth": round(total - (initial_amount + monthly_investment * 12 * years), 2),
            "yearly_projection": [round(val, 2) for val in yearly_returns]
        }
    }

def monte_carlo_simulation(initial_amount, expected_return, volatility, years, simulations=1000):
    # Simplified Monte Carlo
    results = []
    for _ in range(simulations):
        total = initial_amount
        for _ in range(years):
            annual_return = np.random.normal(expected_return / 100, volatility / 100)
            total *= (1 + annual_return)
        results.append(total)
    
    results = np.array(results)
    return {
        "success": True,
        "data": {
            "p50": round(np.percentile(results, 50), 2),
            "p90": round(np.percentile(results, 90), 2),
            "p10": round(np.percentile(results, 10), 2),
            "simulations_run": simulations
        }
    }

def simulate_stock_price(current_price, days=30, volatility=2.0):
    prices = [current_price]
    for _ in range(days):
        change = np.random.normal(0, volatility / 100)
        prices.append(prices[-1] * (1 + change))
    
    return {
        "success": True,
        "data": {
            "initial_price": current_price,
            "final_price": round(prices[-1], 2),
            "price_history": [round(p, 2) for p in prices]
        }
    }

def calculate_portfolio_allocation(total_amount, risk_profile="moderate"):
    profiles = {
        "conservative": {"Equity": 0.3, "Debt": 0.6, "Gold": 0.1},
        "moderate": {"Equity": 0.6, "Debt": 0.3, "Gold": 0.1},
        "aggressive": {"Equity": 0.8, "Debt": 0.1, "Gold": 0.1}
    }
    
    allocation = profiles.get(risk_profile, profiles["moderate"])
    return {
        "success": True,
        "data": {
            "allocation": {asset: round(total_amount * weight, 2) for asset, weight in allocation.items()},
            "risk_profile": risk_profile
        }
    }
