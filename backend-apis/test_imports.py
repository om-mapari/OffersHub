import sys
print("Python version:", sys.version)

try:
    from app.core.config import settings
    print("Settings imported successfully")
    print("PROJECT_NAME:", settings.PROJECT_NAME)
    print("DATABASE_URL:", settings.DATABASE_URL)
except Exception as e:
    print("Error importing settings:", e)

try:
    from app.db.session import engine, Base, SessionLocal
    print("Database session objects imported successfully")
except Exception as e:
    print("Error importing database session:", e)

try:
    from app.api.v1.api import api_router
    print("API router imported successfully")
except Exception as e:
    print("Error importing API router:", e)

try:
    # Import schemas
    from app import schemas
    print("Schemas imported successfully")
except Exception as e:
    print("Error importing schemas:", e)

try:
    # Import models
    from app import models
    print("Models imported successfully")
except Exception as e:
    print("Error importing models:", e)

try:
    # Import crud
    from app import crud
    print("CRUD imported successfully")
except Exception as e:
    print("Error importing crud:", e) 