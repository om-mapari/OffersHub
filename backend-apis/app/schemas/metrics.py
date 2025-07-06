from typing import List, Dict, Optional
from pydantic import BaseModel


class ActiveCustomersResponse(BaseModel):
    count: int
    
    
class OffersMetricsResponse(BaseModel):
    draft: Optional[int] = 0
    pending_review: Optional[int] = 0
    approved: Optional[int] = 0
    rejected: Optional[int] = 0
    retired: Optional[int] = 0
    
    
class CampaignsMetricsResponse(BaseModel):
    draft: Optional[int] = 0
    approved: Optional[int] = 0
    active: Optional[int] = 0
    paused: Optional[int] = 0
    completed: Optional[int] = 0


class CampaignCustomerStats(BaseModel):
    campaign_id: int
    campaign_name: str
    sent_campaigns_customers: int
    accepted_campaigns: int
    percentage_accepted: float


class CampaignCustomersResponse(BaseModel):
    campaigns: List[CampaignCustomerStats]
    
    
# Additional metrics schemas
class CustomerSegmentDistribution(BaseModel):
    segment: str
    count: int
    percentage: float


class CustomerSegmentsResponse(BaseModel):
    total_customers: int
    segments: List[CustomerSegmentDistribution] 


class DeliveryStatusResponse(BaseModel):
    pending: int = 0
    sent: int = 0
    declined: int = 0
    accepted: int = 0


class CampaignDeliveryStatus(BaseModel):
    campaign_id: int
    campaign_name: str
    delivery_status: Dict[str, int]
