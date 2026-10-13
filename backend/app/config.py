import os
from pathlib import Path
from dotenv import load_dotenv

# Base backend directory
BASE_DIR = Path(__file__).resolve().parent.parent

# Load local .env if available
env_path = BASE_DIR / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()


class Settings:
    PROJECT_NAME: str = "EduMind AI"
    PROJECT_TITLE: str = (
        "AI-Enabled Learning Platform for Competency Assessment, "
        "Personalized Training and Quiz Generation"
    )
    VERSION: str = "2.0.0"
    BASE_DIR: Path = BASE_DIR
    APP_ENV: str = os.getenv("APP_ENV", "development")
    APP_HOST: str = os.getenv("APP_HOST", "127.0.0.1")
    APP_PORT: int = int(os.getenv("APP_PORT", "8000"))

    # SQLite database URL default stored in the backend directory
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", f"sqlite:///{BASE_DIR / 'edumind.db'}"
    )

    # Allowed CORS Origins
    _raw_cors = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173"
    )
    CORS_ORIGINS: list[str] = [
        origin.strip() for origin in _raw_cors.split(",") if origin.strip()
    ]

    # Upload configuration
    MAX_UPLOAD_SIZE_BYTES: int = int(os.getenv("MAX_UPLOAD_SIZE_BYTES", str(10 * 1024 * 1024)))  # 10 MB default
    UPLOAD_DIR: Path = BASE_DIR / "uploads"
    ALLOWED_EXTENSIONS: set[str] = {"pdf", "docx", "txt"}

    # Authentication & JWT Configuration
    SECRET_KEY: str = os.getenv("SECRET_KEY", "edumind-academic-security-token-2026-secret-key")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))  # 24 hours


settings = Settings()
# Ensure upload directory exists
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

