import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.config import settings
from app import crud, models, schemas

def test_get_users_superuser_me(client: TestClient, superuser_token_headers: dict) -> None:
    """Test get current superuser."""
    r = client.get(f"{settings.API_V1_STR}/users/me", headers=superuser_token_headers)
    current_user = r.json()
    assert r.status_code == 200
    assert current_user
    assert current_user["username"] == "testsuperuser"
    assert current_user["is_super_admin"] is True

# Password update tests removed since the endpoints don't exist 