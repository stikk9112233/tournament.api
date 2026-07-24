from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Wallet, Payment, Tournament, Participant
from app.schemas import PaymentResponse, UPIPaymentRequest, BinancePaymentRequest
from app.security import get_current_user
from app.payment_service import PaymentService
from datetime import datetime

router = APIRouter(prefix="/api/payments", tags=["payments"])

@router.post("/upi/generate-qr")
def generate_upi_qr(
    tournament_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate UPI QR code for tournament entry"""
    
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    upi_string = PaymentService.get_payment_qr_code(
        upi_id="sunnyapi@ptyes",
        amount=tournament.entry_fee,
        description=f"Tournament: {tournament.title}"
    )
    
    return {
        "upi_string": upi_string,
        "amount": tournament.entry_fee,
        "tournament": tournament.title
    }

@router.post("/upi/initiate", response_model=PaymentResponse)
def initiate_upi_payment(
    payment_req: UPIPaymentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Initiate UPI payment for tournament entry"""
    
    tournament = db.query(Tournament).filter(Tournament.id == payment_req.tournament_id).first()
    
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    existing = db.query(Participant).filter(
        Participant.tournament_id == payment_req.tournament_id,
        Participant.user_id == current_user.id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Already registered for this tournament")
    
    payment = PaymentService.create_upi_payment(
        db=db,
        user_id=current_user.id,
        tournament_id=payment_req.tournament_id,
        amount=tournament.entry_fee,
        upi_id=payment_req.upi_id
    )
    
    return payment

@router.post("/upi/verify/{payment_id}")
def verify_upi_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Verify UPI payment"""
    
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
    """Get Binance payment information"""
    return PaymentService.get_binance_payment_info()

@router.post("/binance/initiate", response_model=PaymentResponse)
def initiate_binance_payment(
    payment_req: BinancePaymentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Initiate Binance payment for tournament entry"""
    
    tournament = db.query(Tournament).filter(Tournament.id == payment_req.tournament_id).first()
    
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    existing = db.query(Participant).filter(
        Participant.tournament_id == payment_req.tournament_id,
        Participant.user_id == current_user.id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Already registered")
    
    payment = PaymentService.create_binance_payment(
        db=db,
        user_id=current_user.id,
        tournament_id=payment_req.tournament_id,
        amount=payment_req.amount,
        transaction_hash=payment_req.transaction_hash
    )
    
    return payment

@router.post("/binance/verify/{payment_id}")
def verify_binance_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Verify Binance transaction payment"""
    
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    if payment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    success = PaymentService.verify_payment(db, payment_id)
    
    if not success:
        raise HTTPException(status_code=400, detail="Payment verification failed")
    
    return {"message": "Binance payment verified", "payment_id": payment_id}

@router.get("/history")
def get_payment_history(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user's payment history"""
    
    payments = db.query(Payment).filter(
        Payment.user_id == current_user.id
    ).offset(skip).limit(limit).all()
    
    return payments
