"""
GCC War Cost Tracker — FastAPI backend
Port: 8000
"""

import asyncio
import logging
from datetime import date, datetime

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .config import CONFLICT_START
from .fetchers.oil import fetch_brent
from .fetchers.news import fetch_events
from .fetchers.gdp import fetch_gdp
from .calculations.losses import compute_losses, compute_timeline, conflict_days
from . import cache as _cache
from . import scheduler as _sched

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
log = logging.getLogger(__name__)

app = FastAPI(title="GCC War Cost Tracker API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    log.info("Startup: pre-fetching data…")
    # Kick off fetches concurrently, don't block if they fail
    await asyncio.gather(
        fetch_brent(),
        fetch_events(),
        fetch_gdp(),
        return_exceptions=True,
    )
    _sched.start()
    log.info("Startup complete.")


@app.on_event("shutdown")
async def shutdown():
    _sched.stop()


# ──────────────────────────────────────────────────────────────────────────────
# Health
# ──────────────────────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    def _age_str(key: str) -> str | None:
        a = _cache.age(key)
        if a is None:
            return None
        return f"{int(a)}s ago"

    return {
        "status": "ok",
        "conflictStart": str(CONFLICT_START),
        "conflictDays": conflict_days(),
        "lastRefresh": {
            "oil": _age_str("oil_brent"),
            "news": _age_str("news_events"),
            "gdp": _age_str("gdp_data"),
        },
        "now": datetime.utcnow().isoformat() + "Z",
    }


# ──────────────────────────────────────────────────────────────────────────────
# Oil price
# ──────────────────────────────────────────────────────────────────────────────

@app.get("/api/oil/current")
async def oil_current():
    return await fetch_brent()


# ──────────────────────────────────────────────────────────────────────────────
# News events
# ──────────────────────────────────────────────────────────────────────────────

@app.get("/api/events")
async def events(country: str | None = None, category: str | None = None):
    all_events = await fetch_events()
    filtered = all_events
    if country and country != "ALL":
        filtered = [e for e in filtered if e["country"] == country]
    if category and category != "ALL":
        filtered = [e for e in filtered if e["category"] == category]
    return filtered


# ──────────────────────────────────────────────────────────────────────────────
# Loss summary
# ──────────────────────────────────────────────────────────────────────────────

@app.get("/api/losses/summary")
async def losses_summary():
    oil, news = await asyncio.gather(fetch_brent(), fetch_events())
    return compute_losses(oil, news)


# ──────────────────────────────────────────────────────────────────────────────
# Timeline
# ──────────────────────────────────────────────────────────────────────────────

@app.get("/api/losses/timeline")
async def losses_timeline():
    oil, news = await asyncio.gather(fetch_brent(), fetch_events())
    return compute_timeline(oil, news)


# ──────────────────────────────────────────────────────────────────────────────
# GDP context
# ──────────────────────────────────────────────────────────────────────────────

@app.get("/api/gdp")
async def gdp():
    return await fetch_gdp()
