from sqlalchemy import Column, Integer, String, ForeignKey
from database.connection import Base

class TargetCustomer(Base):
    __tablename__ = "target_customers"

    target_id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customer.customer_id"))
    offer_id = Column(Integer, ForeignKey("offer.offer_id"))
    status = Column(String(50))
