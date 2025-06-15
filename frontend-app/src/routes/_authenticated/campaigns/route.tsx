import { createFileRoute } from "@tanstack/react-router";
import Campaigns from '@/features/campaigns'
import { CampaignsProvider } from '@/features/campaigns/context/campaigns-context'

export const Route = createFileRoute("/_authenticated/campaigns")({
  component: CampaignsPage,
});

function CampaignsPage() {
  return (
    <CampaignsProvider>
      <Campaigns />
    </CampaignsProvider>
  );
} 