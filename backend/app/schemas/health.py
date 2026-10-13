from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field


class DatabaseStatus(BaseModel):
    status: str = Field(description="Database connectivity status: 'connected', 'degraded', or 'disconnected'")
    engine: str = Field(default="sqlite", description="Database engine type")
    message: str = Field(description="Human-readable database diagnostic message")
    error: Optional[str] = Field(default=None, description="Detailed error description if disconnected")


class HealthResponse(BaseModel):
    status: str = Field(description="Overall backend service status: 'healthy', 'degraded', or 'unhealthy'")
    app_name: str = Field(default="EduMind AI", description="Project application name")
    project_title: str = Field(
        default="AI-Enabled Learning Platform for Competency Assessment, Personalized Training and Quiz Generation",
        description="Official SIH project title"
    )
    version: str = Field(default="2.0.0", description="Current release version")
    environment: str = Field(default="development", description="Execution environment")
    database: DatabaseStatus = Field(description="Database connectivity diagnostics")
    timestamp: datetime = Field(description="UTC timestamp of the health check evaluation")
