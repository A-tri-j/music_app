from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.auth.dependencies import get_current_user
from app.users.models import User
from app.chatbot.schemas import ChatRequest, ChatResponse, SuggestedSong
from app.chatbot.service import chat_with_bot
from app.chatbot.summary_service import generate_user_music_summary

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])


@router.post("/message", response_model=ChatResponse)
def send_message(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session_id, reply, songs = chat_with_bot(db, current_user, request.message, request.session_id)

    return ChatResponse(
        session_id=session_id,
        reply=reply,
        suggested_songs=[SuggestedSong(**s) for s in songs],
    )


@router.post("/refresh-profile")
def refresh_music_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    summary = generate_user_music_summary(db, current_user)
    return {"summary": summary}