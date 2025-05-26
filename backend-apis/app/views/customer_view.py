# views/customer_view.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database.connection import SessionLocal
from models.customer import Customer
from models.transaction import Transaction
from models.offer import Offer
from models.target_customers import TargetCustomer
from schemas.customer_schema import CustomerResponse
from schemas.transaction_schema import TransactionResponse
from schemas.offer_schema import OfferResponse

router = APIRouter(prefix="/customers", tags=["Customers"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=List[CustomerResponse])
def get_customers(db: Session = Depends(get_db)):
    return db.query(Customer).all()

@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.customer_id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@router.get("/{customer_id}/transactions", response_model=List[TransactionResponse])
def get_customer_transactions(customer_id: int, db: Session = Depends(get_db)):
    return db.query(Transaction).filter(Transaction.customer_id == customer_id).all()

@router.get("/{customer_id}/offers", response_model=List[OfferResponse])
def get_customer_offers(customer_id: int, db: Session = Depends(get_db)):
    return (
        db.query(Offer)
        .join(TargetCustomer, Offer.offer_id == TargetCustomer.offer_id)
        .filter(TargetCustomer.customer_id == customer_id)
        .all()
    )
