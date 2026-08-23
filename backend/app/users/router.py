from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from collections import Counter

from app.core.database import get_db
from app.auth.dependencies import get_current_user
from app.users.models import User
from app.users.schemas import UserProfileUpdate, UserProfileOut
from app.analytics.models import ListeningSession

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/profile", response_model=UserProfileOut)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/profile", response_model=UserProfileOut)
def update_profile(
    updates: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    update_data = updates.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)

    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/personality")
def get_music_personality(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    sessions = db.query(ListeningSession).filter(ListeningSession.user_id == current_user.id).all()
    total_seconds = sum(s.duration_listened for s in sessions)

    if not sessions:
        return {
            "title": "New Listener",
            "description": "Start listening to discover your music personality!",
            "total_hours": 0,
            "top_artist": None,
            "top_song": None,
        }

    artist_counter = Counter(s.artist_name for s in sessions if s.artist_name)
    song_counter = Counter(s.title for s in sessions)

    top_artist = artist_counter.most_common(1)[0][0] if artist_counter else None
    top_song = song_counter.most_common(1)[0][0] if song_counter else None

    night_sessions = sum(1 for s in sessions if s.started_at.hour >= 21 or s.started_at.hour <= 4)
    is_night_listener = night_sessions > len(sessions) / 2

    title = "The Night Listener" if is_night_listener else "The Daytime Explorer"
    description = f"You mostly listen to your favorite artists{' late at night' if is_night_listener else ' throughout the day'}."

    return {
        "title": title,
        "description": description,
        "total_hours": round(total_seconds / 3600, 1),
        "top_artist": top_artist,
        "top_song": top_song,
    }