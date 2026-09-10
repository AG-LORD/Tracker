from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.study import router as study_router
from app.routes.activities import router as activities_router
from app.routes.activity_types import router as activity_types_router
from app.routes.auth import router as auth_router

app = FastAPI(
    title="Life Tracker API",
    description="Backend API for the Life Tracker application",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(activity_types_router)
app.include_router(activities_router)
app.include_router(auth_router)
app.include_router(study_router)

@app.get("/health")
def health_check():
    return {"status": "healthy"}