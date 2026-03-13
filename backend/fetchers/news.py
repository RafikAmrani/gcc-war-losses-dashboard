"""
Fetches conflict-related news articles from NewsAPI and GDELT.
Each article is mapped to a GCC country + loss category and given an estimated USD amount.
"""

import hashlib
import httpx
import logging
import random
import re
from datetime import datetime

from ..config import NEWS_API_KEY, CONFLICT_START
from .. import cache as _cache

log = logging.getLogger(__name__)

NEWS_API_URL = "https://newsapi.org/v2/everything"
GDELT_URL = "https://api.gdeltproject.org/api/v2/doc/doc"

# How long to keep news cache
TTL_NEWS = 1800  # 30 minutes

# Keywords for country detection
COUNTRY_KEYWORDS: dict[str, list[str]] = {
    "Saudi Arabia": ["saudi", "riyadh", "aramco", "jeddah", "ksa", "saudia", "abha", "dammam"],
    "UAE": ["uae", "dubai", "abu dhabi", "emirates", "etihad", "sharjah", "abudhabi"],
    "Qatar": ["qatar", "doha", "qatarenergy", "qatari", "al-jazeera"],
    "Kuwait": ["kuwait", "kuwaiti", "ahmadi"],
    "Bahrain": ["bahrain", "manama", "bahraini", "gulf air"],
    "Oman": ["oman", "muscat", "omani", "oman air"],
}

# Keywords for category detection
CATEGORY_KEYWORDS: dict[str, list[str]] = {
    "interceptors": ["patriot", "thaad", "intercept", "missile defense", "air defense",
                     "iron dome", "arrow", "rocket", "ballistic", "shoot down"],
    "oil_revenue": ["oil", "crude", "brent", "hormuz", "aramco", "qatarenergy",
                    "barrel", "export", "petroleum", "lng", "gas", "opec"],
    "airports": ["airport", "airspace", "notam", "runway", "aviation authority",
                 "air traffic", "terminal", "flight restriction"],
    "airlines": ["airline", "flight", "emirates", "etihad", "qatar airways", "saudia",
                 "gulf air", "oman air", "cancel", "suspend", "route"],
    "trade": ["shipping", "tanker", "vessel", "port", "strait", "cargo",
              "container", "supply chain", "trade route", "straits of hormuz"],
    "tourism": ["tourism", "hotel", "tourist", "visitor", "hospitality",
                "travel warning", "evacuation"],
    "insurance": ["insurance", "premium", "war risk", "lloyd", "underwriter",
                  "war clause", "hull"],
    "equity": ["stock market", "stock exchange", "equity", "share price", "tadawul",
               "dfm", "adx", "qse", "kse", "index drop", "market crash", "bourse"],
    "fdi": ["foreign investment", "fdi", "investor confidence", "capital flight",
            "business climate", "investment freeze", "project delay", "divestment"],
    "real_estate": ["real estate", "property market", "housing", "construction halt",
                    "developer", "mortgage", "property prices", "real-estate"],
}

# Estimated USD-million range per category per event
CATEGORY_AMOUNTS: dict[str, tuple[float, float]] = {
    "interceptors": (80, 350),
    "oil_revenue": (300, 900),
    "airports": (40, 180),
    "airlines": (80, 450),
    "trade": (100, 400),
    "tourism": (20, 120),
    "insurance": (30, 180),
    "equity": (150, 600),
    "fdi": (50, 300),
    "real_estate": (30, 200),
}


async def fetch_events() -> list[dict]:
    """Return merged, deduplicated events from NewsAPI + GDELT."""
    cached = _cache.get("news_events", TTL_NEWS)
    if cached:
        return cached

    start_str = str(CONFLICT_START)  # YYYY-MM-DD

    news_articles = await _newsapi(start_str)
    gdelt_articles = await _gdelt(start_str)

    raw = news_articles + gdelt_articles
    events = _map_to_events(raw)

    _cache.set("news_events", events)
    return events


