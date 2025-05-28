from pydantic import BaseModel, Field
import typing
import datetime
from app.models.offer import OfferStatus # Import Enum for schema use

class OfferBase(BaseModel):
    data: typing.Dict[str, typing.Any] = Field(..., example={"product_name": "Gold Card", "interest_rate": 12.5})
    comments: typing.Optional[str] = None

class OfferCreate(OfferBase):
    pass # tenant_name and created_by_username will be set by system/path

class OfferUpdate(BaseModel):
    data: typing.Optional[typing.Dict[str, typing.Any]] = None
    comments: typing.Optional[str] = None
    status: typing.Optional[OfferStatus] = None # Allow admin to change status directly sometimes

class OfferStatusUpdate(BaseModel):
    status: OfferStatus
    comments: typing.Optional[str] = None # e.g. for rejection reason

class OfferCommentCreate(BaseModel):
    comment_text: str

class OfferInDBBase(OfferBase):
    id: int
    tenant_name: str
    created_by_username: typing.Optional[str] = None
    status: OfferStatus
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True

class Offer(OfferInDBBase):
    pass

class OfferInDB(OfferInDBBase):
    pass
