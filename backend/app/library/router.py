from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.core.database import get_db
from app.auth.dependencies import get_current_user
from app.users.models import User
from app.library.models import LikedSong, RecentlyPlayed, Playlist, PlaylistSong

router = APIRouter(prefix="/library", tags=["Library"])


class SongRef(BaseModel):
    youtube_id: str
    title: str
    artist_name: Optional[str] = None
    cover_url: Optional[str] = None


class PlaylistCreate(BaseModel):
    name: str
    description: Optional[str] = None
    cover_url: Optional[str] = None
    is_public: bool = False


# ---------- Liked Songs ----------

@router.post("/likes")
def like_song(song: SongRef, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    existing = db.query(LikedSong).filter(
        LikedSong.user_id == current_user.id, LikedSong.youtube_id == song.youtube_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already liked")

    liked = LikedSong(user_id=current_user.id, **song.model_dump())
    db.add(liked)
    db.commit()
    db.refresh(liked)
    return liked


@router.delete("/likes/{youtube_id}")
def unlike_song(youtube_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    liked = db.query(LikedSong).filter(
        LikedSong.user_id == current_user.id, LikedSong.youtube_id == youtube_id
    ).first()
    if not liked:
        raise HTTPException(status_code=404, detail="Not liked yet")
    db.delete(liked)
    db.commit()
    return {"detail": "Unliked"}


@router.get("/likes")
def get_liked_songs(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(LikedSong).filter(LikedSong.user_id == current_user.id).order_by(LikedSong.liked_at.desc()).all()


# ---------- Recently Played ----------

@router.post("/recently-played")
def add_recently_played(song: SongRef, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    entry = RecentlyPlayed(user_id=current_user.id, **song.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.get("/recently-played")
def get_recently_played(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return (
        db.query(RecentlyPlayed)
        .filter(RecentlyPlayed.user_id == current_user.id)
        .order_by(RecentlyPlayed.played_at.desc())
        .limit(20)
        .all()
    )


# ---------- Playlists ----------

@router.post("/playlists")
def create_playlist(data: PlaylistCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    playlist = Playlist(user_id=current_user.id, **data.model_dump())
    db.add(playlist)
    db.commit()
    db.refresh(playlist)
    return playlist


@router.get("/playlists")
def get_my_playlists(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Playlist).filter(Playlist.user_id == current_user.id).all()


@router.post("/playlists/{playlist_id}/songs")
def add_song_to_playlist(playlist_id: int, song: SongRef, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    playlist = db.query(Playlist).filter(Playlist.id == playlist_id, Playlist.user_id == current_user.id).first()
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")

    entry = PlaylistSong(playlist_id=playlist_id, **song.model_dump())
    db.add(entry)
    db.commit()
    return {"detail": "Song added to playlist"}


@router.get("/playlists/{playlist_id}/songs")
def get_playlist_songs(playlist_id: int, db: Session = Depends(get_db)):
    return db.query(PlaylistSong).filter(PlaylistSong.playlist_id == playlist_id).all()


@router.delete("/playlists/{playlist_id}")
def delete_playlist(playlist_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    playlist = db.query(Playlist).filter(Playlist.id == playlist_id, Playlist.user_id == current_user.id).first()
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")
    db.delete(playlist)
    db.commit()
    return {"detail": "Playlist deleted"}