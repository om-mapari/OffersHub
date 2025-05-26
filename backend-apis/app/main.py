from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from middlewares.logging_middleware import log_requests
from db.base import Base, UserBase, engine, user_engine
# from controllers import auth_controller, user_controller, admin_controller, tenant_controller
from controllers import user_controller
app = FastAPI()

# DB Table Creation
Base.metadata.create_all(bind=engine)
UserBase.metadata.create_all(bind=user_engine)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware
app.middleware("http")(log_requests)

# Routers
# app.include_router(auth_controller.router)
app.include_router(user_controller.router)
# app.include_router(admin_controller.router)
# app.include_router(tenant_controller.router)
