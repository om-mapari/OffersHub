import { Check, ChevronsUpDown, Building } from "lucide-react";
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
import { useTenant } from "@/context/TenantContext";
import { useState } from "react";

export function TenantSelector() {
  const { currentTenant, userTenants, setCurrentTenant } = useTenant();
  const [open, setOpen] = useState(false);

  if (!currentTenant || userTenants.length === 0) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            {currentTenant.name}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search tenant..." />
          <CommandEmpty>No tenant found.</CommandEmpty>
          <CommandGroup>
            {userTenants.map((tenant) => (
              <CommandItem
                key={tenant.id}
                value={tenant.name}
                onSelect={() => {
                  setCurrentTenant(tenant);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    currentTenant.id === tenant.id ? "opacity-100" : "opacity-0"
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