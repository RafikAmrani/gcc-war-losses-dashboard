import { useState } from 'react'
import type { CountrySummary, Category, CalcBreakdown } from '../types'
import { CATEGORY_META } from '../data/losses'
import { useEvents } from '../hooks/useEvents'
import { formatMillions } from '../utils/formatters'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip
} from 'recharts'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface Props {
  summary: CountrySummary
}

const fmt = formatMillions

const CATEGORIES: Category[] = [
  'interceptors', 'oil_revenue', 'airports', 'airlines',
  'trade', 'tourism', 'insurance', 'equity', 'fdi', 'real_estate',
]

function BreakdownPanel({ bd, color }: { bd: CalcBreakdown; color: string }) {
  return (
    <div className="mt-1 mb-2 border border-bloomberg-border bg-black/40 p-4 rounded-sm font-mono text-[12px]">
      {/* Formula */}
      <div className="mb-3">
        <span className="text-bloomberg-muted uppercase tracking-widest text-[10px]">Formula · </span>
        <span className="text-bloomberg-text">{bd.formula}</span>
      </div>

      {/* Inputs grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-0.5 mb-3 border-b border-bloomberg-border pb-3">
        {Object.entries(bd.inputs).map(([key, val]) => (
          <div key={key} className="flex justify-between gap-4 py-0.5">
            <span className="text-bloomberg-muted truncate">{key}</span>
            <span className="text-bloomberg-dim font-semibold shrink-0">{val}</span>
          </div>
        ))}
      </div>

      {/* Steps */}
      <div className="space-y-1">
        {bd.steps.map((step, i) => (
          <div key={i} className="flex justify-between gap-4">
            <span className="text-bloomberg-muted">
              <span className="text-bloomberg-border mr-1">›</span>
              Step {i + 1}: {step.label}
            </span>
            <span className="text-bloomberg-dim font-semibold shrink-0">{step.value}</span>
          </div>
        ))}
        <div
          className="flex justify-between items-center pt-2 mt-1 border-t border-bloomberg-border text-[13px]"
          style={{ borderColor: color + '40' }}
        >
          <span className="font-bold uppercase tracking-wider" style={{ color }}>
            = Estimated Loss
          </span>
          <span className="text-white font-bold text-[15px]">{fmt(bd.result)}</span>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-3 pt-2 border-t border-bloomberg-border/40 text-bloomberg-muted text-[10px] uppercase tracking-widest">
        ⚠ Parametric model · Figures are estimates based on public data, not official statistics
      </div>
    </div>
  )
}

