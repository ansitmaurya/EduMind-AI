from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class LearnerResponseCreate(BaseModel):
    question_id: int
    selected_index: Optional[int] = None


class LearnerResponseResponse(BaseModel):
    id: int
    attempt_id: int
    question_id: int
    selected_index: Optional[int]
    is_correct: bool
    answered_at: datetime

    model_config = ConfigDict(from_attributes=True)


class QuizAttemptCreate(BaseModel):
    quiz_id: int
    user_id: str = "student_default"
    time_taken_seconds: int = 0
    responses: List[LearnerResponseCreate] = []


class QuizAttemptResponse(BaseModel):
    id: int
    quiz_id: int
    user_id: str
    started_at: datetime
    completed_at: Optional[datetime]
    total_questions: int
    attempted_count: int
    correct_count: int
    score_percentage: float
    time_taken_seconds: int
    feedback_summary: Optional[str]
    responses: Optional[List[LearnerResponseResponse]] = None

    model_config = ConfigDict(from_attributes=True)
