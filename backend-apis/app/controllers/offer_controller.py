from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.session import get_db
from schemas.offer_schema import OfferBase
from crud import offer_crud

router = APIRouter()

@router.get("/offers", response_model=list[OfferBase])
def read_offers(db: Session = Depends(get_db)):
    return offer_crud.get_all_offers(db)

@router.get("/offers/{offer_id}", response_model=OfferBase)
def read_offer(offer_id: int, db: Session = Depends(get_db)):
    offer = offer_crud.get_offer_by_id(db, offer_id)
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    return offer
