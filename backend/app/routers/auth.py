from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.errors import DuplicateError, UnauthorizedError
from app.core.security import (
    hash_password, verify_password, create_access_token,
    decode_token, get_current_user, oauth2_scheme,
)
from app.models.user import User, BlacklistedToken
from app.schemas.user import (
    UserCreate, UserLogin, TokenRefresh,
    UserResponse, AuthResponse, TokenResponse, SuccessResponse,
)

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: UserCreate, db: AsyncSession = Depends(get_db)):
    """Creates a new user account. Returns a JWT token and user profile."""
    result = await db.execute(select(User).where(User.email == payload.email))
    if result.scalar_one_or_none():
        raise DuplicateError("Email already registered")

    user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        name=payload.name,
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)

    token = create_access_token(data={"sub": str(user.id)})
    return AuthResponse(
        token=token,
        user=UserResponse(id=str(user.id), name=user.name, email=user.email),
    )


@router.post("/login", response_model=AuthResponse)
async def login(payload: UserLogin, db: AsyncSession = Depends(get_db)):
    """Authenticates an existing user. Returns a fresh JWT token."""
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise UnauthorizedError("Invalid email or password")

    token = create_access_token(data={"sub": str(user.id)})
    return AuthResponse(
        token=token,
        user=UserResponse(id=str(user.id), name=user.name, email=user.email),
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(payload: TokenRefresh, db: AsyncSession = Depends(get_db)):
    """Issues a new token before the current one expires."""
    old_payload = decode_token(payload.token)
    user_id = old_payload.get("sub")
    jti = old_payload.get("jti")

    if not user_id:
        raise UnauthorizedError("Invalid token")

    # Blacklist the old token
    if jti:
        db.add(BlacklistedToken(jti=jti))

    # Issue a fresh one
    new_token = create_access_token(data={"sub": user_id})
    return TokenResponse(token=new_token)


@router.post("/logout", response_model=SuccessResponse)
async def logout(
    token: str = Depends(oauth2_scheme),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Invalidates the current token server-side."""
    payload = decode_token(token)
    jti = payload.get("jti")

    if jti:
        db.add(BlacklistedToken(jti=jti))

    return SuccessResponse(success=True)
