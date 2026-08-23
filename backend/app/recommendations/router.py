from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.auth.dependencies import get_current_user
from app.users.models import User
from app.recommendations.quick_pick_service import generate_quick_pick_songs

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])


@router.get("/for-you")
def get_for_you(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    songs = generate_quick_pick_songs(db, current_user, count=16)
    return [
        {
            "song": {
                "id": f"yt-{s['youtube_id']}",
                "title": s["title"],
                "cover_url": s["cover_url"],
                "youtube_id": s["youtube_id"],
                "artist_name": s["artist"],
            },
            "score": 1.0,
            "reason": f"Because you like {s['artist']}",
        }
        for s in songs
    ]


@router.get("/quick-pick")
def get_quick_pick(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    songs = generate_quick_pick_songs(db, current_user, count=3)
    return {"user_name": current_user.name, "songs": songs}