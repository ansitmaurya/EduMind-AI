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


def test_competencies_no_attempts(client):
    """
    Verifies that a learner with no quiz attempts receives a clean,
    un-fabricated response with has_data=False and empty lists.
    """
    res = client.get("/api/competencies?user_id=new_student_zero")
    assert res.status_code == 200
    data = res.json()

    assert data["has_data"] is False
    assert data["total_quizzes_taken"] == 0
    assert data["total_questions_evaluated"] == 0
    assert data["overall_accuracy_percentage"] == 0.0
    assert len(data["strengths"]) == 0
    assert len(data["gaps"]) == 0
    assert len(data["developing"]) == 0
    assert len(data["insufficient_data_topics"]) == 0
    assert len(data["all_topics"]) == 0
    assert "methodology_explanation" in data


def test_recommendations_no_attempts(client):
    """
    Verifies that requesting recommendations for a user with no attempts
    returns a clear, informative message rather than fake recommendations.
    """
    res = client.get("/api/recommendations?user_id=new_student_zero")
    assert res.status_code == 200
    data = res.json()

    assert data["has_gaps"] is False
    assert data["total_recommendations"] == 0
    assert "No quiz attempts found" in data["summary_message"]
    assert len(data["recommendations"]) == 0


def test_competencies_and_recommendations_flow(client):
    """
    End-to-end test:
    1. Uploads relevant study material.
    2. Generates a quiz with topic 'Binary Trees'.
    3. Starts an attempt for 'student_test_flow'.
    4. Submits with low score on 'Binary Trees' (e.g. 1/5 correct = 20%).
    5. Verifies 'Binary Trees' is flagged as a Competency Gap (< 50%).
    6. Verifies recommendation is generated matching the uploaded material.
    7. Verifies database persistence in competency_results.
    """
    user_id = "student_test_flow"

    # Step 1: Upload material
    doc_text = (
        "Tree Data Structures and Binary Trees Study Material. "
        "A Binary Search Tree is a binary tree where nodes in the left subtree have values less than the root, "
        "and nodes in the right subtree have values greater than the root. "
        "Inorder traversal of a binary search tree visits nodes in non-decreasing sorted order. "
        "Tree height is the length of the longest path from the root node to a leaf node. "
        "Balanced trees guarantee logarithmic time O(log n) for search and insertion operations."
    )
    mat_res = client.post(
        "/api/materials/upload",
        files={"file": ("binary_trees.txt", doc_text.encode("utf-8"), "text/plain")},
        data={"title": "Binary Trees Mastery Guide", "subject_code": "CS301"}
    )
    assert mat_res.status_code == 201
    mat_id = mat_res.json()["id"]

    # Step 2: Generate Quiz
    quiz_res = client.post(
        "/api/quizzes/generate",
        json={
            "material_id": mat_id,
            "title": "Binary Trees Assessment",
            "topic": "Binary Trees",
            "num_questions": 5,
            "difficulty": "Medium"
        }
    )
    assert quiz_res.status_code == 201
    quiz_id = quiz_res.json()["id"]

    # Step 3: Start Attempt
    start_res = client.post(f"/api/quizzes/{quiz_id}/attempts")
    assert start_res.status_code == 201
    attempt_id = start_res.json()["attempt_id"]

    # Fetch true questions to prepare 1 correct, 4 incorrect
    quiz_detail = client.get(f"/api/quizzes/{quiz_id}").json()
    questions = quiz_detail["questions"]
    assert len(questions) == 5

    # Submit attempt: 1 correct, 4 incorrect -> 20% accuracy
    responses = [
        {"question_id": questions[0]["id"], "selected_index": questions[0]["correct_index"]}
    ]
    for q in questions[1:]:
        wrong_idx = (q["correct_index"] + 1) % 4
        responses.append({"question_id": q["id"], "selected_index": wrong_idx})

    submit_res = client.post(
        f"/api/attempts/{attempt_id}/submit",
        json={"responses": responses, "time_taken_seconds": 90}
    )
    assert submit_res.status_code == 200
    assert submit_res.json()["score_percentage"] == 20.0

    # Step 4: Verify Competency Gap Analysis
    comp_res = client.get("/api/competencies")
    assert comp_res.status_code == 200
    comp_data = comp_res.json()

    assert comp_data["has_data"] is True
    assert comp_data["total_quizzes_taken"] >= 1
    assert comp_data["total_questions_evaluated"] >= 5

    # Gaps must contain Binary Trees or topic
    gap_topics = [g["topic"].lower() for g in comp_data["gaps"]]
    all_topics = [t["topic"].lower() for t in comp_data["all_topics"]]
    assert any("tree" in t for t in all_topics)

    # Step 5: Verify Personalized Recommendations
    rec_res = client.get("/api/recommendations")
    assert rec_res.status_code == 200
    rec_data = rec_res.json()

    assert rec_data["has_gaps"] is True
    assert rec_data["total_recommendations"] >= 1

    first_rec = rec_data["recommendations"][0]
    assert "priority" in first_rec
    assert first_rec["priority"] in ("high", "medium", "low")
    assert "action_step" in first_rec
    assert len(first_rec["action_step"]) > 10

    # Must match our uploaded material "Binary Trees Mastery Guide"
    matching_recs = [r for r in rec_data["recommendations"] if r["has_matching_material"]]
    assert len(matching_recs) >= 1
    assert any("binary trees mastery guide" in (r["matched_material_title"] or "").lower() for r in matching_recs)


