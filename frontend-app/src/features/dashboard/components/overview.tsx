import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Cell } from 'recharts'
import { useDashboardData } from '../context/DashboardContext'

// 🧩 Custom Tooltip Component
function CustomTooltip({ active, payload, label }: any) {
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
        <p style={{ fontWeight: 'bold', color: 'var(--foreground)' }}>{`Status: ${label}`}</p>
        <p style={{ color: 'var(--foreground)' }}>{`${payload[0].value} offers`}</p>
      </div>
    )
  }

  return null
}

export function Overview() {
  const { offersMetrics, loading, error } = useDashboardData();

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading offers data...</div>
  }

  if (error) {
    return <div className="flex items-center justify-center h-64 text-red-500">{error}</div>
  }

  if (!offersMetrics) {
    return <div className="flex items-center justify-center h-64">No offers data available</div>
  }

  const colors = {
    'Approved': '#00AEEF',
    'Draft': '#607D8B',
    'Rejected': '#F44336',
    'Pending Review': '#FFC107',
    'Retired': '#9E9E9E',
  }

  const data = [
    {
      name: 'Approved',
      value: offersMetrics.approved,
      color: colors['Approved']
    },
    {
      name: 'Draft',
      value: offersMetrics.draft,
      color: colors['Draft']
    },
    {
      name: 'Rejected',
      value: offersMetrics.rejected,
      color: colors['Rejected']
    },
    {
      name: 'Pending Review',
      value: offersMetrics.pending_review,
      color: colors['Pending Review']
    },
    {
      name: 'Retired',
      value: offersMetrics.retired,
      color: colors['Retired']
    },
  ]

  return (
    <div className="text-foreground">
      <ResponsiveContainer width='100%' height={350}>
        <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
          <XAxis
            dataKey='name'
            stroke="currentColor"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "currentColor" }}
          />
          <YAxis
            stroke="currentColor"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "currentColor" }}
          />

          <Tooltip content={<CustomTooltip />} />

          <Legend 
            formatter={(value) => <span className="text-foreground">{value}</span>}
          />
          <Bar
            dataKey='value'
            name='Offers'
            radius={[4, 4, 0, 0]}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
