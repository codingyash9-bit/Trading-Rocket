"""
Simulation Routes
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from services.simulation_service import (
    simulate_investment,
    monte_carlo_simulation,
    simulate_stock_price,
    calculate_portfolio_allocation,
    alpha_engine
)

router = APIRouter()

class InvestmentSimRequest(BaseModel):
    initial_amount: float
    expected_return: Optional[float] = 15.0
    years: Optional[int] = 5
    monthly_investment: Optional[float] = 0

class MonteCarloRequest(BaseModel):
    initial_amount: float
    expected_return: Optional[float] = 15.0
    volatility: Optional[float] = 20.0
    years: Optional[int] = 5
    simulations: Optional[int] = 1000

class StockPriceSimRequest(BaseModel):
    current_price: float
    days: Optional[int] = 30
    volatility: Optional[float] = 2.0

class PortfolioAllocationRequest(BaseModel):
    total_amount: float
    risk_profile: Optional[str] = "moderate"

class AlphaRequest(BaseModel):
    portfolio: List[Dict[str, Any]]

@router.post("/simulate")
async def simulate_invest(request: InvestmentSimRequest):
    if request.initial_amount <= 0:
        raise HTTPException(status_code=400, detail="Initial amount must be positive")
    result = simulate_investment(
        initial_amount=request.initial_amount,
        expected_return=request.expected_return or 15.0,
        years=request.years or 5,
        monthly_investment=request.monthly_investment or 0
    )
    return result

@router.post("/simulate/monte-carlo")
async def monte_carlo(request: MonteCarloRequest):
    if request.initial_amount <= 0:
        raise HTTPException(status_code=400, detail="Initial amount must be positive")
    result = monte_carlo_simulation(
        initial_amount=request.initial_amount,
        expected_return=request.expected_return or 15.0,
        volatility=request.volatility or 20.0,
        years=request.years or 5,
        simulations=request.simulations or 1000
    )
    return result

@router.post("/simulate/alpha")
async def simulate_alpha(request: AlphaRequest):
    if not request.portfolio:
        raise HTTPException(status_code=400, detail="Portfolio cannot be empty")
    result = await alpha_engine.calculate_portfolio_alpha(request.portfolio)
    return result

@router.get("/simulate/sip-calculator")
async def sip_calculator(target_amount: float, years: int, expected_return: float = 15.0):
    if target_amount <= 0 or years <= 0:
        raise HTTPException(status_code=400, detail="Invalid parameters")
    monthly_return = expected_return / 12 / 100
    months = years * 12
    if monthly_return > 0:
        sip = target_amount * monthly_return / (pow(1 + monthly_return, months) - 1)
    else:
        sip = target_amount / months
    return {
        "success": True,
        "data": {
            "target_amount": target_amount,
            "years": years,
            "expected_return": expected_return,
            "required_monthly_sip": round(sip, 2),
            "total_investment": round(sip * months, 2),
            "estimated_growth": round(target_amount - (sip * months), 2)
        }
    }
