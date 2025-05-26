from sqlalchemy import Column, Integer, String, DECIMAL, Boolean, Date
from database.connection import Base

class Offer(Base):
    __tablename__ = "offer"

    offer_id = Column(Integer, primary_key=True, index=True)
    offer_name = Column(String(100))
    offer_type = Column(String(50))
    cashback_percentage = Column(DECIMAL(5, 2))
    discount_amount = Column(DECIMAL(10, 2))
    reward_points = Column(DECIMAL(10, 2))
    interest_rate = Column(DECIMAL(5, 2))
    fee_waiver = Column(Boolean)
    miles_earned = Column(DECIMAL(10, 2))
    category = Column(String(50))
    valid_from = Column(Date)
    valid_to = Column(Date)
    status = Column(String(50))
