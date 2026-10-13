import pytest
from fastapi.testclient import TestClient
from sqlalchemy import inspect
from backend.main import app
from backend.app.database import engine, init_db


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    """Ensure database tables are initialized before tests run."""
    init_db()
    yield


@pytest.fixture
def client():
    """Provide a TestClient instance."""
    with TestClient(app) as test_client:
        yield test_client


def test_root_endpoint(client):
    """Test the root index endpoint returns project information."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["project"] == "EduMind AI"
    assert data["version"] == "2.0.0"
    assert "health_check" in data


def test_health_endpoint(client):
    """Test the health check endpoint returns 200 with active DB status."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["app_name"] == "EduMind AI"
    assert data["database"]["status"] == "connected"
    assert data["database"]["engine"] == "sqlite"
    assert "timestamp" in data


def test_direct_root_health_endpoint(client):
    """Test the root /health endpoint for external monitoring and load balancers."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"]["status"] == "connected"


def test_database_tables_created():
    """Verify that all core tables were successfully created in SQLite."""
    inspector = inspect(engine)
    tables = inspector.get_table_names()

    expected_tables = {
        "learning_materials",
        "quizzes",
        "quiz_questions",
        "quiz_attempts",
        "learner_responses",
        "competency_results",
        "personalized_recommendations"
    }

    for table in expected_tables:
        assert table in tables, f"Expected table '{table}' not found in database. Existing tables: {tables}"
