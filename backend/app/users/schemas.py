from pydantic import BaseModel
from typing import Optional


class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    favorite_language: Optional[str] = None
    favorite_genre: Optional[str] = None
    favorite_artists: Optional[str] = None


class UserProfileOut(BaseModel):
    id: int
    name: str
    username: str
    email: Optional[str] = None
    phone: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    favorite_language: Optional[str] = None
    favorite_genre: Optional[str] = None
    favorite_artists: Optional[str] = None

    class Config:
        from_attributes = True