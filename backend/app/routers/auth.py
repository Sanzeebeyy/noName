from fastapi import APIRouter,  Depends, HTTPException, status
from .. import schemas, database, models, token
from ..database import get_db
from sqlalchemy.orm import Session
from .. hashing import Hash
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter(
    prefix="/login",
    tags=["Login"])

@router.post('/')
def user_login(request:OAuth2PasswordRequestForm = Depends(),
               db:Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == request.username).first()

    if not (user and Hash.verify_password(request.password, user.password_hash)):
        raise HTTPException(status_code=401,detail= "Not Authorized")
    
    access_token = token.create_access_token(data = {"sub":user.username})

    return {"access_token":access_token, "token_types":"bearer"}