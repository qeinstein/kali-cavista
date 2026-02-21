"""Hydration router — log, score, today, history."""

from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter(prefix="/hydration", tags=["Hydration"])


@router.post("/log")
async def log_hydration(user: User = Depends(get_current_user)):
    """Log water intake."""
    pass


@router.get("/score")
async def get_hydration_score(user: User = Depends(get_current_user)):
    """Get current hydration score."""
    pass


@router.get("/today")
async def get_todays_hydration(user: User = Depends(get_current_user)):
    """Today's water logs & total."""
    pass


@router.get("/history")
async def get_hydration_history(user: User = Depends(get_current_user)):
    """Daily hydration history."""
    pass
