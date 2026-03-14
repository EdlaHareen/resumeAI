---
title: "feat: Cover Letter Generation (Stage 5)"
deepened: 2026-03-06
agents_run: 10
---

## Enhancement Summary (Deepened)

**Key findings from research agents — all must be applied during implementation:**

### Backend Critical Fixes (from kieran-python-reviewer)
1. **Add `import asyncio`** to `cover_letter.py` — missing causes runtime `NameError`
2. **Catch `KeyError` from `get_session`** → raise `HTTPException(status_code=404)` — currently would 500
3. **Use `max_tokens=2048`** not 1024 — 1024 silently truncates, no error raised
4. **`json.dumps` both args** — `resume_summary` and `jd_analysis` must be serialized before `.format()`
5. **Rename route handler** from `generate` → `generate_cover_letter_route`
6. **Condense `resume_summary`** — never pass full `resume_structured` dict to prompt (too large); extract name + section titles + key bullets only
7. **`jd_analysis` path is correct**: `session["response"]["jd_analysis"]` resolves to `JDAnalysis.model_dump()` with keys: `required_skills`, `preferred_skills`, `ats_keywords`, `role_level`, `industry`

### Frontend Critical Fixes (from kieran-typescript-reviewer)
1. **Remove dead `coverLetter` state** from App.tsx — generation is local to CoverLetterPage
2. **Remove `async handleCoverLetter`** — inline as `() => setStep("cover-letter")`
3. **Add AbortController + timeout** to `generateCoverLetter()` in client.ts — match `tailorResume` pattern
4. **Type `resp.json()` explicitly** as `{ cover_letter: string }` — not implicit `any`
5. **Regenerate race condition** — use `abortRef = useRef<AbortController | null>(null)` to cancel in-flight on re-click
6. **`navigator.clipboard.writeText` needs try/catch** — fails on HTTP; fallback: `textareaRef.current?.select()`
7. **Pass `user`, `onDashboard`, `onSignOut`** to CoverLetterPage — matches ReviewPage prop surface
8. **Define `CoverLetterPageProps` interface** before implementing component

### Corrected Backend Code

```python
# backend/pipeline/stage5_cover_letter.py
import json
from ai.client import call_llm
from ai.router import select_model
from ai.prompts import STAGE5_SYSTEM, STAGE5_PROMPT

def generate_cover_letter(resume_structured: dict, jd_analysis: dict) -> str:
    """Stage 5: Generate tailored cover letter.
    resume_structured: raw parse output from stage1 (not model_dump).
    jd_analysis: model_dump() of JDAnalysis — keys: required_skills, preferred_skills, ats_keywords, role_level, industry.
    """
    model = select_model(5)
    resume_summary = {
        "name": resume_structured.get("name", ""),
        "title": resume_structured.get("title", ""),
        "summary": resume_structured.get("summary", ""),
        "sections": [s.get("title") for s in resume_structured.get("sections", [])],
    }
    prompt = STAGE5_PROMPT.format(
        resume_summary=json.dumps(resume_summary, indent=2),
        jd_analysis=json.dumps(jd_analysis, indent=2),
    )
    return call_llm(prompt, model, system=STAGE5_SYSTEM, max_tokens=2048)
```

```python
# backend/api/routes/cover_letter.py
import asyncio
from fastapi import APIRouter, HTTPException
from api.models.responses import CoverLetterResponse
from pipeline.orchestrator import get_session
from pipeline.stage5_cover_letter import generate_cover_letter

router = APIRouter()

@router.post("/cover-letter/{session_id}", response_model=CoverLetterResponse)
async def generate_cover_letter_route(session_id: str) -> CoverLetterResponse:
    try:
        session = get_session(session_id)
    except KeyError:
        raise HTTPException(
            status_code=404,
            detail="Session expired or not found. Please re-upload your resume.",
        )
    resume_structured: dict = session["resume_structured"]
    jd_analysis: dict = session["response"]["jd_analysis"]
    text = await asyncio.to_thread(generate_cover_letter, resume_structured, jd_analysis)
    return CoverLetterResponse(cover_letter=text)
```

