import { useState, useMemo } from 'react'
import type { 
  CampaignDeliveryStatus as CampaignDeliveryStatusType
} from '../api/metrics'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, Cell } from 'recharts'
import { useDashboardData } from '../context/DashboardContext'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

// Custom Tooltip Component
function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: 'var(--background)',
          border: '1px solid var(--border)',
          padding: '8px',
          color: 'var(--foreground)',
          borderRadius: '8px',
        }}
      >
        <p style={{ fontWeight: 'bold', color: 'var(--foreground)' }}>{`Status: ${payload[0].payload.name}`}</p>
        <p style={{ color: 'var(--foreground)' }}>{`${payload[0].value} customers`}</p>
      </div>
    )
  }

  return null
}

export function CampaignDeliveryStatus() {
  const { campaignDeliveryStatus, loading, error } = useDashboardData();
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');

  // Get selected campaign data
  const selectedCampaign = useMemo(() => {
    if (!campaignDeliveryStatus || campaignDeliveryStatus.length === 0) return null;
    
    if (!selectedCampaignId && campaignDeliveryStatus.length > 0) {
      // If no campaign is selected, use the first one by default
      return campaignDeliveryStatus[0];
    }
    
    return campaignDeliveryStatus.find(
      campaign => campaign.campaign_id.toString() === selectedCampaignId
    ) || campaignDeliveryStatus[0];
  }, [campaignDeliveryStatus, selectedCampaignId]);

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading campaign delivery status data...</div>
  }

  if (error) {
    return <div className="flex items-center justify-center h-64 text-red-500">{error}</div>
  }

  if (!campaignDeliveryStatus || campaignDeliveryStatus.length === 0) {
    return <div className="flex items-center justify-center h-64">No campaign delivery status data available</div>
  }

  const colors = {
    'pending': '#FFC107',   // Yellow
    'sent': '#2196F3',      // Blue
    'declined': '#F44336',  // Red
    'accepted': '#4CAF50'   // Green
  }

  const handleCampaignChange = (campaignId: string) => {
    setSelectedCampaignId(campaignId);
  };

  // Transform data for the chart
  const chartData = selectedCampaign ? [
    { name: 'Pending', value: selectedCampaign.delivery_status.pending, color: colors.pending },
    { name: 'Sent', value: selectedCampaign.delivery_status.sent, color: colors.sent },
    { name: 'Declined', value: selectedCampaign.delivery_status.declined, color: colors.declined },
    { name: 'Accepted', value: selectedCampaign.delivery_status.accepted, color: colors.accepted }
  ] : [];

  // Calculate total
  const total = selectedCampaign ? 
    selectedCampaign.delivery_status.pending + 
    selectedCampaign.delivery_status.sent + 
    selectedCampaign.delivery_status.declined + 
    selectedCampaign.delivery_status.accepted : 0;

  return (
    <div className="text-foreground h-64">
      <div className="mb-4 flex justify-start">
        <div className="w-full sm:w-64">
          <Select 
            value={selectedCampaignId || selectedCampaign?.campaign_id.toString() || ''}
            onValueChange={handleCampaignChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a campaign" />
            </SelectTrigger>
            <SelectContent>
              {campaignDeliveryStatus.map(campaign => (
                <SelectItem 
                  key={campaign.campaign_id} 
                  value={campaign.campaign_id.toString()}
                >
                  {campaign.campaign_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="text-sm text-muted-foreground mb-2 text-center">
        {selectedCampaign?.campaign_name}: {total} Customers
      </div>
      
      <ResponsiveContainer width="100%" height="70%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
        >
          <XAxis type="number" />
          <YAxis 
            type="category" 
            dataKey="name" 
            stroke="currentColor"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "currentColor" }}
            width={70}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="value" fill="#8884d8">
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
} 