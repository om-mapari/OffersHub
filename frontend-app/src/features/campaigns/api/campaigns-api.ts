import axios from 'axios';
import { Campaign, CampaignCreate, CampaignUpdate, campaignListSchema, campaignSchema } from '../data/schema';
import { useAuthStore } from '@/stores/authStore';
import { API_BASE_URL } from '@/config/api';

// Cache expiration time in milliseconds (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000;

// In-memory cache for API responses
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}
const apiCache: Record<string, CacheEntry<any>> = {};

// Track ongoing fetch requests to prevent duplicate calls
const ongoingFetches: Record<string, Promise<any>> = {};

// Helper function to get or set cached data
async function getOrFetchData<T>(
  cacheKey: string,
  fetchFn: () => Promise<T>
): Promise<T> {
  const now = Date.now();
  const cachedData = apiCache[cacheKey];
  
  // Return cached data if it exists and hasn't expired
  if (cachedData && now - cachedData.timestamp < CACHE_EXPIRATION) {
    console.log(`Using cached data for ${cacheKey}`);
    return cachedData.data;
  }
  
  // If there's already an ongoing fetch for this key, return that promise
  // This prevents duplicate requests if multiple components call the same API
  // at the same time before the first one resolves
  if (ongoingFetches[cacheKey] !== undefined) {
    console.log(`Reusing in-progress fetch for ${cacheKey}`);
    return ongoingFetches[cacheKey];
  }
  
  // Fetch fresh data
  console.log(`Fetching fresh data for ${cacheKey}`);
  
  // Create a promise and store it to prevent duplicate requests
  const fetchPromise = fetchFn().then(data => {
    // Cache the successful result
    apiCache[cacheKey] = {
      data,
      timestamp: now
    };
    // Remove from ongoing fetches
    delete ongoingFetches[cacheKey];
    return data;
  }).catch(error => {
    // Remove from ongoing fetches on error
    delete ongoingFetches[cacheKey];
    throw error;
  });
  
  // Store the promise
  ongoingFetches[cacheKey] = fetchPromise;
  
  return fetchPromise;
}

// Helper to get the current auth token
const getAuthToken = (): string | null => {
  return useAuthStore.getState().auth.accessToken;
};

// Function to clear cache for a specific tenant
export const clearCampaignsCache = (tenantName: string): void => {
  const cacheKey = `campaigns-${tenantName}`;
  if (apiCache[cacheKey]) {
    delete apiCache[cacheKey];
    console.log(`Cleared cache for ${cacheKey}`);
  }
};

export const campaignsApi = {
  // Get all campaigns for a tenant
  getCampaigns: async (tenantName: string): Promise<Campaign[]> => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication token not found');
    }
    
    return getOrFetchData<Campaign[]>(`campaigns-${tenantName}`, async () => {
      try {
        console.log(`Fetching campaigns for tenant: ${tenantName}`);
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
    });
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
      
      // Clear cache after creating a new campaign
      clearCampaignsCache(tenantName);
      
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
      
      // Clear cache after updating a campaign
      clearCampaignsCache(tenantName);
      
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
      
      // Clear cache after deleting a campaign
      clearCampaignsCache(tenantName);
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
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication token not found');
    }
    
    return getOrFetchData<any[]>(`offers-${tenantName}`, async () => {
      try {
        console.log(`Fetching offers for tenant: ${tenantName}`);
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
    });
  }
}; 