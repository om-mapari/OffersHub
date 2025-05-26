from sqlalchemy import Column, Integer, Date, DECIMAL, String, ForeignKey
from db.base import Base

class Transaction(Base):
    __tablename__ = "transaction"

    transaction_id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customer.customer_id"), nullable=False)
    transaction_date = Column(Date, nullable=False)
    amount = Column(DECIMAL(10, 2), nullable=False)
    spend_category = Column(String(100), nullable=False)
