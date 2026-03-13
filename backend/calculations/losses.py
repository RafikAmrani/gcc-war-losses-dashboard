"""
Loss estimation engine.

Combines real data (EIA oil price) with parametric models (baselines + conflict duration)
to produce per-country, per-category USD-million loss estimates.
"""

from datetime import date, timedelta

from ..config import (
    CONFLICT_START,
    OIL_EXPORTS_MBD,
    MARKET_CAPS_B,
    AIRPORT_DAILY_REV_M,
    AIRLINE_DAILY_REV_M,
    COUNTRY_FLAGS,
)

COUNTRIES = list(OIL_EXPORTS_MBD.keys())
CATEGORIES = [
    "interceptors", "oil_revenue", "airports", "airlines",
    "trade", "tourism", "insurance", "other",
]


def conflict_days(today: date | None = None) -> int:
    today = today or date.today()
    return max(0, (today - CONFLICT_START).days)


def compute_losses(oil: dict, news_events: list[dict]) -> dict:
    """
    Returns the full loss summary dict consumed by /api/losses/summary.

    oil: {price, baseline, change, date, source}
    news_events: list of event dicts (from fetchers.news)
    """
    days = conflict_days()
    today_str = str(date.today())

    oil_price = float(oil.get("price", 74.5))
    oil_baseline = float(oil.get("baseline", 78.0))

    # Closure phases
    # Day 0-2: full closure; Day 3-7: 60 % disrupted; Day 8+: 40 % disrupted
    def _disruption_factor(days_elapsed: int) -> float:
        if days_elapsed <= 2:
            return 1.0
        elif days_elapsed <= 7:
            return 0.60
        return 0.40

    countries_out = []
    grand_total = 0.0

    for country in COUNTRIES:
        by_cat: dict[str, float] = {c: 0.0 for c in CATEGORIES}

        # ── 1. Oil revenue loss ──────────────────────────────────────────────
        # Revenue not earned because of: (a) volume disruption + (b) price depression
        daily_exp = OIL_EXPORTS_MBD[country]          # Mbbl/day
        price_per_barrel = oil_price                  # current Brent USD/bbl
        base_price = oil_baseline

        oil_loss = 0.0
        for d in range(days):
            disruption = _disruption_factor(d)
            # Volume lost (million bbl) for this day
            vol_lost = daily_exp * disruption
            # Revenue at baseline price
            rev_lost = vol_lost * 1_000_000 * base_price / 1_000_000  # → USD millions
            # If price also dropped, the remaining exports earn less too
            if price_per_barrel < base_price:
                remaining_vol = daily_exp * (1 - disruption)
                price_loss = remaining_vol * 1_000_000 * (base_price - price_per_barrel) / 1_000_000
                rev_lost += price_loss
            oil_loss += rev_lost

        by_cat["oil_revenue"] = round(oil_loss, 1)

        # ── 2. Airport halting ───────────────────────────────────────────────
        daily_rev = AIRPORT_DAILY_REV_M[country]
        airport_loss = 0.0
        for d in range(days):
            if d <= 2:
                airport_loss += daily_rev            # full closure
            elif d <= 7:
                airport_loss += daily_rev * 0.50     # partial
            else:
                airport_loss += daily_rev * 0.15     # near normal
        by_cat["airports"] = round(airport_loss, 1)

        # ── 3. Airline suspensions ───────────────────────────────────────────
        airline_rev = AIRLINE_DAILY_REV_M[country]
        airline_loss = 0.0
        for d in range(days):
            if d <= 2:
                airline_loss += airline_rev
            elif d <= 7:
                airline_loss += airline_rev * 0.60
            else:
                airline_loss += airline_rev * 0.20
        by_cat["airlines"] = round(airline_loss, 1)

        # ── 4. Trade disruption (Hormuz shipping detour costs) ───────────────
        # $3/bbl extra cost for rerouting around Hormuz
        trade_loss = 0.0
        for d in range(days):
            disruption = _disruption_factor(d)
            extra_cost = daily_exp * 1_000_000 * 3.0 / 1_000_000  # USD millions/day
            trade_loss += extra_cost * disruption
        by_cat["trade"] = round(trade_loss, 1)

        # ── 5. Insurance premiums (war-risk surcharge) ────────────────────────
        # 8× baseline war-risk premium on shipping tonnage
        # Rough: each Mbbl exported = ~$0.20/bbl base premium × 8× multiplier
        insurance_extra = 0.0
        for d in range(days):
            disruption = _disruption_factor(d)
            transported = daily_exp * (1 - disruption)  # volume still moving
            insurance_extra += transported * 1_000_000 * (0.20 * 7) / 1_000_000  # 7× extra
        by_cat["insurance"] = round(insurance_extra, 1)

        # ── 6. Tourism decline ───────────────────────────────────────────────
        # Tourism revenue ~30 % of airport revenue baseline, with 70 % hit
        tourism_daily = AIRPORT_DAILY_REV_M[country] * 0.30
        tourism_loss = tourism_daily * 0.70 * days
        by_cat["tourism"] = round(tourism_loss, 1)

        # ── 7. Stock market / FDI losses ─────────────────────────────────────
        # Estimate: 3 % immediate market cap decline + 0.1 %/day erosion
        mktcap_m = MARKET_CAPS_B[country] * 1_000  # USD millions
        stock_loss = mktcap_m * 0.03 + mktcap_m * 0.001 * days
        by_cat["other"] = round(stock_loss, 1)

        # ── 8. Interceptors (from confirmed news events) ─────────────────────
        interceptor_from_news = sum(
            e["amount"] for e in news_events
            if e.get("country") == country and e.get("category") == "interceptors"
        )
        # Minimum estimate based on conflict intensity
        interceptor_baseline = _interceptor_estimate(country, days)
        by_cat["interceptors"] = round(max(interceptor_from_news, interceptor_baseline), 1)

        total = round(sum(by_cat.values()), 1)
        grand_total += total

        countries_out.append({
            "country": country,
            "flag": COUNTRY_FLAGS[country],
            "totalLoss": total,
            "byCategory": by_cat,
            "trend": "up",
            "lastUpdated": today_str,
        })

    # Sort by total loss descending
    countries_out.sort(key=lambda c: c["totalLoss"], reverse=True)

    return {
        "totalLoss": round(grand_total, 1),
        "conflictDays": days,
        "lastUpdated": today_str,
        "oilPrice": oil,
        "countries": countries_out,
    }


