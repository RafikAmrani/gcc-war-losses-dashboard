import { useState, useEffect } from 'react'
import { apiFetch } from '../api/client'
import type { LossEvent } from '../types'

interface State {
  events: LossEvent[]
  loading: boolean
  error: string | null
}

export function useEvents(country?: string, category?: string) {
  const [state, setState] = useState<State>({
    events: [],
    loading: true,
    error: null,
  })

  useEffect(() => {
    let cancelled = false

    async function load() {
      setState(s => ({ ...s, loading: true, error: null }))
      try {
        const params = new URLSearchParams()
        if (country && country !== 'ALL') params.set('country', country)
        if (category && category !== 'ALL') params.set('category', category)
        const url = `/api/events${params.toString() ? '?' + params : ''}`
        const events = await apiFetch<LossEvent[]>(url)
        if (!cancelled) {
          setState({ events, loading: false, error: null })
        }
      } catch (err) {
        if (!cancelled) {
          setState(s => ({
            ...s,
            loading: false,
            error: err instanceof Error ? err.message : 'Failed to load events',
          }))
        }
      }
    }

    load()
    const interval = setInterval(load, 5 * 60 * 1000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [country, category])

  return state
}
