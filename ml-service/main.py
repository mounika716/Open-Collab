from fastapi import FastAPI

app = FastAPI(
    title="Open Collab ML Service",
    description="Machine learning service for Open Collab",
    version="1.0.0"
)


@app.get("/")
def root():
    return {
        "success": True,
        "message": "Open Collab ML service is running"
    }


@app.get("/api/health")
def health():
    return {
        "success": True,
        "message": "Open Collab ML service is healthy"
    }
