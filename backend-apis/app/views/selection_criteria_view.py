from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.connection import get_db
from schemas.selection_criteria_schema import SelectionCriteriaCreate, SelectionCriteriaRead, SelectionFieldMasterRead
from controllers import selection_criteria_controller

router = APIRouter(prefix="/selection", tags=["Selection Criteria"])

@router.get("/fields", response_model=list[SelectionFieldMasterRead])
def get_fields(db: Session = Depends(get_db)):
    return selection_criteria_controller.get_all_fields(db)

@router.post("/campaigns/{campaign_id}/criteria", response_model=SelectionCriteriaRead)
def add_criteria(campaign_id: int, criteria: SelectionCriteriaCreate, db: Session = Depends(get_db)):
    if criteria.campaign_id != campaign_id:
        raise HTTPException(status_code=400, detail="Campaign ID mismatch")
    return selection_criteria_controller.create_criteria(db, criteria)

@router.get("/campaigns/{campaign_id}/criteria", response_model=list[SelectionCriteriaRead])
def get_criteria(campaign_id: int, db: Session = Depends(get_db)):
    return selection_criteria_controller.get_criteria_by_campaign(db, campaign_id)
