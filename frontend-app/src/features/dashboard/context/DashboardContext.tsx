import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { 
  fetchOffersMetrics, 
  fetchCampaignsMetrics,
  fetchDeliveryStatus,
  fetchCampaignCustomers,
  fetchCustomerSegments,
  OffersMetrics,
  CampaignsMetrics,
  DeliveryStatusResponse,
  CampaignCustomersResponse,
  CustomerSegmentsResponse
} from '../api/metrics';
import { useTenant } from '@/context/TenantContext';

interface DashboardContextType {
  deliveryStatus: DeliveryStatusResponse | null;
  offersMetrics: OffersMetrics | null;
  campaignsMetrics: CampaignsMetrics | null;
  campaignCustomers: CampaignCustomersResponse | null;
  customerSegments: CustomerSegmentsResponse | null;
  loading: boolean;
  error: string | null;
  totalCustomers: number;
  activeOffers: number;
  activeCampaigns: number;
  campaignEngagement: number;
  refreshData: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

// Cache for API responses to prevent duplicate calls
interface CacheEntry {
  timestamp: number;
  data: any;
}

interface ApiCache {
  [key: string]: CacheEntry;
}

// Cache expiration time in milliseconds (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000;

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const { currentTenant } = useTenant();
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatusResponse | null>(null);
  const [offersMetrics, setOffersMetrics] = useState<OffersMetrics | null>(null);
  const [campaignsMetrics, setCampaignsMetrics] = useState<CampaignsMetrics | null>(null);
  const [campaignCustomers, setCampaignCustomers] = useState<CampaignCustomersResponse | null>(null);
  const [customerSegments, setCustomerSegments] = useState<CustomerSegmentsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use a ref for the cache to maintain it between renders
  const apiCacheRef = useRef<ApiCache>({});
  const instanceIdRef = useRef(`dashboard-${Math.random().toString(36).substring(2, 9)}`);
  
  // Log cache state for debugging
  const logCacheState = () => {
    const cache = apiCacheRef.current;
    console.log(`[${instanceIdRef.current}] Cache state:`, Object.keys(cache).map(key => ({
      key,
      age: Math.round((Date.now() - cache[key].timestamp) / 1000) + 's ago'
    })));
  };
  
  // Memoized API fetch function with caching
  const fetchWithCache = async <T,>(
    key: string, 
    fetchFunction: () => Promise<T>
  ): Promise<T> => {
    const cache = apiCacheRef.current;
    const now = Date.now();
    
    // Check if we have a valid cached response
    if (cache[key] && (now - cache[key].timestamp) < CACHE_EXPIRATION) {
      console.log(`[${instanceIdRef.current}] ✅ Using cached data for ${key}`);
      return cache[key].data as T;
    }
    
    // Fetch fresh data
    console.log(`[${instanceIdRef.current}] 🔄 Fetching fresh data for ${key}`);
    const data = await fetchFunction();
    
    // Cache the result
    cache[key] = {
      timestamp: now,
      data
    };
    
    return data;
  };
  
  const fetchData = async () => {
    if (!currentTenant) {
      setLoading(false);
      return;
    }

    try {
      console.log(`[${instanceIdRef.current}] Starting data fetch for tenant: ${currentTenant.name}`);
      logCacheState();
      
      setLoading(true);
      // Fetch all metrics in parallel using the cache
      const tenantName = currentTenant.name;
      
      const [delivery, offers, campaigns, customers, segments] = await Promise.all([
        fetchWithCache(`delivery-status-${tenantName}`, 
          () => fetchDeliveryStatus(tenantName)),
        fetchWithCache(`offers-metrics-${tenantName}`, 
          () => fetchOffersMetrics(tenantName)),
        fetchWithCache(`campaigns-metrics-${tenantName}`, 
          () => fetchCampaignsMetrics(tenantName)),
        fetchWithCache(`campaign-customers-${tenantName}`, 
          () => fetchCampaignCustomers(tenantName)
            .catch(e => {
              console.error('Error fetching campaign customers:', e);
              return { campaigns: [] };
            })),
        fetchWithCache(`customer-segments-${tenantName}`, 
          () => fetchCustomerSegments(tenantName)
            .catch(e => {
              console.error('Error fetching customer segments:', e);
              return { total_customers: 0, segments: [] };
            }))
      ]);
      
      console.log(`[${instanceIdRef.current}] Data fetch complete`);
      logCacheState();
      
      setDeliveryStatus(delivery);
      setOffersMetrics(offers);
      setCampaignsMetrics(campaigns);
      setCampaignCustomers(customers);
      setCustomerSegments(segments);
      setError(null);
    } catch (err) {
      console.error(`[${instanceIdRef.current}] Dashboard data fetch error:`, err);
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };
  
  // Only refetch data when tenant changes
  useEffect(() => {
    // Clear cache when tenant changes
    if (currentTenant) {
      console.log(`[${instanceIdRef.current}] Tenant changed, clearing cache`);
      apiCacheRef.current = {};
    }
    fetchData();
    
    // Log component mount/unmount for debugging React strict mode
    console.log(`[${instanceIdRef.current}] DashboardProvider mounted/updated`);
    return () => {
      console.log(`[${instanceIdRef.current}] DashboardProvider unmounted`);
    };
  }, [currentTenant?.name]);
  
  // Calculate derived metrics
  const totalCustomers = deliveryStatus
    ? deliveryStatus.pending + deliveryStatus.sent + deliveryStatus.declined + deliveryStatus.accepted
    : 0;
    
  const activeOffers = offersMetrics?.approved || 0;
  
  const activeCampaigns = campaignsMetrics?.active || 0;
  
  const campaignEngagement = deliveryStatus && (deliveryStatus.sent + deliveryStatus.accepted) > 0
    ? Math.round((deliveryStatus.accepted / (deliveryStatus.sent + deliveryStatus.accepted)) * 100)
    : 0;
  
  // Provide a refresh method for manual data refresh that clears the cache
  const refreshData = async () => {
    // Clear cache on manual refresh
    console.log(`[${instanceIdRef.current}] Manual refresh, clearing cache`);
    apiCacheRef.current = {};
    await fetchData();
  };
  
  const value = {
    deliveryStatus,
    offersMetrics,
    campaignsMetrics,
    campaignCustomers,
    customerSegments,
    loading,
    error,
    totalCustomers,
    activeOffers,
    activeCampaigns,
    campaignEngagement,
    refreshData
  };
  
  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboardData() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboardData must be used within a DashboardProvider');
  }
  return context;
} 