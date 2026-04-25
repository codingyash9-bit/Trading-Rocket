"""
Trading Rocket Backend
FastAPI application for AI-powered trading dashboard
"""
import os
from fastapi import FastAPI, Depends, HTTPException, Security
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security.api_key import APIKeyHeader, APIKey
from starlette.status import HTTP_403_FORBIDDEN
from dotenv import load_dotenv

from routes.analyze import router as analyze_router
from routes.chat import router as chat_router
from routes.market import router as market_router
from routes.simulate import router as simulate_router
from routes.realtime_market import router as realtime_router
from routes.news import router as news_router
from routes.portfolio import router as portfolio_router
from routes.company_radar import router as radar_router
from routes.market_pulse import router as pulse_router
from routes.user import router as user_router
from routes.autopsy import router as autopsy_router
from routes.predictions import router as predictions_router
from routes.outcomes import router as outcomes_router
from routes.bias import router as bias_router
from routes.wargame import router as wargame_router
from routes.graveyard import router as graveyard_router
from utils.auth import get_api_key
from utils.db import db
from models.portfolio import PortfolioReport
from models.company_radar import RadarStock

load_dotenv()

app = FastAPI(
    title="Trading Rocket API",
    description="AI-powered trading dashboard backend",
    version="2.1.0"
)

@app.on_event("startup")
async def startup_db_client():
    if db.is_closed():
        db.connect()
    db.create_tables([PortfolioReport, RadarStock])

# Restricted CORS for Production
allowed_origins_raw = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
allowed_origins = [origin.strip() for origin in allowed_origins_raw.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Protect all routes with API Key by default
app.include_router(market_router, prefix="/api", tags=["Market"], dependencies=[Depends(get_api_key)])
app.include_router(realtime_router, prefix="/api", tags=["Real-Time Market"], dependencies=[Depends(get_api_key)])
app.include_router(analyze_router, prefix="/api", tags=["Analyze"], dependencies=[Depends(get_api_key)])
app.include_router(chat_router, prefix="/api", tags=["Chat"], dependencies=[Depends(get_api_key)])
app.include_router(simulate_router, prefix="/api", tags=["Simulate"], dependencies=[Depends(get_api_key)])
app.include_router(news_router, prefix="/api", tags=["News"], dependencies=[Depends(get_api_key)])
app.include_router(portfolio_router, prefix="/api", tags=["Paper Portfolio"], dependencies=[Depends(get_api_key)])
app.include_router(radar_router, prefix="/api", tags=["Company Radar"], dependencies=[Depends(get_api_key)])
app.include_router(pulse_router, prefix="/api", tags=["Market Pulse"], dependencies=[Depends(get_api_key)])
app.include_router(user_router, prefix="/api/user", tags=["User Settings"], dependencies=[Depends(get_api_key)])
app.include_router(autopsy_router, prefix="/api", tags=["Autopsy"], dependencies=[Depends(get_api_key)])
app.include_router(predictions_router, dependencies=[Depends(get_api_key)])
app.include_router(outcomes_router, dependencies=[Depends(get_api_key)])
app.include_router(bias_router, dependencies=[Depends(get_api_key)])
app.include_router(wargame_router, dependencies=[Depends(get_api_key)])
app.include_router(graveyard_router, dependencies=[Depends(get_api_key)])

@app.get("/", tags=["General"])
async def root():
    return {"message": "Trading Rocket API v2.1", "status": "running"}

@app.get("/health", tags=["General"])
async def health():
    return {"status": "healthy"}