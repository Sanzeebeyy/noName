from .database import Base

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, index=True, nullable=False, unique=True)
    password_hash = Column(String, nullable=False)

    messages = relationship("Message", back_populates="sender")


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"))
    message_text = Column(String)
    img_url = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    sender = relationship("User", back_populates="messages")