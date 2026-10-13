from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from backend.app.database import Base


class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String(100), default="student_default", nullable=False, index=True)
    material_id = Column(Integer, ForeignKey("learning_materials.id", ondelete="SET NULL"), nullable=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    subject_code = Column(String(50), nullable=False, index=True)
    topic = Column(String(255), nullable=False, index=True)
    difficulty = Column(String(50), default="Intermediate", nullable=False)  # 'Beginner', 'Intermediate', 'Advanced'
    time_limit_seconds = Column(Integer, default=600, nullable=False)
    total_questions = Column(Integer, default=0, nullable=False)
    generation_mode = Column(String(50), default="fallback", nullable=False)  # 'ai' or 'fallback'
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relationships
    material = relationship("LearningMaterial", back_populates="quizzes")
    questions = relationship(
        "QuizQuestion",
        back_populates="quiz",
        cascade="all, delete-orphan",
        order_by="QuizQuestion.order_num"
    )
    attempts = relationship(
        "QuizAttempt",
        back_populates="quiz",
        cascade="all, delete-orphan"
    )


class QuizQuestion(Base):
    __tablename__ = "quiz_questions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False, index=True)
    question_text = Column(Text, nullable=False)
    options = Column(JSON, nullable=False)  # List of string options e.g. ["Queue", "Stack", "Tree", "Graph"]
    correct_index = Column(Integer, nullable=False)  # 0-indexed integer pointer
    explanation = Column(Text, nullable=True)
    topic_tag = Column(String(100), nullable=True, index=True)
    difficulty = Column(String(50), default="Intermediate", nullable=False)
    order_num = Column(Integer, default=1, nullable=False)

    # Relationships
    quiz = relationship("Quiz", back_populates="questions")
    learner_responses = relationship(
        "LearnerResponse",
        back_populates="question",
        cascade="all, delete-orphan"
    )
