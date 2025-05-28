import typing
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api.v1 import deps
from app.core.config import settings # For default roles

router = APIRouter()

@router.post("/", response_model=schemas.Tenant, status_code=status.HTTP_201_CREATED)
def create_tenant(
    *,
    db: Session = Depends(deps.get_db),
    tenant_in: schemas.TenantCreate,
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> typing.Any:
    """
    Create new tenant. (Super Admin only)
    Conceptually, default user groups (roles) are available for this tenant.
    """
    tenant = crud.tenant.get_by_name(db, name=tenant_in.name)
    if tenant:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The tenant with this name already exists in the system.",
        )
    # The creator is the super admin performing the action
    tenant = crud.tenant.create_with_owner(db=db, obj_in=tenant_in, creator_username=current_user.username)
    
    # Here you could add logic from tenant_service.py if needed, e.g.,
    # if specific records for default roles needed to be created per tenant.
    # For now, roles are just strings defined in settings.DEFAULT_TENANT_ROLES.
    return tenant

@router.get("/", response_model=typing.List[schemas.Tenant])
def read_tenants(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> typing.Any:
    """
    Retrieve all tenants. (Super Admin only)
    """
    tenants = crud.tenant.get_multi(db, skip=skip, limit=limit)
    return tenants

@router.get("/{tenant_name}", response_model=schemas.Tenant)
def read_tenant_by_name(
    tenant_name: str,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> typing.Any:
    """
    Get a specific tenant by name. (Super Admin only)
    """
    tenant = crud.tenant.get_by_name(db, name=tenant_name)
    if not tenant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tenant not found")
    return tenant

@router.put("/{tenant_name}", response_model=schemas.Tenant)
def update_tenant(
    *,
    db: Session = Depends(deps.get_db),
    tenant_name: str,
    tenant_in: schemas.TenantUpdate,
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> typing.Any:
    """
    Update a tenant's details. (Super Admin only)
    Name cannot be updated as it's a PK.
    """
    tenant = crud.tenant.get_by_name(db, name=tenant_name)
    if not tenant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tenant not found")
    tenant = crud.tenant.update(db, db_obj=tenant, obj_in=tenant_in)
    return tenant

@router.delete("/{tenant_name}", response_model=schemas.Msg)
def delete_tenant(
    *,
    db: Session = Depends(deps.get_db),
    tenant_name: str,
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> typing.Any:
    """
    Delete a tenant. (Super Admin only)
    This will cascade delete related offers, campaigns, user_tenant_roles due to DB constraints.
    """
    tenant = crud.tenant.get_by_name(db, name=tenant_name)
    if not tenant:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tenant not found")
    
    # The CRUDBase remove method expects an 'id'. Tenant PK is 'name'.
    # So, we fetch by name and then delete the object.
    db.delete(tenant)
    db.commit()
    return {"msg": f"Tenant '{tenant_name}' deleted successfully"}
