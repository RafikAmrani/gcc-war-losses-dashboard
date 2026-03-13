"""
Fetches GDP data from the World Bank API (free, no key required).
Used to contextualise loss figures as % of GDP.
"""

import httpx
import logging

from .. import cache as _cache

log = logging.getLogger(__name__)

WB_URL = "https://api.worldbank.org/v2/country/{codes}/indicator/NY.GDP.MKTP.CD"
COUNTRY_CODES = "SA;AE;QA;KW;BH;OM"
TTL_GDP = 86400  # 24 hours

CODE_TO_NAME = {
    "SA": "Saudi Arabia",
    "AE": "UAE",
    "QA": "Qatar",
    "KW": "Kuwait",
    "BH": "Bahrain",
    "OM": "Oman",
}

# Fallback GDP (USD billions, World Bank 2023 estimates)
FALLBACK_GDP_B = {
    "Saudi Arabia": 1067.0,
    "UAE": 504.0,
    "Qatar": 218.0,
    "Kuwait": 161.0,
    "Bahrain": 44.0,
    "Oman": 108.0,
}


async def fetch_gdp() -> dict[str, float]:
    """Return {country: gdp_usd_billions}."""
    cached = _cache.get("gdp_data", TTL_GDP)
    if cached:
        return cached

    try:
        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.get(
                WB_URL.format(codes=COUNTRY_CODES),
                params={"date": "2022:2024", "format": "json", "per_page": "100"},
            )
            resp.raise_for_status()
            payload = resp.json()

        # World Bank returns [metadata, [records]]
        records = payload[1] if isinstance(payload, list) and len(payload) > 1 else []

        result: dict[str, float] = {}
        for r in records:
            code = r.get("countryiso3code") or (r.get("country") or {}).get("id", "")
            # Map 3-letter → 2-letter codes used in CODE_TO_NAME
            code2 = {"SAU": "SA", "ARE": "AE", "QAT": "QA", "KWT": "KW",
                     "BHR": "BH", "OMN": "OM"}.get(code, code)
            name = CODE_TO_NAME.get(code2)
            value = r.get("value")
            if name and value:
                gdp_b = float(value) / 1e9
                if name not in result or gdp_b > result[name]:
                    result[name] = round(gdp_b, 1)

        # Fill any gaps with fallback
        for name, fallback in FALLBACK_GDP_B.items():
            if name not in result:
                result[name] = fallback

        _cache.set("gdp_data", result)
        return result

    except Exception as exc:
        log.error("World Bank GDP fetch failed: %s – using fallback", exc)
        return dict(FALLBACK_GDP_B)
