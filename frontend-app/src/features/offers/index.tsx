import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { columns } from './components/offers-columns'
import { OffersDialogs } from './components/offers-dialogs'
import { OffersPrimaryButtons } from './components/offers-primary-buttons'
import { OffersTable } from './components/offers-table'
import OffersProvider from './context/offers-context'
import { offerListSchema } from './data/schema'
import { mockOffers } from './data/offers'
import { useTenant } from '@/context/TenantContext'
import { useAuth } from '@/context/AuthContext'
import { useEffect } from 'react'

export default function Offers() {
  const { currentTenant } = useTenant();
  const { user, hasPermission } = useAuth();
  
  // Parse offer list
  const offerList = offerListSchema.parse(mockOffers)
  // Filter offers by current tenant
  const filteredOffers = currentTenant 
    ? offerList.filter(offer => offer.tenant_id === currentTenant.id)
    : offerList;

  const canCreate = hasPermission("create", currentTenant?.id);

  return (
    <OffersProvider>
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
            <h2 className='text-2xl font-bold tracking-tight'>Offers</h2>
            <p className='text-muted-foreground'>
              {currentTenant 
                ? `Manage offers for ${currentTenant.name}`
                : "Select a tenant to manage offers"}
            </p>
          </div>
          {canCreate && <OffersPrimaryButtons />}
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <OffersTable data={filteredOffers} columns={columns} />
        </div>
      </Main>

      <OffersDialogs />
    </OffersProvider>
  )
} 