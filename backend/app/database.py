from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

DB_URL = 'sqlite:///./app.db'
IMGBB_API_KEY = 'd4aa29d3164f193d726f99fed562f58a'

engine = create_engine(DB_URL)

LocalSession = sessionmaker(bind=engine, autoflush=False, autocommit = False)

Base = declarative_base()

def get_db():
    db = LocalSession()
    try:
        yield db
    finally:
        db.close()