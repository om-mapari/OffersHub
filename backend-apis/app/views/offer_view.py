from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.connection import SessionLocal
from schemas.offer_schema import OfferResponse
from typing import List
import controllers.offer_controller as offer_controller

router = APIRouter(prefix="/offers", tags=["Offers"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=List[OfferResponse])
def get_all_offers(db: Session = Depends(get_db)):
    return offer_controller.get_offers(db)

@router.get("/{offer_id}", response_model=OfferResponse)
def get_offer_by_id(offer_id: int, db: Session = Depends(get_db)):
    offer = offer_controller.get_offer(db, offer_id)
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    return offer
