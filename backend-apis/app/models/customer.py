from sqlalchemy import Column, Integer, String, Numeric
from database.connection import Base

class Customer(Base):
    __tablename__ = "customer"

    customer_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    age = Column(Integer)
    income = Column(Numeric(10, 2))
    credit_score = Column(Integer)
