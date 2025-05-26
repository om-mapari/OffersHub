from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import Request, HTTPException
from auth_handler import decode_access_token

class JWTBearer(HTTPBearer):
    async def __call__(self, request: Request):
        credentials: HTTPAuthorizationCredentials = await super().__call__(request)
        if credentials:
            payload = decode_access_token(credentials.credentials)
            if payload is None:
                raise HTTPException(status_code=403, detail="Invalid token or expired token.")
            return payload
        raise HTTPException(status_code=403, detail="Invalid authorization code.")
