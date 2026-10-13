from backend.app.schemas.health import HealthResponse, DatabaseStatus
from backend.app.schemas.material import (
    LearningMaterialBase,
    LearningMaterialCreate,
    LearningMaterialResponse,
    LearningMaterialDetailResponse,
    LearningMaterialContentResponse,
    MaterialDeleteResponse
)
from backend.app.schemas.quiz import (
    QuizGenerateRequest,
    QuizSummaryResponse,
    QuizDetailResponse,
    QuizQuestionBase,
    QuizQuestionCreate,
    QuizQuestionResponse
)
from backend.app.schemas.attempt import (
    QuizAttemptCreate,
    QuizAttemptResponse,
    LearnerResponseCreate,
    LearnerResponseResponse,
    ActiveQuizQuestion,
    QuizAttemptStartResponse,
    LearnerAnswerSubmission,
    QuizSubmitRequest,
    LearnerQuestionReview,
    QuizAttemptResultResponse,
    QuizAttemptHistoryItem
)
from backend.app.schemas.competency import (
    TopicCompetencyDetail,
    CompetencyAnalysisResponse,
    LearningRecommendationItem,
    RecommendationsResponse,
    CompetencyResultResponse,
    RecommendationResponse
)

__all__ = [
    "HealthResponse",
    "DatabaseStatus",
    "LearningMaterialBase",
    "LearningMaterialCreate",
    "LearningMaterialResponse",
    "LearningMaterialDetailResponse",
    "LearningMaterialContentResponse",
    "MaterialDeleteResponse",
    "QuizGenerateRequest",
    "QuizSummaryResponse",
    "QuizDetailResponse",
    "QuizQuestionBase",
    "QuizQuestionCreate",
    "QuizQuestionResponse",
    "QuizAttemptCreate",
    "QuizAttemptResponse",
    "LearnerResponseCreate",
    "LearnerResponseResponse",
    "ActiveQuizQuestion",
    "QuizAttemptStartResponse",
    "LearnerAnswerSubmission",
    "QuizSubmitRequest",
    "LearnerQuestionReview",
    "QuizAttemptResultResponse",
    "QuizAttemptHistoryItem",
    "TopicCompetencyDetail",
    "CompetencyAnalysisResponse",
    "LearningRecommendationItem",
    "RecommendationsResponse",
    "CompetencyResultResponse",
    "RecommendationResponse"
]
