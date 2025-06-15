import { Campaign, CampaignCreate, CampaignUpdate, campaignListSchema, campaignSchema } from '../data/schema';
import { useAuthStore } from '@/stores/authStore';
import { apiClient, tenantApiRequest } from '@/config/api';

// Cache expiration time in milliseconds (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000;

// In-memory cache for API responses
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// Cache for API responses
const apiCache = new Map<string, CacheEntry<any>>();

// Helper function to get auth token
const getAuthToken = (): string | null => {
  const state = useAuthStore.getState();
  return state.auth.accessToken;
};

// Helper function to get data from cache or fetch from API
async function getOrFetchData<T>(cacheKey: string, fetchFn: () => Promise<T>): Promise<T> {
  const cachedData = apiCache.get(cacheKey);
  
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_EXPIRATION) {
    console.log(`Using cached data for ${cacheKey}`);
    return cachedData.data;
  }
  
  console.log(`Fetching fresh data for ${cacheKey}`);
  const data = await fetchFn();
  
  apiCache.set(cacheKey, {
    data,
    timestamp: Date.now()
  });
  
  return data;
}

// Helper function to clear campaign cache for a tenant
export function clearCampaignsCache(tenantName: string): void {
  const cacheKey = `campaigns-${tenantName}`;
  if (apiCache.has(cacheKey)) {
    console.log(`Clearing cache for ${cacheKey}`);
    apiCache.delete(cacheKey);
  }
}

// Helper function to clear all caches
export function clearAllCaches(): void {
  console.log('Clearing all API caches');
  apiCache.clear();
}

export const campaignsApi = {
  // Get all campaigns for a tenant
  getCampaigns: async (tenantName: string): Promise<Campaign[]> => {
    if (!tenantName) {
      throw new Error('Tenant name is required');
    }
    
    return getOrFetchData<Campaign[]>(`campaigns-${tenantName}`, async () => {
      try {
        console.log(`Fetching campaigns for tenant: ${tenantName}`);
        
        const data = await tenantApiRequest<any>(
          'GET',
          tenantName,
          '/campaigns/'
        );
        
        return campaignListSchema.parse(data);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
        throw error;
      }
    });
  },

  // Create a new campaign
  createCampaign: async (tenantName: string, campaignData: CampaignCreate): Promise<Campaign> => {
    try {
      if (!tenantName) {
        throw new Error('Tenant name is required');
      }

      const data = await tenantApiRequest<any>(
        'POST',
        tenantName,
        '/campaigns/',
        campaignData
      );
      
      // Clear cache after creating a new campaign
      clearCampaignsCache(tenantName);
      
      return campaignSchema.parse(data);
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  },

  // Update a campaign
  updateCampaign: async (tenantName: string, campaignId: number, campaignData: CampaignUpdate): Promise<Campaign> => {
    try {
      if (!tenantName) {
        throw new Error('Tenant name is required');
      }

      const data = await tenantApiRequest<any>(
        'PUT',
        tenantName,
        `/campaigns/${campaignId}`,
        campaignData
      );
      
      // Clear cache after updating a campaign
      clearCampaignsCache(tenantName);
      
      return campaignSchema.parse(data);
    } catch (error) {
      console.error('Error updating campaign:', error);
      throw error;
    }
  },

  // Delete a campaign
  deleteCampaign: async (tenantName: string, campaignId: number): Promise<void> => {
    try {
      if (!tenantName) {
        throw new Error('Tenant name is required');
      }

      await tenantApiRequest(
        'DELETE',
        tenantName,
        `/campaigns/${campaignId}`
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
    if (!tenantName) {
      throw new Error('Tenant name is required');
    }
    
    return getOrFetchData<any[]>(`offers-${tenantName}`, async () => {
      try {
        console.log(`Fetching offers for tenant: ${tenantName}`);
        
        return await tenantApiRequest<any[]>(
          'GET',
          tenantName,
          '/offers/'
        );
      } catch (error) {
        console.error('Error fetching offers for campaign:', error);
        throw error;
      }
    });
  }
}; 