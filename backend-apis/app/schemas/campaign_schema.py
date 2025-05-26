from pydantic import BaseModel
from datetime import date

class CampaignCreate(BaseModel):
    campaign_id: int
    campaign_name: str
    start_date: date
    end_date: date
    budget: float
    status: str

class CampaignRead(CampaignCreate):
    class Config:
        orm_mode = True
