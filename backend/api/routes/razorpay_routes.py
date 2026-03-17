"""
Razorpay Orders integration (one-time payment → Pro access):
  POST /api/razorpay/order               — create order, return key + order id
  POST /api/razorpay/verify              — verify payment signature, upgrade user to Pro
  GET  /api/razorpay/subscription/{id}  — return current tier + usage
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

from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel

import utils.subscription_store as sub_store
import utils.auth as auth_utils

router = APIRouter()

_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "")
_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "")

# One-time payment amounts (paise for INR, cents for USD)
_AMOUNT_INR = int(os.getenv("RAZORPAY_AMOUNT_INR", "74900"))  # ₹749
_AMOUNT_USD = int(os.getenv("RAZORPAY_AMOUNT_USD", "900"))    # $9

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


class OrderRequest(BaseModel):
    user_id: str
    currency: str = "INR"  # "INR" or "USD"


@router.post("/razorpay/order")
async def create_order(req: OrderRequest, authorization: Optional[str] = Header(None)):
    """Create a Razorpay order for one-time Pro payment. Requires valid JWT."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required.")
    verified_user_id = await asyncio.to_thread(auth_utils.verify_token, authorization)
    if verified_user_id != req.user_id:
        raise HTTPException(status_code=403, detail="user_id does not match authenticated user.")
    if not _KEY_ID or not _KEY_SECRET:
        raise HTTPException(status_code=500, detail="Razorpay is not configured.")

    currency = req.currency.upper()
    amount = _AMOUNT_USD if currency == "USD" else _AMOUNT_INR

    order = _post("/orders", {
        "amount": amount,
        "currency": currency,
        "notes": {"user_id": req.user_id},
    })
    return {
        "order_id": order["id"],
        "key_id": _KEY_ID,
        "currency": currency,
        "amount": amount,
    }


class VerifyRequest(BaseModel):
    user_id: str
    razorpay_payment_id: str
    razorpay_order_id: str
    razorpay_signature: str


@router.post("/razorpay/verify")
async def verify_payment(req: VerifyRequest, authorization: Optional[str] = Header(None)):
    """Verify Razorpay payment signature and immediately upgrade user to Pro."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required.")
    verified_user_id = await asyncio.to_thread(auth_utils.verify_token, authorization)
    if verified_user_id != req.user_id:
        raise HTTPException(status_code=403, detail="user_id does not match authenticated user.")

    # Signature for orders: HMAC(key_secret, payment_id + "|" + order_id)
    msg = f"{req.razorpay_payment_id}|{req.razorpay_order_id}".encode()
    expected = hmac.new(_KEY_SECRET.encode(), msg, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, req.razorpay_signature):
        raise HTTPException(status_code=400, detail="Invalid payment signature.")

    sub_store.upsert_subscription(
        user_id=verified_user_id,
        tier="pro",
        stripe_customer_id=None,
        stripe_subscription_id=req.razorpay_order_id,
        status="active",
    )
    return {"ok": True}


@router.get("/razorpay/subscription/{user_id}")
async def get_subscription(user_id: str, authorization: Optional[str] = Header(None)):
    """Return tier + usage for the authenticated user only."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required.")
    verified_user_id = await asyncio.to_thread(auth_utils.verify_token, authorization)
    if verified_user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied.")
    return sub_store.get_subscription_info(user_id)
