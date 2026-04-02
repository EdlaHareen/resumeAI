"""
Thread-safe in-process store for pipeline progress events.
Each request_id maps to a list of SSE events; the list grows as stages complete.
Stale entries are auto-evicted after _MAX_AGE_SECONDS to prevent memory leaks
when clients disconnect before consuming the done/error event.
"""
import threading
import time
from typing import Any, Dict, List, Tuple

_lock = threading.Lock()
_events: Dict[str, Tuple[float, List[Dict[str, Any]]]] = {}  # request_id -> (created_at, events)

_MAX_AGE_SECONDS = 600  # 10 minutes — matches session TTL
_EVICT_INTERVAL = 60  # only scan for stale entries once per minute
_last_evict: float = 0.0


def _evict_stale() -> None:
    """Remove entries older than _MAX_AGE_SECONDS. Called under _lock."""
    global _last_evict
    now = time.monotonic()
    if now - _last_evict < _EVICT_INTERVAL:
        return
    _last_evict = now
    stale = [rid for rid, (created, _) in _events.items() if now - created > _MAX_AGE_SECONDS]
    for rid in stale:
        del _events[rid]


def create(request_id: str) -> None:
    with _lock:
        _evict_stale()
        _events[request_id] = (time.monotonic(), [])


def push(request_id: str, event: Dict[str, Any]) -> None:
    with _lock:
        entry = _events.get(request_id)
        if entry is not None:
            entry[1].append(event)


def get_from(request_id: str, offset: int) -> List[Dict[str, Any]]:
    with _lock:
        entry = _events.get(request_id)
        if entry is None:
            return []
        return list(entry[1][offset:])


def is_known(request_id: str) -> bool:
    with _lock:
        return request_id in _events


def is_expired(request_id: str) -> bool:
    """Check if a request has exceeded its max age (for SSE timeout)."""
    with _lock:
        entry = _events.get(request_id)
        if entry is None:
            return True
        return time.monotonic() - entry[0] > _MAX_AGE_SECONDS


def cleanup(request_id: str) -> None:
    with _lock:
        _events.pop(request_id, None)
