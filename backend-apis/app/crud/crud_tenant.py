from sqlalchemy.orm import Session
import typing

from app.crud.base import CRUDBase
from app.models.tenant import Tenant
from app.schemas.tenant import TenantCreate, TenantUpdate

class CRUDTenant(CRUDBase[Tenant, TenantCreate, TenantUpdate]):
    def get_by_name(self, db: Session, *, name: str) -> typing.Optional[Tenant]:
        return db.query(Tenant).filter(Tenant.name == name).first()

    # Override create if specific logic is needed, e.g. setting created_by_username
    def create_with_owner(self, db: Session, *, obj_in: TenantCreate, creator_username: str) -> Tenant:
        db_obj = Tenant(
            name=obj_in.name,
            description=obj_in.description,
            created_by_username=creator_username
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

tenant = CRUDTenant(Tenant)
