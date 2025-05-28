# Pytest fixtures
import os

# Set environment variable for testing
os.environ["TESTING"] = "true"

import pytest
from typing import Dict, Generator, Any
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from app.main import app
from app.db.session import Base, get_db
from app.core.config import settings
from app.api.v1 import deps
from app.core import security
from app import crud, models, schemas

# Use an in-memory SQLite database for testing
TEST_SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(TEST_SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db() -> Generator:
    # Create the database and tables
    Base.metadata.create_all(bind=engine)
    
    # Run the tests
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        # Drop the tables after the test is complete
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db: Session) -> Generator:
    # Override the get_db dependency to use the test database
    def override_get_db():
        try:
            yield db
        finally:
            pass
    
    # Only override the database dependency
    app.dependency_overrides[deps.get_db] = override_get_db
    
    with TestClient(app) as test_client:
        yield test_client
    
    # Clear any overrides
    app.dependency_overrides.clear()

def create_test_user(db: Session) -> models.User:
    """Create and return a test user."""
    print("Creating test user...")
    user_in = schemas.UserCreate(
        username="testuser",
        email="test@example.com",
        password="testpassword",
        full_name="Test User"
    )
    user = crud.user.get_by_username(db, username=user_in.username)
    print(f"User exists? {user is not None}")
    if not user:
        # Create user directly with model since email is not in the model
        print(f"Creating new user: {user_in.username}")
        hashed_password = security.get_password_hash(user_in.password)
        user = models.User(
            username=user_in.username,
            password_hash=hashed_password,
            full_name=user_in.full_name,
            is_super_admin=False
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        print(f"User created with password hash: {user.password_hash[:10]}...")
    return user

def create_test_superuser(db: Session) -> models.User:
    """Create and return a test superuser."""
    user_in = schemas.UserCreate(
        username="testsuperuser",
        email="testsuperuser@example.com", 
        password="testsuperuserpassword",
        full_name="Test Super User",
        is_super_admin=True
    )
    user = crud.user.get_by_username(db, username=user_in.username)
    if not user:
        # Create user directly with model since email is not in the model
        hashed_password = security.get_password_hash(user_in.password)
        user = models.User(
            username=user_in.username,
            password_hash=hashed_password,
            full_name=user_in.full_name,
            is_super_admin=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

@pytest.fixture(scope="function")
def superuser_token_headers(client: TestClient, db: Session) -> Dict[str, str]:
    """Return a bearer token for a test superuser."""
    superuser = create_test_superuser(db)
    login_data = {
        "username": superuser.username,
        "password": "testsuperuserpassword",
    }
    r = client.post(f"{settings.API_V1_STR}/auth/token", data=login_data)
    tokens = r.json()
    a_token = tokens["access_token"]
    headers = {"Authorization": f"Bearer {a_token}"}
    return headers

@pytest.fixture(scope="function")
def normal_user_token_headers(client: TestClient, db: Session) -> Dict[str, str]:
    """Return a bearer token for a normal test user."""
    user = create_test_user(db)
    login_data = {
        "username": user.username,
        "password": "testpassword",
    }
    r = client.post(f"{settings.API_V1_STR}/auth/token", data=login_data)
    tokens = r.json()
    a_token = tokens["access_token"]
    headers = {"Authorization": f"Bearer {a_token}"}
    return headers

@pytest.fixture(scope="function")
def test_tenant(db: Session) -> models.Tenant:
    """Create and return a test tenant."""
    tenant_in = schemas.TenantCreate(
        name="testtenant",
        description="A tenant for testing"
    )
    tenant = crud.tenant.get_by_name(db, name=tenant_in.name)
    if not tenant:
        tenant = crud.tenant.create(db, obj_in=tenant_in)
    return tenant

@pytest.fixture(scope="function")
def test_tenant_user_role(db: Session, test_tenant: models.Tenant) -> models.UserTenantRole:
    """Create a role for the test user in the test tenant."""
    user = create_test_user(db)
    user_tenant_role_in = schemas.UserTenantRoleCreate(
        username=user.username,
        tenant_name=test_tenant.name,
        role="admin"  # Give admin role for testing
    )
    user_tenant_role = crud.user_tenant_role.get_by_username_and_tenant(
        db, username=user.username, tenant_name=test_tenant.name
    )
    if not user_tenant_role:
        user_tenant_role = crud.user_tenant_role.create(db, obj_in=user_tenant_role_in)
    return user_tenant_role
