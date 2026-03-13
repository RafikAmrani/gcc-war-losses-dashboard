import type { CountrySummary, Category } from '../types'
import { CATEGORY_META, LOSS_EVENTS } from '../data/losses'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip
} from 'recharts'

interface Props {
  summary: CountrySummary
}

function fmt(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(2)}B`
  return `$${n}M`
}

const CATEGORIES: Category[] = ['interceptors', 'oil_revenue', 'airports', 'airlines', 'trade', 'tourism', 'insurance', 'other']

export default function CountryDetail({ summary }: Props) {
  const events = LOSS_EVENTS.filter(e => e.country === summary.country)
  const catMax = Math.max(...CATEGORIES.map(c => summary.byCategory[c] || 0))

  const radarData = CATEGORIES.map(cat => ({
    subject: CATEGORY_META[cat].label.split(' ')[0],
    value: summary.byCategory[cat] || 0,
    fullMark: catMax,
  }))

  return (
    <div className="bg-bloomberg-panel border border-bloomberg-border">
      {/* Country header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-bloomberg-border">
        <div className="flex items-center gap-3">
          <span className="text-[40px]">{summary.flag}</span>
          <div>
            <h2 className="text-white text-[24px] font-bold leading-none">{summary.country}</h2>
            <p className="text-bloomberg-dim text-[14px] font-mono mt-1">US–Iran War Economic Damage Report</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-bloomberg-orange text-[12px] font-mono uppercase tracking-widest">Total Loss</div>
          <div className="text-white text-[32px] font-bold font-mono">{fmt(summary.totalLoss)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
        {/* Category breakdown bars */}
        <div className="p-6 border-r border-bloomberg-border">
          <div className="text-bloomberg-orange text-[13px] font-mono uppercase tracking-widest mb-4">
            Loss by Category
          </div>
          <div className="space-y-3">
            {CATEGORIES.map(cat => {
              const val = summary.byCategory[cat] || 0
              if (val === 0) return null
              const meta = CATEGORY_META[cat]
              const pct = (val / summary.totalLoss) * 100
              return (
                <div key={cat}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-bloomberg-text text-[14px] font-mono">
                      {meta.icon} {meta.label}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-bloomberg-dim text-[13px] font-mono">{pct.toFixed(1)}%</span>
                      <span className="text-white font-bold font-mono text-[15px] w-20 text-right">{fmt(val)}</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-bloomberg-border rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, background: meta.color }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Radar chart */}
        <div className="p-6">
          <div className="text-bloomberg-orange text-[13px] font-mono uppercase tracking-widest mb-2">
            Exposure Profile
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#1e1e1e" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: '#9ca3af', fontSize: 13, fontFamily: 'monospace' }}
              />
              <Radar
                name={summary.country}
                dataKey="value"
                stroke="#f97316"
                fill="#f97316"
                fillOpacity={0.15}
                strokeWidth={1.5}
              />
              <Tooltip
                contentStyle={{ background: '#111', border: '1px solid #1e1e1e', fontFamily: 'monospace', fontSize: 11 }}
                formatter={(v) => [fmt(Number(v))]}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Events for this country */}
      <div className="border-t border-bloomberg-border">
        <div className="px-6 py-3 border-b border-bloomberg-border">
          <span className="text-bloomberg-orange text-[13px] font-mono uppercase tracking-widest">
            Loss Events ({events.length})
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] font-mono">
            <thead>
              <tr className="border-b border-bloomberg-border">
                {['DATE', 'CATEGORY', 'DESCRIPTION', 'LOSS', 'SOURCE'].map(h => (
                  <th key={h} className="text-left text-bloomberg-dim px-4 py-2 font-normal text-[12px] uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {events.map((e, i) => {
                const meta = CATEGORY_META[e.category]
                return (
                  <tr key={e.id} className={`border-b border-bloomberg-border hover:bg-bloomberg-surface ${i % 2 === 0 ? '' : 'bg-black/10'}`}>
                    <td className="px-4 py-2.5 text-bloomberg-dim">{e.date}</td>
                    <td className="px-4 py-2.5">
                      <span style={{ color: meta.color }}>{meta.icon} {meta.label}</span>
                    </td>
                    <td className="px-4 py-2.5 text-bloomberg-dim max-w-xs">{e.description}</td>
                    <td className="px-4 py-2.5 text-white font-bold">{fmt(e.amount)}</td>
                    <td className="px-4 py-2.5 text-bloomberg-muted text-[12px]">{e.source}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
