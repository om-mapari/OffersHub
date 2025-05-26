from models.user import User
from sqlalchemy.orm import Session
from crud.user_crud import get_user_groups
from schemas.user_schema import UserResponse, GroupListResponse

def get_user_info(current_user: User) -> UserResponse:
    return UserResponse(
        username=current_user.username,
        email=current_user.email,
        full_name=current_user.full_name
    )

def list_user_groups(db: Session, current_user: User) -> GroupListResponse:
    groups = get_user_groups(db, current_user.id)
    return GroupListResponse(groups=groups)
