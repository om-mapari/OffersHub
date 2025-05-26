#!/bin/bash

# Create directories if not exist
mkdir -p models schemas crud controllers views

# models/campaign.py
cat > models/campaign.py <<'EOF'
from sqlalchemy import Column, Integer, String, Date, Numeric
from database.base import Base

class Campaign(Base):
    __tablename__ = "campaign"

    campaign_id = Column(Integer, primary_key=True, index=True)
    campaign_name = Column(String(100))
    start_date = Column(Date)
    end_date = Column(Date)
    budget = Column(Numeric(15, 2))
    status = Column(String(50))
EOF

# models/offer_campaign.py
cat > models/offer_campaign.py <<'EOF'
from sqlalchemy import Column, Integer, ForeignKey
from database.base import Base

class OfferCampaign(Base):
    __tablename__ = "offer_campaign"

    offer_id = Column(Integer, ForeignKey("offer.offer_id"), primary_key=True)
    campaign_id = Column(Integer, ForeignKey("campaign.campaign_id"), primary_key=True)
EOF

# schemas/campaign_schema.py
cat > schemas/campaign_schema.py <<'EOF'
from pydantic import BaseModel
from typing import Optional
from datetime import date

class CampaignCreate(BaseModel):
    campaign_name: str
    start_date: date
    end_date: date
    budget: float
    status: str

class CampaignResponse(CampaignCreate):
    campaign_id: int

    class Config:
        orm_mode = True
EOF

# crud/campaign_crud.py
cat > crud/campaign_crud.py <<'EOF'
from sqlalchemy.orm import Session
from models.campaign import Campaign
from models.offer import Offer
from models.offer_campaign import OfferCampaign
from schemas.campaign_schema import CampaignCreate

def get_all_campaigns(db: Session):
    return db.query(Campaign).all()

def get_campaign_by_id(db: Session, campaign_id: int):
    return db.query(Campaign).filter(Campaign.campaign_id == campaign_id).first()

def create_campaign(db: Session, campaign: CampaignCreate):
    db_campaign = Campaign(**campaign.dict())
    db.add(db_campaign)
    db.commit()
    db.refresh(db_campaign)
    return db_campaign

def update_campaign(db: Session, campaign_id: int, campaign_data: CampaignCreate):
    campaign = get_campaign_by_id(db, campaign_id)
    if campaign:
        for key, value in campaign_data.dict(exclude_unset=True).items():
            setattr(campaign, key, value)
        db.commit()
        db.refresh(campaign)
    return campaign

def delete_campaign(db: Session, campaign_id: int):
    campaign = get_campaign_by_id(db, campaign_id)
    if campaign:
        db.delete(campaign)
        db.commit()
    return campaign

def get_offers_by_campaign(db: Session, campaign_id: int):
    return db.query(Offer).join(OfferCampaign).filter(OfferCampaign.campaign_id == campaign_id).all()
EOF

# controllers/campaign_controller.py
cat > controllers/campaign_controller.py <<'EOF'
from sqlalchemy.orm import Session
from schemas.campaign_schema import CampaignCreate
import crud.campaign_crud as campaign_crud

def get_campaigns(db: Session):
    return campaign_crud.get_all_campaigns(db)

def get_campaign(db: Session, campaign_id: int):
    return campaign_crud.get_campaign_by_id(db, campaign_id)

def create_campaign(db: Session, campaign: CampaignCreate):
    return campaign_crud.create_campaign(db, campaign)

def update_campaign(db: Session, campaign_id: int, data: CampaignCreate):
    return campaign_crud.update_campaign(db, campaign_id, data)

def delete_campaign(db: Session, campaign_id: int):
    return campaign_crud.delete_campaign(db, campaign_id)

def get_campaign_offers(db: Session, campaign_id: int):
    return campaign_crud.get_offers_by_campaign(db, campaign_id)
EOF

# views/campaign_view.py
cat > views/campaign_view.py <<'EOF'
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
EOF

echo "Campaign API files created successfully."
