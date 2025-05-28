import typing
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api.v1 import deps

router = APIRouter()

@router.get("/me", response_model=schemas.User)
def read_users_me(
    current_user: models.User = Depends(deps.get_current_active_user),
) -> typing.Any:
    """
    Get current user.
    """
    return current_user

@router.get("/me/tenants", response_model=typing.List[schemas.UserTenantInfo])
def read_my_tenants_and_roles(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> typing.Any:
    """
    Get tenants and associated roles for the current authenticated user.
    """
    user_roles_raw = crud.user_tenant_role.get_roles_for_user(db, username=current_user.username)
    
    # Group roles by tenant
    tenants_map = {}
    for utr in user_roles_raw:
        if utr.tenant_name not in tenants_map:
            tenants_map[utr.tenant_name] = []
        tenants_map[utr.tenant_name].append(utr.role)
        
    result = [
        schemas.UserTenantInfo(tenant_name=tenant_name, roles=roles)
        for tenant_name, roles in tenants_map.items()
    ]
    return result
