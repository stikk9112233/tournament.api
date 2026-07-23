from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Enum, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime
import enum

class TournamentMode(str, enum.Enum):
    BERMUDA = "bermuda"
    CLASH_SQUAD = "clash_squad"
    LONE_WOLF = "lone_wolf"

class Tournament(Base):
    __tablename__ = "tournaments"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    organizer_id = Column(Integer, ForeignKey("users.id"))
    
    # Tournament Details
    entry_fee = Column(Float)  # ₹30
    max_participants = Column(Integer)  # 50
    status = Column(String, default="active")  # active, completed, cancelled
    
    # Prize Details
    prize_pool_total = Column(Float)  # Auto-calculated
    platform_commission = Column(Float, default=0.10)  # 10%
    
    # Mode Configuration
    modes = Column(JSON)  # {"bermuda": 30, "clash_squad": 30, "lone_wolf": 30}
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    participants = relationship("Participant", back_populates="tournament")
    matches = relationship("Match", back_populates="tournament")
    organizer = relationship("User", back_populates="tournaments")


class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)
    tournament_id = Column(Integer, ForeignKey("tournaments.id"))
    mode = Column(String)  # "bermuda", "clash_squad", "lone_wolf"
    match_number = Column(Integer)  # Match 1, 2, 3
    scheduled_time = Column(DateTime)  # 6:00 AM, 7:00 AM, etc.
    status = Column(String, default="scheduled")  # scheduled, ongoing, completed
    
    # Match Settings
    room_id = Column(String)  # Free Fire room ID
    room_password = Column(String)  # Free Fire room password
    max_players = Column(Integer, default=50)
    
    # Prize Distribution for this match
    booyah_prize = Column(Float)  # ₹300
    per_kill_prize = Column(Float)  # ₹5, ₹7
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    tournament = relationship("Tournament", back_populates="matches")
    scores = relationship("PlayerScore", back_populates="match")


class PlayerScore(Base):
    __tablename__ = "player_scores"

    id = Column(Integer, primary_key=True, index=True)
    match_id = Column(Integer, ForeignKey("matches.id"))
    tournament_id = Column(Integer, ForeignKey("tournaments.id"))
    participant_id = Column(Integer, ForeignKey("participants.id"))
    
    # Score Details
    kills = Column(Integer, default=0)
    position = Column(Integer)  # 1 = Booyah, 2nd, 3rd, etc.
    is_booyah = Column(Boolean, default=False)
    
    # Prize Calculation
    kill_prize = Column(Float, default=0)  # kills × per_kill_prize
    position_prize = Column(Float, default=0)  # Booyah prize or top 10 prize
    total_prize = Column(Float, default=0)  # kill_prize + position_prize
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    match = relationship("Match", back_populates="scores")
    participant = relationship("Participant", back_populates="scores")
    tournament = relationship("Tournament")


class Participant(Base):
    __tablename__ = "participants"

    id = Column(Integer, primary_key=True, index=True)
    tournament_id = Column(Integer, ForeignKey("tournaments.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    freefire_uid = Column(String)
    
    # Payment Status
    payment_verified = Column(Boolean, default=False)
    payment_proof_url = Column(String, nullable=True)
    
    # Player Stats (cumulative)
    total_kills = Column(Integer, default=0)
    total_booyahs = Column(Integer, default=0)
    total_earnings = Column(Float, default=0)
    matches_played = Column(Integer, default=0)
    
    # Timestamps
    joined_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    tournament = relationship("Tournament", back_populates="participants")
    user = relationship("User", back_populates="participated_tournaments")
    scores = relationship("PlayerScore", back_populates="participant")
