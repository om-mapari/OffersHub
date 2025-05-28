#!/bin/bash

BASE_DIR="backend-apis/app"

# Create directory structure
mkdir -p $BASE_DIR/{models,schemas,crud,utils,auth,controllers,views}

# Create files for authentication
touch $BASE_DIR/models/user.py
touch $BASE_DIR/schemas/user_schema.py
touch $BASE_DIR/crud/user_crud.py
touch $BASE_DIR/utils/password_utils.py
touch $BASE_DIR/auth/{auth_handler.py,auth_bearer.py,auth_service.py}
touch $BASE_DIR/views/auth_view.py
touch $BASE_DIR/controllers/auth_controller.py

# Insert boilerplate code into files

cat <<EOF > $BASE_DIR/models/user.py
from sqlalchemy import Column, Integer, String
from ..database.connection import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
EOF

cat <<EOF > $BASE_DIR/schemas/user_schema.py
from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserOut(BaseModel):
    id: int
    username: str
    email: EmailStr

    class Config:
        orm_mode = True
EOF

cat <<EOF > $BASE_DIR/crud/user_crud.py
from sqlalchemy.orm import Session
from ..models.user import User
from ..schemas.user_schema import UserCreate
from ..utils.password_utils import hash_password

def create_user(db: Session, user: UserCreate):
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hash_password(user.password)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()
EOF

cat <<EOF > $BASE_DIR/utils/password_utils.py
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
EOF

cat <<EOF > $BASE_DIR/auth/auth_handler.py
from datetime import datetime, timedelta
from jose import JWTError, jwt
from typing import Optional

SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_access_token(token: str):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None
EOF

cat <<EOF > $BASE_DIR/auth/auth_bearer.py
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import Request, HTTPException
from .auth_handler import decode_access_token

class JWTBearer(HTTPBearer):
    async def __call__(self, request: Request):
        credentials: HTTPAuthorizationCredentials = await super().__call__(request)
        if credentials:
            payload = decode_access_token(credentials.credentials)
            if payload is None:
                raise HTTPException(status_code=403, detail="Invalid token or expired token.")
            return payload
        raise HTTPException(status_code=403, detail="Invalid authorization code.")
EOF

cat <<EOF > $BASE_DIR/auth/auth_service.py
from sqlalchemy.orm import Session
from fastapi import HTTPException
from ..schemas.user_schema import UserLogin
from ..crud.user_crud import get_user_by_username
from ..utils.password_utils import verify_password
from .auth_handler import create_access_token

def authenticate_user(db: Session, credentials: UserLogin):
    user = get_user_by_username(db, credentials.username)
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return create_access_token(data={"sub": user.username})
EOF

cat <<EOF > $BASE_DIR/views/auth_view.py
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from ..schemas.user_schema import UserCreate, UserLogin
from ..database.connection import get_db
from ..crud.user_crud import create_user
from ..auth.auth_service import authenticate_user

router = APIRouter(tags=["Authentication"])

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user: UserCreate, db: Session = Depends(get_db)):
    return create_user(db, user)

@router.post("/login")
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    return {"access_token": authenticate_user(db, credentials), "token_type": "bearer"}
EOF

cat <<EOF > $BASE_DIR/controllers/auth_controller.py
# Controller logic can be added here if needed (e.g., abstraction from view layer)
EOF

echo "✅ JWT authentication structure created successfully!"
