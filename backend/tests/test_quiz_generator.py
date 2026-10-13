import pytest
from fastapi.testclient import TestClient

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


@pytest.fixture
def sample_document_id(client):
    """Uploads a rich study document for quiz testing."""
    rich_text = (
        "Data Structures and Algorithms Study Guide. "
        "A Binary Search Tree is a node-based binary tree data structure where each node has at most two children. "
        "The left subtree of a node contains only nodes with keys lesser than the node's key. "
        "The right subtree of a node contains only nodes with keys greater than the node's key. "
        "A Stack follows the Last-In First-Out principle where elements are inserted and removed from the top. "
        "A Queue operates on the First-In First-Out principle where insertion happens at the rear and deletion at the front. "
        "Quick Sort is an efficient divide-and-conquer sorting algorithm with an average time complexity of O(n log n). "
        "A Linked List stores elements in dynamically allocated nodes connected via pointer references."
    )
    res = client.post(
        "/api/materials/upload",
        files={"file": ("dsa_guide.txt", rich_text.encode("utf-8"), "text/plain")},
        data={"title": "DSA Core Concepts", "subject_code": "CS301"}
    )
    assert res.status_code == 201
    return res.json()["id"]


def test_generate_quiz_success(client, sample_document_id):
    """Verify generating a quiz from an uploaded document returns 201 with valid questions."""
    payload = {
        "material_id": sample_document_id,
        "title": "DSA Tree & Stack Quiz",
        "topic": "Binary Search Trees",
        "num_questions": 5,
        "difficulty": "Medium"
    }
    response = client.post("/api/quizzes/generate", json=payload)
    assert response.status_code == 201
    data = response.json()

    assert data["title"] == "DSA Tree & Stack Quiz"
    assert data["material_id"] == sample_document_id
    assert data["total_questions"] == 5
    assert data["generation_mode"] in ("ai", "fallback")
    assert len(data["questions"]) == 5

    # Verify question structures
    for q in data["questions"]:
        assert len(q["question_text"]) > 10
        assert len(q["options"]) == 4
        # Options must be distinct
        assert len(set(opt.lower() for opt in q["options"])) == 4
        assert q["correct_index"] in (0, 1, 2, 3)
        assert q["explanation"] is not None
        assert len(q["explanation"]) > 0


def test_generate_quiz_nonexistent_document(client):
    """Verify that generating a quiz from a non-existent document ID returns 404."""
    payload = {
        "material_id": 99999999,
        "title": "Invalid Doc Quiz",
        "num_questions": 5,
        "difficulty": "Easy"
    }
    response = client.post("/api/quizzes/generate", json=payload)
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_generate_quiz_insufficient_text(client):
    """Verify that attempting quiz generation on a document with < 100 characters is rejected with 400."""
    # Upload document with very short text (< 50 chars)
    short_text = "Brief intro notes."
    upload_res = client.post(
        "/api/materials/upload",
        files={"file": ("tiny.txt", short_text.encode("utf-8"), "text/plain")},
        data={"title": "Tiny Note", "subject_code": "CS301"}
    )
    tiny_id = upload_res.json()["id"]

    payload = {
        "material_id": tiny_id,
        "num_questions": 5,
        "difficulty": "Easy"
    }
    response = client.post("/api/quizzes/generate", json=payload)
    assert response.status_code == 400
    assert "insufficient text" in response.json()["detail"].lower()


def test_list_quizzes(client, sample_document_id):
    """Verify GET /api/quizzes lists generated quizzes."""
    # Generate a quiz first
    client.post("/api/quizzes/generate", json={
        "material_id": sample_document_id,
        "title": "Listing Test Quiz",
        "num_questions": 5,
        "difficulty": "Easy"
    })

    response = client.get("/api/quizzes")
    assert response.status_code == 200
    quizzes = response.json()
    assert isinstance(quizzes, list)
    assert len(quizzes) >= 1
    # Check schema fields
    first = quizzes[0]
    assert "id" in first
    assert "title" in first
    assert "total_questions" in first
    assert "generation_mode" in first


def test_get_quiz_by_id_and_verify_questions(client, sample_document_id):
    """Verify GET /api/quizzes/{id} returns full question structures."""
    gen_res = client.post("/api/quizzes/generate", json={
        "material_id": sample_document_id,
        "title": "Specific ID Quiz",
        "num_questions": 5,
        "difficulty": "Hard"
    })
    quiz_id = gen_res.json()["id"]

    response = client.get(f"/api/quizzes/{quiz_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == quiz_id
    assert data["title"] == "Specific ID Quiz"
    assert len(data["questions"]) == 5
    for q in data["questions"]:
        assert len(q["options"]) == 4
        assert 0 <= q["correct_index"] <= 3


def test_get_nonexistent_quiz_returns_404(client):
    """Verify that requesting an invalid quiz ID returns 404."""
    response = client.get("/api/quizzes/9999999")
    assert response.status_code == 404
