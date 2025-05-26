from sqlalchemy.orm import Session
from models.target_customers import TargetCustomer
from schemas.target_customers_schema import TargetCustomerCreate

def get_all_targets(db: Session):
    return db.query(TargetCustomer).all()

def get_targets_by_customer(db: Session, customer_id: int):
    return db.query(TargetCustomer).filter(TargetCustomer.customer_id == customer_id).all()

def get_targets_by_offer(db: Session, offer_id: int):
    return db.query(TargetCustomer).filter(TargetCustomer.offer_id == offer_id).all()

def create_target(db: Session, target: TargetCustomerCreate):
    db_target = TargetCustomer(**target.dict())
    db.add(db_target)
    db.commit()
    db.refresh(db_target)
    return db_target
