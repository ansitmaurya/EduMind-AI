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
def active_quiz_id(client):
    """Uploads document and generates a 5-question quiz for testing attempts."""
    rich_text = (
        "Operating Systems and Process Scheduling notes. "
        "A Process is a program in execution containing program counter and registers. "
        "Thread is the smallest unit of execution within a process sharing resources. "
        "Deadlock occurs when two or more processes are waiting indefinitely for resources. "
        "Virtual Memory allows execution of processes not completely loaded in memory. "
        "Round Robin scheduling uses fixed time quanta for fair CPU time sharing."
    )
    mat_res = client.post(
        "/api/materials/upload",
        files={"file": ("os_notes.txt", rich_text.encode("utf-8"), "text/plain")},
        data={"title": "OS Memory and CPU", "subject_code": "CS204"}
    )
    mat_id = mat_res.json()["id"]

    quiz_res = client.post(
        "/api/quizzes/generate",
        json={
            "material_id": mat_id,
            "title": "OS Process & Memory Quiz",
            "topic": "Process Scheduling",
            "num_questions": 5,
            "difficulty": "Medium"
        }
    )
    return quiz_res.json()["id"]


def test_start_attempt_protects_correct_answers(client, active_quiz_id):
    """
    SECURITY & INTEGRITY TEST:
    Verifies that starting an attempt never leaks correct answers or explanations
    to the client before submission.
    """
    res = client.post(f"/api/quizzes/{active_quiz_id}/attempts")
    assert res.status_code == 201
    data = res.json()

    assert "attempt_id" in data
    assert data["quiz_id"] == active_quiz_id
    assert data["status"] == "in_progress"
    assert data["total_questions"] == 5
    assert len(data["questions"]) == 5

    # Check each question: MUST NOT contain correct_index or explanation
    for q in data["questions"]:
        assert "id" in q
        assert "question_text" in q
        assert "options" in q
        assert len(q["options"]) == 4
        # Crucial security checks:
        assert "correct_index" not in q, "Security vulnerability: correct_index leaked before submission!"
        assert "explanation" not in q, "Security vulnerability: explanation leaked before submission!"


def test_start_attempt_invalid_quiz_returns_404(client):
    """Verifies that attempting to start an attempt on a non-existent quiz returns 404."""
    res = client.post("/api/quizzes/99999999/attempts")
    assert res.status_code == 404
    assert "not found" in res.json()["detail"].lower()


def test_submit_quiz_attempt_scoring_and_evaluation(client, active_quiz_id):
    """
    Verifies server-side evaluation:
    Calculates correct, incorrect, unanswered counts, percentage, and reveals explanations.
    """
    # 1. Fetch backend questions directly to know true answers for testing evaluation
    quiz_detail = client.get(f"/api/quizzes/{active_quiz_id}").json()
    questions = quiz_detail["questions"]
    assert len(questions) == 5

    # 2. Start an attempt
    start_res = client.post(f"/api/quizzes/{active_quiz_id}/attempts")
    attempt_id = start_res.json()["attempt_id"]

    # 3. Formulate responses:
    # Q0: Correct
    # Q1: Correct
    # Q2: Incorrect
    # Q3: Unanswered (omitted)
    # Q4: Unanswered (explicit selected_index: None)
    q0_correct = questions[0]["correct_index"]
    q1_correct = questions[1]["correct_index"]
    q2_incorrect = (questions[2]["correct_index"] + 1) % 4

    submission_payload = {
        "responses": [
            {"question_id": questions[0]["id"], "selected_index": q0_correct},
            {"question_id": questions[1]["id"], "selected_index": q1_correct},
            {"question_id": questions[2]["id"], "selected_index": q2_incorrect},
            {"question_id": questions[4]["id"], "selected_index": None}
            # Q3 omitted intentionally to test unanswered handling
        ],
        "time_taken_seconds": 120
    }

    # 4. Submit attempt
    submit_res = client.post(f"/api/attempts/{attempt_id}/submit", json=submission_payload)
    assert submit_res.status_code == 200
    res_data = submit_res.json()

    assert res_data["attempt_id"] == attempt_id
    assert res_data["status"] == "completed"
    assert res_data["total_questions"] == 5
    assert res_data["attempted_count"] == 3
    assert res_data["correct_count"] == 2
    assert res_data["incorrect_count"] == 1
    assert res_data["unanswered_count"] == 2
    assert res_data["score_percentage"] == 40.0
    assert res_data["time_taken_seconds"] == 120
    assert len(res_data["feedback_summary"]) > 0

    # Question reviews must now reveal answers and explanations
    reviews = res_data["question_reviews"]
    assert len(reviews) == 5

    # Check question 0 review
    rev0 = next(r for r in reviews if r["question_id"] == questions[0]["id"])
    assert rev0["is_correct"] is True
    assert rev0["selected_index"] == q0_correct
    assert rev0["correct_index"] == q0_correct
    assert rev0["explanation"] == questions[0]["explanation"]

    # Check question 2 review (incorrect)
    rev2 = next(r for r in reviews if r["question_id"] == questions[2]["id"])
    assert rev2["is_correct"] is False
    assert rev2["selected_index"] == q2_incorrect
    assert rev2["correct_index"] == questions[2]["correct_index"]

    # Check question 3 review (unanswered)
    rev3 = next(r for r in reviews if r["question_id"] == questions[3]["id"])
    assert rev3["is_correct"] is False
    assert rev3["selected_index"] is None
    assert rev3["correct_index"] == questions[3]["correct_index"]


