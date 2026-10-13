from datetime import datetime, timezone
from fastapi import APIRouter, status, Response
from backend.app.config import settings
from backend.app.database import check_db_connection
from backend.app.schemas.health import HealthResponse, DatabaseStatus

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=HealthResponse, summary="Service & Database Health Status")
def get_health(response: Response) -> HealthResponse:
    """
    Checks operational status of the EduMind AI backend and active database connection.
    Reflects live system status: returns HTTP 200 when healthy, or HTTP 503 when degraded.
    """
    is_db_connected, db_message, db_meta = check_db_connection()

    if is_db_connected:
        service_status = "healthy"
        db_status = "connected"
        db_error = None
    else:
        service_status = "degraded"
        db_status = "disconnected"
        db_error = db_meta.get("error")
        response.status_code = status.HTTP(503)

    return HealthResponse(
        status=service_status,
        app_name=settings.PROJECT_NAME,
        project_title=settings.PROJECT_TITLE,
        version=settings.VERSION,
        environment=settings.APP_ENV,
        database=DatabaseStatus(
            status=db_status,
            engine=db_meta.get("engine", "sqlite"),
            message=db_message,
            error=db_error
        ),
        timestamp=datetime.now(timezone.utc)
    )
