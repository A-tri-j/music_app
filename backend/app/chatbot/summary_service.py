from sqlalchemy.orm import Session
from groq import Groq
from app.core.config import settings
from app.chatbot.models import UserMusicProfile
from app.analytics.models import ListeningSession
from app.library.models import LikedSong
from app.users.models import User
from collections import Counter

client = Groq(api_key=settings.GROQ_API_KEY)


def generate_user_music_summary(db: Session, user: User) -> str:
    """User-er listening history theke ekta short behavior summary generate kore, LLM diye"""

    sessions = db.query(ListeningSession).filter(ListeningSession.user_id == user.id).all()
    liked = db.query(LikedSong).filter(LikedSong.user_id == user.id).all()

    if not sessions and not liked:
        return "New user, no listening history yet."

    artist_names = [s.artist_name for s in sessions if s.artist_name] + [l.artist_name for l in liked if l.artist_name]
    artist_counter = Counter(artist_names)

    night_sessions = sum(1 for s in sessions if s.started_at.hour >= 21 or s.started_at.hour <= 4)
    time_pattern = "mostly at night" if night_sessions > len(sessions) / 2 else "throughout the day"

    top_artists = ', '.join([a for a, _ in artist_counter.most_common(5)]) or user.favorite_genre or "various artists"

    raw_data = f"""
Top artists: {top_artists}
Favorite genre: {user.favorite_genre or 'diverse'}
Total listening sessions: {len(sessions)}
Liked songs count: {len(liked)}
Listening time pattern: {time_pattern}
"""

    completion = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[
            {
                "role": "system",
                "content": "Summarize this user's music listening behavior into 2-3 short, natural sentences. Be specific about artists and patterns. No greetings, just the summary.",
            },
            {"role": "user", "content": raw_data},
        ],
        temperature=0.3,
        max_tokens=150,
    )

    summary = completion.choices[0].message.content.strip()

    profile = db.query(UserMusicProfile).filter(UserMusicProfile.user_id == user.id).first()
    if profile:
        profile.summary_text = summary
    else:
        profile = UserMusicProfile(user_id=user.id, summary_text=summary)
        db.add(profile)

    db.commit()
    return summary
