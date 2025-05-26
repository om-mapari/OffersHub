from pydantic import BaseModel
from typing import Optional
from datetime import date

class CampaignCreate(BaseModel):
    campaign_name: str
    start_date: date
    end_date: date
    budget: float
    status: str

class CampaignResponse(CampaignCreate):
    campaign_id: int

    class Config:
        orm_mode = True
