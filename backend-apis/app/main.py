from fastapi import FastAPI
from controllers import offer_controller
from db.base import Base
from database.connection import engine

app = FastAPI()

# Create tables if not exists
Base.metadata.create_all(bind=engine)

# Include routers
app.include_router(offer_controller.router)
