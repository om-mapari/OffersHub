import typing
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api.v1 import deps

router = APIRouter()

@router.post("/", response_model=schemas.User, status_code=status.HTTP_201_CREATED)
def create_user(
    *,
    db: Session = Depends(deps.get_db),
    user_in: schemas.UserCreate,
    current_super_user: models.User = Depends(deps.get_current_active_superuser),
) -> typing.Any:
    """
    Create new user. (Super Admin only)
    """
    user = crud.user.get_by_username(db, username=user_in.username)
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The user with this username already exists in the system.",
        )
    user = crud.user.create(db, obj_in=user_in)
    return user

@router.get("/", response_model=typing.List[schemas.User])
def read_users(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_super_user: models.User = Depends(deps.get_current_active_superuser),
) -> typing.Any:
    """
    Retrieve users. (Super Admin only)
    """
    users = crud.user.get_multi(db, skip=skip, limit=limit)
    return users

@router.get("/{username}", response_model=schemas.User)
def read_user_by_username(
    username: str,
    db: Session = Depends(deps.get_db),
    current_super_user: models.User = Depends(deps.get_current_active_superuser),
) -> typing.Any:
    """
    Get a specific user by username. (Super Admin only)
    """
    user = crud.user.get_by_username(db, username=username)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user

@router.put("/{username}", response_model=schemas.User)
def update_user(
    *,
    db: Session = Depends(deps.get_db),
    username: str,
    user_in: schemas.UserUpdate, # Note: This schema allows password update.
    current_super_user: models.User = Depends(deps.get_current_active_superuser),
) -> typing.Any:
    """
    Update a user. (Super Admin only)
    Username cannot be changed.
    """
    user = crud.user.get_by_username(db, username=username)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user = crud.user.update(db, db_obj=user, obj_in=user_in)
    return user

@router.post("/{username}/change-password", response_model=schemas.Msg)
def change_user_password_by_sa(
    *,
    db: Session = Depends(deps.get_db),
    username: str,
    body: schemas.UserUpdate, # Re-use UserUpdate, expecting only 'password' field.
                              # Or create a specific schema: NewPassword(new_password: str)
    current_super_user: models.User = Depends(deps.get_current_active_superuser),
) -> typing.Any:
    """
    Change any user's password. (Super Admin only)
    """
    user = crud.user.get_by_username(db, username=username)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if not body.password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="New password not provided")

    hashed_password = security.get_password_hash(body.password)
    user.password_hash = hashed_password
    db.add(user)
    db.commit()
    return {"msg": f"Password for user '{username}' updated successfully"}


@router.delete("/{username}", response_model=schemas.Msg)
def delete_user(
    *,
    db: Session = Depends(deps.get_db),
    username: str,
    current_super_user: models.User = Depends(deps.get_current_active_superuser),
) -> typing.Any:
    """
    Delete a user. (Super Admin only)
    """
    user = crud.user.get_by_username(db, username=username)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user.username == current_super_user.username:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Super admin cannot delete themselves")
    
    # CRUDBase.remove expects id. User PK is username.
    db.delete(user)
    db.commit()
    return {"msg": f"User '{username}' deleted successfully"}
