from fastapi import FastAPI

app = FastAPI(
    title="Life Tracker API",
    description="Backend API for the Life Tracker application",
    version="0.1.0",
)


@app.get("/health")
def health_check():
    return {"status": "healthy"}