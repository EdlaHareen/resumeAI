import sys
import os

# Add backend/ to the path so imports like "from api.routes..." work
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from mangum import Mangum
from main import app

handler = Mangum(app, lifespan="off")
