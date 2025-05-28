from fastapi import FastAPI, Depends
from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from datetime import datetime

# SQLite database setup
DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
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
app = FastAPI(title="Minimal SQLite App")

@app.get("/")
async def root():
    return {"message": "Welcome to Minimal SQLite App"}

@app.get("/users")
def read_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return users 