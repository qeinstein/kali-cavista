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
