import re
from api.models.responses import Scores

STRONG_ACTION_VERBS = {
    "achieved", "accelerated", "built", "created", "delivered", "designed",
    "developed", "drove", "engineered", "established", "expanded", "generated",
    "implemented", "improved", "increased", "launched", "led", "managed",
    "optimized", "reduced", "scaled", "shipped", "solved", "streamlined",
    "transformed", "utilized",
}


def compute_match_percent(resume_text: str, jd_analysis: dict) -> int:
    """Keyword overlap between resume and JD required+ats keywords."""
    keywords = set(
        k.lower()
        for k in jd_analysis.get("ats_keywords", []) + jd_analysis.get("required_skills", [])
    )
    if not keywords:
        return 0
    resume_lower = resume_text.lower()
    matched = sum(1 for k in keywords if k in resume_lower)
    return min(100, int((matched / len(keywords)) * 100))


def compute_ats_score(resume_structured: dict) -> int:
    """
    Simple ATS-friendliness heuristics:
    - No layout warning: +40
    - Has contact info: +20
    - Has standard section names: +20
    - No tables/columns detected: +20
    """
    score = 0
    layout = resume_structured.get("layout_warning", "none")
    if layout == "none":
        score += 40
    elif layout == "creative":
        score += 10

    contact = resume_structured.get("contact", {})
    if contact.get("email"):
        score += 10
    if contact.get("phone"):
        score += 10

    standard_titles = {"experience", "education", "skills", "work experience", "projects"}
    section_titles = {s.get("title", "").lower() for s in resume_structured.get("sections", [])}
    if section_titles & standard_titles:
        score += 20

    if layout not in ("table", "columns"):
        score += 20

    return min(100, score)


def compute_strength_score(resume_structured: dict) -> int:
    """
    Bullet strength based on:
    - % bullets starting with strong action verbs
    - % bullets with quantified results (numbers/%)
    """
    all_bullets = []
    for section in resume_structured.get("sections", []):
        for entry in section.get("entries", []):
            for bullet in entry.get("bullets", []):
                all_bullets.append(bullet.get("text", ""))

    if not all_bullets:
        return 50

    verb_count = 0
    quant_count = 0
    for b in all_bullets:
        first_word = b.strip().split()[0].lower().rstrip(".,") if b.strip() else ""
        if first_word in STRONG_ACTION_VERBS:
            verb_count += 1
        if re.search(r"\d+", b):
            quant_count += 1

    verb_pct = verb_count / len(all_bullets)
    quant_pct = quant_count / len(all_bullets)

    score = int((verb_pct * 60) + (quant_pct * 40))
    return min(100, score)


def compute_scores(resume_structured: dict, jd_analysis: dict, resume_text: str) -> Scores:
    return Scores(
        match_percent=compute_match_percent(resume_text, jd_analysis),
        ats_score=compute_ats_score(resume_structured),
        strength_score=compute_strength_score(resume_structured),
    )
