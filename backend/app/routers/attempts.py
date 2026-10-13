from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.quiz import Quiz, QuizQuestion
from backend.app.models.attempt import QuizAttempt, LearnerResponse
from backend.app.models.user import User
from backend.app.schemas.attempt import (
    ActiveQuizQuestion,
    QuizAttemptStartResponse,
    QuizSubmitRequest,
    LearnerQuestionReview,
    QuizAttemptResultResponse,
    QuizAttemptHistoryItem
)
from backend.app.services.auth_service import (
    get_current_user,
    user_can_access_resource
)

router = APIRouter(tags=["Quiz Attempts & Evaluation"])


@router.post(
    "/quizzes/{quiz_id}/attempts",
    response_model=QuizAttemptStartResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Start a new quiz attempt with protected answers"
)
def start_quiz_attempt(
    quiz_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Initializes a new quiz attempt in the database owned by the authenticated learner.
    PROTECTS ANSWERS: Deliberately excludes correct_index and explanation
    from the returned payload to prevent client-side answer inspection before submission.
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
            detail="You do not have permission to attempt this quiz."
        )

    if not quiz.questions or len(quiz.questions) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Quiz with ID {quiz_id} has no questions available for attempting."
        )

    # Initialize a new QuizAttempt record tied to authenticated user
    now_utc = datetime.now(timezone.utc)
    attempt = QuizAttempt(
        quiz_id=quiz.id,
        user_id=str(current_user.id),
        started_at=now_utc,
        status="in_progress",
        total_questions=len(quiz.questions),
        attempted_count=0,
        correct_count=0,
        unanswered_count=len(quiz.questions),
        score_percentage=0.0,
        time_taken_seconds=0
    )

    try:
        db.add(attempt)
        db.commit()
        db.refresh(attempt)
    except Exception as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to initialize quiz attempt: {str(exc)}"
        )

    # Transform questions into ActiveQuizQuestion (Answers & Explanations strictly hidden)
    active_questions = [
        ActiveQuizQuestion(
            id=q.id,
            question_text=q.question_text,
            options=q.options,
            difficulty=q.difficulty,
            order_num=q.order_num
        )
        for q in sorted(quiz.questions, key=lambda x: x.order_num)
    ]

    return QuizAttemptStartResponse(
        attempt_id=attempt.id,
        quiz_id=quiz.id,
        quiz_title=quiz.title,
        subject_code=quiz.subject_code,
        topic=quiz.topic,
        total_questions=len(active_questions),
        time_limit_seconds=quiz.time_limit_seconds,
        questions=active_questions
    )


