from sqlalchemy.orm import Session
from models.transaction import Transaction
from schemas.transaction_schema import TransactionCreate
from datetime import date

def get_all_transactions(db: Session):
    return db.query(Transaction).all()

def get_transaction_by_id(db: Session, transaction_id: int):
    return db.query(Transaction).filter(Transaction.transaction_id == transaction_id).first()

def create_transaction(db: Session, transaction: TransactionCreate):
    db_transaction = Transaction(**transaction.dict())
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

def get_transactions_by_customer(db: Session, customer_id: int):
    return db.query(Transaction).filter(Transaction.customer_id == customer_id).all()

def get_transactions_by_category(db: Session, spend_category: str):
    return db.query(Transaction).filter(Transaction.spend_category == spend_category).all()

def get_transactions_by_date_range(db: Session, start: date, end: date):
    return db.query(Transaction).filter(Transaction.transaction_date.between(start, end)).all()
