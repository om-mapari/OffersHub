from pydantic import BaseModel
import typing
import datetime

class OfferAuditLogBase(BaseModel):
    action: str
    old_data: typing.Optional[typing.Dict[str, typing.Any]] = None
    new_data: typing.Optional[typing.Dict[str, typing.Any]] = None
    comment: typing.Optional[str] = None

class OfferAuditLogCreate(OfferAuditLogBase):
    offer_id: int
    # performed_by_username will be set by system

class OfferAuditLogInDBBase(OfferAuditLogBase):
    id: int
    offer_id: int
    performed_by_username: typing.Optional[str] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class OfferAuditLog(OfferAuditLogInDBBase):
    pass
