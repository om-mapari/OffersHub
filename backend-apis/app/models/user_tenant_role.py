from sqlalchemy import Column, String, ForeignKey, PrimaryKeyConstraint
from sqlalchemy.orm import relationship
from app.db.session import Base

class UserTenantRole(Base):
    __tablename__ = "user_tenant_roles"

    username = Column(String, ForeignKey("users.username", ondelete="CASCADE"))
    tenant_name = Column(String, ForeignKey("tenants.name", ondelete="CASCADE"))
    role = Column(String, nullable=False) # 'admin', 'create', 'approver', 'read_only'

    __table_args__ = (
        PrimaryKeyConstraint('username', 'tenant_name', 'role'),
        {},
    )

    # Relationships
    user = relationship("User", back_populates="tenant_roles")
    tenant = relationship("Tenant", back_populates="user_roles")
