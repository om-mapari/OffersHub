import enum
import uuid
from sqlalchemy import Column, String, Text, DateTime, func, Date, Boolean, Numeric, Integer, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.session import Base

class GenderEnum(str, enum.Enum):
    male = "male"
    female = "female"
    other = "other"

class KYCStatusEnum(str, enum.Enum):
    verified = "verified"
    pending = "pending"
    rejected = "rejected"

class MaritalStatusEnum(str, enum.Enum):
    single = "single"
    married = "married"
    divorced = "divorced"
    widowed = "widowed"

class Customer(Base):
    __tablename__ = "customers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True)
    mobile = Column(String, unique=True, index=True)
    dob = Column(Date)
    gender = Column(Enum(GenderEnum))
    kyc_status = Column(Enum(KYCStatusEnum))
    segment = Column(String) # e.g., 'premium', 'regular', 'corporate'
    occupation = Column(String)
    annual_income = Column(Numeric)
    credit_score = Column(Integer)
    address = Column(Text)
    state = Column(String)
    city = Column(String)
    pin_code = Column(String)
    marital_status = Column(Enum(MaritalStatusEnum))
    account_age_months = Column(Integer)
    coomunication_preference = Column(String)
    deceased_marker = Column(String)
    sanctions_marker = Column(String)
    preferred_language = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    account_id = Column(String)
    account_status = Column(String)
    account_openend_date = Column(String)
    credit_limit = Column(Numeric)
    account_current_balance = Column(Numeric)
    available_credit = Column(Numeric)
    delinquency = Column(Boolean, default=False)

    # Relationships
    campaign_associations = relationship("CampaignCustomer", back_populates="customer")
