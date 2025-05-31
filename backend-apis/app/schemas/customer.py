from pydantic import BaseModel, EmailStr, Field
import typing
import datetime
import uuid
from app.models.customer import GenderEnum, KYCStatusEnum, MaritalStatusEnum

class CustomerBase(BaseModel):
    full_name: str
    email: typing.Optional[EmailStr] = None
    mobile: typing.Optional[str] = None
    dob: typing.Optional[datetime.date] = None
    gender: typing.Optional[GenderEnum] = None
    kyc_status: typing.Optional[KYCStatusEnum] = None
    segment: typing.Optional[str] = None
    occupation: typing.Optional[str] = None
    annual_income: typing.Optional[float] = None # Pydantic handles Numeric from DB as float
    credit_score: typing.Optional[int] = None
    address: typing.Optional[str] = None
    state: typing.Optional[str] = None
    city: typing.Optional[str] = None
    pin_code: typing.Optional[str] = None
    marital_status: typing.Optional[MaritalStatusEnum] = None
    account_age_months: typing.Optional[int] = None
    coomunication_preference: typing.Optional[str] = None
    deceased_marker: typing.Optional[str] = None
    sanctions_marker: typing.Optional[str] = None
    preferred_language: typing.Optional[str] = None
    is_active: bool = True
    account_id: typing.Optional[str] = None
    account_status: typing.Optional[str] = None
    account_openend_date: typing.Optional[str] = None
    credit_limit: typing.Optional[float] = None
    account_current_balance: typing.Optional[float] = None
    available_credit: typing.Optional[float] = None
    delinquency: bool = False

class CustomerCreate(CustomerBase):
    email: EmailStr # Make email required on creation

class CustomerUpdate(BaseModel):
    full_name: typing.Optional[str] = None
    email: typing.Optional[EmailStr] = None
    mobile: typing.Optional[str] = None
    dob: typing.Optional[datetime.date] = None
    gender: typing.Optional[GenderEnum] = None
    kyc_status: typing.Optional[KYCStatusEnum] = None
    segment: typing.Optional[str] = None
    occupation: typing.Optional[str] = None
    annual_income: typing.Optional[float] = None
    credit_score: typing.Optional[int] = None
    address: typing.Optional[str] = None
    state: typing.Optional[str] = None
    city: typing.Optional[str] = None
    pin_code: typing.Optional[str] = None
    marital_status: typing.Optional[MaritalStatusEnum] = None
    account_age_months: typing.Optional[int] = None
    coomunication_preference: typing.Optional[str] = None
    deceased_marker: typing.Optional[str] = None
    sanctions_marker: typing.Optional[str] = None
    preferred_language: typing.Optional[str] = None
    is_active: typing.Optional[bool] = None
    account_id: typing.Optional[str] = None
    account_status: typing.Optional[str] = None
    account_openend_date: typing.Optional[str] = None
    credit_limit: typing.Optional[float] = None
    account_current_balance: typing.Optional[float] = None
    available_credit: typing.Optional[float] = None
    delinquency: typing.Optional[bool] = None

class CustomerInDBBase(CustomerBase):
    id: uuid.UUID
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class Customer(CustomerInDBBase):
    pass

class CustomerInDB(CustomerInDBBase):
    pass
