import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { NavGroup } from '@/components/layout/nav-group'
import { NavUser } from '@/components/layout/nav-user'
import { TeamSwitcher } from '@/components/layout/team-switcher'
import { sidebarData } from './data/sidebar-data'
import { TenantSelector } from '@/components/tenant-selector'
import { Separator } from '@/components/ui/separator'
import '@/components/ui/sidebar-custom-styles.css'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      collapsible='icon'
      variant='floating'
      className="sidebar"
      {...props}
    >
      <SidebarHeader className="flex flex-col space-y-3">
        <TeamSwitcher teams={sidebarData.teams} />
        <Separator className="my-1" />
        <div className="hidden-when-collapsed px-3">
          <TenantSelector />
        </div>
      </SidebarHeader>
      <SidebarContent>
        {sidebarData.navGroups.map((groupProps) => (
          <NavGroup key={groupProps.title} {...groupProps} />
        ))}
      </SidebarContent>
      <SidebarFooter className="flex flex-col space-y-3">
        <Separator className="my-1" />
        <NavUser user={sidebarData.user} />
      </SidebarFooter>
      <SidebarRail />
      <SidebarTrigger />
    </Sidebar>
  )
}
