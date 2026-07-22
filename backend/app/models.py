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
    created_at =     reset_token = Column(String, nullable=True, unique=True)
    reset_token_expires = Column(DateTime, nullable=True)
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
    upi_id = Column(String)
    status = Column(String, default="active")
    created_at = Column(DateTime, default=datetime.utcnow)
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    
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
    status = Column(String, default="pending")
    result = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    tournament = relationship("Tournament", back_populates="matches")
