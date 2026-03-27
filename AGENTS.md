# ResumeAI — Project Context

AI-powered resume tailoring tool. User uploads resume (PDF/DOCX) + pastes a job description → AI rewrites bullets to match JD keywords → user reviews/accepts/rejects each change → downloads tailored resume (PDF or DOCX) → optional AI cover letter.

## Stack

- **Backend**: Python 3.12, FastAPI, uvicorn, slowapi (rate limiting), Anthropic SDK 0.40.0
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS 4
- **AI**: Anthropic Codex (primary) + OpenAI (fallback)
- **Auth/History**: Supabase (auth + permanent session persistence)
- **Session Store**: Redis (10 min fast-access TTL) → Supabase fallback (permanent)
- **PDF generation**: reportlab (tectonic/LaTeX optional)
- **DOCX generation**: python-docx

## Project Structure

```
resumeAI/
├── backend/
│   ├── main.py                    # FastAPI app, CORS, rate limiting
│   ├── limiter.py                 # Shared slowapi Limiter instance
│   ├── ai/
│   │   ├── client.py              # call_llm (sync) + call_llm_async (AsyncAnthropic) + call_llm_json
│   │   ├── router.py              # Model selection per stage (Haiku 1-2, Sonnet 3-5)
│   │   └── prompts.py             # System prompts for all 5 stages
│   ├── api/
│   │   ├── models/
│   │   │   ├── requests.py        # DownloadRequest
│   │   │   └── responses.py       # TailorResponse, BulletDiff, Scores, JDAnalysis,
│   │   │                          # ResumeSummary, RecentRole, EdgeCase, CoverLetterResponse
│   │   └── routes/
│   │       ├── health.py          # GET /api/health
│   │       ├── tailor.py          # POST /api/tailor (non-streaming fallback)
│   │       ├── stream.py          # POST /api/tailor/start + GET /api/tailor/stream/{id} — SSE
│   │       ├── download.py        # POST /api/download/pdf|docx — Redis→Supabase fallback
│   │       └── cover_letter.py    # POST /api/cover-letter — async, no session needed
│   ├── parsers/
│   │   ├── pdf_parser.py          # pdfplumber
│   │   └── docx_parser.py         # python-docx (paragraphs + tables)
│   ├── pipeline/
│   │   ├── orchestrator.py        # run_pipeline_background() — saves to Redis + Supabase
│   │   ├── session_store.py       # InMemorySessionStore + UpstashRestSessionStore
│   │   ├── progress_store.py      # Thread-safe SSE event queue per request_id
│   │   ├── stage1_parse.py        # Parse resume → structured JSON (Haiku)
│   │   ├── stage2_analyze.py      # Analyze JD → ATS keywords (Haiku)
│   │   ├── stage3_rewrite.py      # Rewrite bullets without hallucination (Sonnet)
│   │   ├── stage4_validate.py     # Hallucination check, revert fabrications (Sonnet)
│   │   └── stage5_cover_letter.py # Generate cover letter (Sonnet) — SYNC, called from async route
│   ├── generators/
│   │   ├── pdf_generator.py       # Reportlab PDF
│   │   ├── latex_generator.py     # LaTeX → PDF via tectonic (optional)
│   │   └── docx_generator.py      # python-docx DOCX
│   └── utils/
│       ├── scoring.py             # match_percent, ats_score, strength_score
│       ├── diff.py                # build_diff() + get_revert_edge_cases()
│       └── supabase_store.py      # Permanent session persistence via Supabase REST (service role key)
└── frontend/
    └── src/
        ├── App.tsx                # State machine: landing→auth→upload→processing→review→cover-letter→done
        ├── api/client.ts          # startTailor (sends user_id+filename), downloadFile, generateCoverLetter
        ├── types/index.ts         # TypeScript interfaces mirroring Pydantic models
        ├── lib/
        │   ├── supabase.ts        # Supabase client (graceful if env vars missing)
        │   └── history.ts         # saveToHistory (stores session_id + full TailorResponse JSON)
        ├── pages/
        │   ├── LandingPage.tsx    # Dark UI, bento grid, hero mockup, pricing
        │   ├── UploadPage.tsx     # File drop + JD textarea, 50-word minimum
        │   ├── ProcessingPage.tsx # SSE-driven stage progress + elapsed time per stage
        │   ├── ReviewPage.tsx     # BulletDiff viewer, accept/reject/edit, live score delta
        │   ├── CoverLetterPage.tsx # Editable textarea, word count, copy/download/regenerate
        │   ├── DashboardPage.tsx  # History with Re-open button per entry
        │   └── DonePage.tsx       # Completion screen
        └── components/
            ├── AuthModal.tsx
            ├── BulletRow.tsx      # Keyword highlighting in tailored text
            ├── DiffViewer.tsx
            ├── DownloadBar.tsx    # Sticky bar: PDF + DOCX + Cover Letter + Done (post-download)
            ├── EdgeCaseAlert.tsx  # Also shows reverted bullets with explanation
            ├── ErrorBanner.tsx
            ├── ProcessingStatus.tsx
            ├── ScorePanel.tsx     # Live score delta with ghost bar as you accept/reject
            └── UserNav.tsx
```

