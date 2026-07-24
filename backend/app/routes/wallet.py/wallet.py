from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Wallet, Transaction, Withdrawal
from app.security import get_current_user
from datetime import datetime
import uuid

router = APIRouter(prefix="/api/wallet", tags=["wallet"])

@router.get("/")
def get_wallet(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get user wallet details"""
    wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
    
    if not wallet:
        wallet = Wallet(user_id=current_user.id)
        db.add(wallet)
        db.commit()
        db.refresh(wallet)
    
    return wallet

@router.get("/balance")
def get_wallet_balance(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get wallet balance"""
    wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
    
    if not wallet:
        wallet = Wallet(user_id=current_user.id)
        db.add(wallet)
        db.commit()
        db.refresh(wallet)
    
    return {
        "balance": wallet.balance,
        "total_earned": wallet.total_earned,
        "total_withdrawn": wallet.total_withdrawn
    }

@router.get("/transactions")
def get_transactions(skip: int = 0, limit: int = 20, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get user's transaction history"""
    transactions = db.query(Transaction).filter(Transaction.user_id == current_user.id).order_by(Transaction.created_at.desc()).offset(skip).limit(limit).all()
    return transactions

@router.post("/withdraw")
def request_withdrawal(amount: float, upi_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Request withdrawal"""
    wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
    
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    
    if wallet.balance < amount:
        raise HTTPException(status_code=400, detail="Insufficient balance")
    
    if amount < 100:
        raise HTTPException(status_code=400, detail="Minimum withdrawal is ₹100")
    
    withdrawal = Withdrawal(
        user_id=current_user.id,
        amount=amount,
        upi_id=upi_id,
        status="pending"
    )
    
    db.add(withdrawal)
    db.commit()
    db.refresh(withdrawal)
    
    return withdrawal

@router.get("/withdrawals")
def get_withdrawals(skip: int = 0, limit: int = 10, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get user's withdrawal history"""
    withdrawals = db.query(Withdrawal).filter(Withdrawal.user_id == current_user.id).order_by(Withdrawal.requested_at.desc()).offset(skip).limit(limit).all()
    return withdrawals
