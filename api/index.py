import sys
import os
import traceback

# Add backend/ to the path so imports like "from api.routes..." work
_backend = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if _backend not in sys.path:
    sys.path.insert(0, _backend)

try:
    from mangum import Mangum
    from main import app
    handler = Mangum(app, lifespan="off")
except Exception as _e:
    # Surface the real import error as a readable API response
    _err = traceback.format_exc()
    print("STARTUP ERROR:", _err)
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse
    _app = FastAPI()

    @_app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"])
    async def _error(path: str = ""):
        return JSONResponse({"startup_error": str(_e), "traceback": _err}, status_code=500)

    handler = Mangum(_app, lifespan="off")
