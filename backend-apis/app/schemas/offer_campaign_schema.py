from pydantic import BaseModel

class OfferCampaignCreate(BaseModel):
    offer_id: int
    campaign_id: int

class OfferCampaignRead(OfferCampaignCreate):
    class Config:
        orm_mode = True
