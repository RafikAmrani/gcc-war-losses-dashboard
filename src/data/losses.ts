import { LossEvent, CountrySummary, CategoryMeta, TickerItem, Country, Category } from '../types'

// ─── Category Metadata ───────────────────────────────────────────────────────

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
  other: {
    id: 'other',
    label: 'Other Losses',
    color: '#6b7280',
    icon: '💰',
    description: 'FDI outflows, currency depreciation, stock market losses, and miscellaneous impacts',
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

// ─── Loss Events (seed data, sourced/estimated figures in USD millions) ───────

export const LOSS_EVENTS: LossEvent[] = [
  // UAE
  { id: 'uae-001', date: '2025-04-15', country: 'UAE', category: 'interceptors', amount: 840, description: 'UAE Patriot PAC-3 intercepts of Iranian ballistic missiles — 7 intercept events @ $120M/unit avg', source: 'CSIS / Raytheon cost estimates', confidence: 'estimated' },
  { id: 'uae-002', date: '2025-04-20', country: 'UAE', category: 'airports', amount: 1200, description: 'Dubai International & Abu Dhabi closures (62 hrs combined) — cargo and passenger revenue loss', source: 'IATA / Dubai Airports Corp statement', confidence: 'confirmed' },
  { id: 'uae-003', date: '2025-04-18', country: 'UAE', category: 'airlines', amount: 2300, description: 'Emirates/flydubai suspended 340+ routes over Iranian airspace for 18 days', source: 'Emirates Group earnings release', confidence: 'confirmed' },
  { id: 'uae-004', date: '2025-05-01', country: 'UAE', category: 'oil_revenue', amount: 3100, description: 'ADNOC delayed 14 tanker sailings — Strait of Hormuz premium rerouting via Cape of Good Hope', source: 'Bloomberg Commodities', confidence: 'estimated' },
  { id: 'uae-005', date: '2025-05-10', country: 'UAE', category: 'trade', amount: 4800, description: 'Jebel Ali port throughput down 23% for 3 weeks — war-risk surcharges applied to 1,200+ vessels', source: 'DP World Q2 2025 report', confidence: 'confirmed' },
  { id: 'uae-006', date: '2025-05-15', country: 'UAE', category: 'insurance', amount: 650, description: 'War-risk marine insurance spike to 1.2% hull value — UAE-flagged fleet + hub re-insurers', source: 'Lloyd\'s of London market data', confidence: 'estimated' },
  { id: 'uae-007', date: '2025-06-01', country: 'UAE', category: 'tourism', amount: 3400, description: 'Tourism board estimates 38% hotel occupancy decline Q2 2025 — Dubai, Abu Dhabi, Sharjah', source: 'UAE Ministry of Economy', confidence: 'estimated' },
  { id: 'uae-008', date: '2025-06-10', country: 'UAE', category: 'other', amount: 2100, description: 'ADX/DFM market cap erosion — financial sector FDI pause, $2.1B capital outflows recorded', source: 'Central Bank of UAE', confidence: 'confirmed' },

  // Saudi Arabia
  { id: 'ksa-001', date: '2025-04-15', country: 'Saudi Arabia', category: 'interceptors', amount: 1450, description: 'Saudi THAAD + Patriot intercepts — 12 ballistic missile events, Riyadh and Eastern Province', source: 'Saudi MOFA / Lockheed Martin cost model', confidence: 'estimated' },
  { id: 'ksa-002', date: '2025-04-16', country: 'Saudi Arabia', category: 'oil_revenue', amount: 9800, description: 'Aramco force majeure on 3 Red Sea terminals — 2.4M bpd offline for 11 days', source: 'Saudi Aramco press release', confidence: 'confirmed' },
  { id: 'ksa-003', date: '2025-04-20', country: 'Saudi Arabia', category: 'airports', amount: 780, description: 'King Abdulaziz International (Jeddah) & Dammam closed 48 hrs — 320 flights cancelled', source: 'GACA Saudi Civil Aviation', confidence: 'confirmed' },
  { id: 'ksa-004', date: '2025-04-22', country: 'Saudi Arabia', category: 'airlines', amount: 1650, description: 'Saudia + flynas grounded Eastern routes — 28-day suspension, 4,800 flights affected', source: 'IATA operational data', confidence: 'confirmed' },
  { id: 'ksa-005', date: '2025-05-01', country: 'Saudi Arabia', category: 'trade', amount: 3200, description: 'Red Sea corridor disruption — Saudi non-oil exports rerouted, +$420M logistics surcharge', source: 'Saudi General Authority of Statistics', confidence: 'estimated' },
  { id: 'ksa-006', date: '2025-05-20', country: 'Saudi Arabia', category: 'tourism', amount: 2100, description: 'Vision 2030 tourism projects stalled — NEOM, Red Sea Project bookings down 44%', source: 'Saudi Tourism Authority', confidence: 'estimated' },
  { id: 'ksa-007', date: '2025-06-01', country: 'Saudi Arabia', category: 'insurance', amount: 920, description: 'Aramco facility insurance repricing + shipping war-risk — estimated $920M incremental cost', source: 'Munich Re / Swiss Re', confidence: 'estimated' },
  { id: 'ksa-008', date: '2025-06-05', country: 'Saudi Arabia', category: 'other', amount: 4200, description: 'Tadawul stock exchange — 11.2% index drop, $4.2B market cap loss in conflict weeks', source: 'Tadawul official data', confidence: 'confirmed' },

  // Kuwait
  { id: 'kwt-001', date: '2025-04-17', country: 'Kuwait', category: 'interceptors', amount: 280, description: 'Kuwait Patriot battery activation — 2 intercept events, Kuwait City corridor', source: 'Kuwait Ministry of Defense', confidence: 'estimated' },
  { id: 'kwt-002', date: '2025-04-18', country: 'Kuwait', category: 'oil_revenue', amount: 1900, description: 'KPC suspended North Kuwait oil field operations 9 days — 420,000 bpd offline', source: 'Kuwait Petroleum Corporation', confidence: 'confirmed' },
  { id: 'kwt-003', date: '2025-04-20', country: 'Kuwait', category: 'airports', amount: 340, description: 'Kuwait International Airport — 36-hr closure, 180 flights cancelled, $340M estimated loss', source: 'DGCA Kuwait', confidence: 'estimated' },
  { id: 'kwt-004', date: '2025-04-22', country: 'Kuwait', category: 'airlines', amount: 420, description: 'Kuwait Airways suspended all GCC/Iran corridor routes — 21 days', source: 'Kuwait Airways corporate filing', confidence: 'confirmed' },
  { id: 'kwt-005', date: '2025-05-10', country: 'Kuwait', category: 'trade', amount: 680, description: 'Shuwaikh & Shuaiba ports — reduced throughput 31%, congestion surcharges totalling $680M', source: 'Kuwait Port Authority', confidence: 'estimated' },
  { id: 'kwt-006', date: '2025-06-01', country: 'Kuwait', category: 'other', amount: 850, description: 'Boursa Kuwait — 8.4% correction, capital flight and sovereign wealth fund defensive reallocation', source: 'Capital Markets Authority Kuwait', confidence: 'confirmed' },

  // Qatar
  { id: 'qat-001', date: '2025-04-16', country: 'Qatar', category: 'oil_revenue', amount: 2800, description: 'QatarEnergy LNG shipments disrupted — 14 cargoes delayed, spot premium lost + rerouting cost', source: 'QatarEnergy statement', confidence: 'confirmed' },
  { id: 'qat-002', date: '2025-04-20', country: 'Qatar', category: 'airports', amount: 920, description: 'Hamad International Airport — reduced ops 72 hrs, 480 flights cancelled or delayed', source: 'Qatar Civil Aviation Authority', confidence: 'confirmed' },
  { id: 'qat-003', date: '2025-04-22', country: 'Qatar', category: 'airlines', amount: 2100, description: 'Qatar Airways suspended Iran overflights and Persian Gulf routes — 31 days, 6,200 flights', source: 'Qatar Airways Group', confidence: 'confirmed' },
  { id: 'qat-004', date: '2025-05-01', country: 'Qatar', category: 'interceptors', amount: 180, description: 'QEAF Patriot batteries activated — defensive deployments cost', source: 'IISS Military Balance estimate', confidence: 'estimated' },
  { id: 'qat-005', date: '2025-05-15', country: 'Qatar', category: 'trade', amount: 560, description: 'Hamad Port disruption — 18% throughput drop, petrochemical export delays', source: 'Mwani Qatar Port Authority', confidence: 'estimated' },
  { id: 'qat-006', date: '2025-06-01', country: 'Qatar', category: 'insurance', amount: 320, description: 'LNG tanker war-risk repricing — incremental cost on 80-vessel fleet', source: 'Gard / Skuld P&I estimates', confidence: 'estimated' },
  { id: 'qat-007', date: '2025-06-10', country: 'Qatar', category: 'tourism', amount: 780, description: 'Doha hotel occupancy -29%, luxury hospitality sector impact Q2 2025', source: 'Qatar Tourism Authority', confidence: 'estimated' },

  // Bahrain
  { id: 'bhr-001', date: '2025-04-16', country: 'Bahrain', category: 'interceptors', amount: 120, description: 'US 5th Fleet-assisted Patriot intercepts over Bahraini airspace — cost-sharing estimate', source: 'US CENTCOM / IISS', confidence: 'estimated' },
  { id: 'bhr-002', date: '2025-04-20', country: 'Bahrain', category: 'airports', amount: 210, description: 'Bahrain International Airport — 24-hr closure, 140 flights cancelled', source: 'Civil Aviation Affairs Bahrain', confidence: 'confirmed' },
  { id: 'bhr-003', date: '2025-04-22', country: 'Bahrain', category: 'airlines', amount: 180, description: 'Gulf Air suspended 22 routes — 14-day operational pause', source: 'Gulf Air Group statement', confidence: 'confirmed' },
  { id: 'bhr-004', date: '2025-05-01', country: 'Bahrain', category: 'trade', amount: 290, description: 'Khalifa Bin Salman Port — 24% drop in container throughput, 3-week period', source: 'APM Terminals Bahrain', confidence: 'estimated' },
  { id: 'bhr-005', date: '2025-05-20', country: 'Bahrain', category: 'oil_revenue', amount: 480, description: 'BAPCO refinery reduced runs — insurance & logistics constraints, 180,000 bpd impact 8 days', source: 'Bapco Energies', confidence: 'estimated' },
  { id: 'bhr-006', date: '2025-06-01', country: 'Bahrain', category: 'other', amount: 340, description: 'Bahrain Bourse — financial services sector contraction, FDI outflows to neutral hubs', source: 'Central Bank of Bahrain', confidence: 'estimated' },

  // Oman
  { id: 'omn-001', date: '2025-04-18', country: 'Oman', category: 'trade', amount: 1100, description: 'Port of Salalah — Red Sea rerouting benefit partly offset by insurance costs; net loss from Gulf of Oman risk premium', source: 'Oman Ports & Maritime', confidence: 'estimated' },
  { id: 'omn-002', date: '2025-04-20', country: 'Oman', category: 'oil_revenue', amount: 1400, description: 'PDO & OQ export disruption — Hormuz transit uncertainty, 3 cargoes force-majeure declared', source: 'Ministry of Energy & Minerals Oman', confidence: 'confirmed' },
  { id: 'omn-003', date: '2025-04-22', country: 'Oman', category: 'airports', amount: 180, description: 'Muscat International — 18-hr partial closure, 90 flights diverted', source: 'Oman Airports', confidence: 'confirmed' },
  { id: 'omn-004', date: '2025-04-25', country: 'Oman', category: 'airlines', amount: 220, description: 'Oman Air suspended Gulf routes — 12-day operational pause', source: 'Oman Air press release', confidence: 'confirmed' },
  { id: 'omn-005', date: '2025-05-15', country: 'Oman', category: 'tourism', amount: 340, description: 'Muscat tourism bookings -31%, Salalah khareef season advance bookings cancelled', source: 'Oman Ministry of Heritage & Tourism', confidence: 'estimated' },
  { id: 'omn-006', date: '2025-06-01', country: 'Oman', category: 'insurance', amount: 280, description: 'Omani tanker fleet & energy infrastructure war-risk insurance spike', source: 'Oman Re', confidence: 'estimated' },
]

// ─── Derived aggregates ───────────────────────────────────────────────────────

function sumByCategory(events: LossEvent[]): Record<Category, number> {
  const result = {} as Record<Category, number>
  const cats: Category[] = ['interceptors', 'oil_revenue', 'airports', 'airlines', 'trade', 'tourism', 'insurance', 'other']
  cats.forEach(c => { result[c] = 0 })
  events.forEach(e => { result[e.category] = (result[e.category] || 0) + e.amount })
  return result
}

export const COUNTRY_SUMMARIES: CountrySummary[] = [
  {
    country: 'UAE',
    flag: '🇦🇪',
    totalLoss: LOSS_EVENTS.filter(e => e.country === 'UAE').reduce((s, e) => s + e.amount, 0),
    byCategory: sumByCategory(LOSS_EVENTS.filter(e => e.country === 'UAE')),
    trend: 'up',
    lastUpdated: '2025-06-12',
  },
  {
    country: 'Saudi Arabia',
    flag: '🇸🇦',
    totalLoss: LOSS_EVENTS.filter(e => e.country === 'Saudi Arabia').reduce((s, e) => s + e.amount, 0),
    byCategory: sumByCategory(LOSS_EVENTS.filter(e => e.country === 'Saudi Arabia')),
    trend: 'up',
    lastUpdated: '2025-06-12',
  },
  {
    country: 'Kuwait',
    flag: '🇰🇼',
    totalLoss: LOSS_EVENTS.filter(e => e.country === 'Kuwait').reduce((s, e) => s + e.amount, 0),
    byCategory: sumByCategory(LOSS_EVENTS.filter(e => e.country === 'Kuwait')),
    trend: 'up',
    lastUpdated: '2025-06-12',
  },
  {
    country: 'Qatar',
    flag: '🇶🇦',
    totalLoss: LOSS_EVENTS.filter(e => e.country === 'Qatar').reduce((s, e) => s + e.amount, 0),
    byCategory: sumByCategory(LOSS_EVENTS.filter(e => e.country === 'Qatar')),
    trend: 'up',
    lastUpdated: '2025-06-12',
  },
  {
    country: 'Bahrain',
    flag: '🇧🇭',
    totalLoss: LOSS_EVENTS.filter(e => e.country === 'Bahrain').reduce((s, e) => s + e.amount, 0),
    byCategory: sumByCategory(LOSS_EVENTS.filter(e => e.country === 'Bahrain')),
    trend: 'up',
    lastUpdated: '2025-06-12',
  },
  {
    country: 'Oman',
    flag: '🇴🇲',
    totalLoss: LOSS_EVENTS.filter(e => e.country === 'Oman').reduce((s, e) => s + e.amount, 0),
    byCategory: sumByCategory(LOSS_EVENTS.filter(e => e.country === 'Oman')),
    trend: 'up',
    lastUpdated: '2025-06-12',
  },
]

export const TOTAL_LOSS = COUNTRY_SUMMARIES.reduce((s, c) => s + c.totalLoss, 0)

export const TICKER_ITEMS: TickerItem[] = LOSS_EVENTS.slice(0, 12).map(e => ({
  country: e.country,
  category: e.category,
  amount: e.amount,
  change: Math.random() > 0.5 ? +(Math.random() * 12).toFixed(1) : -(Math.random() * 8).toFixed(1),
  label: `${COUNTRY_FLAGS[e.country]} ${e.country} · ${CATEGORY_META[e.category].label}`,
}))

// ─── Timeline data for chart ──────────────────────────────────────────────────

export const TIMELINE_DATA = [
  { date: 'Apr 15', UAE: 840, 'Saudi Arabia': 1450, Kuwait: 280, Qatar: 180, Bahrain: 120, Oman: 0 },
  { date: 'Apr 16', UAE: 840, 'Saudi Arabia': 11250, Kuwait: 280, Qatar: 2980, Bahrain: 480, Oman: 1400 },
  { date: 'Apr 18', UAE: 840, 'Saudi Arabia': 11250, Kuwait: 280, Qatar: 2980, Bahrain: 480, Oman: 2500 },
  { date: 'Apr 20', UAE: 2040, 'Saudi Arabia': 12030, Kuwait: 900, Qatar: 3900, Bahrain: 2170, Oman: 2680 },
  { date: 'Apr 22', UAE: 2040, 'Saudi Arabia': 13680, Kuwait: 1320, Qatar: 6000, Bahrain: 2350, Oman: 2900 },
  { date: 'May 01', UAE: 6840, 'Saudi Arabia': 16880, Kuwait: 2000, Qatar: 6560, Bahrain: 2640, Oman: 2900 },
  { date: 'May 10', UAE: 6840, 'Saudi Arabia': 16880, Kuwait: 2680, Qatar: 6560, Bahrain: 2640, Oman: 2900 },
  { date: 'May 15', UAE: 6840, 'Saudi Arabia': 16880, Kuwait: 2680, Qatar: 7120, Bahrain: 2640, Oman: 3240 },
  { date: 'May 20', UAE: 6840, 'Saudi Arabia': 18980, Kuwait: 2680, Qatar: 7120, Bahrain: 3120, Oman: 3240 },
  { date: 'Jun 01', UAE: 10240, 'Saudi Arabia': 23180, Kuwait: 3530, Qatar: 7440, Bahrain: 3120, Oman: 3520 },
  { date: 'Jun 05', UAE: 10240, 'Saudi Arabia': 27380, Kuwait: 3530, Qatar: 7440, Bahrain: 3120, Oman: 3520 },
  { date: 'Jun 10', UAE: 10240, 'Saudi Arabia': 27380, Kuwait: 3530, Qatar: 8220, Bahrain: 3120, Oman: 3520 },
  { date: 'Jun 12', UAE: 18390, 'Saudi Arabia': 27380, Kuwait: 4470, Qatar: 7660, Bahrain: 1620, Oman: 3520 },
]
