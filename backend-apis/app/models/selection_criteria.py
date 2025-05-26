from sqlalchemy import Column, Integer, String, ForeignKey
from database.connection import Base

class SelectionCriteria(Base):
    __tablename__ = "selection_criteria"

    criteria_id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("campaign.campaign_id"))
    table_reference = Column(String(100))
    field_name = Column(String(100))
    condition_operator = Column(String(20))
    value = Column(String(100))

class SelectionFieldMaster(Base):
    __tablename__ = "selection_field_master"

    field_id = Column(Integer, primary_key=True, index=True)
    table_reference = Column(String(100))
    field_name = Column(String(100))
    allowed_operators = Column(String)
