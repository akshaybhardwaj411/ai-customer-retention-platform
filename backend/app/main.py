from fastapi import FastAPI

from app.api.organizations import router as organizations_router


app = FastAPI(
    title="AI Customer Retention Platform API",
    version="1.0.0",
)


app.include_router(organizations_router)


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
