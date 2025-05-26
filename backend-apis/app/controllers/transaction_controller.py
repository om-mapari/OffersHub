from sqlalchemy.orm import Session
from schemas.transaction_schema import TransactionCreate
import crud.transaction_crud as transaction_crud
from datetime import date

def get_transactions(db: Session):
    return transaction_crud.get_all_transactions(db)

def create_transaction(db: Session, transaction: TransactionCreate):
    return transaction_crud.create_transaction(db, transaction)

def get_transactions_by_category(db: Session, category: str):
    return transaction_crud.get_transactions_by_category(db, category)

def get_transactions_by_date_range(db: Session, from_date: date, to_date: date):
    return transaction_crud.get_transactions_by_date_range(db, from_date, to_date)
