import typing

from fastapi import Depends, HTTPException, status, Path
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.core import security
from app.core.config import settings
from app.db.session import SessionLocal, get_db # get_db is already here

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/token"
)

def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(reusable_oauth2)
) -> models.User:
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        token_data = schemas.TokenPayload(**payload)
    except (JWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    user = crud.user.get_by_username(db, username=token_data.sub)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user

def get_current_active_user(
    current_user: models.User = Depends(get_current_user),
) -> models.User:
    # if not crud.user.is_active(current_user): # Add is_active to user model/crud if needed
    #     raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")
    return current_user

def get_current_active_superuser(
    current_user: models.User = Depends(get_current_active_user),
) -> models.User:
    if not crud.user.is_superuser(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="The user doesn't have enough privileges"
        )
    return current_user

# Tenant and Role based dependencies
def get_tenant_by_name(
    tenant_name: str = Path(...),
    db: Session = Depends(get_db)
) -> models.Tenant:
    tenant = crud.tenant.get_by_name(db, name=tenant_name)
    if not tenant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tenant not found")
    return tenant

class TenantRoleChecker:
    def __init__(self, required_roles: typing.List[str]):
        self.required_roles = required_roles

    def __call__(
        self,
        current_user: models.User = Depends(get_current_active_user),
        tenant: models.Tenant = Depends(get_tenant_by_name), # Gets tenant from path
        db: Session = Depends(get_db)
    ):
        if current_user.is_super_admin: # Super admin has all permissions
            return

        user_roles_in_tenant = crud.user_tenant_role.get_roles_for_user_in_tenant(
            db, username=current_user.username, tenant_name=tenant.name
        )
        
        actual_roles = {role.role for role in user_roles_in_tenant}
        
        if not any(role in actual_roles for role in self.required_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"User does not have required roles ({', '.join(self.required_roles)}) in tenant '{tenant.name}'"
            )
        return # User has at least one of the required roles
