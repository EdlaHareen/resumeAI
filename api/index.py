import sys
import os

_backend = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if _backend not in sys.path:
    sys.path.insert(0, _backend)

from main import app
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))

# Serve /assets/* directly from the built frontend
if os.path.isdir(os.path.join(_dist, "assets")):
    app.mount("/assets", StaticFiles(directory=os.path.join(_dist, "assets")), name="assets")

# SPA catch-all: serve index.html for everything that isn't an API route or asset
@app.get("/{full_path:path}", include_in_schema=False)
async def _spa_fallback(full_path: str):
    return FileResponse(os.path.join(_dist, "index.html"))
