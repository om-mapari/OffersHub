import { 
  CustomerSegmentsResponse 
} from '../api/metrics'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
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
        <p style={{ fontWeight: 'bold', color: 'var(--foreground)' }}>{`Segment: ${payload[0].name}`}</p>
        <p style={{ color: 'var(--foreground)' }}>{`${payload[0].value} customers (${payload[0].payload.percentage.toFixed(1)}%)`}</p>
      </div>
    )
  }

  return null
}

export function CustomerSegments() {
  const { customerSegments: segmentsData, loading, error } = useDashboardData();

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading customer data...</div>
  }

  if (error) {
    return <div className="flex items-center justify-center h-64 text-red-500">{error}</div>
  }

  if (!segmentsData || segmentsData.segments.length === 0) {
    return <div className="flex items-center justify-center h-64">No customer segment data available</div>
  }

  const colors = {
    'premium': '#FFD700',    // Gold
    'regular': '#4CAF50',    // Green
    'corporate': '#2196F3',  // Blue
    'Unknown': '#9E9E9E'     // Grey
  }

  // Transform segments data for the chart
  const chartData = segmentsData.segments.map(segment => ({
    name: segment.segment,
    value: segment.count,
    percentage: segment.percentage,
    color: colors[segment.segment as keyof typeof colors] || '#9E9E9E'
  }))

  const RADIAN = Math.PI / 180
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text 
        x={x} 
        y={y} 
        fill="#fff" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <div className="text-foreground h-64">
      <div className="text-sm text-muted-foreground mb-2 text-center">
        Total Customers: {segmentsData.total_customers}
      </div>
      <ResponsiveContainer width="100%" height="90%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            innerRadius={40}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            formatter={(value) => <span className="text-foreground">{value}</span>}
            layout="vertical"
            verticalAlign="middle"
            align="right"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
} 