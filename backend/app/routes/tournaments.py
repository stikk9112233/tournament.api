from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Tournament, Participant, Match, User, PlayerScore
from app.schemas import TournamentCreate, TournamentResponse, MatchCreate, MatchResponse, ScoreEntry
from app.security import get_current_user
from app.prize_service import PrizeService
from datetime import datetime

router = APIRouter(prefix="/api/tournaments", tags=["tournaments"])

@router.post("/", response_model=TournamentResponse)
def create_tournament(tournament: TournamentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Create a new tournament"""
    new_tournament = Tournament(
        title=tournament.title,
        description=tournament.description,
        organizer_id=current_user.id,
        entry_fee=tournament.entry_fee,
        max_participants=tournament.max_participants,
        game_mode=tournament.game_mode,
        prize_pool=tournament.entry_fee * tournament.max_participants * 0.85,
        start_date=tournament.start_date,
        registration_deadline=tournament.registration_deadline
    )
    
    db.add(new_tournament)
    db.commit()
    db.refresh(new_tournament)
    return new_tournament

@router.get("/{tournament_id}", response_model=TournamentResponse)
def get_tournament(tournament_id: int, db: Session = Depends(get_db)):
    """Get tournament details"""
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    return tournament

@router.get("/", response_model=list)
def list_tournaments(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    """List all tournaments"""
    tournaments = db.query(Tournament).offset(skip).limit(limit).all()
    return tournaments

@router.post("/{tournament_id}/matches", response_model=MatchResponse)
def create_match(tournament_id: int, match: MatchCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Create a match for tournament"""
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    if tournament.organizer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    new_match = Match(
        tournament_id=tournament_id,
        match_number=match.match_number,
        game_mode=match.game_mode,
        room_id=match.room_id,
        room_password=match.room_password,
        scheduled_time=match.scheduled_time
    )
    
    db.add(new_match)
    db.commit()
    db.refresh(new_match)
    return new_match

@router.get("/{tournament_id}/matches")
def get_tournament_matches(tournament_id: int, db: Session = Depends(get_db)):
    """Get all matches for a tournament"""
    matches = db.query(Match).filter(Match.tournament_id == tournament_id).all()
    return matches

@router.post("/{tournament_id}/join")
def join_tournament(tournament_id: int, freefire_uid: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Join a tournament"""
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    if tournament.current_participants >= tournament.max_participants:
        raise HTTPException(status_code=400, detail="Tournament is full")
    
    existing = db.query(Participant).filter(
        Participant.tournament_id == tournament_id,
        Participant.user_id == current_user.id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Already registered")
    
    participant = Participant(
        user_id=current_user.id,
        tournament_id=tournament_id,
        freefire_uid=freefire_uid
    )
    
    db.add(participant)
    db.commit()
    db.refresh(participant)
    
    return participant

@router.get("/{tournament_id}/participants")
def get_participants(tournament_id: int, db: Session = Depends(get_db)):
    """Get all participants for a tournament"""
    participants = db.query(Participant).filter(
        Participant.tournament_id == tournament_id
    ).all()
    return participants

@router.post("/{tournament_id}/matches/{match_id}/scores")
def submit_score(tournament_id: int, match_id: int, score_data: ScoreEntry, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Submit player score for a match"""
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    if tournament.organizer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only organizer can submit scores")
    
    score = PrizeService.record_player_score(
        db=db,
        match_id=match_id,
        participant_id=score_data.participant_id,
        kills=score_data.kills,
        position=score_data.position,
        is_booyah=score_data.is_booyah
    )
    
    return score

@router.get("/{tournament_id}/leaderboard")
def get_leaderboard(tournament_id: int, db: Session = Depends(get_db)):
    """Get tournament leaderboard"""
    leaderboard = PrizeService.calculate_tournament_leaderboard(db, tournament_id)
    return leaderboard

@router.post("/{tournament_id}/matches/{match_id}/distribute-prizes")
def distribute_prizes(tournament_id: int, match_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Distribute prizes for a completed match"""
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    if tournament.organizer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    success = PrizeService.distribute_match_prizes(db, match_id)
    
    if not success:
        raise HTTPException(status_code=400, detail="Failed to distribute prizes")
    
    return {"message": "Prizes distributed successfully"}
