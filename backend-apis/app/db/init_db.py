from sqlalchemy.orm import Session
from app.db.session import engine, Base
from app.models import user, tenant, offer, campaign, customer # Import all models

# make sure all SQL Alchemy models are imported before initializing DB
# otherwise, SQL Alchemy might fail to initialize relationships properly
# for more details: https://github.com/tiangolo/full-stack-fastapi-postgresql/issues/28


def init_db(db: Session) -> None:
    # Tables should be created with Alembic migrations
    # But for development and convenience, we can create them here
    Base.metadata.create_all(bind=engine)

    # You can add initial data creation here if needed
    # For example, creating a superuser
    # from app.core.config import settings
    # from app.crud import crud_user
    # from app.schemas import UserCreate

    # user = crud_user.user.get_by_username(db, username=settings.FIRST_SUPERUSER)
    # if not user:
    #     user_in = UserCreate(
    #         username=settings.FIRST_SUPERUSER,
    #         password=settings.FIRST_SUPERUSER_PASSWORD,
    #         full_name="Initial Super User",
    #         is_super_admin=True,
    #     )
    #     user = crud_user.user.create(db, obj_in=user_in)
    pass
