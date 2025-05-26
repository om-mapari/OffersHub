from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.connection import SessionLocal
from schemas.campaign_schema import CampaignCreate, CampaignResponse
from schemas.offer_schema import OfferResponse
from typing import List
import controllers.campaign_controller as campaign_controller

router = APIRouter(prefix="/campaigns", tags=["Campaigns"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=List[CampaignResponse])
def get_campaigns(db: Session = Depends(get_db)):
    return campaign_controller.get_campaigns(db)

@router.get("/{campaign_id}", response_model=CampaignResponse)
def get_campaign(campaign_id: int, db: Session = Depends(get_db)):
    campaign = campaign_controller.get_campaign(db, campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign

@router.post("/", response_model=CampaignResponse)
def create_campaign(campaign: CampaignCreate, db: Session = Depends(get_db)):
    return campaign_controller.create_campaign(db, campaign)

@router.put("/{campaign_id}", response_model=CampaignResponse)
def update_campaign(campaign_id: int, campaign: CampaignCreate, db: Session = Depends(get_db)):
    updated = campaign_controller.update_campaign(db, campaign_id, campaign)
    if not updated:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return updated

@router.delete("/{campaign_id}", response_model=CampaignResponse)
def delete_campaign(campaign_id: int, db: Session = Depends(get_db)):
    deleted = campaign_controller.delete_campaign(db, campaign_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return deleted

@router.get("/{campaign_id}/offers", response_model=List[OfferResponse])
def get_campaign_offers(campaign_id: int, db: Session = Depends(get_db)):
    return campaign_controller.get_campaign_offers(db, campaign_id)
