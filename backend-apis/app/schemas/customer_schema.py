from pydantic import BaseModel
from typing import Optional

class CustomerResponse(BaseModel):
    customer_id: int
    name: str
    age: int
    income: float
    credit_score: int

    class Config:
        orm_mode = True
