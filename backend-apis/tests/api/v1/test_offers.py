import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.config import settings
from app import crud, models, schemas

def test_create_offer(
    client: TestClient, 
    normal_user_token_headers: dict, 
    test_tenant: models.Tenant,
    test_tenant_user_role: models.UserTenantRole
) -> None:
    """Test creating an offer for a tenant."""
    data = {
        "data": {
            "name": "Test Offer",
            "description": "A test offer created during testing",
            "start_date": "2023-08-01",
            "end_date": "2023-12-31",
            "discount_percentage": 15,
            "terms_and_conditions": "Test terms and conditions",
            "product_ids": [1, 2, 3]
        }
    }
    
    r = client.post(
        f"{settings.API_V1_STR}/tenants/{test_tenant.name}/offers/",
        headers=normal_user_token_headers,
        json=data,
    )
    assert r.status_code == 201
    created_offer = r.json()
    assert created_offer["data"]["name"] == data["data"]["name"]
    assert created_offer["data"]["description"] == data["data"]["description"]
    assert created_offer["tenant_name"] == test_tenant.name
    assert created_offer["status"] == "draft"  # Should default to draft
    
    # Store offer ID for later tests
    offer_id = created_offer["id"]
    return offer_id

def test_get_offers(
    client: TestClient, 
    normal_user_token_headers: dict, 
    test_tenant: models.Tenant,
    test_tenant_user_role: models.UserTenantRole
) -> None:
    """Test retrieving all offers for a tenant."""
    # First create an offer to ensure there's at least one
    test_create_offer(client, normal_user_token_headers, test_tenant, test_tenant_user_role)
    
    # Now get all offers
    r = client.get(
        f"{settings.API_V1_STR}/tenants/{test_tenant.name}/offers/",
        headers=normal_user_token_headers,
    )
    assert r.status_code == 200
    offers = r.json()
    assert len(offers) > 0
    assert all(offer["tenant_name"] == test_tenant.name for offer in offers)

def test_get_offer(
    client: TestClient, 
    normal_user_token_headers: dict, 
    test_tenant: models.Tenant,
    test_tenant_user_role: models.UserTenantRole
) -> None:
    """Test retrieving a specific offer."""
    # First create an offer
    offer_id = test_create_offer(client, normal_user_token_headers, test_tenant, test_tenant_user_role)
    
    # Now get the specific offer
    r = client.get(
        f"{settings.API_V1_STR}/tenants/{test_tenant.name}/offers/{offer_id}",
        headers=normal_user_token_headers,
    )
    assert r.status_code == 200
    offer = r.json()
    assert offer["id"] == offer_id
    assert offer["tenant_name"] == test_tenant.name

def test_update_offer(
    client: TestClient, 
    normal_user_token_headers: dict, 
    test_tenant: models.Tenant,
    test_tenant_user_role: models.UserTenantRole
) -> None:
    """Test updating an offer."""
    # First create an offer
    offer_id = test_create_offer(client, normal_user_token_headers, test_tenant, test_tenant_user_role)
    
    # Now update the offer
    update_data = {
        "data": {
            "name": "Updated Offer Name",
            "description": "Updated description for testing",
            "discount_percentage": 20,
            "terms_and_conditions": "Updated terms and conditions",
            "product_ids": [1, 2, 3, 4]
        }
    }
    
    r = client.patch(
        f"{settings.API_V1_STR}/tenants/{test_tenant.name}/offers/{offer_id}",
        headers=normal_user_token_headers,
        json=update_data,
    )
    assert r.status_code == 200
    updated_offer = r.json()
    assert updated_offer["id"] == offer_id
    assert updated_offer["data"]["name"] == update_data["data"]["name"]
    assert updated_offer["data"]["description"] == update_data["data"]["description"]
    assert updated_offer["data"]["discount_percentage"] == 20

def test_submit_offer_for_approval(
    client: TestClient, 
    normal_user_token_headers: dict, 
    test_tenant: models.Tenant,
    test_tenant_user_role: models.UserTenantRole
) -> None:
    """Test submitting an offer for approval."""
    # First create an offer
    offer_id = test_create_offer(client, normal_user_token_headers, test_tenant, test_tenant_user_role)
    
    # Now submit it for approval
    r = client.post(
        f"{settings.API_V1_STR}/tenants/{test_tenant.name}/offers/{offer_id}/submit",
        headers=normal_user_token_headers,
    )
    assert r.status_code == 200
    submitted_offer = r.json()
    assert submitted_offer["id"] == offer_id
    assert submitted_offer["status"] == "submitted"

def test_approve_offer(
    client: TestClient, 
    normal_user_token_headers: dict, 
    test_tenant: models.Tenant,
    test_tenant_user_role: models.UserTenantRole
) -> None:
    """Test approving an offer."""
    # First create and submit an offer
    offer_id = test_create_offer(client, normal_user_token_headers, test_tenant, test_tenant_user_role)
    client.post(
        f"{settings.API_V1_STR}/tenants/{test_tenant.name}/offers/{offer_id}/submit",
        headers=normal_user_token_headers,
    )
    
    # Now approve it (using the same user since they have admin role)
    r = client.post(
        f"{settings.API_V1_STR}/tenants/{test_tenant.name}/offers/{offer_id}/approve",
        headers=normal_user_token_headers,
    )
    assert r.status_code == 200
    approved_offer = r.json()
    assert approved_offer["id"] == offer_id
    assert approved_offer["status"] == "approved"

def test_reject_offer(
    client: TestClient, 
    normal_user_token_headers: dict, 
    test_tenant: models.Tenant,
    test_tenant_user_role: models.UserTenantRole
) -> None:
    """Test rejecting an offer."""
    # First create and submit an offer
    offer_id = test_create_offer(client, normal_user_token_headers, test_tenant, test_tenant_user_role)
    client.post(
        f"{settings.API_V1_STR}/tenants/{test_tenant.name}/offers/{offer_id}/submit",
        headers=normal_user_token_headers,
    )
    
    # Now reject it
    rejection_data = {
        "rejection_reason": "Test rejection reason"
    }
    r = client.post(
        f"{settings.API_V1_STR}/tenants/{test_tenant.name}/offers/{offer_id}/reject",
        headers=normal_user_token_headers,
        json=rejection_data
    )
    assert r.status_code == 200
    rejected_offer = r.json()
    assert rejected_offer["id"] == offer_id
    assert rejected_offer["status"] == "rejected" 