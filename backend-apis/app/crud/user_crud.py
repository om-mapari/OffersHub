from sqlalchemy.orm import Session
from models.user import User

def get_user_groups(db: Session, user_id: int) -> list[str]:
    user = db.query(User).filter(User.id == user_id).first()
    return [group.name for group in user.groups] if user else []
