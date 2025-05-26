from sqlalchemy.orm import Session
from schemas.target_customers_schema import TargetCustomerCreate
from crud import target_customers_crud

def get_all_targets(db: Session):
    return target_customers_crud.get_all_targets(db)

def get_targets_by_customer(db: Session, customer_id: int):
    return target_customers_crud.get_targets_by_customer(db, customer_id)

def get_targets_by_offer(db: Session, offer_id: int):
    return target_customers_crud.get_targets_by_offer(db, offer_id)

def create_target(db: Session, target: TargetCustomerCreate):
    return target_customers_crud.create_target(db, target)
