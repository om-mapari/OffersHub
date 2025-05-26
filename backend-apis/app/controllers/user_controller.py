from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from auth.dependencies import get_user_db
from services.user_service import get_user_info, list_user_groups
from auth.token_handler import get_current_user
from schemas.user_schema import UserResponse, GroupListResponse
from models.user import User

router = APIRouter(prefix="/user", tags=["User"])

@router.get("/info", response_model=UserResponse)
def get_info(current_user: User = Depends(get_current_user)):
    return get_user_info(current_user)

@router.get("/groups", response_model=GroupListResponse)
def get_groups(db: Session = Depends(get_user_db), current_user: User = Depends(get_current_user)):
    return list_user_groups(db, current_user)
