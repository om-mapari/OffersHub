from sqlalchemy.orm import Session
from fastapi import HTTPException
from schemas.user_schema import UserLogin
from crud.user_crud import get_user_by_username
from utils.password_utils import verify_password
from .auth_handler import create_access_token

def authenticate_user(db: Session, credentials: UserLogin):
    user = get_user_by_username(db, credentials.username)
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return create_access_token(data={"sub": user.username})
