from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from app.core.config import settings
from app.api.v1.api import api_router
from app.db.session import engine, Base # For creating tables on startup
from app.db import init_db # Optional: for initial data
from app.db.session import SessionLocal # For initial data script

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Define allowed origins explicitly
allowed_origins = [
    "http://offermanagerapp.southindia.cloudapp.azure.com:3000",
    "http://localhost:3000",  # For local development
    "http://127.0.0.1:3000",  # Alternative localhost
    "https://offermanagerapp.southindia.cloudapp.azure.com",  # HTTPS version if needed
]

# Add any additional origins from settings if they exist
if hasattr(settings, 'BACKEND_CORS_ORIGINS') and settings.BACKEND_CORS_ORIGINS:
    # Extend the list with origins from settings
    for origin in settings.BACKEND_CORS_ORIGINS:
        if str(origin) not in allowed_origins:
            allowed_origins.append(str(origin))

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=[
        "Accept",
        "Accept-Language",
        "Content-Language",
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Origin",
        "X-Csrftoken",
        "Cache-Control",
        "Pragma",
    ],
    expose_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    # Skip table creation for tests - tests handle this separately
    if os.environ.get("TESTING") == "true":
        return
        
    # Create database tables
    # In a production environment, you would use Alembic migrations.
    # For development, this is convenient.
    Base.metadata.create_all(bind=engine)
    
    # Optional: Initialize DB with some data if needed
    # db = SessionLocal()
    # init_db.init_db(db)
    # db.close()
    pass

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {"message": f"Welcome to {settings.PROJECT_NAME}"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
