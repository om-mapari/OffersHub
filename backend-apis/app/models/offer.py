from sqlalchemy import Column, Integer, String, Numeric, Boolean, Date
from db.base import Base

class Offer(Base):
    __tablename__ = "offer"

    offer_id = Column(Integer, primary_key=True, index=True)
    offer_name = Column(String(100))
    offer_type = Column(String(50))
    cashback_percentage = Column(Numeric(5, 2))
    discount_amount = Column(Numeric(10, 2))
    reward_points = Column(Numeric(10, 2))
    interest_rate = Column(Numeric(5, 2))
    fee_waiver = Column(Boolean)
    miles_earned = Column(Numeric(10, 2))
    category = Column(String(50))
    valid_from = Column(Date)
    valid_to = Column(Date)
    status = Column(String(50))
