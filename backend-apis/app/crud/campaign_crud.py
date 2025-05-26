from sqlalchemy.orm import Session
from models.campaign import Campaign
from schemas.campaign_schema import CampaignCreate

def get_all_campaigns(db: Session):
    return db.query(Campaign).all()

def get_campaign_by_id(db: Session, campaign_id: int):
    return db.query(Campaign).filter(Campaign.campaign_id == campaign_id).first()

def create_campaign(db: Session, campaign: CampaignCreate):
    db_campaign = Campaign(**campaign.dict())
    db.add(db_campaign)
    db.commit()
    db.refresh(db_campaign)
    return db_campaign

def update_campaign(db: Session, campaign_id: int, updated_data: CampaignCreate):
    db_campaign = get_campaign_by_id(db, campaign_id)
    if db_campaign:
        for key, value in updated_data.dict().items():
            setattr(db_campaign, key, value)
        db.commit()
        db.refresh(db_campaign)
    return db_campaign

def delete_campaign(db: Session, campaign_id: int):
    db_campaign = get_campaign_by_id(db, campaign_id)
    if db_campaign:
        db.delete(db_campaign)
        db.commit()
    return db_campaign
