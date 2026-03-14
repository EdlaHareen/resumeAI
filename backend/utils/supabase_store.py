"""
Supabase persistence for tailor sessions.
Uses service role key (bypasses RLS) — NEVER expose this key to clients.
Gracefully no-ops if SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY are not configured.
"""
import json
import os
import urllib.error
import urllib.parse
import urllib.request
from typing import Any, Dict, Optional

_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")


def is_configured() -> bool:
    return bool(_URL and _KEY)


def _req(method: str, table: str, body: Optional[bytes] = None, params: str = "") -> Optional[Any]:
    if not is_configured():
        return None
    url = f"{_URL}/rest/v1/{table}"
    if params:
        url = f"{url}?{params}"
    req = urllib.request.Request(url=url, method=method, data=body)
    req.add_header("Authorization", f"Bearer {_KEY}")
    req.add_header("apikey", _KEY)
    req.add_header("Content-Type", "application/json")
    if body and method == "PATCH":
        req.add_header("Prefer", "return=minimal")
    elif body and method == "POST":
        req.add_header("Prefer", "return=minimal,resolution=merge-duplicates")
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            raw = resp.read().decode("utf-8")
            return json.loads(raw) if raw.strip() else None
    except (urllib.error.HTTPError, urllib.error.URLError, Exception):
        return None


def save_session(
    session_id: str,
    user_id: Optional[str],
    original_filename: str,
    jd_text: str,
    resume_structured: dict,
    rewrites: dict,
    response: dict,
) -> None:
    """Upsert full pipeline session to Supabase tailor_sessions table."""
    jd_words = jd_text.strip().split()
    jd_snippet = " ".join(jd_words[:30]) + ("…" if len(jd_words) > 30 else "")
    payload = {
        "session_id": session_id,
        "user_id": user_id,
        "original_filename": original_filename or "",
        "jd_snippet": jd_snippet,
        "resume_structured": resume_structured,
        "rewrites": rewrites,
        "response": response,
    }
    body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    # Use upsert so re-runs or retries don't fail on duplicate session_id
    _req("POST", "tailor_sessions", body=body, params="on_conflict=session_id")


def load_session(session_id: str) -> Optional[Dict[str, Any]]:
    """Return resume_structured + rewrites for download. None if not found."""
    rows = _req(
        "GET",
        "tailor_sessions",
        params=f"session_id=eq.{urllib.parse.quote(session_id, safe='')}&select=resume_structured,rewrites",
    )
    if not rows or not isinstance(rows, list) or len(rows) == 0:
        return None
    return rows[0]


def update_accepted_bullets(session_id: str, accepted_bullets: dict) -> None:
    """Save the user's final bullet choices to the session record."""
    body = json.dumps({"accepted_bullets": accepted_bullets}).encode("utf-8")
    _req("PATCH", "tailor_sessions", body=body, params=f"session_id=eq.{urllib.parse.quote(session_id, safe='')}")
