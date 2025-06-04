import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useCampaigns } from '../context/campaigns-context'
import { useTenant } from '@/context/TenantContext'
import { useAuth } from '@/context/AuthContext'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Check, Clock, X, FileText, Pause, Play, ExternalLink, Loader2 } from 'lucide-react'
import { CampaignStatus } from '../data/schema'
import { toast } from 'sonner'
import { useState, useEffect } from 'react'
import { Offer } from '@/features/offers/data/schema'

// Define permissions interface
export interface CampaignsDialogPermissions {
  canApprove: boolean;
  canActivate: boolean;
  canPause: boolean;
  canResume: boolean;
  canComplete: boolean;
  canDelete: boolean;
  canEdit: boolean;
}

// Status badge variants
const statusVariants: Record<CampaignStatus, { variant: "default" | "outline" | "secondary" | "destructive" | "success"; icon: any }> = {
  draft: { variant: "secondary", icon: Clock },
  approved: { variant: "success", icon: Check },
  active: { variant: "success", icon: Play },
  paused: { variant: "outline", icon: Pause },
  completed: { variant: "default", icon: FileText },
}

interface CampaignsDialogsProps {
  permissions?: CampaignsDialogPermissions;
  onActionComplete?: () => void;
}

export function CampaignsDialogs({ 
  permissions = {
    canApprove: false,
    canActivate: false,
    canPause: false,
    canResume: false,
    canComplete: false,
    canDelete: false,
    canEdit: false
  },
  onActionComplete
}: CampaignsDialogsProps) {
  const {
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
    setIsCompleteDialogOpen
  } = useCampaigns()
  
  const { currentTenant } = useTenant()
  const { token, user } = useAuth()
  
  // State for offer details
  const [offerDetails, setOfferDetails] = useState<Offer | null>(null)
  const [isLoadingOffer, setIsLoadingOffer] = useState<boolean>(false)
  const [offerError, setOfferError] = useState<string | null>(null)
  
  // State for offer details dialog
  const [isOfferDetailsDialogOpen, setIsOfferDetailsDialogOpen] = useState<boolean>(false)
  
  // Fetch offer details when a campaign is selected for viewing
  useEffect(() => {
    if (isViewDialogOpen && selectedCampaign && currentTenant && token) {
      setIsLoadingOffer(true)
      setOfferError(null)
      
      fetch(
        `http://localhost:8000/api/v1/tenants/${currentTenant.name}/offers/${selectedCampaign.offer_id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )
      .then(response => {
        if (response.ok) {
          return response.json()
        } else {
          if (response.status === 404) {
            throw new Error(`Offer not found. It may have been deleted or moved.`)
          } else {
            throw new Error(`Failed to fetch offer details: ${response.statusText}`)
          }
        }
      })
      .then(data => {
        setOfferDetails(data)
      })
      .catch(error => {
        console.error('Error fetching offer details:', error)
        setOfferError(error.message || 'Failed to load offer details')
        // Only show toast for unexpected errors, not for "not found" which is handled in the UI
        if (!error.message.includes('not found')) {
          toast.error('Failed to load offer details')
        }
      })
      .finally(() => {
        setIsLoadingOffer(false)
      })
    } else if (!isViewDialogOpen) {
      // Clear offer details when dialog is closed
      setOfferDetails(null)
    }
  }, [isViewDialogOpen, selectedCampaign, currentTenant, token])
  
  // Check if user can perform specific actions on the current campaign
  const canApproveCampaign = () => {
    if (!selectedCampaign) return false;
    
    // Only draft campaigns can be approved
    if (selectedCampaign.status !== 'draft') return false;
    
    // Super admin can approve any campaign
    if (user?.isSuperAdmin) return true;
    
    return permissions.canApprove;
  }
  
  const canActivateCampaign = () => {
    if (!selectedCampaign) return false;
    
    // Only approved campaigns can be activated
    if (selectedCampaign.status !== 'approved') return false;
    
    // Super admin or admin/create roles can activate
    if (user?.isSuperAdmin) return true;
    
    return permissions.canActivate;
  }
  
  const canPauseCampaign = () => {
    if (!selectedCampaign) return false;
    
    // Only active campaigns can be paused
    if (selectedCampaign.status !== 'active') return false;
    
    // Super admin or admin/create roles can pause
    if (user?.isSuperAdmin) return true;
    
    return permissions.canPause;
  }
  
  const canResumeCampaign = () => {
    if (!selectedCampaign) return false;
    
    // Only paused campaigns can be resumed
    if (selectedCampaign.status !== 'paused') return false;
    
    // Super admin or admin/create roles can resume
    if (user?.isSuperAdmin) return true;
    
    return permissions.canResume;
  }
  
  const canCompleteCampaign = () => {
    if (!selectedCampaign) return false;
    
    // Only active or paused campaigns can be completed
    if (selectedCampaign.status !== 'active' && selectedCampaign.status !== 'paused') return false;
    
    // Super admin or admin/create roles can complete
    if (user?.isSuperAdmin) return true;
    
    return permissions.canComplete;
  }
  
  const canEditCampaign = () => {
    if (!selectedCampaign) return false;
    
    // Only draft campaigns can be edited
    if (selectedCampaign.status !== 'draft') return false;
    
    // Super admin can edit any campaign
    if (user?.isSuperAdmin) return true;
    
    return permissions.canEdit;
  }
  
  const canDeleteCampaign = () => {
    if (!selectedCampaign) return false;
    
    // Only draft campaigns can be deleted
    if (selectedCampaign.status !== 'draft') return false;
    
    // Super admin can delete any campaign
    if (user?.isSuperAdmin) return true;
    
    return permissions.canDelete;
  }
  
  // This function would be implemented with actual API calls in a real app
  const handleFormSubmit = (data: any) => {
    if (currentTenant && token) {
      // Format the data for API submission
      let payload: any = {};
      
      // Determine the appropriate API call based on the dialog type
      let apiUrl = '';
      let method = 'POST';
      
      if (isApproveDialogOpen && selectedCampaign) {
        apiUrl = `http://localhost:8000/api/v1/tenants/${currentTenant.name}/campaigns/${selectedCampaign.id}`;
        method = 'PATCH';
        payload = { status: 'approved' };
      } else if (isActivateDialogOpen && selectedCampaign) {
        apiUrl = `http://localhost:8000/api/v1/tenants/${currentTenant.name}/campaigns/${selectedCampaign.id}`;
        method = 'PATCH';
        payload = { status: 'active' };
      } else if (isPauseDialogOpen && selectedCampaign) {
        apiUrl = `http://localhost:8000/api/v1/tenants/${currentTenant.name}/campaigns/${selectedCampaign.id}`;
        method = 'PATCH';
        payload = { status: 'paused' };
      } else if (isResumeDialogOpen && selectedCampaign) {
        apiUrl = `http://localhost:8000/api/v1/tenants/${currentTenant.name}/campaigns/${selectedCampaign.id}`;
        method = 'PATCH';
        payload = { status: 'active' }; // Resume is same as activate
      } else if (isCompleteDialogOpen && selectedCampaign) {
        apiUrl = `http://localhost:8000/api/v1/tenants/${currentTenant.name}/campaigns/${selectedCampaign.id}`;
        method = 'PATCH';
        payload = { status: 'completed' };
      } else if (isDeleteDialogOpen && selectedCampaign) {
        apiUrl = `http://localhost:8000/api/v1/tenants/${currentTenant.name}/campaigns/${selectedCampaign.id}`;
        method = 'DELETE';
      }
      
      if (apiUrl) {
        fetch(apiUrl, {
          method: method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: method !== 'DELETE' ? JSON.stringify(payload) : undefined
        })
        .then(response => {
          if (response.ok) {
            toast.success(`Campaign ${data.action || 'updated'} successfully`);
            // Trigger a refresh of the campaigns list
            if (onActionComplete) {
              onActionComplete();
            }
          } else {
            toast.error(`Failed to ${data.action || 'update'} campaign`);
            console.error('API call failed:', response.statusText);
          }
        })
        .catch(error => {
          toast.error(`Error: ${error.message}`);
          console.error('Error making API call:', error);
        });
      }
    }
    
    // Close all dialogs
    setIsViewDialogOpen(false);
    setIsEditDialogOpen(false);
    setIsDeleteDialogOpen(false);
    setIsApproveDialogOpen(false);
    setIsActivateDialogOpen(false);
    setIsPauseDialogOpen(false);
    setIsResumeDialogOpen(false);
    setIsCompleteDialogOpen(false);
    setSelectedCampaign(null);
  }
  
  return (
    <>
      {/* View Campaign Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Campaign Details</DialogTitle>
            <DialogDescription>
              View campaign information
            </DialogDescription>
          </DialogHeader>
          
          {selectedCampaign && (
            <>
              <div className="space-y-4 pr-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium">Name</h3>
                    <p>{selectedCampaign.name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Description</h3>
                    <p>{selectedCampaign.description || 'No description'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Status</h3>
                    <div className="mt-1">
                      {(() => {
                        const status = selectedCampaign.status;
                        const { variant, icon: Icon } = statusVariants[status];
                        return (
                          <Badge variant={variant as any} className="capitalize">
                            <Icon className="mr-1 h-3 w-3" />
                            {status.replace('_', ' ')}
                          </Badge>
                        );
                      })()}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Created By</h3>
                    <p>{selectedCampaign.created_by_username}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Start Date</h3>
                    <p>{format(new Date(selectedCampaign.start_date), 'PPP')}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">End Date</h3>
                    <p>{format(new Date(selectedCampaign.end_date), 'PPP')}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Created At</h3>
                    <p>{format(new Date(selectedCampaign.created_at), 'PPP')}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Offer ID</h3>
                    <p>{selectedCampaign.offer_id}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Selection Criteria</h3>
                  <div className="rounded-md border p-4 space-y-2">
                    {Object.entries(selectedCampaign.selection_criteria).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span>
                        <span>{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Offer Details Section */}
                <div>
                  <h3 className="text-sm font-medium mb-2 flex items-center justify-between">
                    <span className="flex items-center">
                      Linked Offer Details
                      <ExternalLink className="ml-2 h-4 w-4 text-muted-foreground" />
                    </span>
                    {offerDetails && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setIsOfferDetailsDialogOpen(true)}
                        className="text-xs"
                      >
                        View Full Details
                      </Button>
                    )}
                  </h3>
                  <div className="rounded-md border p-4">
                    {isLoadingOffer ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        <span>Loading offer details...</span>
                      </div>
                    ) : offerError ? (
                      <div className="text-red-500">{offerError}</div>
                    ) : offerDetails ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-xs font-medium text-muted-foreground">Description</h4>
                            <p className="text-sm">{offerDetails.offer_description}</p>
                          </div>
                          <div>
                            <h4 className="text-xs font-medium text-muted-foreground">Type</h4>
                            <p className="text-sm">{offerDetails.offer_type}</p>
                          </div>
                          <div>
                            <h4 className="text-xs font-medium text-muted-foreground">Status</h4>
                            <p className="text-sm capitalize">{offerDetails.status.replace('_', ' ')}</p>
                          </div>
                          <div>
                            <h4 className="text-xs font-medium text-muted-foreground">Created By</h4>
                            <p className="text-sm">{offerDetails.created_by_username}</p>
                          </div>
                        </div>
                        
                        {offerDetails.comments && (
                          <div>
                            <h4 className="text-xs font-medium text-muted-foreground mb-1">Comments</h4>
                            <p className="text-sm">{offerDetails.comments}</p>
                          </div>
                        )}
                        
                        <div>
                          <h4 className="text-xs font-medium text-muted-foreground mb-1">Offer Attributes</h4>
                          <div className="rounded-md bg-muted/50 p-2 space-y-1">
                            {Object.entries(offerDetails.data).slice(0, 3).map(([key, value]) => (
                              <div key={key} className="flex justify-between text-xs">
                                <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span>
                                <span>{String(value)}</span>
                              </div>
                            ))}
                            {Object.keys(offerDetails.data).length > 3 && (
                              <div className="text-xs text-center text-muted-foreground">
                                + {Object.keys(offerDetails.data).length - 3} more attributes
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No offer details available</p>
                    )}
                  </div>
                </div>
              </div>
            
              <DialogFooter className="mt-6">
                {/* Action buttons based on permissions */}
                <div className="flex gap-2">
                  {canEditCampaign() && (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsViewDialogOpen(false);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                  )}
                  
                  {canApproveCampaign() && (
                    <Button 
                      variant="outline" 
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => {
                        setIsViewDialogOpen(false);
                        setIsApproveDialogOpen(true);
                      }}
                    >
                      Approve
                    </Button>
                  )}
                  
                  {canActivateCampaign() && (
                    <Button 
                      variant="outline" 
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => {
                        setIsViewDialogOpen(false);
                        setIsActivateDialogOpen(true);
                      }}
                    >
                      Activate
                    </Button>
                  )}
                  
                  {canPauseCampaign() && (
                    <Button 
                      variant="outline" 
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                      onClick={() => {
                        setIsViewDialogOpen(false);
                        setIsPauseDialogOpen(true);
                      }}
                    >
                      Pause
                    </Button>
                  )}
                  
                  {canResumeCampaign() && (
                    <Button 
                      variant="outline" 
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => {
                        setIsViewDialogOpen(false);
                        setIsResumeDialogOpen(true);
                      }}
                    >
                      Resume
                    </Button>
                  )}
                  
                  {canCompleteCampaign() && (
                    <Button 
                      variant="outline" 
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                      onClick={() => {
                        setIsViewDialogOpen(false);
                        setIsCompleteDialogOpen(true);
                      }}
                    >
                      Complete
                    </Button>
                  )}
                  
                  {canDeleteCampaign() && (
                    <Button 
                      variant="destructive" 
                      onClick={() => {
                        setIsViewDialogOpen(false);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      Delete
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    onClick={() => setIsViewDialogOpen(false)}
                  >
                    Close
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Offer Details Dialog */}
      <Dialog open={isOfferDetailsDialogOpen} onOpenChange={setIsOfferDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Offer Details</DialogTitle>
            <DialogDescription>
              Complete information about the linked offer
            </DialogDescription>
          </DialogHeader>
          
          {offerDetails ? (
            <div className="space-y-4 pr-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">Description</h3>
                  <p>{offerDetails.offer_description}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Type</h3>
                  <p>{offerDetails.offer_type}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Status</h3>
                  <p className="capitalize">{offerDetails.status.replace('_', ' ')}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Created By</h3>
                  <p>{offerDetails.created_by_username}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Created At</h3>
                  <p>{format(new Date(offerDetails.created_at), 'PPP')}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Updated At</h3>
                  <p>{format(new Date(offerDetails.updated_at), 'PPP')}</p>
                </div>
              </div>
              
              {offerDetails.comments && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Comments</h3>
                  <div className="rounded-md border p-4">
                    <p>{offerDetails.comments}</p>
                  </div>
                </div>
              )}
              
              <div>
                <h3 className="text-sm font-medium mb-2">Offer Attributes</h3>
                <div className="rounded-md border p-4 space-y-2">
                  {Object.entries(offerDetails.data).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span>
                      <span>{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center text-muted-foreground">
              No offer details available
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsOfferDetailsDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Approve Campaign Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Campaign</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this campaign?
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsApproveDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="default" 
              onClick={() => handleFormSubmit({ action: 'approve' })}
              className="bg-green-600 hover:bg-green-700"
            >
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Activate Campaign Dialog */}
      <Dialog open={isActivateDialogOpen} onOpenChange={setIsActivateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Activate Campaign</DialogTitle>
            <DialogDescription>
              Are you sure you want to activate this campaign?
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsActivateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="default" 
              onClick={() => handleFormSubmit({ action: 'activate' })}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Activate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Pause Campaign Dialog */}
      <Dialog open={isPauseDialogOpen} onOpenChange={setIsPauseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pause Campaign</DialogTitle>
            <DialogDescription>
              Are you sure you want to pause this campaign?
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsPauseDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="default" 
              onClick={() => handleFormSubmit({ action: 'pause' })}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Pause
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Resume Campaign Dialog */}
      <Dialog open={isResumeDialogOpen} onOpenChange={setIsResumeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resume Campaign</DialogTitle>
            <DialogDescription>
              Are you sure you want to resume this campaign?
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsResumeDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="default" 
              onClick={() => handleFormSubmit({ action: 'resume' })}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Resume
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Complete Campaign Dialog */}
      <Dialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Campaign</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark this campaign as completed?
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsCompleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="default" 
              onClick={() => handleFormSubmit({ action: 'complete' })}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Complete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Campaign Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Campaign</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this campaign? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => handleFormSubmit({ action: 'delete' })}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 