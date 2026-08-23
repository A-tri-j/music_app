from sqlalchemy.orm import Session
from app.users.models import User
from app.users.preferences_models import UserFavoriteLanguage, UserFavoriteArtist
from app.library.models import Playlist
from app.core.security import hash_password, verify_password
from app.auth.schemas import UserRegister


def create_user(db: Session, user_data: UserRegister) -> User:
    email_clean = user_data.email.strip() if user_data.email and user_data.email.strip() else None
    phone_clean = user_data.phone.strip() if user_data.phone and user_data.phone.strip() else None
    name_clean = user_data.name.strip() if user_data.name else ""
    username_clean = user_data.username.strip() if user_data.username else ""

    new_user = User(
        name=name_clean,
        username=username_clean,
        email=email_clean,
        phone=phone_clean,
        hashed_password=hash_password(user_data.password),
        age=user_data.age,
        favorite_genre=user_data.favorite_genre.strip() if user_data.favorite_genre else None,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    for lang in (user_data.favorite_languages or [])[:3]:
        if lang and lang.strip():
            db.add(UserFavoriteLanguage(user_id=new_user.id, language_name=lang.strip()))

    for artist in (user_data.favorite_artists or [])[:5]:
        if artist and artist.strip():
            db.add(UserFavoriteArtist(user_id=new_user.id, artist_name=artist.strip()))

    default_playlists = ["My Favorites", "Chill Vibes", "Workout Mix"]
    for name in default_playlists:
        db.add(Playlist(user_id=new_user.id, name=name, is_public=False))

    db.commit()
    return new_user


def authenticate_user(db: Session, login_input: str, password: str) -> User | None:
    login_str = login_input.strip()
    user = (
        db.query(User)
        .filter(
            (User.email == login_str)
            | (User.phone == login_str)
            | (User.username == login_str)
        )
        .first()
    )

    if not user:
        return None

    if not verify_password(password, user.hashed_password):
        return None

    return user