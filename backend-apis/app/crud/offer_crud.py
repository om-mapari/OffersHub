from sqlalchemy.orm import Session
from models.offer import Offer
from schemas.offer_schema import OfferCreate
from datetime import date

def get_all_offers(db: Session):
    return db.query(Offer).all()

def get_offer_by_id(db: Session, offer_id: int):
    return db.query(Offer).filter(Offer.offer_id == offer_id).first()

def create_offer(db: Session, offer: OfferCreate):
    db_offer = Offer(**offer.dict())
    db.add(db_offer)
    db.commit()
    db.refresh(db_offer)
    return db_offer

def update_offer(db: Session, offer_id: int, offer_data: OfferCreate):
    offer = get_offer_by_id(db, offer_id)
    if offer:
        for key, value in offer_data.dict(exclude_unset=True).items():
            setattr(offer, key, value)
        db.commit()
        db.refresh(offer)
    return offer

def delete_offer(db: Session, offer_id: int):
    offer = get_offer_by_id(db, offer_id)
    if offer:
        db.delete(offer)
        db.commit()
    return offer

def get_active_offers(db: Session):
    today = date.today()
    return db.query(Offer).filter(Offer.valid_from <= today, Offer.valid_to >= today).all()
