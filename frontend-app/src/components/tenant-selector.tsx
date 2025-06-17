import * as React from "react";
import { Check, ChevronsUpDown, Building, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useTenant, Tenant } from "@/context/TenantContext";

export function TenantSelector() {
  const [open, setOpen] = React.useState(false);
  const { currentTenant, userTenants, setCurrentTenant, isLoading } = useTenant();

  // Format tenant name for display
  const formatTenantName = (name: string) => {
    return name.split('_')
      .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
  };

  // If loading, show a loading indicator
  if (isLoading) {
    return (
      <Button variant="outline" className="w-full justify-between" disabled>
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin shrink-0" />
          <span className="truncate text-sm">Loading...</span>
        </div>
      </Button>
    );
  }

  // If no tenants available, show a message
  if (!userTenants.length) {
    return (
      <Button variant="outline" className="w-full justify-between" disabled>
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4 shrink-0" />
          <span className="truncate text-sm">No tenants</span>
        </div>
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          size="sm"
        >
          <div className="flex items-center gap-2 truncate">
            <Building className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="truncate">
              {currentTenant 
                ? formatTenantName(currentTenant.name)
                : "Select tenant..."}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start" sideOffset={5}>
        <Command>
          <CommandInput placeholder="Search tenants..." className="text-sm" />
          <CommandList>
            <CommandEmpty>No tenant found</CommandEmpty>
            <CommandGroup>
              {userTenants.map((tenant) => (
                <CommandItem
                  key={tenant.name}
                  value={tenant.name}
                  onSelect={() => {
                    setCurrentTenant(tenant);
                    setOpen(false);
                  }}
                  className="text-sm cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      currentTenant?.name === tenant.name ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {formatTenantName(tenant.name)}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
} 