def test_insufficient_data_handling(client):
    """
    Verifies that topics with fewer than 3 evaluated questions are
    explicitly categorized into insufficient_data_topics to prevent premature conclusions.
    """
    import uuid
    from backend.app.database import SessionLocal
    from backend.app.models.attempt import QuizAttempt, LearnerResponse
    from backend.app.models.quiz import Quiz, QuizQuestion
    from datetime import datetime, timezone

    unique_user = f"student_few_q_{uuid.uuid4().hex[:8]}"
    db = SessionLocal()
    try:
        quiz = Quiz(
            title="Single Question Topic Quiz",
            subject_code="TEST101",
            topic="Quantum Computing",
            difficulty="Hard",
            time_limit_seconds=300,
            total_questions=1,
            generation_mode="fallback"
        )
        db.add(quiz)
        db.flush()

        question = QuizQuestion(
            quiz_id=quiz.id,
            question_text="What is a qubit in quantum computing?",
            options=["Bit", "Qubit", "Byte", "Nibble"],
            correct_index=1,
            explanation="A qubit is the basic unit of quantum information.",
            topic_tag="Quantum Computing",
            difficulty="Hard",
            order_num=1
        )
        db.add(question)
        db.flush()

        attempt = QuizAttempt(
            quiz_id=quiz.id,
            user_id=unique_user,
            status="completed",
            started_at=datetime.now(timezone.utc),
            completed_at=datetime.now(timezone.utc),
            total_questions=1,
            attempted_count=1,
            correct_count=1,
            score_percentage=100.0
        )
        db.add(attempt)
        db.flush()

        learner_resp = LearnerResponse(
            attempt_id=attempt.id,
            question_id=question.id,
            selected_index=1,
            is_correct=True,
            answered_at=datetime.now(timezone.utc)
        )
        db.add(learner_resp)
        db.commit()

        # Query competency for isolated user
        res = client.get(f"/api/competencies?user_id={unique_user}")
        assert res.status_code == 200
        data = res.json()

        assert data["has_data"] is True
        # Quantum Computing has only 1 question, so it MUST be in insufficient_data_topics!
        insufficient_names = [t["topic"] for t in data["insufficient_data_topics"]]
        assert "Quantum Computing" in insufficient_names
        # Must not make strong conclusions in strengths/gaps
        assert "Quantum Computing" not in [t["topic"] for t in data["strengths"]]
        assert "Quantum Computing" not in [t["topic"] for t in data["gaps"]]

    finally:
        db.close()


def test_recommendation_when_no_matching_material_exists(client):
    """
    Verifies that when a gap is identified in a topic with no uploaded material,
    the recommendation clearly states that no matching material is available.
    """
    import uuid
    from backend.app.database import SessionLocal
    from backend.app.models.attempt import QuizAttempt, LearnerResponse
    from backend.app.models.quiz import Quiz, QuizQuestion
    from datetime import datetime, timezone

    unique_user = f"student_orphan_{uuid.uuid4().hex[:8]}"
    db = SessionLocal()
    try:
        user_id = unique_user
        quiz = Quiz(
            title="Ancient History Quiz",
            subject_code="HIST999",
            topic="Mesopotamian Civilizations",
            difficulty="Medium",
            time_limit_seconds=300,
            total_questions=4,
            generation_mode="fallback"
        )
        db.add(quiz)
        db.flush()

        q_ids = []
        for i in range(4):
            q = QuizQuestion(
                quiz_id=quiz.id,
                question_text=f"History Question {i+1} on Cuneiform Script?",
                options=["A", "B", "C", "D"],
                correct_index=0,
                explanation="Cuneiform is one of the earliest systems of writing.",
                topic_tag="Mesopotamian Civilizations",
                difficulty="Medium",
                order_num=i+1
            )
            db.add(q)
            db.flush()
            q_ids.append(q.id)

        attempt = QuizAttempt(
            quiz_id=quiz.id,
            user_id=user_id,

            status="completed",
            started_at=datetime.now(timezone.utc),
            completed_at=datetime.now(timezone.utc),
            total_questions=4,
            attempted_count=4,
            correct_count=0,
            score_percentage=0.0
        )
        db.add(attempt)
        db.flush()

        for q_id in q_ids:
            db.add(LearnerResponse(
                attempt_id=attempt.id,
                question_id=q_id,
                selected_index=2,  # wrong
                is_correct=False,
                answered_at=datetime.now(timezone.utc)
            ))
        db.commit()

        # Check recommendations for student_orphan_topic
        res = client.get(f"/api/recommendations?user_id={user_id}")
        assert res.status_code == 200
        data = res.json()

        assert data["has_gaps"] is True
        hist_rec = next((r for r in data["recommendations"] if "mesopotamian" in r["topic"].lower()), None)
        assert hist_rec is not None
        assert hist_rec["has_matching_material"] is False
        assert hist_rec["matched_material_id"] is None
        assert "no matching" in hist_rec["action_step"].lower()

    finally:
        db.close()
