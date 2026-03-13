import { useState, useEffect } from 'react'
import { apiFetch } from '../api/client'
import type { CountrySummary } from '../types'

export interface OilPrice {
  price: number
  baseline: number
  change: number
  date: string
  unit: string
  source: string
}

export interface LossSummary {
  totalLoss: number
  conflictDays: number
  lastUpdated: string
  oilPrice: OilPrice | null
  countries: CountrySummary[]
}

export interface TimelinePoint {
  date: string
  [country: string]: number | string
}

interface State {
  summary: LossSummary | null
  timeline: TimelinePoint[]
  loading: boolean
  error: string | null
}

export function useLosses() {
  const [state, setState] = useState<State>({
    summary: null,
    timeline: [],
    loading: true,
    error: null,
  })

  useEffect(() => {
    let cancelled = false

    async function load() {
      setState(s => ({ ...s, loading: true, error: null }))
      try {
        const [summary, timeline] = await Promise.all([
          apiFetch<LossSummary>('/api/losses/summary'),
          apiFetch<TimelinePoint[]>('/api/losses/timeline'),
        ])
        if (!cancelled) {
          setState({ summary, timeline, loading: false, error: null })
        }
      } catch (err) {
        if (!cancelled) {
          setState(s => ({
            ...s,
            loading: false,
            error: err instanceof Error ? err.message : 'Failed to load data',
          }))
        }
      }
    }

    load()
    // Refresh every 5 minutes
    const interval = setInterval(load, 5 * 60 * 1000)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  return state
}
