from pydantic import BaseModel
from typing import Dict, Optional


class DownloadRequest(BaseModel):
    session_id: str
    accepted_bullets: Dict[str, str]  # bullet_id -> "text" (accepted text) or "original"
    user_id: Optional[str] = None
