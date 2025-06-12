import { createContext, useContext, useState, ReactNode, useEffect, useCallback, useRef } from 'react'
import { Offer, offerListSchema } from '../data/schema'
import { useTenant } from '@/context/TenantContext'
import { useAuth } from '@/context/AuthContext'
import { buildUserApiUrl, buildTenantApiUrl } from "@/config/api";
import { getUserTenants } from '@/features/auth/api'

// Define cache interface for API responses
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// Define permissions for different offer operations
const PERMISSIONS = {
  CREATE: ["admin", "create"],
  READ: ["admin", "create", "approver", "read_only"],
  UPDATE_DRAFT: ["admin", "create"],
  UPDATE_ADMIN: ["admin"],
  DELETE: ["admin"],
  SUBMIT: ["admin", "create"],
  APPROVE_REJECT: ["admin", "approver"],
  COMMENT: ["admin", "create", "approver"]
};

interface OffersContextType {
  selectedOffer: Offer | null
  setSelectedOffer: (offer: Offer | null) => void
  isCreateDialogOpen: boolean
  setIsCreateDialogOpen: (open: boolean) => void
  isEditDialogOpen: boolean
  setIsEditDialogOpen: (open: boolean) => void
  isDeleteDialogOpen: boolean
  setIsDeleteDialogOpen: (open: boolean) => void
  isViewDialogOpen: boolean
  setIsViewDialogOpen: (open: boolean) => void
  isApproveDialogOpen: boolean
  setIsApproveDialogOpen: (open: boolean) => void
  isRejectDialogOpen: boolean
  setIsRejectDialogOpen: (open: boolean) => void
  isRetireDialogOpen: boolean
  setIsRetireDialogOpen: (open: boolean) => void
  // Data related fields
  offers: Offer[]
  rawOffers: any[]
  isLoading: boolean
  error: string | null
  refreshOffers: () => Promise<void>
  userRoles: string[]
  hasActionPermission: (action: keyof typeof PERMISSIONS) => boolean
  primaryRole: string
}

const OffersContext = createContext<OffersContextType | undefined>(undefined)

export function useOffers() {
  const context = useContext(OffersContext)
  if (!context) {
    throw new Error('useOffers must be used within an OffersProvider')
  }
  return context
}

interface OffersProviderProps {
  children: ReactNode
}

export default function OffersProvider({ children }: OffersProviderProps) {
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [isRetireDialogOpen, setIsRetireDialogOpen] = useState(false)
  
  // Selected offer
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null)

  // Data state
  const [rawOffers, setRawOffers] = useState<any[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);

  // Tenant and auth context
  const { currentTenant } = useTenant();
  const { user, token } = useAuth();

  // Cache for API responses to prevent duplicate calls
  const apiCacheRef = useRef<Record<string, CacheEntry<any>>>({});
  const instanceIdRef = useRef(`offers-${Math.random().toString(36).substring(2, 9)}`);
  
  // Cache expiration time in milliseconds (5 minutes)
  const CACHE_EXPIRATION = 5 * 60 * 1000;

  // Log cache state for debugging
  const logCacheState = () => {
    const cache = apiCacheRef.current;
    console.log(`[${instanceIdRef.current}] Cache state:`, Object.keys(cache).map(key => ({
      key,
      age: Math.round((Date.now() - cache[key].timestamp) / 1000) + 's ago'
    })));
  };

  // Fetch with cache helper
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

  // Fetch user roles for the current tenant
  const fetchUserRoles = useCallback(async () => {
    if (!currentTenant || !token) return;
    
    try {
      // Use the cached auth API to prevent duplicate calls
      const tenants = await getUserTenants(token);
      
      // Find the current tenant's roles
      const tenantInfo = tenants.find(t => t.tenant_name === currentTenant.name);
      if (tenantInfo) {
        setUserRoles(tenantInfo.roles || []);
      } else {
        setUserRoles([]);
      }
    } catch (err) {
      console.error('Error fetching user roles:', err);
      setUserRoles([]);
    }
  }, [currentTenant, token]);

  // Function to fetch offers data
  const fetchOffers = useCallback(async () => {
    if (!currentTenant || !token) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Use cache for offers data
      const cacheKey = `offers-${currentTenant.name}`;
      const data = await fetchWithCache<any[]>(cacheKey, async () => {
        const response = await fetch(
          buildTenantApiUrl(currentTenant.name, '/offers/?skip=0&limit=100'), 
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        if (!response.ok) {
          throw new Error(`Failed to fetch offers: ${await response.text()}`);
        }
        
        return response.json();
      });
      
      console.log('Fetched offers:', data);
      setRawOffers(data);
      
      // Parse offer list
      try {
        if (data.length > 0) {
          const parsed = offerListSchema.parse(data);
          setOffers(parsed);
        } else {
          setOffers([]);
        }
      } catch (parseError) {
        console.error('Error parsing offers:', parseError);
        setError('Error processing offer data.');
      }
    } catch (error) {
      console.error('Error fetching offers:', error);
      setError('An error occurred while fetching offers.');
    } finally {
      setIsLoading(false);
    }
  }, [currentTenant, token]);

  // Function to refresh offers data (clears cache)
  const refreshOffers = useCallback(async () => {
    if (!currentTenant) return;
    
    // Clear cache for this tenant's offers
    const cacheKey = `offers-${currentTenant.name}`;
    if (apiCacheRef.current[cacheKey]) {
      delete apiCacheRef.current[cacheKey];
      console.log(`[${instanceIdRef.current}] 🧹 Cleared cache for ${cacheKey}`);
    }
    
    // Fetch fresh data
    await fetchOffers();
  }, [currentTenant, fetchOffers]);

  // Fetch offers when tenant changes
  useEffect(() => {
    if (currentTenant) {
      console.log(`[${instanceIdRef.current}] Tenant changed to ${currentTenant.name}, fetching data`);
      fetchUserRoles();
      fetchOffers();
    }
  }, [currentTenant, fetchUserRoles, fetchOffers]);

  // Check if user has permission for a specific action
  const hasActionPermission = useCallback((action: keyof typeof PERMISSIONS) => {
    if (!currentTenant) return false;
    return PERMISSIONS[action].some(role => userRoles.includes(role));
  }, [currentTenant, userRoles]);

  // Get the highest priority role for display
  const getPrimaryUserRole = useCallback(() => {
    if (!currentTenant) return 'None';
    if (user?.isSuperAdmin) return 'Super Admin';
    
    // Priority order: Admin > Create > Approver > Read Only
    if (userRoles.includes('admin')) return 'Admin';
    if (userRoles.includes('create')) return 'Create';
    if (userRoles.includes('approver')) return 'Approver';
    if (userRoles.includes('read_only')) return 'Read Only';
    
    return 'None';
  }, [currentTenant, user, userRoles]);

  const primaryRole = getPrimaryUserRole();

  return (
    <OffersContext.Provider
      value={{
        selectedOffer,
        setSelectedOffer,
        isCreateDialogOpen,
        setIsCreateDialogOpen,
        isEditDialogOpen,
        setIsEditDialogOpen,
        isDeleteDialogOpen,
        setIsDeleteDialogOpen,
        isViewDialogOpen,
        setIsViewDialogOpen,
        isApproveDialogOpen,
        setIsApproveDialogOpen,
        isRejectDialogOpen,
        setIsRejectDialogOpen,
        isRetireDialogOpen,
        setIsRetireDialogOpen,
        offers,
        rawOffers,
        isLoading,
        error,
        refreshOffers,
        userRoles,
        hasActionPermission,
        primaryRole
      }}
    >
      {children}
    </OffersContext.Provider>
  )
} 