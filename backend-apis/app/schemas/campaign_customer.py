from pydantic import BaseModel
import datetime
import uuid
import typing
from app.models.campaign_customer import DeliveryStatus

class CampaignCustomerBase(BaseModel):
    campaign_id: int
    customer_id: uuid.UUID
    offer_id: int # Which offer was sent to this customer in this campaign

class CampaignCustomerCreate(CampaignCustomerBase):
    # delivery_status defaults to pending
    pass

class CampaignCustomerDeliveryUpdate(BaseModel):
    delivery_status: DeliveryStatus
    sent_at: typing.Optional[datetime.datetime] = None

class CampaignCustomerInDBBase(CampaignCustomerBase):
    delivery_status: DeliveryStatus
    sent_at: typing.Optional[datetime.datetime] = None

    class Config:
        from_attributes = True

class CampaignCustomer(CampaignCustomerInDBBase):
    pass

class CampaignCustomerInDB(CampaignCustomerInDBBase):
    pass
