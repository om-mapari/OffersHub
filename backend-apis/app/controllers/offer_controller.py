from sqlalchemy.orm import Session
import crud.offer_crud as offer_crud

def get_offers(db: Session):
    return offer_crud.get_all_offers(db)

def get_offer(db: Session, offer_id: int):
    return offer_crud.get_offer_by_id(db, offer_id)
