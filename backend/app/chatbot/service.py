import json
import re
from groq import Groq
from sqlalchemy.orm import Session
from app.core.config import settings
from app.chatbot.models import ChatSession, ChatMessage
from app.chatbot.context import build_user_context, get_recent_messages
from app.chatbot.search_tools import web_search_music, musicbrainz_lookup
from app.chatbot.tools import get_listening_stats, get_top_artist, get_navigation_help
from app.chatbot.tool_defs import TOOL_DEFINITIONS
from app.recommendations.youtube_verify import find_youtube_match
from app.users.models import User

client = Groq(api_key=settings.GROQ_API_KEY)

SYSTEM_PROMPT = """You are a friendly, knowledgeable music assistant inside a music streaming app called the AI Music Platform.

LANGUAGE RULE:
- Always respond in the SAME language the user writes in (Bengali, Hindi, English, or mixed Banglish/Hinglish — match their style).

SPELLING RULE:
- If the user's message has typos, missing words, or informal/phonetic spelling (Banglish/Hinglish), silently understand the intended meaning and respond naturally — never point out or mention their spelling/grammar mistakes.

RESPONSE QUALITY RULE:
- Keep factual answers direct and complete — don't cut off mid-sentence or leave answers incomplete. If listing multiple songs/facts, use clear formatting (line breaks or short list) instead of cramming into one dense sentence.

CAPABILITIES:
- You can answer music questions (songs, artists, movies, trivia, mood recommendations).
- You can look up the user's REAL listening stats (time, top artist) using tools — always use tools for these instead of guessing. Recognize casual/misspelled phrasings too (e.g. "lisan time", "koto shunlam", "koto shune6i", "August er time" all mean "listening time") — when in doubt about whether the user is asking about their own listening activity/time/stats, call the get_listening_stats tool rather than giving a generic recommendation.
- You can guide the user to features inside the app (profile, library, stats, search) using the navigation tool, with clear step-by-step instructions.

STRICT TOPIC RULE:
- Only handle: music topics, the user's own app data/stats, and app navigation help. If asked something totally unrelated (weather, coding, general trivia), warmly redirect back to music/app help instead of a cold refusal.

ACCURACY RULE:
- When REAL-TIME SEARCH RESULTS are given, treat them as source of truth for factual music questions.
- When tool results are given (listening stats, navigation info), always use that real data — never guess numbers or app details.
- Never say a flat "I don't know." Always be warm, confident, and offer something useful.

STEP-BY-STEP RULE:
- When explaining how to find something in the app, give clear numbered steps.

SONG RECOMMENDATION RULE:
- When recommending songs, provide your warm reply first. At the very end of your response, on a new line, add the JSON array:
SONGS_JSON: [{"title": "Song Title", "artist": "Artist Name"}]
Only include SONGS_JSON when you are actually recommending songs.

TONE:
- Warm, concise, conversational (2-4 sentences, plus steps/JSON if needed).
"""


def get_or_create_session(db: Session, user: User, session_id: int | None) -> ChatSession:
    if session_id:
        session = db.query(ChatSession).filter(
            ChatSession.id == session_id, ChatSession.user_id == user.id
        ).first()
        if session:
            return session
    session = ChatSession(user_id=user.id)
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


def parse_songs_from_reply(reply: str):
    clean_text = reply
    songs_data = []

    # Check for SONGS_JSON: pattern
    if "SONGS_JSON" in reply:
        parts = re.split(r"SONGS_JSON\s*:\s*", reply, flags=re.IGNORECASE)
        clean_text = parts[0].strip()
        target_str = parts[1].strip() if len(parts) > 1 else ""
    else:
        target_str = reply

    # Clean markdown codeblocks from target_str
    cleaned_target = re.sub(r"```json\s*", "", target_str)
    cleaned_target = re.sub(r"```\s*", "", cleaned_target)

    json_match = re.search(r"\[\s*\{.*?\}\s*\]", cleaned_target, re.DOTALL)
    if json_match:
        try:
            parsed = json.loads(json_match.group(0))
            if isinstance(parsed, list):
                raw_songs = [s for s in parsed if isinstance(s, dict) and "title" in s]
                # If json was found in main text without SONGS_JSON, remove json from clean_text
                if "SONGS_JSON" not in reply:
                    clean_text = re.sub(r"\[\s*\{.*?\}\s*\]", "", clean_text, flags=re.DOTALL).strip()

                for song in raw_songs:
                    title = song.get("title", "")
                    artist = song.get("artist", "")
                    match = find_youtube_match(title, artist)
                    songs_data.append({
                        "title": title,
                        "artist": artist,
                        "youtube_id": match["youtube_id"] if match else None,
                        "cover_url": match["thumbnail"] if match else None,
                    })
        except Exception:
            pass

    clean_text = re.sub(r"```json\s*", "", clean_text)
    clean_text = re.sub(r"```\s*", "", clean_text).strip()

    return clean_text, songs_data