## AI Pipeline

### Stages 1-4 (Resume Tailoring) — sync, run in background thread via asyncio.to_thread

1. **Stage 1** (Haiku) — Parse resume text → structured JSON with sections/entries/bullets
2. **Stage 2** (Haiku) — Analyze JD → required_skills, preferred_skills, ats_keywords, role_level, industry
3. **Stage 3** (Sonnet) — Rewrite bullets using JD keywords. CRITICAL: never invent facts
4. **Stage 4** (Sonnet) — Hallucination check. Reverts any bullet that adds fabricated info. Confidence scores extracted per bullet.

### Stage 5 (Cover Letter) — async, runs directly in FastAPI event loop

- Uses `AsyncAnthropic` client (NOT the sync client)
- Called via `await call_llm_async(...)` — no `asyncio.to_thread` needed
- DO NOT use `asyncio.to_thread` for the cover letter route
- Route: `POST /api/cover-letter` — accepts `resume_summary` + `jd_analysis` directly (no session lookup)

### Why cover letter uses async client

The sync `call_llm` wrapped in `asyncio.to_thread` works for the background pipeline but is unreliable for real-time routes because:
- Anthropic SDK 0.40.0 does not support per-request `timeout` on `messages.create`
- `asyncio.wait_for` cancels the coroutine but the blocking thread keeps running
- `AsyncAnthropic` is native async/await — properly cancellable, no thread overhead

### Model IDs

```python
HAIKU  = "Codex-haiku-4-5-20251001"
SONNET = "Codex-sonnet-4-6"
HAIKU_FALLBACK  = "gpt-3.5-turbo"
SONNET_FALLBACK = "gpt-4o"
```

## API Endpoints

```
POST /api/tailor/start        — multipart: resume_file + job_description + user_id? + original_filename? → { request_id }
GET  /api/tailor/stream/{id}  — SSE: stage progress events + done/error
POST /api/download/pdf        — JSON: DownloadRequest → PDF bytes (Redis→Supabase fallback)
POST /api/download/docx       — JSON: DownloadRequest → DOCX bytes (Redis→Supabase fallback)
POST /api/cover-letter        — JSON: { resume_summary, jd_analysis } → { cover_letter }
GET  /api/health              — provider status
```

Rate limits: 10/min on tailor, 5/min on cover-letter.

## Key Data Models

```python
TailorResponse:
  session_id: str            # UUID — persisted to Supabase tailor_sessions (permanent)
  scores: Scores             # match_percent, ats_score, strength_score (0-100)
  jd_analysis: JDAnalysis    # required_skills, preferred_skills, ats_keywords, role_level, industry
  resume_summary: ResumeSummary  # name, title, summary, contact, sections[], recent_roles[]
  diff: List[BulletDiff]
  edge_cases: List[EdgeCase] # includes reverted_bullet type from Stage 4
  total_bullets: int
  changed_bullets: int

BulletDiff:
  bullet_id, section, original, tailored, keywords_added, action_verb_changed

ResumeSummary:
  name, title, summary, contact: ContactInfo, sections[], recent_roles[]

CoverLetterRequest:          # No session_id — data passed directly
  resume_summary: ResumeSummary
  jd_analysis: JDAnalysis
```

