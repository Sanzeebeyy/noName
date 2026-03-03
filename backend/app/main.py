from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine
from . import models
from .routers import user,auth,chat,ws_chat

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

models.Base.metadata.create_all(engine)

app.include_router(user.router)
app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(ws_chat.router)

@app.get('/')
def start_app():
    return "App is Live"

@app.get('/health')
def health():
    return {"details":"The App Is Running"}

