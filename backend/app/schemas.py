from pydantic import BaseModel
from typing import List

class User(BaseModel):
    username : str
    password : str
    
    class Config():
        orm_mode = True

class ShowUser(BaseModel):
    username:str

class RegisterUser(BaseModel):
    username : str
    password : str
    
    class Config():
        orm_mode = True

class UpdateUser(BaseModel):
    username : str | None
    
    class Config():
        orm_mode = True

class ShowMessages(BaseModel):
    sender_id:int
    message_text: str | None = None
    img_url: str | None = None
    sender: ShowUser

    class Config():
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_types: str

    class Config():
        orm_mode = True 


class TokenData(BaseModel):
    username: str
    
    class Config():
        orm_mode = True 