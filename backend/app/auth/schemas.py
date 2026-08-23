from pydantic import BaseModel
from typing import Optional


class UserRegister(BaseModel):
    name: str
    username: str
    email: Optional[str] = None
    phone: Optional[str] = None
    password: str
    age: Optional[int] = None
    favorite_genre: Optional[str] = None
    favorite_languages: Optional[list[str]] = []
    favorite_artists: Optional[list[str]] = []


class UserLogin(BaseModel):
    login: Optional[str] = None
    username: Optional[str] = None
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: int
    name: str
    username: str
    email: Optional[str] = None
    phone: Optional[str] = None
    age: Optional[int] = None
    favorite_genre: Optional[str] = None

    class Config:
        from_attributes = True