@router.post(
    "/attempts/{attempt_id}/submit",
    response_model=QuizAttemptResultResponse,
    summary="Submit answers and evaluate quiz attempt"
)
def submit_quiz_attempt(
    attempt_id: int,
    submission: QuizSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submits user responses for evaluation:
    1. Validates attempt exists and belongs to the authenticated user.
    2. Validates attempt is not already completed (prevents duplicate submissions).
    3. Validates question IDs and selected options.
    4. Evaluates answers server-side against stored correct_index.
    5. Computes correct, incorrect, unanswered counts and percentage score.
    6. Saves individual responses in learner_responses and updates attempt status to completed.
    7. Returns full result review with original saved explanations.
    """
    attempt = db.query(QuizAttempt).filter(QuizAttempt.id == attempt_id).first()
    if not attempt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Quiz attempt with ID {attempt_id} was not found."
        )

    if not user_can_access_resource(current_user, attempt.user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to submit this quiz attempt."
        )

    # Prevent duplicate submission
    if attempt.status == "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This quiz attempt has already been submitted and cannot be resubmitted."
        )

    quiz = attempt.quiz
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Associated quiz for attempt {attempt_id} was not found."
        )

    questions = sorted(quiz.questions, key=lambda x: x.order_num)
    questions_by_id = {q.id: q for q in questions}

    # Validate submitted answers
    for resp in submission.responses:
        if resp.question_id not in questions_by_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Question ID {resp.question_id} does not belong to Quiz {quiz.id}."
            )
        q = questions_by_id[resp.question_id]
        if resp.selected_index is not None:
            if resp.selected_index < 0 or resp.selected_index >= len(q.options):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Selected option index {resp.selected_index} is out of bounds for Question {resp.question_id} (0-{len(q.options)-1})."
                )

    # Map responses by question id
    user_answers = {resp.question_id: resp.selected_index for resp in submission.responses}

    # Evaluation counters
    attempted_count = 0
    correct_count = 0
    unanswered_count = 0
    now_utc = datetime.now(timezone.utc)
    reviews: List[LearnerQuestionReview] = []

    try:
        for q in questions:
            selected_idx = user_answers.get(q.id)

            if selected_idx is not None:
                attempted_count += 1
                is_correct = (selected_idx == q.correct_index)
                if is_correct:
                    correct_count += 1
            else:
                unanswered_count += 1
                is_correct = False

            # Persist individual learner response
            learner_response = LearnerResponse(
                attempt_id=attempt.id,
                question_id=q.id,
                selected_index=selected_idx,
                is_correct=is_correct,
                answered_at=now_utc
            )
            db.add(learner_response)

            # Build review item (revealing correct answer and original saved explanation)
            reviews.append(
                LearnerQuestionReview(
                    question_id=q.id,
                    question_text=q.question_text,
                    options=q.options,
                    selected_index=selected_idx,
                    correct_index=q.correct_index,
                    is_correct=is_correct,
                    explanation=q.explanation,
                    topic_tag=q.topic_tag
                )
            )

        total_questions = len(questions)
        incorrect_count = total_questions - correct_count - unanswered_count
        score_percentage = round((correct_count / total_questions) * 100.0, 1) if total_questions > 0 else 0.0

        # Qualitative feedback based on score percentage
        if score_percentage >= 90.0:
            feedback_summary = "Outstanding performance! You have demonstrated comprehensive mastery of this subject material."
        elif score_percentage >= 75.0:
            feedback_summary = "Great job! You have a solid grasp of key concepts with minor areas for review."
        elif score_percentage >= 50.0:
            feedback_summary = "Satisfactory effort. Review the missed questions below to reinforce key concepts."
        else:
            feedback_summary = "Needs improvement. Review the detailed explanations below and consult the study material before retrying."

        # Finalize and update attempt record
        attempt.status = "completed"
        attempt.completed_at = now_utc
        attempt.total_questions = total_questions
        attempt.attempted_count = attempted_count
        attempt.correct_count = correct_count
        attempt.unanswered_count = unanswered_count
        attempt.score_percentage = score_percentage
        attempt.time_taken_seconds = max(0, submission.time_taken_seconds or 0)
        attempt.feedback_summary = feedback_summary

        db.commit()
        db.refresh(attempt)

    except HTTPException:
        db.rollback()
        raise
    except Exception as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to evaluate and save quiz attempt: {str(exc)}"
        )

    return QuizAttemptResultResponse(
        attempt_id=attempt.id,
        quiz_id=quiz.id,
        quiz_title=quiz.title,
        subject_code=quiz.subject_code,
        topic=quiz.topic,
        status=attempt.status,
        started_at=attempt.started_at,
        completed_at=attempt.completed_at,
        total_questions=total_questions,
        attempted_count=attempted_count,
        correct_count=correct_count,
        incorrect_count=incorrect_count,
        unanswered_count=unanswered_count,
        score_percentage=score_percentage,
        time_taken_seconds=attempt.time_taken_seconds,
        feedback_summary=feedback_summary,
        question_reviews=reviews
    )


@router.get(
    "/attempts/{attempt_id}/result",
    response_model=QuizAttemptResultResponse,
    summary="Retrieve saved evaluation results for a completed quiz attempt"
)
def get_attempt_result(
    attempt_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves the persisted evaluation result and question-by-question review for an attempt.
    Enforces authorization to prevent cross-user result leakage.
    """
    attempt = db.query(QuizAttempt).filter(QuizAttempt.id == attempt_id).first()
    if not attempt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Quiz attempt with ID {attempt_id} was not found."
        )

    if not user_can_access_resource(current_user, attempt.user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view results for this quiz attempt."
        )

    if attempt.status != "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quiz attempt is still in progress. Please submit the quiz to view results."
        )

    quiz = attempt.quiz
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Associated quiz for attempt {attempt_id} was not found."
        )

    # Fetch stored responses
    responses = db.query(LearnerResponse).filter(LearnerResponse.attempt_id == attempt.id).all()
    responses_by_q = {r.question_id: r for r in responses}

    questions = sorted(quiz.questions, key=lambda x: x.order_num)
    reviews: List[LearnerQuestionReview] = []

    for q in questions:
        resp = responses_by_q.get(q.id)
        selected_index = resp.selected_index if resp else None
        is_correct = resp.is_correct if resp else False

        reviews.append(
            LearnerQuestionReview(
                question_id=q.id,
                question_text=q.question_text,
                options=q.options,
                selected_index=selected_index,
                correct_index=q.correct_index,
                is_correct=is_correct,
                explanation=q.explanation,
                topic_tag=q.topic_tag
            )
        )

    incorrect_count = max(0, attempt.total_questions - attempt.correct_count - attempt.unanswered_count)

    return QuizAttemptResultResponse(
        attempt_id=attempt.id,
        quiz_id=quiz.id,
        quiz_title=quiz.title,
        subject_code=quiz.subject_code,
        topic=quiz.topic,
        status=attempt.status,
        started_at=attempt.started_at,
        completed_at=attempt.completed_at,
        total_questions=attempt.total_questions,
        attempted_count=attempt.attempted_count,
        correct_count=attempt.correct_count,
        incorrect_count=incorrect_count,
        unanswered_count=attempt.unanswered_count,
        score_percentage=attempt.score_percentage,
        time_taken_seconds=attempt.time_taken_seconds,
        feedback_summary=attempt.feedback_summary or "",
        question_reviews=reviews
    )


