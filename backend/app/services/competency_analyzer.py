from datetime import datetime, timezone
from typing import List, Dict, Tuple, Optional
from sqlalchemy.orm import Session

from backend.app.models.quiz import Quiz, QuizQuestion
from backend.app.models.attempt import QuizAttempt, LearnerResponse
from backend.app.models.material import LearningMaterial
from backend.app.models.competency import CompetencyResult, PersonalizedRecommendation
from backend.app.schemas.competency import (
    TopicCompetencyDetail,
    CompetencyAnalysisResponse,
    LearningRecommendationItem,
    RecommendationsResponse
)

# Threshold definitions (documented and explainable)
MIN_QUESTIONS_THRESHOLD = 3      # Minimum questions required before concluding mastery/gap
GAP_ACCURACY_THRESHOLD = 50.0    # Accuracy below 50% flagged as Competency Gap
MASTERY_ACCURACY_THRESHOLD = 75.0 # Accuracy >= 75% recognized as Mastered Strength


def calculate_competencies(db: Session, user_id: str = "student_default") -> CompetencyAnalysisResponse:
    """
    Analyzes all completed quiz attempts for a learner, grouping question responses
    by topic tag to compute accurate topic-level competency metrics.
    
    Guarantees:
    - Never fabricates statistics.
    - Treats missing/insufficient data properly without penalizing as 0% performance.
    - Persists computed competencies into SQLite `competency_results` table.
    """
    # 1. Fetch completed attempts for the learner
    completed_attempts = (
        db.query(QuizAttempt)
        .filter(QuizAttempt.user_id == user_id, QuizAttempt.status == "completed")
        .all()
    )

    methodology = (
        f"EduMind AI evaluates competency using actual learner responses submitted across completed quiz attempts. "
        f"Topics with at least {MIN_QUESTIONS_THRESHOLD} evaluated questions are classified into: "
        f"Mastered (≥ {int(MASTERY_ACCURACY_THRESHOLD)}% accuracy), "
        f"Developing ({int(GAP_ACCURACY_THRESHOLD)}% to {int(MASTERY_ACCURACY_THRESHOLD - 1)}%), "
        f"and Needs Improvement (< {int(GAP_ACCURACY_THRESHOLD)}%). "
        f"Topics with fewer than {MIN_QUESTIONS_THRESHOLD} evaluated questions are flagged as Insufficient Data "
        f"to prevent premature conclusions."
    )

    if not completed_attempts:
        return CompetencyAnalysisResponse(
            user_id=user_id,
            has_data=False,
            total_quizzes_taken=0,
            total_questions_evaluated=0,
            total_correct_answers=0,
            overall_accuracy_percentage=0.0,
            gap_threshold_percentage=GAP_ACCURACY_THRESHOLD,
            min_questions_threshold=MIN_QUESTIONS_THRESHOLD,
            methodology_explanation=methodology,
            strengths=[],
            gaps=[],
            developing=[],
            insufficient_data_topics=[],
            all_topics=[]
        )

    # 2. Query all responses joining QuizQuestion and Quiz
    records = (
        db.query(LearnerResponse, QuizQuestion, Quiz)
        .join(QuizQuestion, LearnerResponse.question_id == QuizQuestion.id)
        .join(QuizAttempt, LearnerResponse.attempt_id == QuizAttempt.id)
        .join(Quiz, QuizAttempt.quiz_id == Quiz.id)
        .filter(QuizAttempt.user_id == user_id, QuizAttempt.status == "completed")
        .all()
    )

    if not records:
        return CompetencyAnalysisResponse(
            user_id=user_id,
            has_data=False,
            total_quizzes_taken=len(completed_attempts),
            total_questions_evaluated=0,
            total_correct_answers=0,
            overall_accuracy_percentage=0.0,
            gap_threshold_percentage=GAP_ACCURACY_THRESHOLD,
            min_questions_threshold=MIN_QUESTIONS_THRESHOLD,
            methodology_explanation=methodology,
            strengths=[],
            gaps=[],
            developing=[],
            insufficient_data_topics=[],
            all_topics=[]
        )

    # 3. Group metrics by (subject_code, topic_name)
    topic_map: Dict[Tuple[str, str], Dict] = {}

    for resp, question, quiz in records:
        # Resolve topic name: question topic_tag > quiz topic > General
        topic_name = (
            question.topic_tag.strip()
            if (question.topic_tag and question.topic_tag.strip())
            else (quiz.topic.strip() if (quiz.topic and quiz.topic.strip()) else "General Concepts")
        )
        subject_code = quiz.subject_code.strip() if (quiz.subject_code and quiz.subject_code.strip()) else "GEN"
        key = (subject_code, topic_name)

        if key not in topic_map:
            topic_map[key] = {
                "subject_code": subject_code,
                "topic": topic_name,
                "total_questions": 0,
                "attempted_count": 0,
                "correct_count": 0,
                "incorrect_count": 0,
                "unanswered_count": 0,
                "attempt_ids": set()
            }

        topic_entry = topic_map[key]
        topic_entry["total_questions"] += 1
        topic_entry["attempt_ids"].add(resp.attempt_id)

        if resp.selected_index is not None:
            topic_entry["attempted_count"] += 1
            if resp.is_correct:
                topic_entry["correct_count"] += 1
            else:
                topic_entry["incorrect_count"] += 1
        else:
            topic_entry["unanswered_count"] += 1

    # 4. Formulate TopicCompetencyDetail items and classify
    strengths: List[TopicCompetencyDetail] = []
    gaps: List[TopicCompetencyDetail] = []
    developing: List[TopicCompetencyDetail] = []
    insufficient: List[TopicCompetencyDetail] = []
    all_details: List[TopicCompetencyDetail] = []

    for (subj, top), data in topic_map.items():
        total_q = data["total_questions"]
        correct_q = data["correct_count"]
        accuracy = round((correct_q / total_q) * 100.0, 1) if total_q > 0 else 0.0
        attempts_cnt = len(data["attempt_ids"])

        if total_q < MIN_QUESTIONS_THRESHOLD:
            status = "insufficient_data"
            status_label = "Insufficient Data"
            status_color = "slate"
        elif accuracy >= MASTERY_ACCURACY_THRESHOLD:
            status = "mastered"
            status_label = "Mastered"
            status_color = "emerald"
        elif accuracy >= GAP_ACCURACY_THRESHOLD:
            status = "developing"
            status_label = "Developing"
            status_color = "amber"
        else:
            status = "needs_review"
            status_label = "Needs Improvement"
            status_color = "rose"

        detail = TopicCompetencyDetail(
            subject_code=subj,
            topic=top,
            total_questions=total_q,
            attempted_count=data["attempted_count"],
            correct_count=correct_q,
            incorrect_count=data["incorrect_count"],
            unanswered_count=data["unanswered_count"],
            accuracy_percentage=accuracy,
            status=status,
            status_label=status_label,
            attempts_count=attempts_cnt,
            status_color=status_color
        )

        all_details.append(detail)
        if status == "mastered":
            strengths.append(detail)
        elif status == "needs_review":
            gaps.append(detail)
        elif status == "developing":
            developing.append(detail)
        else:
            insufficient.append(detail)

    # Sort strengths descending by accuracy, gaps ascending by accuracy
    strengths.sort(key=lambda x: x.accuracy_percentage, reverse=True)
    gaps.sort(key=lambda x: x.accuracy_percentage)
    developing.sort(key=lambda x: x.accuracy_percentage)
    insufficient.sort(key=lambda x: x.total_questions, reverse=True)

    # All topics sorted: gaps first, then developing, then insufficient, then strengths
    all_details.sort(
        key=lambda x: (
            0 if x.status == "needs_review" else
            1 if x.status == "developing" else
            2 if x.status == "insufficient_data" else 3,
            x.accuracy_percentage
        )
    )

    total_evaluated_q = sum(d.total_questions for d in all_details)
    total_correct_q = sum(d.correct_count for d in all_details)
    overall_accuracy = round((total_correct_q / total_evaluated_q) * 100.0, 1) if total_evaluated_q > 0 else 0.0

    # 5. Persist calculated competency results to SQLite database
    try:
        now_utc = datetime.now(timezone.utc)
        for detail in all_details:
            existing = (
                db.query(CompetencyResult)
                .filter(
                    CompetencyResult.user_id == user_id,
                    CompetencyResult.subject_code == detail.subject_code,
                    CompetencyResult.topic == detail.topic
                )
                .first()
            )
            if existing:
                existing.mastery_score = detail.accuracy_percentage
                existing.status = detail.status
                existing.total_questions_evaluated = detail.total_questions
                existing.correct_questions_evaluated = detail.correct_count
                existing.evaluated_at = now_utc
            else:
                db.add(CompetencyResult(
                    user_id=user_id,
                    subject_code=detail.subject_code,
                    topic=detail.topic,
                    mastery_score=detail.accuracy_percentage,
                    status=detail.status,
                    total_questions_evaluated=detail.total_questions,
                    correct_questions_evaluated=detail.correct_count,
                    evaluated_at=now_utc
                ))
        db.commit()
    except Exception:
        db.rollback()

    return CompetencyAnalysisResponse(
        user_id=user_id,
        has_data=True,
        total_quizzes_taken=len(completed_attempts),
        total_questions_evaluated=total_evaluated_q,
        total_correct_answers=total_correct_q,
        overall_accuracy_percentage=overall_accuracy,
        gap_threshold_percentage=GAP_ACCURACY_THRESHOLD,
        min_questions_threshold=MIN_QUESTIONS_THRESHOLD,
        methodology_explanation=methodology,
        strengths=strengths,
        gaps=gaps,
        developing=developing,
        insufficient_data_topics=insufficient,
        all_topics=all_details
    )


