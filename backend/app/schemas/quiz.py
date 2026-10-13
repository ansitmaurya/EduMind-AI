from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class QuizQuestionBase(BaseModel):
    question_text: str = Field(description="The question prompt")
    options: List[str] = Field(description="Array of exactly 4 option strings")
    correct_index: int = Field(ge=0, le=3, description="0-indexed pointer to correct option")
    explanation: Optional[str] = Field(default=None, description="Explanation of why this answer is correct")
    topic_tag: Optional[str] = Field(default=None, description="Key concept or topic tag")
    difficulty: str = Field(default="Intermediate", description="Difficulty level")
    order_num: int = Field(default=1, description="Sequential question number")


class QuizQuestionCreate(QuizQuestionBase):
    pass


class QuizQuestionResponse(QuizQuestionBase):
    id: int
    quiz_id: int

    model_config = ConfigDict(from_attributes=True)


class QuizGenerateRequest(BaseModel):
    material_id: int = Field(description="Database ID of the uploaded learning material to generate from")
    title: Optional[str] = Field(default=None, description="Custom quiz title (derived from material title if omitted)")
    topic: Optional[str] = Field(default=None, description="Specific topic or chapter focus")
    num_questions: int = Field(default=10, ge=3, le=25, description="Number of questions (typically 5, 10, or 15)")
    difficulty: str = Field(default="Intermediate", description="Target difficulty: Easy, Medium, or Hard")


class QuizSummaryResponse(BaseModel):
    id: int
    material_id: Optional[int] = None
    title: str
    subject_code: str
    topic: str
    difficulty: str
    time_limit_seconds: int
    total_questions: int
    generation_mode: str = Field(default="fallback", description="'ai' or 'fallback'")
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class QuizDetailResponse(QuizSummaryResponse):
    questions: List[QuizQuestionResponse] = []

    model_config = ConfigDict(from_attributes=True)