def compute_timeline(oil: dict, news_events: list[dict]) -> list[dict]:
    """
    Build a day-by-day cumulative loss timeline from CONFLICT_START to today.
    Returns list of {date (label), UAE, Saudi Arabia, ...} points.
    Labels are abbreviated: 'Feb 27', 'Mar 01', etc.
    """
    days = conflict_days()
    timeline = []

    for d in range(days + 1):
        day_date = CONFLICT_START + timedelta(days=d)
        point: dict = {"date": day_date.strftime("%b %d")}

        # Compute cumulative losses up to day d
        # Re-use the same engine but with d days elapsed
        partial_oil = dict(oil)  # oil price same (we don't have historical by day)
        partial_events = [
            e for e in news_events
            if e.get("date", "") <= str(day_date)
        ]

        partial = _cumulative_for_day(d, partial_oil)
        for country, total in partial.items():
            # Use alias key without spaces for recharts
            key = country.replace(" ", "_")
            point[key] = total

        timeline.append(point)

    return timeline


def _cumulative_for_day(days_elapsed: int, oil: dict) -> dict[str, float]:
    """Return {country: cumulative_loss_usd_millions} up to `days_elapsed` days."""
    oil_price = float(oil.get("price", 74.5))
    oil_baseline = float(oil.get("baseline", 78.0))

    def _disruption(d: int) -> float:
        if d <= 2:
            return 1.0
        elif d <= 7:
            return 0.60
        return 0.40

    result = {}
    for country in COUNTRIES:
        total = 0.0
        daily_exp = OIL_EXPORTS_MBD[country]

        for d in range(days_elapsed):
            dis = _disruption(d)
            # Oil
            vol_lost = daily_exp * dis
            total += vol_lost * 1_000_000 * oil_baseline / 1_000_000
            if oil_price < oil_baseline:
                remaining = daily_exp * (1 - dis)
                total += remaining * 1_000_000 * (oil_baseline - oil_price) / 1_000_000
            # Airport
            daily_rev = AIRPORT_DAILY_REV_M[country]
            if d <= 2:
                total += daily_rev
            elif d <= 7:
                total += daily_rev * 0.50
            else:
                total += daily_rev * 0.15
            # Airline
            airline_rev = AIRLINE_DAILY_REV_M[country]
            if d <= 2:
                total += airline_rev
            elif d <= 7:
                total += airline_rev * 0.60
            else:
                total += airline_rev * 0.20
            # Trade
            total += daily_exp * 3.0 * dis
            # Insurance
            transported = daily_exp * (1 - dis)
            total += transported * 1_000_000 * (0.20 * 7) / 1_000_000
            # Tourism
            total += AIRPORT_DAILY_REV_M[country] * 0.30 * 0.70

        # Stock (one-time at start + daily erosion)
        if days_elapsed > 0:
            mktcap_m = MARKET_CAPS_B[country] * 1_000
            total += mktcap_m * 0.03 + mktcap_m * 0.001 * days_elapsed

        # Interceptors — rough linear per-day estimate
        total += _interceptor_estimate(country, days_elapsed)

        result[country] = round(total, 1)

    return result


def _interceptor_estimate(country: str, days: int) -> float:
    """Baseline interceptor cost estimate (USD millions)."""
    # PAC-3 cost ~$4M each; estimated 5–20 intercepts per day during peak
    base_rate = {
        "Saudi Arabia": 3.5,  # highest exposure
        "UAE": 2.5,
        "Kuwait": 1.5,
        "Qatar": 2.0,
        "Bahrain": 1.0,
        "Oman": 0.5,
    }
    rate = base_rate.get(country, 1.0)
    if days <= 3:
        return rate * 20 * days    # peak intercepts
    elif days <= 10:
        return rate * 20 * 3 + rate * 5 * (days - 3)
    else:
        return rate * 20 * 3 + rate * 5 * 7 + rate * 1 * (days - 10)
