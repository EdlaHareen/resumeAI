"""
Thread-safe in-process store for pipeline progress events.
Each request_id maps to a list of SSE events; the list grows as stages complete.
"""
import threading
from typing import Any, Dict, List

_lock = threading.Lock()
_events: Dict[str, List[Dict[str, Any]]] = {}


def create(request_id: str) -> None:
    with _lock:
        _events[request_id] = []


def push(request_id: str, event: Dict[str, Any]) -> None:
    with _lock:
        if request_id in _events:
            _events[request_id].append(event)


def get_from(request_id: str, offset: int) -> List[Dict[str, Any]]:
    with _lock:
        return list((_events.get(request_id) or [])[offset:])


def is_known(request_id: str) -> bool:
    with _lock:
        return request_id in _events


def cleanup(request_id: str) -> None:
    with _lock:
        _events.pop(request_id, None)
