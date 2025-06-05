import { API_BASE_URL } from '@/config/api';

// Types for metrics responses
export interface OffersMetrics {
  approved: number;
  draft: number;
  rejected: number;
  pending_review: number;
  retired: number;
}

export interface CampaignsMetrics {
  active: number;
  completed: number;
  paused: number;
  approved: number;
  draft: number;
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

// API functions to fetch metrics
export const fetchActiveCustomers = async (): Promise<number> => {
  const response = await fetch(`${API_BASE_URL}/metrics/active-customers`);
  if (!response.ok) {
    throw new Error('Failed to fetch active customers');
  }
  return response.json();
};

export const fetchOffersMetrics = async (): Promise<OffersMetrics> => {
  const response = await fetch(`${API_BASE_URL}/metrics/offers-metrics`);
  if (!response.ok) {
    throw new Error('Failed to fetch offers metrics');
  }
  return response.json();
};

export const fetchCampaignsMetrics = async (): Promise<CampaignsMetrics> => {
  const response = await fetch(`${API_BASE_URL}/metrics/campaigns-metrics`);
  if (!response.ok) {
    throw new Error('Failed to fetch campaigns metrics');
  }
  return response.json();
};

export const fetchCampaignCustomers = async (): Promise<CampaignCustomersResponse> => {
  const response = await fetch(`${API_BASE_URL}/metrics/campaign-customers`);
  if (!response.ok) {
    throw new Error('Failed to fetch campaign customers');
  }
  return response.json();
}; 