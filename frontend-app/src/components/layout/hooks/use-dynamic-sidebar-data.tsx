import { useMemo } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useTenant } from '@/context/TenantContext'
import { NavGroup } from '../types'
import {
  IconDashboard,
  IconBuildingStore,
  IconTags,
  IconVolume,
  IconUsers,
  IconSettings,
  IconHelp,
} from '@tabler/icons-react'

export function useDynamicSidebarData() {
  const { user } = useAuth()
  const { currentTenant } = useTenant()

  const navGroups = useMemo(() => {
    // Default empty state
    if (!user) {
      return []
    }

    const groups: NavGroup[] = []

    // General navigation group - always visible
    const generalGroup: NavGroup = {
      title: 'General',
      items: [
        {
          title: 'Dashboard',
          url: '/' as any,
          icon: IconDashboard,
        },
      ],
    }

    // Super Admin specific navigation
    if (user.isSuperAdmin) {
      generalGroup.items.push(
        {
          title: 'Tenants',
          url: '/tenants' as any,
          icon: IconBuildingStore,
        },
        {
          title: 'Users',
          url: '/users' as any,
          icon: IconUsers,
        }
      )
    } 
    // Regular user navigation
    else {
      // Only add these items if user has a current tenant
      if (currentTenant) {
        // Check permissions for Offers
        if (user.groups.some(group => 
          group.tenantId === currentTenant.id && 
          (group.roles.includes('admin') || group.roles.includes('create') || group.roles.includes('read_only'))
        )) {
          generalGroup.items.push({
            title: 'Offers',
            url: '/offers' as any,
            icon: IconTags,
          })
        }

        // Check permissions for Campaigns
        if (user.groups.some(group => 
          group.tenantId === currentTenant.id && 
          (group.roles.includes('admin') || group.roles.includes('create') || group.roles.includes('read_only'))
        )) {
          generalGroup.items.push({
            title: 'Campaigns',
            url: '/campaigns' as any,
            icon: IconVolume,
          })
        }
      }
    }

    groups.push(generalGroup)

    // Settings group - always visible but with dynamic content
    const settingsGroup: NavGroup = {
      title: 'Settings',
      items: [
        {
          title: 'Settings',
          url: '/settings' as any,
          icon: IconSettings,
        },
        {
          title: 'Help Center',
          url: '/help-center' as any,
          icon: IconHelp,
        },
      ],
    }

    groups.push(settingsGroup)

    return groups
  }, [user, currentTenant])

  return { navGroups }
} 