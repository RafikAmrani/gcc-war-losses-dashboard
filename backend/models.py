from pydantic import BaseModel
from typing import Optional


class OilPrice(BaseModel):
    price: float        # current USD/bbl
    baseline: float     # 30-day pre-conflict average
    change: float       # % change from baseline (negative = price fell)
    date: str           # date of most recent price data
    unit: str = "USD/bbl"
    source: str = "EIA"


class NewsEvent(BaseModel):
    id: str
    date: str           # YYYY-MM-DD
    country: str
    category: str
    description: str
    amount: float       # USD millions (estimated)
    confidence: str     # confirmed | estimated | projected
    source: str
    url: Optional[str] = None


class CountryLoss(BaseModel):
    country: str
    flag: str
    totalLoss: float    # USD millions
    byCategory: dict[str, float]
    trend: str          # up | stable
    lastUpdated: str


class LossSummary(BaseModel):
    totalLoss: float
    conflictDays: int
    lastUpdated: str
    oilPrice: Optional[OilPrice]
    countries: list[CountryLoss]


class TimelinePoint(BaseModel):
    date: str
    # per-country cumulative loss up to this date (USD millions)
    UAE: float = 0
    Saudi_Arabia: float = 0
    Kuwait: float = 0
    Qatar: float = 0
    Bahrain: float = 0
    Oman: float = 0


class GDPData(BaseModel):
    country: str
    gdp_usd: float      # USD billions
    year: int


class HealthResponse(BaseModel):
    status: str
    conflictStart: str
    conflictDays: int
    lastRefresh: dict[str, Optional[str]]
