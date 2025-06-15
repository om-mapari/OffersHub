import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { NotificationButton } from '@/components/notification-button'
import { columns } from './components/tenants-columns'
import { TenantsDialogs } from './components/tenants-dialogs'
import { TenantsPrimaryButtons } from './components/tenants-primary-buttons'
import { TenantsTable } from './components/tenants-table'
import TenantsProvider, { useTenantsContext } from './context/tenants-context'
import { tenantListSchema } from './data/schema'
import { Loader2, AlertCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

function TenantsContent() {
  const { tenants, isLoading, error } = useTenantsContext()
  const { user } = useAuth()
  
  // Check if user is super admin
  if (!user?.isSuperAdmin) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You must be a Super Admin to access tenant management.
        </AlertDescription>
      </Alert>
    )
  }
  
  // Parse tenant list
  const tenantList = tenants.length > 0 ? tenantListSchema.parse(tenants) : []

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <NotificationButton />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Tenant Management</h2>
            <p className='text-muted-foreground'>
              Create and manage tenants for your platform.
            </p>
          </div>
          <TenantsPrimaryButtons />
        </div>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {isLoading && tenants.length === 0 ? (
          <div className="flex h-[400px] w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
            <TenantsTable data={tenantList} columns={columns} />
          </div>
        )}
        
        <TenantsDialogs />
      </Main>
    </>
  )
}

export default function Tenants() {
  return (
    <TenantsProvider>
      <TenantsContent />
    </TenantsProvider>
  )
} 