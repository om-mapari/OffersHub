import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect, useRef } from 'react';
import { Campaign, CampaignCreate } from '../data/schema';
import { campaignsApi, clearCampaignsCache } from '../api/campaigns-api';
import { useTenant } from '@/context/TenantContext';
import { toast } from 'sonner';

// We don't need this anymore as caching is handled in the API layer
// const ongoingRequests = new Map<string, Promise<any>>();

interface CampaignsContextType {
  campaigns: Campaign[];
  isLoading: boolean;
  error: Error | null;
  fetchCampaigns: () => Promise<void>;
  refreshCampaigns: () => Promise<void>;
  createCampaign: (campaignData: CampaignCreate) => Promise<Campaign | null>;
  selectedCampaign: Campaign | null;
  setSelectedCampaign: (campaign: Campaign | null) => void;
  isCreateDialogOpen: boolean;
  setIsCreateDialogOpen: (isOpen: boolean) => void;
  isViewDialogOpen: boolean;
  setIsViewDialogOpen: (isOpen: boolean) => void;
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: (isOpen: boolean) => void;
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (isOpen: boolean) => void;
  isApproveDialogOpen: boolean;
  setIsApproveDialogOpen: (isOpen: boolean) => void;
  isActivateDialogOpen: boolean;
  setIsActivateDialogOpen: (isOpen: boolean) => void;
  isPauseDialogOpen: boolean;
  setIsPauseDialogOpen: (isOpen: boolean) => void;
  isResumeDialogOpen: boolean;
  setIsResumeDialogOpen: (isOpen: boolean) => void;
  isCompleteDialogOpen: boolean;
  setIsCompleteDialogOpen: (isOpen: boolean) => void;
}

// Create a fallback context with no-op functions
const createFallbackContext = (): CampaignsContextType => ({
  campaigns: [],
  isLoading: false,
  error: null,
  fetchCampaigns: async () => {
    console.error('CampaignsProvider not available - cannot fetch campaigns');
  },
  refreshCampaigns: async () => {
    console.error('CampaignsProvider not available - cannot refresh campaigns');
  },
  createCampaign: async () => {
    console.error('CampaignsProvider not available - cannot create campaign');
    return null;
  },
  selectedCampaign: null,
  setSelectedCampaign: () => {
    console.error('CampaignsProvider not available - cannot set selected campaign');
  },
  isCreateDialogOpen: false,
  setIsCreateDialogOpen: () => {
    console.error('CampaignsProvider not available - cannot open dialog');
  },
  isViewDialogOpen: false,
  setIsViewDialogOpen: () => {
    console.error('CampaignsProvider not available - cannot open dialog');
  },
  isEditDialogOpen: false,
  setIsEditDialogOpen: () => {
    console.error('CampaignsProvider not available - cannot open dialog');
  },
  isDeleteDialogOpen: false,
  setIsDeleteDialogOpen: () => {
    console.error('CampaignsProvider not available - cannot open dialog');
  },
  isApproveDialogOpen: false,
  setIsApproveDialogOpen: () => {
    console.error('CampaignsProvider not available - cannot open dialog');
  },
  isActivateDialogOpen: false,
  setIsActivateDialogOpen: () => {
    console.error('CampaignsProvider not available - cannot open dialog');
  },
  isPauseDialogOpen: false,
  setIsPauseDialogOpen: () => {
    console.error('CampaignsProvider not available - cannot open dialog');
  },
  isResumeDialogOpen: false,
  setIsResumeDialogOpen: () => {
    console.error('CampaignsProvider not available - cannot open dialog');
  },
  isCompleteDialogOpen: false,
  setIsCompleteDialogOpen: () => {
    console.error('CampaignsProvider not available - cannot open dialog');
  },
});

const CampaignsContext = createContext<CampaignsContextType | undefined>(undefined);

export function CampaignsProvider({ children }: { children: ReactNode }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState<boolean>(false);
  const [isActivateDialogOpen, setIsActivateDialogOpen] = useState<boolean>(false);
  const [isPauseDialogOpen, setIsPauseDialogOpen] = useState<boolean>(false);
  const [isResumeDialogOpen, setIsResumeDialogOpen] = useState<boolean>(false);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState<boolean>(false);
  
  const { currentTenant } = useTenant();
  // We still need this ref to prevent state updates during fetch
  const isFetchingRef = useRef<boolean>(false);

  const fetchCampaigns = useCallback(async () => {
    if (!currentTenant) {
      console.error('No tenant selected');
      return;
    }

    // Check if we're already fetching in this component
    if (isFetchingRef.current) {
      console.log('Component fetch already in progress, skipping duplicate request');
      return;
    }

    setIsLoading(true);
    setError(null);
    isFetchingRef.current = true;
    
    try {
      // The API layer now handles caching
      const data = await campaignsApi.getCampaigns(currentTenant.name);
      setCampaigns(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch campaigns'));
      toast.error('Failed to fetch campaigns', { duration: 10000 });
      throw err;
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [currentTenant]);

  // Refresh campaigns by clearing cache and fetching again
  const refreshCampaigns = useCallback(async () => {
    if (!currentTenant) {
      console.error('No tenant selected');
      return;
    }
    
    // Clear the cache first
    clearCampaignsCache(currentTenant.name);
    
    // Then fetch campaigns
    return fetchCampaigns();
  }, [currentTenant, fetchCampaigns]);

  // Only fetch campaigns when the tenant changes
  useEffect(() => {
    if (currentTenant) {
      fetchCampaigns();
    }
  }, [currentTenant, fetchCampaigns]);

  const createCampaign = async (campaignData: CampaignCreate) => {
    if (!currentTenant) {
      console.error('No tenant selected');
      toast.error('No tenant selected', { duration: 10000 });
      return null;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const newCampaign = await campaignsApi.createCampaign(currentTenant.name, campaignData);
      setCampaigns(prev => [...prev, newCampaign]);
      toast.success('Campaign created successfully', { duration: 10000 });
      return newCampaign;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create campaign'));
      toast.error('Failed to create campaign', { duration: 10000 });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CampaignsContext.Provider
      value={{
        campaigns,
        isLoading,
        error,
        fetchCampaigns,
        refreshCampaigns,
        createCampaign,
        selectedCampaign,
        setSelectedCampaign,
        isCreateDialogOpen,
        setIsCreateDialogOpen,
        isViewDialogOpen,
        setIsViewDialogOpen,
        isEditDialogOpen,
        setIsEditDialogOpen,
        isDeleteDialogOpen,
        setIsDeleteDialogOpen,
        isApproveDialogOpen,
        setIsApproveDialogOpen,
        isActivateDialogOpen,
        setIsActivateDialogOpen,
        isPauseDialogOpen,
        setIsPauseDialogOpen,
        isResumeDialogOpen,
        setIsResumeDialogOpen,
        isCompleteDialogOpen,
        setIsCompleteDialogOpen,
      }}
    >
      {children}
    </CampaignsContext.Provider>
  );
}

export function useCampaigns() {
  const context = useContext(CampaignsContext);
  if (context === undefined) {
    console.warn('useCampaigns must be used within a CampaignsProvider. Using fallback context.');
    return createFallbackContext();
  }
  return context;
} 