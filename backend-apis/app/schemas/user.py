from pydantic import BaseModel, EmailStr, constr
import typing
import datetime

# Shared properties
class UserBase(BaseModel):
    username: constr(min_length=3, max_length=50)
    full_name: typing.Optional[str] = None
    is_super_admin: bool = False

# Properties to receive via API on creation
class UserCreate(UserBase):
    password: constr(min_length=8)

# Properties to receive via API on update
class UserUpdate(BaseModel):
    full_name: typing.Optional[str] = None
    password: typing.Optional[constr(min_length=8)] = None # For password change
    is_super_admin: typing.Optional[bool] = None

class UserPasswordChange(BaseModel):
    current_password: str
    new_password: constr(min_length=8)

class UserInDBBase(UserBase):
    username: str # Override to make it required
    created_at: datetime.datetime

    class Config:
        from_attributes = True # Replaces orm_mode = True

# Additional properties stored in DB
class UserInDB(UserInDBBase):
    password_hash: str

# Properties to return to client
class User(UserInDBBase):
    pass

# For /users/me/tenants
class UserRoleInTenant(BaseModel):
    tenant_name: str
    role: str

class UserTenantInfo(BaseModel):
    tenant_name: str
    roles: typing.List[str]
