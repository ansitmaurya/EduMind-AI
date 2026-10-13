from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.orm import relationship
from backend.app.database import Base


class LearningMaterial(Base):
    __tablename__ = "learning_materials"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String(100), default="student_default", nullable=False, index=True)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    subject_code = Column(String(50), nullable=False, index=True)
    file_name = Column(String(255), nullable=True)
    file_type = Column(String(50), nullable=True)  # 'pdf', 'docx', 'txt'
    file_size_bytes = Column(Integer, nullable=True)
    storage_path = Column(String(500), nullable=True)
    extracted_text = Column(Text, nullable=True)
    extracted_char_count = Column(Integer, default=0, nullable=False)
    status = Column(String(50), default="ready", nullable=False)  # 'ready', 'failed', 'empty_text'
    error_message = Column(Text, nullable=True)
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

    # Relationship to quizzes generated from this material
    quizzes = relationship(
        "Quiz",
        back_populates="material",
        cascade="all, delete-orphan"
    )
