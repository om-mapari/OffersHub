import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";
import { useTenant } from "@/context/TenantContext";
import Campaigns from '@/features/campaigns'

export const Route = createFileRoute("/_authenticated/campaigns")({
  component: CampaignsPage,
});

function CampaignsPage() {
  const { currentTenant } = useTenant();
  const { user, hasPermission } = useAuth();
  
  const canCreate = hasPermission("create", currentTenant?.name);

  return (
    <div className="space-y-6">
      <div className="border shadow-sm rounded-lg">
        <Campaigns />
      </div>
    </div>
  );
} 