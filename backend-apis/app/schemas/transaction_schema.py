from pydantic import BaseModel
from datetime import date
from typing import Optional

class TransactionCreate(BaseModel):
    customer_id: int
    transaction_date: date
    amount: float
    spend_category: str

class TransactionRead(TransactionCreate):
    transaction_id: int

    class Config:
        orm_mode = True
