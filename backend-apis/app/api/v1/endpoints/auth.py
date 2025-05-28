from datetime import timedelta
import typing

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api.v1 import deps
from app.core import security
from app.core.config import settings

router = APIRouter()

@router.post("/token", response_model=schemas.Token)
def login_for_access_token(
    db: Session = Depends(deps.get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> typing.Any:
    """
    OAuth2 compatible token login, get an access token for future requests.
    """
    user = crud.user.authenticate(
        db, username=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    # Add more checks here if needed, e.g. user.is_active
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        user.username, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=schemas.User)
def get_current_user(
    current_user: models.User = Depends(deps.get_current_active_user),
) -> typing.Any:
    """
    Get current user.
    """
    return current_user

@router.post("/change-password", response_model=schemas.Msg)
def change_password(
    *,
    db: Session = Depends(deps.get_db),
    body: schemas.UserPasswordChange,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> typing.Any:
    """
    Change own password.
    """
    if not crud.user.authenticate(db, username=current_user.username, password=body.current_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect current password")
    
    hashed_password = security.get_password_hash(body.new_password)
    current_user.password_hash = hashed_password
    db.add(current_user)
    db.commit()
    return {"msg": "Password updated successfully"}
