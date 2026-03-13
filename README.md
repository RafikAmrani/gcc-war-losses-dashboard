# GCC War Cost Tracker

A Bloomberg-terminal-style dashboard tracking the estimated economic losses sustained by GCC countries as a result of the US–Iran military conflict (February 27, 2026 – present).

## Overview

The dashboard aggregates and visualises financial damage across six Gulf Cooperation Council countries — **Saudi Arabia, UAE, Qatar, Kuwait, Oman, and Bahrain** — broken down by loss category, country, and timeline.

Live data is fetched from real public APIs and refreshed automatically in the background. Loss figures are calculated dynamically based on live oil prices, conflict duration, and OPEC export baselines.

**Total estimated losses: ~$189B and accumulating (Day 14)**

---

## Architecture

```
┌─────────────────────────────┐        ┌──────────────────────────────┐
│   React Frontend (Vite)     │  /api  │   FastAPI Backend (Python)   │
│   localhost:5173            │◄──────►│   localhost:8000             │
│                             │        │                              │
│  useLosses() hook           │        │  /api/losses/summary         │
│  useEvents() hook           │        │  /api/losses/timeline        │
│  Live ticker                │        │  /api/events                 │
│  5 dashboard views          │        │  /api/oil/current            │
└─────────────────────────────┘        │  /api/gdp                    │
                                       └──────────┬───────────────────┘
                                                  │
                          ┌───────────────────────┼───────────────────┐
                          ▼                       ▼                   ▼
                   EIA API (oil)           GDELT v2 (news)     World Bank (GDP)
                   Brent crude             Conflict events      Country GDP data
                   refreshed 15min         refreshed 30min      refreshed 24h
```

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

| Source | Used For | Refresh |
|---|---|---|
| **EIA (US Energy Information Administration)** | Live Brent crude oil price, pre-conflict baseline | Every 15 min |
| **GDELT Project v2** | Real-time conflict news events from global media | Every 30 min |
| **World Bank API** | Country GDP figures for loss-ratio calculations | Every 24h |
| **NewsAPI** *(optional)* | Additional headline news (requires API key) | Every 30 min |

Loss calculations use live oil prices against 30-day pre-conflict baselines (Feb 27, 2026), scaled to each country's OPEC export volume and conflict disruption phase.

> ⚠️ **Disclaimer:** All figures are estimates based on public data and automated calculations. This dashboard is for informational and research purposes only. Numbers should not be used for financial or investment decisions.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org) |
| Build tool | [Vite](https://vite.dev) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| Charts | [Recharts](https://recharts.org) |
| Backend | [FastAPI](https://fastapi.tiangolo.com) + [Python 3.13](https://python.org) |
| HTTP client | [httpx](https://www.python-httpx.org) (async) |
| Scheduler | [APScheduler](https://apscheduler.readthedocs.io) |

---

## Project Structure

```
├── backend/
│   ├── main.py               # FastAPI app, routes
│   ├── config.py             # API keys, conflict start date
│   ├── models.py             # Pydantic response models
│   ├── cache.py              # TTL-based JSON file cache
│   ├── scheduler.py          # Background refresh jobs
│   ├── calculations/
│   │   └── losses.py         # Loss estimation engine
│   ├── fetchers/
│   │   ├── oil.py            # EIA Brent crude fetcher
│   │   ├── news.py           # GDELT + NewsAPI fetcher
│   │   └── gdp.py            # World Bank GDP fetcher
│   ├── cache/                # Cached API responses (auto-created)
│   ├── .env                  # API keys (not committed)
│   └── requirements.txt
└── src/
    ├── api/
    │   └── client.ts         # API fetch wrapper
    ├── hooks/
    │   ├── useLosses.ts       # Polls /api/losses/* every 5 min
    │   └── useEvents.ts       # Polls /api/events every 5 min
    ├── components/
    │   ├── Ticker.tsx
    │   ├── Header.tsx
    │   ├── CountryDetail.tsx
    │   ├── CategoryBreakdown.tsx
    │   ├── TimelineChart.tsx
    │   └── EventsLog.tsx
    ├── data/
    │   └── losses.ts         # Static metadata (flags, category labels)
    ├── types/
    │   └── index.ts
    └── App.tsx
```

---

## Running Locally

### 1. Start the backend

```bash
cd /path/to/degats

# Install Python dependencies (first time only)
pip install -r backend/requirements.txt

# Add your EIA API key
echo "EIA_API_KEY=your_key_here" > backend/.env

# Start the backend (keep this terminal open)
uvicorn backend.main:app --port 8000
```

Get a free EIA API key at [https://www.eia.gov/opendata/](https://www.eia.gov/opendata/).

### 2. Start the frontend

```bash
npm install       # first time only
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

The frontend proxies `/api/*` requests to the backend automatically via Vite's dev proxy.

### Optional API keys

Add these to `backend/.env` for additional data sources:

```env
EIA_API_KEY=your_eia_key          # required — live oil prices
NEWS_API_KEY=your_newsapi_key     # optional — additional headlines
ALPHA_VANTAGE_KEY=your_av_key    # optional — reserved for future use
```

---

## Deployment note

The backend currently runs on your local machine. To make the dashboard accessible to others:
- Deploy the FastAPI backend to a cloud service (Railway, Render, Fly.io, etc.)
- Update the Vite proxy target to point to the deployed backend URL
- Build and deploy the frontend to Vercel, Netlify, or similar

---

## Features

- **Bloomberg-style dark UI** — monospace fonts, orange accents, dense data layout
- **Live Brent crude price** in the header, updated from EIA every 15 minutes
- **Live ticker** — scrolling losses with real oil-price-driven figures
- **5 views**: Overview · By Country · By Category · Timeline · Events Log
- **Interactive** — click any country card to drill into its full breakdown
- **Real conflict news** — GDELT pulls live events from global media coverage
- **Auto-refresh** — frontend polls backend every 5 minutes; backend refreshes APIs in background
