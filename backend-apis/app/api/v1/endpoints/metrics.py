from typing import Dict, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, case, distinct, text
from sqlalchemy.sql import text as sql_text

from app import models, schemas
from app.api.v1 import deps
from app.models.campaign_customer import DeliveryStatus
from app.models.campaign import CampaignStatus

router = APIRouter()


# Define required roles for metrics operations
can_view_metrics = deps.TenantRoleChecker(required_roles=["admin", "create", "approver", "read_only"])


# 1) delivery_status - Get the number of customers for a specific tenent having delivery_status as 'pending', 'sent', 'declined', 'accepted'
@router.get("/delivery-status", response_model=schemas.DeliveryStatusResponse, dependencies=[Depends(can_view_metrics)])
async def get_delivery_status(
    db: Session = Depends(deps.get_db),
    tenant: models.Tenant = Depends(deps.get_tenant_by_name),
    current_user: models.User = Depends(deps.get_current_active_user)
) -> schemas.DeliveryStatusResponse:
    """
    Get the number of customers for a specific tenent having delivery_status as 'pending', 'sent', 'declined', 'accepted'
    """
    try:
        # Use tenant_name directly from CampaignCustomer
        result = db.query(
            models.CampaignCustomer.delivery_status,
            func.count().label('count')
        ).filter(
            models.CampaignCustomer.tenant_name == tenant.name,
            models.CampaignCustomer.delivery_status.in_(['pending', 'sent', 'declined', 'accepted'])
        ).group_by(models.CampaignCustomer.delivery_status).all()

        metrics = schemas.DeliveryStatusResponse()
        for status, count in result:
            setattr(metrics, status, count)

        return metrics
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/offers-metrics", response_model=schemas.OffersMetricsResponse, dependencies=[Depends(can_view_metrics)])
async def get_offers_metrics(
    db: Session = Depends(deps.get_db),
    tenant: models.Tenant = Depends(deps.get_tenant_by_name),  # Injected by path param {tenant_name}
    current_user: models.User = Depends(deps.get_current_active_user)
) -> schemas.OffersMetricsResponse:
    """
    Get metrics about offers grouped by status for a specific tenant having status as 'draft', 'pending_review', 'approved', 'rejected', 'retired'
    """
    try:
        # Query to count offers by status for the specific tenant
        result = db.query(
            models.Offer.status,
            func.count(models.Offer.id).label('count')
        ).filter(
            models.Offer.tenant_name == tenant.name
        ).group_by(models.Offer.status).all()
        
        # Initialize with default values (0 for each status)
        metrics = schemas.OffersMetricsResponse()
        
        # Update counts based on query results
        for status, count in result:
            setattr(metrics, status, count)
            
        return metrics
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")


@router.get("/campaigns-metrics", response_model=schemas.CampaignsMetricsResponse, dependencies=[Depends(can_view_metrics)])
async def get_campaigns_metrics(
    db: Session = Depends(deps.get_db),
    tenant: models.Tenant = Depends(deps.get_tenant_by_name),  # Injected by path param {tenant_name}
    current_user: models.User = Depends(deps.get_current_active_user)
) -> schemas.CampaignsMetricsResponse:
    """
    Get metrics about campaigns grouped by status for a specific tenant having status as 'draft', 'approved', 'active', 'paused', 'completed'
    """
    try:
        # Query to count campaigns by status for the specific tenant
        result = db.query(
            models.Campaign.status,
            func.count(models.Campaign.id).label('count')
        ).filter(
            models.Campaign.tenant_name == tenant.name
        ).group_by(models.Campaign.status).all()
        
        # Initialize with default values (0 for each status)
        metrics = schemas.CampaignsMetricsResponse()
        
        # Update counts based on query results
        for status, count in result:
            setattr(metrics, status, count)
            
        return metrics
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")


