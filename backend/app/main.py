from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.models import user, dataset, analysis, report
from app.api import auth, datasets, analyses, forecasts, anomalies, reports, usage
from app.api.deps import get_or_create_demo_user

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables
    Base.metadata.create_all(bind=engine)
    # Ensure default demo user exists
    db = SessionLocal()
    try:
        demo_user = get_or_create_demo_user(db)
        # Ensure demo dataset exists for demo user
        from app.models.dataset import Dataset
        from app.api.datasets import load_demo_dataset
        demo_ds = db.query(Dataset).filter(Dataset.user_id == demo_user.id, Dataset.is_demo == True).first()
        if not demo_ds:
            try:
                load_demo_dataset(db, demo_user)
            except Exception:
                pass
    finally:
        db.close()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Intelligent Data Analytics SaaS Engine with Deterministic NLP Query Interpretation, Anomaly Detection, and Forecasting.",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routers
api_prefix = settings.API_V1_STR
app.include_router(auth.router, prefix=api_prefix)
app.include_router(datasets.router, prefix=api_prefix)
app.include_router(analyses.router, prefix=api_prefix)
app.include_router(forecasts.router, prefix=api_prefix)
app.include_router(anomalies.router, prefix=api_prefix)
app.include_router(reports.router, prefix=api_prefix)
app.include_router(usage.router, prefix=api_prefix)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "engine": "Deterministic Analytical Engine (Pandas + Scikit-Learn + Statsmodels)"
    }
