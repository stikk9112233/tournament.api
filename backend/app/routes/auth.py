from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import uuid

from app.database import get_db
from app.models import User
from app import schemas
from app.security import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user
)
from app.config import ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(
        (User.email == user.email) | (User.username == user.username)
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already exists"
        )
    
    hashed_password = hash_password(user.password)
    db_user = User(
        email=user.email,
        username=user.username,
        password_hash=hashed_password,
        freefire_uid=user.freefire_uid
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/login")
def login(credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "freefire_uid": user.freefire_uid
        }
    }

@router.get("/me", response_model=schemas.UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/forgot-password")
def forgot_password(payload: dict = Body(...), db: Session = Depends(get_db)):
    """
    Body: { "email": "<user email>" }
    - If user exists: create reset_token (UUID) and expiry (1 hour) and save to DB.
    - In production: send email with reset link. For dev/testing we return reset_token in response.
    """
    email = payload.get('email')
    if not email:
        raise HTTPException(status_code=400, detail="Email required")
    user = db.query(User).filter(User.email == email).first()
    # Avoid account enumeration: always return success message
    if not user:
        return {"detail": "If the email exists, a reset link has been sent"}
    reset_token = str(uuid.uuid4())
    expires_at = datetime.utcnow() + timedelta(minutes=60)  # token valid 60 minutes
    user.reset_token = reset_token
    user.reset_token_expires = expires_at
    db.add(user)
    db.commit()
    # WARNING: In production do NOT return token in response; send an email instead
    return {"detail": "Reset token generated", "reset_token": reset_token}

@router.post("/reset-password")
def reset_password(payload: dict = Body(...), db: Session = Depends(get_db)):
    """
    Body: { "token": "<reset_token>", "new_password": "..." }
    - Verify token exists and not expired.
    - Hash new password and clear token fields.
    """
    token = payload.get('token') or payload.get('reset_token')
    new_password = payload.get('new_password')
    if not token or not new_password:
        raise HTTPException(status_code=400, detail="Token and new_password required")
    user = db.query(User).filter(User.reset_token == token).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid token")
    if not user.reset_token_expires or user.reset_token_expires < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Token expired")
    user.password_hash = hash_password(new_password)
    user.reset_token = None
    user.reset_token_expires = None
    db.add(user)
    db.commit()
    return {"detail": "Password reset successful"}
