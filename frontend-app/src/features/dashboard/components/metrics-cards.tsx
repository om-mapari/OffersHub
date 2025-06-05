import { useEffect, useState } from 'react'
import { 
  fetchActiveCustomers, 
  fetchOffersMetrics, 
  fetchCampaignsMetrics,
  OffersMetrics,
  CampaignsMetrics
} from '../api/metrics'

export function useMetricsData() {
  const [activeCustomers, setActiveCustomers] = useState<number>(0)
  const [offersMetrics, setOffersMetrics] = useState<OffersMetrics | null>(null)
  const [campaignsMetrics, setCampaignsMetrics] = useState<CampaignsMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [customers, offers, campaigns] = await Promise.all([
          fetchActiveCustomers(),
          fetchOffersMetrics(),
          fetchCampaignsMetrics()
        ])
        
        setActiveCustomers(customers)
        setOffersMetrics(offers)
        setCampaignsMetrics(campaigns)
        setError(null)
      } catch (err) {
        setError('Failed to fetch metrics data')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Calculate active offers (approved offers)
  const activeOffers = offersMetrics?.approved || 0
  
  // Calculate active campaigns
  const activeCampaigns = campaignsMetrics?.active || 0
  
  // Calculate campaign engagement (average of approved and active campaigns)
  const campaignEngagement = campaignsMetrics 
    ? Math.round((campaignsMetrics.active + campaignsMetrics.approved) / 2)
    : 0

  return {
    activeCustomers,
    activeOffers,
    activeCampaigns,
    campaignEngagement,
    loading,
    error
  }
} 