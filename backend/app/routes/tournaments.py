from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Tournament, Participant, User
from app import schemas
from app.security import get_current_user
from typing import List
from datetime import datetime
import os

router = APIRouter()

# Create tournament
@router.post("/", response_model=schemas.TournamentResponse)
def create_tournament(
    tournament: schemas.TournamentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new tournament"""
    db_tournament = Tournament(
        title=tournament.title,
        description=tournament.description,
        entry_fee=tournament.entry_fee,
        prize_pool=tournament.prize_pool,
        max_participants=tournament.max_participants,
        upi_id=tournament.upi_id,
        start_date=tournament.start_date,
        end_date=tournament.end_date,
        organizer_id=current_user.id,
        status="active"
    )
    db.add(db_tournament)
    db.commit()
    db.refresh(db_tournament)
    return db_tournament

# List tournaments
@router.get("/", response_model=List[schemas.TournamentResponse])
def list_tournaments(
    skip: int = 0,
    limit: int = 10,
    status_filter: str = None,
    db: Session = Depends(get_db)
):
    """List all tournaments"""
    query = db.query(Tournament)
    if status_filter:
        query = query.filter(Tournament.status == status_filter)
    return query.offset(skip).limit(limit).all()

# Get tournament
@router.get("/{tournament_id}", response_model=schemas.TournamentResponse)
def get_tournament(tournament_id: int, db: Session = Depends(get_db)):
    """Get tournament by ID"""
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    return tournament

# Update tournament
@router.put("/{tournament_id}", response_model=schemas.TournamentResponse)
def update_tournament(
    tournament_id: int,
    tournament_update: schemas.TournamentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update tournament"""
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    if tournament.organizer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only organizer can update")
    
    tournament.title = tournament_update.title
    tournament.description = tournament_update.description
    tournament.entry_fee = tournament_update.entry_fee
    tournament.prize_pool = tournament_update.prize_pool
    tournament.max_participants = tournament_update.max_participants
    tournament.start_date = tournament_update.start_date
    tournament.end_date = tournament_update.end_date
    
    db.commit()
    db.refresh(tournament)
    return tournament

# Delete tournament
@router.delete("/{tournament_id}")
def delete_tournament(
    tournament_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete tournament"""
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    if tournament.organizer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only organizer can delete")
    
    db.delete(tournament)
    db.commit()
    return {"message": "Tournament deleted"}

# Join tournament
@router.post("/{tournament_id}/join")
async def join_tournament(
    tournament_id: int,
    freefire_uid: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Join tournament with payment proof"""
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    participant_count = db.query(Participant).filter(
        Participant.tournament_id == tournament_id,
        Participant.payment_verified == True
    ).count()
    
    if participant_count >= tournament.max_participants:
        raise HTTPException(status_code=400, detail="Tournament is full")
    
    existing = db.query(Participant).filter(
        Participant.tournament_id == tournament_id,
        Participant.freefire_uid == freefire_uid
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Already joined")
    
    os.makedirs("uploads", exist_ok=True)
    filename = f"payment_{tournament_id}_{freefire_uid}_{int(datetime.utcnow().timestamp())}.jpg"
    filepath = os.path.join("uploads", filename)
    
    with open(filepath, "wb") as f:
        content = await file.read()
        f.write(content)
    
    participant = Participant(
        tournament_id=tournament_id,
        freefire_uid=freefire_uid,
        payment_proof_url=f"/uploads/{filename}"
    )
    
    db.add(participant)
    db.commit()
    db.refresh(participant)
    
    return {
        "message": "Join request submitted",
        "participant_id": participant.id,
        "status": "pending_approval"
    }

# Get participants
@router.get("/{tournament_id}/participants", response_model=List[schemas.ParticipantResponse])
def get_participants(tournament_id: int, db: Session = Depends(get_db)):
    """Get verified participants"""
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    return db.query(Participant).filter(
        Participant.tournament_id == tournament_id,
        Participant.payment_verified == True
    ).all()

# Get pending participants
@router.get("/{tournament_id}/pending", response_model=List[schemas.ParticipantResponse])
def get_pending_participants(
    tournament_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get pending participants (organizer only)"""
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    if tournament.organizer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only organizer can view pending")
    
    return db.query(Participant).filter(
        Participant.tournament_id == tournament_id,
        Participant.payment_verified == False
    ).all()

# Approve participant
@router.post("/{tournament_id}/participants/{participant_id}/approve")
def approve_participant(
    tournament_id: int,
    participant_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Approve participant"""
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    if tournament.organizer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only organizer can approve")
    
    participant = db.query(Participant).filter(
        Participant.id == participant_id,
        Participant.tournament_id == tournament_id
    ).first()
    
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")
    
    participant.payment_verified = True
    db.commit()
    return {"message": "Participant approved"}

# Reject participant
@router.post("/{tournament_id}/participants/{participant_id}/reject")
def reject_participant(
    tournament_id: int,
    participant_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Reject participant"""
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    if tournament.organizer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only organizer can reject")
    
    participant = db.query(Participant).filter(
        Participant.id == participant_id,
        Participant.tournament_id == tournament_id
    ).first()
    
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")
    
    if participant.payment_proof_url:
        filepath = participant.payment_proof_url.lstrip("/")
        if os.path.exists(filepath):
            os.remove(filepath)
    
    db.delete(participant)
    db.commit()
    return {"message": "Participant rejected"}
