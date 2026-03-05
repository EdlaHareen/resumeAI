from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from io import BytesIO

from api.models.requests import DownloadRequest
from pipeline.orchestrator import get_session, delete_session
from generators.latex_generator import generate_pdf_latex
from generators.docx_generator import generate_docx

router = APIRouter()


def _resolve_bullets(resume_structured: dict, accepted_bullets: dict, rewrites: dict) -> dict:
    """
    Build final bullet map: bullet_id -> final text.
    accepted_bullets maps bullet_id -> "original" or the accepted tailored text.
    """
    final: dict = {}
    for section in resume_structured.get("sections", []):
        for entry in section.get("entries", []):
            for bullet in entry.get("bullets", []):
                bid = bullet["bullet_id"]
                choice = accepted_bullets.get(bid)
                if choice == "original" or choice is None:
                    final[bid] = bullet["text"]
                else:
                    # Use the accepted tailored text (or rewrites fallback)
                    final[bid] = choice if choice else bullet["text"]
    return final


@router.post("/download/pdf")
async def download_pdf(req: DownloadRequest):
    try:
        session = get_session(req.session_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="Session expired or not found. Please re-upload your resume.")

    resume_structured = session["resume_structured"]
    rewrites = session.get("rewrites", {})

    final_bullets = _resolve_bullets(resume_structured, req.accepted_bullets, rewrites)

    try:
        pdf_bytes = generate_pdf_latex(resume_structured, final_bullets)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")

    delete_session(req.session_id)

    return StreamingResponse(
        BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=tailored_resume.pdf"},
    )


@router.post("/download/docx")
async def download_docx(req: DownloadRequest):
    try:
        session = get_session(req.session_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="Session expired or not found. Please re-upload your resume.")

    resume_structured = session["resume_structured"]
    rewrites = session.get("rewrites", {})

    final_bullets = _resolve_bullets(resume_structured, req.accepted_bullets, rewrites)

    try:
        docx_bytes = generate_docx(resume_structured, final_bullets)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DOCX generation failed: {str(e)}")

    delete_session(req.session_id)

    return StreamingResponse(
        BytesIO(docx_bytes),
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": "attachment; filename=tailored_resume.docx"},
    )
