"""Meals router — log, history, today, delete."""

from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter(prefix="/meals", tags=["Meals"])


@router.post("/log")
async def log_meal(user: User = Depends(get_current_user)):
    """Log a meal + get prediction."""
    pass


@router.get("/history")
async def get_meal_history(user: User = Depends(get_current_user)):
    """Paginated meal history."""
    pass


@router.get("/today")
async def get_todays_meals(user: User = Depends(get_current_user)):
    """Today's meals only."""
    pass


@router.delete("/{meal_id}")
async def delete_meal(meal_id: int, user: User = Depends(get_current_user)):
    """Delete a meal log."""
    pass