export default function CountryDetail({ summary }: Props) {
  const { events, loading } = useEvents(summary.country)
  const [expandedCat, setExpandedCat] = useState<Category | null>(null)

  const catMax = Math.max(...CATEGORIES.map(c => summary.byCategory[c] || 0))

  const radarData = CATEGORIES.map(cat => ({
    subject: CATEGORY_META[cat].label.split(' ')[0],
    value: summary.byCategory[cat] || 0,
    fullMark: catMax,
  }))

  return (
    <div className="bg-bloomberg-panel border border-bloomberg-border">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-bloomberg-border">
        <div className="flex items-center gap-3">
          <span className="text-[40px]">{summary.flag}</span>
          <div>
            <h2 className="text-white text-[24px] font-bold leading-none">{summary.country}</h2>
            <p className="text-bloomberg-dim text-[14px] font-mono mt-1">US-Iran War Economic Damage Report</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-bloomberg-orange text-[12px] font-mono uppercase tracking-widest">Total Loss</div>
          <div className="text-white text-[32px] font-bold font-mono">{fmt(summary.totalLoss)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
        {/* Category breakdown — clickable rows */}
        <div className="p-6 border-r border-bloomberg-border">
          <div className="flex items-center justify-between mb-4">
            <div className="text-bloomberg-orange text-[13px] font-mono uppercase tracking-widest">
              Loss by Category
            </div>
            {summary.calcBreakdown && (
              <div className="text-bloomberg-muted text-[11px] font-mono uppercase tracking-widest">
                Click row to see formula
              </div>
            )}
          </div>

          <div className="space-y-0">
            {CATEGORIES.map(cat => {
              const val = summary.byCategory[cat] || 0
              if (val === 0) return null
              const meta  = CATEGORY_META[cat]
              const pct   = (val / summary.totalLoss) * 100
              const bd    = summary.calcBreakdown?.[cat]
              const isOpen = expandedCat === cat

              return (
                <div key={cat}>
                  <button
                    onClick={() => setExpandedCat(isOpen ? null : cat)}
                    className={`w-full text-left py-2 px-2 -mx-2 rounded-sm transition-colors ${
                      bd
                        ? 'hover:bg-bloomberg-surface cursor-pointer'
                        : 'cursor-default'
                    } ${isOpen ? 'bg-bloomberg-surface' : ''}`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-1.5">
                        {bd
                          ? (isOpen
                              ? <ChevronDown size={13} className="text-bloomberg-orange shrink-0" />
                              : <ChevronRight size={13} className="text-bloomberg-muted shrink-0" />)
                          : <span className="w-[13px]" />
                        }
                        <span className="text-bloomberg-text text-[14px] font-mono">{meta.icon} {meta.label}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-bloomberg-dim text-[13px] font-mono">{pct.toFixed(1)}%</span>
                        <span className="text-white font-bold font-mono text-[15px] w-20 text-right">{fmt(val)}</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-bloomberg-border rounded-full overflow-hidden ml-[21px]">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: meta.color }}
                      />
                    </div>
                  </button>

                  {isOpen && bd && (
                    <BreakdownPanel bd={bd} color={meta.color} />
                  )}
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
                contentStyle={{
                  background: '#111', border: '1px solid #1e1e1e',
                  fontFamily: 'monospace', fontSize: 11,
                }}
                formatter={(v) => [fmt(Number(v))]}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Events table */}
      <div className="border-t border-bloomberg-border">
        <div className="px-6 py-3 border-b border-bloomberg-border flex items-center justify-between">
          <span className="text-bloomberg-orange text-[13px] font-mono uppercase tracking-widest">
            Loss Events ({loading ? '...' : events.length})
          </span>
          {loading && (
            <span className="text-bloomberg-dim text-[12px] font-mono animate-pulse">
              Loading from NewsAPI / GDELT...
            </span>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] font-mono">
            <thead>
              <tr className="border-b border-bloomberg-border">
                {['DATE', 'CATEGORY', 'DESCRIPTION', 'LOSS', 'SOURCE'].map(h => (
                  <th
                    key={h}
                    className="text-left text-bloomberg-dim px-4 py-2 font-normal text-[12px] uppercase tracking-widest"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {events.map((e, i) => {
                const meta = CATEGORY_META[e.category as Category]
                return (
                  <tr
                    key={e.id}
                    className={`border-b border-bloomberg-border hover:bg-bloomberg-surface ${
                      i % 2 === 0 ? '' : 'bg-black/10'
                    }`}
                  >
                    <td className="px-4 py-2.5 text-bloomberg-dim">{e.date}</td>
                    <td className="px-4 py-2.5">
                      <span style={{ color: meta?.color }}>{meta?.icon} {meta?.label}</span>
                    </td>
                    <td className="px-4 py-2.5 text-bloomberg-dim max-w-xs">{e.description}</td>
                    <td className="px-4 py-2.5 text-white font-bold">{fmt(e.amount)}</td>
                    <td className="px-4 py-2.5 text-bloomberg-muted text-[12px]">{e.source}</td>
                  </tr>
                )
              })}
              {!loading && events.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-bloomberg-muted text-[13px]">
                    No events found. Configure API keys to pull live data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
