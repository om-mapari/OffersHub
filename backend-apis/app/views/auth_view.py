from fastapi import APIRouter, Depends
from app.schemas.user_schema import UserCreate, UserLogin
from app.controllers import auth_controller

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register")
def register(user: UserCreate):
    return auth_controller.register(user)

@router.post("/login")
def login(user: UserLogin):
    return auth_controller.login(user)
