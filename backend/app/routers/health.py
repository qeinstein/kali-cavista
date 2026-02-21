"""Health router — sync steps/calories, sleep."""

from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter(prefix="/health", tags=["Health Data"])


@router.post("/sync")
async def sync_health_data(user: User = Depends(get_current_user)):
    """Sync step/calorie snapshots."""
    pass


@router.post("/sleep")
async def sync_sleep(user: User = Depends(get_current_user)):
    """Sync last night's sleep."""
    pass
