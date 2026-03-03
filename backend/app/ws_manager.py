from fastapi import WebSocket
from typing import Dict, List

class ConnectionManager:
    def __init__(self):
        self.active_connection : List[WebSocket] = []

    async def connect(self, websocket:WebSocket):
        await websocket.accept()
        self.active_connection.append(websocket)

    def disconnect(self, websocket:WebSocket):
        self.active_connection.remove(websocket)

    async def broadcast(self, message:dict):
        for connection in self.active_connection:
            await connection.send_json(message)