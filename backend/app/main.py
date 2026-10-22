import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.v1.endpoints import router as api_v1_router
from app.database import engine, Base

# Attempt database table creation
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"[Warning] DB initialization note: {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="JobPilot AI — Agentic AI Job Hunter Multi-Source SaaS Engine",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health Check Endpoints
@app.get("/health")
@app.get("/api/v1/health")
def health_check():
    return {
        "status": "healthy",
        "service": "JobPilot AI Backend",
        "version": "1.0.0",
        "mock_mode": settings.MOCK_AI_RESPONSES
    }

# Include API v1 routes
app.include_router(api_v1_router, prefix=settings.API_V1_STR)

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
