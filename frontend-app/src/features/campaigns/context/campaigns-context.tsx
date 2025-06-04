import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { Campaign, CampaignCreate } from '../data/schema';
import { campaignsApi } from '../api/campaigns-api';
import { useTenant } from '@/context/TenantContext';
import { toast } from 'sonner';

interface CampaignsContextType {
  campaigns: Campaign[];
  isLoading: boolean;
  error: Error | null;
  fetchCampaigns: () => Promise<void>;
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

  const fetchCampaigns = useCallback(async () => {
    if (!currentTenant) {
      console.error('No tenant selected');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const data = await campaignsApi.getCampaigns(currentTenant.name);
      setCampaigns(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch campaigns'));
      toast.error('Failed to fetch campaigns', { duration: 10000 });
    } finally {
      setIsLoading(false);
    }
  }, [currentTenant]);

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
    throw new Error('useCampaigns must be used within a CampaignsProvider');
  }
  return context;
} 