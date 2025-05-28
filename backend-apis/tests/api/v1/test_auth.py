import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.config import settings
from app import crud, models
from app.core.security import get_password_hash
from app.models.user import User

def test_get_access_token(client: TestClient, db: Session) -> None:
    """Test login for access token."""
    # Manually create a test user directly
    
    # Check if user already exists
    user = db.query(User).filter(User.username == "testuser").first()
    if not user:
        # Create test user
        test_user = User(
            username="testuser",
            password_hash=get_password_hash("testpassword"),
            full_name="Test User",
            is_super_admin=False
        )
        db.add(test_user)
        db.commit()
        print(f"Created test user with password hash: {test_user.password_hash[:10]}...")
    
    login_data = {
        "username": "testuser",
        "password": "testpassword",
    }
    r = client.post(f"{settings.API_V1_STR}/auth/token", data=login_data)
    tokens = r.json()
    assert r.status_code == 200
    assert "access_token" in tokens
    assert "token_type" in tokens
    assert tokens["token_type"] == "bearer"

def test_get_access_token_bad_credentials(client: TestClient, db: Session) -> None:
    """Test login with bad credentials."""
    login_data = {
        "username": "testuser",
        "password": "wrongpassword",
    }
    r = client.post(f"{settings.API_V1_STR}/auth/token", data=login_data)
    assert r.status_code == 401

def test_get_access_token_user_not_exists(client: TestClient, db: Session) -> None:
    """Test login with non-existent user."""
    login_data = {
        "username": "nonexistentuser",
        "password": "testpassword",
    }
    r = client.post(f"{settings.API_V1_STR}/auth/token", data=login_data)
    assert r.status_code == 401

def test_get_me(client: TestClient, normal_user_token_headers: dict) -> None:
    """Test get current user."""
    r = client.get(f"{settings.API_V1_STR}/auth/me", headers=normal_user_token_headers)
    current_user = r.json()
    assert r.status_code == 200
    assert current_user
    assert current_user["username"] == "testuser"
    assert current_user["full_name"] == "Test User"
    assert "password" not in current_user 