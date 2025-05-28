from sqlalchemy import Column, String, Boolean, DateTime, func, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base

class User(Base):
    __tablename__ = "users"

    username = Column(String, primary_key=True, index=True, unique=True)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, index=True)
    is_super_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())

    # Relationships
    tenants_created = relationship("Tenant", back_populates="creator")
    offers_created = relationship("Offer", back_populates="creator")
    campaigns_created = relationship("Campaign", back_populates="creator")
    audit_logs_performed = relationship("OfferAuditLog", back_populates="performer")
    
    # Relationship to UserTenantRole for roles in tenants
    tenant_roles = relationship("UserTenantRole", back_populates="user")
