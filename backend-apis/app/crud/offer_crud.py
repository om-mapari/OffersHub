from sqlalchemy.orm import Session
from models.offer import Offer

def get_all_offers(db: Session):
    return db.query(Offer).all()

def get_offer_by_id(db: Session, offer_id: int):
    return db.query(Offer).filter(Offer.offer_id == offer_id).first()
