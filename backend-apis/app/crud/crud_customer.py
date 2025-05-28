from sqlalchemy.orm import Session
import typing
import uuid

from app.crud.base import CRUDBase
from app.models.customer import Customer
from app.schemas.customer import CustomerCreate, CustomerUpdate

class CRUDCustomer(CRUDBase[Customer, CustomerCreate, CustomerUpdate]):
    def get_by_email(self, db: Session, *, email: str) -> typing.Optional[Customer]:
        return db.query(Customer).filter(Customer.email == email).first()

    def get(self, db: Session, id: uuid.UUID) -> typing.Optional[Customer]: # Override to use UUID
        return db.query(self.model).filter(self.model.id == id).first()

    def remove(self, db: Session, *, id: uuid.UUID) -> typing.Optional[Customer]: # Override to use UUID
        obj = db.query(self.model).get(id)
        if obj:
            db.delete(obj)
            db.commit()
        return obj

customer = CRUDCustomer(Customer)
