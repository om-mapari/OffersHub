from sqlalchemy.orm import Session
from schemas.selection_criteria_schema import SelectionCriteriaCreate
from crud import selection_criteria_crud

def get_criteria_by_campaign(db: Session, campaign_id: int):
    return selection_criteria_crud.get_all_selection_criteria(db, campaign_id)

def create_criteria(db: Session, criteria: SelectionCriteriaCreate):
    return selection_criteria_crud.create_selection_criteria(db, criteria)

def get_all_fields(db: Session):
    return selection_criteria_crud.get_all_selection_fields(db)
