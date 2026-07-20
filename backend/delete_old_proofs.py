#!/usr/bin/env python3
"""
delete_old_proofs.py
Utility script to delete uploaded proof files older than RETENTION_DAYS and clear DB references.
Run as a cron job or manually.
"""
import os
import time
from datetime import datetime, timedelta
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app import models

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
load_dotenv(os.path.join(BASE_DIR, '.env'))

DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///./dev.db')
UPLOADS_DIR = os.getenv('UPLOADS_DIR', 'uploads')
RETENTION_DAYS = int(os.getenv('RETENTION_DAYS', '90'))

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if 'sqlite' in DATABASE_URL else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

now = datetime.utcnow()
cutoff = now - timedelta(days=RETENTION_DAYS)

print(f"Scanning uploads in {UPLOADS_DIR} older than {RETENTION_DAYS} days (cutoff={cutoff.isoformat()})")

if not os.path.exists(UPLOADS_DIR):
    print("Uploads dir not found; nothing to do")
    exit(0)

db = SessionLocal()
players = db.query(models.TournamentPlayer).filter(models.TournamentPlayer.payment_proof_url != None).all()
removed = 0
for p in players:
    fpath = p.payment_proof_url
    if not fpath:
        continue
    try:
        mtime = datetime.utcfromtimestamp(os.path.getmtime(fpath))
    except Exception as e:
        print(f"File missing or error for {fpath}: {e}")
        # clear db reference
        p.payment_proof_url = None
        db.commit()
        continue
    if mtime < cutoff:
        try:
            os.remove(fpath)
            print(f"Removed file: {fpath}")
            p.payment_proof_url = None
            db.commit()
            removed += 1
        except Exception as e:
            print(f"Failed to remove {fpath}: {e}")

print(f"Done. Removed {removed} files.")
db.close()
