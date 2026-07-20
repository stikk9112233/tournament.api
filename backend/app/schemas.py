from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class TournamentCreate(BaseModel):
    title: str
    mode: Optional[str] = 'solo'
    entry_fee: Optional[float] = 0
    max_players: Optional[int] = 100

class TournamentOut(BaseModel):
    id: int
    title: str
    mode: str
    entry_fee: float
    max_players: int
    prize_pool: float
    status: str

    class Config:
        orm_mode = True

class JoinRequest(BaseModel):
    user_id: int
    note: Optional[str] = None

class ApproveRequest(BaseModel):
    admin_email: str

