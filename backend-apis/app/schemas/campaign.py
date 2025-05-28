from pydantic import BaseModel, Field
import typing
import datetime
from app.models.campaign import CampaignStatus

class CampaignBase(BaseModel):
    name: str
    offer_id: typing.Optional[int] = None # Can be null if offer deleted, or not yet assigned
    description: typing.Optional[str] = None
    selection_criteria: typing.Optional[typing.Dict[str, typing.Any]] = Field(None, example={"segment": "premium"})
    start_date: datetime.date
    end_date: datetime.date

class CampaignCreate(CampaignBase):
    # tenant_name and created_by_username from path/system
    pass

class CampaignUpdate(BaseModel):
    name: typing.Optional[str] = None
    offer_id: typing.Optional[int] = None
    description: typing.Optional[str] = None
    selection_criteria: typing.Optional[typing.Dict[str, typing.Any]] = None
    start_date: typing.Optional[datetime.date] = None
    end_date: typing.Optional[datetime.date] = None
    status: typing.Optional[CampaignStatus] = None

class CampaignStatusUpdate(BaseModel):
    status: CampaignStatus

class CampaignInDBBase(CampaignBase):
    id: int
    tenant_name: str
    created_by_username: typing.Optional[str] = None
    status: CampaignStatus
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class Campaign(CampaignInDBBase):
    pass

class CampaignInDB(CampaignInDBBase):
    pass
