import enum
import os
from sqlalchemy import Column, Integer, String, Text, DateTime, func, ForeignKey, Enum, JSON
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from app.db.session import Base

class OfferStatus(str, enum.Enum):
    DRAFT = "draft"
    PENDING_REVIEW = "pending_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    RETIRED = "retired"

class OfferType(str, enum.Enum):
    BALANCE_TRANSFER = "balance_transfer"
    PRICING = "pricing"
    CASHBACK = "cashback"
    REWARD_POINTS = "reward_points"
    NO_COST_EMI = "no_cost_emi"
    FEE_WAIVER = "fee_waiver"
    PARTNER_OFFER = "partner_offer"
    MILESTONE_OFFER = "milestone_offer"

class Offer(Base):
    __tablename__ = "offers"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    tenant_name = Column(String, ForeignKey("tenants.name", ondelete="CASCADE"), nullable=False)
    created_by_username = Column(String, ForeignKey("users.username"))
    
    offer_description = Column(Text)
    offer_type = Column(Enum(OfferType), nullable=False, default=OfferType.BALANCE_TRANSFER)
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
