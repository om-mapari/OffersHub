import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { OfferForm } from './offer-form'
import { useOffers } from '../context/offers-context'
import { useTenant } from '@/context/TenantContext'
import { useAuth } from '@/context/AuthContext'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Check, Clock, X, FileText } from 'lucide-react'
import { OfferStatus } from '../data/schema'
import { buildTenantApiUrl } from "@/config/api";

// Define permissions interface
export interface OffersDialogPermissions {
  canApproveReject: boolean;
  canSubmit: boolean;
  canCreate: boolean;
  canDelete: boolean;
  canComment: boolean;
  canUpdateDraft: boolean;
  canUpdateAdmin: boolean;
}

// Status badge variants
const statusVariants: Record<OfferStatus, { variant: "default" | "outline" | "secondary" | "destructive" | "success"; icon: any }> = {
  draft: { variant: "secondary", icon: Clock },
  pending_review: { variant: "outline", icon: Clock },
  approved: { variant: "success", icon: Check },
  rejected: { variant: "destructive", icon: X },
  retired: { variant: "default", icon: FileText },
}

interface OffersDialogsProps {
  permissions?: OffersDialogPermissions;
  onActionComplete?: () => void;
}

export function OffersDialogs({ 
  permissions = {
    canApproveReject: false,
    canSubmit: false,
    canCreate: false,
    canDelete: false,
    canComment: false,
    canUpdateDraft: false,
    canUpdateAdmin: false
  },
  onActionComplete
}: OffersDialogsProps) {
  const {
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
  } = useOffers()
  
  const { currentTenant } = useTenant()
  const { token, user } = useAuth()
  
  // Check if user can edit the current offer
  const canEditOffer = () => {
    if (!selectedOffer) return false;
    
    // Super admin or admin can edit any offer
    if (user?.isSuperAdmin || permissions.canUpdateAdmin) return true;
    
    // Creator can edit draft offers
    if (permissions.canUpdateDraft && selectedOffer.status === 'draft') return true;
    
    return false;
  }
  
  // Check if user can approve/reject the current offer
  const canApproveRejectOffer = () => {
    if (!selectedOffer) return false;
    
    // Only pending_review offers can be approved/rejected
    if (selectedOffer.status !== 'pending_review') return false;
    
    // Super admin can approve/reject any offer
    if (user?.isSuperAdmin) return true;
    
    return permissions.canApproveReject;
  }
  
  // Check if user can retire the current offer
  const canRetireOffer = () => {
    if (!selectedOffer) return false;
    
    // Super admin or admin can retire offers
    if (!(user?.isSuperAdmin || permissions.canUpdateAdmin)) return false;
    
    // Can retire draft or approved offers
    return selectedOffer.status === 'draft' || selectedOffer.status === 'approved';
  }
  
  // This function would be implemented with actual API calls in a real app
  const handleFormSubmit = (data: any) => {
    console.log('Form submitted:', data);
    console.log(currentTenant)
    if (currentTenant && token) {
      // Format the data for API submission
      let payload: any = {
        offer_description: data.offer_description,
        offer_type: data.offer_type,
        data: data.data,
        comments: data.comments || null
      };
      console.log(payload)
      
      // Determine the appropriate API call based on the dialog type
      let apiUrl = '';
      let method = 'POST';
      
      if (isCreateDialogOpen) {
        apiUrl = buildTenantApiUrl(currentTenant.name, '/offers/');
        method = 'POST';
      } else if (isEditDialogOpen && selectedOffer) {
        apiUrl = buildTenantApiUrl(currentTenant.name, `/offers/${selectedOffer.id}`);
        method = 'PATCH';
      } else if (isApproveDialogOpen && selectedOffer) {
        apiUrl = buildTenantApiUrl(currentTenant.name, `/offers/${selectedOffer.id}/approve`);
        method = 'POST';
        payload = {}; // Empty payload for approve endpoint
      } else if (isRejectDialogOpen && selectedOffer) {
        apiUrl = buildTenantApiUrl(currentTenant.name, `/offers/${selectedOffer.id}/reject`);
        method = 'POST';
        payload = {}; // Empty payload for reject endpoint
      } else if (isRetireDialogOpen && selectedOffer) {
        // Use PATCH to update status to retired
        apiUrl = buildTenantApiUrl(currentTenant.name, `/offers/${selectedOffer.id}`);
        method = 'PATCH';
        payload = {
          status: 'retired'
        };
      } else if (isDeleteDialogOpen && selectedOffer) {
        apiUrl = buildTenantApiUrl(currentTenant.name, `/offers/${selectedOffer.id}`);
        method = 'DELETE';
      } else if (data.action === 'submit' && data.id) {
        // Handle Submit for Review action
        apiUrl = buildTenantApiUrl(currentTenant.name, `/offers/${data.id}/submit`);
        method = 'POST';
        payload = {}; // Empty payload for submit endpoint
      } else if (data.action === 'revise' && data.id) {
        // Use PATCH to update status back to draft for revision
        apiUrl = buildTenantApiUrl(currentTenant.name, `/offers/${data.id}`);
        method = 'PATCH';
        payload = {
          status: 'draft'
        };
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
            console.log('API call successful');
            // Trigger a refresh of the offers list
            if (onActionComplete) {
              onActionComplete();
            }
          } else {
            console.error('API call failed:', response.statusText);
          }
        })
        .catch(error => {
          console.error('Error making API call:', error);
        });
      }
    }
    
    // Close all dialogs
    setIsCreateDialogOpen(false);
    setIsEditDialogOpen(false);
    setIsDeleteDialogOpen(false);
    setIsApproveDialogOpen(false);
    setIsRejectDialogOpen(false);
    setIsRetireDialogOpen(false);
    setIsViewDialogOpen(false);
    setSelectedOffer(null);
  }
  
  return (
    <>
      {/* Create Offer Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">         
          <div className="mt-4 pr-4">
            <OfferForm
              onSubmit={handleFormSubmit}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Edit Offer Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Offer</DialogTitle>
            <DialogDescription>
              Update the offer details.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 pr-4">
            {selectedOffer && (
              <OfferForm
                offer={selectedOffer}
                onSubmit={handleFormSubmit}
                onCancel={() => setIsEditDialogOpen(false)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* View Offer Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Offer Details</DialogTitle>
            <DialogDescription>
              View offer information
            </DialogDescription>
          </DialogHeader>
          
          {selectedOffer && (
            <>
              <div className="space-y-4 pr-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium">Description</h3>
                    <p>{selectedOffer.offer_description}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Type</h3>
                    <p>{selectedOffer.offer_type}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Status</h3>
                    <div className="mt-1">
                      {(() => {
                        const status = selectedOffer.status;
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
                    <p>{selectedOffer.created_by_username}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Created At</h3>
                    <p>{format(new Date(selectedOffer.created_at), 'PPP')}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Updated At</h3>
                    <p>{format(new Date(selectedOffer.updated_at), 'PPP')}</p>
                  </div>
                </div>
                
                {selectedOffer.comments && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Comments</h3>
                    <div className="rounded-md border p-4">
                      <p>{selectedOffer.comments}</p>
                    </div>
                  </div>
                )}
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Offer Attributes</h3>
                  <div className="rounded-md border p-4 space-y-2">
                    {Object.entries(selectedOffer.data).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span>
                        <span>{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            
              <DialogFooter className="mt-6">
                {/* Action buttons based on permissions */}
                <div className="flex gap-2">
                  {canEditOffer() && (
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
                  
                  {permissions.canSubmit && selectedOffer.status === 'draft' && (
                    <Button 
                      onClick={() => handleFormSubmit({ action: 'submit', id: selectedOffer.id })}
                    >
                      Submit for Review
                    </Button>
                  )}
                  
                  {/* Revise and Resubmit button for rejected offers */}
                  {permissions.canSubmit && selectedOffer.status === 'rejected' && (
                    <Button 
                      onClick={() => handleFormSubmit({ action: 'revise', id: selectedOffer.id })}
                      variant="outline"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Revise and Resubmit
                    </Button>
                  )}
                  
                  {/* Retire button for admin users */}
                  {canRetireOffer() && (
                    <Button 
                      variant="outline"
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                      onClick={() => {
                        setIsViewDialogOpen(false);
                        setIsRetireDialogOpen(true);
                      }}
                    >
                      Retire
                    </Button>
                  )}
                  
                  {canApproveRejectOffer() && (
                    <>
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
                      
                      <Button 
                        variant="destructive" 
                        onClick={() => {
                          setIsViewDialogOpen(false);
                          setIsRejectDialogOpen(true);
                        }}
                      >
                        Reject
                      </Button>
                    </>
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
      
      {/* Delete Offer Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Offer</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this offer? This action cannot be undone.
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
      
      {/* Approve Offer Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Offer</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this offer?
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
      
      {/* Reject Offer Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Offer</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this offer?
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsRejectDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => handleFormSubmit({ action: 'reject' })}
            >
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Retire Offer Dialog */}
      <Dialog open={isRetireDialogOpen} onOpenChange={setIsRetireDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Retire Offer</DialogTitle>
            <DialogDescription>
              Are you sure you want to retire this offer? This will mark it as no longer active.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsRetireDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="default" 
              onClick={() => handleFormSubmit({ action: 'retire' })}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Retire
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 