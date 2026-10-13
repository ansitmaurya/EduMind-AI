from datetime import datetime
from pydantic import BaseModel, ConfigDict


class CompetencyResultResponse(BaseModel):
    id: int
    user_id: str
    subject_code: str
    topic: str
    mastery_score: float
    status: str
    total_questions_evaluated: int
    correct_questions_evaluated: int
    evaluated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RecommendationResponse(BaseModel):
    id: int
    user_id: str
    subject_code: str
    topic: str
    recommendation_type: str
    title: str
    description: str
    priority: str
    is_completed: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
