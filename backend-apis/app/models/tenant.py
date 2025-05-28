from sqlalchemy import Column, String, Text, DateTime, func, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base

class Tenant(Base):
    __tablename__ = "tenants"

    name = Column(String, primary_key=True, index=True, unique=True) # e.g., 'credit_card', 'loan'
    description = Column(Text)
    created_by_username = Column(String, ForeignKey("users.username"))
    created_at = Column(DateTime, default=func.now())

    # Relationships
    creator = relationship("User", back_populates="tenants_created")
    offers = relationship("Offer", back_populates="tenant", cascade="all, delete-orphan")
    campaigns = relationship("Campaign", back_populates="tenant", cascade="all, delete-orphan")
    
    # Relationship to UserTenantRole for users and their roles in this tenant
    user_roles = relationship("UserTenantRole", back_populates="tenant")
