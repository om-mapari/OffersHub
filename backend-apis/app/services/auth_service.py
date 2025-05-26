from fastapi import HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from crud import user_crud
from auth.token_handler import create_token
import logging

logger = logging.getLogger(__name__)

def login_user(form_data: OAuth2PasswordRequestForm, db: Session):
    user = user_crud.get_user(db, form_data.username)
    if not user or not user_crud.verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    tenant_ids = {group.tenant for group in user.groups}
    token_data = {
        "username": user.username,
        "groups": [g.name for g in user.groups],
        "tenants": list(tenant_ids)
    }

    return {"access_token": create_token(token_data), "token_type": "bearer"}
