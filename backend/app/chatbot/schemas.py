from pydantic import BaseModel
from typing import Optional


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[int] = None


class SuggestedSong(BaseModel):
    title: str
    artist: Optional[str] = None
    youtube_id: Optional[str] = None
    cover_url: Optional[str] = None


class ChatResponse(BaseModel):
    session_id: int
    reply: str
    suggested_songs: list[SuggestedSong] = []