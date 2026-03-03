from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas
from ..hashing import Hash
from ..oauth2 import get_current_user

router = APIRouter(
    prefix='/user',
    tags=['User']
)

@router.post('/register')
def register_user(request:schemas.RegisterUser,
                  db: Session = Depends(get_db)):
    
    existing_username = db.query(models.User).filter(models.User.username == request.username).first()

    if existing_username:
        raise HTTPException(status_code=401, detail="Username Already Taken")
    
    hashed_password = Hash.bcrypt(request.password)

    new_user = models.User(username = request.username, password_hash = hashed_password)

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

@router.put('/update')
def update_user(request:schemas.UpdateUser,
                db:Session = Depends(get_db),
                current_user:schemas.User = Depends(get_current_user)):
    

    db.query(models.User).filter(models.User.username == current_user.username).update(request.dict(exclude_unset=True))
    db.commit()
    
    user = db.query(models.User).filter(models.User.username == current_user.username).first()

    return {
        "new_username":user.username,
        "info": "cannot update password cause developer is tired and making this app in under one night and its currently 1:50 am"
    }
    