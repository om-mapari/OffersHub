# This router will be mounted under /tenants/{tenant_name}/campaigns
import typing
from fastapi import APIRouter, Depends, HTTPException, status, Path, Response
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.models.campaign import CampaignStatus
from app.api.v1 import deps

from app import email_sender

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
    
    if not campaign:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Campaign not found")
    
    # Update the campaign using the CRUD utility
    updated_campaign = crud.campaign.update(db, db_obj=campaign, obj_in=campaign_update)
    print(f"Updated campaign: {updated_campaign.id}, Status: {updated_campaign.status}")
    if updated_campaign.status == CampaignStatus.active:
        # sent email to all customers
        try:
            email_sender.send_email(
                recipient_email="vishalgupta1504@gmail.com",
                campaign_name=updated_campaign.name
            )
        except Exception as e:
            print(f"Failed to send email: {str(e)}")
            # Handle the exception as needed, e.g., log it or raise a custom error
        pass
    
    if update_campaign.status == "approved":
        concatenated_list = []
        campaignCustomer = []
        for key, value in update_campaign.selection_criteria.items():
            if value.startswith('='):
                value_substringed_left = value[:1]
                value_substringed_right = value[1:]
                value_substringed_right_split = value_substringed_right.split(",")
                value_substringed_right_quoted = [f"'{s}'" for s in value_substringed_right_split]
                value_substringed_right_rejoined = ','.join(value_substringed_right_quoted)
                formatted_value = f"IN({value_substringed_right_rejoined})"
                concatenated_list.append(f"{key}={formatted_value}")
            else:
                concatenated_list.append(f"{key}={value}")
        print(concatenated_list)
        query = generate_select_query_for_table(where_criteria=concatenated_list)
        print(query)
        execution_output = execute_sql_query(query)
        print("\nExecution Output:")
        print(execution_output)
        for s in execution_output:
            campaignCustomerObj = {}
            campaignCustomerObj.customer_id = s
            campaignCustomerObj.campaign_id = updated_campaign.id
            campaignCustomerObj.offer_id = updated_campaign.offer_id
            campaignCustomerObj.delivery_status = "pending"
            campaignCustomer.append(campaignCustomerObj)
        print(campaignCustomerObj)

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
