import { useEffect, useState } from 'react'
import { 
  fetchOffersMetrics, 
  fetchCampaignsMetrics,
  fetchDeliveryStatus,
  OffersMetrics,
  CampaignsMetrics,
  DeliveryStatusResponse
} from '../api/metrics'
import { useTenant } from '@/context/TenantContext'
import { useAuth } from '@/context/AuthContext'
import { useDashboardData } from '../context/DashboardContext'

// Re-export the hook for backward compatibility if needed
export const useMetricsData = useDashboardData;

export function useMetricsDataOld() {
  const { currentTenant } = useTenant()
  const { token } = useAuth()
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatusResponse | null>(null)
  const [offersMetrics, setOffersMetrics] = useState<OffersMetrics | null>(null)
  const [campaignsMetrics, setCampaignsMetrics] = useState<CampaignsMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!currentTenant || !token) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const [delivery, offers, campaigns] = await Promise.all([
          fetchDeliveryStatus(currentTenant.name, token),
          fetchOffersMetrics(currentTenant.name, token),
          fetchCampaignsMetrics(currentTenant.name, token)
        ])
        
        setDeliveryStatus(delivery)
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
  }, [currentTenant, token])

  // Calculate total customers (sum of all delivery statuses)
  const totalCustomers = deliveryStatus
    ? deliveryStatus.pending + deliveryStatus.sent + deliveryStatus.declined + deliveryStatus.accepted
    : 0
    
  // Calculate active offers (approved offers)
  const activeOffers = offersMetrics?.approved || 0
  
  // Calculate active campaigns
  const activeCampaigns = campaignsMetrics?.active || 0
  
  // Calculate campaign engagement (accepted %)
  const campaignEngagement = deliveryStatus && (deliveryStatus.sent + deliveryStatus.accepted) > 0
    ? Math.round((deliveryStatus.accepted / (deliveryStatus.sent + deliveryStatus.accepted)) * 100)
    : 0

  return {
    totalCustomers,
    activeOffers,
    activeCampaigns,
    campaignEngagement,
    deliveryStatus,
    loading,
    error
  }
} 