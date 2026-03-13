import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend
} from 'recharts'
import { CATEGORY_META } from '../data/losses'
import type { CountrySummary, Category } from '../types'
import { formatMillions } from '../utils/formatters'

interface Props {
  summaries: CountrySummary[]
  loading: boolean
}

const fmt = formatMillions

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-bloomberg-surface rounded ${className ?? ''}`} />
}

const CATEGORIES: Category[] = ['interceptors', 'oil_revenue', 'airports', 'airlines', 'trade', 'tourism', 'insurance', 'equity', 'fdi', 'real_estate']

export default function CategoryBreakdown({ summaries, loading }: Props) {
  const categoryTotals = CATEGORIES.map(cat => {
    const total = summaries.reduce((sum, c) => sum + (c.byCategory[cat] || 0), 0)
    return {
      category: cat,
      label: CATEGORY_META[cat].label,
      total,
      color: CATEGORY_META[cat].color,
      icon: CATEGORY_META[cat].icon,
    }
  }).sort((a, b) => b.total - a.total)

  const stackedData = summaries.map(c => ({
    name: c.flag + ' ' + c.country.replace('Saudi Arabia', 'KSA'),
    ...Object.fromEntries(CATEGORIES.map(cat => [cat, c.byCategory[cat] || 0])),
  }))

  return (
    <div className="space-y-6">
      {/* Category totals header */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-bloomberg-border">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-bloomberg-panel p-4">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-7 w-20" />
              </div>
            ))
          : categoryTotals.slice(0, 4).map(c => (
              <div key={c.category} className="bg-bloomberg-panel p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[22px]">{c.icon}</span>
                  <span className="text-bloomberg-dim text-[13px] font-mono uppercase tracking-wider">{c.label}</span>
                </div>
                <div className="text-white font-bold font-mono text-[24px]">{fmt(c.total)}</div>
                <div className="mt-1 h-0.5 rounded-full" style={{ background: c.color }} />
              </div>
            ))
        }
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Stacked bar by country */}
        <div className="bg-bloomberg-panel border border-bloomberg-border p-4">
          <div className="text-bloomberg-orange text-[13px] font-mono uppercase tracking-widest mb-4">
            Losses by Country &amp; Category
          </div>
          {loading ? (
            <Skeleton className="h-[280px] w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stackedData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#9ca3af', fontSize: 13, fontFamily: 'monospace' }}
                  axisLine={{ stroke: '#1e1e1e' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#9ca3af', fontSize: 13, fontFamily: 'monospace' }}
                  axisLine={{ stroke: '#1e1e1e' }}
                  tickLine={false}
                  tickFormatter={v => `$${(v / 1000).toFixed(0)}B`}
                />
                <Tooltip
                  contentStyle={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 0, fontFamily: 'monospace', fontSize: 13 }}
                  labelStyle={{ color: '#e5e7eb' }}
                  formatter={(v, name) => [fmt(Number(v)), CATEGORY_META[name as Category]?.label || String(name)]}
                />
                {CATEGORIES.map(cat => (
                  <Bar key={cat} dataKey={cat} stackId="a" fill={CATEGORY_META[cat].color} radius={0} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie chart - category share */}
        <div className="bg-bloomberg-panel border border-bloomberg-border p-4">
          <div className="text-bloomberg-orange text-[13px] font-mono uppercase tracking-widest mb-4">
            Total Loss by Category
          </div>
          {loading ? (
            <Skeleton className="h-[280px] w-full" />
          ) : (
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
                  formatter={(v) => <span style={{ color: '#9ca3af', fontSize: 13, fontFamily: 'monospace' }}>{v}</span>}
                />
                <Tooltip
                  contentStyle={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 0, fontFamily: 'monospace', fontSize: 13 }}
                  formatter={(v) => [fmt(Number(v))]}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Category table */}
      <div className="bg-bloomberg-panel border border-bloomberg-border">
        <table className="w-full text-[14px] font-mono">
          <thead>
            <tr className="border-b border-bloomberg-border">
              {['CATEGORY', 'DESCRIPTION', 'GCC TOTAL', 'LARGEST EXPOSURE', '% OF TOTAL'].map(h => (
                <th key={h} className="text-left text-bloomberg-dim px-4 py-2 font-normal text-[12px] uppercase tracking-widest">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-bloomberg-border">
                    <td className="px-4 py-2.5"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-4 py-2.5"><Skeleton className="h-4 w-48" /></td>
                    <td className="px-4 py-2.5"><Skeleton className="h-4 w-16" /></td>
                    <td className="px-4 py-2.5"><Skeleton className="h-4 w-28" /></td>
                    <td className="px-4 py-2.5"><Skeleton className="h-4 w-20" /></td>
                  </tr>
                ))
              : categoryTotals.map((c, i) => {
                  const largest = summaries.length > 0
                    ? summaries.reduce((best, cs) =>
                        (cs.byCategory[c.category] || 0) > (best.byCategory[c.category] || 0) ? cs : best
                      )
                    : null
                  const grandTotal = categoryTotals.reduce((s, x) => s + x.total, 0)
                  const pct = grandTotal > 0 ? ((c.total / grandTotal) * 100).toFixed(1) : '0.0'
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
                        {largest ? (
                          <>
                            <span className="text-bloomberg-dim">{largest.flag} {largest.country}</span>
                            <span className="text-bloomberg-muted ml-2">({fmt(largest.byCategory[c.category] || 0)})</span>
                          </>
                        ) : <span className="text-bloomberg-muted">—</span>}
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
                })
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}
