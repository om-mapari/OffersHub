from sqlalchemy.orm import Session
from models.selection_criteria import SelectionCriteria, SelectionFieldMaster
from schemas.selection_criteria_schema import SelectionCriteriaCreate

def get_all_selection_criteria(db: Session, campaign_id: int):
    return db.query(SelectionCriteria).filter(SelectionCriteria.campaign_id == campaign_id).all()

def create_selection_criteria(db: Session, criteria: SelectionCriteriaCreate):
    db_criteria = SelectionCriteria(**criteria.dict())
    db.add(db_criteria)
    db.commit()
    db.refresh(db_criteria)
    return db_criteria

def get_all_selection_fields(db: Session):
    return db.query(SelectionFieldMaster).all()
