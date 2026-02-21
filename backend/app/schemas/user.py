from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# ── Request Schemas ──────────────────────────────────────────────
class UserCreate(BaseModel):
    email: str
    password: str
    full_name: Optional[str] = None
    timezone: str = "UTC"


class UserLogin(BaseModel):
    email: str
    password: str


# ── Response Schemas ─────────────────────────────────────────────
class UserResponse(BaseModel):
    id: int
    email: str
    full_name: Optional[str]
    timezone: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
