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
    """
    # Import all models to register with Base metadata
    import backend.app.models  # noqa: F401
    Base.metadata.create_all(bind=engine)
