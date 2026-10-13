from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class QuizQuestionBase(BaseModel):
    question_text: str
    options: List[str] = Field(description="Array of option strings")
    correct_index: int = Field(ge=0, description="0-indexed pointer to correct option")
    explanation: Optional[str] = None
    topic_tag: Optional[str] = None
    difficulty: str = "Intermediate"
    order_num: int = 1


class QuizQuestionCreate(QuizQuestionBase):
    pass


class QuizQuestionResponse(QuizQuestionBase):
    id: int
    quiz_id: int

    model_config = ConfigDict(from_attributes=True)


class QuizBase(BaseModel):
    title: str
    subject_code: str
    topic: str
    difficulty: str = "Intermediate"
    time_limit_seconds: int = 600
    material_id: Optional[int] = None


class QuizCreate(QuizBase):
    questions: Optional[List[QuizQuestionCreate]] = None


class QuizResponse(QuizBase):
    id: int
    total_questions: int
    created_at: datetime
    updated_at: datetime
    questions: Optional[List[QuizQuestionResponse]] = None

    model_config = ConfigDict(from_attributes=True)
