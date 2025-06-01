# This router will be mounted under /tenants/{tenant_name}/campaigns
import typing
from fastapi import APIRouter, Depends, HTTPException, status, Path
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.models.campaign import CampaignStatus
from app.api.v1 import deps

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

# Add other campaign endpoints (GET {id}, PUT {id}, DELETE {id}, /process-customers, /customers)
