from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from backend.app.config import settings
from backend.app.database import get_db
from backend.app.models.material import LearningMaterial
from backend.app.schemas.material import (
    LearningMaterialResponse,
    LearningMaterialDetailResponse,
    LearningMaterialContentResponse,
    MaterialDeleteResponse
)
from backend.app.services.document_processor import (
    process_uploaded_document,
    DocumentProcessingError
)

router = APIRouter(prefix="/materials", tags=["Learning Materials"])


@router.post(
    "/upload",
    response_model=LearningMaterialDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload learning material and extract text"
)
async def upload_material(
    file: UploadFile = File(..., description="Document file (.pdf, .docx, or .txt)"),
    title: Optional[str] = Form(None, description="Custom document title (defaults to filename)"),
    subject_code: str = Form("GEN101", description="Associated subject code (e.g. CS301)"),
    description: Optional[str] = Form(None, description="Optional description"),
    db: Session = Depends(get_db)
):
    """
    Accepts multipart/form-data document upload (.pdf, .docx, .txt),
    validates content signature, safely persists file on disk,
    extracts document text, and persists metadata in database.
    """
    if not file or not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file was provided for upload."
        )

    # Read uploaded file content into memory for validation & processing
    try:
        content_bytes = await file.read()
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to read uploaded file stream: {str(exc)}"
        )

    # Validate and process the document
    try:
        result = process_uploaded_document(
            filename=file.filename,
            content_bytes=content_bytes
        )
    except DocumentProcessingError as dpe:
        raise HTTPException(
            status_code=dpe.status_code,
            detail=dpe.message
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred during document processing: {str(exc)}"
        )

    # Derive display title if not explicitly provided
    display_title = title.strip() if title and title.strip() else Path(file.filename).stem

    # Persist in SQLite database
    material = LearningMaterial(
        title=display_title,
        description=description.strip() if description and description.strip() else None,
        subject_code=subject_code.strip() if subject_code and subject_code.strip() else "GEN101",
        file_name=Path(file.filename).name,  # Clean sanitized original filename
        file_type=result.file_type,
        file_size_bytes=result.file_size_bytes,
        storage_path=result.storage_path,
        extracted_text=result.extracted_text,
        extracted_char_count=result.extracted_char_count,
        status=result.status,
        error_message=result.error_message
    )

    try:
        db.add(material)
        db.commit()
        db.refresh(material)
    except Exception as exc:
        db.rollback()
        # Clean up stored disk file on database failure
        try:
            full_disk_path = settings.BASE_DIR / result.storage_path
            if full_disk_path.exists():
                full_disk_path.unlink()
        except Exception:
            pass
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database persistence failed: {str(exc)}"
        )

    return material


@router.get(
    "",
    response_model=List[LearningMaterialResponse],
    summary="List all uploaded learning materials"
)
def list_materials(
    subject_code: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Returns a list of saved document metadata, sorted with latest uploads first.
    """
    query = db.query(LearningMaterial)
    if subject_code:
        query = query.filter(LearningMaterial.subject_code == subject_code)
    materials = query.order_by(LearningMaterial.created_at.desc()).all()
    return materials


@router.get(
    "/{material_id}",
    response_model=LearningMaterialDetailResponse,
    summary="Get learning material details by ID"
)
def get_material(
    material_id: int,
    db: Session = Depends(get_db)
):
    """
    Returns metadata and details for a specific document ID.
    """
    material = db.query(LearningMaterial).filter(LearningMaterial.id == material_id).first()
    if not material:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Learning material with ID {material_id} was not found."
        )
    return material


@router.get(
    "/{material_id}/content",
    response_model=LearningMaterialContentResponse,
    summary="Get extracted text content of learning material"
)
def get_material_content(
    material_id: int,
    db: Session = Depends(get_db)
):
    """
    Returns full extracted text content for a document ID.
    """
    material = db.query(LearningMaterial).filter(LearningMaterial.id == material_id).first()
    if not material:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Learning material with ID {material_id} was not found."
        )

    return LearningMaterialContentResponse(
        id=material.id,
        title=material.title,
        file_name=material.file_name,
        file_type=material.file_type,
        extracted_char_count=material.extracted_char_count,
        status=material.status,
        extracted_text=material.extracted_text or ""
    )


@router.delete(
    "/{material_id}",
    response_model=MaterialDeleteResponse,
    summary="Delete a learning material and associated storage"
)
def delete_material(
    material_id: int,
    db: Session = Depends(get_db)
):
    """
    Safely deletes learning material metadata and removes stored physical file from disk.
    """
    material = db.query(LearningMaterial).filter(LearningMaterial.id == material_id).first()
    if not material:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Learning material with ID {material_id} was not found."
        )

    # Safely remove physical file from disk
    if material.storage_path:
        try:
            full_disk_path = settings.BASE_DIR / material.storage_path
            # Verify file is strictly inside UPLOAD_DIR before deleting
            if full_disk_path.resolve().is_relative_to(settings.UPLOAD_DIR.resolve()) and full_disk_path.exists():
                full_disk_path.unlink()
        except Exception:
            # Continue with database deletion even if disk removal logs warning
            pass

    try:
        db.delete(material)
        db.commit()
    except Exception as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete material record: {str(exc)}"
        )

    return MaterialDeleteResponse(
        id=material_id,
        message=f"Document '{material.title}' was successfully deleted.",
        success=True
    )
