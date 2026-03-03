from fastapi import APIRouter, Response, Depends, status, HTTPException
from .. import schemas, models, database
from sqlalchemy.orm import Session
from typing import List
from ..oauth2 import get_current_user
from ..database import get_db
from datetime import datetime,timedelta


router = APIRouter(
    prefix='/chat',
    tags=["Chat"]
)

@router.get('/messages', response_model=List[schemas.ShowMessages])
def show_messages(db:Session = Depends(get_db),
                  current_user: schemas.User = Depends(get_current_user)):
    
    one_hour_ago = datetime.utcnow() - timedelta(minutes=60)
    

    messages = db.query(models.Message).filter(models.Message.created_at >= one_hour_ago).order_by(models.Message.created_at.asc()).all()

    
    return messages