from datetime import timedelta, datetime
from jose import jwt, JWTError
from .schemas import TokenData

SECRET_KEY = "afc272d9efa4a8a16df8109486cd6a06223ee12fc71e0383a7648f8d743b57db"
ALGORITHM = "HS256"

def create_access_token(data:dict):
    to_encode = data.copy()
    expiry = datetime.utcnow()+timedelta(minutes=999999)

    to_encode.update({"exp":expiry})
    
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_access_token(token_oauth2:str, credential_exception):
    try:
        payload = jwt.decode(token_oauth2, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credential_exception
        token_data = TokenData(username = username)

        return token_data
    
    except JWTError:
        raise credential_exception
    

from fastapi import WebSocket, status, HTTPException
from . import models, database
from sqlalchemy.orm import Session

async def get_current_user_ws(websocket: WebSocket,
                              db:Session):
    
    token = websocket.query_params.get("token")

    if not token:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        raise HTTPException(status_code=401, detail="Please Login")
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username:str = payload.get("sub")
        if username is None:
            raise JWTError
        
    except JWTError:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        raise HTTPException(status_code=401, detail="Please Login")
    
    user = db.query(models.User).filter(models.User.username == username).first()

    return user