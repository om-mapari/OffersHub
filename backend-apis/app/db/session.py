from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import os
import json
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy import TypeDecorator, JSON

from app.core.config import settings

# Custom type to handle JSONB in SQLite
class JSONBType(TypeDecorator):
    """Enables JSONB storage in SQLite."""
    impl = JSON
    
    def load_dialect_impl(self, dialect):
        if dialect.name == 'sqlite':
            return dialect.type_descriptor(JSON)
        return dialect.type_descriptor(JSONB)

# Replace PostgreSQL JSONB with our custom type if we're in testing mode
if os.environ.get("TESTING") == "True":
    # Monkey patch the JSONB type
    from sqlalchemy.dialects.postgresql.base import ischema_names
    import sqlalchemy.dialects.postgresql
    sqlalchemy.dialects.postgresql.JSONB = JSONBType
    if 'jsonb' in ischema_names:
        ischema_names['jsonb'] = JSONBType

engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
