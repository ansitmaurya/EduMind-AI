from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class LearningMaterialBase(BaseModel):
    title: str = Field(description="Document title or display name")
    description: Optional[str] = Field(default=None, description="Optional description of material")
    subject_code: str = Field(default="GEN101", description="Associated subject code (e.g. CS301)")
    file_name: Optional[str] = Field(default=None, description="Original uploaded filename")
    file_type: Optional[str] = Field(default=None, description="Normalized file extension (pdf, docx, txt)")
    file_size_bytes: Optional[int] = Field(default=None, description="Size in bytes")


class LearningMaterialCreate(LearningMaterialBase):
    extracted_text: Optional[str] = None


class LearningMaterialResponse(LearningMaterialBase):
    id: int
    extracted_char_count: int = 0
    status: str = Field(description="'ready', 'failed', or 'empty_text'")
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class LearningMaterialDetailResponse(LearningMaterialResponse):
    extracted_text: Optional[str] = Field(default=None, description="Full or truncated preview text")


class LearningMaterialContentResponse(BaseModel):
    id: int
    title: str
    file_name: Optional[str] = None
    file_type: Optional[str] = None
    extracted_char_count: int
    status: str
    extracted_text: str

    model_config = ConfigDict(from_attributes=True)


class MaterialDeleteResponse(BaseModel):
    id: int
    message: str
    success: bool
