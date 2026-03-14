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


def compute_ats_score(resume_structured: dict, jd_analysis: dict = None, resume_text: str = "") -> int:
    """
    Accurate ATS-friendliness scoring across 10 signals (total 100 pts):
    - Contact completeness      : up to 23 pts
    - Section structure         : up to 23 pts
    - Keyword density vs JD     : up to 20 pts
    - Bullet quality            : up to 15 pts
    - Layout / ATS safety       : up to 14 pts
    - Content depth             : up to 5 pts
    """
    score = 0
    jd_analysis = jd_analysis or {}
    resume_text = resume_text or ""

    # --- Contact completeness (23 pts) ---
    contact = resume_structured.get("contact", {})
    if contact.get("email"):
        score += 10
    if contact.get("phone"):
        score += 8
    if contact.get("linkedin") or contact.get("location"):
        score += 5

    # --- Section structure (23 pts) ---
    section_titles = {s.get("title", "").lower() for s in resume_structured.get("sections", [])}
    core_sections = {"experience", "work experience", "education", "skills"}
    if section_titles & core_sections:
        score += 15
    summary_sections = {"summary", "objective", "profile", "about"}
    if section_titles & summary_sections:
        score += 8

    # --- Keyword density vs JD (20 pts) ---
    keywords = set(
        k.lower()
        for k in jd_analysis.get("ats_keywords", []) + jd_analysis.get("required_skills", [])
    )
    if keywords:
        resume_lower = resume_text.lower()
        matched = sum(1 for k in keywords if k in resume_lower)
        density = matched / len(keywords)
        if density >= 0.6:
            score += 20
        elif density >= 0.4:
            score += 14
        elif density >= 0.2:
            score += 7

    # --- Bullet quality: quantified results (15 pts) ---
    all_bullets = [
        b.get("text", "")
        for s in resume_structured.get("sections", [])
        for e in s.get("entries", [])
        for b in e.get("bullets", [])
    ]
    if all_bullets:
        quant_count = sum(1 for b in all_bullets if re.search(r"\d+", b))
        quant_pct = quant_count / len(all_bullets)
        if quant_pct >= 0.5:
            score += 15
        elif quant_pct >= 0.3:
            score += 9
        elif quant_pct >= 0.1:
            score += 4

    # --- Layout / ATS safety (14 pts) ---
    layout = resume_structured.get("layout_warning", "none")
    if layout == "none":
        score += 10
    elif layout == "creative":
        score += 4
    # No special ATS-breaking characters
    ats_breaking = set("★●◆■▪►▸✓✗✘✔")
    if not any(c in resume_text for c in ats_breaking):
        score += 4

    # --- Content depth: enough bullets (5 pts) ---
    if len(all_bullets) >= 8:
        score += 5
    elif len(all_bullets) >= 4:
        score += 2

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
        ats_score=compute_ats_score(resume_structured, jd_analysis, resume_text),
        strength_score=compute_strength_score(resume_structured),
    )
