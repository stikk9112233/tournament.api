from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.models.tournament import Tournament, Match, PlayerScore, Participant
from app.schemas import TournamentCreate, MatchCreate, ScoreEntry
from typing import List

router = APIRouter(prefix="/api/tournaments", tags=["tournaments"])

# ============ TOURNAMENT ROUTES ============

@router.post("/create", response_model=dict)
async def create_tournament(tournament_data: TournamentCreate, db: Session = Depends(get_db)):
    """Create a new tournament with matches"""
    try:
        # Create tournament
        new_tournament = Tournament(
            title=tournament_data.title,
            description=tournament_data.description,
            organizer_id=tournament_data.organizer_id,
            entry_fee=tournament_data.entry_fee,
            max_participants=tournament_data.max_participants,
            prize_pool_total=tournament_data.entry_fee * tournament_data.max_participants,
            modes=tournament_data.modes  # {"bermuda": 30, "clash_squad": 30, "lone_wolf": 30}
        )
        
        db.add(new_tournament)
        db.flush()  # Get tournament ID
        
        # Create matches for each mode
        match_number = 1
        for match_time in tournament_data.match_times:  # [6:00, 7:00, 8:00]
            new_match = Match(
                tournament_id=new_tournament.id,
                mode="bermuda",  # या clash_squad, lone_wolf
                match_number=match_number,
                scheduled_time=match_time,
                room_id=tournament_data.room_ids.get(match_number),
                room_password=tournament_data.room_passwords.get(match_number),
                booyah_prize=tournament_data.booyah_prize,
                per_kill_prize=tournament_data.per_kill_prize
            )
            db.add(new_match)
            match_number += 1
        
        db.commit()
        
        return {
            "status": "success",
            "tournament_id": new_tournament.id,
            "message": "Tournament created successfully"
        }
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{tournament_id}/details")
async def get_tournament_details(tournament_id: int, db: Session = Depends(get_db)):
    """Get tournament details with all matches"""
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    matches = db.query(Match).filter(Match.tournament_id == tournament_id).all()
    participants_count = db.query(Participant).filter(Participant.tournament_id == tournament_id).count()
    
    return {
        "tournament_id": tournament.id,
        "title": tournament.title,
        "description": tournament.description,
        "entry_fee": tournament.entry_fee,
        "prize_pool": tournament.prize_pool_total,
        "platform_commission": tournament.platform_commission,
        "max_participants": tournament.max_participants,
        "participants_joined": participants_count,
        "status": tournament.status,
        "modes": tournament.modes,
        "matches": [
            {
                "match_id": m.id,
                "mode": m.mode,
                "match_number": m.match_number,
                "scheduled_time": m.scheduled_time,
                "room_id": m.room_id,
                "status": m.status
            }
            for m in matches
        ]
    }


# ============ PARTICIPANT ROUTES ============

@router.post("/{tournament_id}/join")
async def join_tournament(tournament_id: int, user_id: int, freefire_uid: str, db: Session = Depends(get_db)):
    """Player joins tournament"""
    try:
        # Check if already joined
        existing = db.query(Participant).filter(
            Participant.tournament_id == tournament_id,
            Participant.user_id == user_id
        ).first()
        
        if existing:
            raise HTTPException(status_code=400, detail="Already joined this tournament")
        
        # Check max participants
        participant_count = db.query(Participant).filter(
            Participant.tournament_id == tournament_id
        ).count()
        
        tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
        
        if participant_count >= tournament.max_participants:
            raise HTTPException(status_code=400, detail="Tournament is full")
        
        # Add participant
        participant = Participant(
            tournament_id=tournament_id,
            user_id=user_id,
            freefire_uid=freefire_uid,
            payment_verified=True  # Assume payment verified
        )
        
        db.add(participant)
        db.commit()
        
        return {
            "status": "success",
            "message": "Joined tournament successfully",
            "participant_id": participant.id
        }
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{tournament_id}/participants")
async def get_participants(tournament_id: int, db: Session = Depends(get_db)):
    """Get all participants in tournament"""
    participants = db.query(Participant).filter(
        Participant.tournament_id == tournament_id
    ).all()
    
    return [
        {
            "participant_id": p.id,
            "user_id": p.user_id,
            "freefire_uid": p.freefire_uid,
            "joined_at": p.joined_at
        }
        for p in participants
    ]


