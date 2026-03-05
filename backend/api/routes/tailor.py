from fastapi import APIRouter, File, Form, UploadFile, HTTPException
from api.models.responses import TailorResponse
from parsers.pdf_parser import parse_pdf
from parsers.docx_parser import parse_docx
from pipeline.orchestrator import run_pipeline

router = APIRouter()

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB
MIN_JD_WORDS = 50


@router.post("/tailor", response_model=TailorResponse)
async def tailor_resume(
    resume_file: UploadFile = File(...),
    job_description: str = Form(...),
):
    # Validate file type
    filename = (resume_file.filename or "").lower()
    if not (filename.endswith(".pdf") or filename.endswith(".docx")):
        raise HTTPException(
            status_code=400,
            detail={"code": "unsupported_file_type", "message": "Only PDF and DOCX files are supported."},
        )

    # Read and validate file size
    file_bytes = await resume_file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail={"code": "file_too_large", "message": "File must be under 5 MB."},
        )

    # Parse resume text
    try:
        if filename.endswith(".pdf"):
            resume_text = parse_pdf(file_bytes)
        else:
            resume_text = parse_docx(file_bytes)
    except Exception:
        raise HTTPException(
            status_code=422,
            detail={"code": "parse_failed", "message": "Could not extract text from your resume. Try saving as a different format."},
        )

    if not resume_text.strip():
        raise HTTPException(
            status_code=422,
            detail={"code": "parse_failed", "message": "No text found in resume. Ensure it is not a scanned image."},
        )

    # Validate JD length
    jd_words = len(job_description.split())
    if jd_words < MIN_JD_WORDS:
        raise HTTPException(
            status_code=400,
            detail={"code": "jd_too_short", "message": f"Job description is too short ({jd_words} words). Paste the full description for best results."},
        )

    # Run pipeline
    try:
        result = await run_pipeline(resume_text, job_description)
    except RuntimeError as e:
        raise HTTPException(
            status_code=503,
            detail={"code": "ai_unavailable", "message": str(e)},
        )

    return result