def find_matching_learning_material(db: Session, subject_code: str, topic: str, user_id: Optional[str] = None) -> Optional[LearningMaterial]:
    """
    Deterministically matches a topic to existing uploaded learning materials in the database:
    1. Filters by user_id to ensure user-only private material matching
    2. Exact or partial topic name match in material title
    3. Topic name match in material description
    4. Keyword match inside extracted text content
    5. Fallback to same subject_code
    """
    query = db.query(LearningMaterial)
    if user_id:
        if user_id in ("student_default", "1"):
            query = query.filter((LearningMaterial.user_id == user_id) | (LearningMaterial.user_id == "student_default"))
        else:
            query = query.filter(LearningMaterial.user_id == user_id)

    materials = query.all()
    if not materials:
        return None

    clean_topic = topic.lower().strip()
    topic_keywords = [w for w in clean_topic.split() if len(w) > 3]

    best_match = None
    best_score = 0

    for mat in materials:
        score = 0
        mat_title = (mat.title or "").lower()
        mat_desc = (mat.description or "").lower()
        mat_text = (mat.extracted_text or "").lower()
        mat_subj = (mat.subject_code or "").lower()

        # Subject code alignment bonus
        if mat_subj == subject_code.lower():
            score += 20

        # Exact topic in title
        if clean_topic in mat_title:
            score += 100
        # Keywords in title
        for kw in topic_keywords:
            if kw in mat_title:
                score += 35

        # Exact topic in description
        if clean_topic in mat_desc:
            score += 40

        # Topic occurrence in extracted text
        if clean_topic in mat_text:
            score += 30
        else:
            for kw in topic_keywords:
                if kw in mat_text:
                    score += 10
                    break

        if score > best_score and score >= 20:
            best_score = score
            best_match = mat

    return best_match


