/**
 * Thin fetch wrapper that handles JSON parsing and errors.
 * In dev: Vite proxy forwards /api → localhost:8000
 * In prod: VITE_API_BASE_URL points to Railway backend
 */

const BASE = (import.meta.env.VITE_API_BASE_URL as string) ?? ""

export async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) {
    throw new Error(`API ${path} returned ${res.status}`)
  }
  return res.json() as Promise<T>
}
