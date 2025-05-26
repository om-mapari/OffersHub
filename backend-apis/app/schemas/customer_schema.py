from pydantic import BaseModel

class CustomerCreate(BaseModel):
    customer_id: int
    name: str
    age: int
    income: float
    credit_score: int

class CustomerRead(BaseModel):
    customer_id: int
    name: str
    age: int
    income: float
    credit_score: int

    class Config:
        orm_mode = True
