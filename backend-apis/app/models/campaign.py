import enum
import os
from sqlalchemy import Column, Integer, String, Text, DateTime, func, ForeignKey, Date, Enum, JSON
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from app.db.session import Base

class CampaignStatus(str, enum.Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"

class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    tenant_name = Column(String, ForeignKey("tenants.name", ondelete="CASCADE"), nullable=False)
    offer_id = Column(Integer, ForeignKey("offers.id", ondelete="SET NULL"), nullable=True) # Can be NULL if offer deleted
    name = Column(String, nullable=False)
    description = Column(Text)
    # Use JSON type for SQLite and JSONB for PostgreSQL
    selection_criteria = Column(JSON if os.environ.get("TESTING") == "true" else JSONB) # e.g., {"segment": "premium", "kyc_status": "verified"}
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    created_by_username = Column(String, ForeignKey("users.username"))
    status = Column(Enum(CampaignStatus), default=CampaignStatus.DRAFT)
    created_at = Column(DateTime, default=func.now())

    # Relationships
    tenant = relationship("Tenant", back_populates="campaigns")
    offer = relationship("Offer", back_populates="campaigns")
    creator = relationship("User", back_populates="campaigns_created")
    customer_associations = relationship("CampaignCustomer", back_populates="campaign", cascade="all, delete-orphan")
