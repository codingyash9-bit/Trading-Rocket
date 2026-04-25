from fastapi import APIRouter, HTTPException
from typing import List

from models.bias_profile import BiasProfile
from services.autopsy_engine import autopsy_engine

router = APIRouter(prefix="/api/autopsy", tags=["Autopsy Bias Profiles"])

@router.get("/bias/{user_id}", response_model=List[BiasProfile])
def get_user_bias(user_id: str):
    profiles = autopsy_engine.get_bias_profiles()
    return [p for p in profiles if p.user_id == user_id]

@router.get("/bias/{user_id}/{sector}", response_model=List[BiasProfile])
def get_user_bias_by_sector(user_id: str, sector: str):
    profiles = autopsy_engine.get_bias_profiles()
    return [p for p in profiles if p.user_id == user_id and p.sector == sector]