def test_duplicate_submission_prevention(client, active_quiz_id):
    """
    Verifies that an attempt cannot be submitted twice.
    Prevents duplicate submissions and tampering with already submitted answers.
    """
    start_res = client.post(f"/api/quizzes/{active_quiz_id}/attempts")
    attempt_id = start_res.json()["attempt_id"]

    # First submission
    submit_res1 = client.post(
        f"/api/attempts/{attempt_id}/submit",
        json={"responses": [], "time_taken_seconds": 10}
    )
    assert submit_res1.status_code == 200

    # Second submission on the same attempt
    submit_res2 = client.post(
        f"/api/attempts/{attempt_id}/submit",
        json={"responses": [], "time_taken_seconds": 15}
    )
    assert submit_res2.status_code == 400
    assert "already been submitted" in submit_res2.json()["detail"].lower()


def test_submit_invalid_attempt_id_returns_404(client):
    """Verifies that submitting answers for a non-existent attempt returns 404."""
    res = client.post("/api/attempts/99999999/submit", json={"responses": []})
    assert res.status_code == 404
    assert "not found" in res.json()["detail"].lower()


def test_submit_invalid_question_id_returns_400(client, active_quiz_id):
    """Verifies submitting a question ID not belonging to the quiz is rejected."""
    start_res = client.post(f"/api/quizzes/{active_quiz_id}/attempts")
    attempt_id = start_res.json()["attempt_id"]

    res = client.post(
        f"/api/attempts/{attempt_id}/submit",
        json={"responses": [{"question_id": 99999999, "selected_index": 0}]}
    )
    assert res.status_code == 400
    assert "does not belong" in res.json()["detail"].lower()


def test_submit_invalid_option_index_returns_400_or_422(client, active_quiz_id):
    """Verifies submitting an out-of-bounds selected option index is rejected."""
    quiz_detail = client.get(f"/api/quizzes/{active_quiz_id}").json()
    first_q_id = quiz_detail["questions"][0]["id"]

    start_res = client.post(f"/api/quizzes/{active_quiz_id}/attempts")
    attempt_id = start_res.json()["attempt_id"]

    # Index 10 is out of bounds for 4-option MCQs
    res = client.post(
        f"/api/attempts/{attempt_id}/submit",
        json={"responses": [{"question_id": first_q_id, "selected_index": 10}]}
    )
    assert res.status_code in (400, 422)


def test_get_attempt_result(client, active_quiz_id):
    """Verifies retrieving saved result by attempt_id."""
    start_res = client.post(f"/api/quizzes/{active_quiz_id}/attempts")
    attempt_id = start_res.json()["attempt_id"]

    # Querying result of in-progress attempt should return 400
    in_prog_res = client.get(f"/api/attempts/{attempt_id}/result")
    assert in_prog_res.status_code == 400
    assert "in progress" in in_prog_res.json()["detail"].lower()

    # Submit attempt
    client.post(f"/api/attempts/{attempt_id}/submit", json={"responses": [], "time_taken_seconds": 45})

    # Querying result now should return 200 with saved evaluation
    res = client.get(f"/api/attempts/{attempt_id}/result")
    assert res.status_code == 200
    data = res.json()
    assert data["attempt_id"] == attempt_id
    assert data["status"] == "completed"
    assert data["time_taken_seconds"] == 45
    assert len(data["question_reviews"]) == 5


def test_get_attempt_history(client, active_quiz_id):
    """Verifies retrieving attempt history returns a list with correct fields."""
    # Ensure at least one attempt is submitted
    start_res = client.post(f"/api/quizzes/{active_quiz_id}/attempts")
    attempt_id = start_res.json()["attempt_id"]
    client.post(f"/api/attempts/{attempt_id}/submit", json={"responses": [], "time_taken_seconds": 30})

    history_res = client.get("/api/attempts")
    assert history_res.status_code == 200
    history = history_res.json()
    assert isinstance(history, list)
    assert len(history) >= 1

    first = history[0]
    assert "id" in first
    assert "quiz_id" in first
    assert "quiz_title" in first
    assert "score_percentage" in first
    assert "started_at" in first
    assert "total_questions" in first
    assert "correct_count" in first
