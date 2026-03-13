export type Category =
  | 'interceptors'
  | 'oil_revenue'
  | 'airports'
  | 'airlines'
  | 'trade'
  | 'tourism'
  | 'insurance'
  | 'equity'
  | 'fdi'
  | 'real_estate'

export type Country = 'UAE' | 'Saudi Arabia' | 'Kuwait' | 'Qatar' | 'Bahrain' | 'Oman'

export interface LossEvent {
  id: string
  date: string           // ISO date
  country: Country
  category: Category
  amount: number         // USD millions
  description: string
  source: string
  confidence: 'confirmed' | 'estimated' | 'projected'
}

export interface CountrySummary {
  country: Country
  flag: string
  totalLoss: number      // USD millions
  byCategory: Record<Category, number>
  trend: 'up' | 'down' | 'stable'
  lastUpdated: string
}

export interface CategoryMeta {
  id: Category
  label: string
  color: string
  icon: string
  description: string
}

export interface TickerItem {
  country: Country
  category: Category
  amount: number
  change: number         // percentage change vs previous period
  label: string
}
