import os
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from . import models, schemas
from dotenv import load_dotenv
import datetime

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '..', '.env'))

DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///./dev.db')
UPLOADS_DIR = os.getenv('UPLOADS_DIR', 'uploads')
ADMIN_EMAILS = os.getenv('ADMIN_EMAILS', '')

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if 'sqlite' in DATABASE_URL else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
models.Base.metadata.create_all(bind=engine)

router = APIRouter()


def is_admin(email: str) -> bool:
    if not email:
        return False
    admins = [e.strip().lower() for e in ADMIN_EMAILS.split(',') if e.strip()]
    return email.strip().lower() in admins

# Simple public endpoints
@router.get('/tournaments')
def list_tournaments():
    db = SessionLocal()
    ts = db.query(models.Tournament).all()
    out = []
    for t in ts:
        out.append({
            'id': t.id,
            'title': t.title,
            'mode': t.mode,
            'entry_fee': float(t.entry_fee or 0),
            'max_players': t.max_players,
            'prize_pool': float(t.prize_pool or 0),
            'status': t.status
        })
    db.close()
    return out

@router.post('/tournaments')
def create_tournament(t: schemas.TournamentCreate):
    db = SessionLocal()
    t1 = models.Tournament(title=t.title, mode=t.mode, entry_fee=t.entry_fee, max_players=t.max_players, prize_pool=t.entry_fee * t.max_players)
    db.add(t1)
    db.commit()
    db.refresh(t1)
    db.close()
    return {'id': t1.id, 'message': 'Tournament created'}

# Join with manual UPI payment proof upload
@router.post('/tournaments/{tid}/join')
async def join_tournament(tid: int, user_id: int = Form(...), file: UploadFile = File(...)):
    # Save file to uploads and create pending entry
    os.makedirs(UPLOADS_DIR, exist_ok=True)
    safe_filename = f"proof_t{tid}_u{user_id}_{int(datetime.datetime.utcnow().timestamp())}_{file.filename}"
    # sanitize filename basic
    safe_filename = safe_filename.replace('..', '')
    filepath = os.path.join(UPLOADS_DIR, safe_filename)
    with open(filepath, 'wb') as f:
        content = await file.read()
        f.write(content)
    db = SessionLocal()
    # basic checks
    tour = db.query(models.Tournament).filter(models.Tournament.id==tid).first()
    if not tour:
        db.close()
        raise HTTPException(status_code=404, detail='Tournament not found')
    player = models.TournamentPlayer(tournament_id=tid, user_id=user_id, payment_status='pending', payment_proof_url=filepath)
    db.add(player)
    db.commit()
    db.refresh(player)
    db.close()
    return {'message': 'Payment proof uploaded, pending admin approval', 'player_id': player.id}

# Admin: list pending payments (admin only)
@router.get('/admin/payments/pending')
def list_pending(admin_email: str = ''):
    if not is_admin(admin_email):
        raise HTTPException(status_code=403, detail='Not an admin')
    db = SessionLocal()
    rows = db.query(models.TournamentPlayer).filter(models.TournamentPlayer.payment_status=='pending').all()
    out = []
    for r in rows:
        out.append({'id': r.id, 'tournament_id': r.tournament_id, 'user_id': r.user_id, 'proof_url': r.payment_proof_url})
    db.close()
    return out

# Admin: get payment detail (admin only)
@router.get('/admin/payments/{player_id}')
def get_payment_detail(player_id: int, admin_email: str = ''):
    if not is_admin(admin_email):
        raise HTTPException(status_code=403, detail='Not an admin')
    db = SessionLocal()
    p = db.query(models.TournamentPlayer).filter(models.TournamentPlayer.id==player_id).first()
    if not p:
        db.close()
        raise HTTPException(status_code=404, detail='Player not found')
    out = {
        'id': p.id,
        'tournament_id': p.tournament_id,
        'user_id': p.user_id,
        'joined_at': p.joined_at.isoformat(),
        'payment_status': p.payment_status,
        'payment_proof_url': p.payment_proof_url,
        'is_confirmed': p.is_confirmed,
        'kills': p.kills,
        'placement': p.placement,
        'payout_amount': float(p.payout_amount or 0)
    }
    db.close()
    return out

# Admin: approve payment
@router.post('/admin/payments/{player_id}/approve')
def approve_payment(player_id: int, req: schemas.ApproveRequest):
    if not is_admin(req.admin_email):
        raise HTTPException(status_code=403, detail='Not an admin')
    db = SessionLocal()
    p = db.query(models.TournamentPlayer).filter(models.TournamentPlayer.id==player_id).first()
    if not p:
        db.close()
        raise HTTPException(status_code=404, detail='Player not found')
    p.payment_status = 'approved'
    p.is_confirmed = True
    db.commit()
    db.close()
    return {'message': 'Approved'}
