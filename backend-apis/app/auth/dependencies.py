from db.session import UserSessionLocal

def get_user_db():
    db = UserSessionLocal()
    try:
        yield db
    finally:
        db.close()
