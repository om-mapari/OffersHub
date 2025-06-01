import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";
import { useTenant } from "@/context/TenantContext";

export const Route = createFileRoute("/_authenticated/campaigns")({
  component: CampaignsPage,
});

function CampaignsPage() {
  const { currentTenant } = useTenant();
  const { user, hasPermission } = useAuth();
  
  const canCreate = hasPermission("create", currentTenant?.id);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground">
            {currentTenant 
              ? `Manage campaigns for ${currentTenant.name}`
              : "Select a tenant to manage campaigns"}
          </p>
        </div>
        {canCreate && currentTenant && (
          <button className="btn btn-primary">Create Campaign</button>
        )}
      </div>
      <div className="border shadow-sm rounded-lg">
        {/* Campaign list will go here */}
        <div className="p-8 flex items-center justify-center">
          <p className="text-muted-foreground">Campaign list coming soon</p>
        </div>
      </div>
    </div>
  );
} 