FACTUAL_KEYWORDS = [
    "movie", "album", "release", "year", "when", "which film", "kon movie",
    "kon album", "kobe", "recent", "latest", "new song", "hit song",
    "2024", "2025", "2026", "top song", "trending", "chart",
]


def needs_real_data(message: str) -> bool:
    lower_msg = message.lower()
    return any(kw in lower_msg for kw in FACTUAL_KEYWORDS)


STATS_HINT_KEYWORDS = [
    "listening time", "lisan", "shunechi koto", "koto shunlam", "koto shune6i",
    "koto ghonta", "koto minute", "total time", "কত সময়", "কতক্ষণ শুনেছি",
]


def hints_at_stats_query(message: str) -> bool:
    lower_msg = message.lower()
    return any(kw in lower_msg for kw in STATS_HINT_KEYWORDS)


def detect_language_override(messages) -> str | None:
    for msg in reversed(messages):
        content = msg.content.lower() if hasattr(msg, "content") and msg.content else ""
        if any(w in content for w in ["english e bolo", "speak in english", "in english", "reply in english"]):
            return "English"
        if any(w in content for w in ["bangla te bolo", "bangla e bolo", "in bengali", "speak in bengali", "বাংলায় বলো", "বাংলা তে বলো"]):
            return "Bengali"
        if any(w in content for w in ["hindi me bolo", "in hindi", "speak in hindi"]):
            return "Hindi"
    return None


def execute_tool_call(db: Session, user: User, tool_name: str, arguments: dict) -> dict:
    if tool_name == "get_listening_stats":
        return get_listening_stats(db, user.id, arguments.get("month"), arguments.get("year"))
    elif tool_name == "get_top_artist":
        return get_top_artist(db, user.id)
    elif tool_name == "get_navigation_help":
        return get_navigation_help(arguments.get("feature", ""))
    return {"error": "Unknown tool"}


def chat_with_bot(db: Session, user: User, message: str, session_id: int | None):
    session = get_or_create_session(db, user, session_id)

    db.add(ChatMessage(session_id=session.id, role="user", content=message))
    db.commit()

    user_context = build_user_context(db, user)
    recent_messages = get_recent_messages(db, session.id, limit=10)

    lang_override = detect_language_override(recent_messages)
    lang_instruction = ""
    if lang_override:
        lang_instruction = f"\n\nIMPORTANT: The user has explicitly requested responses in {lang_override.upper()}. Always reply in {lang_override} for this entire conversation."

    stats_hint = ""
    if hints_at_stats_query(message):
        stats_hint = "\n\nHINT: This message likely asks about the user's own listening time/stats (possibly with casual spelling). Strongly consider calling the get_listening_stats tool to answer accurately instead of giving a generic recommendation."

    search_context = ""
    if needs_real_data(message):
        web_results = web_search_music(message)
        mb_results = musicbrainz_lookup(message)
        search_context = f"\n\nREAL-TIME SEARCH RESULTS:\n--- Web ---\n{web_results}\n--- MusicBrainz ---\n{mb_results}"

    system_content = SYSTEM_PROMPT + lang_instruction + stats_hint + "\n\n" + user_context + search_context
    messages = [{"role": "system", "content": system_content}]

    for msg in recent_messages[-6:]:
        role = "user" if msg.role == "user" else "assistant"
        messages.append({"role": role, "content": msg.content})

    messages.append({"role": "user", "content": message})

    completion = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=messages,
        tools=TOOL_DEFINITIONS,
        tool_choice="auto",
        temperature=0.5,
        max_tokens=800,
    )

    response_message = completion.choices[0].message

    if response_message.tool_calls:
        messages.append(response_message)
        for tool_call in response_message.tool_calls:
            tool_name = tool_call.function.name
            arguments = json.loads(tool_call.function.arguments)
            result = execute_tool_call(db, user, tool_name, arguments)
            messages.append({
                "role": "tool",
                "tool_call_id": tool_call.id,
                "content": json.dumps(result),
            })

        final_completion = client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=messages,
            temperature=0.5,
            max_tokens=800,
        )
        raw_reply = final_completion.choices[0].message.content
    else:
        raw_reply = response_message.content

    clean_reply, suggested_songs = parse_songs_from_reply(raw_reply)

    db.add(ChatMessage(session_id=session.id, role="assistant", content=clean_reply))
    db.commit()

    return session.id, clean_reply, suggested_songs