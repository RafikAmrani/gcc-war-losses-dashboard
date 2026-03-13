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
    FDI_ANNUAL_B,
    REAL_ESTATE_ANNUAL_B,
    COUNTRY_FLAGS,
)

COUNTRIES = list(OIL_EXPORTS_MBD.keys())
CATEGORIES = [
    "interceptors", "oil_revenue", "airports", "airlines",
    "trade", "tourism", "insurance", "equity", "fdi", "real_estate",
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

        # ── 7a. Equity market losses (free-float adjusted) ────────────────
        # Free float ≈ 20 % of total market cap (rest is state/anchor-held)
        # Shock: 1.0 % immediate drop + 0.01 %/day erosion
        mktcap_m = MARKET_CAPS_B[country] * 1_000  # USD millions
        equity_loss = mktcap_m * 0.20 * (0.010 + 0.0001 * days)
        by_cat["equity"] = round(equity_loss, 1)

        # ── 7b. FDI freeze (3-month forward impact, 50 % disruption) ─────
        # War-risk premium delays/cancels H1 2026 pipeline commitments
        fdi_loss = FDI_ANNUAL_B[country] * 1_000 * 0.50 * (3 / 12)
        by_cat["fdi"] = round(fdi_loss, 1)

        # ── 7c. Real estate slowdown (3-month, 20 % transaction decline) ─
        re_loss = REAL_ESTATE_ANNUAL_B[country] * 1_000 * 0.20 * (3 / 12)
        by_cat["real_estate"] = round(re_loss, 1)

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
            "calcBreakdown": _build_breakdown(country, days, oil),
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

        # Equity / FDI / Real estate (same calibration as compute_losses)
        if days_elapsed > 0:
            mktcap_m = MARKET_CAPS_B[country] * 1_000
            total += mktcap_m * 0.20 * (0.010 + 0.0001 * days_elapsed)
            total += FDI_ANNUAL_B[country] * 1_000 * 0.50 * (3 / 12)
            total += REAL_ESTATE_ANNUAL_B[country] * 1_000 * 0.20 * (3 / 12)

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


_INTERCEPTOR_BASE_RATES = {
    "Saudi Arabia": 3.5,
    "UAE": 2.5,
    "Kuwait": 1.5,
    "Qatar": 2.0,
    "Bahrain": 1.0,
    "Oman": 0.5,
}


def _build_breakdown(country: str, days: int, oil: dict) -> dict:
    """
    Return a per-category dict of { formula, inputs, steps, result }
    so the frontend can show exactly how each loss figure was derived.
    """
    oil_price    = float(oil.get("price",    74.5))
    oil_baseline = float(oil.get("baseline", 78.0))
    price_drop   = max(0.0, oil_baseline - oil_price)

    daily_exp    = OIL_EXPORTS_MBD[country]
    airport_rev  = AIRPORT_DAILY_REV_M[country]
    airline_rev  = AIRLINE_DAILY_REV_M[country]
    mktcap_b     = MARKET_CAPS_B[country]
    fdi_annual   = FDI_ANNUAL_B[country]
    re_annual    = REAL_ESTATE_ANNUAL_B[country]

    # Phase day counts
    d0 = min(days, 3)               # days 0-2 (full disruption)
    d1 = max(0, min(days - 3, 5))  # days 3-7
    d2 = max(0, days - 8)           # day 8+

    bd: dict = {}

    # ── Oil revenue ──────────────────────────────────────────────────────────
    vol_d0 = daily_exp * 1.00 * d0
    vol_d1 = daily_exp * 0.60 * d1
    vol_d2 = daily_exp * 0.40 * d2
    rem_d0 = daily_exp * 0.00 * d0
    rem_d1 = daily_exp * 0.40 * d1
    rem_d2 = daily_exp * 0.60 * d2
    oil_vol_loss   = (vol_d0 + vol_d1 + vol_d2) * oil_baseline
    oil_price_loss = (rem_d0 + rem_d1 + rem_d2) * price_drop
    oil_total = round(oil_vol_loss + oil_price_loss, 1)
    bd["oil_revenue"] = {
        "formula": "Σ(disrupted_volume × baseline_price) + Σ(remaining_volume × price_drop)",
        "inputs": {
            "Daily exports":       f"{daily_exp}M bbl/day",
            "Conflict days":       str(days),
            "Brent baseline":      f"${oil_baseline:.2f}/bbl",
            "Current Brent":       f"${oil_price:.2f}/bbl",
            "Price drop":          f"${price_drop:.2f}/bbl",
            "Phase 1 (days 0–2)":  "100% disrupted",
            "Phase 2 (days 3–7)":  "60% disrupted",
            "Phase 3 (day 8+)":    "40% disrupted",
        },
        "steps": [
            {"label": f"Phase 1: {d0}d × {daily_exp}M bbl × 100% lost × ${oil_baseline:.2f}/bbl",
             "value": f"${vol_d0 * oil_baseline:,.1f}M"},
            {"label": f"Phase 2: {d1}d × {daily_exp}M bbl × 60% lost × ${oil_baseline:.2f}/bbl",
             "value": f"${vol_d1 * oil_baseline:,.1f}M"},
            {"label": f"Phase 3: {d2}d × {daily_exp}M bbl × 40% lost × ${oil_baseline:.2f}/bbl",
             "value": f"${vol_d2 * oil_baseline:,.1f}M"},
            {"label": f"Price loss on remaining exports × ${price_drop:.2f}/bbl drop",
             "value": f"${oil_price_loss:,.1f}M"},
        ],
        "result": oil_total,
    }

    # ── Airports ─────────────────────────────────────────────────────────────
    ap_d0 = airport_rev * 1.00 * d0
    ap_d1 = airport_rev * 0.50 * d1
    ap_d2 = airport_rev * 0.15 * d2
    ap_total = round(ap_d0 + ap_d1 + ap_d2, 1)
    bd["airports"] = {
        "formula": "Σ(daily_revenue × phase_closure_rate × days_in_phase)",
        "inputs": {
            "Daily airport revenue": f"${airport_rev}M",
            "Source":                "IATA 2024 combined hub revenue",
            "Phase 1 (days 0–2)":    "100% closure",
            "Phase 2 (days 3–7)":    "50% closure",
            "Phase 3 (day 8+)":      "15% residual disruption",
        },
        "steps": [
            {"label": f"Phase 1: {d0}d × ${airport_rev}M × 100%", "value": f"${ap_d0:,.1f}M"},
            {"label": f"Phase 2: {d1}d × ${airport_rev}M × 50%",  "value": f"${ap_d1:,.1f}M"},
            {"label": f"Phase 3: {d2}d × ${airport_rev}M × 15%",  "value": f"${ap_d2:,.1f}M"},
        ],
        "result": ap_total,
    }

    # ── Airlines ─────────────────────────────────────────────────────────────
    al_d0 = airline_rev * 1.00 * d0
    al_d1 = airline_rev * 0.60 * d1
    al_d2 = airline_rev * 0.20 * d2
    al_total = round(al_d0 + al_d1 + al_d2, 1)
    bd["airlines"] = {
        "formula": "Σ(daily_revenue × phase_suspension_rate × days_in_phase)",
        "inputs": {
            "Daily airline revenue": f"${airline_rev}M",
            "Source":                "IATA / carrier financials 2024",
            "Phase 1 (days 0–2)":    "100% suspended",
            "Phase 2 (days 3–7)":    "60% suspended",
            "Phase 3 (day 8+)":      "20% reduced",
        },
        "steps": [
            {"label": f"Phase 1: {d0}d × ${airline_rev}M × 100%", "value": f"${al_d0:,.1f}M"},
            {"label": f"Phase 2: {d1}d × ${airline_rev}M × 60%",  "value": f"${al_d1:,.1f}M"},
            {"label": f"Phase 3: {d2}d × ${airline_rev}M × 20%",  "value": f"${al_d2:,.1f}M"},
        ],
        "result": al_total,
    }

    # ── Trade (Hormuz rerouting surcharge) ────────────────────────────────────
    tr_d0 = daily_exp * 3.0 * 1.00 * d0
    tr_d1 = daily_exp * 3.0 * 0.60 * d1
    tr_d2 = daily_exp * 3.0 * 0.40 * d2
    tr_total = round(tr_d0 + tr_d1 + tr_d2, 1)
    bd["trade"] = {
        "formula": "Σ(exports_mbbl × $3/bbl_detour_cost × disruption_factor × days)",
        "inputs": {
            "Daily exports":           f"{daily_exp}M bbl/day",
            "Hormuz detour surcharge":  "$3.00/bbl (Cape of Good Hope rerouting)",
            "Phase 1 disruption":       "100%",
            "Phase 2 disruption":       "60%",
            "Phase 3 disruption":       "40%",
        },
        "steps": [
            {"label": f"Phase 1: {d0}d × {daily_exp}M bbl × $3/bbl × 100%", "value": f"${tr_d0:,.1f}M"},
            {"label": f"Phase 2: {d1}d × {daily_exp}M bbl × $3/bbl × 60%",  "value": f"${tr_d1:,.1f}M"},
            {"label": f"Phase 3: {d2}d × {daily_exp}M bbl × $3/bbl × 40%",  "value": f"${tr_d2:,.1f}M"},
        ],
        "result": tr_total,
    }

    # ── Insurance (war-risk premium surcharge) ────────────────────────────────
    # transported = volume still moving = exports × (1 - disruption)
    ins_d0 = daily_exp * 0.00 * (0.20 * 7) * d0   # 0% transported at full blockade
    ins_d1 = daily_exp * 0.40 * (0.20 * 7) * d1
    ins_d2 = daily_exp * 0.60 * (0.20 * 7) * d2
    ins_total = round(ins_d0 + ins_d1 + ins_d2, 1)
    bd["insurance"] = {
        "formula": "Σ(transported_volume × 7× war-risk surcharge × $0.20/bbl base)",
        "inputs": {
            "Daily exports":          f"{daily_exp}M bbl/day",
            "Base war-risk premium":  "$0.20/bbl (Lloyd's pre-conflict rate)",
            "Surcharge multiplier":   "8× total (7× extra vs baseline)",
            "Phase 1":                "0% transported (Hormuz fully blocked)",
            "Phase 2":                "40% transported",
            "Phase 3":                "60% transported",
        },
        "steps": [
            {"label": f"Phase 1: {d0}d × {daily_exp}M bbl × 0% transported × $1.40/bbl surcharge",
             "value": f"${ins_d0:,.1f}M"},
            {"label": f"Phase 2: {d1}d × {daily_exp}M bbl × 40% transported × $1.40/bbl",
             "value": f"${ins_d1:,.1f}M"},
            {"label": f"Phase 3: {d2}d × {daily_exp}M bbl × 60% transported × $1.40/bbl",
             "value": f"${ins_d2:,.1f}M"},
        ],
        "result": ins_total,
    }

    # ── Tourism ───────────────────────────────────────────────────────────────
    tourism_daily = airport_rev * 0.30
    tourism_total = round(tourism_daily * 0.70 * days, 1)
    bd["tourism"] = {
        "formula": "airport_daily_rev × 30%_tourism_share × 70%_demand_collapse × conflict_days",
        "inputs": {
            "Airport daily revenue":    f"${airport_rev}M",
            "Tourism revenue share":    "30% of airport throughput",
            "Demand collapse rate":     "70% (travel bans + perception risk)",
            "Conflict days":            str(days),
        },
        "steps": [
            {"label": f"Daily tourism baseline: ${airport_rev}M × 30%",
             "value": f"${tourism_daily:,.2f}M/day"},
            {"label": "× 70% demand collapse",
             "value": f"${tourism_daily * 0.70:,.2f}M/day"},
            {"label": f"× {days} conflict days",
             "value": f"${tourism_total:,.1f}M"},
        ],
        "result": tourism_total,
    }

    # ── Equity (free-float adjusted) ─────────────────────────────────────────
    mktcap_m   = mktcap_b * 1_000
    total_drop = 0.010 + 0.0001 * days   # as decimal
    eq_total   = round(mktcap_m * 0.20 * total_drop, 1)
    bd["equity"] = {
        "formula": "market_cap × 20%_free_float × (1.0%_shock + 0.01%/day × days)",
        "inputs": {
            "Total market capitalisation": f"${mktcap_b:.0f}B",
            "Source":                       "Exchange data end-2024 (Tadawul/DFM/QSE/KSE/BSE/MSM)",
            "Free-float estimate":          "20% (remainder is state/anchor-held)",
            "Initial shock":               "1.0% (conflict announcement)",
            "Daily erosion":               "0.01%/day (sustained risk premium)",
            "Total effective drop":        f"{total_drop * 100:.2f}%",
        },
        "steps": [
            {"label": f"Total market cap: ${mktcap_b:.0f}B",
             "value": f"${mktcap_m:,.0f}M"},
            {"label": "× 20% free-float (state & sovereign wealth excluded)",
             "value": f"${mktcap_m * 0.20:,.0f}M"},
            {"label": f"× {total_drop * 100:.2f}% total drop (1.0% shock + 0.01%/day × {days}d)",
             "value": f"${eq_total:,.1f}M"},
        ],
        "result": eq_total,
    }

    # ── FDI ───────────────────────────────────────────────────────────────────
    fdi_total = round(fdi_annual * 1_000 * 0.50 * (3 / 12), 1)
    bd["fdi"] = {
        "formula": "annual_FDI × 50%_freeze × 3/12_months",
        "inputs": {
            "Annual FDI inflow":    f"${fdi_annual}B",
            "Source":               "World Bank 2024 estimates",
            "Capital freeze rate":  "50% (war-risk premium halts H1 2026 pipeline)",
            "Forward horizon":      "3 months",
        },
        "steps": [
            {"label": f"Annual FDI: ${fdi_annual}B",
             "value": f"${fdi_annual * 1000:,.0f}M"},
            {"label": "× 50% war-risk freeze rate",
             "value": f"${fdi_annual * 1000 * 0.50:,.0f}M"},
            {"label": "× 3/12 months forward horizon",
             "value": f"${fdi_total:,.1f}M"},
        ],
        "result": fdi_total,
    }

    # ── Real Estate ───────────────────────────────────────────────────────────
    re_total = round(re_annual * 1_000 * 0.20 * (3 / 12), 1)
    bd["real_estate"] = {
        "formula": "annual_RE_volume × 20%_transaction_slowdown × 3/12_months",
        "inputs": {
            "Annual RE transaction volume":  f"${re_annual}B",
            "Source":                        "National real estate authority data 2024",
            "Transaction slowdown":          "20% (buyer flight-to-safety)",
            "Horizon":                       "3 months",
        },
        "steps": [
            {"label": f"Annual RE volume: ${re_annual}B",
             "value": f"${re_annual * 1000:,.0f}M"},
            {"label": "× 20% transaction slowdown",
             "value": f"${re_annual * 1000 * 0.20:,.0f}M"},
            {"label": "× 3/12 months",
             "value": f"${re_total:,.1f}M"},
        ],
        "result": re_total,
    }

    # ── Interceptors ─────────────────────────────────────────────────────────
    int_rate   = _INTERCEPTOR_BASE_RATES.get(country, 1.0)
    int_total  = round(_interceptor_estimate(country, days), 1)
    int_peak   = round(int_rate * 20 * min(days, 3), 1)
    int_active = round(int_rate * 5  * max(0, min(days - 3, 7)), 1)
    int_supp   = round(int_rate * 1  * max(0, days - 10), 1)
    bd["interceptors"] = {
        "formula": "base_rate × intercepts/day × days  (phased: peak/active/suppressed)",
        "inputs": {
            "Exposure factor":         f"×{int_rate} relative to Oman (1.0 baseline)",
            "PAC-3 unit cost":         "~$4M/missile (Raytheon list price)",
            "Peak phase (days 0–3)":   "20 intercepts/day",
            "Active phase (days 4–10)":"5 intercepts/day",
            "Suppressed (day 11+)":    "1 intercept/day",
        },
        "steps": [
            {"label": f"Peak: {min(days,3)}d × {int_rate} rate × 20 intercepts × $4M",
             "value": f"${int_peak:,.1f}M"},
            {"label": f"Active: {max(0,min(days-3,7))}d × {int_rate} rate × 5 intercepts × $4M",
             "value": f"${int_active:,.1f}M"},
            {"label": f"Suppressed: {max(0,days-10)}d × {int_rate} rate × 1 intercept × $4M",
             "value": f"${int_supp:,.1f}M"},
        ],
        "result": int_total,
    }

    return bd
