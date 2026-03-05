from pydantic import BaseModel
from typing import Dict


class DownloadRequest(BaseModel):
    session_id: str
    accepted_bullets: Dict[str, str]  # bullet_id -> "text" (accepted text) or "original"
