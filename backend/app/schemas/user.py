from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    email: str
    password: str
    name: str

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class UserLogin(BaseModel):
    email: str
    password: str


class TokenRefresh(BaseModel):
    token: str


class UserResponse(BaseModel):
    id: str
    name: Optional[str]
    email: str

    model_config = {"from_attributes": True}


class AuthResponse(BaseModel):
    """Response for register and login — token + nested user."""
    token: str
    user: UserResponse


class TokenResponse(BaseModel):
    token: str


class SuccessResponse(BaseModel):
    success: bool = True


class BaselineResponse(BaseModel):
    mealsPerDay: int
    activityLevel: str
    waterTargetMl: int
    timezone: str

    model_config = {"from_attributes": True}


class BaselineUpdate(BaseModel):
    mealsPerDay: Optional[int] = None
    activityLevel: Optional[str] = None
    waterTargetMl: Optional[int] = None


class ProfileResponse(BaseModel):
    id: str
    name: Optional[str]
    email: str
    baseline: BaselineResponse

    model_config = {"from_attributes": True}


class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    baseline: Optional[BaselineUpdate] = None


class ProfileUpdateResponse(BaseModel):
    success: bool = True
    user: ProfileResponse


class DeviceTokenRequest(BaseModel):
    fcmToken: str
    platform: str  # "android" | "ios"


class LocationUpdate(BaseModel):
    lat: float
    lon: float
