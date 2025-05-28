import enum
import uuid
from sqlalchemy import Column, String, Text, DateTime, func, Date, Boolean, Numeric, Integer, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.session import Base

class GenderEnum(str, enum.Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"

class KYCStatusEnum(str, enum.Enum):
    VERIFIED = "verified"
    PENDING = "pending"
    REJECTED = "rejected"

class MaritalStatusEnum(str, enum.Enum):
    SINGLE = "single"
    MARRIED = "married"
    DIVORCED = "divorced"
    WIDOWED = "widowed"

class Customer(Base):
    __tablename__ = "customers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True)
    phone = Column(String, unique=True, index=True) # Assuming phone should be unique too
    dob = Column(Date)
    gender = Column(Enum(GenderEnum))
    kyc_status = Column(Enum(KYCStatusEnum))
    segment = Column(String) # e.g., 'premium', 'regular', 'corporate'
    occupation = Column(String)
    annual_income = Column(Numeric)
    credit_score = Column(Integer)
    state = Column(String)
    city = Column(String)
    pin_code = Column(String)
    marital_status = Column(Enum(MaritalStatusEnum))
    account_age_months = Column(Integer)
    preferred_language = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())

    # Relationships
    campaign_associations = relationship("CampaignCustomer", back_populates="customer")
