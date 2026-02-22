"""Health router — sync snapshots and sleep data."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.health import HealthSnapshot, SleepLog
from app.schemas.health import (
    HealthSyncRequest, HealthSyncResponse,
    SleepSyncRequest,
)
from app.schemas.user import SuccessResponse

router = APIRouter(prefix="/health", tags=["Health"])


@router.post("/sync", response_model=HealthSyncResponse)
async def sync_health_data(
    payload: HealthSyncRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Receive a batch of health snapshots from the device."""
    for snap in payload.snapshots:
        entry = HealthSnapshot(
            user_id=user.id,
            snapshot_at=snap.snapshotAt,
            steps_count=snap.stepsCount,
            active_calories=snap.activeCalories,
            heart_rate=snap.heartRate,
        )
        db.add(entry)

    await db.flush()

    return HealthSyncResponse(snapshotsReceived=len(payload.snapshots))


@router.post("/sleep", response_model=SuccessResponse)
async def sync_sleep_data(
    payload: SleepSyncRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Receive last night's sleep data."""
    entry = SleepLog(
        user_id=user.id,
        sleep_start=payload.sleepStart,
        sleep_end=payload.sleepEnd,
        duration_minutes=payload.durationMinutes,
        quality=payload.quality,
    )
    db.add(entry)
    await db.flush()

    return SuccessResponse()
