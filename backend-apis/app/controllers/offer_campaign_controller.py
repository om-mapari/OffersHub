from sqlalchemy.orm import Session
from crud import offer_campaign_crud

def link_offer_to_campaign(db: Session, campaign_id: int, offer_id: int):
    return offer_campaign_crud.link_offer_to_campaign(db, offer_id, campaign_id)
