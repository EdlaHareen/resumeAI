import json
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import Response
from pydantic import BaseModel
from ai.client import call_llm_async
from ai.router import select_model
from ai.prompts import STAGE5_SYSTEM, STAGE5_PROMPT
from generators.cover_letter_generator import (
    generate_cover_letter_pdf_from_text,
)
from limiter import limiter

router = APIRouter()


# ---------------------------------------------------------------------------
# Shared input models
# ---------------------------------------------------------------------------

class ContactInfoIn(BaseModel):
    email: str = ""
    phone: str = ""
    location: str = ""
    linkedin: str = ""


class RecentRoleIn(BaseModel):
    company: str
    role: str
    dates: str


class ResumeSummaryIn(BaseModel):
    name: str
    title: Optional[str] = None
    summary: Optional[str] = None
    contact: ContactInfoIn = ContactInfoIn()
    sections: List[str] = []
    recent_roles: List[RecentRoleIn] = []


class JDAnalysisIn(BaseModel):
    required_skills: List[str] = []
    preferred_skills: List[str] = []
    ats_keywords: List[str] = []
    role_level: str = "mid"
    industry: str = ""


# ---------------------------------------------------------------------------
# POST /api/cover-letter  →  returns JSON text for display/editing
# ---------------------------------------------------------------------------

class CoverLetterRequest(BaseModel):
    resume_summary: ResumeSummaryIn
    jd_analysis: JDAnalysisIn


class CoverLetterTextResponse(BaseModel):
    cover_letter: str       # full assembled text for display/editing
    hiring_manager: str
    company_name: str
    job_title: str


import re as _re


def _parse_json_response(text: str) -> dict:
    """Strip markdown fences and parse the first valid JSON object, ignoring trailing text."""
    text = text.strip()
    # Strip ```json ... ``` or ``` ... ``` fences
    if "```" in text:
        m = _re.search(r"```(?:json)?\s*([\s\S]*?)```", text)
        if m:
            text = m.group(1).strip()
    # Use raw_decode to stop after the first valid JSON object,
    # ignoring any trailing prose the model may have appended.
    decoder = json.JSONDecoder()
    start = next((i for i, c in enumerate(text) if c in "{["), 0)
    obj, _ = decoder.raw_decode(text, start)
    return obj


@router.post("/cover-letter", response_model=CoverLetterTextResponse)
@limiter.limit("5/minute")
async def generate_cover_letter_route(
    request: Request,
    req: CoverLetterRequest,
) -> CoverLetterTextResponse:
    prompt = STAGE5_PROMPT.format(
        resume_summary=json.dumps(req.resume_summary.model_dump(), indent=2),
        jd_analysis=json.dumps(req.jd_analysis.model_dump(), indent=2),
    )

    try:
        raw = await call_llm_async(
            prompt=prompt,
            model=select_model(5),
            system=STAGE5_SYSTEM,
            max_tokens=2048,
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Cover letter generation failed: {e}")

    try:
        cover_data = _parse_json_response(raw)
    except (json.JSONDecodeError, ValueError, StopIteration) as e:
        raise HTTPException(status_code=502, detail=f"AI returned invalid JSON: {e}")

    # Assemble full readable text from the 4 paragraphs
    paragraphs = [
        cover_data.get("paragraph1", ""),
        cover_data.get("paragraph2", ""),
        cover_data.get("paragraph3", ""),
        cover_data.get("paragraph4", ""),
    ]
    full_text = "\n\n".join(p for p in paragraphs if p.strip())

    return CoverLetterTextResponse(
        cover_letter=full_text,
        hiring_manager=cover_data.get("hiring_manager", "Hiring Manager"),
        company_name=cover_data.get("company_name", ""),
        job_title=cover_data.get("job_title", ""),
    )


# ---------------------------------------------------------------------------
# POST /api/cover-letter/pdf  →  compile (possibly edited) text to PDF
# ---------------------------------------------------------------------------

class CoverLetterPdfRequest(BaseModel):
    resume_summary: ResumeSummaryIn
    cover_letter_text: str       # full text (possibly user-edited)
    hiring_manager: str = "Hiring Manager"
    company_name: str = ""
    job_title: str = ""


@router.post("/cover-letter/pdf")
@limiter.limit("10/minute")
async def generate_cover_letter_pdf_route(
    request: Request,
    req: CoverLetterPdfRequest,
) -> Response:
    try:
        import asyncio
        pdf_bytes = await asyncio.to_thread(
            generate_cover_letter_pdf_from_text,
            req.resume_summary.model_dump(),
            req.cover_letter_text,
            req.hiring_manager,
            req.company_name,
            req.job_title,
        )
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=f"PDF compilation failed: {e}")

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": 'attachment; filename="cover_letter.pdf"'},
    )
