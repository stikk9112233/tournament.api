from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Participant, Match, PlayerScore, Tournament, User

router = APIRouter(prefix="/api/leaderboard", tags=["leaderboard"])

@router.get("/tournament/{tournament_id}")
def get_tournament_leaderboard(tournament_id: int, db: Session = Depends(get_db)):
    """Get leaderboard for a tournament"""
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    participants = db.query(Participant).filter(
        Participant.tournament_id == tournament_id
    ).order_by(Participant.total_earnings.desc()).all()
    
    leaderboard = []
    for rank, participant in enumerate(participants, 1):
        user = db.query(User).filter(User.id == participant.user_id).first()
        
        leaderboard.append({
            "rank": rank,
            "user_id": participant.user_id,
            "username": user.username if user else "Unknown",
            "freefire_uid": participant.freefire_uid,
            "total_kills": participant.total_kills,
            "total_booyahs": participant.total_booyahs,
            "total_earnings": participant.total_earnings,
            "matches_played": participant.matches_played
        })
    
    return {"tournament_id": tournament_id, "tournament_name": tournament.title, "leaderboard": leaderboard}

@router.get("/match/{match_id}")
def get_match_leaderboard(match_id: int, db: Session = Depends(get_db)):
    """Get leaderboard for a specific match"""
    match = db.query(Match).filter(Match.id == match_id).first()
    
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    scores = db.query(PlayerScore).filter(PlayerScore.match_id == match_id).order_by(PlayerScore.position).all()
    
    leaderboard = []
    for score in scores:
        participant = db.query(Participant).filter(Participant.id == score.participant_id).first()
        user = db.query(User).filter(User.id == participant.user_id).first()
        
        leaderboard.append({
            "position": score.position,
            "user_id": participant.user_id,
            "username": user.username if user else "Unknown",
            "freefire_uid": participant.freefire_uid,
            "kills": score.kills,
            "is_booyah": score.is_booyah,
            "booyah_prize": score.booyah_prize,
            "kill_prize": score.kill_prize,
            "total_prize": score.total_prize
        })
    
    return {"match_id": match_id, "leaderboard": leaderboard}

@router.get("/user/{user_id}")
def get_user_stats(user_id: int, db: Session = Depends(get_db)):
    """Get user's statistics"""
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    participants = db.query(Participant).filter(Participant.user_id == user_id).all()
    
    total_kills = sum(p.total_kills for p in participants)
    total_booyahs = sum(p.total_booyahs for p in participants)
    total_earnings = sum(p.total_earnings for p in participants)
    total_tournaments = len(participants)
    
    return {
        "user_id": user_id,
        "username": user.username,
        "total_tournaments": total_tournaments,
        "total_kills": total_kills,
        "total_booyahs": total_booyahs,
        "total_earnings": total_earnings
    }
