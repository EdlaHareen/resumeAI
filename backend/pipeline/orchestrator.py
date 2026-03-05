import asyncio
import time
import uuid
import threading
from typing import Dict, Any, List

from api.models.responses import TailorResponse, EdgeCase, JDAnalysis
from pipeline.stage1_parse import parse_resume
from pipeline.stage2_analyze import analyze_jd
from pipeline.stage3_rewrite import rewrite_bullets
from pipeline.stage4_validate import validate_rewrites
from utils.diff import build_diff
from utils.scoring import compute_scores

# In-memory session store: session_id -> {data, expires_at}
_sessions: Dict[str, Dict[str, Any]] = {}
_lock = threading.Lock()
SESSION_TTL = 600  # 10 minutes


def _evict_expired():
    now = time.time()
    expired = [sid for sid, s in _sessions.items() if s["expires_at"] < now]
    for sid in expired:
        del _sessions[sid]


def get_session(session_id: str) -> Dict[str, Any]:
    with _lock:
        _evict_expired()
        session = _sessions.get(session_id)
        if session is None:
            raise KeyError(f"Session {session_id} not found or expired")
        return session["data"]


def delete_session(session_id: str):
    with _lock:
        _sessions.pop(session_id, None)


def _detect_edge_cases(resume_structured: dict, jd_text: str) -> List[EdgeCase]:
    cases = []

    layout = resume_structured.get("layout_warning", "none")
    if layout in ("creative", "table", "columns"):
        cases.append(EdgeCase(
            type="creative_layout",
            message="Your resume uses a complex layout. Some formatting may not transfer to the tailored version.",
            severity="warning",
        ))

    bullet_count = sum(
        len(entry.get("bullets", []))
        for section in resume_structured.get("sections", [])
        for entry in section.get("entries", [])
    )
    if bullet_count == 0:
        cases.append(EdgeCase(
            type="no_bullets",
            message="No bullet points were found in your resume. Consider adding bullet points to your experience section for best results.",
            severity="warning",
        ))
    elif bullet_count < 5:
        cases.append(EdgeCase(
            type="sparse_resume",
            message="Your resume has very few bullet points. Adding more detail to your experience will improve tailoring results.",
            severity="info",
        ))

    if len(jd_text.split()) < 150:
        cases.append(EdgeCase(
            type="short_jd",
            message="The job description is quite short. For best results, paste the full job description including requirements and responsibilities.",
            severity="warning",
        ))

    return cases


def _run_pipeline_sync(resume_text: str, jd_text: str) -> TailorResponse:
    """
    Blocking pipeline that runs all 4 AI stages sequentially.
    Must be called from a thread pool (via asyncio.to_thread), NOT directly
    from an async context -- all AI SDK calls are blocking HTTP.
    """
    resume_structured = parse_resume(resume_text)
    jd_analysis_raw = analyze_jd(jd_text)
    rewrites = rewrite_bullets(resume_structured, jd_analysis_raw)
    verdicts = validate_rewrites(resume_structured, rewrites)

    diff = build_diff(resume_structured, rewrites, verdicts)
    scores = compute_scores(resume_structured, jd_analysis_raw, resume_text)
    edge_cases = _detect_edge_cases(resume_structured, jd_text)

    total_bullets = sum(
        len(entry.get("bullets", []))
        for section in resume_structured.get("sections", [])
        for entry in section.get("entries", [])
    )

    jd_analysis = JDAnalysis(
        required_skills=jd_analysis_raw.get("required_skills", []),
        preferred_skills=jd_analysis_raw.get("preferred_skills", []),
        ats_keywords=jd_analysis_raw.get("ats_keywords", []),
        role_level=jd_analysis_raw.get("role_level", "mid"),
        industry=jd_analysis_raw.get("industry", ""),
    )

    session_id = str(uuid.uuid4())
    response = TailorResponse(
        session_id=session_id,
        scores=scores,
        jd_analysis=jd_analysis,
        diff=diff,
        edge_cases=edge_cases,
        total_bullets=total_bullets,
        changed_bullets=len(diff),
    )

    with _lock:
        _evict_expired()
        _sessions[session_id] = {
            "data": {
                "resume_structured": resume_structured,
                "resume_text": resume_text,
                "rewrites": rewrites,
                "response": response,
            },
            "expires_at": time.time() + SESSION_TTL,
        }

    return response


async def run_pipeline(resume_text: str, jd_text: str) -> TailorResponse:
    """
    Async entry point. Offloads the blocking AI pipeline to a thread pool
    so the FastAPI event loop stays unblocked and connections stay alive.
    """
    return await asyncio.to_thread(_run_pipeline_sync, resume_text, jd_text)
