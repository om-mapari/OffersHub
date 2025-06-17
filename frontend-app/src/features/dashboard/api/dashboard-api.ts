import { useAuthStore } from '@/stores/authStore';
import { apiClient, API_BASE_URL } from '@/config/api';

// Dashboard API functions
export const dashboardApi = {
  // Get delivery status metrics
  getDeliveryStatus: async (tenantName: string) => {
    if (!tenantName) {
      throw new Error('Tenant name is required');
    }
    
    try {
      const response = await apiClient.get(`/tenants/${tenantName}/metrics/delivery-status`);
      return response.data;
    } catch (error) {
      console.error('Error fetching delivery status metrics:', error);
      throw error;
    }
  },
  
  // Get offers metrics
  getOffersMetrics: async (tenantName: string) => {
    if (!tenantName) {
      throw new Error('Tenant name is required');
    }
    
    try {
      const response = await apiClient.get(`/tenants/${tenantName}/metrics/offers-metrics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching offers metrics:', error);
      throw error;
    }
  },
  
  // Get campaigns metrics
  getCampaignsMetrics: async (tenantName: string) => {
    if (!tenantName) {
      throw new Error('Tenant name is required');
    }
    
    try {
      const response = await apiClient.get(`/tenants/${tenantName}/metrics/campaigns-metrics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching campaigns metrics:', error);
      throw error;
    }
  },
  
  // Get campaign customers data
  getCampaignCustomers: async (tenantName: string) => {
    if (!tenantName) {
      throw new Error('Tenant name is required');
    }
    
    try {
      const response = await apiClient.get(`/tenants/${tenantName}/metrics/campaign-customers`);
      return response.data;
    } catch (error) {
      console.error('Error fetching campaign customers:', error);
      throw error;
    }
  },
  
  // Get customer segments data
  getCustomerSegments: async (tenantName: string) => {
    if (!tenantName) {
      throw new Error('Tenant name is required');
    }
    
    try {
      const response = await apiClient.get(`/tenants/${tenantName}/metrics/customer-segments`);
      return response.data;
    } catch (error) {
      console.error('Error fetching customer segments:', error);
      throw error;
    }
  }
};