### Corrected Frontend Code

```typescript
// api/client.ts — generateCoverLetter with timeout + typed response
export async function generateCoverLetter(
  sessionId: string,
  signal?: AbortSignal
): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60_000); // 60s for cover letter
  const combinedSignal = signal
    ? AbortSignal.any([signal, controller.signal])
    : controller.signal;
  let resp: Response;
  try {
    resp = await fetch(`${BASE}/cover-letter/${sessionId}`, {
      method: "POST",
      signal: combinedSignal,
    });
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError")
      throw new Error("Cover letter generation timed out. Please try again.");
    throw new Error("Could not reach the server.");
  } finally {
    clearTimeout(timeout);
  }
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ detail: "Generation failed" }));
    throw new Error(typeof err.detail === "string" ? err.detail : "Cover letter generation failed");
  }
  const data: { cover_letter: string } = await resp.json();
  return data.cover_letter;
}
```

```typescript
// App.tsx — correct case (no dead state, no async wrapper)
// Remove: const [coverLetter, setCoverLetter] = useState<string>("");
// Remove: async function handleCoverLetter() { ... }
// In ReviewPage: onCoverLetter={() => setStep("cover-letter")}

case "cover-letter":
  return result ? (
    <CoverLetterPage
      sessionId={result.session_id}
      onDone={() => setStep("done")}
      user={user}
      onDashboard={() => setStep("dashboard")}
      onSignOut={handleSignOut}
      onLogoClick={handleLogoClick}
    />
  ) : null;
```

```typescript
// CoverLetterPage.tsx — props interface + regenerate race fix
import type { User } from "@supabase/supabase-js";

interface CoverLetterPageProps {
  sessionId: string;
  onDone: () => void;
  user: User | null;
  onDashboard: () => void;
  onSignOut: () => void;
  onLogoClick: () => void;
}

// Regenerate race condition fix:
const abortRef = useRef<AbortController | null>(null);

async function handleRegenerate() {
  abortRef.current?.abort();
  abortRef.current = new AbortController();
  setLoading(true);
  setError(null);
  try {
    const text = await generateCoverLetter(sessionId, abortRef.current.signal);
    setCoverLetter(text);
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") return;
    setError(e instanceof Error ? e.message : "Regeneration failed.");
  } finally {
    setLoading(false);
  }
}

// Clipboard with fallback:
async function handleCopy() {
  try {
    await navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  } catch {
    textareaRef.current?.select(); // fallback for HTTP/denied
  }
}
```

### Remaining Agent Outputs (read in next session)
The following agents are still running or completed — read their output files before implementing:
- `a57e8d0967bbe5f01` — security-sentinel
- `a5a02ada7de2b3a53` — performance-oracle
- `a04bc8a9695fa4a1d` — julik-frontend-races-reviewer
- `a735787a6d642d498` — architecture-strategist
- `a284992b0ca1c86bf` — best-practices-researcher
- `adb4afe199e424e0d` — code-simplicity-reviewer
- `ad4a0754be42c8f32` — spec-flow-analyzer
- `a4f21414d99547060` — pattern-recognition-specialist

---
title: "feat: Cover Letter Generation (Stage 5)"
type: feat
status: active
date: 2026-03-06
---

# ✨ Cover Letter Generation (Stage 5)

## Overview

Add a Stage 5 to the AI pipeline that generates a tailored cover letter from the already-computed session data (structured resume + JD analysis). Exposed via a new `/api/cover-letter` endpoint and a new `CoverLetterPage` in the frontend. Zero new infrastructure — reads from the existing session store.

## Problem Statement / Motivation

Users already have their resume tailored and know exactly which JD keywords matter (Stage 2 output). A cover letter written from the same context is the natural next step — and currently requires leaving the app entirely. Adding this as Stage 5 turns ResumeAI into a one-stop application tool and dramatically increases the Pro plan's value proposition.

## Proposed Solution

