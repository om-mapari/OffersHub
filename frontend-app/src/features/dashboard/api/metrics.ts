import { tenantApiRequest } from '@/config/api';

// Types for metrics responses
export interface OffersMetrics {
  draft: number;
  pending_review: number;
  approved: number;
  rejected: number;
  retired: number;
}

export interface CampaignsMetrics {
  draft: number;
  approved: number;
  active: number;
  paused: number;
  completed: number;
}

export interface CampaignCustomer {
  campaign_id: number;
  campaign_name: string;
  sent_campaigns_customers: number;
  accepted_campaigns: number;
  percentage_accepted: number;
}

export interface CampaignCustomersResponse {
  campaigns: CampaignCustomer[];
}

export interface DeliveryStatusResponse {
  pending: number;
  sent: number;
  declined: number;
  accepted: number;
}

export interface CustomerSegmentDistribution {
  segment: string;
  count: number;
  percentage: number;
}

export interface CustomerSegmentsResponse {
  total_customers: number;
  segments: CustomerSegmentDistribution[];
}

export interface DeliveryStatusBreakdown {
  pending: number;
  sent: number;
  declined: number;
  accepted: number;
}

export interface CampaignDeliveryStatus {
  campaign_id: number;
  campaign_name: string;
  delivery_status: DeliveryStatusBreakdown;
}

// API functions to fetch metrics
export const fetchDeliveryStatus = async (tenantName: string): Promise<DeliveryStatusResponse> => {
  return tenantApiRequest<DeliveryStatusResponse>(
    'GET',
    tenantName,
    '/metrics/delivery-status'
  );
};

export const fetchOffersMetrics = async (tenantName: string): Promise<OffersMetrics> => {
  return tenantApiRequest<OffersMetrics>(
    'GET',
    tenantName,
    '/metrics/offers-metrics'
  );
};

export const fetchCampaignsMetrics = async (tenantName: string): Promise<CampaignsMetrics> => {
  return tenantApiRequest<CampaignsMetrics>(
    'GET',
    tenantName,
    '/metrics/campaigns-metrics'
  );
};

export const fetchCampaignCustomers = async (tenantName: string): Promise<CampaignCustomersResponse> => {
  return tenantApiRequest<CampaignCustomersResponse>(
    'GET',
    tenantName,
    '/metrics/campaign-customers'
  );
};

export const fetchCustomerSegments = async (tenantName: string): Promise<CustomerSegmentsResponse> => {
  return tenantApiRequest<CustomerSegmentsResponse>(
    'GET',
    tenantName,
    '/metrics/customer-segments'
  );
};

export const fetchCampaignDeliveryStatus = async (tenantName: string): Promise<CampaignDeliveryStatus[]> => {
  return tenantApiRequest<CampaignDeliveryStatus[]>(
    'GET',
    tenantName,
    '/metrics/campaign-delivery-status'
  );
}; 