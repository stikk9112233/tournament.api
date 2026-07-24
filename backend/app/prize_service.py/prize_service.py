from sqlalchemy.orm import Session
from app.models import PlayerScore, Participant, Match, Tournament, Wallet, Transaction
from app.config import PRIZE_CONFIG
from datetime import datetime
from typing import List
import uuid

class PrizeService:
    """Service for calculating and distributing prizes"""
    
    @staticmethod
    def calculate_prize_for_score(kills: int, position: int, is_booyah: bool, per_kill_prize: float = PRIZE_CONFIG["per_kill_high"]) -> dict:
        booyah_prize = 0.0
        kill_prize = kills * per_kill_prize
        
        if position == 1 and is_booyah:
            booyah_prize = PRIZE_CONFIG["booyah_prize"]
        
        total_prize = booyah_prize + kill_prize
        
        return {
            "booyah_prize": booyah_prize,
            "kill_prize": kill_prize,
            "total_prize": total_prize
        }
    
    @staticmethod
    def record_player_score(db: Session, match_id: int, participant_id: int, kills: int, position: int, is_booyah: bool = False) -> PlayerScore:
        match = db.query(Match).filter(Match.id == match_id).first()
        if not match:
            raise Exception("Match not found")
        
        prize_calc = PrizeService.calculate_prize_for_score(
            kills=kills,
            position=position,
            is_booyah=is_booyah,
            per_kill_prize=match.per_kill_prize
        )
        
        score = PlayerScore(
            match_id=match_id,
            participant_id=participant_id,
            kills=kills,
            position=position,
            is_booyah=is_booyah,
            booyah_prize=prize_calc["booyah_prize"],
            kill_prize=prize_calc["kill_prize"],
            total_prize=prize_calc["total_prize"]
        )
        
        db.add(score)
        db.commit()
        db.refresh(score)
        
        participant = db.query(Participant).filter(Participant.id == participant_id).first()
        if participant:
            participant.total_kills += kills
            if is_booyah:
                participant.total_booyahs += 1
            participant.total_earnings += prize_calc["total_prize"]
            participant.matches_played += 1
            db.commit()
        
        return score
    
    @staticmethod
    def distribute_match_prizes(db: Session, match_id: int) -> bool:
        scores = db.query(PlayerScore).filter(PlayerScore.match_id == match_id).all()
        
        if not scores:
            return False
        
        for score in scores:
            if score.total_prize > 0:
                participant = db.query(Participant).filter(Participant.id == score.participant_id).first()
                
                if participant:
                    wallet = db.query(Wallet).filter(Wallet.user_id == participant.user_id).first()
                    
                    if wallet:
                        wallet.balance += score.total_prize
                        wallet.total_earned += score.total_prize
                        wallet.updated_at = datetime.utcnow()
                    
                    transaction = Transaction(
                        user_id=participant.user_id,
                        amount=score.total_prize,
                        type="credit",
                        description=f"Match Prize - Kills: {score.kills}",
                        transaction_id=str(uuid.uuid4()),
                        status="completed"
                    )
                    
                    db.add(transaction)
        
        db.commit()
        return True
    
    @staticmethod
    def calculate_tournament_leaderboard(db: Session, tournament_id: int) -> List[dict]:
        participants = db.query(Participant).filter(
            Participant.tournament_id == tournament_id
        ).order_by(Participant.total_earnings.desc()).all()
        
        leaderboard = []
        for idx, participant in enumerate(participants, 1):
            leaderboard.append({
                "rank": idx,
                "participant_id": participant.id,
                "user_id": participant.user_id,
                "freefire_uid": participant.freefire_uid,
                "total_kills": participant.total_kills,
                "total_booyahs": participant.total_booyahs,
                "total_earnings": participant.total_earnings,
                "matches_played": participant.matches_played
            })
        
        return leaderboard
