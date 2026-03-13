import os
from datetime import date
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).parent / ".env")

EIA_API_KEY: str = os.getenv("EIA_API_KEY", "")
ALPHA_VANTAGE_KEY: str = os.getenv("ALPHA_VANTAGE_KEY", "")
NEWS_API_KEY: str = os.getenv("NEWS_API_KEY", "")

# Conflict anchor date — all calculations start from here
CONFLICT_START = date(2026, 2, 27)

# GCC daily oil export baselines (million barrels/day, OPEC 2024 data)
OIL_EXPORTS_MBD: dict[str, float] = {
    "Saudi Arabia": 10.0,
    "UAE": 3.5,
    "Kuwait": 2.7,
    "Qatar": 2.0,   # LNG boe equivalent
    "Bahrain": 0.2,
    "Oman": 1.0,
}

# Exchange market capitalisation (USD billions, end-2024)
MARKET_CAPS_B: dict[str, float] = {
    "Saudi Arabia": 2800.0,  # Tadawul
    "UAE": 800.0,             # DFM + ADX
    "Kuwait": 110.0,          # KSE
    "Qatar": 160.0,           # QSE
    "Bahrain": 25.0,          # BSE
    "Oman": 20.0,             # MSM
}

# Airport daily revenue (USD millions, IATA 2024)
AIRPORT_DAILY_REV_M: dict[str, float] = {
    "Saudi Arabia": 45.0,   # RUH + JED + DMM combined
    "UAE": 60.0,             # DXB + AUH
    "Kuwait": 15.0,
    "Qatar": 25.0,           # DOH
    "Bahrain": 8.0,          # BAH
    "Oman": 10.0,            # MCT
}

# Airline daily revenue (USD millions)
AIRLINE_DAILY_REV_M: dict[str, float] = {
    "Saudi Arabia": 55.0,   # Saudia + flyadeal
    "UAE": 120.0,            # Emirates + Etihad + flydubai
    "Kuwait": 20.0,          # Kuwait Airways + Jazeera
    "Qatar": 80.0,           # Qatar Airways
    "Bahrain": 12.0,         # Gulf Air
    "Oman": 15.0,            # Oman Air + SalamAir
}

# Annual FDI inflows (USD billions, World Bank 2024 estimates)
FDI_ANNUAL_B: dict[str, float] = {
    "Saudi Arabia": 15.0,
    "UAE": 22.0,
    "Kuwait": 3.0,
    "Qatar": 5.0,
    "Bahrain": 1.5,
    "Oman": 2.5,
}

# Annual real estate transaction volume (USD billions, 2024)
REAL_ESTATE_ANNUAL_B: dict[str, float] = {
    "Saudi Arabia": 50.0,
    "UAE": 65.0,
    "Kuwait": 8.0,
    "Qatar": 10.0,
    "Bahrain": 3.0,
    "Oman": 4.0,
}

# Country flags
COUNTRY_FLAGS: dict[str, str] = {
    "Saudi Arabia": "🇸🇦",
    "UAE": "🇦🇪",
    "Kuwait": "🇰🇼",
    "Qatar": "🇶🇦",
    "Bahrain": "🇧🇭",
    "Oman": "🇴🇲",
}
