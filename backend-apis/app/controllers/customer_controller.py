from sqlalchemy.orm import Session
from schemas.customer_schema import CustomerCreate
from crud import customer_crud

def get_all_customers(db: Session):
    return customer_crud.get_all_customers(db)

def get_customer(db: Session, customer_id: int):
    return customer_crud.get_customer_by_id(db, customer_id)

def create_customer(db: Session, customer: CustomerCreate):
    return customer_crud.create_customer(db, customer)

def update_customer(db: Session, customer_id: int, customer_data: CustomerCreate):
    return customer_crud.update_customer(db, customer_id, customer_data)

def delete_customer(db: Session, customer_id: int):
    return customer_crud.delete_customer(db, customer_id)
