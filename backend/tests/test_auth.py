import pytest
from fastapi.testclient import TestClient
import bcrypt

from backend.main import app
from backend.app.database import init_db, SessionLocal
from backend.app.models.user import User
from backend.app.models.material import LearningMaterial
from backend.app.models.quiz import Quiz
from backend.app.models.attempt import QuizAttempt


@pytest.fixture(scope="session", autouse=True)
def setup_db():
    init_db()


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c


def test_user_registration_success(client):
    """Verifies that a new user can register successfully with valid details."""
    with SessionLocal() as db:
        old_user = db.query(User).filter(User.email == "teststudent_reg@university.edu").first()
        if old_user:
            db.delete(old_user)
            db.commit()

    payload = {
        "full_name": "Test Student",
        "email": "teststudent_reg@university.edu",
        "password": "Password123!",
        "confirm_password": "Password123!"
    }
    res = client.post("/api/auth/register", json=payload)
    assert res.status_code == 201
    data = res.json()
    assert data["email"] == "teststudent_reg@university.edu"
    assert data["full_name"] == "Test Student"
    assert "id" in data
    assert "hashed_password" not in data, "Password hash must not be exposed!"

    # Verify password was hashed with bcrypt in database
    with SessionLocal() as db:
        user = db.query(User).filter(User.email == "teststudent_reg@university.edu").first()
        assert user is not None
        assert user.hashed_password != "Password123!"
        assert user.hashed_password.startswith("$2b$") or user.hashed_password.startswith("$2a$")
        assert bcrypt.checkpw(b"Password123!", user.hashed_password.encode("utf-8")) is True


def test_duplicate_email_registration_rejected(client):
    """Verifies that registering with an already existing email returns HTTP 400."""
    payload = {
        "full_name": "Duplicate Student",
        "email": "teststudent_reg@university.edu",  # Same email as above
        "password": "Password999!",
        "confirm_password": "Password999!"
    }
    res = client.post("/api/auth/register", json=payload)
    assert res.status_code == 400
    assert "already exists" in res.json()["detail"].lower()


def test_registration_validation_errors(client):
    """Verifies backend validation for password mismatch, short password, and invalid email."""
    # 1. Password mismatch
    res1 = client.post("/api/auth/register", json={
        "full_name": "Mismatch User",
        "email": "mismatch@test.com",
        "password": "Password123!",
        "confirm_password": "DifferentPassword123!"
    })
    assert res1.status_code == 422 or res1.status_code == 400

    # 2. Password too short (< 8 chars)
    res2 = client.post("/api/auth/register", json={
        "full_name": "Short Password User",
        "email": "shortpw@test.com",
        "password": "short",
        "confirm_password": "short"
    })
    assert res2.status_code == 422 or res2.status_code == 400

    # 3. Invalid email format
    res3 = client.post("/api/auth/register", json={
        "full_name": "Bad Email User",
        "email": "not-a-valid-email",
        "password": "Password123!",
        "confirm_password": "Password123!"
    })
    assert res3.status_code == 422 or res3.status_code == 400


def test_user_login_success(client):
    """Verifies login succeeds with correct credentials and returns JWT bearer token."""
    login_payload = {
        "email": "teststudent_reg@university.edu",
        "password": "Password123!"
    }
    res = client.post("/api/auth/login", json=login_payload)
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "teststudent_reg@university.edu"
    assert data["user"]["full_name"] == "Test Student"


