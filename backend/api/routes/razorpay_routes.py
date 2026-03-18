"""
Razorpay Subscriptions integration (monthly Pro):
  POST /api/razorpay/subscribe              — create subscription → return key + subscription_id
  POST /api/razorpay/verify                 — verify signature → activate Pro
  POST /api/razorpay/cancel                 — cancel active subscription → downgrade to free
  POST /api/razorpay/webhook                — subscription lifecycle events
  GET  /api/razorpay/subscription/{id}      — return tier + usage
"""
import base64
import hashlib
import hmac
import json
import os
import urllib.error
import urllib.request
from datetime import datetime, timezone
from typing import Optional

import asyncio

from fastapi import APIRouter, Header, HTTPException, Request
from pydantic import BaseModel

import utils.subscription_store as sub_store
import utils.auth as auth_utils

router = APIRouter()

_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "")
_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "")
_WEBHOOK_SECRET = os.getenv("RAZORPAY_WEBHOOK_SECRET", "")

# Plan IDs — create these once in the Razorpay dashboard (type: recurring, period: monthly)
_PLAN_ID_INR = os.getenv("RAZORPAY_PLAN_ID_INR", "")
_PLAN_ID_USD = os.getenv("RAZORPAY_PLAN_ID_USD", "")

_BASE = "https://api.razorpay.com/v1"


def _auth() -> str:
    return "Basic " + base64.b64encode(f"{_KEY_ID}:{_KEY_SECRET}".encode()).decode()


def _post(path: str, payload: dict) -> dict:
    data = json.dumps(payload).encode()
    req = urllib.request.Request(f"{_BASE}{path}", method="POST", data=data)
    req.add_header("Authorization", _auth())
    req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        err = json.loads(e.read().decode())
        raise HTTPException(status_code=502, detail=err.get("error", {}).get("description", "Razorpay error"))
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))


def _get(path: str) -> dict:
    req = urllib.request.Request(f"{_BASE}{path}", method="GET")
    req.add_header("Authorization", _auth())
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return json.loads(resp.read().decode())
    except Exception:
        return {}


def _unix_to_iso(ts: Optional[int]) -> Optional[str]:
    if not ts:
        return None
    return datetime.fromtimestamp(ts, tz=timezone.utc).isoformat()


# ── Subscribe ─────────────────────────────────────────────────────────────────

class SubscribeRequest(BaseModel):
    user_id: str
    currency: str = "INR"  # "INR" or "USD"


@router.post("/razorpay/subscribe")
async def create_subscription(req: SubscribeRequest, authorization: Optional[str] = Header(None)):
    """Create a Razorpay monthly subscription. Requires valid JWT."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required.")
    verified_user_id = await asyncio.to_thread(auth_utils.verify_token, authorization)
    if verified_user_id != req.user_id:
        raise HTTPException(status_code=403, detail="user_id does not match authenticated user.")
    if not _KEY_ID or not _KEY_SECRET:
        raise HTTPException(status_code=500, detail="Razorpay is not configured.")

    currency = req.currency.upper()
    plan_id = _PLAN_ID_USD if currency == "USD" and _PLAN_ID_USD else _PLAN_ID_INR
    if not plan_id:
        raise HTTPException(status_code=500, detail="Razorpay plan not configured. Set RAZORPAY_PLAN_ID_INR in env.")

    subscription = _post("/subscriptions", {
        "plan_id": plan_id,
        "total_count": 120,  # 10 years of monthly billing cycles
        "customer_notify": 1,
        "notes": {"user_id": req.user_id},
    })
    return {
        "subscription_id": subscription["id"],
        "key_id": _KEY_ID,
        "currency": currency,
    }


# ── Verify ────────────────────────────────────────────────────────────────────

class VerifyRequest(BaseModel):
    user_id: str
    razorpay_payment_id: str
    razorpay_subscription_id: str
    razorpay_signature: str


@router.post("/razorpay/verify")
async def verify_payment(req: VerifyRequest, authorization: Optional[str] = Header(None)):
    """Verify Razorpay subscription payment signature and activate Pro."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required.")
    verified_user_id = await asyncio.to_thread(auth_utils.verify_token, authorization)
    if verified_user_id != req.user_id:
        raise HTTPException(status_code=403, detail="user_id does not match authenticated user.")

    # Subscription signature: HMAC(key_secret, payment_id + "|" + subscription_id)
    msg = f"{req.razorpay_payment_id}|{req.razorpay_subscription_id}".encode()
    expected = hmac.new(_KEY_SECRET.encode(), msg, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, req.razorpay_signature):
        raise HTTPException(status_code=400, detail="Invalid payment signature.")

    # Fetch subscription to get current billing period end
    sub_data = _get(f"/subscriptions/{req.razorpay_subscription_id}")
    period_end = _unix_to_iso(sub_data.get("current_end"))

    sub_store.upsert_subscription(
        user_id=verified_user_id,
        tier="pro",
        stripe_customer_id=None,
        stripe_subscription_id=req.razorpay_subscription_id,
        status="active",
        period_end=period_end,
    )
    return {"ok": True}


