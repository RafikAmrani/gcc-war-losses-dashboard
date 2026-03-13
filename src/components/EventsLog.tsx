import { useState } from 'react'
import { CATEGORY_META, COUNTRY_FLAGS } from '../data/losses'
import type { Country, Category } from '../types'
import { ChevronDown, ChevronUp, RefreshCw } from 'lucide-react'
import { useEvents } from '../hooks/useEvents'
import { formatMillions } from '../utils/formatters'

const COUNTRIES: Country[] = ['UAE', 'Saudi Arabia', 'Kuwait', 'Qatar', 'Bahrain', 'Oman']
const CATEGORIES: Category[] = ['interceptors', 'oil_revenue', 'airports', 'airlines', 'trade', 'tourism', 'insurance', 'equity', 'fdi', 'real_estate']

const fmt = formatMillions

const CONFIDENCE_COLOR = {
  confirmed: '#22c55e',
  estimated: '#f97316',
  projected: '#8b5cf6',
}

export default function EventsLog() {
  const [filterCountry, setFilterCountry] = useState<Country | 'ALL'>('ALL')
  const [filterCategory, setFilterCategory] = useState<Category | 'ALL'>('ALL')
  const [sortField, setSortField] = useState<'date' | 'amount'>('date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const countryParam = filterCountry === 'ALL' ? undefined : filterCountry
  const categoryParam = filterCategory === 'ALL' ? undefined : filterCategory
  const { events, loading, error } = useEvents(countryParam, categoryParam)

  const sorted = [...events].sort((a, b) => {
    const av = sortField === 'date' ? new Date(a.date).getTime() : a.amount
    const bv = sortField === 'date' ? new Date(b.date).getTime() : b.amount
    return sortDir === 'desc' ? bv - av : av - bv
  })

  function toggleSort(field: 'date' | 'amount') {
    if (sortField === field) setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    else { setSortField(field); setSortDir('desc') }
  }

  const SortIcon = ({ field }: { field: 'date' | 'amount' }) => {
    if (sortField !== field) return <span className="text-bloomberg-border">↕</span>
    return sortDir === 'desc' ? <ChevronDown size={12} className="inline" /> : <ChevronUp size={12} className="inline" />
  }

  return (
    <div className="bg-bloomberg-panel border border-bloomberg-border">
      {/* Filter bar */}
      <div className="flex flex-wrap gap-px border-b border-bloomberg-border bg-bloomberg-border">
        <div className="bg-bloomberg-panel px-4 py-2 flex items-center gap-2">
          <span className="text-bloomberg-dim text-[12px] font-mono uppercase tracking-widest">Country</span>
          <select
            className="bg-transparent text-white text-[13px] font-mono outline-none cursor-pointer"
            value={filterCountry}
            onChange={e => setFilterCountry(e.target.value as Country | 'ALL')}
          >
            <option value="ALL" className="bg-bloomberg-panel">ALL</option>
            {COUNTRIES.map(c => (
              <option key={c} value={c} className="bg-bloomberg-panel">{COUNTRY_FLAGS[c]} {c}</option>
            ))}
          </select>
        </div>
        <div className="bg-bloomberg-panel px-4 py-2 flex items-center gap-2">
          <span className="text-bloomberg-dim text-[12px] font-mono uppercase tracking-widest">Category</span>
          <select
            className="bg-transparent text-white text-[13px] font-mono outline-none cursor-pointer"
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value as Category | 'ALL')}
          >
            <option value="ALL" className="bg-bloomberg-panel">ALL CATEGORIES</option>
            {CATEGORIES.map(c => (
              <option key={c} value={c} className="bg-bloomberg-panel">{CATEGORY_META[c].icon} {CATEGORY_META[c].label}</option>
            ))}
          </select>
        </div>
        <div className="ml-auto bg-bloomberg-panel px-4 py-2 flex items-center gap-2">
          {loading && <RefreshCw size={13} className="text-bloomberg-orange animate-spin" />}
          <span className="text-bloomberg-dim text-[13px] font-mono">
            {loading ? 'Loading from NewsAPI / GDELT…' : `${sorted.length} events · ${fmt(sorted.reduce((s, e) => s + e.amount, 0))} total`}
          </span>
        </div>
      </div>

      {/* Table */}
      {error ? (
        <div className="p-6 text-center text-bloomberg-red font-mono text-[13px]">
          {error} — Check backend is running and API keys are configured
        </div>
      ) : loading && sorted.length === 0 ? (
        <div className="p-6 text-center text-bloomberg-muted font-mono text-[13px] animate-pulse">
          Fetching live conflict events from NewsAPI and GDELT…
        </div>
      ) : sorted.length === 0 ? (
        <div className="p-6 text-center text-bloomberg-muted font-mono text-[13px]">
          No events found. Configure API keys in backend/.env to pull live data.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[14px] font-mono min-w-[800px]">
            <thead>
              <tr className="border-b border-bloomberg-border">
                {[
                  { label: 'DATE', field: 'date' as const },
                  { label: 'COUNTRY', field: null },
                  { label: 'CATEGORY', field: null },
                  { label: 'DESCRIPTION', field: null },
                  { label: 'LOSS (USD)', field: 'amount' as const },
                  { label: 'CONFIDENCE', field: null },
                  { label: 'SOURCE', field: null },
                ].map(h => (
                  <th
                    key={h.label}
                    className={`text-left text-bloomberg-dim px-4 py-2.5 font-normal text-[12px] uppercase tracking-widest ${h.field ? 'cursor-pointer hover:text-white' : ''}`}
                    onClick={() => h.field && toggleSort(h.field)}
                  >
                    {h.label} {h.field && <SortIcon field={h.field} />}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((e, i) => {
                const meta = CATEGORY_META[e.category]
                return (
                  <tr
                    key={e.id}
                    className={`border-b border-bloomberg-border hover:bg-bloomberg-surface ${i % 2 === 0 ? '' : 'bg-black/10'}`}
                  >
                    <td className="px-4 py-2.5 text-bloomberg-dim">{e.date}</td>
                    <td className="px-4 py-2.5">
                      <span className="mr-1">{COUNTRY_FLAGS[e.country as Country]}</span>
                      <span className="text-white">{e.country}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 border text-[12px]"
                        style={{ borderColor: meta.color + '40', color: meta.color }}>
                        {meta.icon} {meta.label}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-bloomberg-dim max-w-xs">
                      <span className="line-clamp-2">{e.description}</span>
                    </td>
                    <td className="px-4 py-2.5 text-white font-bold">{fmt(e.amount)}</td>
                    <td className="px-4 py-2.5">
                      <span
                        className="text-[12px] uppercase tracking-wider"
                        style={{ color: CONFIDENCE_COLOR[e.confidence] }}
                      >
                        ● {e.confidence}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-bloomberg-muted text-[12px] max-w-[120px] truncate">
                      {e.source}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
