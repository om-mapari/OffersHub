from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.connection import SessionLocal
from database.connection import get_db
from schemas.offer_schema import OfferCreate, OfferResponse
from typing import List
import controllers.offer_controller as offer_controller

router = APIRouter(prefix="/offers", tags=["Offers"])

@router.get("/", response_model=List[OfferResponse])
def get_all_offers(db: Session = Depends(get_db)):
    return offer_controller.get_offers(db)

@router.get("/{offer_id}", response_model=OfferResponse)
def get_offer_by_id(offer_id: int, db: Session = Depends(get_db)):
    offer = offer_controller.get_offer(db, offer_id)
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    return offer

@router.post("/", response_model=OfferResponse)
def create_offer(offer: OfferCreate, db: Session = Depends(get_db)):
    return offer_controller.create_offer(db, offer)

@router.put("/{offer_id}", response_model=OfferResponse)
def update_offer(offer_id: int, offer: OfferCreate, db: Session = Depends(get_db)):
    updated = offer_controller.update_offer(db, offer_id, offer)
    if not updated:
        raise HTTPException(status_code=404, detail="Offer not found")
    return updated

@router.delete("/{offer_id}", response_model=OfferResponse)
def delete_offer(offer_id: int, db: Session = Depends(get_db)):
    deleted = offer_controller.delete_offer(db, offer_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Offer not found")
    return deleted

@router.get("/active", response_model=List[OfferResponse])
def get_active_offers(db: Session = Depends(get_db)):
    return offer_controller.get_active_offers(db)
