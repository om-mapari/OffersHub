from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.connection import get_db
from schemas.campaign_schema import CampaignCreate, CampaignRead
from controllers import campaign_controller, offer_campaign_controller

router = APIRouter(prefix="/campaigns", tags=["Campaigns"])

@router.get("/", response_model=list[CampaignRead])
def get_campaigns(db: Session = Depends(get_db)):
    return campaign_controller.get_all_campaigns(db)

@router.get("/{campaign_id}", response_model=CampaignRead)
def get_campaign(campaign_id: int, db: Session = Depends(get_db)):
    campaign = campaign_controller.get_campaign(db, campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign

@router.post("/", response_model=CampaignRead)
def create_campaign(campaign: CampaignCreate, db: Session = Depends(get_db)):
    return campaign_controller.create_campaign(db, campaign)

@router.put("/{campaign_id}", response_model=CampaignRead)
def update_campaign(campaign_id: int, campaign_data: CampaignCreate, db: Session = Depends(get_db)):
    updated = campaign_controller.update_campaign(db, campaign_id, campaign_data)
    if not updated:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return updated

@router.delete("/{campaign_id}")
def delete_campaign(campaign_id: int, db: Session = Depends(get_db)):
    deleted = campaign_controller.delete_campaign(db, campaign_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return {"detail": "Campaign deleted successfully"}

@router.post("/{campaign_id}/offers/{offer_id}")
def link_offer_to_campaign(campaign_id: int, offer_id: int, db: Session = Depends(get_db)):
    return offer_campaign_controller.link_offer_to_campaign(db, campaign_id, offer_id)