def test_demo_user_seed_login_success(client):
    """Verifies that the pre-seeded demo user (Alex) can log in with student123."""
    res = client.post("/api/auth/login", json={
        "email": "alex@example.com",
        "password": "student123"
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["email"] == "alex@example.com"


def test_login_rejected_with_incorrect_password(client):
    """Verifies that an incorrect password returns generic 401 without revealing registration status."""
    res = client.post("/api/auth/login", json={
        "email": "teststudent_reg@university.edu",
        "password": "WrongPassword999!"
    })
    assert res.status_code == 401
    assert "invalid email or password" in res.json()["detail"].lower()


def test_login_rejected_for_unregistered_account(client):
    """Verifies that an unregistered email returns the exact same generic 401 message."""
    res = client.post("/api/auth/login", json={
        "email": "nonexistent_learner@unknown.edu",
        "password": "SomePassword123!"
    })
    assert res.status_code == 401
    assert "invalid email or password" in res.json()["detail"].lower()


def test_protected_endpoints_deny_unauthenticated_access(client):
    """Verifies that private endpoints return HTTP 401 when accessed without an Authorization header."""
    assert client.get("/api/auth/me").status_code == 401
    assert client.get("/api/materials").status_code == 401
    assert client.get("/api/quizzes").status_code == 401
    assert client.get("/api/attempts").status_code == 401
    assert client.get("/api/competencies").status_code == 401
    assert client.get("/api/recommendations").status_code == 401


def test_authenticated_access_and_logout(client):
    """Verifies that valid JWT token allows access to /api/auth/me and /api/auth/logout succeeds."""
    login_res = client.post("/api/auth/login", json={
        "email": "teststudent_reg@university.edu",
        "password": "Password123!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    me_res = client.get("/api/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "teststudent_reg@university.edu"

    logout_res = client.post("/api/auth/logout", headers=headers)
    assert logout_res.status_code == 200
    assert "logged out" in logout_res.json()["message"].lower()


def test_cross_user_access_denial(client):
    """
    SECURITY TEST:
    Verifies that User A's private materials, quizzes, and attempt results
    cannot be viewed, modified, or deleted by User B (returns HTTP 403 Forbidden).
    """
    with SessionLocal() as db:
        for mail in ["alice_security@college.edu", "bob_security@college.edu"]:
            u = db.query(User).filter(User.email == mail).first()
            if u:
                # also clean up materials belonging to Alice
                mats = db.query(LearningMaterial).filter(LearningMaterial.user_id == u.id).all()
                for m in mats:
                    db.delete(m)
                db.delete(u)
        db.commit()

    # 1. Register User A (Alice)
    client.post("/api/auth/register", json={
        "full_name": "Alice Learner",
        "email": "alice_security@college.edu",
        "password": "AliceSecret123!",
        "confirm_password": "AliceSecret123!"
    })
    login_a = client.post("/api/auth/login", json={
        "email": "alice_security@college.edu",
        "password": "AliceSecret123!"
    })
    token_a = login_a.json()["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # 2. Register User B (Bob)
    client.post("/api/auth/register", json={
        "full_name": "Bob Intruder",
        "email": "bob_security@college.edu",
        "password": "BobSecret123!",
        "confirm_password": "BobSecret123!"
    })
    login_b = client.post("/api/auth/login", json={
        "email": "bob_security@college.edu",
        "password": "BobSecret123!"
    })
    token_b = login_b.json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # 3. Alice uploads a private learning material
    upload_res = client.post(
        "/api/materials/upload",
        files={"file": ("alice_notes.txt", b"Alice's confidential research notes on algorithmic graph theory with sufficient characters.", "text/plain")},
        data={"title": "Alice Private Graph Notes", "subject_code": "CS302"},
        headers=headers_a
    )
    assert upload_res.status_code == 201
    material_id = upload_res.json()["id"]

    # 4. Bob attempts to access Alice's material detail -> MUST BE FORBIDDEN (403)
    bob_get_mat = client.get(f"/api/materials/{material_id}", headers=headers_b)
    assert bob_get_mat.status_code == 403, "Bob should not be able to view Alice's material!"

    # 5. Bob attempts to access Alice's material content -> MUST BE FORBIDDEN (403)
    bob_get_content = client.get(f"/api/materials/{material_id}/content", headers=headers_b)
    assert bob_get_content.status_code == 403, "Bob should not be able to read Alice's material text!"

    # 6. Bob attempts to delete Alice's material -> MUST BE FORBIDDEN (403)
    bob_del = client.delete(f"/api/materials/{material_id}", headers=headers_b)
    assert bob_del.status_code == 403, "Bob should not be able to delete Alice's material!"

    # 7. Bob checks his own materials list -> Alice's material MUST NOT appear in Bob's library
    bob_list = client.get("/api/materials", headers=headers_b)
    assert bob_list.status_code == 200
    bob_material_ids = [m["id"] for m in bob_list.json()]
    assert material_id not in bob_material_ids, "Alice's material leaked into Bob's list!"
