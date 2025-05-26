from sqlalchemy.orm import Session
from models.campaign import Campaign
from models.offer import Offer
from models.offer_campaign import OfferCampaign
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

def update_campaign(db: Session, campaign_id: int, campaign_data: CampaignCreate):
    campaign = get_campaign_by_id(db, campaign_id)
    if campaign:
        for key, value in campaign_data.dict(exclude_unset=True).items():
            setattr(campaign, key, value)
        db.commit()
        db.refresh(campaign)
    return campaign

def delete_campaign(db: Session, campaign_id: int):
    campaign = get_campaign_by_id(db, campaign_id)
    if campaign:
        db.delete(campaign)
        db.commit()
    return campaign

def get_offers_by_campaign(db: Session, campaign_id: int):
    return db.query(Offer).join(OfferCampaign).filter(OfferCampaign.campaign_id == campaign_id).all()
