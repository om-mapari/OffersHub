from pydantic import BaseModel
from datetime import date

class TransactionCreate(BaseModel):
    transaction_id: int
    customer_id: int
    transaction_date: date
    amount: float
    spend_category: str

class TransactionRead(TransactionCreate):
    class Config:
        orm_mode = True
