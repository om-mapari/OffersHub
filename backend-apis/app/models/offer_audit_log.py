from sqlalchemy import Column, Integer, String, Text, DateTime, func, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
import os
from app.db.session import Base

class OfferAuditLog(Base):
    __tablename__ = "offer_audit_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    offer_id = Column(Integer, ForeignKey("offers.id", ondelete="CASCADE"), nullable=False)
    action = Column(String, nullable=False) # 'create', 'update', 'status_change', 'comment'
    performed_by_username = Column(String, ForeignKey("users.username"))
    # Use JSON type for SQLite and JSONB for PostgreSQL
    old_data = Column(JSON if os.environ.get("TESTING") == "true" else JSONB)
    new_data = Column(JSON if os.environ.get("TESTING") == "true" else JSONB)
    comment = Column(Text)
    created_at = Column(DateTime, default=func.now())

    # Relationships
    offer = relationship("Offer", back_populates="audit_logs")
    performer = relationship("User", back_populates="audit_logs_performed")
