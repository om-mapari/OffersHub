from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database.connection import get_db
from schemas.transaction_schema import TransactionCreate, TransactionRead
from controllers import transaction_controller
from datetime import date

router = APIRouter(prefix="/transactions", tags=["Transactions"])

@router.get("/", response_model=list[TransactionRead])
def get_transactions(db: Session = Depends(get_db)):
    return transaction_controller.get_all_transactions(db)

@router.get("/{transaction_id}", response_model=TransactionRead)
def get_transaction(transaction_id: int, db: Session = Depends(get_db)):
    transaction = transaction_controller.get_transaction(db, transaction_id)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return transaction

@router.post("/", response_model=TransactionRead)
def create_transaction(transaction: TransactionCreate, db: Session = Depends(get_db)):
    return transaction_controller.create_transaction(db, transaction)

@router.get("/by-customer/{customer_id}", response_model=list[TransactionRead])
def get_by_customer(customer_id: int, db: Session = Depends(get_db)):
    return transaction_controller.get_transactions_by_customer(db, customer_id)

@router.get("/by-category/{spend_category}", response_model=list[TransactionRead])
def get_by_category(spend_category: str, db: Session = Depends(get_db)):
    return transaction_controller.get_transactions_by_category(db, spend_category)

@router.get("/by-date-range", response_model=list[TransactionRead])
def get_by_date_range(start: date = Query(...), end: date = Query(...), db: Session = Depends(get_db)):
    return transaction_controller.get_transactions_by_date_range(db, start, end)
