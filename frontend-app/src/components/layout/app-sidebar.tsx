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
import { Building } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useTenant } from '@/context/TenantContext'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openTenantPopover, setOpenTenantPopover] = useState(false);
  const { currentTenant, userTenants, setCurrentTenant } = useTenant();

  // Add event listener to detect when sidebar is collapsed
  useEffect(() => {
    const handleSidebarChange = () => {
      const sidebarElement = document.querySelector('[data-slot="sidebar"]');
      if (sidebarElement) {
        const isCollapsed = sidebarElement.getAttribute('data-state') === 'collapsed';
        setIsCollapsed(isCollapsed);
        
        if (isCollapsed) {
          document.documentElement.classList.add('sidebar-collapsed');
        } else {
          document.documentElement.classList.remove('sidebar-collapsed');
        }
      }
    };

    // Initial check
    setTimeout(handleSidebarChange, 100);

    // Set up mutation observer to detect attribute changes
    const sidebarElement = document.querySelector('[data-slot="sidebar"]');
    if (sidebarElement) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === 'data-state') {
            handleSidebarChange();
          }
        });
      });

      observer.observe(sidebarElement, { attributes: true });
      
      return () => {
        observer.disconnect();
      };
    }
  }, []);

  // Format tenant name for display
  const formatTenantName = (name: string) => {
    return name.split('_')
      .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
  };

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
        <div className="px-3">
          <div className="hidden-when-collapsed">
            <TenantSelector />
          </div>
          <div className="collapsed-only-block">
            <Popover open={openTenantPopover} onOpenChange={setOpenTenantPopover}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                >
                  <Building className="h-5 w-5 text-muted-foreground" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0" align="start" sideOffset={5}>
                <div className="p-2">
                  <div className="text-sm font-medium mb-2">Select Tenant</div>
                  <div className="space-y-1">
                    {userTenants.map((tenant) => (
                      <Button
                        key={tenant.name}
                        variant={currentTenant?.name === tenant.name ? "default" : "ghost"}
                        className="w-full justify-start text-sm"
                        onClick={() => {
                          setCurrentTenant(tenant);
                          setOpenTenantPopover(false);
                        }}
                      >
                        {formatTenantName(tenant.name)}
                      </Button>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
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
