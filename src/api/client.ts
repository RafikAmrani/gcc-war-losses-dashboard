/**
 * Thin fetch wrapper that handles JSON parsing and errors.
 * All backend calls go through this to keep components simple.
 */

export async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(path)
  if (!res.ok) {
    throw new Error(`API ${path} returned ${res.status}`)
  }
  return res.json() as Promise<T>
}
