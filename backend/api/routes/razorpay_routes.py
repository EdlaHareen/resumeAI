"""
Razorpay integration:
  POST /api/razorpay/subscribe          — create subscription, return key + sub id to frontend
  POST /api/razorpay/verify             — verify payment signature, immediately upgrade user
  POST /api/razorpay/webhook            — handle Razorpay webhook events
  GET  /api/razorpay/subscription/{id} — return current tier + usage
"""
import base64
import hashlib
import hmac
import json
import os
import urllib.error
import urllib.request
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
_PLAN_INR = os.getenv("RAZORPAY_PLAN_ID_INR", "")
_PLAN_USD = os.getenv("RAZORPAY_PLAN_ID_USD", "")

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


class SubscribeRequest(BaseModel):
    user_id: str
    user_email: Optional[str] = None
    currency: str = "INR"  # "INR" or "USD"


@router.post("/razorpay/subscribe")
async def create_subscription(req: SubscribeRequest):
    if not _KEY_ID or not _KEY_SECRET:
        raise HTTPException(status_code=500, detail="Razorpay is not configured.")
    plan_id = _PLAN_USD if req.currency.upper() == "USD" else _PLAN_INR
    if not plan_id:
        raise HTTPException(status_code=500, detail=f"Plan not configured for {req.currency}.")

    sub = _post("/subscriptions", {
        "plan_id": plan_id,
        "total_count": 120,  # 10 years of monthly billing
        "quantity": 1,
        "notes": {"user_id": req.user_id},
    })
    return {
        "subscription_id": sub["id"],
        "key_id": _KEY_ID,
        "currency": req.currency.upper(),
    }


class VerifyRequest(BaseModel):
    user_id: str
    razorpay_payment_id: str
    razorpay_subscription_id: str
    razorpay_signature: str


@router.post("/razorpay/verify")
async def verify_payment(req: VerifyRequest, authorization: str = Header(...)):
    """Verify Razorpay payment signature and immediately upgrade user to Pro.
    Requires a valid Supabase JWT — user_id is taken from the token, not the request body.
    """
    # Verify JWT and extract authoritative user_id
    verified_user_id = await asyncio.to_thread(auth_utils.verify_token, authorization)
    if verified_user_id != req.user_id:
        raise HTTPException(status_code=403, detail="user_id does not match authenticated user.")

    msg = f"{req.razorpay_payment_id}|{req.razorpay_subscription_id}".encode()
    expected = hmac.new(_KEY_SECRET.encode(), msg, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, req.razorpay_signature):
        raise HTTPException(status_code=400, detail="Invalid payment signature.")
    sub_store.upsert_subscription(
        user_id=verified_user_id,
        tier="pro",
        stripe_customer_id=None,
        stripe_subscription_id=req.razorpay_subscription_id,
        status="active",
    )
    return {"ok": True}


@router.post("/razorpay/webhook")
async def razorpay_webhook(
    request: Request,
    x_razorpay_signature: Optional[str] = Header(None, alias="x-razorpay-signature"),
):
    body = await request.body()
    if not _WEBHOOK_SECRET:
        raise HTTPException(status_code=500, detail="Webhook secret not configured.")

    expected = hmac.new(_WEBHOOK_SECRET.encode(), body, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, x_razorpay_signature or ""):
        raise HTTPException(status_code=400, detail="Invalid webhook signature.")

    event = json.loads(body)
    etype = event.get("event", "")
    entity = event.get("payload", {}).get("subscription", {}).get("entity", {})
    user_id = (entity.get("notes") or {}).get("user_id")
    sub_id = entity.get("id")

    if etype == "subscription.activated" and user_id:
        sub_store.upsert_subscription(
            user_id=user_id,
            tier="pro",
            stripe_customer_id=None,
            stripe_subscription_id=sub_id,
            status="active",
        )
    elif etype in ("subscription.cancelled", "subscription.completed") and sub_id:
        sub_store.deactivate_by_subscription_id(sub_id)

    return {"received": True}


@router.get("/razorpay/subscription/{user_id}")
async def get_subscription(user_id: str, authorization: str = Header(...)):
    """Return tier + usage for the authenticated user only."""
    verified_user_id = await asyncio.to_thread(auth_utils.verify_token, authorization)
    if verified_user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied.")
    return sub_store.get_subscription_info(user_id)
