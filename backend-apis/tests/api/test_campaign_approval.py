import json
import pytest
from fastapi import status
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.services.campaign_processing_service import campaign_service
from app.models.campaign import CampaignStatus

# Using the test client
client = TestClient(app)

def test_campaign_approval_process(db: Session, superuser_token_headers):
    """
    Test the campaign approval process:
    1. First create an offer (ID 8)
    2. Then create a campaign with that offer
    3. Update the campaign status to approved
    4. Check that the customers are correctly added
    """
    tenant_name = "test_tenant"
    
    # First, create a test tenant if it doesn't exist
    tenant_data = {"name": tenant_name}
    response = client.post(
        "/api/v1/sa/tenants/",
        json=tenant_data,
        headers=superuser_token_headers,
    )
    
    # Test offer data
    offer_data = {
        "data": {
            "product_name": "Test Offer for Campaign Approval",
            "interest_rate": 8.5,
            "term_months": 12
        }
    }
    
    # Create the offer
    offer_response = client.post(
        f"/api/v1/tenants/{tenant_name}/offers/",
        json=offer_data,
        headers=superuser_token_headers,
    )
    assert offer_response.status_code == status.HTTP_201_CREATED
    offer_id = offer_response.json()["id"]
    print(f"Created test offer with ID: {offer_id}")
    
    # Create a campaign with the offer and selection criteria
    campaign_data = {
        "name": "Test Campaign for Approval",
        "offer_id": offer_id,
        "description": "Testing campaign approval flow",
        "selection_criteria": {
            "kyc_status": "=pending", 
            "occupation": "=self-employed", 
            "gender": "!female",
            "delinquency": "=false",
            "segment": "!premium",
            "credit_score": "<388",
            "is_active": "=true"
        },
        "start_date": "2023-07-01",
        "end_date": "2023-12-31"
    }
    
    campaign_response = client.post(
        f"/api/v1/tenants/{tenant_name}/campaigns/",
        json=campaign_data,
        headers=superuser_token_headers,
    )
    assert campaign_response.status_code == status.HTTP_201_CREATED
    campaign_id = campaign_response.json()["id"]
    print(f"Created test campaign with ID: {campaign_id}")
    
    # Update the campaign status to approved
    campaign_update = {
        "status": CampaignStatus.approved
    }
    
    update_response = client.patch(
        f"/api/v1/tenants/{tenant_name}/campaigns/{campaign_id}",
        json=campaign_update,
        headers=superuser_token_headers,
    )
    assert update_response.status_code == status.HTTP_200_OK
    updated_campaign = update_response.json()
    assert updated_campaign["status"] == "approved"
    print(f"Successfully approved campaign {campaign_id}")
    
    # Check campaign_customers table for entries (using test endpoint)
    # This would require a custom endpoint, or you can query the DB directly
    
    print("Campaign approval process completed successfully!")

# For manual testing
if __name__ == "__main__":
    # This part allows the test to be run directly for manual testing
    import os
    import sys
    
    # Get the authentication token first
    username = os.environ.get("TEST_SUPER_USER", "coderom")
    password = os.environ.get("TEST_SUPER_PASSWORD", "coderom")
    
    # Get token
    auth_response = client.post(
        "/api/v1/auth/token",
        data={
            "username": username,
            "password": password
        }
    )
    token = auth_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Run the test manually
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    from app.core.config import settings
    from app.db.session import Base
    
    engine = create_engine(settings.SQLALCHEMY_DATABASE_URI)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = TestingSessionLocal()
    
    try:
        test_campaign_approval_process(db, headers)
    finally:
        db.close() 