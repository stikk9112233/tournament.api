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

@router.post("/", response_model=schemas.TournamentResponse)
def create_tournament(
    tournament: schemas.TournamentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_tournament = Tournament(
        title=tournament.title,
        description=tournament.description,
        entry_fee=tournament.entry_fee,
        prize_pool=tournament.prize_pool,
        max_participants=tournament.max_participants,
        upi_id=tournament.upi_id,
        start_date=tournament.start_date,
        end_date=tournament.end_date,
        organizer_id=current_user.id
    )
    db.add(db_tournament)
    db.commit()
    db.refresh(db_tournament)
    return db_tournament

@router.get("/", response_model=List[schemas.TournamentResponse])
def list_tournaments(
    skip: int = 0,
    limit: int = 10,
    status_filter: str = "active",
    db: Session = Depends(get_db)
):
    tournaments = db.query(Tournament).filter(
        Tournament.status == status_filter
    ).offset(skip).limit(limit).all()
    return tournaments

@router.get("/{tournament_id}", response_model=schemas.TournamentResponse)
def get_tournament(tournament_id: int, db: Session = Depends(get_db)):
    tournament = db.query(Tournament).filter(
        Tournament.id == tournament_id
    ).first()
    
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    return tournament

@router.post("/{tournament_id}/join")
async def join_tournament(
    tournament_id: int,
    user_id: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    tournament = db.query(Tournament).filter(
        Tournament.id == tournament_id
    ).first()
    
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    existing = db.query(Participant).filter(
        Participant.tournament_id == tournament_id,
        Participant.freefire_uid == user_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Already joined")
    
    os.makedirs("uploads", exist_ok=True)
    filename = f"payment_{tournament_id}_{user_id}_{int(datetime.utcnow().timestamp())}.jpg"
    filepath = os.path.join("uploads", filename)
    
    with open(filepath, "wb") as f:
        content = await file.read()
        f.write(content)
    
    participant = Participant(
        tournament_id=tournament_id,
        freefire_uid=user_id,
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

@router.get("/{tournament_id}/participants", response_model=List[schemas.ParticipantResponse])
def get_participants(tournament_id: int, db: Session = Depends(get_db)):
    tournament = db.query(Tournament).filter(
        Tournament.id == tournament_id
    ).first()
    
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    participants = db.query(Participant).filter(
        Participant.tournament_id == tournament_id,
        Participant.payment_verified == True
    ).all()
    
    return participants

@router.post("/{tournament_id}/participants/{participant_id}/approve")
def approve_participant(
    tournament_id: int,
    participant_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tournament = db.query(Tournament).filter(
        Tournament.id == tournament_id
    ).first()
    
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    if tournament.organizer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only organizer can approve"
        )
    
    participant = db.query(Participant).filter(
        Participant.id == participant_id,
        Participant.tournament_id == tournament_id
    ).first()
    
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")
    
    participant.payment_verified = True
    db.commit()
    
    return {"message": "Participant approved"}
