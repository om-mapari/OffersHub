from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from schemas.user_schema import UserCreate, UserLogin
from database.connection import get_db
from crud.user_crud import create_user
from auth.auth_service import authenticate_user

router = APIRouter(tags=["Authentication"])

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user: UserCreate, db: Session = Depends(get_db)):
    return create_user(db, user)

@router.post("/login")
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    return {"access_token": authenticate_user(db, credentials), "token_type": "bearer"}
