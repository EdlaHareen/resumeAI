from pydantic import BaseModel
from typing import List, Optional, Dict


class BulletDiff(BaseModel):
    bullet_id: str
    section: str
    original: str
    tailored: str
    keywords_added: List[str]
    action_verb_changed: bool


class Scores(BaseModel):
    match_percent: int       # 0-100: keyword overlap with JD
    ats_score: int           # 0-100: ATS-friendliness of resume
    strength_score: int      # 0-100: bullet strength (quantification, action verbs)


class JDAnalysis(BaseModel):
    required_skills: List[str]
    preferred_skills: List[str]
    ats_keywords: List[str]
    role_level: str          # entry / mid / senior
    industry: str


class EdgeCase(BaseModel):
    type: str                # "creative_layout" | "short_jd" | "sparse_resume" | "no_bullets"
    message: str
    severity: str            # "warning" | "info"


class TailorResponse(BaseModel):
    session_id: str
    scores: Scores
    jd_analysis: JDAnalysis
    diff: List[BulletDiff]
    edge_cases: List[EdgeCase]
    total_bullets: int
    changed_bullets: int


class HealthResponse(BaseModel):
    status: str
    ai_providers: Dict[str, str]  # provider -> "ok" | "missing_key" | "error"
