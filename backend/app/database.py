from typing import Generator, Tuple, Dict, Any
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from backend.app.config import settings

# Engine configuration (check_same_thread=False is required for SQLite with multi-threaded FastAPI)
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency to provide a database session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_db_connection() -> Tuple[bool, str, Dict[str, Any]]:
    """
    Actively checks the database connection by executing a test query.
    Returns (is_connected, status_message, metadata).
    """
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1")).scalar()
            if result == 1:
                return (
                    True,
                    "Database operational and accepting queries.",
                    {
                        "engine": "sqlite" if "sqlite" in settings.DATABASE_URL else "relational",
                        "status": "connected"
                    }
                )
            return (
                False,
                "Database query returned unexpected result.",
                {"status": "degraded"}
            )
    except Exception as exc:
        return (
            False,
            f"Database connection error: {str(exc)}",
            {"status": "disconnected", "error": str(exc)}
        )


def init_db() -> None:
    """
    Initializes database schema by registering all models and creating tables.
    Also handles safe column additions for existing SQLite tables.
    """
    # Import all models to register with Base metadata
    import backend.app.models  # noqa: F401
    Base.metadata.create_all(bind=engine)

    # Safely migrate new columns if learning_materials already existed
    try:
        with engine.connect() as conn:
            cursor = conn.connection.cursor()
            cursor.execute("PRAGMA table_info(learning_materials)")
            existing_cols = {row[1] for row in cursor.fetchall()}
            if existing_cols:
                if "user_id" not in existing_cols:
                    cursor.execute("ALTER TABLE learning_materials ADD COLUMN user_id VARCHAR(100) DEFAULT 'student_default'")
                if "storage_path" not in existing_cols:
                    cursor.execute("ALTER TABLE learning_materials ADD COLUMN storage_path VARCHAR(500)")
                if "extracted_char_count" not in existing_cols:
                    cursor.execute("ALTER TABLE learning_materials ADD COLUMN extracted_char_count INTEGER DEFAULT 0")
                if "error_message" not in existing_cols:
                    cursor.execute("ALTER TABLE learning_materials ADD COLUMN error_message TEXT")
                conn.connection.commit()

            cursor.execute("PRAGMA table_info(quizzes)")
            existing_quiz_cols = {row[1] for row in cursor.fetchall()}
            if existing_quiz_cols:
                if "user_id" not in existing_quiz_cols:
                    cursor.execute("ALTER TABLE quizzes ADD COLUMN user_id VARCHAR(100) DEFAULT 'student_default'")
                if "generation_mode" not in existing_quiz_cols:
                    cursor.execute("ALTER TABLE quizzes ADD COLUMN generation_mode VARCHAR(50) DEFAULT 'fallback'")
                conn.connection.commit()

            cursor.execute("PRAGMA table_info(quiz_attempts)")
            existing_attempt_cols = {row[1] for row in cursor.fetchall()}
            if existing_attempt_cols:
                if "status" not in existing_attempt_cols:
                    cursor.execute("ALTER TABLE quiz_attempts ADD COLUMN status VARCHAR(50) DEFAULT 'in_progress'")
                if "unanswered_count" not in existing_attempt_cols:
                    cursor.execute("ALTER TABLE quiz_attempts ADD COLUMN unanswered_count INTEGER DEFAULT 0")
                conn.connection.commit()
    except Exception:
        # Pass if table not created yet or already updated
        pass

    # Ensure demo user exists for seamless presentation and testing
    try:
        from backend.app.services.auth_service import hash_password
        from backend.app.models.user import User
        with SessionLocal() as db:
            demo_user = db.query(User).filter(User.email == "alex@example.com").first()
            if not demo_user:
                demo_user = User(
                    email="alex@example.com",
                    full_name="Alex",
                    hashed_password=hash_password("student123"),
                    is_active=True
                )
                db.add(demo_user)
                db.commit()
    except Exception:
        pass

