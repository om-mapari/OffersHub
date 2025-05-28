import typing
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api.v1 import deps
from app.core.config import settings # For default roles

router = APIRouter()

@router.post("/", response_model=schemas.UserTenantRole, status_code=status.HTTP_201_CREATED)
def assign_role_to_user_in_tenant(
    *,
    db: Session = Depends(deps.get_db),
    role_assignment_in: schemas.UserTenantRoleCreate,
    current_super_user: models.User = Depends(deps.get_current_active_superuser),
) -> typing.Any:
    """
    Assign a role to a user for a specific tenant. (Super Admin only)
    """
    user = crud.user.get_by_username(db, username=role_assignment_in.username)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User '{role_assignment_in.username}' not found")
    
    tenant = crud.tenant.get_by_name(db, name=role_assignment_in.tenant_name)
    if not tenant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Tenant '{role_assignment_in.tenant_name}' not found")

    if role_assignment_in.role not in settings.DEFAULT_TENANT_ROLES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role '{role_assignment_in.role}'. Allowed roles: {', '.join(settings.DEFAULT_TENANT_ROLES)}"
        )

    existing_role = crud.user_tenant_role.get(
        db, 
        username=role_assignment_in.username, 
        tenant_name=role_assignment_in.tenant_name, 
        role=role_assignment_in.role
    )
    if existing_role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User '{role_assignment_in.username}' already has role '{role_assignment_in.role}' in tenant '{role_assignment_in.tenant_name}'"
        )
    
    user_tenant_role = crud.user_tenant_role.create(db, obj_in=role_assignment_in)
    return user_tenant_role

@router.get("/", response_model=typing.List[schemas.UserTenantRole])
def list_user_tenant_roles(
    db: Session = Depends(deps.get_db),
    username: str = None,
    tenant_name: str = None,
    current_super_user: models.User = Depends(deps.get_current_active_superuser),
) -> typing.Any:
    """
    List all user-tenant role assignments, optionally filtered by username and/or tenant_name. (Super Admin only)
    """
    if username and tenant_name:
        roles = crud.user_tenant_role.get_roles_for_user_in_tenant(db, username=username, tenant_name=tenant_name)
    elif username:
        roles = crud.user_tenant_role.get_roles_for_user(db, username=username)
    elif tenant_name: # Need a new CRUD method for this or query directly
        roles = db.query(models.UserTenantRole).filter(models.UserTenantRole.tenant_name == tenant_name).all()
    else:
        roles = db.query(models.UserTenantRole).all()
    return roles

@router.delete("/", response_model=schemas.Msg) # Using POST for delete with body, or use query params
def remove_role_from_user_in_tenant(
    *,
    db: Session = Depends(deps.get_db),
    role_removal_in: schemas.UserTenantRoleDelete, # Use a schema for the body
    current_super_user: models.User = Depends(deps.get_current_active_superuser),
) -> typing.Any:
    """
    Remove a specific role from a user for a tenant. (Super Admin only)
    """
    removed_role = crud.user_tenant_role.remove(
        db,
        username=role_removal_in.username,
        tenant_name=role_removal_in.tenant_name,
        role=role_removal_in.role
    )
    if not removed_role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Role assignment not found for user '{role_removal_in.username}', tenant '{role_removal_in.tenant_name}', role '{role_removal_in.role}'"
        )
    return {"msg": "Role assignment removed successfully"}
