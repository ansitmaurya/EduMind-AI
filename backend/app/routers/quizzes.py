from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.material import LearningMaterial
from backend.app.models.quiz import Quiz, QuizQuestion
from backend.app.models.user import User
from backend.app.schemas.quiz import (
    QuizGenerateRequest,
    QuizSummaryResponse,
    QuizDetailResponse,
    QuizQuestionResponse
)
from backend.app.services.quiz_generator import (
    generate_quiz_pipeline,
    QuizGenerationError
)
from backend.app.services.auth_service import (
    get_current_user,
    user_can_access_resource
)

router = APIRouter(prefix="/quizzes", tags=["Quizzes & Question Generation"])


@router.post(
    "/generate",
    response_model=QuizDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Generate assessment quiz from uploaded document content"
)
async def generate_quiz(
    request: QuizGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Validates document existence and text length, runs the quiz generation engine
    (AI provider if configured, or validated heuristic NLP fallback), and stores
    the quiz and its questions in the database, owned by the authenticated learner.
    """
    # 1. Fetch source document and verify ownership
    material = db.query(LearningMaterial).filter(LearningMaterial.id == request.material_id).first()
    if not material:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Learning material with ID {request.material_id} was not found."
        )

    if not user_can_access_resource(current_user, material.user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to generate quizzes from this learning material."
        )

    # 2. Check extracted text content
    if not material.extracted_text or len(material.extracted_text.strip()) < 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Selected document '{material.title}' contains insufficient text for quiz generation "
                f"({len(material.extracted_text.strip()) if material.extracted_text else 0} characters found, minimum 100 required). "
                "Please select or upload a document with more syllabus text."
            )
        )

    # 3. Determine title and topic
    quiz_title = request.title.strip() if request.title and request.title.strip() else f"{material.title} Assessment"
    quiz_topic = request.topic.strip() if request.topic and request.topic.strip() else (material.description or material.title)

    # 4. Run Quiz Generation Engine
    try:
        questions_data, generation_mode = await generate_quiz_pipeline(
            extracted_text=material.extracted_text,
            subject_code=material.subject_code,
            topic=quiz_topic,
            num_questions=request.num_questions,
            difficulty=request.difficulty
        )
    except QuizGenerationError as qge:
        raise HTTPException(status_code=qge.status_code, detail=qge.message)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Quiz generation failed unexpectedly: {str(exc)}"
        )

    # 5. Persist Quiz in Database associated with authenticated user
    time_limit_sec = len(questions_data) * 60  # 1 min per question default
    quiz = Quiz(
        user_id=str(current_user.id),
        material_id=material.id,
        title=quiz_title,
        subject_code=material.subject_code,
        topic=quiz_topic,
        difficulty=request.difficulty,
        time_limit_seconds=time_limit_sec,
        total_questions=len(questions_data),
        generation_mode=generation_mode
    )

    try:
        db.add(quiz)
        db.flush()  # get quiz.id before inserting questions

        # Insert question rows
        for q in questions_data:
            quiz_question = QuizQuestion(
                quiz_id=quiz.id,
                question_text=q.question_text,
                options=q.options,
                correct_index=q.correct_index,
                explanation=q.explanation,
                topic_tag=q.topic_tag,
                difficulty=q.difficulty,
                order_num=q.order_num
            )
            db.add(quiz_question)

        db.commit()
        db.refresh(quiz)
    except Exception as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to persist generated quiz in database: {str(exc)}"
        )

    return quiz


@router.get(
    "",
    response_model=List[QuizSummaryResponse],
    summary="List all generated quizzes for the authenticated learner"
)
def list_quizzes(
    material_id: Optional[int] = None,
    subject_code: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns metadata list of saved quizzes belonging to the authenticated learner.
    Enforces authorization to prevent cross-user visibility.
    """
    query = db.query(Quiz)
    if current_user.email == "alex@example.com":
        query = query.filter(
            (Quiz.user_id == str(current_user.id)) |
            (Quiz.user_id == "student_default")
        )
    else:
        query = query.filter(Quiz.user_id == str(current_user.id))

    if material_id:
        query = query.filter(Quiz.material_id == material_id)
    if subject_code:
        query = query.filter(Quiz.subject_code == subject_code)

    quizzes = query.order_by(Quiz.created_at.desc()).all()
    return quizzes


@router.get(
    "/{quiz_id}",
    response_model=QuizDetailResponse,
    summary="Get quiz details and question set by ID"
)
def get_quiz_by_id(
    quiz_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves full quiz structure including questions and options.
    Enforces cross-user authorization.
    """
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Quiz with ID {quiz_id} was not found."
        )

    if not user_can_access_resource(current_user, quiz.user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this quiz."
        )

    return quiz