# ============ SCORE ENTRY ROUTES ============

@router.post("/{match_id}/enter-score")
async def enter_match_scores(match_id: int, scores: List[ScoreEntry], db: Session = Depends(get_db)):
    """Organizer enters scores for a match"""
    try:
        match = db.query(Match).filter(Match.id == match_id).first()
        
        if not match:
            raise HTTPException(status_code=404, detail="Match not found")
        
        # Process each player's score
        for score_data in scores:
            participant = db.query(Participant).filter(
                Participant.id == score_data.participant_id
            ).first()
            
            if not participant:
                continue
            
            # Calculate prize
            kill_prize = score_data.kills * match.per_kill_prize
            position_prize = match.booyah_prize if score_data.is_booyah else 0
            total_prize = kill_prize + position_prize
            
            # Store score
            player_score = PlayerScore(
                match_id=match_id,
                tournament_id=match.tournament_id,
                participant_id=score_data.participant_id,
                kills=score_data.kills,
                position=score_data.position,
                is_booyah=score_data.is_booyah,
                kill_prize=kill_prize,
                position_prize=position_prize,
                total_prize=total_prize
            )
            
            db.add(player_score)
            
            # Update participant stats
            participant.total_kills += score_data.kills
            if score_data.is_booyah:
                participant.total_booyahs += 1
            participant.total_earnings += total_prize
            participant.matches_played += 1
        
        match.status = "completed"
        db.commit()
        
        return {
            "status": "success",
            "message": "Scores entered successfully"
        }
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# ============ LEADERBOARD ROUTES ============

@router.get("/{tournament_id}/leaderboard/{user_id}")
async def get_player_leaderboard(tournament_id: int, user_id: int, db: Session = Depends(get_db)):
    """Get player's personal leaderboard for a tournament"""
    participant = db.query(Participant).filter(
        Participant.tournament_id == tournament_id,
        Participant.user_id == user_id
    ).first()
    
    if not participant:
        raise HTTPException(status_code=404, detail="Not a participant in this tournament")
    
    return {
        "user_id": user_id,
        "tournament_id": tournament_id,
        "total_kills": participant.total_kills,
        "total_booyahs": participant.total_booyahs,
        "total_earnings": participant.total_earnings,
        "matches_played": participant.matches_played,
        "joined_at": participant.joined_at
    }


@router.get("/{user_id}/playing-history")
async def get_playing_history(user_id: int, db: Session = Depends(get_db)):
    """Get player's tournament history"""
    # Get all tournaments player participated in
    participants = db.query(Participant).filter(
        Participant.user_id == user_id
    ).all()
    
    history = []
    
    for participant in participants:
        tournament = db.query(Tournament).filter(
            Tournament.id == participant.tournament_id
        ).first()
        
        # Get player's scores in this tournament
        scores = db.query(PlayerScore).filter(
            PlayerScore.participant_id == participant.id
        ).all()
        
        history.append({
            "tournament_id": tournament.id,
            "tournament_name": tournament.title,
            "entry_fee": tournament.entry_fee,
            "total_kills": participant.total_kills,
            "total_booyahs": participant.total_booyahs,
            "total_earnings": participant.total_earnings,
            "matches_played": participant.matches_played,
            "joined_at": participant.joined_at,
            "matches": [
                {
                    "match_id": s.match_id,
                    "kills": s.kills,
                    "position": s.position,
                    "is_booyah": s.is_booyah,
                    "prize_earned": s.total_prize
                }
                for s in scores
            ]
        })
    
    return history
