import { Check, ChevronsUpDown, Building, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useTenant, Tenant } from "@/context/TenantContext";

export function TenantSelector() {
  const [open, setOpen] = useState(false);
  const { currentTenant, userTenants, setCurrentTenant, isLoading } = useTenant();

  // If loading, show a loading indicator
  if (isLoading) {
    return (
      <Button variant="outline" className="w-[240px] justify-between" disabled>
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading tenants...</span>
        </div>
      </Button>
    );
  }

  // If no tenants available, show a message
  if (!userTenants.length) {
    return (
      <Button variant="outline" className="w-[240px] justify-between" disabled>
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4" />
          <span>No tenants available</span>
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
          className="w-[240px] justify-between"
        >
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            {currentTenant ? currentTenant.name : "Select tenant..."}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-0">
        <Command>
          <CommandInput placeholder="Search tenant..." />
          <CommandEmpty>No tenant found.</CommandEmpty>
          <CommandGroup>
            {userTenants.map((tenant) => (
              <CommandItem
                key={tenant.name}
                value={tenant.name}
                onSelect={() => {
                  setCurrentTenant(tenant);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    currentTenant?.name === tenant.name ? "opacity-100" : "opacity-0"
                  )}
                />
                {tenant.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
} 