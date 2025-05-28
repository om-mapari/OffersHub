from fastapi import FastAPI, Depends
from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv
from datetime import datetime

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

# Database setup
engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Sample model
class User(Base):
    __tablename__ = "users"
    
    username = Column(String, primary_key=True, index=True)
    full_name = Column(String, nullable=True)
    password_hash = Column(String, nullable=False)
    is_super_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

# Create tables
Base.metadata.create_all(bind=engine)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Create FastAPI app
app = FastAPI(title=settings.PROJECT_NAME)

@app.get("/")
async def root():
    return {"message": f"Welcome to {settings.PROJECT_NAME}", "database_url": settings.DATABASE_URL}

@app.get("/users")
def read_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return users 