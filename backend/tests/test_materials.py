import io
import pytest
from fastapi.testclient import TestClient
from reportlab.pdfgen import canvas
import docx

from backend.main import app
from backend.app.database import init_db


@pytest.fixture(scope="session", autouse=True)
def setup_db():
    init_db()


@pytest.fixture
def client():
    with TestClient(app) as c:
        res = c.post("/api/auth/login", json={"email": "alex@example.com", "password": "student123"})
        if res.status_code == 200:
            token = res.json()["access_token"]
            c.headers["Authorization"] = f"Bearer {token}"
        yield c


def create_sample_pdf(text: str = "Hello from EduMind AI PDF") -> bytes:
    """Generates a valid binary PDF with an extractable text stream."""
    buf = io.BytesIO()
    c = canvas.Canvas(buf)
    c.drawString(72, 720, text)
    c.save()
    return buf.getvalue()


def create_sample_docx(text: str = "Hello from EduMind AI DOCX") -> bytes:
    """Generates a valid binary DOCX archive with paragraphs."""
    doc = docx.Document()
    doc.add_paragraph(text)
    buf = io.BytesIO()
    doc.save(buf)
    return buf.getvalue()


def test_upload_pdf_success(client):
    """Verify uploading a valid text-based PDF extracts text and persists metadata."""
    pdf_bytes = create_sample_pdf("EduMind AI Data Structures Unit 1 Overview")
    response = client.post(
        "/api/materials/upload",
        files={"file": ("ds_unit1.pdf", pdf_bytes, "application/pdf")},
        data={"title": "Data Structures Unit 1", "subject_code": "CS301"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Data Structures Unit 1"
    assert data["subject_code"] == "CS301"
    assert data["file_type"] == "pdf"
    assert data["status"] == "ready"
    assert "Data Structures Unit 1 Overview" in data["extracted_text"]
    assert data["extracted_char_count"] > 0


def test_upload_docx_success(client):
    """Verify uploading a valid DOCX extracts text and persists metadata."""
    docx_bytes = create_sample_docx("Database Normalization and Functional Dependencies")
    response = client.post(
        "/api/materials/upload",
        files={"file": ("dbms_notes.docx", docx_bytes, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")},
        data={"title": "DBMS Normalization Notes", "subject_code": "CS303"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "DBMS Normalization Notes"
    assert data["file_type"] == "docx"
    assert data["status"] == "ready"
    assert "Database Normalization" in data["extracted_text"]
    assert data["extracted_char_count"] > 0


def test_upload_txt_success(client):
    """Verify uploading a plain text file extracts content correctly."""
    txt_bytes = "Operating Systems: Process Synchronization and Deadlocks".encode("utf-8")
    response = client.post(
        "/api/materials/upload",
        files={"file": ("os_summary.txt", txt_bytes, "text/plain")},
        data={"title": "OS Process Sync", "subject_code": "CS302"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["file_type"] == "txt"
    assert data["status"] == "ready"
    assert "Process Synchronization" in data["extracted_text"]


def test_reject_unsupported_file_extension(client):
    """Verify that unsupported file extensions are rejected with 400 Bad Request."""
    fake_exe = b"MZ\x90\x00\x03\x00\x00\x00"
    response = client.post(
        "/api/materials/upload",
        files={"file": ("malware.exe", fake_exe, "application/x-msdownload")}
    )
    assert response.status_code == 400
    assert "Unsupported file type" in response.json()["detail"]


def test_reject_empty_file(client):
    """Verify that an empty 0-byte file is rejected with 400 Bad Request."""
    response = client.post(
        "/api/materials/upload",
        files={"file": ("empty.pdf", b"", "application/pdf")}
    )
    assert response.status_code == 400
    assert "empty" in response.json()["detail"].lower()


def test_reject_oversized_file(client):
    """Verify that a file exceeding 10MB is rejected with 413 Payload Too Large."""
    # 10MB + 1KB
    oversized_bytes = b" " * (10 * 1024 * 1024 + 1024)
    response = client.post(
        "/api/materials/upload",
        files={"file": ("large.txt", oversized_bytes, "text/plain")}
    )
    assert response.status_code == 413
    assert "exceeds" in response.json()["detail"].lower()


def test_reject_corrupted_signature_pdf(client):
    """Verify that a file with .pdf extension but invalid header signature is rejected."""
    fake_pdf = b"This is plain text pretending to be a PDF"
    response = client.post(
        "/api/materials/upload",
        files={"file": ("fake.pdf", fake_pdf, "application/pdf")}
    )
    assert response.status_code == 400
    assert "Invalid PDF" in response.json()["detail"]


def test_list_materials(client):
    """Verify GET /api/materials returns list of persisted materials."""
    response = client.get("/api/materials")
    assert response.status_code == 200
    materials = response.json()
    assert isinstance(materials, list)
    assert len(materials) >= 1


def test_get_material_detail_and_content(client):
    """Verify GET /api/materials/{id} and /api/materials/{id}/content endpoints."""
    # First upload a test file
    txt_content = "Computer Networks: TCP vs UDP Differences"
    upload_res = client.post(
        "/api/materials/upload",
        files={"file": ("networks.txt", txt_content.encode("utf-8"), "text/plain")},
        data={"title": "Networking Protocols", "subject_code": "CS304"}
    )
    material_id = upload_res.json()["id"]

    # Test GET /api/materials/{id}
    detail_res = client.get(f"/api/materials/{material_id}")
    assert detail_res.status_code == 200
    assert detail_res.json()["title"] == "Networking Protocols"

    # Test GET /api/materials/{id}/content
    content_res = client.get(f"/api/materials/{material_id}/content")
    assert content_res.status_code == 200
    assert content_res.json()["extracted_text"] == txt_content


def test_get_nonexistent_material_returns_404(client):
    """Verify that accessing a non-existent document ID returns 404."""
    response = client.get("/api/materials/99999999")
    assert response.status_code == 404


def test_delete_material(client):
    """Verify DELETE /api/materials/{id} removes the document safely."""
    # Upload temporary document
    upload_res = client.post(
        "/api/materials/upload",
        files={"file": ("to_delete.txt", b"Temporary Delete Content", "text/plain")},
        data={"title": "To Delete", "subject_code": "GEN101"}
    )
    material_id = upload_res.json()["id"]

    # Delete it
    del_res = client.delete(f"/api/materials/{material_id}")
    assert del_res.status_code == 200
    assert del_res.json()["success"] is True

    # Subsequent GET should return 404
    get_res = client.get(f"/api/materials/{material_id}")
    assert get_res.status_code == 404
