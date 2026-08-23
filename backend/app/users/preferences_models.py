from sqlalchemy import Column, Integer, String, ForeignKey
from app.core.database import Base


class UserFavoriteArtist(Base):
    __tablename__ = "user_favorite_artists"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    artist_name = Column(String, nullable=False)


class UserFavoriteLanguage(Base):
    __tablename__ = "user_favorite_languages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    language_name = Column(String, nullable=False)
