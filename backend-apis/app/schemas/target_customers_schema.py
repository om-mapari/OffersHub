from pydantic import BaseModel

class TargetCustomerCreate(BaseModel):
    target_id: int
    customer_id: int
    offer_id: int
    status: str

class TargetCustomerRead(TargetCustomerCreate):
    class Config:
        orm_mode = True
