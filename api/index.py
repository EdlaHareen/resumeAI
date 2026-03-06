import sys
import os

# Add backend/ to the path so FastAPI routes resolve correctly
_backend = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if _backend not in sys.path:
    sys.path.insert(0, _backend)

from main import app  # Vercel's native FastAPI runtime picks up 'app' directly
