from fastapi import APIRouter, Response, Depends, status, HTTPException, UploadFile, File
import httpx
import base64
from .. import schemas, models, database
from sqlalchemy.orm import Session
from typing import List
from ..oauth2 import get_current_user
from ..database import get_db
from datetime import datetime,timedelta
from ..database import IMGBB_API_KEY

router = APIRouter(
    prefix='/chat',
    tags=["Chat"]
)

@router.post('/upload-image')
async def upload_image(file:UploadFile = File(...)):
    if file.content_type not in ['image/jpeg','image/png','image/jpg']:
        raise HTTPException(status_code=400, detail="Invalid Image Type")

    contents = await file.read()

    if len(contents) > 2 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File Too Large")
    
    encoded_image = base64.b64encode(contents).decode("utf-8")

    async with httpx.AsyncClient() as client:
        response = await client.post(
            'https://api.imgbb.com/1/upload',
            data={
                'key':IMGBB_API_KEY,
                'image':encoded_image,
                'expiration': 21600
            }
        )

        data = response.json()

        if not data.get("success"):
            raise HTTPException(status_code=400, detail="Image Upload Failed")
        
        return {
            "image_url":data["data"]["url"]
        }


@router.get('/messages', response_model=List[schemas.ShowMessages])
def show_messages(db:Session = Depends(get_db),
                  current_user: schemas.User = Depends(get_current_user)):
    
    cutoff = datetime.utcnow() - timedelta(hours=6)
    
    db.query(models.Message).filter(models.Message.created_at < cutoff).delete()
    db.commit()

    messages = db.query(models.Message).order_by(models.Message.created_at.asc()).all()

    
    return messages