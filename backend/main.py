import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from api.routes.health import router as health_router
from api.routes.tailor import router as tailor_router
from api.routes.download import router as download_router

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="ResumeAI API", version="1.0.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(tailor_router)
app.include_router(download_router)


# Apply rate limit to /tailor
@app.middleware("http")
async def rate_limit_tailor(request: Request, call_next):
    return await call_next(request)
