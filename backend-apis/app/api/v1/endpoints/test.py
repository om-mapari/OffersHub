from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
import uuid

from app import models
from app.models.campaign import CampaignStatus
import datetime
import typing

from app.api.v1 import deps

router = APIRouter()

@router.get("/")
def test_endpoint():
    """
    Simple test endpoint to verify that the server is working correctly.
    """
    return {"message": "Server is working correctly!"}

@router.get("/auth")
def test_auth_endpoint(current_user: models.User = Depends(deps.get_current_active_user)):
    """
    Test endpoint that requires authentication.
    """
    return {
        "message": "Authentication is working correctly!",
        "user": current_user.username
    }

@router.get("/offers")
def test_offers(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
):
    """
    Test endpoint to directly query the offers table.
    """
    try:
        # Use raw SQL query to avoid enum issues
        result = db.execute(text("SELECT * FROM offers LIMIT 10")).fetchall()
        
        # Convert to list of dicts for JSON response
        offers = []
        for row in result:
            offer_dict = {}
            for column, value in row._mapping.items():
                # Convert datetime objects to strings for JSON serialization
                if isinstance(value, (datetime.datetime, datetime.date)):
                    offer_dict[column] = value.isoformat()
                else:
                    offer_dict[column] = value
            offers.append(offer_dict)
        
        return {"offers": offers}
    except Exception as e:
        return {"error": str(e)}

@router.get("/customers")
def test_customers(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
):
    """
    Test endpoint to directly query the customers table.
    """
    try:
        # Use raw SQL query to avoid enum issues
        result = db.execute(text("SELECT * FROM customers LIMIT 10")).fetchall()
        
        # Convert to list of dicts for JSON response
        customers = []
        for row in result:
            customer_dict = {}
            for column, value in row._mapping.items():
                # Convert datetime objects to strings for JSON serialization
                if isinstance(value, (datetime.datetime, datetime.date)):
                    customer_dict[column] = value.isoformat()
                # Convert UUID objects to strings
                elif hasattr(value, 'hex'):  # Check if it's a UUID
                    customer_dict[column] = str(value)
                else:
                    customer_dict[column] = value
            customers.append(customer_dict)
        
        return {"customers": customers}
    except Exception as e:
        return {"error": str(e)}

@router.get("/campaigns")
def test_campaigns(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
):
    """
    Test endpoint to directly query the campaigns table.
    """
    try:
        # Use raw SQL query to avoid enum issues
        result = db.execute(text("SELECT * FROM campaigns LIMIT 10")).fetchall()
        
        # Convert to list of dicts for JSON response
        campaigns = []
        for row in result:
            campaign_dict = {}
            for column, value in row._mapping.items():
                # Convert datetime objects to strings for JSON serialization
                if isinstance(value, (datetime.datetime, datetime.date)):
                    campaign_dict[column] = value.isoformat()
                else:
                    campaign_dict[column] = value
            campaigns.append(campaign_dict)
        
        return {"campaigns": campaigns}
    except Exception as e:
        return {"error": str(e)}

@router.post("/debug-campaign", response_model=dict)
def debug_campaign(
    *,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> typing.Any:
    """
    Debug campaign creation.
    """
    try:
        # Create a test campaign
        campaign_data = {
            "name": "Debug Campaign",
            "tenant_name": "credit_card",
            "created_by_username": current_user.username,
            "description": "Debug campaign creation",
            "selection_criteria": {"segment": "premium"},
            "start_date": datetime.date.today(),
            "end_date": datetime.date.today() + datetime.timedelta(days=30),
            "status": CampaignStatus.draft
        }
        
        db_campaign = models.Campaign(**campaign_data)
        db.add(db_campaign)
        db.commit()
        db.refresh(db_campaign)
        
        return {"success": True, "campaign_id": db_campaign.id}
    except Exception as e:
        return {"success": False, "error": str(e), "error_type": str(type(e))} 