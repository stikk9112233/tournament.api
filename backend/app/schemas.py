from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Dict

# ============ USER SCHEMAS ============
class UserCreate(BaseModel):
    email: str
    username: str
    password: str
    freefire_uid: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    freefire_uid: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

# ============ PASSWORD RESET SCHEMAS ============
class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

# ============ TOURNAMENT SCHEMAS ============
class TournamentCreate(BaseModel):
    title: str
    description: str
    organizer_id: int
    entry_fee: float  # ₹30
    max_participants: int  # 50
    modes: Dict[str, int]  # {"bermuda": 30, "clash_squad": 30, "lone_wolf": 30}
    booyah_prize: float  # ₹300
    per_kill_prize: float  # ₹5, ₹7
    match_times: List[datetime]  # [6:00 AM, 7:00 AM, 8:00 AM]
    room_ids: Dict[int, str]  # {1: "room_id_1", 2: "room_id_2"}
    room_passwords: Dict[int, str]  # {1: "pass_1", 2: "pass_2"}

class TournamentResponse(BaseModel):
    id: int
    title: str
    description: str
    entry_fee: float
    max_participants: int
    prize_pool_total: float
    status: str
    modes: Dict[str, int]
    created_at: datetime

    class Config:
        from_attributes = True

class MatchResponse(BaseModel):
    id: int
    tournament_id: int
    mode: str
    match_number: int
    scheduled_time: datetime
    room_id: str
    room_password: str
    status: str
    booyah_prize: float
    per_kill_prize: float

    class Config:
        from_attributes = True

# ============ PARTICIPANT SCHEMAS ============
class ParticipantJoin(BaseModel):
    tournament_id: int
    user_id: int
    freefire_uid: str

class ParticipantResponse(BaseModel):
    id: int
    tournament_id: int
    user_id: int
    freefire_uid: str
    total_kills: int
    total_booyahs: int
    total_earnings: float
    matches_played: int
    joined_at: datetime
    payment_verified: bool
    payment_proof_url: Optional[str]

    class Config:
        from_attributes = True

# ============ SCORE SCHEMAS ============
class ScoreEntry(BaseModel):
    participant_id: int
    kills: int
    position: int  # 1, 2, 3, etc.
    is_booyah: bool

class PlayerScoreResponse(BaseModel):
    id: int
    match_id: int
    participant_id: int
    kills: int
    position: int
    is_booyah: bool
    kill_prize: float
    position_prize: float
    total_prize: float
    created_at: datetime

    class Config:
        from_attributes = True

# ============ LEADERBOARD SCHEMAS ============
class PlayerLeaderboard(BaseModel):
    user_id: int
    tournament_id: int
    total_kills: int
    total_booyahs: int
    total_earnings: float
    matches_played: int
    joined_at: datetime

class MatchHistoryItem(BaseModel):
    match_id: int
    kills: int
    position: int
    is_booyah: bool
    prize_earned: float

class TournamentHistoryItem(BaseModel):
    tournament_id: int
    tournament_name: str
    entry_fee: float
    total_kills: int
    total_booyahs: int
    total_earnings: float
    matches_played: int
    joined_at: datetime
    matches: List[MatchHistoryItem]

class PlayingHistory(BaseModel):
    user_id: int
    total_tournaments: int
    total_earnings: float
    history: List[TournamentHistoryItem]
