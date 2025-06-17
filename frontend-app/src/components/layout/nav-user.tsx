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

  // Get username from email or use the provided one
  const username = authUser?.username || user.email.split('@')[0]
  const displayName = authUser?.fullName || user.name
  const initials = displayName.substring(0, 2).toUpperCase()

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
                <div className='flex w-full items-center gap-2'>
                  <Avatar className='h-8 w-8 shrink-0 rounded-lg'>
                    <AvatarImage src={authUser?.avatar || user.avatar} alt={displayName} />
                    <AvatarFallback className='rounded-lg'>{initials}</AvatarFallback>
                  </Avatar>
                  <div className='flex-1 overflow-hidden'>
                    <p className='truncate font-medium leading-none'>{displayName}</p>
                    <p className='truncate text-xs text-muted-foreground'>@{username}</p>
                  </div>
                  <ChevronsUpDown className='ml-auto h-4 w-4 shrink-0 opacity-70' />
                </div>
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
                    <AvatarImage src={authUser?.avatar || user.avatar} alt={displayName} />
                    <AvatarFallback className='rounded-lg'>{initials}</AvatarFallback>
                  </Avatar>
                  <div className='flex-1 overflow-hidden'>
                    <p className='truncate font-medium'>{displayName}</p>
                    <p className='truncate text-xs text-muted-foreground'>@{username}</p>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className='bg-sidebar-accent' />
              <DropdownMenuGroup>
                <Link to="/settings">
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                </Link>
                <Link to="/settings">
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem>
                  <Bell className="mr-2 h-4 w-4" />
                  Notifications
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <History className="mr-2 h-4 w-4" />
                  Recent Activity
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Keyboard className="mr-2 h-4 w-4" />
                  Keyboard shortcuts
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      ) : null}
    </SidebarMenu>
  )
}
