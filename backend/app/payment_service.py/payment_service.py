from sqlalchemy.orm import Session
from app.models import Payment, User, Tournament, Wallet, Transaction
from app.config import OWNER_UPI_ID, COMMISSION_PERCENTAGE, BINANCE_CONFIG
from datetime import datetime
import uuid

class PaymentService:
    """Service for handling all payment operations"""
    
    @staticmethod
    def calculate_commission(amount: float) -> tuple:
        """Calculate commission and net amount"""
        commission = (amount * COMMISSION_PERCENTAGE) / 100
        net_amount = amount - commission
        return commission, net_amount
    
    @staticmethod
    def create_upi_payment(
        db: Session,
        user_id: int,
        tournament_id: int,
        amount: float,
        upi_id: str
    ) -> Payment:
        """Create UPI payment record"""
        commission, net_amount = PaymentService.calculate_commission(amount)
        
        payment = Payment(
            user_id=user_id,
            tournament_id=tournament_id,
            amount=amount,
            commission=commission,
            net_amount=net_amount,
            payment_method="upi",
            status="pending",
            transaction_id=str(uuid.uuid4())
        )
        
        db.add(payment)
        db.commit()
        db.refresh(payment)
        
        return payment
    
    @staticmethod
    def create_binance_payment(
        db: Session,
        user_id: int,
        tournament_id: int,
        amount: float,
        transaction_hash: str
    ) -> Payment:
        """Create Binance payment record"""
        commission, net_amount = PaymentService.calculate_commission(amount)
        
        payment = Payment(
            user_id=user_id,
            tournament_id=tournament_id,
            amount=amount,
            commission=commission,
            net_amount=net_amount,
            payment_method="binance",
            status="pending",
            transaction_id=transaction_hash
        )
        
        db.add(payment)
        db.commit()
        db.refresh(payment)
        
        return payment
    
    @staticmethod
    def verify_payment(db: Session, payment_id: int) -> bool:
        """Verify payment and update status"""
        payment = db.query(Payment).filter(Payment.id == payment_id).first()
        
        if not payment:
            return False
        
        payment.status = "completed"
        payment.updated_at = datetime.utcnow()
        
        wallet = db.query(Wallet).filter(Wallet.user_id == payment.user_id).first()
        if wallet:
            wallet.balance += payment.net_amount
            wallet.total_earned += payment.net_amount
            wallet.updated_at = datetime.utcnow()
        
        tournament = db.query(Tournament).filter(Tournament.id == payment.tournament_id).first()
        if tournament:
            tournament.current_participants += 1
            tournament.updated_at = datetime.utcnow()
        
        transaction = Transaction(
            user_id=payment.user_id,
            amount=payment.net_amount,
            type="credit",
            description=f"Tournament entry fee",
            transaction_id=str(uuid.uuid4()),
            status="completed"
        )
        
        db.add(transaction)
        db.commit()
        
        return True
    
    @staticmethod
    def get_payment_qr_code(upi_id: str, amount: float, description: str = "Tournament Entry") -> str:
        """Generate UPI payment string for QR code"""
        upi_string = f"upi://pay?pa={upi_id}&pn={description}&am={amount}&tr={str(uuid.uuid4())}"
        return upi_string
    
    @staticmethod
    def get_binance_payment_info() -> dict:
        """Get Binance payment information for frontend"""
        return {
            "uid": BINANCE_CONFIG["uid"],
            "usdt_tron_address": BINANCE_CONFIG["usdt_tron_address"],
            "usdt_ton_address": BINANCE_CONFIG["usdt_ton_address"],
            "owner_upi": OWNER_UPI_ID
        }
