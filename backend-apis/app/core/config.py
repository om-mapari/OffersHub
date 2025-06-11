import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load .env file if it exists
# This is useful for local development when .env might not be loaded by uvicorn/docker
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env')
if os.path.exists(env_path):
    load_dotenv(dotenv_path=env_path)

class Settings(BaseSettings):
    PROJECT_NAME: str = "Offer Management Platform"
    API_V1_STR: str = "/api/v1"
    
    SECRET_KEY: str = "testing_secret_key" if os.environ.get("TESTING") == "true" else os.environ.get("SECRET_KEY", "default_secret_key")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    ALGORITHM: str = "HS256"
    
    # Use SQLite for testing, otherwise use the provided DATABASE_URL
    DATABASE_URL: str = "postgresql://admin:secret@127.0.0.1:5432/myappdb" if os.environ.get("TESTING") == "true" else os.environ.get("DATABASE_URL", "postgresql://postgres:postgres@127.0.0.1:5432/offer_management")
    print(f"DATABASE_URL: {DATABASE_URL.split('@')[1]}")
    # Default roles for tenants
    DEFAULT_TENANT_ROLES: list = ["admin", "read_only", "create", "approver"]
    
    # Optional CORS settings
    BACKEND_CORS_ORIGINS: list = []

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True
    }

settings = Settings()
