from sqlalchemy.orm import Session
from models.offer_campaign import OfferCampaign

def link_offer_to_campaign(db: Session, offer_id: int, campaign_id: int):
    mapping = OfferCampaign(offer_id=offer_id, campaign_id=campaign_id)
    db.add(mapping)
    db.commit()
    db.refresh(mapping)
    return mapping