After the user completes resume review, offer a "Generate Cover Letter" button. This hits a new backend endpoint that:
1. Reads `resume_structured` and `jd_analysis` from the existing session (no new AI calls for parsing)
2. Runs Stage 5 (Sonnet) to generate a ~300-word professional cover letter
3. Returns the text to the frontend

Frontend shows an editable textarea with copy + .txt download. No new DB tables, no new session state — the session already has everything needed.

---

## Technical Approach

### Backend

#### `backend/ai/prompts.py` — add Stage 5 prompts

```python
STAGE5_SYSTEM = """You are a professional cover letter writer...
- Use ONLY facts from the resume (no fabrication)
- Tailor tone and keywords to the job description
- Output plain text only, ~300 words, 3-4 paragraphs
- No placeholders like [Company Name] — use actual values from JD analysis
"""

STAGE5_PROMPT = """
Resume Summary:
{resume_summary}

JD Analysis:
{jd_analysis}

Write a tailored cover letter.
"""
```

#### `backend/pipeline/stage5_cover_letter.py` — new file

```python
from ai.client import call_llm
from ai.router import select_model
from ai.prompts import STAGE5_SYSTEM, STAGE5_PROMPT

def generate_cover_letter(resume_structured: dict, jd_analysis: dict) -> str:
    model = select_model(5)  # falls into Sonnet branch (else clause)
    # Build condensed resume summary to keep prompt tight
    prompt = STAGE5_PROMPT.format(
        resume_summary=...,
        jd_analysis=...,
    )
    return call_llm(prompt, model, system=STAGE5_SYSTEM, max_tokens=1024)
```

Note: Uses `call_llm` (returns str), not `call_llm_json` — cover letter is plain text.

#### `backend/api/models/responses.py` — add new response model

```python
class CoverLetterResponse(BaseModel):
    cover_letter: str
```

#### `backend/api/routes/cover_letter.py` — new route file

```python
from fastapi import APIRouter, HTTPException
from api.models.responses import CoverLetterResponse
from pipeline.orchestrator import get_session
from pipeline.stage5_cover_letter import generate_cover_letter

router = APIRouter()

@router.post("/cover-letter/{session_id}", response_model=CoverLetterResponse)
async def generate(session_id: str):
    session = get_session(session_id)  # raises KeyError if expired
    resume_structured = session["resume_structured"]
    jd_analysis = session["response"]["jd_analysis"]  # already stored in session
    text = await asyncio.to_thread(generate_cover_letter, resume_structured, jd_analysis)
    return CoverLetterResponse(cover_letter=text)
```

#### `backend/main.py` — register new router

```python
from api.routes.cover_letter import router as cover_letter_router
app.include_router(cover_letter_router, prefix="/api")
```

---

### Frontend

#### `frontend/src/api/client.ts` — add new function

```typescript
export async function generateCoverLetter(sessionId: string): Promise<string> {
  const resp = await fetch(`${BASE}/cover-letter/${sessionId}`, { method: "POST" });
  if (!resp.ok) throw new Error("Cover letter generation failed");
  const data = await resp.json();
  return data.cover_letter;
}
```

#### `frontend/src/types/index.ts` — add new AppStep

```typescript
export type AppStep = "landing" | "dashboard" | "upload" | "processing" | "review" | "cover-letter" | "done";
```

#### `frontend/src/pages/CoverLetterPage.tsx` — new page

- Nav bar (logo + step indicator "optional — cover letter")
- Header: `"Your Cover Letter"` with lime mono label `"ai generated"`
- Editable `<textarea>` pre-filled with generated text — full width, ~16 rows
- Toolbar row:
  - `Copy to Clipboard` button (uses `navigator.clipboard.writeText`)
  - `Download .txt` button (creates Blob, triggers anchor download)
  - `Regenerate` button (re-calls API, shows spinner)
- `Continue →` button to proceed to Done page
- Loading state: skeleton shimmer over textarea while generating
- Error state: `ErrorBanner` component (already exists)
- Matches design tokens: `obsidian` bg, `lime` accents, `Space Grotesk` font, `bento-card` container

#### `frontend/src/pages/ReviewPage.tsx` — add CTA button

