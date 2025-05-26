from sqlalchemy.orm import Session
from schemas.campaign_schema import CampaignCreate
from crud import campaign_crud

def get_all_campaigns(db: Session):
    return campaign_crud.get_all_campaigns(db)

def get_campaign(db: Session, campaign_id: int):
    return campaign_crud.get_campaign_by_id(db, campaign_id)

def create_campaign(db: Session, campaign: CampaignCreate):
    return campaign_crud.create_campaign(db, campaign)

def update_campaign(db: Session, campaign_id: int, campaign_data: CampaignCreate):
    return campaign_crud.update_campaign(db, campaign_id, campaign_data)

def delete_campaign(db: Session, campaign_id: int):
    return campaign_crud.delete_campaign(db, campaign_id)