async def _newsapi(from_date: str) -> list[dict]:
    if not NEWS_API_KEY:
        log.warning("NEWS_API_KEY not set – skipping NewsAPI")
        return []
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(NEWS_API_URL, params={
                "q": "Iran GCC Gulf Hormuz oil military conflict",
                "from": from_date,
                "language": "en",
                "sortBy": "publishedAt",
                "pageSize": 50,
                "apiKey": NEWS_API_KEY,
            })
            resp.raise_for_status()
            articles = resp.json().get("articles", [])

        return [
            {
                "title": a.get("title", ""),
                "description": a.get("description") or a.get("title", ""),
                "date": (a.get("publishedAt") or "")[:10],
                "source": a.get("source", {}).get("name", "NewsAPI"),
                "url": a.get("url", ""),
            }
            for a in articles
            if a.get("title") and "[Removed]" not in (a.get("title") or "")
        ]
    except Exception as exc:
        log.error("NewsAPI fetch failed: %s", exc)
        return []


async def _gdelt(from_date: str) -> list[dict]:
    # GDELT expects YYYYMMDDHHMMSS format
    start_dt = from_date.replace("-", "") + "000000"
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.get(GDELT_URL, params={
                "query": "Iran GCC Gulf Hormuz oil military",
                "mode": "ArtList",
                "maxrecords": "100",
                "startdatetime": start_dt,
                "format": "json",
            })
            resp.raise_for_status()
            articles = resp.json().get("articles", [])

        return [
            {
                "title": a.get("title", ""),
                "description": a.get("title", ""),
                "date": _gdelt_date(a.get("seendate", "")),
                "source": a.get("domain", "GDELT"),
                "url": a.get("url", ""),
            }
            for a in articles
            if a.get("title")
        ]
    except Exception as exc:
        log.error("GDELT fetch failed: %s", exc)
        return []


def _gdelt_date(raw: str) -> str:
    """Convert GDELT seendate (20260301T120000Z) → YYYY-MM-DD."""
    try:
        dt = datetime.strptime(raw[:8], "%Y%m%d")
        return dt.strftime("%Y-%m-%d")
    except Exception:
        return str(CONFLICT_START)


def _map_to_events(articles: list[dict]) -> list[dict]:
    """Map news articles to structured loss events.

    Each article can fan out to multiple countries if it mentions several, or
    to all GCC countries when it is generic Gulf/Hormuz coverage.
    """
    seen_hashes: set[str] = set()
    events: list[dict] = []

    for art in articles:
        text = ((art.get("title") or "") + " " + (art.get("description") or "")).lower()

        countries = _detect_countries(text)
        category = _detect_category(text)
        if not countries or not category:
            continue

        # Deduplicate by title hash
        title_hash = hashlib.md5(text[:80].encode()).hexdigest()
        if title_hash in seen_hashes:
            continue
        seen_hashes.add(title_hash)

        lo, hi = CATEGORY_AMOUNTS[category]
        # Deterministic base amount from hash so re-fetches are stable
        base_amount = round(lo + (int(title_hash[:8], 16) % 1000) / 1000 * (hi - lo), 1)
        # Split amount proportionally across all affected countries
        per_country_amount = round(base_amount / len(countries), 1)

        description = (art.get("description") or art.get("title") or "")[:200]
        date = art.get("date") or str(CONFLICT_START)
        confidence = "confirmed" if category in ("interceptors", "oil_revenue") else "estimated"

        for idx, country in enumerate(countries):
            events.append({
                "id": f"evt_{title_hash[:8]}_{idx}",
                "date": date,
                "country": country,
                "category": category,
                "description": description,
                "amount": per_country_amount,
                "confidence": confidence,
                "source": art.get("source", ""),
                "url": art.get("url", ""),
            })

    # Sort newest first
    events.sort(key=lambda e: e["date"], reverse=True)
    return events


ALL_GCC = list(COUNTRY_KEYWORDS.keys())  # ['Saudi Arabia', 'UAE', 'Qatar', 'Kuwait', 'Bahrain', 'Oman']

def _detect_countries(text: str) -> list[str]:
    """Return all GCC countries explicitly mentioned, or all six for generic Gulf coverage."""
    matched = [c for c, kws in COUNTRY_KEYWORDS.items() if any(kw in text for kw in kws)]
    if matched:
        return matched
    # Generic Gulf/Hormuz article affects all GCC countries
    if any(kw in text for kw in ["gulf", "gcc", "hormuz", "persian gulf"]):
        return ALL_GCC
    return []


def _detect_category(text: str) -> str | None:
    for cat, keywords in CATEGORY_KEYWORDS.items():
        if any(kw in text for kw in keywords):
            return cat
    return None
