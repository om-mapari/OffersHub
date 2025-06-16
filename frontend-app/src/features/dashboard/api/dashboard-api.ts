import { useAuthStore } from '@/stores/authStore';
import { API_BASE_URL } from '@/config/api';
import axios from 'axios';

// Helper function to get auth token
const getAuthToken = (): string | null => {
  const state = useAuthStore.getState();
  return state.auth.accessToken;
};

// Dashboard API functions
export const dashboardApi = {
  // Get delivery status metrics
  getDeliveryStatus: async (tenantName: string) => {
    if (!tenantName) {
      throw new Error('Tenant name is required');
    }
    
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }
    
    try {
      const response = await axios.get(`${API_BASE_URL}/tenants/${tenantName}/metrics/delivery-status`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
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
    
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }
    
    try {
      const response = await axios.get(`${API_BASE_URL}/tenants/${tenantName}/metrics/offers-metrics`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
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
    
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }
    
    try {
      const response = await axios.get(`${API_BASE_URL}/tenants/${tenantName}/metrics/campaigns-metrics`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
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
    
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }
    
    try {
      const response = await axios.get(`${API_BASE_URL}/tenants/${tenantName}/metrics/campaign-customers`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
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
    
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }
    
    try {
      const response = await axios.get(`${API_BASE_URL}/tenants/${tenantName}/metrics/customer-segments`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching customer segments:', error);
      throw error;
    }
  }
}; 