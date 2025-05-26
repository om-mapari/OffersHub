from sqlalchemy import Column, Integer, Date, Numeric, String, ForeignKey
from database.base import Base

class Transaction(Base):
    __tablename__ = "transaction"

    transaction_id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customer.customer_id"))
    transaction_date = Column(Date)
    amount = Column(Numeric(10, 2))
    spend_category = Column(String(100))
