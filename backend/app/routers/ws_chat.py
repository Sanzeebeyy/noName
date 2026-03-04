from fastapi import APIRouter, Depends, status, WebSocket, WebSocketDisconnect, HTTPException
from .. import schemas, database, models
from sqlalchemy.orm import Session
from ..ws_manager import ConnectionManager
from ..token import get_current_user_ws
from ..database import get_db

router = APIRouter(
    tags=["WebSocket"],
    prefix='/ws'
)

manager = ConnectionManager()

@router.websocket('/')
async def websocket_chat(websocket:WebSocket,
                         db:Session = Depends(get_db)):
    user = await get_current_user_ws(websocket, db)

    if not user:
        raise HTTPException(status_code=401, detail="Please Login")
    
    await manager.connect(websocket)

    try:
        while True:
            data = await websocket.receive_json()

            message_text = data.get("message")
            image_url = data.get("image_url")

            if not message_text and not image_url:
                await websocket.send_json({
                    "error": "Message cannot be empty"
                })
                continue

            new_message = models.Message(sender_id = user.id , message_text = message_text, image_url = image_url)

            db.add(new_message)
            db.commit()
            db.refresh(new_message)

            await manager.broadcast({
                "sender_id": user.id,
                "username": user.username,
                "message_text":message_text,
                "message_id":new_message.id,
                "image_url":image_url
            })

    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)