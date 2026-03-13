import json
import time
from pathlib import Path
from typing import Any

CACHE_DIR = Path(__file__).parent / "cache"
CACHE_DIR.mkdir(exist_ok=True)


def get(key: str, ttl: int) -> Any | None:
    """Return cached value if it exists and is within TTL seconds. None otherwise."""
    path = CACHE_DIR / f"{key}.json"
    if not path.exists():
        return None
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        if time.time() - data["_ts"] > ttl:
            return None
        return data["value"]
    except Exception:
        return None


def set(key: str, value: Any) -> None:
    """Write value to cache with current timestamp."""
    path = CACHE_DIR / f"{key}.json"
    path.write_text(
        json.dumps({"_ts": time.time(), "value": value}, default=str),
        encoding="utf-8",
    )


def age(key: str) -> float | None:
    """Return seconds since last cache write, or None if not cached."""
    path = CACHE_DIR / f"{key}.json"
    if not path.exists():
        return None
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        return time.time() - data["_ts"]
    except Exception:
        return None
