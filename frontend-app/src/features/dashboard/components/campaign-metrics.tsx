import { useEffect, useState } from 'react'
import { fetchCampaignsMetrics, CampaignsMetrics } from '../api/metrics'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { useTenant } from '@/context/TenantContext'
import { useAuth } from '@/context/AuthContext'

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
        <p style={{ fontWeight: 'bold', color: 'var(--foreground)' }}>{`Status: ${payload[0].name}`}</p>
        <p style={{ color: 'var(--foreground)' }}>{`${payload[0].value} campaigns`}</p>
      </div>
    )
  }

  return null
}

export function CampaignMetrics() {
  const { currentTenant } = useTenant()
  const { token } = useAuth()
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
        const data = await fetchCampaignsMetrics(currentTenant.name, token)
        setCampaignsMetrics(data)
        setError(null)
      } catch (err) {
        setError('Failed to fetch campaign metrics')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [currentTenant, token])

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading campaign data...</div>
  }

  if (error) {
    return <div className="flex items-center justify-center h-64 text-red-500">{error}</div>
  }

  if (!campaignsMetrics) {
    return <div className="flex items-center justify-center h-64">No campaign data available</div>
  }

  const colors = {
    'Active': '#00AEEF',
    'Completed': '#4CAF50',
    'Paused': '#FFC107',
    'Approved': '#9C27B0',
    'Draft': '#607D8B'
  }

  const data = [
    { name: 'Active', value: campaignsMetrics.active, color: colors['Active'] },
    { name: 'Completed', value: campaignsMetrics.completed, color: colors['Completed'] },
    { name: 'Paused', value: campaignsMetrics.paused, color: colors['Paused'] },
    { name: 'Approved', value: campaignsMetrics.approved, color: colors['Approved'] },
    { name: 'Draft', value: campaignsMetrics.draft, color: colors['Draft'] }
  ]

  const RADIAN = Math.PI / 180
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
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
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            innerRadius={40}       // optional: for donut look
            outerRadius={120}      // increases overall size
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
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