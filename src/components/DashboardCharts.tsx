'use client'

import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'

const COLORS = {
  COMPLETED: '#10b981', // emerald-500
  IN_PROGRESS: '#3b82f6', // blue-500
  PLANNING: '#f59e0b', // amber-500
}

export default function DashboardCharts({ projects }: { projects: any[] }) {
  // 1. Prepare Data for Bar Chart (Budget vs Estimate vs Realized)
  const barData = projects.slice(0, 5).map(p => {
    const estimate = p.items ? p.items.reduce((sum: number, item: any) => sum + Number(item.totalPrice), 0) : 0
    const realized = p.items ? p.items.reduce((sum: number, item: any) => sum + (item.expenses ? item.expenses.reduce((eSum: number, e: any) => eSum + Number(e.amount), 0) : 0), 0) : 0
    return {
      name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
      budget: Number(p.budget),
      estimate: estimate,
      realized: realized,
    }
  })

  // 2. Prepare Data for Pie Chart (Project Statuses)
  const statusCounts = projects.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1
    return acc
  }, {})

  const pieData = Object.keys(statusCounts).map(status => ({
    name: status.replace('_', ' '),
    value: statusCounts[status],
    originalStatus: status
  }))

  // 3. Prepare Data for Category Expenses Pie Chart
  const categoryExpenses: Record<string, number> = {}
  projects.forEach(p => {
    p.items?.forEach((item: any) => {
      const catName = item.categoryName || 'Uncategorized'
      const expSum = item.expenses ? item.expenses.reduce((sum: number, e: any) => sum + Number(e.amount), 0) : 0
      if (expSum > 0) {
        categoryExpenses[catName] = (categoryExpenses[catName] || 0) + expSum
      }
    })
  })

  const CATEGORY_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6']

  const categoryPieData = Object.keys(categoryExpenses).map(cat => ({
    name: cat,
    value: categoryExpenses[cat]
  })).sort((a, b) => b.value - a.value)

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '8px' }}>
          <p style={{ margin: '0 0 0.5rem 0', fontWeight: 600 }}>{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color, margin: '0.2rem 0', fontSize: '0.85rem' }}>
              {entry.name}: Rp {Number(entry.value).toLocaleString('id-ID')}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
      
      {/* Bar Chart: Budget vs Actual */}
      <div className="glass-card" style={{ padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
        <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Financial Overview (Ceiling vs Estimate vs Realization)</h3>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `Rp${(value/1000000)}M`} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="budget" name="Budget Ceiling" fill="var(--bg-tertiary)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="estimate" name="RAB Estimate" fill="var(--warning)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="realized" name="Actual Cost" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Chart: Project Status */}
      <div className="glass-card" style={{ padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
        <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Project Status Distribution</h3>
        <div style={{ width: '100%', height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.originalStatus as keyof typeof COLORS] || '#8884d8'} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No projects found.</div>
          )}
        </div>
      </div>

      {/* Donut Chart: Expenses By Category */}
      <div className="glass-card" style={{ padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
        <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Expense Distribution</h3>
        <div style={{ width: '100%', height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {categoryPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => `Rp ${Number(value).toLocaleString('id-ID')}`}
                  contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No expenses recorded yet.</div>
          )}
        </div>
      </div>

    </div>
  )
}
