from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import Base, engine

from app.users.models import User
from app.users.preferences_models import UserFavoriteArtist, UserFavoriteLanguage
from app.library.models import LikedSong, RecentlyPlayed, Playlist, PlaylistSong
from app.analytics.models import ListeningSession
from app.chatbot.models import ChatSession, ChatMessage, UserMusicProfile

Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Music Platform API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.auth.router import router as auth_router
from app.users.router import router as users_router
from app.library.router import router as library_router
from app.analytics.router import router as analytics_router
from app.recommendations.router import router as recommendations_router
from app.chatbot.router import router as chatbot_router

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(library_router)
app.include_router(analytics_router)
app.include_router(recommendations_router)
app.include_router(chatbot_router)


@app.get("/")
def root():
    return {"status": "running", "message": "AI Music Platform API"}