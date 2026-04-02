import json
from ai.client import call_llm_json
from ai.router import select_model
from ai.prompts import STAGE3_SYSTEM, STAGE3_PROMPT


def rewrite_bullets(resume_structured: dict, jd_analysis: dict) -> dict:
    """
    Stage 3: Rewrite resume bullets to match JD keywords.
    Returns dict mapping bullet_id -> rewrite info.
    """
    model = select_model(3)

    # Flatten bullets WITH section/role context so the model knows what each bullet is about
    bullets = []
    for section in resume_structured.get("sections", []):
        section_title = section.get("title", "")
        section_type = section.get("type", "other")
        for entry in section.get("entries", []):
            role = entry.get("role", "")
            company = entry.get("company", "")
            for bullet in entry.get("bullets", []):
                bullets.append({
                    "bullet_id": bullet["bullet_id"],
                    "text": bullet["text"],
                    "section": section_title,
                    "section_type": section_type,
                    "role": role,
                    "company": company,
                })

    if not bullets:
        return {"rewrites": []}

    # Build JD summary for prompt
    jd_summary = {
        "ats_keywords": jd_analysis.get("ats_keywords", []),
        "required_skills": jd_analysis.get("required_skills", []),
        "preferred_skills": jd_analysis.get("preferred_skills", []),
        "responsibilities": jd_analysis.get("responsibilities", [])[:5],
    }
    jd_tools = jd_analysis.get("jd_tools", [])

    prompt = STAGE3_PROMPT.format(
        jd_analysis=json.dumps(jd_summary, indent=2),
        jd_tools=json.dumps(jd_tools, indent=2),
        bullets_json=json.dumps(bullets, indent=2),
    )

    result = call_llm_json(prompt, model, system=STAGE3_SYSTEM, max_tokens=8192)
    # Index by bullet_id for fast lookup
    indexed = {}
    for rw in result.get("rewrites", []):
        indexed[rw["bullet_id"]] = rw
    return indexed
