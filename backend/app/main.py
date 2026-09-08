from fastapi import FastAPI

app = FastAPI(
    title="AI Customer Retention Platform API",
    version="1.0.0",
)


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
