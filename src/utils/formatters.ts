/**
 * Format a value in millions of USD for display.
 * Rounds to 1 decimal place to avoid floating-point artifacts.
 */
export function formatMillions(value: number): string {
  const rounded = Math.round(value * 10) / 10
  if (rounded >= 1000) {
    return `$${(rounded / 1000).toFixed(2)}B`
  }
  return `$${rounded.toFixed(1)}M`
}

/**
 * Format a value already in billions of USD.
 */
export function formatBillions(value: number): string {
  return `$${(Math.round(value * 100) / 100).toFixed(2)}B`
}
