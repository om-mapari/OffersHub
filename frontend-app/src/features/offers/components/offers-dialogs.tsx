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
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Check, Clock, X } from 'lucide-react'
import { OfferStatus } from '../data/schema'

// Status badge variants
const statusVariants: Record<OfferStatus, { variant: "default" | "outline" | "secondary" | "destructive" | "success"; icon: any }> = {
  draft: { variant: "secondary", icon: Clock },
  submitted: { variant: "outline", icon: Clock },
  approved: { variant: "success", icon: Check },
  rejected: { variant: "destructive", icon: X },
}

export function OffersDialogs() {
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
  } = useOffers()
  
  const { currentTenant } = useTenant()
  
  // This function would be implemented with actual API calls in a real app
  const handleFormSubmit = (data: any) => {
    console.log('Form submitted:', data)
    // Close all dialogs
    setIsCreateDialogOpen(false)
    setIsEditDialogOpen(false)
    setIsDeleteDialogOpen(false)
    setIsApproveDialogOpen(false)
    setIsRejectDialogOpen(false)
    setIsViewDialogOpen(false)
    setSelectedOffer(null)
  }
  
  return (
    <>
      {/* Create Offer Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Offer</DialogTitle>
            <DialogDescription>
              Create a new offer for {currentTenant?.name || 'your tenant'}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            <OfferForm
              onSubmit={handleFormSubmit}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Edit Offer Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Offer</DialogTitle>
            <DialogDescription>
              Update the offer details.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
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
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Offer Details</DialogTitle>
            <DialogDescription>
              View offer information
            </DialogDescription>
          </DialogHeader>
          
          {selectedOffer && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">Name</h3>
                  <p>{selectedOffer.name}</p>
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
                          {status}
                        </Badge>
                      );
                    })()}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Created At</h3>
                  <p>{format(new Date(selectedOffer.created_at), 'PPP')}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Updated At</h3>
                  <p>{format(new Date(selectedOffer.updated_at), 'PPP')}</p>
                </div>
                {selectedOffer.approved_at && (
                  <div>
                    <h3 className="text-sm font-medium">Approved At</h3>
                    <p>{format(new Date(selectedOffer.approved_at), 'PPP')}</p>
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Offer Attributes</h3>
                <div className="rounded-md border p-4 space-y-2">
                  {Object.entries(selectedOffer.data).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="font-medium capitalize">{key.replace('_', ' ')}:</span>
                      <span>{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsViewDialogOpen(false)}
                >
                  Close
                </Button>
              </DialogFooter>
            </div>
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
    </>
  )
} 