@router.get("/campaign-customers", response_model=schemas.CampaignCustomersResponse, dependencies=[Depends(can_view_metrics)])
async def get_campaign_customers(
    db: Session = Depends(deps.get_db),
    tenant: models.Tenant = Depends(deps.get_tenant_by_name),
    current_user: models.User = Depends(deps.get_current_active_user)
) -> schemas.CampaignCustomersResponse:
    """
    Get metrics about campaign customers for a specific tenant: sent, accepted, and percentage of accepted campaigns
    """
    try:
        # Use ORM query similar to campaigns.py
        results = db.query(
            models.CampaignCustomer.campaign_id,
            models.Campaign.name.label('campaign_name'),
            func.count().filter(models.CampaignCustomer.delivery_status == DeliveryStatus.sent).label('sent'),
            func.count().filter(models.CampaignCustomer.delivery_status == DeliveryStatus.accepted).label('accepted')
        ).join(
            models.Campaign, models.CampaignCustomer.campaign_id == models.Campaign.id
        ).filter(
            models.Campaign.status == CampaignStatus.active,
            models.CampaignCustomer.tenant_name == tenant.name
        ).group_by(
            models.CampaignCustomer.campaign_id, models.Campaign.name
        ).order_by(
            models.CampaignCustomer.campaign_id
        ).all()
        
        if not results:
            return schemas.CampaignCustomersResponse(campaigns=[])
        
        campaigns_summary = []
        for campaign_id, campaign_name, sent, accepted in results:
            total_customers = sent + accepted
            
            percentage_accepted = 0.0
            if total_customers > 0:
                percentage_accepted = (accepted / total_customers) * 100
                
            campaigns_summary.append(schemas.CampaignCustomerStats(
                campaign_id=campaign_id,
                campaign_name=campaign_name,
                sent_campaigns_customers=total_customers,
                accepted_campaigns=accepted,
                percentage_accepted=percentage_accepted
            ))
            
        return schemas.CampaignCustomersResponse(campaigns=campaigns_summary)
    except Exception as e:
        print(f"Error in campaign-customers endpoint: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")


# Additional metrics endpoint
@router.get("/customer-segments", response_model=schemas.CustomerSegmentsResponse, dependencies=[Depends(can_view_metrics)])
async def get_customer_segments(
    db: Session = Depends(deps.get_db),
    tenant: models.Tenant = Depends(deps.get_tenant_by_name),  # Injected by path param {tenant_name}
    current_user: models.User = Depends(deps.get_current_active_user)
) -> schemas.CustomerSegmentsResponse:
    """
    Get customer distribution by segments for a specific tenant
    """
    try:
        # Get customers associated with campaigns for this tenant
        subquery = db.query(models.Customer.id).distinct().join(
            models.CampaignCustomer, models.Customer.id == models.CampaignCustomer.customer_id
        ).filter(
            models.CampaignCustomer.tenant_name == tenant.name
        ).subquery()
        
        # Get total number of customers for this tenant
        total_customers = db.query(func.count()).select_from(subquery).scalar() or 0
        
        if total_customers == 0:
            return schemas.CustomerSegmentsResponse(
                total_customers=0,
                segments=[]
            )
        
        # Query to count customers by segment for this tenant
        segment_counts = db.query(
            models.Customer.segment,
            func.count().label('count')
        ).join(
            subquery, models.Customer.id == subquery.c.id
        ).filter(
            models.Customer.segment.isnot(None)
        ).group_by(
            models.Customer.segment
        ).all()
        
        # Calculate percentages and build response
        segments = []
        for segment, count in segment_counts:
            percentage = (count / total_customers) * 100
            segments.append(schemas.CustomerSegmentDistribution(
                segment=segment or "Unknown",
                count=count,
                percentage=percentage
            ))
            
        return schemas.CustomerSegmentsResponse(
            total_customers=total_customers,
            segments=segments
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")

@router.get("/campaign-delivery-status", response_model=List[schemas.CampaignDeliveryStatus], dependencies=[Depends(can_view_metrics)])
async def get_campaign_delivery_status(
    db: Session = Depends(deps.get_db),
    tenant: models.Tenant = Depends(deps.get_tenant_by_name),
    current_user: models.User = Depends(deps.get_current_active_user)
) -> List[schemas.CampaignDeliveryStatus]:
    """
    Get breakdown of delivery statuses for each campaign associated with a specific tenant
    """
    try:
        # Get all campaigns for the tenant
        campaigns = db.query(
            models.Campaign.id,
            models.Campaign.name
        ).filter(
            models.Campaign.tenant_name == tenant.name
        ).all()
        
        if not campaigns:
            return []
            
        result = []
        for campaign_id, campaign_name in campaigns:
            # For each campaign, get the count of each delivery status
            status_counts = db.query(
                models.CampaignCustomer.delivery_status,
                func.count().label('count')
            ).filter(
                models.CampaignCustomer.campaign_id == campaign_id,
                models.CampaignCustomer.tenant_name == tenant.name
            ).group_by(
                models.CampaignCustomer.delivery_status
            ).all()
            
            # Create a dictionary of delivery statuses
            delivery_status = {
                "pending": 0,
                "sent": 0,
                "declined": 0,
                "accepted": 0
            }
            
            # Update the dictionary with actual counts
            for status, count in status_counts:
                delivery_status[status] = count
                
            # Add campaign info to results
            result.append(schemas.CampaignDeliveryStatus(
                campaign_id=campaign_id,
                campaign_name=campaign_name,
                delivery_status=delivery_status
            ))
            
        return result
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Database error: {str(e)}")
