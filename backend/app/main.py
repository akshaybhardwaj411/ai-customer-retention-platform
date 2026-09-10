from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.api.action_center import router as action_center_router
from app.api.actions import router as actions_router
from app.api.customer_360 import router as customer_360_router
from app.api.customer_events import router as customer_events_router
from app.api.customers import router as customers_router
from app.api.impact import router as impact_router
from app.api.import_preview import router as import_preview_router
from app.api.import_validation import router as import_validation_router
from app.api.imports import router as imports_router
from app.api.insights import router as insights_router
from app.api.next_best_action import router as next_best_action_router
from app.api.organizations import router as organizations_router
from app.api.outcomes import router as outcomes_router
from app.api.recommendations import router as recommendations_router
from app.api.risk import router as risk_router
from app.api.risk_summary import router as risk_summary_router
from app.db.session import get_db


app = FastAPI(
    title="AI Customer Retention Platform API",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(organizations_router)
app.include_router(customers_router)
app.include_router(customer_360_router)
app.include_router(customer_events_router)
app.include_router(risk_router)
app.include_router(risk_summary_router)
app.include_router(insights_router)
app.include_router(next_best_action_router)
app.include_router(recommendations_router)
app.include_router(actions_router)
app.include_router(action_center_router)
app.include_router(outcomes_router)
app.include_router(impact_router)
app.include_router(imports_router)
app.include_router(import_preview_router)
app.include_router(import_validation_router)


@app.get("/")
def root():
    return {
        "message": "AI Customer Retention Platform API",
        "status": "running",
        "version": "1.0.0",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "retention-api",
        "version": "1.0.0",
    }


@app.get("/health/database")
def database_health():
    db = next(get_db())

    try:
        db.execute(text("SELECT 1"))

        return {
            "status": "healthy",
            "database": "connected",
        }
    except Exception:
        return {
            "status": "unhealthy",
            "database": "unavailable",
        }
    finally:
        db.close()
