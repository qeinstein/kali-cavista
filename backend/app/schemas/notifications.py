from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime


class NotificationSettingsResponse(BaseModel):
    hungerAlerts: bool
    hungerAlertMinutesBefore: int
    hydrationAlerts: bool
    hydrationThreshold: int
    patternNudges: bool
    quietHoursStart: str
    quietHoursEnd: str


class NotificationSettingsUpdate(BaseModel):
    hungerAlerts: Optional[bool] = None
    hungerAlertMinutesBefore: Optional[int] = None
    hydrationAlerts: Optional[bool] = None
    hydrationThreshold: Optional[int] = None
    patternNudges: Optional[bool] = None
    quietHoursStart: Optional[str] = None
    quietHoursEnd: Optional[str] = None


class NotificationSettingsUpdateResponse(BaseModel):
    success: bool = True
    settings: NotificationSettingsResponse


class NotificationInteractionCreate(BaseModel):
    notificationId: str
    action: str
    receivedAt: datetime
    actedAt: Optional[datetime] = None

    @field_validator("action")
    @classmethod
    def validate_action(cls, v):
        if v not in ("opened", "dismissed", "ignored"):
            raise ValueError("action must be one of: opened, dismissed, ignored")
        return v
