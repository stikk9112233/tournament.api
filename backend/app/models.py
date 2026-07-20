from sqlalchemy import Column, Integer, String, DateTime, Numeric, Boolean, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=True)
    email = Column(String, nullable=True, unique=True)
    phone = Column(String, nullable=True, unique=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Tournament(Base):
    __tablename__ = 'tournaments'
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    creator_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    mode = Column(String, default='solo')
    entry_fee = Column(Numeric, default=0)
    max_players = Column(Integer, default=100)
    prize_pool = Column(Numeric, default=0)
    room_id = Column(String, nullable=True)
    room_password = Column(String, nullable=True)
    status = Column(String, default='open')
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class TournamentPlayer(Base):
    __tablename__ = 'tournament_players'
    id = Column(Integer, primary_key=True, index=True)
    tournament_id = Column(Integer, ForeignKey('tournaments.id'))
    user_id = Column(Integer, ForeignKey('users.id'))
    joined_at = Column(DateTime, default=datetime.datetime.utcnow)
    payment_status = Column(String, default='pending')
    payment_proof_url = Column(String, nullable=True)
    is_confirmed = Column(Boolean, default=False)
    kills = Column(Integer, default=0)
    placement = Column(Integer, nullable=True)
    payout_amount = Column(Numeric, default=0)

class SupportTicket(Base):
    __tablename__ = 'support_tickets'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    subject = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    attachment_url = Column(String, nullable=True)
    status = Column(String, default='open')  # open / pending / closed
    assigned_admin = Column(String, nullable=True)
    admin_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
