from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from database.connection import get_db
import crud.transaction_crud as transaction_crud
import schemas.transaction_schema as transaction_schema
from datetime import date

router = APIRouter(prefix="/transactions", tags=["Transactions"])

@router.get("/", response_model=List[transaction_schema.TransactionRead])
def list_transactions(db: Session = Depends(get_db)):
    return transaction_crud.get_all_transactions(db)

@router.post("/", response_model=transaction_schema.TransactionRead)
def create_transaction(transaction: transaction_schema.TransactionCreate, db: Session = Depends(get_db)):
    return transaction_crud.create_transaction(db, transaction)

@router.get("/spend-category/{category}", response_model=List[transaction_schema.TransactionRead])
def filter_by_category(category: str, db: Session = Depends(get_db)):
    return transaction_crud.get_transactions_by_category(db, category)

@router.get("/date-range", response_model=List[transaction_schema.TransactionRead])
def filter_by_date_range(
    from_date: date = Query(..., alias="from"),
    to_date: date = Query(..., alias="to"),
    db: Session = Depends(get_db)
):
    return transaction_crud.get_transactions_by_date_range(db, from_date, to_date)
