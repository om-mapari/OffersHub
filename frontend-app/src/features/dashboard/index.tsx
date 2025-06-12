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
import { Overview } from './components/overview'
import { CampaignPerformance } from './components/campaign-performance'
import { CampaignMetrics } from './components/campaign-metrics'
import { CustomerSegments } from './components/customer-segments'
import { DeliveryStatus } from './components/delivery-status'
import { useTenant } from '@/context/TenantContext'
import { useAuth } from '@/context/AuthContext'
import { DashboardProvider } from './context/DashboardContext'
import { DashboardContent } from './components/dashboard-content'

export default function Dashboard() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
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
