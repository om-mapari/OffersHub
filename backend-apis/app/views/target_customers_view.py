from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.connection import get_db
from schemas.target_customers_schema import TargetCustomerCreate, TargetCustomerRead
from controllers import target_customers_controller

router = APIRouter(prefix="/target-customers", tags=["Target Customers"])

@router.get("/", response_model=list[TargetCustomerRead])
def get_all_targets(db: Session = Depends(get_db)):
    return target_customers_controller.get_all_targets(db)

@router.get("/by-customer/{customer_id}", response_model=list[TargetCustomerRead])
def get_targets_by_customer(customer_id: int, db: Session = Depends(get_db)):
    return target_customers_controller.get_targets_by_customer(db, customer_id)

@router.get("/by-offer/{offer_id}", response_model=list[TargetCustomerRead])
def get_targets_by_offer(offer_id: int, db: Session = Depends(get_db)):
    return target_customers_controller.get_targets_by_offer(db, offer_id)

@router.post("/", response_model=TargetCustomerRead)
def create_target(target: TargetCustomerCreate, db: Session = Depends(get_db)):
    return target_customers_controller.create_target(db, target)
