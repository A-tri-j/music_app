from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class PlaylistCreate(BaseModel):
    name: str
    description: Optional[str] = None
    cover_url: Optional[str] = None
    is_public: bool = False


class PlaylistOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    cover_url: Optional[str] = None
    is_public: bool
    created_at: datetime

    class Config:
        from_attributes = True


class LikedSongOut(BaseModel):
    id: int
    song_id: int
    liked_at: datetime

    class Config:
        from_attributes = True


class RecentlyPlayedOut(BaseModel):
    id: int
    song_id: int
    played_at: datetime

    class Config:
        from_attributes = True