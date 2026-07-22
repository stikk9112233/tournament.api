from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# User Schemas
class UserCreate(BaseModel):
    email: str
    username: str
    password: str
    freefire_uid: Optional[str] = None

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    freefire_uid: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

# Tournament Schemas
class TournamentCreate(BaseModel):
    title: str
    description: str
    entry_fee: float
    prize_pool: float
    max_participants: int
    upi_id: str
    start_date: datetime
    end_date: datetime

class TournamentResponse(BaseModel):
    id: int
    title: str
    description: str
    entry_fee: float
    prize_pool: float
    max_participants: int
    upi_id: str
    status: str
    organizer_id: int
    created_at: datetime
    start_date: datetime
    end_date: datetime

    class Config:
        from_attributes = True

# Participant Schemas
class ParticipantResponse(BaseModel):
    id: int
    tournament_id: int
    freefire_uid: str
    payment_verified: bool
    payment_proof_url: Optional[str]
    joined_at: datetime
    rank: Optional[int]

    class Config:
        from_attributes = True
