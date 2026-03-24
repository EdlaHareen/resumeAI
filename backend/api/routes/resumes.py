from __future__ import annotations
import logging
from typing import Optional
from fastapi import APIRouter, Header, HTTPException, UploadFile, File, Form
import utils.supabase_store as supabase_store
import utils.auth as auth_utils
import asyncio

router = APIRouter(prefix="/resumes", tags=["resumes"])
logger = logging.getLogger(__name__)

@router.get("/base")
async def get_base_resume(authorization: Optional[str] = Header(None)):
    """Return metadata of the current base resume."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Log in to use base resumes.")
    
    user_id = await asyncio.to_thread(auth_utils.verify_token, authorization)
    base = await asyncio.to_thread(supabase_store.get_base_resume, user_id)
    
    if not base:
        return {"found": False}
    
    return {
        "found": True,
        "id": base["id"],
        "filename": base["filename"],
        "storage_path": base["storage_path"]
    }

@router.post("/base")
async def upload_base_resume(
    file: UploadFile = File(...),
    authorization: Optional[str] = Header(None)
):
    """Upload a resume and set it as the base."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Log in to save a base resume.")
    
    user_id = await asyncio.to_thread(auth_utils.verify_token, authorization)
    file_bytes = await file.read()
    
    # Upload to storage first
    # Path format: user_id/base_resumes/filename
    storage_path = f"{user_id}/base_resumes/{file.filename}"
    success = await asyncio.to_thread(
        supabase_store.upload_file_to_storage,
        "resumes",
        storage_path,
        file_bytes,
        file.content_type or "application/octet-stream"
    )
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to upload file to storage.")
    
    # Update DB
    db_success = await asyncio.to_thread(
        supabase_store.upsert_base_resume,
        user_id,
        file.filename or "resume",
        storage_path
    )
    
    if not db_success:
        raise HTTPException(status_code=500, detail="Failed to update base resume record.")
    
    return {"ok": True, "filename": file.filename}
