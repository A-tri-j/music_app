from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date
from datetime import datetime, timedelta
from app.core.database import get_db
from app.auth.dependencies import get_current_user
from app.users.models import User
from app.analytics.models import ListeningSession
from app.analytics.schemas import SessionStart, SessionEnd, SessionOut, DailyStats, WeeklyStatsDay

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.post("/session/start", response_model=SessionOut)
def start_session(data: SessionStart, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    session = ListeningSession(
        user_id=current_user.id,
        youtube_id=data.youtube_id,
        title=data.title,
        artist_name=data.artist_name,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@router.patch("/session/{session_id}/end", response_model=SessionOut)
def end_session(session_id: int, data: SessionEnd, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    session = db.query(ListeningSession).filter(
        ListeningSession.id == session_id, ListeningSession.user_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    session.ended_at = datetime.utcnow()
    session.duration_listened = data.duration_listened
    db.commit()
    db.refresh(session)
    return session


@router.get("/stats/daily", response_model=DailyStats)
def get_daily_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    today = datetime.utcnow().date()

    sessions = (
        db.query(ListeningSession)
        .filter(
            ListeningSession.user_id == current_user.id,
            cast(ListeningSession.started_at, Date) == today,
        )
        .all()
    )

    total_seconds = sum(s.duration_listened for s in sessions)
    unique_artists = {s.artist_name for s in sessions if s.artist_name}

    return DailyStats(
        total_seconds=total_seconds,
        songs_played=len(sessions),
        unique_artists=len(unique_artists),
        unique_genres=1 if sessions else 0,
    )


@router.get("/stats/weekly", response_model=list[WeeklyStatsDay])
def get_weekly_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    today = datetime.utcnow().date()
    seven_days_ago = today - timedelta(days=6)

    results = (
        db.query(
            cast(ListeningSession.started_at, Date).label("day"),
            func.sum(ListeningSession.duration_listened).label("total"),
        )
        .filter(
            ListeningSession.user_id == current_user.id,
            cast(ListeningSession.started_at, Date) >= seven_days_ago,
        )
        .group_by("day")
        .all()
    )

    day_totals = {r.day: (r.total or 0) for r in results}

    weekly_data = []
    for i in range(7):
        day = seven_days_ago + timedelta(days=i)
        weekly_data.append(WeeklyStatsDay(date=str(day), total_seconds=day_totals.get(day, 0)))

    return weekly_data