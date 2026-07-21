from pydantic import BaseModel
from datetime import datetime
from typing import Optional

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

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: Optional[dict] = None

class TournamentBase(BaseModel):
    title: str
    description: str
    entry_fee: float
    prize_pool: float
    max_participants: int
    upi_id: str
    start_date: datetime
    end_date: datetime

class TournamentCreate(TournamentBase):
    pass

class TournamentResponse(TournamentBase):
    id: int
    organizer_id: int
    status: str
    created_at: datetime
    class Config:
        from_attributes = True

class ParticipantResponse(BaseModel):
    id: int
    freefire_uid: str
    payment_verified: bool
    joined_at: datetime
    rank: Optional[int] = None
    class Config:
        from_attributes = True
