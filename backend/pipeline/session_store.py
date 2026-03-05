import json
import os
import threading
import time
import urllib.parse
import urllib.request
from typing import Any, Dict, Optional

SESSION_TTL_SECONDS = 600  # 10 minutes
_SESSION_KEY_PREFIX = "resumeai:session:"


class SessionStore:
    def get(self, session_id: str) -> Dict[str, Any]:
        raise NotImplementedError

    def set(self, session_id: str, data: Dict[str, Any], ttl_seconds: int) -> None:
        raise NotImplementedError

    def delete(self, session_id: str) -> None:
        raise NotImplementedError


class InMemorySessionStore(SessionStore):
    def __init__(self) -> None:
        self._sessions: Dict[str, Dict[str, Any]] = {}
        self._lock = threading.Lock()

    def _evict_expired(self) -> None:
        now = time.time()
        expired = [sid for sid, s in self._sessions.items() if s["expires_at"] < now]
        for sid in expired:
            del self._sessions[sid]

    def get(self, session_id: str) -> Dict[str, Any]:
        with self._lock:
            self._evict_expired()
            session = self._sessions.get(session_id)
            if session is None:
                raise KeyError(f"Session {session_id} not found or expired")
            return session["data"]

    def set(self, session_id: str, data: Dict[str, Any], ttl_seconds: int) -> None:
        with self._lock:
            self._evict_expired()
            self._sessions[session_id] = {
                "data": data,
                "expires_at": time.time() + ttl_seconds,
            }

    def delete(self, session_id: str) -> None:
        with self._lock:
            self._sessions.pop(session_id, None)


class UpstashRestSessionStore(SessionStore):
    def __init__(self, rest_url: str, rest_token: str) -> None:
        self._rest_url = rest_url.rstrip("/")
        self._rest_token = rest_token.strip()

    def _key(self, session_id: str) -> str:
        return f"{_SESSION_KEY_PREFIX}{session_id}"

    def _request(
        self,
        method: str,
        path: str,
        *,
        query: Optional[dict] = None,
        body: Optional[bytes] = None,
        timeout_seconds: float = 10,
    ) -> dict:
        url = f"{self._rest_url}/{path.lstrip('/')}"
        if query:
            url = f"{url}?{urllib.parse.urlencode(query)}"

        req = urllib.request.Request(url=url, method=method, data=body)
        req.add_header("Authorization", f"Bearer {self._rest_token}")
        if body is not None:
            req.add_header("Content-Type", "text/plain; charset=utf-8")

        with urllib.request.urlopen(req, timeout=timeout_seconds) as resp:
            raw = resp.read().decode("utf-8")
            return json.loads(raw) if raw else {}

    def get(self, session_id: str) -> Dict[str, Any]:
        key = urllib.parse.quote(self._key(session_id), safe="")
        payload = self._request("GET", f"get/{key}")
        result = payload.get("result")
        if result is None:
            raise KeyError(f"Session {session_id} not found or expired")
        if not isinstance(result, str):
            raise RuntimeError("Unexpected KV response type")
        return json.loads(result)

    def set(self, session_id: str, data: Dict[str, Any], ttl_seconds: int) -> None:
        key = urllib.parse.quote(self._key(session_id), safe="")
        value = json.dumps(data, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
        self._request("POST", f"set/{key}", query={"EX": str(ttl_seconds)}, body=value)

    def delete(self, session_id: str) -> None:
        key = urllib.parse.quote(self._key(session_id), safe="")
        self._request("GET", f"del/{key}")


def _get_upstash_env() -> tuple[Optional[str], Optional[str]]:
    # Vercel KV env var names
    url = os.getenv("KV_REST_API_URL")
    token = os.getenv("KV_REST_API_TOKEN")
    if url and token:
        return url, token

    # Upstash Redis REST env var names
    url = os.getenv("UPSTASH_REDIS_REST_URL")
    token = os.getenv("UPSTASH_REDIS_REST_TOKEN")
    if url and token:
        return url, token

    return None, None


_store: SessionStore
_url, _token = _get_upstash_env()
_store = UpstashRestSessionStore(_url, _token) if (_url and _token) else InMemorySessionStore()


def get_store() -> SessionStore:
    return _store
