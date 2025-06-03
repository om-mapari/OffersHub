import axios from 'axios';
import { Campaign, CampaignCreate, campaignListSchema, campaignSchema } from '../data/schema';
import { useAuthStore } from '@/stores/authStore';

const API_BASE_URL = 'http://localhost:8000/api/v1';

// Helper to get the current auth token
const getAuthToken = (): string | null => {
  return useAuthStore.getState().auth.accessToken;
};

export const campaignsApi = {
  // Get all campaigns for a tenant
  getCampaigns: async (tenantName: string): Promise<Campaign[]> => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.get(
        `${API_BASE_URL}/tenants/${tenantName}/campaigns/`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        }
      );
      
      return campaignListSchema.parse(response.data);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      throw error;
    }
  },

  // Create a new campaign
  createCampaign: async (tenantName: string, campaignData: CampaignCreate): Promise<Campaign> => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.post(
        `${API_BASE_URL}/tenants/${tenantName}/campaigns/`,
        campaignData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        }
      );
      
      return campaignSchema.parse(response.data);
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  },

  // Get offers for dropdown selection
  getOffers: async (tenantName: string) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.get(
        `${API_BASE_URL}/tenants/${tenantName}/offers/`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error fetching offers for campaign:', error);
      throw error;
    }
  }
}; 