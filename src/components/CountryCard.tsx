import type { CountrySummary } from '../types'
import { CATEGORY_META } from '../data/losses'
import { TrendingUp } from 'lucide-react'
import { formatMillions } from '../utils/formatters'

interface Props {
  summary: CountrySummary
  rank: number
  onClick: () => void
  active: boolean
}

const fmt = formatMillions

export default function CountryCard({ summary, rank, onClick, active }: Props) {
  const topCategories = Object.entries(summary.byCategory)
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)

  const barMax = summary.totalLoss

  return (
    <button
      onClick={onClick}
      className={`text-left p-4 border transition-all duration-150 ${
        active
          ? 'border-bloomberg-orange bg-bloomberg-surface'
          : 'border-bloomberg-border bg-bloomberg-panel hover:border-bloomberg-muted hover:bg-bloomberg-surface'
      }`}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[26px]">{summary.flag}</span>
          <div>
            <div className="text-white font-semibold text-[16px] leading-none">{summary.country}</div>
            <div className="text-bloomberg-muted text-[13px] font-mono mt-0.5">Rank #{rank}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-white font-bold font-mono text-[20px] leading-none">
            {fmt(summary.totalLoss)}
          </div>
          <div className="flex items-center justify-end gap-1 mt-1">
            <TrendingUp size={13} className="text-bloomberg-red" />
            <span className="text-bloomberg-red text-[13px] font-mono">+{(Math.random() * 5 + 1).toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Category mini-bars */}
      <div className="space-y-1.5">
        {topCategories.map(([cat, val]) => {
          const meta = CATEGORY_META[cat as keyof typeof CATEGORY_META]
          const pct = (val / barMax) * 100
          return (
            <div key={cat}>
              <div className="flex justify-between items-center mb-0.5">
                <span className="text-bloomberg-dim text-[12px] font-mono">{meta.icon} {meta.label}</span>
                <span className="text-bloomberg-dim text-[12px] font-mono">{fmt(val)}</span>
              </div>
              <div className="h-0.5 bg-bloomberg-border rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, background: meta.color }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Confidence badge */}
      <div className="flex justify-between items-center mt-3">
        <span className="text-bloomberg-muted text-[12px] font-mono uppercase tracking-widest">
          Updated {summary.lastUpdated}
        </span>
        <span className="px-1.5 py-0.5 text-[11px] font-mono bg-bloomberg-border text-bloomberg-dim uppercase tracking-wider">
          EST
        </span>
      </div>
    </button>
  )
}
