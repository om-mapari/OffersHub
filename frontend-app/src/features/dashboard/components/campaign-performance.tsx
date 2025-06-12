import { 
  CampaignCustomersResponse,
  CampaignCustomer
} from '../api/metrics'
import { Progress } from '@/components/ui/progress'
import { useDashboardData } from '../context/DashboardContext'

// Mock data to use when API fails
const mockCampaigns = {
  campaigns: [
    {
      campaign_id: 1,
      campaign_name: "Summer Special",
      sent_campaigns_customers: 100,
      accepted_campaigns: 42,
      percentage_accepted: 42.0
    },
    {
      campaign_id: 2,
      campaign_name: "New Year Offer",
      sent_campaigns_customers: 150,
      accepted_campaigns: 63,
      percentage_accepted: 42.0
    },
    {
      campaign_id: 3,
      campaign_name: "Loyalty Rewards",
      sent_campaigns_customers: 75,
      accepted_campaigns: 45,
      percentage_accepted: 60.0
    },
    {
      campaign_id: 4,
      campaign_name: "Winter Discount",
      sent_campaigns_customers: 120,
      accepted_campaigns: 48,
      percentage_accepted: 40.0
    }
  ]
};

export function CampaignPerformance() {
  const { campaignCustomers, loading, error } = useDashboardData()
  
  // Determine if we need to show mock data
  const useDemo = !campaignCustomers?.campaigns || campaignCustomers.campaigns.length === 0

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading campaign data...</div>
  }

  // If no real data and no explicit error, use mock data with a notification
  const displayData = useDemo ? mockCampaigns : campaignCustomers

  if (!displayData?.campaigns || displayData.campaigns.length === 0) {
    return <div className="flex items-center justify-center h-64">No campaign data available</div>
  }

  // Sort campaigns by acceptance rate
  const sortedCampaigns = [...displayData.campaigns]
    .sort((a, b) => b.percentage_accepted - a.percentage_accepted)
    .slice(0, 5)

  return (
    <div className="space-y-8">
      {useDemo && (
        <div className="text-amber-500 text-xs mb-2">
          Using demo data (no active campaigns or API unavailable)
        </div>
      )}
      {sortedCampaigns.map((campaign) => (
        <div key={campaign.campaign_id} className="space-y-2">
          <div className="flex items-center">
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="font-medium">{campaign.campaign_name}</div>
                <div className="text-sm text-muted-foreground">{campaign.percentage_accepted.toFixed(1)}%</div>
              </div>
              <Progress value={campaign.percentage_accepted} className="h-2 mt-2" />
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            {campaign.accepted_campaigns} of {campaign.sent_campaigns_customers} customers accepted
          </div>
        </div>
      ))}
    </div>
  )
} 