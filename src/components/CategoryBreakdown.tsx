import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend
} from 'recharts'
import { COUNTRY_SUMMARIES, CATEGORY_META } from '../data/losses'
import type { Category } from '../types'

function fmt(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}B`
  return `$${n}M`
}

const CATEGORIES: Category[] = ['interceptors', 'oil_revenue', 'airports', 'airlines', 'trade', 'tourism', 'insurance', 'other']

export default function CategoryBreakdown() {
  // Aggregate by category across all countries
  const categoryTotals = CATEGORIES.map(cat => {
    const total = COUNTRY_SUMMARIES.reduce((sum, c) => sum + (c.byCategory[cat] || 0), 0)
    return {
      category: cat,
      label: CATEGORY_META[cat].label,
      total,
      color: CATEGORY_META[cat].color,
      icon: CATEGORY_META[cat].icon,
    }
  }).sort((a, b) => b.total - a.total)

  // Per-country per-category stacked data
  const stackedData = COUNTRY_SUMMARIES.map(c => ({
    name: c.flag + ' ' + c.country.replace('Saudi Arabia', 'KSA'),
    ...Object.fromEntries(CATEGORIES.map(cat => [cat, c.byCategory[cat] || 0])),
  }))

  return (
    <div className="space-y-6">
      {/* Category totals header */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-bloomberg-border">
        {categoryTotals.slice(0, 4).map(c => (
          <div key={c.category} className="bg-bloomberg-panel p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[18px]">{c.icon}</span>
              <span className="text-bloomberg-dim text-[11px] font-mono uppercase tracking-wider">{c.label}</span>
            </div>
            <div className="text-white font-bold font-mono text-[22px]">{fmt(c.total)}</div>
            <div className="mt-1 h-0.5 rounded-full" style={{ background: c.color }} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Stacked bar by country */}
        <div className="bg-bloomberg-panel border border-bloomberg-border p-4">
          <div className="text-bloomberg-orange text-[11px] font-mono uppercase tracking-widest mb-4">
            Losses by Country &amp; Category
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stackedData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#9ca3af', fontSize: 11, fontFamily: 'monospace' }}
                axisLine={{ stroke: '#1e1e1e' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#9ca3af', fontSize: 11, fontFamily: 'monospace' }}
                axisLine={{ stroke: '#1e1e1e' }}
                tickLine={false}
                tickFormatter={v => `$${(v / 1000).toFixed(0)}B`}
              />
              <Tooltip
                contentStyle={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 0, fontFamily: 'monospace', fontSize: 11 }}
                labelStyle={{ color: '#e5e7eb' }}
                formatter={(v, name) => [fmt(Number(v)), CATEGORY_META[name as Category]?.label || String(name)]}
              />
              {CATEGORIES.map(cat => (
                <Bar key={cat} dataKey={cat} stackId="a" fill={CATEGORY_META[cat].color} radius={0} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart - category share */}
        <div className="bg-bloomberg-panel border border-bloomberg-border p-4">
          <div className="text-bloomberg-orange text-[11px] font-mono uppercase tracking-widest mb-4">
            Total Loss by Category
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={categoryTotals}
                dataKey="total"
                nameKey="label"
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={55}
                paddingAngle={2}
              >
                {categoryTotals.map(c => (
                  <Cell key={c.category} fill={c.color} stroke="transparent" />
                ))}
              </Pie>
              <Legend
                formatter={(v) => <span style={{ color: '#9ca3af', fontSize: 11, fontFamily: 'monospace' }}>{v}</span>}
              />
              <Tooltip
                contentStyle={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 0, fontFamily: 'monospace', fontSize: 11 }}
                formatter={(v) => [fmt(Number(v))]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category table */}
      <div className="bg-bloomberg-panel border border-bloomberg-border">
        <table className="w-full text-[12px] font-mono">
          <thead>
            <tr className="border-b border-bloomberg-border">
              {['CATEGORY', 'DESCRIPTION', 'GCC TOTAL', 'LARGEST EXPOSURE', '% OF TOTAL'].map(h => (
                <th key={h} className="text-left text-bloomberg-dim px-4 py-2 font-normal text-[10px] uppercase tracking-widest">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categoryTotals.map((c, i) => {
              const largest = COUNTRY_SUMMARIES.reduce((best, cs) =>
                (cs.byCategory[c.category] || 0) > (best.byCategory[c.category] || 0) ? cs : best
              )
              const pct = ((c.total / categoryTotals.reduce((s, x) => s + x.total, 0)) * 100).toFixed(1)
              return (
                <tr key={c.category} className={`border-b border-bloomberg-border hover:bg-bloomberg-surface ${i % 2 === 0 ? '' : 'bg-black/20'}`}>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                      <span className="text-white">{c.icon} {c.label}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-bloomberg-muted max-w-xs truncate">
                    {CATEGORY_META[c.category].description}
                  </td>
                  <td className="px-4 py-2.5 text-white font-semibold">{fmt(c.total)}</td>
                  <td className="px-4 py-2.5">
                    <span className="text-bloomberg-dim">{largest.flag} {largest.country}</span>
                    <span className="text-bloomberg-muted ml-2">({fmt(largest.byCategory[c.category] || 0)})</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1 bg-bloomberg-border rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: c.color }} />
                      </div>
                      <span className="text-bloomberg-dim">{pct}%</span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
