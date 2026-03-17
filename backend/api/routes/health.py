import os
import shutil
from fastapi import APIRouter
from api.models.responses import HealthResponse

router = APIRouter()


@router.get("/health")
async def health():
    providers = {}

    anthropic_key = os.getenv("ANTHROPIC_API_KEY", "").strip()
    providers["claude"] = "ok" if anthropic_key else "missing_key"

    openai_key = os.getenv("OPENAI_API_KEY", "").strip()
    providers["openai"] = "ok" if openai_key else "missing_key"

    # Session persistence
    has_redis = bool(
        (os.getenv("KV_REST_API_URL") and os.getenv("KV_REST_API_TOKEN"))
        or (os.getenv("UPSTASH_REDIS_REST_URL") and os.getenv("UPSTASH_REDIS_REST_TOKEN"))
    )
    has_supabase_backend = bool(
        os.getenv("SUPABASE_URL") and os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    )

    if has_redis:
        session_store = "upstash_redis"
    elif has_supabase_backend:
        session_store = "supabase_only"
    else:
        session_store = "in_memory_only"  # sessions lost between serverless invocations!

    # backend/bin/tectonic — build.sh CWD is backend/ (rootDir: backend in render.yaml)
    _project_bin = os.path.normpath(
        os.path.join(os.path.dirname(__file__), "..", "..", "bin", "tectonic")
    )
    tectonic_candidates = [
        shutil.which("tectonic"),
        _project_bin,
        "/opt/homebrew/bin/tectonic",
    ]
    tectonic_found = next((p for p in tectonic_candidates if p and os.path.exists(p)), None)
    has_tectonic = bool(tectonic_found)

    status = "ok" if (anthropic_key or openai_key) else "degraded"
    if session_store == "in_memory_only":
        status = "degraded"

    return {
        "status": status,
        "ai_providers": providers,
        "session_store": session_store,
        "supabase_backend": has_supabase_backend,
        "pdf_generator": "latex" if has_tectonic else "reportlab_fallback",
        "tectonic_debug": {
            "found_at": tectonic_found,
            "project_bin_path": _project_bin,
            "project_bin_exists": os.path.exists(_project_bin),
        },
    }
