import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Campaign, CampaignStatus } from '../data/schema'
import { useCampaigns } from '../context/campaigns-context'
import { Edit, Eye, MoreHorizontal, Trash, Play, Pause, CheckCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useTenant } from '@/context/TenantContext'

interface CampaignsRowActionsProps {
  campaign: Campaign
}

export function CampaignsRowActions({ campaign }: CampaignsRowActionsProps) {
  const {
    setSelectedCampaign,
    setIsViewDialogOpen,
    setIsEditDialogOpen,
    setIsDeleteDialogOpen,
    setIsApproveDialogOpen,
    setIsActivateDialogOpen,
    setIsPauseDialogOpen,
    setIsResumeDialogOpen,
    setIsCompleteDialogOpen
  } = useCampaigns()
  
  const { hasPermission, user } = useAuth()
  const { currentTenant } = useTenant()
  
  // Define permissions based on user role and campaign status
  const canEdit = (user?.isSuperAdmin || hasPermission('create', currentTenant?.name)) && 
    campaign.status === 'draft'
  
  const canApprove = (user?.isSuperAdmin || hasPermission('approver', currentTenant?.name)) && 
    campaign.status === 'draft'
    
  const canActivate = (user?.isSuperAdmin || hasPermission('admin', currentTenant?.name) || hasPermission('create', currentTenant?.name)) && 
    campaign.status === 'approved'
    
  const canPause = (user?.isSuperAdmin || hasPermission('admin', currentTenant?.name) || hasPermission('create', currentTenant?.name)) && 
    campaign.status === 'active'
    
  const canResume = (user?.isSuperAdmin || hasPermission('admin', currentTenant?.name) || hasPermission('create', currentTenant?.name)) && 
    campaign.status === 'paused'
    
  const canComplete = (user?.isSuperAdmin || hasPermission('admin', currentTenant?.name) || hasPermission('create', currentTenant?.name)) && 
    (campaign.status === 'active' || campaign.status === 'paused')
    
  const canDelete = (user?.isSuperAdmin || hasPermission('admin', currentTenant?.name)) && 
    campaign.status === 'draft'

  const handleAction = (
    action: 'view' | 'edit' | 'delete' | 'approve' | 'activate' | 'pause' | 'resume' | 'complete'
  ) => {
    setSelectedCampaign(campaign)
    
    // Open appropriate dialog based on action
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
      case 'activate':
        setIsActivateDialogOpen(true)
        break
      case 'pause':
        setIsPauseDialogOpen(true)
        break
      case 'resume':
        setIsResumeDialogOpen(true)
        break
      case 'complete':
        setIsCompleteDialogOpen(true)
        break
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
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
          <DropdownMenuItem onClick={() => handleAction('approve')}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Approve
          </DropdownMenuItem>
        )}
        
        {canActivate && (
          <DropdownMenuItem onClick={() => handleAction('activate')}>
            <Play className="mr-2 h-4 w-4" />
            Activate
          </DropdownMenuItem>
        )}
        
        {canPause && (
          <DropdownMenuItem onClick={() => handleAction('pause')}>
            <Pause className="mr-2 h-4 w-4" />
            Pause
          </DropdownMenuItem>
        )}
        
        {canResume && (
          <DropdownMenuItem onClick={() => handleAction('resume')}>
            <Play className="mr-2 h-4 w-4" />
            Resume
          </DropdownMenuItem>
        )}
        
        {canComplete && (
          <DropdownMenuItem onClick={() => handleAction('complete')}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Complete
          </DropdownMenuItem>
        )}
        
        {canDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleAction('delete')} className="text-red-600">
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 