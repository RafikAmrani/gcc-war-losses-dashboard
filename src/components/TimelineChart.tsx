import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine
} from 'recharts'
import { TIMELINE_DATA, COUNTRY_SUMMARIES } from '../data/losses'

function fmt(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}B`
  return `$${n}M`
}

const COUNTRY_COLORS: Record<string, string> = {
  'UAE': '#f97316',
  'Saudi Arabia': '#ef4444',
  'Kuwait': '#eab308',
  'Qatar': '#8b5cf6',
  'Bahrain': '#3b82f6',
  'Oman': '#22c55e',
}

export default function TimelineChart() {
  return (
    <div className="bg-bloomberg-panel border border-bloomberg-border p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="text-bloomberg-orange text-[11px] font-mono uppercase tracking-widest">
          Cumulative Losses Timeline — Apr–Jun 2025
        </div>
        <div className="flex items-center gap-3">
          {['1W', '1M', '3M', 'ALL'].map((t, i) => (
            <button
              key={t}
              className={`text-[11px] font-mono px-2 py-0.5 ${
                i === 3
                  ? 'text-black bg-bloomberg-orange'
                  : 'text-bloomberg-dim hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={TIMELINE_DATA} margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: '#9ca3af', fontSize: 11, fontFamily: 'monospace' }}
            axisLine={{ stroke: '#1e1e1e' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#9ca3af', fontSize: 11, fontFamily: 'monospace' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => `$${(v / 1000).toFixed(0)}B`}
          />
          <Tooltip
            contentStyle={{
              background: '#111',
              border: '1px solid #1e1e1e',
              borderRadius: 0,
              fontFamily: 'monospace',
              fontSize: 11,
              padding: '8px 12px',
            }}
            labelStyle={{ color: '#f97316', marginBottom: 4, fontWeight: 'bold' }}
            formatter={(v, name) => [fmt(Number(v)), String(name)]}
          />
          <Legend
            formatter={(v) => <span style={{ color: '#9ca3af', fontSize: 11, fontFamily: 'monospace' }}>{v}</span>}
          />
          {/* Key event markers */}
          <ReferenceLine x="Apr 15" stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'War Start', fill: '#ef4444', fontSize: 10 }} />
          <ReferenceLine x="Apr 20" stroke="#eab308" strokeDasharray="3 3" label={{ value: 'Airport Closures', fill: '#eab308', fontSize: 10 }} />

          {COUNTRY_SUMMARIES.map(c => (
            <Line
              key={c.country}
              type="monotone"
              dataKey={c.country}
              stroke={COUNTRY_COLORS[c.country]}
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
