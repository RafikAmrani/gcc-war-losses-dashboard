/**
 * Static UI metadata only.
 * All financial data is served by the FastAPI backend at /api/*
 */

import type { CategoryMeta, Country, Category } from '../types'

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  interceptors: {
    id: 'interceptors',
    label: 'Missile Interceptors',
    color: '#ef4444',
    icon: '🎯',
    description: 'Cost of Patriot/THAAD intercepts, Iron Dome deployments, and defense asset expenditure',
  },
  oil_revenue: {
    id: 'oil_revenue',
    label: 'Oil Revenue Lost',
    color: '#f97316',
    icon: '🛢️',
    description: 'Lost oil sales due to shipping disruptions, sanctions, and reduced demand from conflict risk',
  },
  airports: {
    id: 'airports',
    label: 'Airport Halting',
    color: '#eab308',
    icon: '✈️',
    description: 'Airport closures, rerouting costs, cargo disruption, and aviation infrastructure damage',
  },
  airlines: {
    id: 'airlines',
    label: 'Airline Suspensions',
    color: '#8b5cf6',
    icon: '🛫',
    description: 'Revenue lost from suspended routes, aircraft repositioning, and passenger cancellations',
  },
  trade: {
    id: 'trade',
    label: 'Trade Disruption',
    color: '#3b82f6',
    icon: '🚢',
    description: 'Strait of Hormuz detour costs, port delays, and supply chain disruptions',
  },
  tourism: {
    id: 'tourism',
    label: 'Tourism Decline',
    color: '#06b6d4',
    icon: '🏨',
    description: 'Hotel occupancy drops, cancelled events, and reduced visitor spend',
  },
  insurance: {
    id: 'insurance',
    label: 'Insurance Premiums',
    color: '#10b981',
    icon: '📋',
    description: 'Spiked war-risk insurance premiums on shipping, aviation, and energy infrastructure',
  },
  equity: {
    id: 'equity',
    label: 'Equity Markets',
    color: '#f43f5e',
    icon: '📉',
    description: 'Stock market decline on Tadawul, DFM, ADX, QSE and other GCC exchanges (free-float adjusted)',
  },
  fdi: {
    id: 'fdi',
    label: 'FDI Freeze',
    color: '#a855f7',
    icon: '🏦',
    description: 'Foreign direct investment cancellations, project delays, and capital flight over 3-month horizon',
  },
  real_estate: {
    id: 'real_estate',
    label: 'Real Estate',
    color: '#64748b',
    icon: '🏗️',
    description: 'Property transaction slowdown, developer delays, and falling valuations in Gulf markets',
  },
}

export const COUNTRY_FLAGS: Record<Country, string> = {
  'UAE': '🇦🇪',
  'Saudi Arabia': '🇸🇦',
  'Kuwait': '🇰🇼',
  'Qatar': '🇶🇦',
  'Bahrain': '🇧🇭',
  'Oman': '🇴🇲',
}
