from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class SessionStart(BaseModel):
    youtube_id: str
    title: str
    artist_name: Optional[str] = None


class SessionEnd(BaseModel):
    duration_listened: float


class SessionOut(BaseModel):
    id: int
    user_id: int
    youtube_id: str
    title: str
    artist_name: Optional[str] = None
    started_at: datetime
    ended_at: Optional[datetime] = None
    duration_listened: float

    class Config:
        from_attributes = True


class DailyStats(BaseModel):
    total_seconds: float
    songs_played: int
    unique_artists: int
    unique_genres: int


class WeeklyStatsDay(BaseModel):
    date: str
    total_seconds: float