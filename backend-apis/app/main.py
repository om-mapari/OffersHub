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

# Set all CORS enabled origins
if settings.BACKEND_CORS_ORIGINS: # Assuming this setting exists in config if needed
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else: # Allow all for development if not specified
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
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
