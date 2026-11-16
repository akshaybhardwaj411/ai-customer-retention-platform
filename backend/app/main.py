
import os

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.api.action_center import router as action_center_router
from app.api.actions import router as actions_router
from app.api.campaigns import router as campaigns_router
from app.api.customer_360 import router as customer_360_router
from app.api.customer_events import router as customer_events_router
from app.api.customers import router as customers_router
from app.api.explanations import router as explanations_router
from app.api.impact import router as impact_router
from app.api.import_preview import router as import_preview_router
from app.api.import_validation import router as import_validation_router
from app.api.imports import router as imports_router
from app.api.insights import router as insights_router
from app.api.ml_predictions import router as ml_predictions_router
from app.api.ml_status import router as ml_status_router
from app.api.next_best_action import router as next_best_action_router
from app.api.organizations import router as organizations_router
from app.api.outcomes import router as outcomes_router
from app.api.priority import router as priority_router
from app.api.recommendations import router as recommendations_router
from app.api.risk import router as risk_router
from app.api.risk_summary import router as risk_summary_router
from app.db.session import get_db


API_VERSION = "1.0.1"

app = FastAPI(
    title="AI Customer Retention Platform API",
    description=(
        "AI-powered customer churn prediction, "
        "retention recommendations and campaign management."
    ),
    version=API_VERSION,
)

# CORS configuration
# Local development works by default.
# Production frontend URLs can be added later using:
# CORS_ORIGINS=https://your-frontend.vercel.app

cors_origins = os.getenv(
    "CORS_ORIGINS",
    os.getenv("FRONTEND_URL", ""),
)

allowed_origins = [
    origin.strip().rstrip("/")
    for origin in cors_origins.split(",")
    if origin.strip()
]

if "http://localhost:3000" not in allowed_origins:
    allowed_origins.append("http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register existing API routers
routers = [
    organizations_router,
    customers_router,
    customer_360_router,
    customer_events_router,
    risk_router,
    risk_summary_router,
    insights_router,
    next_best_action_router,
    recommendations_router,
    actions_router,
    action_center_router,
    outcomes_router,
    priority_router,
    impact_router,
    campaigns_router,
    imports_router,
    import_preview_router,
    import_validation_router,
    ml_predictions_router,
    ml_status_router,
    explanations_router,
]

for router in routers:
    app.include_router(router)


@app.get("/", tags=["System"])
def root():
    return {
        "message": "AI Customer Retention Platform API",
        "status": "running",
        "version": API_VERSION,
        "documentation": "/docs",
    }


@app.get("/health", tags=["System"])
def health():
    return {
        "status": "healthy",
        "service": "retention-api",
        "version": API_VERSION,
    }


@app.get("/health/database", tags=["System"])
def database_health(
    db: Session = Depends(get_db),
):
    try:
        db.execute(text("SELECT 1"))

        return {
            "status": "healthy",
            "database": "connected",
        }

    except SQLAlchemyError:
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "database": "unavailable",
            },
        )


@app.get("/version", tags=["System"])
def version():
    return {
        "version": API_VERSION,
        "service": "retention-api",
    }