def generate_recommendations(db: Session, user_id: str = "student_default") -> RecommendationsResponse:
    """
    Generates actionable, explainable personalized learning recommendations
    strictly tied to identified competency gaps from the learner's actual quiz attempts.
    """
    analysis = calculate_competencies(db, user_id=user_id)

    if not analysis.has_data:
        return RecommendationsResponse(
            user_id=user_id,
            has_gaps=False,
            total_recommendations=0,
            summary_message="No quiz attempts found. Complete at least one quiz to receive personalized recommendations based on your performance.",
            recommendations=[]
        )

    recommendations_list: List[LearningRecommendationItem] = []

    # Priority 1: High-priority recommendations for identified gaps (< 50% accuracy)
    # Priority 2: Developing topics (50% to 65% accuracy)
    target_topics: List[TopicCompetencyDetail] = []
    target_topics.extend(analysis.gaps)
    # Include developing topics below 65% as lower priority
    for dev in analysis.developing:
        if dev.accuracy_percentage < 65.0:
            target_topics.append(dev)

    if not target_topics and not analysis.insufficient_data_topics:
        # All topics mastered!
        summary = (
            f"Outstanding performance! All {len(analysis.strengths)} evaluated topics demonstrate strong competency (≥ 75% accuracy). "
            f"Review advanced topics or explore new course modules to continue building expertise."
        )
        return RecommendationsResponse(
            user_id=user_id,
            has_gaps=False,
            total_recommendations=0,
            summary_message=summary,
            recommendations=[]
        )

    # For each weak topic, generate a deterministic explainable recommendation
    now_utc = datetime.now(timezone.utc)

    for topic_detail in target_topics:
        mat = find_matching_learning_material(db, topic_detail.subject_code, topic_detail.topic, user_id=user_id)
        has_mat = mat is not None

        # Priority calculation
        if topic_detail.accuracy_percentage < 35.0:
            priority = "high"
        elif topic_detail.accuracy_percentage < 50.0:
            priority = "medium"
        else:
            priority = "low"

        if has_mat:
            action_step = (
                f"Review '{mat.title}' ({mat.file_type.upper()}) in your Material Library, "
                f"focusing on {topic_detail.topic}, then attempt a 5-question targeted quiz."
            )
            desc = (
                f"Competency Gap: {topic_detail.topic} scored {topic_detail.accuracy_percentage}% accuracy "
                f"({topic_detail.correct_count}/{topic_detail.total_questions} correct). "
                f"Relevant notes '{mat.title}' are available in your library."
            )
        else:
            action_step = (
                f"No matching study material found in your library for '{topic_detail.topic}'. "
                f"Upload lecture notes or syllabus slides for {topic_detail.subject_code} to generate targeted assessments."
            )
            desc = (
                f"Competency Gap: {topic_detail.topic} scored {topic_detail.accuracy_percentage}% accuracy "
                f"({topic_detail.correct_count}/{topic_detail.total_questions} correct). "
                f"Please upload relevant study material to unlock targeted revision."
            )

        rec_item = LearningRecommendationItem(
            subject_code=topic_detail.subject_code,
            topic=topic_detail.topic,
            priority=priority,
            recommendation_type="revision" if has_mat else "reading",
            title=f"Reinforce {topic_detail.topic} ({topic_detail.subject_code})",
            description=desc,
            action_step=action_step,
            has_matching_material=has_mat,
            matched_material_id=mat.id if mat else None,
            matched_material_title=mat.title if mat else None,
            matched_material_type=mat.file_type.upper() if mat else None,
            competency_accuracy=topic_detail.accuracy_percentage,
            is_completed=False
        )
        recommendations_list.append(rec_item)

        # Sync into personalized_recommendations table
        try:
            existing_rec = (
                db.query(PersonalizedRecommendation)
                .filter(
                    PersonalizedRecommendation.user_id == user_id,
                    PersonalizedRecommendation.subject_code == topic_detail.subject_code,
                    PersonalizedRecommendation.topic == topic_detail.topic
                )
                .first()
            )
            if existing_rec:
                existing_rec.title = rec_item.title
                existing_rec.description = rec_item.description
                existing_rec.priority = rec_item.priority
                existing_rec.recommendation_type = rec_item.recommendation_type
            else:
                db.add(PersonalizedRecommendation(
                    user_id=user_id,
                    subject_code=topic_detail.subject_code,
                    topic=topic_detail.topic,
                    recommendation_type=rec_item.recommendation_type,
                    title=rec_item.title,
                    description=rec_item.description,
                    priority=rec_item.priority,
                    is_completed=False,
                    created_at=now_utc
                ))
            db.commit()
        except Exception:
            db.rollback()

    # Informative message
    gaps_count = len(analysis.gaps)
    if gaps_count > 0:
        summary_msg = f"Identified {gaps_count} competency gap(s) based on your quiz responses. Targeted review recommendations are listed below."
    elif target_topics:
        summary_msg = f"No critical gaps found, but {len(target_topics)} topic(s) could benefit from reinforced practice to achieve full mastery."
    else:
        summary_msg = "Complete more quizzes to identify specific topic competency gaps."

    return RecommendationsResponse(
        user_id=user_id,
        has_gaps=len(analysis.gaps) > 0,
        total_recommendations=len(recommendations_list),
        summary_message=summary_msg,
        recommendations=recommendations_list
    )
