import { useEffect, useState } from 'react'
import { 
  fetchCampaignCustomers,
  CampaignCustomersResponse,
  CampaignCustomer
} from '../api/metrics'
import { Progress } from '@/components/ui/progress'

export function CampaignPerformance() {
  const [campaignCustomers, setCampaignCustomers] = useState<CampaignCustomersResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const data = await fetchCampaignCustomers()
        setCampaignCustomers(data)
        setError(null)
      } catch (err) {
        setError('Failed to fetch campaign performance data')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading campaign data...</div>
  }

  if (error) {
    return <div className="flex items-center justify-center h-64 text-red-500">{error}</div>
  }

  if (!campaignCustomers?.campaigns || campaignCustomers.campaigns.length === 0) {
    return <div className="flex items-center justify-center h-64">No campaign data available</div>
  }

  // Sort campaigns by acceptance rate
  const sortedCampaigns = [...campaignCustomers.campaigns]
    .sort((a, b) => b.percentage_accepted - a.percentage_accepted)
    .slice(0, 5)

  return (
    <div className="space-y-8">
      {sortedCampaigns.map((campaign) => (
        <div key={campaign.campaign_id} className="space-y-2">
          <div className="flex items-center">
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="font-medium">{campaign.campaign_name}</div>
                <div className="text-sm text-muted-foreground">{campaign.percentage_accepted}%</div>
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