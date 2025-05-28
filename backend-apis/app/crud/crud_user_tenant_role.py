from sqlalchemy.orm import Session
import typing

from app.crud.base import CRUDBase # Not directly used for this composite key model
from app.models.user_tenant_role import UserTenantRole
from app.schemas.user_tenant_role import UserTenantRoleCreate

class CRUDUserTenantRole:
    def get(self, db: Session, *, username: str, tenant_name: str, role: str) -> typing.Optional[UserTenantRole]:
        return db.query(UserTenantRole).filter_by(
            username=username, tenant_name=tenant_name, role=role
        ).first()

    def get_roles_for_user_in_tenant(self, db: Session, *, username: str, tenant_name: str) -> typing.List[UserTenantRole]:
        return db.query(UserTenantRole).filter_by(
            username=username, tenant_name=tenant_name
        ).all()
        
    def get_roles_for_user(self, db: Session, *, username: str) -> typing.List[UserTenantRole]:
        return db.query(UserTenantRole).filter_by(username=username).all()

    def get_by_username_and_tenant(self, db: Session, *, username: str, tenant_name: str) -> typing.Optional[UserTenantRole]:
        """Get the first role for a user in a tenant"""
        return db.query(UserTenantRole).filter_by(
            username=username, tenant_name=tenant_name
        ).first()

    def create(self, db: Session, *, obj_in: UserTenantRoleCreate) -> UserTenantRole:
        db_obj = UserTenantRole(
            username=obj_in.username,
            tenant_name=obj_in.tenant_name,
            role=obj_in.role
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def remove(self, db: Session, *, username: str, tenant_name: str, role: str) -> typing.Optional[UserTenantRole]:
        obj = self.get(db, username=username, tenant_name=tenant_name, role=role)
        if obj:
            db.delete(obj)
            db.commit()
        return obj

user_tenant_role = CRUDUserTenantRole()
