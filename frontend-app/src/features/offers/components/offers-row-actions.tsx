import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Offer, OfferStatus } from '../data/schema'
import { useOffers } from '../context/offers-context'
import { Check, Edit, Eye, MoreHorizontal, Trash, X } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useTenant } from '@/context/TenantContext'

interface OffersRowActionsProps {
  offer: Offer
}

export function OffersRowActions({ offer }: OffersRowActionsProps) {
  const {
    setSelectedOffer,
    setIsViewDialogOpen,
    setIsEditDialogOpen,
    setIsDeleteDialogOpen,
    setIsApproveDialogOpen,
    setIsRejectDialogOpen,
  } = useOffers()
  
  const { hasPermission } = useAuth()
  const { currentTenant } = useTenant()
  
  const canEdit = hasPermission('create', currentTenant?.id) && 
    (offer.status === 'draft' || offer.status === 'rejected')
  
  const canApprove = hasPermission('approver', currentTenant?.id) && 
    offer.status === 'submitted'
  
  const canDelete = hasPermission('admin', currentTenant?.id) && 
    (offer.status === 'draft' || offer.status === 'rejected')

  const handleAction = (
    action: 'view' | 'edit' | 'delete' | 'approve' | 'reject'
  ) => {
    setSelectedOffer(offer)
    
    switch (action) {
      case 'view':
        setIsViewDialogOpen(true)
        break
      case 'edit':
        setIsEditDialogOpen(true)
        break
      case 'delete':
        setIsDeleteDialogOpen(true)
        break
      case 'approve':
        setIsApproveDialogOpen(true)
        break
      case 'reject':
        setIsRejectDialogOpen(true)
        break
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleAction('view')}>
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>
        
        {canEdit && (
          <DropdownMenuItem onClick={() => handleAction('edit')}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
        )}
        
        {canApprove && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleAction('approve')}>
              <Check className="mr-2 h-4 w-4" />
              Approve
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAction('reject')}>
              <X className="mr-2 h-4 w-4" />
              Reject
            </DropdownMenuItem>
          </>
        )}
        
        {canDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleAction('delete')}>
              <Trash className="mr-2 h-4 w-4" />
              Delete
              <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 