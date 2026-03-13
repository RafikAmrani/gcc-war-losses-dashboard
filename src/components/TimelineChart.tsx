import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine
} from 'recharts'
import type { TimelinePoint } from '../hooks/useLosses'

interface Props {
  data: TimelinePoint[]
  loading: boolean
}

function fmt(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}B`
  return `$${n}M`
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-bloomberg-surface rounded ${className ?? ''}`} />
}

const COUNTRY_COLORS: Record<string, string> = {
  'UAE': '#f97316',
  'Saudi Arabia': '#ef4444',
  'Kuwait': '#eab308',
  'Qatar': '#8b5cf6',
  'Bahrain': '#3b82f6',
  'Oman': '#22c55e',
}

const COUNTRIES = ['UAE', 'Saudi Arabia', 'Kuwait', 'Qatar', 'Bahrain', 'Oman']

export default function TimelineChart({ data, loading }: Props) {
  return (
    <div className="bg-bloomberg-panel border border-bloomberg-border p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="text-bloomberg-orange text-[11px] font-mono uppercase tracking-widest">
          Cumulative Losses Timeline — Feb 27 – Present 2026
        </div>
        <div className="flex items-center gap-3">
          {['1W', '2W', 'ALL'].map((t, i) => (
            <button
              key={t}
              className={`text-[11px] font-mono px-2 py-0.5 ${
                i === 2
                  ? 'text-black bg-bloomberg-orange'
                  : 'text-bloomberg-dim hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Skeleton className="h-[320px] w-full" />
      ) : data.length === 0 ? (
        <div className="h-[320px] flex items-center justify-center text-bloomberg-muted font-mono text-[13px]">
          No timeline data available — start backend to load live data
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={data} margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: '#9ca3af', fontSize: 12, fontFamily: 'monospace' }}
              axisLine={{ stroke: '#1e1e1e' }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: '#9ca3af', fontSize: 13, fontFamily: 'monospace' }}
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
                fontSize: 13,
                padding: '8px 12px',
              }}
              labelStyle={{ color: '#f97316', marginBottom: 4, fontWeight: 'bold' }}
              formatter={(v, name) => [fmt(Number(v)), String(name)]}
            />
            <Legend
              formatter={(v) => <span style={{ color: '#9ca3af', fontSize: 13, fontFamily: 'monospace' }}>{v}</span>}
            />
            <ReferenceLine x="Feb 27" stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Day 1', fill: '#ef4444', fontSize: 10 }} />
            <ReferenceLine x="Mar 01" stroke="#eab308" strokeDasharray="3 3" label={{ value: 'Airports', fill: '#eab308', fontSize: 10 }} />

            {COUNTRIES.map(country => (
              <Line
                key={country}
                type="monotone"
                dataKey={country}
                stroke={COUNTRY_COLORS[country]}
                strokeWidth={1.5}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
