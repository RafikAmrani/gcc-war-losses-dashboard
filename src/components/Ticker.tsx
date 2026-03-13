import { TICKER_ITEMS, CATEGORY_META } from '../data/losses'

function fmt(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}B`
  return `$${n}M`
}

export default function Ticker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS] // doubled for seamless loop

  return (
    <div className="bg-black border-b border-bloomberg-border overflow-hidden">
      <div className="flex items-center">
        <div className="shrink-0 bg-bloomberg-orange text-black text-[11px] font-bold px-3 py-1.5 uppercase tracking-widest z-10">
          LIVE
        </div>
        <div className="overflow-hidden flex-1">
          <div className="ticker-content inline-flex gap-0">
            {items.map((item, i) => {
              const meta = CATEGORY_META[item.category]
              const up = item.change > 0
              return (
                <span
                  key={i}
                  className="inline-flex items-center gap-2 px-5 py-1.5 border-r border-bloomberg-border text-[12px] font-mono"
                >
                  <span className="text-bloomberg-dim">{item.label}</span>
                  <span className="text-white font-semibold">{fmt(item.amount)}</span>
                  <span className={up ? 'text-bloomberg-red' : 'text-bloomberg-green'}>
                    {up ? '▲' : '▼'} {Math.abs(item.change)}%
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
