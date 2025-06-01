import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTenantsContext } from "../context/tenants-context";

export function TenantsPrimaryButtons() {
  const { setIsCreateDialogOpen } = useTenantsContext();

  return (
    <div className="flex items-center space-x-2">
      <Button onClick={() => setIsCreateDialogOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Create Tenant
      </Button>
    </div>
  );
} 