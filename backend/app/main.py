from fastapi import FastAPI

from app.api.action_center import router as action_center_router
from app.api.actions import router as actions_router
from app.api.customer_360 import router as customer_360_router
from app.api.customers import router as customers_router
from app.api.imports import router as imports_router
from app.api.organizations import router as organizations_router
from app.api.recommendations import router as recommendations_router
from app.api.risk import router as risk_router
from app.api.risk_summary import router as risk_summary_router


app = FastAPI(
    title="AI Customer Retention Platform API",
    version="1.0.0",
)


app.include_router(organizations_router)
app.include_router(customers_router)
app.include_router(customer_360_router)
app.include_router(risk_router)
app.include_router(risk_summary_router)
app.include_router(actions_router)
app.include_router(action_center_router)
app.include_router(recommendations_router)
app.include_router(imports_router)


@app.get("/")
def root():
    return {
        "message": "AI Customer Retention Platform API",
        "status": "running",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
    }
