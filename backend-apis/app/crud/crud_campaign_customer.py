from sqlalchemy.orm import Session
import typing
import uuid

from app.models.campaign_customer import CampaignCustomer
from app.schemas.campaign_customer import CampaignCustomerCreate # Create only

class CRUDCampaignCustomer:
    def get(self, db: Session, *, campaign_id: int, customer_id: uuid.UUID) -> typing.Optional[CampaignCustomer]:
        return db.query(CampaignCustomer).filter_by(
            campaign_id=campaign_id, customer_id=customer_id
        ).first()

    def create(self, db: Session, *, obj_in: CampaignCustomerCreate) -> CampaignCustomer:
        db_obj = CampaignCustomer(**obj_in.model_dump())
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    # Update might be needed for delivery_status
    def update_delivery_status(self, db: Session, *, db_obj: CampaignCustomer, delivery_status: str, sent_at: typing.Optional[str] = None) -> CampaignCustomer:
        db_obj.delivery_status = delivery_status
        if sent_at:
            db_obj.sent_at = sent_at
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

campaign_customer = CRUDCampaignCustomer()
