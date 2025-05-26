from sqlalchemy.orm import Session
from schemas.offer_schema import OfferCreate
import crud.offer_crud as offer_crud

def get_offers(db: Session):
    return offer_crud.get_all_offers(db)

def get_offer(db: Session, offer_id: int):
    return offer_crud.get_offer_by_id(db, offer_id)

def create_offer(db: Session, offer: OfferCreate):
    return offer_crud.create_offer(db, offer)

def update_offer(db: Session, offer_id: int, offer_data: OfferCreate):
    return offer_crud.update_offer(db, offer_id, offer_data)

def delete_offer(db: Session, offer_id: int):
    return offer_crud.delete_offer(db, offer_id)

def get_active_offers(db: Session):
    return offer_crud.get_active_offers(db)
