import { 
  DeliveryStatusResponse 
} from '../api/metrics'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, Cell } from 'recharts'
import { useDashboardData } from '../context/DashboardContext'

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

export function DeliveryStatus() {
  const { deliveryStatus, loading, error } = useDashboardData();

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading delivery status data...</div>
  }

  if (error) {
    return <div className="flex items-center justify-center h-64 text-red-500">{error}</div>
  }

  if (!deliveryStatus) {
    return <div className="flex items-center justify-center h-64">No delivery status data available</div>
  }

  const colors = {
    'pending': '#FFC107',   // Yellow
    'sent': '#2196F3',      // Blue
    'declined': '#F44336',  // Red
    'accepted': '#4CAF50'   // Green
  }

  // Transform data for the chart
  const chartData = [
    { name: 'Pending', value: deliveryStatus.pending, color: colors.pending },
    { name: 'Sent', value: deliveryStatus.sent, color: colors.sent },
    { name: 'Declined', value: deliveryStatus.declined, color: colors.declined },
    { name: 'Accepted', value: deliveryStatus.accepted, color: colors.accepted }
  ]

  // Calculate total
  const total = chartData.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="text-foreground h-64">
      <div className="text-sm text-muted-foreground mb-2 text-center">
        Total Customers: {total}
      </div>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
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