# ── Cancel ────────────────────────────────────────────────────────────────────

@router.post("/razorpay/cancel")
async def cancel_subscription(authorization: Optional[str] = Header(None)):
    """Cancel the user's active subscription immediately. Requires valid JWT."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required.")
    user_id = await asyncio.to_thread(auth_utils.verify_token, authorization)

    sub_id = await asyncio.to_thread(sub_store.get_razorpay_subscription_id, user_id)
    if not sub_id:
        raise HTTPException(status_code=404, detail="No active subscription found.")

    # Cancel immediately in Razorpay
    _post(f"/subscriptions/{sub_id}/cancel", {"cancel_at_cycle_end": 0})

    # Downgrade in DB
    sub_store.upsert_subscription(
        user_id=user_id,
        tier="free",
        stripe_customer_id=None,
        stripe_subscription_id=sub_id,
        status="canceled",
    )
    return {"ok": True}


# ── Webhook ───────────────────────────────────────────────────────────────────

@router.post("/razorpay/webhook")
async def webhook(request: Request):
    """Handle Razorpay subscription lifecycle events."""
    raw = await request.body()

    if _WEBHOOK_SECRET:
        sig = request.headers.get("X-Razorpay-Signature", "")
        expected = hmac.new(_WEBHOOK_SECRET.encode(), raw, hashlib.sha256).hexdigest()
        if not hmac.compare_digest(expected, sig):
            raise HTTPException(status_code=400, detail="Invalid webhook signature.")

    event = json.loads(raw.decode())
    event_type = event.get("event", "")
    payload = event.get("payload", {})
    sub_entity = payload.get("subscription", {}).get("entity", {})

    sub_id = sub_entity.get("id", "")
    user_id = sub_entity.get("notes", {}).get("user_id", "")
    period_end = _unix_to_iso(sub_entity.get("current_end"))

    if not user_id:
        return {"ok": True}  # Can't process without user_id

    if event_type in ("subscription.activated", "subscription.charged"):
        sub_store.upsert_subscription(
            user_id=user_id,
            tier="pro",
            stripe_customer_id=None,
            stripe_subscription_id=sub_id,
            status="active",
            period_end=period_end,
        )
    elif event_type == "subscription.halted":
        # Payment failed — keep Pro tier during Razorpay's retry/grace period
        sub_store.upsert_subscription(
            user_id=user_id,
            tier="pro",
            stripe_customer_id=None,
            stripe_subscription_id=sub_id,
            status="halted",
            period_end=period_end,
        )
    elif event_type in ("subscription.cancelled", "subscription.completed"):
        sub_store.upsert_subscription(
            user_id=user_id,
            tier="free",
            stripe_customer_id=None,
            stripe_subscription_id=sub_id,
            status="canceled",
        )

    return {"ok": True}


# ── Get subscription info ─────────────────────────────────────────────────────

@router.get("/razorpay/subscription/{user_id}")
async def get_subscription(user_id: str, authorization: Optional[str] = Header(None)):
    """Return tier + usage for the authenticated user only."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required.")
    verified_user_id = await asyncio.to_thread(auth_utils.verify_token, authorization)
    if verified_user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied.")
    return sub_store.get_subscription_info(user_id)
