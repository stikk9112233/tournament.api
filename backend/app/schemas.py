from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

# User Schemas
class UserBase(BaseModel):
    email: str
    username: str
    freefire_uid: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Tournament Schemas
class TournamentCreate(BaseModel):
    title: str
    description: str
    entry_fee: float
    max_participants: int
    game_mode: Optional[str] = None
    start_date: datetime
    registration_deadline: Optional[datetime] = None

class TournamentResponse(BaseModel):
    id: int
    title: str
    description: str
    organizer_id: int
    entry_fee: float
    prize_pool: float
    max_participants: int
    current_participants: int
    game_mode: Optional[str]
    status: str
    created_at: datetime
    start_date: datetime
    end_date: Optional[datetime]
    registration_deadline: Optional[datetime]
    
    class Config:
        from_attributes = True

# Participant Schemas
class ParticipantCreate(BaseModel):
    freefire_uid: str

class ParticipantResponse(BaseModel):
    id: int
    user_id: int
    tournament_id: int
    freefire_uid: str
    payment_verified: bool
    joined_at: datetime
    rank: Optional[int]
    
    class Config:
        from_attributes = True

# Match Schemas
class MatchCreate(BaseModel):
    match_number: int
    game_mode: Optional[str] = None
    room_id: Optional[str] = None
    room_password: Optional[str] = None
    scheduled_time: Optional[datetime] = None

class MatchResponse(BaseModel):
    id: int
    tournament_id: int
    match_number: int
    game_mode: Optional[str]
    room_id: Optional[str]
    room_password: Optional[str]
    scheduled_time: Optional[datetime]
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Score Entry Schema
class ScoreEntry(BaseModel):
    participant_id: int
    kills: int
    position: int
    is_booyah: bool = False

class PlayerScoreResponse(BaseModel):
    id: int
    participant_id: int
    match_id: int
    kills: int
    position: int
    is_booyah: bool
    score: float
    created_at: datetime
    
    class Config:
        from_attributes = True

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenData(BaseModel):
    email: Optional[str] = None

# Leaderboard Schema
class LeaderboardEntry(BaseModel):
    participant_id: int
    user_id: int
    username: str
    total_score: float
    matches_played: int
    total_kills: int
    booyahs: int
    
    class Config:
        from_attributes = True

# Payment Schemas
class PaymentCreate(BaseModel):
    tournament_id: int
    amount: float
    upi_id: str

class PaymentResponse(BaseModel):
    id: int
    user_id: int
    tournament_id: int
    amount: float
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Password Reset Schema
class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str
