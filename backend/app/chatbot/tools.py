from sqlalchemy.orm import Session
from calendar import month_name
from app.analytics.models import ListeningSession
from collections import Counter


def get_listening_stats(db: Session, user_id: int, month: str = None, year: int = None) -> dict:
    query = db.query(ListeningSession).filter(ListeningSession.user_id == user_id)

    if month and year:
        month_num = list(month_name).index(month.capitalize()) if month.capitalize() in month_name else None
        sessions = [s for s in query.all() if month_num and s.started_at.month == month_num and s.started_at.year == year]
    elif year:
        sessions = [s for s in query.all() if s.started_at.year == year]
    else:
        sessions = query.all()

    total_seconds = sum(s.duration_listened for s in sessions)

    return {
        "total_hours": round(total_seconds / 3600, 2),
        "total_minutes": round(total_seconds / 60, 1),
        "songs_played_count": len(sessions),
        "unique_songs": len({s.youtube_id for s in sessions}),
        "period": f"{month} {year}" if month and year else (str(year) if year else "all time"),
    }


def get_top_artist(db: Session, user_id: int) -> dict:
    sessions = db.query(ListeningSession).filter(ListeningSession.user_id == user_id).all()
    artist_counter = Counter(s.artist_name for s in sessions if s.artist_name)

    if not artist_counter:
        return {"top_artist": None}

    top = artist_counter.most_common(1)[0]
    return {"top_artist": top[0], "play_count": top[1]}


APP_FEATURES = {
    "profile": {
        "location": "Bottom navigation bar-e ekdom right side-e 'Profile' icon-e click koro.",
        "contains": "Tomar Music Personality card, top artist/genre/song, ar total listening hours dekhte pabe.",
    },
    "library": {
        "location": "Bottom navigation bar-e 'Library' icon-e click koro.",
        "contains": "Liked songs, playlists, recently played.",
    },
    "stats": "Bottom navigation bar-e 'Stats' icon-e click koro.",
    "search": "Bottom navigation bar-e 'Search' icon-e click koro.",
}


def get_navigation_help(feature: str) -> dict:
    feature_lower = feature.lower().strip()
    for key, value in APP_FEATURES.items():
        if key in feature_lower or feature_lower in key:
            return {"feature": key, "info": value}
    return {"feature": feature, "info": "Bottom navigation bar theke shob main feature access korte paro."}
