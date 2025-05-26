from pydantic import BaseModel
from typing import List

class UserResponse(BaseModel):
    username: str
    email: str
    full_name: str

class GroupListResponse(BaseModel):
    groups: List[str]
