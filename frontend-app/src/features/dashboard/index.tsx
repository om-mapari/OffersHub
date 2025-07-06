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
