import { Outlet } from '@tanstack/react-router'
import {
  IconBrowserCheck,
  IconNotification,
  IconPalette,
  IconTool,
  IconUser,
} from '@tabler/icons-react'
import { Separator } from '@/components/ui/separator'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { NotificationButton } from '@/components/notification-button'
import SidebarNav from './components/sidebar-nav'
import { useAuth } from '@/context/AuthContext'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function Settings() {
  const { user } = useAuth();
  
  // Get display name and username
  const displayName = user?.fullName || "User";
  const username = user?.username || (user?.email ? user.email.split('@')[0] : "username");

  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <NotificationButton />
          <ProfileDropdown />
        </div>
      </Header>

      <Main fixed>
        <div className='flex items-center gap-4'>
          <Avatar className='h-12 w-12'>
            <AvatarImage src={user?.avatar} alt={displayName} />
            <AvatarFallback>{displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className='space-y-0.5'>
            <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>
              {displayName}
            </h1>
            <p className='text-muted-foreground'>
              @{username} • Manage your account settings and set e-mail preferences.
            </p>
          </div>
        </div>
        <Separator className='my-4 lg:my-6' />
        <div className='flex flex-1 flex-col space-y-2 overflow-hidden md:space-y-2 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <aside className='top-0 lg:sticky lg:w-1/5'>
            <SidebarNav items={sidebarNavItems} />
          </aside>
          <div className='flex w-full overflow-y-hidden p-1'>
            <Outlet />
          </div>
        </div>
      </Main>
    </>
  )
}

const sidebarNavItems = [
  {
    title: 'Profile',
    icon: <IconUser size={18} />,
    href: '/settings',
  },
  {
    title: 'Account',
    icon: <IconTool size={18} />,
    href: '/settings/account',
  },
  {
    title: 'Appearance',
    icon: <IconPalette size={18} />,
    href: '/settings/appearance',
  },
  {
    title: 'Notifications',
    icon: <IconNotification size={18} />,
    href: '/settings/notifications',
  },
  {
    title: 'Display',
    icon: <IconBrowserCheck size={18} />,
    href: '/settings/display',
  },
]
