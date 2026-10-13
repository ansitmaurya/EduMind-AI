from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class TopicCompetencyDetail(BaseModel):
    """Evaluation breakdown for a single topic."""
    subject_code: str
    topic: str
    total_questions: int
    attempted_count: int
    correct_count: int
    incorrect_count: int
    unanswered_count: int
    accuracy_percentage: float
    status: str = Field(description="'mastered', 'developing', 'needs_review', or 'insufficient_data'")
    status_label: str = Field(description="Human-readable label: Mastered, Developing, Needs Improvement, Insufficient Data")
    attempts_count: int
    status_color: str = Field(description="UI badge color token e.g. emerald, amber, rose, slate")

    model_config = ConfigDict(from_attributes=True)


class CompetencyAnalysisResponse(BaseModel):
    """Complete competency gap analysis based on submitted quiz attempts."""
    user_id: str
    has_data: bool
    total_quizzes_taken: int
    total_questions_evaluated: int
    total_correct_answers: int
    overall_accuracy_percentage: float
    gap_threshold_percentage: float = 50.0
    min_questions_threshold: int = 3
    methodology_explanation: str
    strengths: List[TopicCompetencyDetail] = []
    gaps: List[TopicCompetencyDetail] = []
    developing: List[TopicCompetencyDetail] = []
    insufficient_data_topics: List[TopicCompetencyDetail] = []
    all_topics: List[TopicCompetencyDetail] = []

    model_config = ConfigDict(from_attributes=True)


class LearningRecommendationItem(BaseModel):
    """Actionable personalized recommendation linked to an identified gap."""
    id: Optional[int] = None
    subject_code: str
    topic: str
    priority: str = Field(description="'high', 'medium', or 'low'")
    recommendation_type: str = Field(description="'revision', 'reading', or 'practice'")
    title: str
    description: str
    action_step: str
    has_matching_material: bool
    matched_material_id: Optional[int] = None
    matched_material_title: Optional[str] = None
    matched_material_type: Optional[str] = None
    competency_accuracy: Optional[float] = None
    is_completed: bool = False

    model_config = ConfigDict(from_attributes=True)


class RecommendationsResponse(BaseModel):
    """Collection of personalized learning recommendations."""
    user_id: str
    has_gaps: bool
    total_recommendations: int
    summary_message: str
    recommendations: List[LearningRecommendationItem] = []

    model_config = ConfigDict(from_attributes=True)


# Legacy backward-compatible schemas
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
