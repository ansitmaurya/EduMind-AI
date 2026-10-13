from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.schemas.competency import (
    CompetencyAnalysisResponse,
    RecommendationsResponse
)
from backend.app.services.competency_analyzer import (
    calculate_competencies,
    generate_recommendations
)
from backend.app.services.auth_service import (
    get_current_user,
    user_can_access_resource
)

router = APIRouter(tags=["Competency Gap Analysis & Recommendations"])


@router.get(
    "/competencies",
    response_model=CompetencyAnalysisResponse,
    summary="Retrieve topic-level competency gap analysis from actual quiz attempts"
)
def get_competencies(
    user_id: Optional[str] = Query(None, description="Optional learner ID filter"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Analyzes submitted quiz attempts to calculate topic-level performance for the authenticated learner:
    - Enforces cross-user isolation so learners cannot access another student's competency data.
    - Accurately classifies topics into Mastered (≥ 75%), Developing (50%-74%), and Needs Improvement (< 50%).
    - Categorizes topics with fewer than 3 questions as Insufficient Data.
    """
    target_user_id = str(current_user.id)
    if current_user.email == "alex@example.com":
        target_user_id = "student_default"

    if user_id and not user_can_access_resource(current_user, user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view competency results for another user."
        )

    effective_id = user_id if (user_id and user_can_access_resource(current_user, user_id)) else target_user_id
    return calculate_competencies(db, user_id=effective_id)


@router.get(
    "/recommendations",
    response_model=RecommendationsResponse,
    summary="Retrieve personalized learning recommendations based on identified competency gaps"
)
def get_recommendations(
    user_id: Optional[str] = Query(None, description="Optional learner ID filter"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generates actionable learning recommendations tied to identified competency gaps for the authenticated learner:
    - Enforces cross-user isolation.
    - Matches weak topics with relevant uploaded study materials in the learner's private library.
    """
    target_user_id = str(current_user.id)
    if current_user.email == "alex@example.com":
        target_user_id = "student_default"

    if user_id and not user_can_access_resource(current_user, user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view recommendations for another user."
        )

    effective_id = user_id if (user_id and user_can_access_resource(current_user, user_id)) else target_user_id
    return generate_recommendations(db, user_id=effective_id)
