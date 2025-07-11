import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { NotificationButton } from '@/components/notification-button'
import { Overview } from './overview'
import { CampaignPerformance } from './campaign-performance'
import { CampaignMetrics } from './campaign-metrics'
import { CustomerSegments } from './customer-segments'
import { DeliveryStatus } from './delivery-status'
import { CampaignDeliveryStatus } from './campaign-delivery-status'
import { useTenant } from '@/context/TenantContext'
import { useAuth } from '@/context/AuthContext'
import { useDashboardData } from '../context/DashboardContext'
import { RefreshCw } from 'lucide-react'
import { useState } from 'react'
import ChatBot from '@/features/ai-chat'

export function DashboardContent() {
  const { currentTenant } = useTenant();
  const { user } = useAuth();
  const {
    totalCustomers,
    activeOffers,
    activeCampaigns,
    campaignEngagement,
    loading,
    error,
    refreshData
  } = useDashboardData();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setIsRefreshing(false);
  };

  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <TopNav links={topNav} />
        <div className='ml-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <NotificationButton />
          <ProfileDropdown />
        </div>
      </Header>

      {/* ===== Main ===== */}
      <Main>
        <div className='mb-2 flex items-center justify-between space-y-2'>
          <h1 className='text-2xl font-bold tracking-tight'>
            {currentTenant
              ? `${currentTenant.name.split('_').map((part: string) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join(' ')} Dashboard`
              : user?.isSuperAdmin
                ? "Admin Dashboard"
                : "Dashboard"}
          </h1>
          <div className='flex items-center space-x-2'>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing || loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
            </Button>
          </div>
        </div>
        <Tabs
          orientation='vertical'
          defaultValue='overview'
          className='space-y-4'
        >
          <div className='w-full overflow-x-auto pb-2'>
            <TabsList className="w-full justify-start sm:w-auto">
              <TabsTrigger value='overview'>Overview</TabsTrigger>
              <TabsTrigger value='analytics' disabled>
                Analytics
              </TabsTrigger>
              <TabsTrigger value='reports' disabled>
                Reports
              </TabsTrigger>
              <TabsTrigger value='notifications' disabled>
                Notifications
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value='overview' className='space-y-4'>
            {loading ? (
              <div className="flex items-center justify-center h-24">Loading dashboard metrics...</div>
            ) : error ? (
              <div className="flex items-center justify-center h-24 text-red-500">{error}</div>
            ) : (
              <div className='grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'>
                <Card>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium'>
                      Active Offers
                    </CardTitle>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      className='text-muted-foreground h-4 w-4'
                    >
                      <path d='M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' />
                    </svg>
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl font-bold'>{activeOffers}</div>
                    <p className='text-muted-foreground text-xs'>
                      Approved offers
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium'>
                      Active Campaigns
                    </CardTitle>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      className='text-muted-foreground h-4 w-4'
                    >
                      <rect width='20' height='14' x='2' y='5' rx='2' />
                      <path d='M2 10h20' />
                    </svg>
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl font-bold'>{activeCampaigns}</div>
                    <p className='text-muted-foreground text-xs'>
                      Running campaigns
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium'>
                      Campaign Acceptance
                    </CardTitle>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      className='text-muted-foreground h-4 w-4'
                    >
                      <path d='M22 12h-4l-3 9L9 3l-3 9H2' />
                    </svg>
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl font-bold'>{campaignEngagement}%</div>
                    <p className='text-muted-foreground text-xs'>
                      Acceptance rate
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium'>
                      Total Customers
                    </CardTitle>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      className='text-muted-foreground h-4 w-4'
                    >
                      <path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' />
                      <circle cx='9' cy='7' r='4' />
                      <path d='M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' />
                    </svg>
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl font-bold'>{totalCustomers}</div>
                    <p className='text-muted-foreground text-xs'>
                      In campaigns
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
            <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
              <Card className='col-span-1 lg:col-span-4'>
                <CardHeader className="flex flex-col space-y-1 sm:flex-row sm:justify-between sm:space-y-0">
                  <div>
                    <CardTitle>Offers Overview</CardTitle>
                    <CardDescription>Distribution of offers by status</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className='pl-2'>
                  <Overview />
                </CardContent>
              </Card>
              <Card className='col-span-1 lg:col-span-3'>
                <CardHeader className="flex flex-col space-y-1 sm:flex-row sm:justify-between sm:space-y-0">
                  <div>
                    <CardTitle>Campaign Performance</CardTitle>
                    <CardDescription>
                      Top campaigns by acceptance rate
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <CampaignPerformance />
                </CardContent>
              </Card>
            </div>
            <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
              <Card>
                <CardHeader className="flex flex-col space-y-1 sm:flex-row sm:justify-between sm:space-y-0">
                  <div>
                    <CardTitle>Campaign Status Distribution</CardTitle>
                    <CardDescription>Overview of campaign statuses</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <CampaignMetrics />
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-col space-y-1 sm:flex-row sm:justify-between sm:space-y-0">
                  <div>
                    <CardTitle>Customer Segments</CardTitle>
                    <CardDescription>Distribution of customers by segment</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <CustomerSegments />
                </CardContent>
              </Card>
            </div>
            <div className='grid grid-cols-1 gap-4'>
              <Card>
                <CardHeader className="flex flex-col space-y-1 sm:flex-row sm:justify-between sm:space-y-0">
                  <div>
                    <CardTitle>Campaign Delivery Status</CardTitle>
                    <CardDescription>Delivery status breakdown by campaign</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <CampaignDeliveryStatus />
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-col space-y-1 sm:flex-row sm:justify-between sm:space-y-0">
                  <div>
                    <CardTitle>Delivery Status</CardTitle>
                    <CardDescription>Status of offer deliveries to customers</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <DeliveryStatus />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </Main>

      <ChatBot />
    </>
  )
}

const topNav = [
  {
    title: 'Overview',
    href: 'dashboard/overview',
    isActive: true,
    disabled: false,
  },
  {
    title: 'Offers',
    href: '/offers',
    isActive: false,
    disabled: false,
  },
  {
    title: 'Campaigns',
    href: '/campaigns',
    isActive: false,
    disabled: false,
  },
  {
    title: 'Settings',
    href: '/settings',
    isActive: false,
    disabled: false,
  },
] 