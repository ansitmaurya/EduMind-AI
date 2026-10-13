from backend.app.routers.health import router as health_router
from backend.app.routers.materials import router as materials_router
from backend.app.routers.quizzes import router as quizzes_router
from backend.app.routers.attempts import router as attempts_router
from backend.app.routers.competency import router as competency_router

__all__ = ["health_router", "materials_router", "quizzes_router", "attempts_router", "competency_router"]