Add alongside `DownloadBar` at the bottom:

```tsx
<button onClick={onCoverLetter} className="neon-btn" style={{ ... }}>
  Generate Cover Letter →
</button>
```

Or embed in the existing `DownloadBar` component as a third action.

#### `frontend/src/App.tsx` — wire new step

```typescript
// New state
const [coverLetter, setCoverLetter] = useState<string>("");

// New handler
async function handleCoverLetter() {
  setStep("cover-letter");
  // generation happens inside CoverLetterPage on mount
}

// In renderPage() switch:
case "cover-letter":
  return result ? (
    <CoverLetterPage
      sessionId={result.session_id}
      onDone={() => setStep("done")}
      onLogoClick={handleLogoClick}
    />
  ) : null;
```

---

## Acceptance Criteria

- [ ] `POST /api/cover-letter/{session_id}` returns `{ cover_letter: string }` within 30s
- [ ] Returns 404 if session expired with clear error message
- [ ] Cover letter contains candidate's name, role from JD, and at least 2 JD keywords
- [ ] Cover letter does NOT invent facts not present in resume
- [ ] CoverLetterPage renders with generated text pre-filled in editable textarea
- [ ] Copy to clipboard works and shows brief "Copied!" confirmation
- [ ] Download as .txt triggers file download named `cover_letter.txt`
- [ ] Regenerate button re-calls API and replaces text
- [ ] Loading state shown while API call is in progress
- [ ] Error shown if API call fails with retry option
- [ ] "Generate Cover Letter" button visible on ReviewPage
- [ ] Entire flow matches existing dark design system (lime, obsidian, Space Grotesk)
- [ ] Works whether or not Supabase is configured

## Success Metrics

- Cover letter generation completes in < 15 seconds
- Generated text is ~250-350 words (verified via token output)
- No placeholder text like "[Company]" in output
- Zero hallucinated credentials or metrics

## Dependencies & Risks

| Risk | Mitigation |
|------|-----------|
| Session may expire between review and cover letter generation | Return 404 with "Session expired — please re-upload" and route back to upload |
| Stage 5 prompt may include resume facts incorrectly | Stage 5 is read-only — no validate step needed, but prompt must be strict about fabrication |
| `select_model(5)` — stage 5 falls into `else` branch in router → Sonnet ✓ | Verified — no router changes needed |
| `jd_analysis` in session is stored as `response.jd_analysis` dict | Access via `session["response"]["jd_analysis"]` |
| Cover letter quality varies without company name in JD | Extract `industry` + `role_level` from jd_analysis as fallback |

## File Checklist

### New Files
- [ ] `backend/pipeline/stage5_cover_letter.py`
- [ ] `backend/api/routes/cover_letter.py`
- [ ] `frontend/src/pages/CoverLetterPage.tsx`

### Modified Files
- [ ] `backend/ai/prompts.py` — add STAGE5_SYSTEM, STAGE5_PROMPT
- [ ] `backend/api/models/responses.py` — add CoverLetterResponse
- [ ] `backend/main.py` — register cover_letter router
- [ ] `frontend/src/types/index.ts` — add "cover-letter" to AppStep
- [ ] `frontend/src/api/client.ts` — add generateCoverLetter()
- [ ] `frontend/src/App.tsx` — add cover-letter case + handler
- [ ] `frontend/src/pages/ReviewPage.tsx` — add Generate Cover Letter button

## References

### Internal (from codebase)
- Existing stage pattern: `backend/pipeline/stage3_rewrite.py`
- Prompt pattern: `backend/ai/prompts.py:82-144`
- Session data shape: `backend/pipeline/orchestrator.py:104-114`
- Model routing: `backend/ai/router.py:21-28` — stage 5 → Sonnet via else branch
- Download route pattern to follow: `backend/api/routes/download.py`
- Page design pattern: `frontend/src/pages/ReviewPage.tsx`
- Error handling pattern: `frontend/src/components/ErrorBanner.tsx`
- API client pattern: `frontend/src/api/client.ts:10-52`
