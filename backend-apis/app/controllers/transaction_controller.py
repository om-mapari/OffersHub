from sqlalchemy.orm import Session
from schemas.transaction_schema import TransactionCreate
from crud import transaction_crud
from datetime import date

def get_all_transactions(db: Session):
    return transaction_crud.get_all_transactions(db)

def get_transaction(db: Session, transaction_id: int):
    return transaction_crud.get_transaction_by_id(db, transaction_id)

def create_transaction(db: Session, transaction: TransactionCreate):
    return transaction_crud.create_transaction(db, transaction)

def get_transactions_by_customer(db: Session, customer_id: int):
    return transaction_crud.get_transactions_by_customer(db, customer_id)

def get_transactions_by_category(db: Session, spend_category: str):
    return transaction_crud.get_transactions_by_category(db, spend_category)

def get_transactions_by_date_range(db: Session, start: date, end: date):
    return transaction_crud.get_transactions_by_date_range(db, start, end)
