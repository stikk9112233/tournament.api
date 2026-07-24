from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Payment, Tournament, Participant
from app.security import get_current_user
from app.payment_service import PaymentService

router = APIRouter(prefix="/api/payments", tags=["payments"])

@router.post("/upi/generate-qr")
def generate_upi_qr(tournament_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    upi_string = PaymentService.get_payment_qr_code(
        upi_id="sunnyapi@ptyes",
        amount=tournament.entry_fee,
        description=f"Tournament: {tournament.title}"
    )
    
    return {"upi_string": upi_string, "amount": tournament.entry_fee, "tournament": tournament.title}

@router.post("/upi/verify/{payment_id}")
def verify_upi_payment(payment_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    if payment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    success = PaymentService.verify_payment(db, payment_id)
    if not success:
        raise HTTPException(status_code=400, detail="Payment verification failed")
    
    return {"message": "Payment verified successfully", "payment_id": payment_id}

@router.get("/binance/info")
def get_binance_info():
    return PaymentService.get_binance_payment_info()

@router.get("/history")
def get_payment_history(skip: int = 0, limit: int = 10, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    payments = db.query(Payment).filter(Payment.user_id == current_user.id).offset(skip).limit(limit).all()
    return payments
