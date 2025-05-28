from pydantic import BaseModel, constr
import typing

class UserTenantRoleBase(BaseModel):
    username: str
    tenant_name: str
    role: constr(min_length=1) # e.g. "admin", "create"

class UserTenantRoleCreate(UserTenantRoleBase):
    pass

class UserTenantRoleDelete(UserTenantRoleBase):
    pass

class UserTenantRole(UserTenantRoleBase):
    class Config:
        from_attributes = True
