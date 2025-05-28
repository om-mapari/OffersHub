import typing
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import uuid

from app import crud, models, schemas
from app.api.v1 import deps # For superuser or specific data management role

router = APIRouter()

# Customer management might be restricted to Super Admins or specific roles
# For simplicity, let's assume Super Admin for now.
@router.post("/", response_model=schemas.Customer, status_code=status.HTTP_201_CREATED)
def create_customer(
    *,
    db: Session = Depends(deps.get_db),
    customer_in: schemas.CustomerCreate,
    current_user: models.User = Depends(deps.get_current_active_superuser), # Or a dedicated role
) -> typing.Any:
    """
    Add a new customer.
    """
    customer = crud.customer.get_by_email(db, email=customer_in.email)
    if customer:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The customer with this email already exists.",
        )
    customer = crud.customer.create(db, obj_in=customer_in)
    return customer

@router.get("/", response_model=typing.List[schemas.Customer])
def list_customers(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_superuser), # Or a dedicated role
) -> typing.Any:
    """
    List customers.
    """
    customers = crud.customer.get_multi(db, skip=skip, limit=limit)
    return customers

@router.get("/{customer_id}", response_model=schemas.Customer)
def read_customer(
    customer_id: uuid.UUID,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_superuser), # Or a dedicated role
) -> typing.Any:
    """
    Get a specific customer by ID.
    """
    customer = crud.customer.get(db, id=customer_id)
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    return customer

# Add PUT and DELETE for customers