## Supabase Schema

```sql
-- Frontend-accessible (anon key + RLS)
tailor_history:
  id, user_id, session_id, original_filename, job_role, company,
  jd_snippet, match_percent, ats_score, strength_score,
  changed_bullets, total_bullets, response (JSONB), created_at

-- Backend-only (service role key, bypasses RLS)
tailor_sessions:
  id, session_id (UNIQUE), user_id, original_filename, jd_snippet,
  resume_structured (JSONB), rewrites (JSONB), response (JSONB),
  accepted_bullets (JSONB), created_at
```

## Session Persistence Architecture

```
Pipeline completes
  → Redis SET (10 min TTL, fast download access)
  → Supabase tailor_sessions INSERT (permanent, via service role key)
  → Frontend saves TailorResponse to tailor_history (permanent, via anon key)

Download request
  → Try Redis GET (fast path)
  → Redis miss → Supabase tailor_sessions SELECT (fallback, always works)
  → On success: Supabase tailor_sessions PATCH accepted_bullets

Dashboard
  → Loads tailor_history (has full TailorResponse JSON)
  → "Re-open" button → restores full ReviewPage with original diffs
```

## Frontend Design System

Design tokens:
- `lime: "#ccff00"` — primary accent
- `obsidian: "#0c0c0c"` — card background
- `black: "#000000"` — page background
- `white: "#ebebeb"` — text
- `emerald: "#10b981"` — secondary accent

Fonts: Space Grotesk (body), JetBrains Mono (mono labels)
CSS classes: `bento-card`, `neon-btn`, `mono`, `float-anim`, `fade-up-1/2/3/4`

## Environment Variables

Root `.env` (read by both backend via `load_dotenv` and frontend via Vite `envDir: ".."`):
```
# AI providers
ANTHROPIC_API_KEY=...
OPENAI_API_KEY=...                    # optional fallback

# CORS
ALLOWED_ORIGINS=...

# Redis session store (optional, in-memory fallback for local dev)
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...

# Supabase frontend (anon key — safe to expose)
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...

# Supabase backend persistence (service role key — NEVER expose to frontend)
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

## Running Locally

```bash
# Backend
cd backend && source .venv/bin/activate
uvicorn main:app --reload --port 8001

