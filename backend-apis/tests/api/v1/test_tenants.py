import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.config import settings
from app import crud, models, schemas

def test_create_tenant(client: TestClient, superuser_token_headers: dict, db: Session) -> None:
    """Test creating a tenant (superadmin only)."""
    data = {
        "name": "newtenant",
        "description": "A new tenant created in testing"
    }
    r = client.post(
        f"{settings.API_V1_STR}/sa/tenants/",
        headers=superuser_token_headers,
        json=data,
    )
    assert r.status_code == 201
    created_tenant = r.json()
    assert created_tenant["name"] == data["name"]
    assert created_tenant["description"] == data["description"]
    
    # Clean up - name is the primary key, not id
    tenant = crud.tenant.get_by_name(db, name=data["name"])
    if tenant:
        db.delete(tenant)
        db.commit()

def test_create_tenant_duplicate_name(client: TestClient, superuser_token_headers: dict, test_tenant: models.Tenant) -> None:
    """Test creating a tenant with an existing name."""
    data = {
        "name": test_tenant.name,  # Use existing tenant name to trigger duplicate
        "description": "This should fail due to duplicate name"
    }
    r = client.post(
        f"{settings.API_V1_STR}/sa/tenants/",
        headers=superuser_token_headers,
        json=data,
    )
    assert r.status_code == 400  # Should be 400 Bad Request for duplicate

def test_get_tenants(client: TestClient, superuser_token_headers: dict, test_tenant: models.Tenant) -> None:
    """Test retrieving all tenants."""
    r = client.get(
        f"{settings.API_V1_STR}/sa/tenants/",
        headers=superuser_token_headers,
    )
    assert r.status_code == 200
    all_tenants = r.json()
    assert len(all_tenants) > 0
    assert any(tenant["name"] == test_tenant.name for tenant in all_tenants)

def test_get_tenant(client: TestClient, superuser_token_headers: dict, test_tenant: models.Tenant) -> None:
    """Test retrieving a specific tenant."""
    r = client.get(
        f"{settings.API_V1_STR}/sa/tenants/{test_tenant.name}",
        headers=superuser_token_headers,
    )
    assert r.status_code == 200
    tenant_data = r.json()
    assert tenant_data["name"] == test_tenant.name
    assert tenant_data["description"] == test_tenant.description

def test_update_tenant(client: TestClient, superuser_token_headers: dict, test_tenant: models.Tenant) -> None:
    """Test updating a tenant."""
    data = {
        "description": "Updated description for testing"
    }
    r = client.put(
        f"{settings.API_V1_STR}/sa/tenants/{test_tenant.name}",
        headers=superuser_token_headers,
        json=data,
    )
    assert r.status_code == 200
    updated_tenant = r.json()
    assert updated_tenant["name"] == test_tenant.name  # Name shouldn't change
    assert updated_tenant["description"] == data["description"]

def test_assign_user_role(
    client: TestClient, 
    superuser_token_headers: dict, 
    test_tenant: models.Tenant,
    db: Session
) -> None:
    """Test assigning a user to a tenant with a role."""
    # Create a new user to assign
    user_in = schemas.UserCreate(
        username="testroleuser",
        email="testroleuser@example.com",
        password="testrolepassword",
        full_name="Test Role User"
    )
    user = crud.user.get_by_username(db, username=user_in.username)
    if not user:
        user = crud.user.create(db, obj_in=user_in)
    
    # Assign the user to the tenant with a role
    data = {
        "username": user.username,
        "tenant_name": test_tenant.name,
        "role": "create"  # Using a role from your app
    }
    
    r = client.post(
        f"{settings.API_V1_STR}/sa/user-tenant-roles/",
        headers=superuser_token_headers,
        json=data,
    )
    assert r.status_code == 201
    user_role = r.json()
    assert user_role["username"] == user.username
    assert user_role["tenant_name"] == test_tenant.name
    assert user_role["role"] == "create" 