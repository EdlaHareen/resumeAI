# Product Brief: ResumeAI v2

**Created:** 2026-03-07T05:48:21.097Z

## Description

ResumeAI is an AI-powered resume tailoring platform (V1 live). Core flow: user uploads resume (PDF/DOCX) + pastes job description → Claude AI runs a 4-stage pipeline (Stage 1: parse resume to structured JSON via Haiku, Stage 2: analyze JD for ATS keywords via Haiku, Stage 3: rewrite bullets to match

## Full Input

ResumeAI is an AI-powered resume tailoring platform (V1 live). Core flow: user uploads resume (PDF/DOCX) + pastes job description → Claude AI runs a 4-stage pipeline (Stage 1: parse resume to structured JSON via Haiku, Stage 2: analyze JD for ATS keywords via Haiku, Stage 3: rewrite bullets to match JD without hallucination via Sonnet, Stage 4: hallucination validation via Sonnet) → user reviews diff of original vs tailored bullets (accept/reject/edit per bullet) → downloads tailored resume as PDF or DOCX → optional AI cover letter (Stage 5: async Sonnet, JSON output for LaTeX PDF). Stack: FastAPI backend + React 19/TypeScript/Tailwind CSS 4 frontend, Supabase auth (optional), Upstash Redis session store (10min TTL), slowapi rate limiting (10/min tailor, 5/min cover-letter), reportlab + python-docx + LaTeX (tectonic) for output. Scoring: match_percent (keyword overlap), ats_score (heuristics), strength_score (action verbs + quantified results). Features already built: SSE streaming progress, edge case detection, bullet accept/reject/edit, ATS keyword chips, download bar with PDF+DOCX. Planned for V2: LaTeX cover letter PDF (detailed plan ready), Stripe freemium (pricing UI in LandingPage already), resume template gallery (3 LaTeX templates), interview prep mode (Stage 6), Chrome extension (Manifest V3). The question: what should V2 look like — what new features to add, what existing features to improve, and how to prioritize them?
