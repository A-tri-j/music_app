from pydantic import BaseModel


class RecommendationReason(BaseModel):
    song_id: int
    score: float
    reason: str