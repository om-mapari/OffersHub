import typing

from sqlalchemy.orm import Session

from app.core.security import get_password_hash, verify_password
from app.crud.base import CRUDBase
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate

class CRUDUser(CRUDBase[User, UserCreate, UserUpdate]):
    def get_by_username(self, db: Session, *, username: str) -> typing.Optional[User]:
        return db.query(User).filter(User.username == username).first()

    def create(self, db: Session, *, obj_in: UserCreate) -> User:
        db_obj = User(
            username=obj_in.username,
            full_name=obj_in.full_name,
            password_hash=get_password_hash(obj_in.password),
            is_super_admin=obj_in.is_super_admin,
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(
        self, db: Session, *, db_obj: User, obj_in: typing.Union[UserUpdate, typing.Dict[str, typing.Any]]
    ) -> User:
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)

        if "password" in update_data and update_data["password"]:
            hashed_password = get_password_hash(update_data["password"])
            del update_data["password"]
            update_data["password_hash"] = hashed_password
        
        return super().update(db, db_obj=db_obj, obj_in=update_data)

    def authenticate(
        self, db: Session, *, username: str, password: str
    ) -> typing.Optional[User]:
        print(f"Authenticating user: {username}")
        user = self.get_by_username(db, username=username)
        if not user:
            print(f"User not found: {username}")
            return None
        print(f"User found, checking password. Hash: {user.password_hash[:10]}...")
        if not verify_password(password, user.password_hash):
            print(f"Password verification failed")
            return None
        print(f"Authentication successful for {username}")
        return user

    def is_superuser(self, user: User) -> bool:
        return user.is_super_admin

user = CRUDUser(User)
