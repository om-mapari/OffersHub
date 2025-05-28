from pydantic import BaseModel, constr
import typing
import datetime

class TenantBase(BaseModel):
    name: constr(min_length=3, max_length=50) # e.g. credit_card
    description: typing.Optional[str] = None

class TenantCreate(TenantBase):
    pass

class TenantUpdate(BaseModel):
    description: typing.Optional[str] = None

class TenantInDBBase(TenantBase):
    name: str # Override to make it required
    created_by_username: typing.Optional[str] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class Tenant(TenantInDBBase):
    pass

class TenantInDB(TenantInDBBase):
    pass
