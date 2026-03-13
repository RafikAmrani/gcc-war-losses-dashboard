"""
Fetches Brent crude oil spot prices from the EIA v2 API.
Falls back to Alpha Vantage commodities, then a hardcoded estimate.
"""

import httpx
import logging
from datetime import date, timedelta

from ..config import EIA_API_KEY, ALPHA_VANTAGE_KEY, CONFLICT_START
from .. import cache as _cache

log = logging.getLogger(__name__)

EIA_URL = "https://api.eia.gov/v2/petroleum/pri/spt/data/"
AV_URL = "https://www.alphavantage.co/query"

TTL = 900  # 15 minutes


async def fetch_brent() -> dict:
    """Return Brent crude price info: {price, baseline, change, date, source}."""
    cached = _cache.get("oil_brent", TTL)
    if cached:
        return cached

    result = await _from_eia() or await _from_alpha_vantage() or _fallback()
    _cache.set("oil_brent", result)
    return result


async def _from_eia() -> dict | None:
    if not EIA_API_KEY:
        log.warning("EIA_API_KEY not set – skipping EIA fetch")
        return None
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(EIA_URL, params={
                "api_key": EIA_API_KEY,
                "frequency": "daily",
                "data[0]": "value",
                "facets[product][]": "EPCBRENT",  # Europe Brent spot only
                "sort[0][column]": "period",
                "sort[0][direction]": "desc",
                "length": 90,  # 90 days covers pre-conflict baseline
            })
            resp.raise_for_status()
            rows = resp.json().get("response", {}).get("data", [])

        brent = [r for r in rows if r.get("value") not in (None, "")]

        if not brent:
            return None

        current_price = float(brent[0]["value"])
        current_date = brent[0]["period"]

        # Baseline = average of the 30 days before CONFLICT_START
        pre_conflict = [
            r for r in brent
            if r["period"] < str(CONFLICT_START)
        ]
        baseline = (
            sum(float(r["value"]) for r in pre_conflict[:30]) / len(pre_conflict[:30])
            if pre_conflict else current_price
        )

        return {
            "price": round(current_price, 2),
            "baseline": round(baseline, 2),
            "change": round((current_price - baseline) / baseline * 100, 2),
            "date": current_date,
            "source": "EIA",
        }

    except Exception as exc:
        log.error("EIA fetch failed: %s", exc)
        return None


async def _from_alpha_vantage() -> dict | None:
    if not ALPHA_VANTAGE_KEY:
        return None
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(AV_URL, params={
                "function": "BRENT",
                "interval": "daily",
                "apikey": ALPHA_VANTAGE_KEY,
            })
            resp.raise_for_status()
            data = resp.json()

        ts = data.get("data", [])
        if not ts:
            return None

        # ts is sorted newest-first: [{date, value}, ...]
        current_price = float(ts[0]["value"])
        current_date = ts[0]["date"]

        # Baseline = average before conflict start
        pre_conflict = [r for r in ts if r["date"] < str(CONFLICT_START)]
        baseline = (
            sum(float(r["value"]) for r in pre_conflict[:30]) / len(pre_conflict[:30])
            if pre_conflict else current_price
        )

        return {
            "price": round(current_price, 2),
            "baseline": round(baseline, 2),
            "change": round((current_price - baseline) / baseline * 100, 2),
            "date": current_date,
            "source": "Alpha Vantage",
        }

    except Exception as exc:
        log.error("Alpha Vantage oil fetch failed: %s", exc)
        return None


def _fallback() -> dict:
    """Hardcoded estimate when all APIs fail."""
    log.warning("Using hardcoded oil price fallback")
    return {
        "price": 74.5,
        "baseline": 78.2,
        "change": -4.73,
        "date": str(date.today() - timedelta(days=1)),
        "source": "Estimate",
    }
