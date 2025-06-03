import { useEffect } from 'react'
import { CampaignsProvider, useCampaigns } from './context/campaigns-context'
import { CampaignsTable } from './components/campaigns-table'
import { columns } from './components/campaigns-columns'
import { useAuth } from '@/context/AuthContext'
import { useTenant } from '@/context/TenantContext'
import { CreateCampaignDialog } from './components/create-campaign-dialog'
import { CampaignEditDialog } from './components/campaign-edit-dialog'
import { CampaignsDialogs } from './components/campaigns-dialogs'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Button } from '@/components/ui/button'
import { Plus, Loader2, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'

function CampaignsContent() {
  const { campaigns, isLoading, setIsCreateDialogOpen, fetchCampaigns } = useCampaigns()
  const { hasPermission, user } = useAuth()
  const { currentTenant } = useTenant()

  // Check permissions
  const canManageCampaigns = !!user?.isSuperAdmin || 
    !!(currentTenant && hasPermission('admin', currentTenant.name)) || 
    !!(currentTenant && hasPermission('create', currentTenant.name))
    
  const canReadCampaigns = !!user?.isSuperAdmin || 
    !!(currentTenant && (
      hasPermission('admin', currentTenant.name) || 
      hasPermission('create', currentTenant.name) || 
      hasPermission('approver', currentTenant.name) || 
      hasPermission('read_only', currentTenant.name)
    ))

  const canApprove = !!user?.isSuperAdmin || 
    !!(currentTenant && hasPermission('approver', currentTenant.name))
    
  const canActivate = !!user?.isSuperAdmin || 
    !!(currentTenant && (
      hasPermission('admin', currentTenant.name) || 
      hasPermission('create', currentTenant.name)
    ))
    
  const canPause = canActivate
  const canResume = canActivate
  const canComplete = canActivate
  
  const canEdit = !!user?.isSuperAdmin || 
    !!(currentTenant && hasPermission('create', currentTenant.name))
    
  const canDelete = !!user?.isSuperAdmin || 
    !!(currentTenant && hasPermission('admin', currentTenant.name))

  const userRole = currentTenant ? 
    (user?.isSuperAdmin ? 'Super Admin' : 
    hasPermission('admin', currentTenant.name) ? 'Admin' : 
    hasPermission('create', currentTenant.name) ? 'Create' : 
    hasPermission('approver', currentTenant.name) ? 'Approver' : 
    hasPermission('read_only', currentTenant.name) ? 'Read Only' : 'None') : 'None';

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Campaigns</h2>
            <p className='text-muted-foreground'>
              {currentTenant 
                ? `Manage campaigns for ${currentTenant.name}`
                : "Select a tenant to manage campaigns"}
            </p>
            <div className="mt-2 flex items-center">
              <span className="text-sm font-medium mr-2">Your role:</span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                userRole === 'Super Admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' :
                userRole === 'Admin' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                userRole === 'Create' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                userRole === 'Approver' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300' :
                'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
              }`}>
                {userRole}
              </span>
            </div>
          </div>
          {canManageCampaigns && (
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> New Campaign
            </Button>
          )}
        </div>

        <div className="mb-4">
          <Input 
            placeholder="Filter campaigns..." 
            className="max-w-sm"
          />
        </div>

        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          {isLoading ? (
            <div className="flex h-[300px] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading campaigns...</span>
            </div>
          ) : (
            <CampaignsTable
              columns={columns}
              data={campaigns}
              permissions={{
                canManage: canManageCampaigns,
                canRead: canReadCampaigns
              }}
            />
          )}
        </div>
      </Main>
      
      <CreateCampaignDialog />
      <CampaignEditDialog />
      <CampaignsDialogs 
        permissions={{
          canApprove,
          canActivate,
          canPause,
          canResume,
          canComplete,
          canDelete,
          canEdit
        }}
        onActionComplete={fetchCampaigns}
      />
    </>
  )
}

export default function Campaigns() {
  return (
    <CampaignsProvider>
      <CampaignsContent />
    </CampaignsProvider>
  )
} 