# Frontend
cd frontend && npm run dev -- --host 0.0.0.0
# → http://localhost:5173
```

## Deployment

- **Frontend**: Vercel — https://resume-ai-omega-nine.vercel.app/
- **Backend**: Render — https://resumeai-krug.onrender.com
- **Routing**: `vercel.json` rewrites `/api/*` → Render backend (no Netlify)
- **Build**: `build.sh` installs tectonic 0.15.0 on Render for LaTeX PDF generation
- **PDF**: `latex_generator.py` primary (Jake's format), reportlab fallback
- **PDF generation**: tectonic/LaTeX (primary, Jake's Resume format), reportlab fallback

## Architectural Decisions

- **No session for cover letter**: `resume_summary` and `jd_analysis` are included in `TailorResponse` and passed from the frontend. Avoids session TTL/restart issues entirely.
- **Sync pipeline in thread**: Stages 1-4 are blocking SDK calls. Run as background task via `asyncio.to_thread` so the event loop stays free and SSE connections stay alive.
- **Async cover letter**: Stage 5 uses `AsyncAnthropic` for proper async/await with natural cancellation.
- **SSE streaming**: Pipeline progress pushed via `progress_store.py` (thread-safe queue); frontend uses `EventSource`.
- **Dual-layer persistence**: Redis for fast 10-min access, Supabase `tailor_sessions` (service role) for permanent fallback. Download endpoint tries Redis first, falls back to Supabase automatically.
- **`tailor_history` stores full TailorResponse**: Enables dashboard Re-open — user can restore any past session into the full ReviewPage without re-running the pipeline.
- **Reverted bullets surfaced**: `get_revert_edge_cases()` in `diff.py` converts Stage 4 silent reverts into visible EdgeCase items with the fabrication reason.

## Known Bugs Fixed

1. `saveToHistory` was passing `"", ""` for filename/JD — fixed
2. After download, page navigated away immediately — fixed: stay on ReviewPage, "Done" button appears post-download
3. Cover letter "Continue" navigated to done page — fixed: returns to ReviewPage
4. Cover letter session lookup failed on server restart — eliminated: no session needed
5. Cover letter timed out: sync SDK in thread — fixed: AsyncAnthropic
6. Sessions lost after 10-min Redis TTL — fixed: permanent Supabase fallback
7. `call_llm_json` failed with "Extra data" when Codex appended text after JSON — fixed: use `raw_decode` + regex fence stripping
8. Cover letter page showed "timed out" immediately in React strict mode — fixed: removed `firedRef` guard, fixed `AbortError` propagation in `generateCoverLetter`
9. EdgeCaseAlert duplicate key warning — fixed: use `type-index` as key instead of `type` alone
10. EdgeCase alerts always expanded, cluttering ReviewPage — fixed: collapsed into single toggle button

## Known Bugs (Not Yet Fixed)

### Critical
- `cover_letter.py:67` — `_strip_fences` has same "Extra data" JSON bug as the one fixed in `call_llm_json`
- `subscription_store.py` — `increment_usage` is non-atomic (read-then-write); concurrent requests can lose a count; needs Supabase RPC
- `subscription_store._req` — silently swallows all errors returning `None`; Supabase outage downgrades Pro users to free

### Medium
- `App.tsx:handleSubmit` — limit error detected via fragile string match `msg.includes("3 free tailors")`; should propagate error `code` field
- `App.tsx` — `saveToHistory` called for all logged-in users regardless of tier; free users accumulate history they can't view
- `DownloadBar` — `tier` prop defaults to `"free"` if not passed; any future reuse will silently show Pro locks

### Minor
- `CoverLetterPage` — Re-open flow from Dashboard has no way back to Dashboard after cover letter; `onDone` always goes to ReviewPage

## What Was Implemented (v2 Quick Wins — Session 2)

### Backend
- `backend/utils/supabase_store.py` — NEW. Supabase REST client using service role key. `save_session()`, `load_session()`, `update_accepted_bullets()`. Gracefully no-ops if env vars missing.
- `backend/utils/diff.py` — Added `get_revert_edge_cases()`: surfaces Stage 4 reverted bullets as info EdgeCases with fabrication reason.
- `backend/pipeline/orchestrator.py` — Pipeline now saves to Supabase after completing. Accepts `user_id` + `original_filename` params threaded from the stream route.
- `backend/api/routes/stream.py` — Accepts optional `user_id` + `original_filename` form fields, passes to pipeline.
- `backend/api/routes/download.py` — On Redis `KeyError` → Supabase fallback. On successful download → saves `accepted_bullets` to Supabase.

### Frontend
- `BulletRow.tsx` — Keyword highlighting: JD keywords woven into tailored text are highlighted in lime.
- `ScorePanel.tsx` — Live score delta: Job Match updates in real time as user accepts/rejects bullets. Ghost bar shows baseline, `+N` delta shown in lime.
- `ReviewPage.tsx` — Computes projected `match_percent` live via `useMemo` from accepted bullet keyword additions.
- `ProcessingPage.tsx` — Shows SSE stage message + per-stage elapsed timer + estimated time hints per stage.
- `DashboardPage.tsx` — "Re-open" button per history entry: restores full ReviewPage with original diffs.
- `App.tsx` — Passes `user?.id` to `startTailor`; handles `onReopen` → jumps to review with stored result.
- `history.ts` — `saveToHistory` now stores `session_id` + full `TailorResponse` JSON in `tailor_history`.
- `types/index.ts` — `HistoryEntry` gains `session_id` + `response: TailorResponse | null`.

## What Was Implemented (v3 — Session 3)

### Backend
- `backend/utils/subscription_store.py` — NEW. Tier + usage tracking. `get_tier()`, `get_monthly_usage()`, `increment_usage()`, `upsert_subscription()`, `deactivate_by_subscription_id()`, `get_subscription_info()`.
- `backend/api/routes/stripe_routes.py` — NEW. `POST /api/stripe/checkout`, `POST /api/stripe/webhook`, `GET /api/stripe/subscription/{user_id}`.
- `backend/main.py` — registered `stripe_router`.
- `backend/api/models/requests.py` — added optional `user_id` to `DownloadRequest`.
- `backend/api/routes/stream.py` — gate: Free users blocked at 3 tailors/month (403 `limit_reached`). Usage incremented on `start`.
- `backend/api/routes/download.py` — gate: DOCX requires Pro tier (403 `upgrade_required`).

### Frontend
- `frontend/src/components/UpgradeModal.tsx` — NEW. Reusable modal with reason-specific copy, Pro feature list, price, Stripe Checkout CTA.
- `frontend/src/lib/subscription.ts` — NEW. `getAnonCount()`, `incrementAnonCount()`, `anonLimitReached()` via localStorage.
- `frontend/src/api/client.ts` — added `getUserSubscription()`, `createCheckoutSession()`. `downloadFile()` now accepts `userId`.
- `frontend/src/types/index.ts` — added `Tier`, `UpgradeReason`.
- `frontend/src/App.tsx` — `tier` state, `fetchTier()` on login, `showUpgrade()` helper, anonymous 1-tailor limit, `UpgradeModal` rendered at app root.
- `frontend/src/pages/ReviewPage.tsx` — accepts `tier` + `onUpgrade`; DOCX gated before download call.
- `frontend/src/components/DownloadBar.tsx` — DOCX and Cover Letter show `🔒 · Pro` lock for free users.

### Supabase Tables Required
```sql
create table user_subscriptions (
  user_id uuid primary key,
  tier text not null default 'free',
  status text not null default 'active',
  stripe_customer_id text,
  stripe_subscription_id text,
  period_end text,
  updated_at timestamptz default now()
);
create table tailor_usage (
  user_id uuid not null,
  month text not null,
  count int not null default 0,
  primary key (user_id, month)
);
```

### Env Vars Required
```
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...
FRONTEND_URL=http://localhost:5173
```

## NEXT UP — Priority Order

### 1. Fix Known Bugs (HIGH PRIORITY)
See "Known Bugs (Not Yet Fixed)" section above. Top fixes:
- `cover_letter.py` — fix `_strip_fences` JSON parsing
- `stripe_routes.py` — fix `period_end` Unix timestamp, remove private `_req` usage
- `DashboardPage` — add Pro tier gate
- `subscription_store` — atomic increment via Supabase RPC

### 2. LaTeX Cover Letter PDF (HIGH PRIORITY)

User provided a LaTeX cover letter template at `cover-letter-latexcode.docx`. tectonic is confirmed installed at `/opt/homebrew/bin/tectonic 0.15.0`.

**What to build:**
- Stage 5 returns structured JSON (hiring_manager, company_name, job_title, paragraph1-4) — already done
- `backend/generators/cover_letter_generator.py` (NEW) — builds LaTeX from template + JSON, compiles via tectonic
- `backend/api/routes/cover_letter.py` — return `application/pdf` bytes instead of JSON
- `frontend/src/api/client.ts` — `generateCoverLetter()` returns `Blob`
- `frontend/src/pages/CoverLetterPage.tsx` — remove textarea, show spinner → auto-download PDF on success

**LaTeX template structure:**
```latex
\documentclass[11pt,a4paper]{article}
% geometry margin=1in, xcolor (RGB 0,79,144 for links), hyperref, parskip
% HEADER: Name + address + email | phone | linkedin
% DATE: \today
% RECIPIENT: Hiring Manager / Company / Address
% BODY: Dear [HM], P1 hook, P2 achievements, P3 company fit, P4 CTA
% SIGN-OFF: Sincerely, Name
```

**Key files:**
1. `backend/generators/cover_letter_generator.py` — NEW
2. `backend/api/routes/cover_letter.py` — change response to PDF bytes
3. `frontend/src/api/client.ts` — generateCoverLetter returns Blob
4. `frontend/src/pages/CoverLetterPage.tsx` — PDF download UI

### 2. AI Confidence Scores on Each Bullet (HIGH PRIORITY)

Stage 4 already computes per-bullet certainty but doesn't return it to the frontend.

**What to build:**
- Add `confidence: int` (0–100) to `BulletDiff` model in `backend/api/models/responses.py`
- In `stage4_validate.py`, extract confidence from Sonnet response and store in verdict
- In `diff.py` `build_diff()`, include confidence in each `BulletDiff`
- In `BulletRow.tsx`, add color-coded badge: green >90%, yellow 70–89%, orange <70%

### 3. Batch Bullet Actions

- "Accept All High-Confidence (>90%)" button above the diff list
- "Reject All Low-Confidence (<70%)" button
- Frontend only: `DiffViewer.tsx` + `ReviewPage.tsx`

### 4. Template Gallery with Preview

- 3–5 LaTeX templates (Corporate, Tech, Executive, Entry-Level, Creative)
- Pre-generated PNG thumbnails shown before upload
- `template_id` stored in Redis session, passed to tectonic at download

### 5. ~~Stripe Freemium~~ ✅ DONE (Session 3) — replaced by Razorpay (Session 4)

### 6. Chrome Extension (Manifest V3)

- Auto-extract JD from LinkedIn/Indeed/Greenhouse
- Pre-load user's default resume from Supabase
- 1-click tailoring from job board → no tab switching

## What Was Implemented (v4 — Session 4)

### Dashboard UX
- `DashboardPage.tsx` — full rewrite with search (filename + job role), collapsible date groups ("This Month"/"Last Month"/"Older", all collapsed by default), pagination (5/page, search mode only). Flat list when searching, grouped view when not.

### Download Filename
- `ReviewPage.tsx:85` — filename now `{role_level}_{industry}_{user_name}.{format}` instead of hardcoded `tailored_resume`. Slugified to lowercase with underscores.

### Admin Panel
- `backend/api/routes/admin.py` — NEW. Admin-only routes verified via Supabase JWT + `is_admin` in user_metadata. `GET /api/admin/me`, `GET /api/admin/users`, `GET /api/admin/history`, `PATCH /api/admin/subscription/{user_id}`.
- `frontend/src/pages/AdminPage.tsx` — NEW. Tabbed admin dashboard (Users + History). Users tab shows all auth users with tier badges, usage/month, upgrade/downgrade buttons. History tab shows all sessions across all users.
- `App.tsx` — added "admin" to AppStep. Detects `/admin` URL on load. `sessionReady` flag prevents spurious auth modal on page reload.
- `types/index.ts` — added "admin" to AppStep.
- `UserNav.tsx` — shows "Admin Panel" menu item for users with `is_admin: true` in metadata. Navigates via `window.location.href = "/admin"`.

### Admin Setup
- Set `is_admin: true` in Supabase SQL Editor:
  ```sql
  UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || '{"is_admin": true}'::jsonb WHERE email = 'your-email@example.com';
  ```
- Requires `SUPABASE_SERVICE_ROLE_KEY` + `VITE_SUPABASE_ANON_KEY` in `.env`

### Razorpay (replaced Stripe)
- `backend/api/routes/razorpay_routes.py` — NEW. `POST /api/razorpay/subscribe`, `POST /api/razorpay/verify` (signature verification + immediate upgrade), `POST /api/razorpay/webhook`, `GET /api/razorpay/subscription/{user_id}`.
- `stripe_routes.py` — REMOVED.
- `frontend/src/api/client.ts` — replaced `createCheckoutSession` with `createRazorpaySubscription` + `verifyRazorpayPayment`. `getUserSubscription` now calls `/api/razorpay/subscription/`.
- `frontend/src/components/UpgradeModal.tsx` — Razorpay JS popup instead of Stripe redirect. INR/USD currency toggle (defaults by `navigator.language`). Success screen with "Reload now" button.

### Razorpay Env Vars (updated session 8 — Orders API)
```
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_AMOUNT_INR=74900   # paise = ₹749 (optional, default hardcoded)
RAZORPAY_AMOUNT_USD=900     # cents = $9 (optional, default hardcoded)
```
Note: RAZORPAY_PLAN_ID_INR/USD removed — switched from Subscriptions to Orders API.

### ATS Score Overhaul
- `backend/utils/scoring.py` — `compute_ats_score` now takes `jd_analysis` + `resume_text` params. 10 real signals across contact completeness (23pts), section structure (23pts), keyword density vs JD (20pts), bullet quality/quantification (15pts), layout safety (14pts), content depth (5pts). Produces realistic 45–90% spread instead of always 100%.

### 7. Interview Prep Mode (Stage 6)

- Haiku generates 10–15 questions from tailored resume + JD
- Sonnet evaluates user answers against STAR framework
- Gate behind Premium tier

## What Was Implemented (v5 — Session 7)

### Frontend-Backend Alignment (all committed)
- `razorpay_routes.py` — Authorization header optional (`Header(None)`) with explicit 401
- `admin.py` — `_verify_admin` optional header; reads `SUPABASE_ANON_KEY` (removed `VITE_` fallback)
- `cover_letter.py` — `CoverLetterPdfRequest.resume_summary` changed to `Dict[str, Any]`; duplicate `CoverLetterTextResponse` removed, now imports `CoverLetterResponse` from `responses.py`
- `responses.py` — `CoverLetterResponse` has all 4 fields: `cover_letter`, `hiring_manager`, `company_name`, `job_title`
- `types/index.ts` — `DownloadRequest` gains `user_id?`; `BulletDiff.injected_keywords` made optional (`string[]?`)
- `BulletRow.tsx` — all `injected_keywords` accesses guarded with `?? []`
- `.env.example` + `backend/.env.example` — added all Razorpay vars + `SUPABASE_ANON_KEY`

### tectonic / PDF Generator Fix
- `latex_generator.py` — `_get_tectonic()` self-downloads tectonic 0.15.0 to `backend/bin/` at runtime if not found on PATH. Eliminates dependency on build.sh running correctly.
- `health.py` — exposes `pdf_generator: "latex" | "reportlab_fallback"` in `/api/health`
- `download.py` — logs which generator was used (latex vs reportlab)
- Render environment: `$HOME=/opt/render`, project at `/opt/render/project/src`, `rootDir: backend` in `render.yaml`

### Required Render Environment Variables
```
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
ALLOWED_ORIGINS=https://resume-ai-omega-nine.vercel.app
SUPABASE_URL=https://...supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_ANON_KEY=...        # same as VITE_SUPABASE_ANON_KEY, used by admin routes
RAZORPAY_KEY_ID=rzp_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
RAZORPAY_PLAN_ID_INR=plan_...
RAZORPAY_PLAN_ID_USD=plan_...
```
Note: Redis not configured → `session_store: in_memory_only` (sessions lost on restart/spin-down)

### PDF Preview Feature (60/40 split layout)
- `frontend/src/components/PreviewPanel.tsx` — NEW. Props: `fetchPdf: () => Promise<Blob>`. Auto-loads on mount, "Refresh Preview" button, spinner overlay, object URL cleanup. Uses `fetchPdfRef` pattern to always capture latest state.
- `ReviewPage.tsx` — 60/40 flex split: left scrollable review, right `PreviewPanel` → `/api/download/pdf`
- `CoverLetterPage.tsx` — 60/40 flex split: left editor, right `PreviewPanel` → `/api/cover-letter/pdf`
- Layout: `height: calc(100vh - 65px)`, both columns `overflowY: auto`

### Admin Pro Access
```sql
-- Grant pro access to yourself
INSERT INTO user_subscriptions (user_id, tier, status, updated_at)
VALUES ('your-uuid', 'pro', 'active', now())
ON CONFLICT (user_id) DO UPDATE SET tier = 'pro', status = 'active', updated_at = now();
```
