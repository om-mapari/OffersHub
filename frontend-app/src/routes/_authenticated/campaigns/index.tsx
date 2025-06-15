import { createFileRoute } from '@tanstack/react-router';
import Campaigns from '@/features/campaigns';

export const Route = createFileRoute('/_authenticated/campaigns/')({
  component: CampaignsPage,
});

function CampaignsPage() {
  return <Campaigns />;
} 