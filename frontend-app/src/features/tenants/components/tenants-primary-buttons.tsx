import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTenantsContext } from "../context/tenants-context";

export function TenantsPrimaryButtons() {
  // Try to use the context, but don't throw if it's not available
  let contextValue;
  try {
    contextValue = useTenantsContext();
  } catch (error) {
    console.warn("TenantsPrimaryButtons: TenantsContext not available");
    return null;
  }
  
  const { setIsCreateDialogOpen } = contextValue;

  return (
    <div className="flex items-center space-x-2">
      <Button onClick={() => setIsCreateDialogOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Create Tenant
      </Button>
    </div>
  );
} 