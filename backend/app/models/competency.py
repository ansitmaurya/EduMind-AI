from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime
from backend.app.database import Base


class CompetencyResult(Base):
    __tablename__ = "competency_results"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String(100), default="student_default", nullable=False, index=True)
    subject_code = Column(String(50), nullable=False, index=True)
    topic = Column(String(255), nullable=False, index=True)
    mastery_score = Column(Float, default=0.0, nullable=False)  # 0.0 to 100.0
    status = Column(String(50), default="developing", nullable=False)  # 'needs_review', 'developing', 'proficient', 'mastered'
    total_questions_evaluated = Column(Integer, default=0, nullable=False)
    correct_questions_evaluated = Column(Integer, default=0, nullable=False)
    evaluated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )


class PersonalizedRecommendation(Base):
    __tablename__ = "personalized_recommendations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String(100), default="student_default", nullable=False, index=True)
    subject_code = Column(String(50), nullable=False, index=True)
    topic = Column(String(255), nullable=False, index=True)
    recommendation_type = Column(String(50), default="revision", nullable=False)  # 'revision', 'practice', 'reading'
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    priority = Column(String(20), default="medium", nullable=False)  # 'high', 'medium', 'low'
    is_completed = Column(Boolean, default=False, nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
