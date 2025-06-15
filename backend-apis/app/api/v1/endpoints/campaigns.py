# This router will be mounted under /tenants/{tenant_name}/campaigns
import typing
from fastapi import APIRouter, Depends, HTTPException, status, Path, Response
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.models.campaign import CampaignStatus
from app.api.v1 import deps
import psycopg2
from app import email_sender
from app.services.campaign_processing_service import campaign_service
from app.services.campaign_activation_service import campaign_activation_service

router = APIRouter()

# Define required roles (similar to offers.py)
can_manage_campaigns = deps.TenantRoleChecker(required_roles=["admin", "create"])
can_read_campaigns = deps.TenantRoleChecker(required_roles=["admin", "create", "approver", "read_only"])

@router.post("/", response_model=schemas.Campaign, status_code=status.HTTP_201_CREATED, dependencies=[Depends(can_manage_campaigns)])
def create_campaign(
    *,
    db: Session = Depends(deps.get_db),
    campaign_in: schemas.CampaignCreate,
    tenant: models.Tenant = Depends(deps.get_tenant_by_name),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> typing.Any:
    """
    Create a new campaign within the specified tenant.
    """
    if campaign_in.offer_id:
        offer = crud.offer.get(db, id=campaign_in.offer_id)
        if not offer or offer.tenant_name != tenant.name:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Offer not found in this tenant")

    campaign_data = campaign_in.model_dump()
    campaign_data["tenant_name"] = tenant.name
    campaign_data["created_by_username"] = current_user.username
    
    db_campaign = models.Campaign(**campaign_data, status=CampaignStatus.draft)
    db.add(db_campaign)
    db.commit()
    db.refresh(db_campaign)
    return db_campaign

@router.get("/", response_model=typing.List[schemas.Campaign], dependencies=[Depends(can_read_campaigns)])
def list_campaigns(
    *,
    db: Session = Depends(deps.get_db),
    tenant: models.Tenant = Depends(deps.get_tenant_by_name),
    skip: int = 0,
    limit: int = 100,
    # Add filters like status, offer_id if needed
) -> typing.Any:
    """
    List campaigns for the tenant.
    """
    campaigns = db.query(models.Campaign).filter(models.Campaign.tenant_name == tenant.name).offset(skip).limit(limit).all()
    return campaigns

@router.get("/{campaign_id}", response_model=schemas.Campaign, dependencies=[Depends(can_read_campaigns)])
def get_campaign(
    *,
    db: Session = Depends(deps.get_db),
    tenant: models.Tenant = Depends(deps.get_tenant_by_name),
    campaign_id: int = Path(..., title="The ID of the campaign to get"),
) -> typing.Any:
    """
    Get specific campaign by ID.
    """
    campaign = db.query(models.Campaign).filter(
        models.Campaign.id == campaign_id,
        models.Campaign.tenant_name == tenant.name
    ).first()
    
    if not campaign:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign not found")
    
    return campaign

@router.patch("/{campaign_id}", response_model=schemas.Campaign, dependencies=[Depends(can_manage_campaigns)])
def update_campaign(
    *,
    db: Session = Depends(deps.get_db),
    tenant: models.Tenant = Depends(deps.get_tenant_by_name),
    campaign_id: int = Path(..., title="The ID of the campaign to update"),
    campaign_update: schemas.CampaignUpdate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> typing.Any:
    """
    Update a campaign.
    
    Only include fields you want to update:
    - name
    - description
    - start_date
    - end_date
    - selection_criteria
    - status
    """
    campaign = db.query(models.Campaign).filter(
        models.Campaign.id == campaign_id,
        models.Campaign.tenant_name == tenant.name
    ).first()
    print("API Full Request received for updating campaign :", campaign_update)
    if not campaign:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign not found")
    
    # Update the campaign using the CRUD utility
    updated_campaign = crud.campaign.update(db, db_obj=campaign, obj_in=campaign_update)
    print(f"Updated campaign: {updated_campaign.id}, Status: {updated_campaign.status}")
    
    # Handle campaign status changes
    if updated_campaign.status == CampaignStatus.active:
        # Use our campaign activation service to handle the activated campaign
        notified_customers = campaign_activation_service.process_activated_campaign(db, updated_campaign.id)
        print(f"Campaign {updated_campaign.id} activated, {len(notified_customers)} customers notified")

    if updated_campaign.status == CampaignStatus.approved:
        # Use our campaign processing service to handle the approved campaign
        customer_ids = campaign_service.process_approved_campaign(db, updated_campaign.id)
        print(f"Campaign {updated_campaign.id} processed, {len(customer_ids)} customers matched")

    return updated_campaign

@router.delete("/{campaign_id}", dependencies=[Depends(can_manage_campaigns)])
def delete_campaign(
    *,
    db: Session = Depends(deps.get_db),
    tenant: models.Tenant = Depends(deps.get_tenant_by_name),
    campaign_id: int = Path(..., title="The ID of the campaign to delete"),
) -> typing.Any:
    """
    Delete a campaign.
    """
    campaign = db.query(models.Campaign).filter(
        models.Campaign.id == campaign_id,
        models.Campaign.tenant_name == tenant.name
    ).first()
    
    if not campaign:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign not found")
    
    # Delete the campaign
    db.delete(campaign)
    db.commit()
    
    # Return 204 No Content
    return Response(status_code=status.HTTP_204_NO_CONTENT)

# Add other campaign endpoints (/process-customers, /customers)
