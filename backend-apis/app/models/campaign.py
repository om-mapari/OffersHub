from sqlalchemy import Column, Integer, String, Date, Numeric
from database.connection import Base

class Campaign(Base):
    __tablename__ = "campaign"

    campaign_id = Column(Integer, primary_key=True, index=True)
    campaign_name = Column(String(100))
    start_date = Column(Date)
    end_date = Column(Date)
    budget = Column(Numeric(15, 2))
    status = Column(String(50))
