import { TOTAL_LOSS } from '../data/losses'
import { Clock } from 'lucide-react'

function fmt(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(2)}B`
  return `$${n}M`
}

export default function Header() {
  return (
    <header className="bg-black border-b border-bloomberg-border">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-bloomberg-border">
        <div className="flex items-center gap-3">
          <div className="text-bloomberg-orange text-[11px] font-bold tracking-[0.2em] uppercase">
            GCC WAR COST TRACKER
          </div>
          <div className="w-px h-4 bg-bloomberg-border" />
          <div className="text-bloomberg-dim text-[11px] font-mono">US–IRAN CONFLICT ECONOMIC IMPACT</div>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-mono text-bloomberg-dim">
          <span className="flex items-center gap-1">
            <Clock size={11} />
            LAST UPDATE: 12 JUN 2025 · 18:42 UTC
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-bloomberg-green animate-pulse inline-block" />
            LIVE
          </span>
        </div>
      </div>

      {/* Main headline */}
      <div className="px-6 py-4">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-[28px] font-bold text-white leading-none tracking-tight">
              GCC Economic Losses
            </h1>
            <p className="text-bloomberg-dim text-[13px] mt-1 font-mono">
              Cumulative losses attributable to US–Iran military conflict, Apr–Jun 2025
            </p>
          </div>
          <div className="text-right">
            <div className="text-bloomberg-orange text-[11px] font-mono uppercase tracking-widest mb-1">
              Total Estimated Loss
            </div>
            <div className="text-[40px] font-bold font-mono text-white leading-none">
              {fmt(TOTAL_LOSS)}
            </div>
            <div className="flex items-center gap-2 justify-end mt-1">
              <span className="text-bloomberg-red text-[13px] font-mono">▲ +$420M since yesterday</span>
            </div>
          </div>
        </div>

        {/* Navigation tabs */}
        <div className="flex gap-0 mt-4 border-b border-bloomberg-border">
          {['OVERVIEW', 'BY COUNTRY', 'BY CATEGORY', 'TIMELINE', 'EVENTS LOG'].map((tab, i) => (
            <button
              key={tab}
              className={`px-5 py-2 text-[12px] font-mono tracking-wider border-r border-bloomberg-border transition-colors ${
                i === 0
                  ? 'text-black bg-bloomberg-orange font-bold'
                  : 'text-bloomberg-dim hover:text-white hover:bg-bloomberg-surface'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
    </header>
  )
}
