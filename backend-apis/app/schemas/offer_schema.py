from pydantic import BaseModel
from typing import Optional
from datetime import date

class OfferCreate(BaseModel):
    offer_name: str
    offer_type: str
    cashback_percentage: Optional[float]
    discount_amount: Optional[float]
    reward_points: Optional[float]
    interest_rate: Optional[float]
    fee_waiver: Optional[bool]
    miles_earned: Optional[float]
    category: Optional[str]
    valid_from: Optional[date]
    valid_to: Optional[date]
    status: Optional[str]

class OfferResponse(OfferCreate):
    offer_id: int

    class Config:
        orm_mode = True
