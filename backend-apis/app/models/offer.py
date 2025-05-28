import enum
import os
from sqlalchemy import Column, Integer, String, Text, DateTime, func, ForeignKey, Enum, JSON
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from app.db.session import Base

class OfferStatus(str, enum.Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    APPROVED = "approved"
    REJECTED = "rejected"

class Offer(Base):
    __tablename__ = "offers"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    tenant_name = Column(String, ForeignKey("tenants.name", ondelete="CASCADE"), nullable=False)
    created_by_username = Column(String, ForeignKey("users.username"))
    
    status = Column(Enum(OfferStatus), nullable=False, default=OfferStatus.DRAFT)
    comments = Column(Text)
    # Use JSON type for SQLite and JSONB for PostgreSQL
    data = Column(JSON if os.environ.get("TESTING") == "true" else JSONB, nullable=False) # Flexible custom attributes
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now()) # Relies on DB trigger for precise onupdate

    # Relationships
    tenant = relationship("Tenant", back_populates="offers")
    creator = relationship("User", back_populates="offers_created")
    audit_logs = relationship("OfferAuditLog", back_populates="offer", cascade="all, delete-orphan")
    campaigns = relationship("Campaign", back_populates="offer") # An offer can be in multiple campaigns
    campaign_customers = relationship("CampaignCustomer", back_populates="offer", cascade="all, delete-orphan")
