from fastapi import FastAPI, Response, status
from fastapi.middleware.cors import CORSMiddleware
import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv
from app.healthcheck import check_db_connection

# Load .env file
env_path = '.env'
if os.path.exists(env_path):
    load_dotenv(dotenv_path=env_path)

# Minimal settings
class Settings(BaseSettings):
    PROJECT_NAME: str = "Offer Management Platform"
    DATABASE_URL: str
    
    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True
    }

settings = Settings()

# Create a minimal FastAPI app
app = FastAPI(title=settings.PROJECT_NAME)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": f"Welcome to {settings.PROJECT_NAME}", "database_url": settings.DATABASE_URL}

@app.get("/health")
async def health_check(response: Response):
    """Health check endpoint that verifies database connectivity."""
    db_ok = check_db_connection()
    
    if not db_ok:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return {"status": "unhealthy", "database": "disconnected"}
    
    return {"status": "healthy", "database": "connected"} 