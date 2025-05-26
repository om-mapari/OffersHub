from pydantic import BaseModel
from datetime import date

class TransactionResponse(BaseModel):
    transaction_id: int
    customer_id: int
    transaction_date: date
    amount: float
    spend_category: str

    class Config:
        orm_mode = True
