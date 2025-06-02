import { Link } from '@tanstack/react-router'
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
  User,
  Settings,
  History,
  Keyboard,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { useAuth } from '@/context/AuthContext'

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()
  const { logout, user: authUser } = useAuth()

  const handleLogout = () => {
    logout('/sign-in')
  }

  return (
    <SidebarMenu>
      {!isMobile ? (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuItem
                className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
              >
              <Avatar className='h-8 w-8 rounded-lg'>
                <AvatarImage src={authUser?.avatar || user.avatar} alt={authUser?.fullName || user.name} />
                <AvatarFallback className='rounded-lg'>SN</AvatarFallback>
              </Avatar>
              <div className='grid flex-1 text-left text-sm leading-tight'>
                <span className='truncate font-semibold'>{authUser?.fullName || user.name}</span>
                <span className='truncate text-xs'>{user.email}</span>
              </div>
              <ChevronsUpDown className='ml-auto size-4' />
              </SidebarMenuItem>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className='w-64 rounded-lg border-sidebar-accent bg-sidebar p-1'
              align='start'
              side='right'
              sideOffset={20}
              alignOffset={-24}
            >
            <DropdownMenuLabel className='p-0 font-normal'>
              <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                <Avatar className='h-8 w-8 rounded-lg'>
                  <AvatarImage src={authUser?.avatar || user.avatar} alt={authUser?.fullName || user.name} />
                  <AvatarFallback className='rounded-lg'>SN</AvatarFallback>
                </Avatar>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-semibold'>{authUser?.fullName || user.name}</span>
                  <span className='truncate text-xs'>{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className='bg-sidebar-accent' />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <User />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell />
                Notifications
              </DropdownMenuItem>
              <DropdownMenuItem>
                <History />
                Recent Activity
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Keyboard />
                Keyboard shortcuts
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut />
              Log out
            </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      ) : null}
    </SidebarMenu>
  )
}
