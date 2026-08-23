from sqlalchemy.orm import Session
from app.users.models import User
from app.users.preferences_models import UserFavoriteLanguage, UserFavoriteArtist
from app.chatbot.models import UserMusicProfile, ChatMessage


def build_user_context(db: Session, user: User) -> str:
    languages = [ufl.language_name for ufl in db.query(UserFavoriteLanguage).filter(UserFavoriteLanguage.user_id == user.id).all()]
    artists = [ufa.artist_name for ufa in db.query(UserFavoriteArtist).filter(UserFavoriteArtist.user_id == user.id).all()]

    profile = db.query(UserMusicProfile).filter(UserMusicProfile.user_id == user.id).first()
    summary = profile.summary_text if profile and profile.summary_text else "No listening history yet."

    context = f"""User Profile:
- Name: {user.name}
- Age: {user.age or 'unknown'}
- Favorite Genre: {user.favorite_genre or 'unknown'}
- Favorite Languages: {', '.join(languages) if languages else 'unknown'}
- Favorite Artists: {', '.join(artists) if artists else 'unknown'}

Listening Behavior Summary: {summary}
"""
    return context


def get_recent_messages(db: Session, session_id: int, limit: int = 6):
    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at.desc())
        .limit(limit)
        .all()
    )
    return list(reversed(messages))