from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class LearningMaterialBase(BaseModel):
    title: str
    description: Optional[str] = None
    subject_code: str
    file_name: Optional[str] = None
    file_type: Optional[str] = None
    file_size_bytes: Optional[int] = None


class LearningMaterialCreate(LearningMaterialBase):
    extracted_text: Optional[str] = None


class LearningMaterialResponse(LearningMaterialBase):
    id: int
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
