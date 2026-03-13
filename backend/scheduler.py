"""
APScheduler background jobs that refresh all data caches periodically.
"""

import logging
import asyncio
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from .fetchers.oil import fetch_brent
from .fetchers.news import fetch_events
from .fetchers.gdp import fetch_gdp

log = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()


async def _refresh_oil():
    log.info("Refreshing oil price…")
    try:
        await fetch_brent()
    except Exception as e:
        log.error("Oil refresh failed: %s", e)


async def _refresh_news():
    log.info("Refreshing news events…")
    try:
        await fetch_events()
    except Exception as e:
        log.error("News refresh failed: %s", e)


async def _refresh_gdp():
    log.info("Refreshing GDP data…")
    try:
        await fetch_gdp()
    except Exception as e:
        log.error("GDP refresh failed: %s", e)


def start():
    scheduler.add_job(_refresh_oil,  "interval", minutes=15, id="oil")
    scheduler.add_job(_refresh_news, "interval", minutes=30, id="news")
    scheduler.add_job(_refresh_gdp,  "interval", hours=24,   id="gdp")
    scheduler.start()
    log.info("Scheduler started (oil=15min, news=30min, gdp=24h)")


def stop():
    scheduler.shutdown(wait=False)
