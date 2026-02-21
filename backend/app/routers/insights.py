"""Insights router — list, dismiss, weekly summary."""

from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter(prefix="/insights", tags=["Insights"])


@router.get("")
async def get_insights(user: User = Depends(get_current_user)):
    """Get behavioural insights."""
    pass


@router.post("/{insight_id}/dismiss")
async def dismiss_insight(insight_id: int, user: User = Depends(get_current_user)):
    """Dismiss an insight card."""
    pass


@router.get("/weekly-summary")
async def get_weekly_summary(user: User = Depends(get_current_user)):
    """Weekly narrative summary."""
    pass
