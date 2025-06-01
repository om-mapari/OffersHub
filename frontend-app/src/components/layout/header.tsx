import React from 'react'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { TenantSelector } from '@/components/tenant-selector'
import { UserMenu } from '@/components/user-menu'
import { useAuth } from '@/context/AuthContext'
import { useTenant } from '@/context/TenantContext'

interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  fixed?: boolean
  ref?: React.Ref<HTMLElement>
}

export const Header = ({
  className,
  fixed,
  children,
  ...props
}: HeaderProps) => {
  const [offset, setOffset] = React.useState(0)
  const { user } = useAuth();
  const { userTenants } = useTenant();

  React.useEffect(() => {
    const onScroll = () => {
      setOffset(document.body.scrollTop || document.documentElement.scrollTop)
    }

    // Add scroll listener to the body
    document.addEventListener('scroll', onScroll, { passive: true })

    // Clean up the event listener on unmount
    return () => document.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'bg-background flex h-16 items-center gap-3 p-4 sm:gap-4',
        fixed && 'header-fixed peer/header fixed z-50 w-[inherit] rounded-md',
        offset > 10 && fixed ? 'shadow-sm' : 'shadow-none',
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-3">
        <SidebarTrigger variant='outline' className='scale-125 sm:scale-100' />
        <Separator orientation='vertical' className='h-6' />
        
        {/* Show tenant selector if user has access to any tenants */}
        {user && userTenants.length > 0 && (
          <>
            <TenantSelector />
            <Separator orientation='vertical' className='h-6' />
          </>
        )}
      </div>
      
      {/* Main navigation items */}
      <div className="flex-1 flex items-center">
        {children}
      </div>
      
      {/* User menu at the end */}
      <UserMenu />
    </header>
  )
}

Header.displayName = 'Header'
