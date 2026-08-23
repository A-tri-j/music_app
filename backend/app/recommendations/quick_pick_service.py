from sqlalchemy.orm import Session
from groq import Groq
import json
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
from app.core.config import settings
from app.users.models import User
from app.users.preferences_models import UserFavoriteArtist, UserFavoriteLanguage
from app.analytics.models import ListeningSession
from app.recommendations.youtube_verify import find_youtube_match

client = Groq(api_key=settings.GROQ_API_KEY)

FALLBACK_POPULAR_SONGS = [
    {"title": "Kesariya", "artist": "Arijit Singh"},
    {"title": "Tum Hi Ho", "artist": "Arijit Singh"},
    {"title": "Bekhayali", "artist": "Arijit Singh"},
    {"title": "Tumi Jake Bhalobaso", "artist": "Anupam Roy"},
    {"title": "Prem Tomake Dilam", "artist": "Rupam Islam"},
    {"title": "Channa Mereya", "artist": "Arijit Singh"},
    {"title": "Agar Tum Saath Ho", "artist": "Alka Yagnik"},
    {"title": "Ami Ki Tomay Khub", "artist": "Anupam Roy"},
    {"title": "Gerua", "artist": "Arijit Singh"},
    {"title": "Boba Tunnel", "artist": "Anupam Roy"},
    {"title": "Amake Amar Moto Thakte Dao", "artist": "Anupam Roy"},
    {"title": "Benche Thakar Gaan", "artist": "Rupam Islam"},
    {"title": "O Sanam", "artist": "Lucky Ali"},
    {"title": "Shayad", "artist": "Arijit Singh"},
    {"title": "Raabta", "artist": "Arijit Singh"},
    {"title": "Khairiyat", "artist": "Arijit Singh"},
    {"title": "Hawayein", "artist": "Arijit Singh"},
    {"title": "Apna Bana Le", "artist": "Arijit Singh"},
]


def get_user_taste(db: Session, user: User):
    # User's registered preferences from onboarding
    registered_artists = [a.artist_name for a in db.query(UserFavoriteArtist).filter(UserFavoriteArtist.user_id == user.id).all()]
    languages = [l.language_name for l in db.query(UserFavoriteLanguage).filter(UserFavoriteLanguage.user_id == user.id).all()]

    # Extract top listened artists from actual listening history
    sessions = db.query(ListeningSession).filter(ListeningSession.user_id == user.id).all()
    listened_artist_counter = Counter(s.artist_name for s in sessions if s.artist_name)
    top_listened_artists = [a for a, _ in listened_artist_counter.most_common(5)]

    # Prioritize actual listening behavior over stated preferences
    combined_artists = top_listened_artists + [a for a in registered_artists if a not in top_listened_artists]

    return combined_artists[:5], languages


def ask_llm_for_songs(artists: list[str], languages: list[str], count: int) -> list[dict]:
    artist_list = artists if artists else ["Arijit Singh", "Anupam Roy", "Pritam"]
    artist_str = ", ".join(artist_list)
    lang_str = ", ".join(languages) if languages else "Bengali, Hindi"

    prompt = (
        f"List {count} famous songs by {artist_str} in {lang_str}. "
        f'Output MUST be a JSON array of objects: [{{"title": "Song Title", "artist": "Artist Name"}}]'
    )

    try:
        completion = client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[
                {
                    "role": "system",
                    "content": 'You are a music database. You respond ONLY with JSON array format: [{"title": "Song Title", "artist": "Artist Name"}].',
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.5,
            max_tokens=500,
        )

        raw = completion.choices[0].message.content.strip()
        if raw.startswith("```"):
            raw = raw.strip("`").replace("json", "", 1).strip()

        parsed = json.loads(raw)
        if isinstance(parsed, list) and len(parsed) >= 4:
            return parsed
    except Exception:
        pass

    # Built-in curated popular list for the user's artists
    default_songs = [
        {"title": "Tum Hi Ho", "artist": "Arijit Singh"},
        {"title": "Kesariya", "artist": "Arijit Singh"},
        {"title": "Channa Mereya", "artist": "Arijit Singh"},
        {"title": "Gerua", "artist": "Arijit Singh"},
        {"title": "Boba Tunnel", "artist": "Anupam Roy"},
        {"title": "Amake Amar Moto Thakte Dao", "artist": "Anupam Roy"},
        {"title": "Benche Thakar Gaan", "artist": "Rupam Islam"},
        {"title": "O Sanam", "artist": "Lucky Ali"},
        {"title": "Taare Zameen Par", "artist": "Shankar Mahadevan"},
        {"title": "Ghungroo", "artist": "Arijit Singh"},
        {"title": "Kalank", "artist": "Arijit Singh"},
        {"title": "Zaalima", "artist": "Arijit Singh"},
        {"title": "Agar Tum Saath Ho", "artist": "Arijit Singh"},
        {"title": "Apna Bana Le", "artist": "Arijit Singh"},
    ]
    return default_songs[:count]


def verify_single_song(song: dict) -> dict | None:
    title = song.get("title", "")
    artist = song.get("artist", "")
    if not title:
        return None
    match = find_youtube_match(title, artist)
    if match:
        return {
            "title": title,
            "artist": artist,
            "youtube_id": match["youtube_id"],
            "cover_url": match.get("thumbnail") or match.get("cover_url", ""),
        }
    return None


def generate_quick_pick_songs(db: Session, user: User, count: int = 6) -> list[dict]:
    artists, languages = get_user_taste(db, user)

    verified_songs = []

    candidates = ask_llm_for_songs(artists, languages, max(count + 2, 8))

    with ThreadPoolExecutor(max_workers=8) as executor:
        results = list(executor.map(verify_single_song, candidates))

    for r in results:
        if r and len(verified_songs) < count:
            verified_songs.append(r)

    # Fallback: If not enough songs are verified, backfill with curated popular songs
    if len(verified_songs) < count:
        used_titles = {s["title"].strip().lower() for s in verified_songs}
        for fallback_song in FALLBACK_POPULAR_SONGS:
            if len(verified_songs) >= count:
                break
            if fallback_song["title"].strip().lower() in used_titles:
                continue

            match = find_youtube_match(fallback_song["title"], fallback_song["artist"])
            if match:
                verified_songs.append({
                    "title": fallback_song["title"],
                    "artist": fallback_song["artist"],
                    "youtube_id": match["youtube_id"],
                    "cover_url": match.get("thumbnail") or match.get("cover_url", ""),
                })
                used_titles.add(fallback_song["title"].strip().lower())

    return verified_songs[:count]
