import json
from ai.client import call_llm
from ai.router import select_model
from ai.prompts import STAGE5_SYSTEM, STAGE5_PROMPT


def generate_cover_letter(resume_summary: dict, jd_analysis: dict) -> str:
    """Stage 5: Generate tailored cover letter.

    resume_summary: condensed resume dict with keys: name, title, summary,
                    sections, recent_roles.
    jd_analysis: dict with keys: required_skills, preferred_skills,
                 ats_keywords, role_level, industry.
    """
    model = select_model(5)

    prompt = STAGE5_PROMPT.format(
        resume_summary=json.dumps(resume_summary, indent=2),
        jd_analysis=json.dumps(jd_analysis, indent=2),
    )
    return call_llm(prompt, model, system=STAGE5_SYSTEM, max_tokens=2048)
