from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


# ==============================================================================
# ACTIVE QUIZ SCHEMAS (CORRECT ANSWERS STRICTLY OMITTED / PROTECTED)
# ==============================================================================

class ActiveQuizQuestion(BaseModel):
    """Question structure delivered during an active attempt. Answers/explanations omitted."""
    id: int
    question_text: str
    options: List[str] = Field(description="Exactly 4 option choices")
    difficulty: str
    topic_tag: Optional[str] = None
    order_num: int

    model_config = ConfigDict(from_attributes=True)


class QuizAttemptStartResponse(BaseModel):
    """Response returned when an attempt is initialized."""
    attempt_id: int
    quiz_id: int
    quiz_title: str
    subject_code: str
    topic: str
    total_questions: int
    time_limit_seconds: int
    status: str
    started_at: datetime
    questions: List[ActiveQuizQuestion]

    model_config = ConfigDict(from_attributes=True)


# ==============================================================================
# SUBMISSION SCHEMAS
# ==============================================================================

class LearnerAnswerSubmission(BaseModel):
    question_id: int
    selected_index: Optional[int] = Field(default=None, ge=0, le=3, description="Selected option 0-3, or None if skipped")


class QuizSubmitRequest(BaseModel):
    responses: List[LearnerAnswerSubmission] = Field(default_factory=list, description="Array of question answers")
    time_taken_seconds: Optional[int] = Field(default=0, ge=0, description="Time spent in seconds")


# ==============================================================================
# RESULT & REVIEW SCHEMAS (ANSWERS REVEALED AFTER SUBMISSION)
# ==============================================================================

class LearnerQuestionReview(BaseModel):
    """Detailed question review with user answer, correct answer, and explanation."""
    question_id: int
    question_text: str
    options: List[str]
    selected_index: Optional[int]
    correct_index: int
    is_correct: bool
    explanation: Optional[str]
    topic_tag: Optional[str] = None


class QuizAttemptResultResponse(BaseModel):
    """Complete evaluated quiz results and breakdown."""
    attempt_id: int
    quiz_id: int
    quiz_title: str
    subject_code: str
    topic: str
    status: str
    started_at: datetime
    completed_at: Optional[datetime]
    total_questions: int
    attempted_count: int
    correct_count: int
    incorrect_count: int
    unanswered_count: int
    score_percentage: float
    time_taken_seconds: int
    feedback_summary: str
    question_reviews: List[LearnerQuestionReview] = []

    model_config = ConfigDict(from_attributes=True)


class QuizAttemptHistoryItem(BaseModel):
    """Summary item for the attempts history listing."""
    id: int
    quiz_id: int
    quiz_title: str
    subject_code: str
    topic: str
    status: str
    started_at: datetime
    completed_at: Optional[datetime]
    total_questions: int
    attempted_count: int
    correct_count: int
    unanswered_count: int
    score_percentage: float
    time_taken_seconds: int

    model_config = ConfigDict(from_attributes=True)


# Legacy backward-compatible schemas
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
