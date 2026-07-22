from fastapi import APIRouter, Body, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import uuid

from app.database import get_db
from app.models import User
from app.security import hash_password

router = APIRouter()

@router.post("/forgot-password")
def forgot_password(payload: dict = Body(...), db: Session = Depends(get_db)):
    """
    Body: { "email": "<user email>" }
    - If user exists: create reset_token (UUID) and expiry (1 hour) and save to DB.
    - In production: send email with reset link. For dev/testing we return reset_token in response.
    """
    email = payload.get("email")
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
    # NOTE: For testing we return token. Remove this in production; send email instead.
    return {"detail": "Reset token generated", "reset_token": reset_token}


@router.post("/reset-password")
def reset_password(payload: dict = Body(...), db: Session = Depends(get_db)):
    """
    Body: { "token": "<reset_token>", "new_password": "..." }
    - Verify token exists and not expired.
    - Hash new password and clear token fields.
    """
    token = payload.get("token") or payload.get("reset_token")
    new_password = payload.get("new_password")
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
