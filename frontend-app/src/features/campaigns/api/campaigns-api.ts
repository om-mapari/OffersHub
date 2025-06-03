import axios from 'axios';
import { Campaign, CampaignCreate, CampaignUpdate, campaignListSchema, campaignSchema } from '../data/schema';
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

  // Update a campaign
  updateCampaign: async (tenantName: string, campaignId: number, campaignData: CampaignUpdate): Promise<Campaign> => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.patch(
        `${API_BASE_URL}/tenants/${tenantName}/campaigns/${campaignId}`,
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
      console.error('Error updating campaign:', error);
      throw error;
    }
  },

  // Delete a campaign
  deleteCampaign: async (tenantName: string, campaignId: number): Promise<void> => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      await axios.delete(
        `${API_BASE_URL}/tenants/${tenantName}/campaigns/${campaignId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        }
      );
    } catch (error) {
      console.error('Error deleting campaign:', error);
      throw error;
    }
  },

  // Update campaign status to approved
  approveCampaign: async (tenantName: string, campaignId: number): Promise<Campaign> => {
    return campaignsApi.updateCampaign(tenantName, campaignId, { status: 'approved' });
  },

  // Update campaign status to active
  activateCampaign: async (tenantName: string, campaignId: number): Promise<Campaign> => {
    return campaignsApi.updateCampaign(tenantName, campaignId, { status: 'active' });
  },

  // Update campaign status to paused
  pauseCampaign: async (tenantName: string, campaignId: number): Promise<Campaign> => {
    return campaignsApi.updateCampaign(tenantName, campaignId, { status: 'paused' });
  },

  // Update campaign status to completed
  completeCampaign: async (tenantName: string, campaignId: number): Promise<Campaign> => {
    return campaignsApi.updateCampaign(tenantName, campaignId, { status: 'completed' });
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