from pydantic import BaseModel
import typing

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenPayload(BaseModel):
    sub: typing.Optional[str] = None # Subject (username)
