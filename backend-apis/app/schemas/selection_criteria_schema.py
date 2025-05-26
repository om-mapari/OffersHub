from pydantic import BaseModel

class SelectionCriteriaCreate(BaseModel):
    criteria_id: int
    campaign_id: int
    table_reference: str
    field_name: str
    condition_operator: str
    value: str

class SelectionCriteriaRead(SelectionCriteriaCreate):
    class Config:
        orm_mode = True

class SelectionFieldMasterRead(BaseModel):
    field_id: int
    table_reference: str
    field_name: str
    allowed_operators: str

    class Config:
        orm_mode = True
