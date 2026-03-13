# GCC War Cost Tracker

A Bloomberg-terminal-style dashboard tracking the estimated economic losses sustained by GCC countries as a result of the US–Iran military conflict (April–June 2025).

## Overview

The dashboard aggregates and visualises financial damage across six Gulf Cooperation Council countries — **Saudi Arabia, UAE, Qatar, Kuwait, Oman, and Bahrain** — broken down by loss category, country, and timeline.

**Total estimated losses tracked: ~$59.76B**

---

## Loss Categories

| Category | Description |
|---|---|
| 🎯 Missile Interceptors | Cost of Patriot / THAAD / Arrow intercept batteries deployed and munitions expended |
| 🛢️ Oil Revenue Lost | Reduced export revenue from Strait of Hormuz disruption and force majeure declarations |
| ✈️ Airport Halting | Direct losses from airport shutdowns, diversions, and airspace closures |
| 🛫 Airline Suspensions | Revenue losses from grounded fleets, cancelled routes, and passenger refunds |
| 🚢 Trade Disruption | Port slowdowns, shipping delays, and supply-chain interruptions |
| 🏨 Tourism | Hotel cancellations, event postponements, and visitor decline |
| 📋 Insurance Premiums | War-risk premium surges on shipping, aviation, and property |
| 📉 Other | Stock market declines, FDI withdrawal, and miscellaneous financial impact |

---

## Data Sources

All figures are estimates compiled from publicly available reporting. No proprietary data is used.

| Source | Used For |
|---|---|
| **IATA** | Airport closure durations, airline revenue impact, passenger data |
| **Bloomberg Commodities** | Oil price spreads, Brent futures, export volume changes |
| **IISS (International Institute for Strategic Studies)** | Interceptor costs, munitions expenditure estimates |
| **Saudi Aramco / QatarEnergy press releases** | Force majeure declarations, production cut announcements |
| **DP World / Port operator reports** | Container throughput decline, port closure durations |
| **Lloyd's of London / Marine market data** | War-risk insurance premium changes |
| **IMF World Economic Outlook** | GDP revision estimates, macroeconomic impact |
| **Reuters / AP / Financial Times** | Event dates, confirmation of incidents |

> ⚠️ **Disclaimer:** All figures are estimates based on public data and analyst reports. This dashboard is for informational and research purposes only. Numbers should not be used for financial or investment decisions.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org) |
| Build Tool | [Vite 8](https://vite.dev) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| Charts | [Recharts](https://recharts.org) (Bar, Line, Pie, Radar) |
| Icons | [Lucide React](https://lucide.dev) |
| Fonts | [Inter](https://fonts.google.com/specimen/Inter) (Google Fonts) |

---

## Project Structure

```
src/
├── components/
│   ├── Ticker.tsx             # Live scrolling banner at the top
│   ├── CountryCard.tsx        # Per-country summary card with mini-bars
│   ├── CountryDetail.tsx      # Full country breakdown (bars + radar chart)
│   ├── CategoryBreakdown.tsx  # GCC-wide category analysis (stacked bar + pie)
│   ├── TimelineChart.tsx      # Cumulative loss timeline (line chart)
│   └── EventsLog.tsx          # Filterable/sortable events table
├── data/
│   └── losses.ts              # All data: events, country summaries, ticker items
├── types/
│   └── index.ts               # TypeScript type definitions
└── App.tsx                    # Main layout, tabs, navigation
```

---

## Running Locally

```bash
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

```bash
npm run build    # production build
npm run preview  # serve the production build locally
```

---

## Features

- **Bloomberg-style dark UI** — monospace fonts, orange accents, dense data layout
- **Live ticker** — scrolling headline losses across the top
- **5 views**: Overview · By Country · By Category · Timeline · Events Log
- **Interactive** — click any country card to drill into its full breakdown
- **Filterable events log** — filter by country and category, sort by date or amount
- **Confidence levels** — each event tagged as Confirmed / Estimated / Projected

---

## Contributing

Data corrections and additions are welcome. Open an issue or PR with a source citation for any figure you'd like to update.
