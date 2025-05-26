from sqlalchemy.orm import Session
from models.transaction import Transaction
from schemas.transaction_schema import TransactionCreate
from datetime import date
from typing import List

def get_all_transactions(db: Session) -> List[Transaction]:
    return db.query(Transaction).all()

def create_transaction(db: Session, transaction: TransactionCreate) -> Transaction:
    db_transaction = Transaction(**transaction.dict())
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

def get_transactions_by_category(db: Session, category: str) -> List[Transaction]:
    return db.query(Transaction).filter(Transaction.spend_category == category).all()

def get_transactions_by_date_range(db: Session, from_date: date, to_date: date) -> List[Transaction]:
    return db.query(Transaction).filter(
        Transaction.transaction_date.between(from_date, to_date)
    ).all()
