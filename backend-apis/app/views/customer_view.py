from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.connection import get_db
from schemas.customer_schema import CustomerCreate, CustomerRead
from controllers import customer_controller

router = APIRouter(prefix="/customers", tags=["Customers"])

@router.get("/", response_model=list[CustomerRead])
def get_customers(db: Session = Depends(get_db)):
    return customer_controller.get_all_customers(db)

@router.get("/{customer_id}", response_model=CustomerRead)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    customer = customer_controller.get_customer(db, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@router.post("/", response_model=CustomerRead)
def create_customer(customer: CustomerCreate, db: Session = Depends(get_db)):
    return customer_controller.create_customer(db, customer)

@router.put("/{customer_id}", response_model=CustomerRead)
def update_customer(customer_id: int, customer_data: CustomerCreate, db: Session = Depends(get_db)):
    updated = customer_controller.update_customer(db, customer_id, customer_data)
    if not updated:
        raise HTTPException(status_code=404, detail="Customer not found")
    return updated

@router.delete("/{customer_id}")
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    deleted = customer_controller.delete_customer(db, customer_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Customer not found")
    return {"detail": "Customer deleted successfully"}
