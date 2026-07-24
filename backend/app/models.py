from sqlalchemy import Column, Integer, String, DateTime, Float, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    username = Column(String, unique=True, index=True)
    freefire_uid = Column(String, unique=True, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    # Password reset fields
    reset_token = Column(String, nullable=True, unique=True)
    reset_token_expires = Column(DateTime, nullable=True)
    
    tournaments = relationship("Tournament", back_populates="organizer")
    participants = relationship("Participant", back_populates="user")

class Tournament(Base):
    __tablename__ = "tournaments"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    organizer_id = Column(Integer, ForeignKey("users.id"))
    entry_fee = Column(Float)
    prize_pool = Column(Float)
    max_participants = Column(Integer)
    current_participants = Column(Integer, default=0)
    game_mode = Column(String, nullable=True)
    upi_id = Column(String)
    status = Column(String, default="active")
    created_at = Column(DateTime, default=datetime.utcnow)
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    registration_deadline = Column(DateTime, nullable=True)
    
    organizer = relationship("User", back_populates="tournaments")
    participants = relationship("Participant", back_populates="tournament", cascade="all, delete-orphan")
    matches = relationship("Match", back_populates="tournament", cascade="all, delete-orphan")

class Participant(Base):
    __tablename__ = "participants"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    tournament_id = Column(Integer, ForeignKey("tournaments.id"))
    freefire_uid = Column(String)
    payment_proof_url = Column(String, nullable=True)
    payment_verified = Column(Boolean, default=False)
    joined_at = Column(DateTime, default=datetime.utcnow)
    rank = Column(Integer, nullable=True)
    
    user = relationship("User", back_populates="participants")
    tournament = relationship("Tournament", back_populates="participants")

class Match(Base):
    __tablename__ = "matches"
    
    id = Column(Integer, primary_key=True, index=True)
    tournament_id = Column(Integer, ForeignKey("tournaments.id"))
    match_number = Column(Integer)
    game_mode = Column(String, nullable=True)
    room_id = Column(String, nullable=True)
    room_password = Column(String, nullable=True)
    scheduled_time = Column(DateTime, nullable=True)
    status = Column(String, default="pending")
    result = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    tournament = relationship("Tournament", back_populates="matches")

class PlayerScore(Base):
    __tablename__ = "player_scores"
    
    id = Column(Integer, primary_key=True, index=True)
    participant_id = Column(Integer, ForeignKey("participants.id"))
    match_id = Column(Integer, ForeignKey("matches.id"))
    kills = Column(Integer, default=0)
    position = Column(Integer, nullable=True)
    is_booyah = Column(Boolean, default=False)
    score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    participant = relationship("Participant")
    match = relationship("Match")
