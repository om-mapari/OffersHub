import { API_BASE_URL, buildTenantApiUrl } from '@/config/api';

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

// API functions to fetch metrics
export const fetchDeliveryStatus = async (tenantName: string, token: string): Promise<DeliveryStatusResponse> => {
  const response = await fetch(buildTenantApiUrl(tenantName, '/metrics/delivery-status'), {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch delivery status metrics');
  }
  return response.json();
};

export const fetchOffersMetrics = async (tenantName: string, token: string): Promise<OffersMetrics> => {
  const response = await fetch(buildTenantApiUrl(tenantName, '/metrics/offers-metrics'), {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch offers metrics');
  }
  return response.json();
};

export const fetchCampaignsMetrics = async (tenantName: string, token: string): Promise<CampaignsMetrics> => {
  const response = await fetch(buildTenantApiUrl(tenantName, '/metrics/campaigns-metrics'), {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch campaigns metrics');
  }
  return response.json();
};

export const fetchCampaignCustomers = async (tenantName: string, token: string): Promise<CampaignCustomersResponse> => {
  const response = await fetch(buildTenantApiUrl(tenantName, '/metrics/campaign-customers'), {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch campaign customers');
  }
  return response.json();
};

export const fetchCustomerSegments = async (tenantName: string, token: string): Promise<CustomerSegmentsResponse> => {
  const response = await fetch(buildTenantApiUrl(tenantName, '/metrics/customer-segments'), {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch customer segments');
  }
  return response.json();
}; 