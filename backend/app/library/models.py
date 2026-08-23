from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class LikedSong(Base):
    __tablename__ = "liked_songs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    youtube_id = Column(String, nullable=False)
    title = Column(String, nullable=False)
    artist_name = Column(String, nullable=True)
    cover_url = Column(String, nullable=True)
    liked_at = Column(DateTime(timezone=True), server_default=func.now())


class RecentlyPlayed(Base):
    __tablename__ = "recently_played"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    youtube_id = Column(String, nullable=False)
    title = Column(String, nullable=False)
    artist_name = Column(String, nullable=True)
    cover_url = Column(String, nullable=True)
    played_at = Column(DateTime(timezone=True), server_default=func.now())


class Playlist(Base):
    __tablename__ = "playlists"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    cover_url = Column(String, nullable=True)
    is_public = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    songs = relationship("PlaylistSong", back_populates="playlist", cascade="all, delete-orphan")


class PlaylistSong(Base):
    __tablename__ = "playlist_songs"

    id = Column(Integer, primary_key=True, index=True)
    playlist_id = Column(Integer, ForeignKey("playlists.id"))
    youtube_id = Column(String, nullable=False)
    title = Column(String, nullable=False)
    artist_name = Column(String, nullable=True)
    cover_url = Column(String, nullable=True)
    added_at = Column(DateTime(timezone=True), server_default=func.now())

    playlist = relationship("Playlist", back_populates="songs")