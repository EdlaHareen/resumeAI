import os
from fastapi import APIRouter
from api.models.responses import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health():
    providers = {}

    anthropic_key = os.getenv("ANTHROPIC_API_KEY", "").strip()
    providers["claude"] = "ok" if anthropic_key else "missing_key"

    openai_key = os.getenv("OPENAI_API_KEY", "").strip()
    providers["openai"] = "ok" if openai_key else "missing_key"

    status = "ok" if anthropic_key or openai_key else "degraded"
    return HealthResponse(status=status, ai_providers=providers)
