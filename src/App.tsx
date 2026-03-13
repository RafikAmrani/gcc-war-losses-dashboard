import { useState } from 'react'
import './index.css'
import Ticker from './components/Ticker'
import CountryCard from './components/CountryCard'
import CountryDetail from './components/CountryDetail'
import CategoryBreakdown from './components/CategoryBreakdown'
import TimelineChart from './components/TimelineChart'
import EventsLog from './components/EventsLog'
import { COUNTRY_SUMMARIES, TOTAL_LOSS, CATEGORY_META } from './data/losses'
import type { CountrySummary, Category } from './types'
import { BarChart2, Globe, List, Clock, AlertTriangle } from 'lucide-react'

type Tab = 'overview' | 'countries' | 'categories' | 'timeline' | 'events'

function fmt(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(2)}B`
  return `$${n}M`
}

const TABS: { id: Tab; label: string; icon: typeof Globe }[] = [
  { id: 'overview', label: 'OVERVIEW', icon: Globe },
  { id: 'countries', label: 'BY COUNTRY', icon: Globe },
  { id: 'categories', label: 'BY CATEGORY', icon: BarChart2 },
  { id: 'timeline', label: 'TIMELINE', icon: Clock },
  { id: 'events', label: 'EVENTS LOG', icon: List },
]

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [selectedCountry, setSelectedCountry] = useState<CountrySummary | null>(null)

  const sorted = [...COUNTRY_SUMMARIES].sort((a, b) => b.totalLoss - a.totalLoss)

  return (
    <div className="min-h-screen bg-bloomberg-bg text-bloomberg-text">
      {/* Ticker */}
      <Ticker />

      {/* Header */}
      <header className="bg-black border-b border-bloomberg-border">
        <div className="flex items-center justify-between px-4 py-2 border-b border-bloomberg-border">
          <div className="flex items-center gap-3">
            <div className="text-bloomberg-orange text-[13px] font-bold tracking-[0.2em] uppercase">
              GCC WAR COST TRACKER
            </div>
            <div className="w-px h-4 bg-bloomberg-border" />
            <div className="text-bloomberg-dim text-[13px] font-mono">US–IRAN CONFLICT · ECONOMIC IMPACT DASHBOARD</div>
          </div>
          <div className="flex items-center gap-4 text-[13px] font-mono text-bloomberg-dim">
            <span className="flex items-center gap-1">
              <AlertTriangle size={13} className="text-bloomberg-orange" />
              ESTIMATES BASED ON PUBLIC DATA
            </span>
            <span className="text-bloomberg-dim">|</span>
            <span>LAST UPDATE: 12 JUN 2025 · 18:42 UTC</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-bloomberg-green animate-pulse inline-block" />
              LIVE
            </span>
          </div>
        </div>

        <div className="px-6 py-4">
          <div className="flex items-end justify-between mb-4">
            <div>
              <h1 className="text-[26px] font-bold text-white leading-none tracking-tight">
                GCC Countries — War Economic Losses
              </h1>
              <p className="text-bloomberg-dim text-[12px] mt-1 font-mono">
                Cumulative financial impact attributable to US–Iran military conflict · Apr–Jun 2025
              </p>
            </div>
            <div className="text-right">
              <div className="text-bloomberg-orange text-[12px] font-mono uppercase tracking-widest mb-1">
                TOTAL ESTIMATED LOSS (6 COUNTRIES)
              </div>
              <div className="text-[42px] font-bold font-mono text-white leading-none">
                {fmt(TOTAL_LOSS)}
              </div>
              <div className="text-bloomberg-red text-[13px] font-mono mt-1">▲ LOSSES STILL ACCUMULATING</div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-0 border-b border-bloomberg-border">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSelectedCountry(null) }}
                className={`px-5 py-2 text-[14px] font-mono tracking-wider border-r border-bloomberg-border transition-colors ${
                  activeTab === tab.id
                    ? 'text-black bg-bloomberg-orange font-bold'
                    : 'text-bloomberg-dim hover:text-white hover:bg-bloomberg-surface'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="p-6 space-y-6">

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-bloomberg-border">
              {sorted.map((c, i) => (
                <div key={c.country} className="bg-bloomberg-panel px-4 py-3">
                  <div className="text-bloomberg-dim text-[13px] font-mono uppercase tracking-wider">{c.flag} {c.country}</div>
                  <div className="text-white font-bold font-mono text-[20px] mt-1">{fmt(c.totalLoss)}</div>
                  <div className="text-bloomberg-muted text-[13px] font-mono mt-0.5">Rank #{i + 1}</div>
                </div>
              ))}
            </div>

            {/* Category top row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-bloomberg-border">
              {(['oil_revenue', 'trade', 'airlines', 'interceptors'] as Category[]).map(cat => {
                const total = COUNTRY_SUMMARIES.reduce((s, c) => s + (c.byCategory[cat] || 0), 0)
                const meta = CATEGORY_META[cat]
                return (
                  <div key={cat} className="bg-bloomberg-panel p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[20px]">{meta.icon}</span>
                      <span className="text-bloomberg-dim text-[13px] font-mono uppercase tracking-wider">{meta.label}</span>
                    </div>
                    <div className="text-white font-bold font-mono text-[22px]">{fmt(total)}</div>
                    <div className="mt-2 h-0.5 rounded-full" style={{ background: meta.color }} />
                  </div>
                )
              })}
            </div>

            {/* Timeline + Country grid */}
            <TimelineChart />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-bloomberg-border">
              {sorted.map((c, i) => (
                <CountryCard
                  key={c.country}
                  summary={c}
                  rank={i + 1}
                  active={selectedCountry?.country === c.country}
                  onClick={() => {
                    setSelectedCountry(c)
                    setActiveTab('countries')
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* BY COUNTRY */}
        {activeTab === 'countries' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-px bg-bloomberg-border h-fit">
              {sorted.map((c, i) => (
                <CountryCard
                  key={c.country}
                  summary={c}
                  rank={i + 1}
                  active={selectedCountry?.country === c.country}
                  onClick={() => setSelectedCountry(c)}
                />
              ))}
            </div>
            <div className="xl:col-span-2">
              {selectedCountry
                ? <CountryDetail summary={selectedCountry} />
                : (
                  <div className="bg-bloomberg-panel border border-bloomberg-border h-64 flex items-center justify-center">
                    <p className="text-bloomberg-muted font-mono text-[13px]">← Select a country to view detailed breakdown</p>
                  </div>
                )
              }
            </div>
          </div>
        )}

        {/* BY CATEGORY */}
        {activeTab === 'categories' && <CategoryBreakdown />}

        {/* TIMELINE */}
        {activeTab === 'timeline' && (
          <div className="space-y-6">
            <TimelineChart />
            <div className="bg-bloomberg-panel border border-bloomberg-border p-4">
              <div className="text-bloomberg-orange text-[13px] font-mono uppercase tracking-widest mb-3">Key Events</div>
              <div className="space-y-2 font-mono text-[14px]">
                {[
                  { date: 'Apr 15', event: 'US strike on Iranian nuclear facilities — GCC air defenses activated', impact: 'HIGH' },
                  { date: 'Apr 16', event: 'Iran retaliatory missile barrage — Patriot/THAAD intercepts across 5 GCC states', impact: 'CRITICAL' },
                  { date: 'Apr 18', event: 'Strait of Hormuz partial closure — Aramco and QatarEnergy force majeure', impact: 'HIGH' },
                  { date: 'Apr 20', event: 'Mass airport shutdowns across UAE, KSA, Kuwait, Qatar, Bahrain', impact: 'HIGH' },
                  { date: 'Apr 22', event: 'Airline route suspensions confirmed — Emirates, Saudia, Qatar Airways, Kuwait Airways', impact: 'HIGH' },
                  { date: 'May 01', event: 'Shipping insurance war-risk premiums spike 8x baseline — Hormuz corridor', impact: 'MEDIUM' },
                  { date: 'May 10', event: 'Regional stock markets record worst single-week since 2008', impact: 'HIGH' },
                  { date: 'May 20', event: 'Partial shipping resumption — tanker convoys with naval escort', impact: 'MEDIUM' },
                  { date: 'Jun 01', event: 'IMF revises GCC GDP forecasts down 3.2% — war impact assessment', impact: 'HIGH' },
                ].map(e => (
                  <div key={e.date} className="flex items-start gap-4 py-2 border-b border-bloomberg-border">
                    <span className="text-bloomberg-orange w-14 shrink-0">{e.date}</span>
                    <span className="text-bloomberg-text flex-1">{e.event}</span>
                    <span className={`shrink-0 text-[12px] px-2 py-0.5 ${
                      e.impact === 'CRITICAL' ? 'bg-bloomberg-red/20 text-bloomberg-red' :
                      e.impact === 'HIGH' ? 'bg-bloomberg-orange/20 text-bloomberg-orange' :
                      'bg-bloomberg-border text-bloomberg-dim'
                    }`}>{e.impact}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* EVENTS LOG */}
        {activeTab === 'events' && <EventsLog />}

      </main>

      {/* Footer */}
      <footer className="border-t border-bloomberg-border px-6 py-3 mt-8">
        <div className="flex items-center justify-between text-[12px] font-mono text-bloomberg-muted">
          <span>GCC WAR COST TRACKER · DATA FOR INFORMATIONAL PURPOSES ONLY · ESTIMATES BASED ON PUBLIC SOURCES</span>
          <span>SOURCES: IATA · BLOOMBERG COMMODITIES · IISS · ARAMCO · QATARENERGY · DP WORLD · LLOYD'S · IMF</span>
        </div>
      </footer>
    </div>
  )
}
