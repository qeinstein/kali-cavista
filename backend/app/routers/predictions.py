"""Predictions router — current, refresh, feedback, history."""

from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter(prefix="/predictions", tags=["Predictions"])


@router.get("/current")
async def get_current_prediction(user: User = Depends(get_current_user)):
    """Get latest hunger prediction."""
    pass


@router.post("/refresh")
async def refresh_prediction(user: User = Depends(get_current_user)):
    """Force a new prediction."""
    pass


@router.post("/feedback")
async def submit_feedback(user: User = Depends(get_current_user)):
    """Submit hunger rating feedback."""
    pass


@router.get("/history")
async def get_prediction_history(user: User = Depends(get_current_user)):
    """Past predictions & accuracy."""
    pass
