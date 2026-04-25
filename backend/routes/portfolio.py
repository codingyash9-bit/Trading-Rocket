"""
Paper Portfolio API Routes
Stores and manages analysis reports for users using SQLite database
"""
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import json
import uuid
from models.portfolio import PortfolioReport as PortfolioReportModel
from utils.db import db

router = APIRouter(prefix="/api/portfolio", tags=["Paper Portfolio"])

class ReportSection(BaseModel):
    fundamental: Optional[Dict[str, Any]] = None
    quantitative: Optional[Dict[str, Any]] = None
    sentiment: Optional[Dict[str, Any]] = None
    strategic: Optional[Dict[str, Any]] = None
    verdict: Optional[Dict[str, Any]] = None

class SaveReportRequest(BaseModel):
    userId: Optional[str] = "user" # Default to 'user' if not provided
    ticker: str
    companyName: str
    exchange: str
    reports: Optional[ReportSection] = None
    analysis: Optional[Dict[str, Any]] = None # Support both formats
    overallScore: Optional[float] = 0
    recommendation: Optional[str] = "Hold"

@router.on_event("startup")
async def startup():
    if db.is_closed():
        db.connect()
    db.create_tables([PortfolioReportModel])

@router.get("")
async def get_all_reports(ticker: Optional[str] = None):
    """Get all reports (standardized for frontend)"""
    try:
        query = PortfolioReportModel.select()
        if ticker:
            query = query.where(PortfolioReportModel.ticker == ticker.upper())
        
        reports = []
        for r in query.order_by(PortfolioReportModel.generated_at.desc()):
            reports.append({
                "id": r.id,
                "userId": r.user_id,
                "ticker": r.ticker,
                "companyName": r.company_name,
                "exchange": r.exchange,
                "generatedAt": r.generated_at.isoformat(),
                "analysis": json.loads(r.reports_json),
                "overallScore": r.overall_score,
                "recommendation": r.recommendation
            })
        return {"success": True, "reports": reports}
    except Exception as e:
        return {"success": False, "error": str(e)}

@router.post("")
async def save_report_v2(request: SaveReportRequest):
    """Save or update a report (v2 compatible with frontend)"""
    try:
        userId = request.userId or "user"
        ticker = request.ticker.upper()
        
        # Combine reports and analysis into one JSON field
        reports_data = {}
        if request.reports:
            reports_data = request.reports.model_dump()
        elif request.analysis:
            reports_data = request.analysis

        # Check for existing report for this ticker
        existing = PortfolioReportModel.get_or_none(
            (PortfolioReportModel.user_id == userId) & 
            (PortfolioReportModel.ticker == ticker)
        )
        
        if existing:
            existing.company_name = request.companyName
            existing.exchange = request.exchange
            existing.reports_json = json.dumps(reports_data)
            existing.overall_score = request.overallScore
            existing.recommendation = request.recommendation
            existing.generated_at = datetime.now()
            existing.save()
            report_id = existing.id
            message = f"Report for {ticker} updated"
        else:
            new_report = PortfolioReportModel.create(
                id=str(uuid.uuid4()),
                user_id=userId,
                ticker=ticker,
                company_name=request.companyName,
                exchange=request.exchange,
                reports_json=json.dumps(reports_data),
                overall_score=request.overallScore,
                recommendation=request.recommendation,
                generated_at=datetime.now()
            )
            report_id = new_report.id
            message = f"Report for {ticker} saved"
            
        return {
            "success": True, 
            "message": message, 
            "id": report_id
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

@router.delete("")
async def delete_report_query(ticker: str = Query(...)):
    """Delete a report by ticker"""
    try:
        q = PortfolioReportModel.delete().where(PortfolioReportModel.ticker == ticker.upper())
        count = q.execute()
        if count > 0:
            return {"success": True, "message": f"Deleted {ticker}"}
        else:
            return {"success": False, "error": f"No report found for {ticker}"}
    except Exception as e:
        return {"success": False, "error": str(e)}

# --- Legacy Support Routes ---

@router.get("/reports/{userId}")
def get_reports_legacy(userId: str):
    """Get all reports for a user"""
    query = PortfolioReportModel.select().where(PortfolioReportModel.user_id == userId)
    reports = []
    for r in query:
        reports.append({
            "id": r.id,
            "userId": r.user_id,
            "ticker": r.ticker,
            "companyName": r.company_name,
            "exchange": r.exchange,
            "generatedAt": r.generated_at.isoformat(),
            "reports": json.loads(r.reports_json),
            "overallScore": r.overall_score,
            "recommendation": r.recommendation
        })
    return {"success": True, "reports": reports}

@router.delete("/reports/{userId}/{ticker}")
def delete_report_legacy(userId: str, ticker: str):
    """Delete a specific report"""
    q = PortfolioReportModel.delete().where(
        (PortfolioReportModel.user_id == userId) & 
        (PortfolioReportModel.ticker == ticker.upper())
    )
    count = q.execute()
    if count == 0:
        raise HTTPException(status_code=404, detail=f"No report found for {ticker}")
    return {"success": True, "message": f"Report for {ticker} deleted"}
