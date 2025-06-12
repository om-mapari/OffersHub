import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { NotificationButton } from '@/components/notification-button'
import { columns } from './components/offers-columns'
import { OffersDialogs } from './components/offers-dialogs'
import { OffersPrimaryButtons } from './components/offers-primary-buttons'
import { OffersTable } from './components/offers-table'
import OffersProvider, { useOffers } from './context/offers-context'
import { useTenant } from '@/context/TenantContext'
import { useAuth } from '@/context/AuthContext'
import { Loader2 } from 'lucide-react'
import ChatBot from '../ai-chat'

// Component for the content to avoid provider/consumer in same component
function OffersContent() {
  const { currentTenant } = useTenant();
  const { user } = useAuth();
  const {
    offers,
    isLoading,
    error,
    primaryRole,
    hasActionPermission,
    refreshOffers
  } = useOffers();

  // Check if user can create offers
  const canCreate = hasActionPermission('CREATE');

  // Check if user can approve/reject offers
  const canApproveReject = hasActionPermission('APPROVE_REJECT');

  // Check if user can submit offers
  const canSubmit = hasActionPermission('SUBMIT');

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
            <h2 className='text-2xl font-bold tracking-tight'>Offers</h2>
            <p className='text-muted-foreground'>
              {currentTenant ? (
                <>
                  Manage offers for{' '}
                  <strong className="font-bold text-primary">
                    {currentTenant.name
                      .split('_')
                      .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
                      .join(' ')}
                  </strong>
                </>
              ) : (
                "Select a tenant to manage offers"
              )}
            </p>
            <div className="mt-2 flex items-center">
              <span className="text-sm font-medium mr-2">Your role:</span>
              <span className={`text-xs px-2 py-1 rounded-full ${primaryRole === 'Super Admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' :
                primaryRole === 'Admin' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                  primaryRole === 'Create' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                    primaryRole === 'Approver' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                }`}>
                {primaryRole}
              </span>
            </div>
          </div>
          {canCreate && <OffersPrimaryButtons />}
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          {isLoading ? (
            <div className="flex h-[300px] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading offers...</span>
            </div>
          ) : error ? (
            <div className="flex h-[300px] items-center justify-center">
              <p className="text-red-500">{error}</p>
            </div>
          ) : (
            <OffersTable
              data={offers}
              columns={columns}
              permissions={{
                canApproveReject,
                canSubmit,
                canCreate
              }}
            />
          )}
        </div>
      </Main>

      <OffersDialogs
        permissions={{
          canApproveReject,
          canSubmit,
          canCreate,
          canDelete: hasActionPermission('DELETE'),
          canComment: hasActionPermission('COMMENT'),
          canUpdateDraft: hasActionPermission('UPDATE_DRAFT'),
          canUpdateAdmin: hasActionPermission('UPDATE_ADMIN')
        }}
        onActionComplete={refreshOffers}
      />
      <ChatBot />
    </>
  );
}

export default function Offers() {
  return (
    <OffersProvider>
      <OffersContent />
    </OffersProvider>
  )
} 