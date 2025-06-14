import enum
from sqlalchemy import Column, Integer, DateTime, func, ForeignKey, String, Enum, PrimaryKeyConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.session import Base

class DeliveryStatus(str, enum.Enum):
    pending = "pending"
    sent = "sent"
    declined = "declined"
    accepted = "accepted"

class CampaignCustomer(Base):
    __tablename__ = "campaign_customers"

    campaign_id = Column(Integer, ForeignKey("campaigns.id", ondelete="CASCADE"))
    customer_id = Column(UUID(as_uuid=True), ForeignKey("customers.id", ondelete="CASCADE"))
    offer_id = Column(Integer, ForeignKey("offers.id", ondelete="CASCADE"), nullable=False) # Which offer was sent
    tenant_name = Column(String, ForeignKey("tenants.name", ondelete="CASCADE"), nullable=False)
    
    delivery_status = Column(Enum(DeliveryStatus), default=DeliveryStatus.pending)
    sent_at = Column(DateTime, nullable=True)

    __table_args__ = (
        PrimaryKeyConstraint('campaign_id', 'customer_id'),
        {},
    )

    # Relationships
    campaign = relationship("Campaign", back_populates="customer_associations")
    customer = relationship("Customer", back_populates="campaign_associations")
    offer = relationship("Offer", back_populates="campaign_customers")
    tenant = relationship("Tenant", back_populates="campaign_customers")