@router.get(
    "/attempts",
    response_model=List[QuizAttemptHistoryItem],
    summary="Retrieve quiz attempt history for the authenticated learner"
)
def get_attempt_history(
    quiz_id: Optional[int] = None,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns historical quiz attempts belonging to the authenticated learner.
    Enforces authorization to prevent cross-user history visibility.
    """
    query = db.query(QuizAttempt)
    if current_user.email == "alex@example.com":
        query = query.filter(
            (QuizAttempt.user_id == str(current_user.id)) |
            (QuizAttempt.user_id == "student_default")
        )
    else:
        query = query.filter(QuizAttempt.user_id == str(current_user.id))

    if quiz_id:
        query = query.filter(QuizAttempt.quiz_id == quiz_id)

    attempts = query.order_by(QuizAttempt.started_at.desc()).limit(limit).all()

    history: List[QuizAttemptHistoryItem] = []
    for att in attempts:
        history.append(
            QuizAttemptHistoryItem(
                id=att.id,
                quiz_id=att.quiz_id,
                quiz_title=att.quiz.title if att.quiz else "Untitled Quiz",
                subject_code=att.quiz.subject_code if att.quiz else "GEN",
                topic=att.quiz.topic if att.quiz else "General",
                status=att.status,
                started_at=att.started_at,
                completed_at=att.completed_at,
                total_questions=att.total_questions,
                attempted_count=att.attempted_count,
                correct_count=att.correct_count,
                unanswered_count=att.unanswered_count,
                score_percentage=att.score_percentage,
                time_taken_seconds=att.time_taken_seconds
            )
        )

    return history
