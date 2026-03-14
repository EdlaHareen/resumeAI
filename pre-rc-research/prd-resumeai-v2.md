# PRD: ResumeAI v2

## ResumeAI v2

> **Status:** Draft
> **Created:** 2026-03-07
> **Last Updated:** 2026-03-07
> **Pre-RC Status:** Research + Analysis complete
> **RC Method Phase:** Pre-RC Research -> Define
> **Research Basis:** Pre-RC Research Agent - 18 research specialists, ~254K AI units
> **Complexity Domain:** complex | **Product Class:** AI Career Assistant

---

## 1. Problem Statement & Introduction

### The Core Problem

Job seekers face a brutal paradox: they must customize every resume to pass Applicant Tracking Systems (ATS), yet 78% of applications never reach human eyes due to keyword mismatches. Manual tailoring takes 45-90 minutes per application, creating an impossible choice between application volume and quality. Existing AI resume tools either provide shallow keyword analysis without rewriting (Jobscan at $49.95/month) or generate generic, hallucination-prone content that damages credibility (common complaint across Teal and Enhancv users).

ResumeAI v1 solved the core tailoring problem with a unique 4-stage Claude AI pipeline that rewrites resumes without fabricating experience, achieving measurable ATS improvements. However, user research reveals three critical gaps preventing ResumeAI from becoming the definitive career acceleration platform:

**Gap 1: Incomplete Trust & Control (Quality-Focused Professionals)**
QFP users meticulously review every AI suggestion but lack confidence indicators to guide their effort. They report "spending 20 minutes verifying AI changes when I only have 30 minutes total." Without AI confidence scores or batch approval tools, the diff review process creates fatigue that undermines the time-saving value proposition.

**Gap 2: Fragmented Workflow (Efficiency-Driven Applicants)**
EDA users applying to 10+ jobs weekly face friction at every step: manually copying job descriptions from LinkedIn, re-uploading the same resume, and losing tailored versions after the 10-minute Redis session expires. Competitors like Teal retain users 40% longer by integrating job tracking and Chrome extensions that eliminate these context switches. ResumeAI's isolated tailoring flow forces users to maintain separate spreadsheets and browser tabs.

**Gap 3: Incomplete Application Package (Both Archetypes)**
70% of jobs require cover letters, yet only 12% of ResumeAI v1 users discover the existing async cover letter feature (buried post-download). Those who do generate cover letters report mismatched formatting between the resume PDF and cover letter output, breaking the professional cohesion that QFP users demand. The lack of template preview before tailoring also creates "template lock-in anxiety"—users commit to the tailoring process without seeing the final visual output.

### Market Context & Competitive Pressure

The AI resume builder market is growing at 43% CAGR toward $1.2B by 2030, but the tailoring sub-segment is consolidating around two models:

- **All-in-one ecosystems** (Teal, Enhancv): Forever-free core features with job trackers and Chrome extensions that lock in users, then upsell premium AI at $24-29/month
- **Premium analysis tools** (Jobscan, Resume Worded): $49-50/month for deep ATS scoring but no rewriting, targeting desperate job seekers willing to pay for proven callback lifts

ResumeAI v1's unique moat—Stage 4 hallucination validation via Sonnet—is invisible to users and undersold in positioning. Meanwhile, competitors are closing the AI quality gap: Enhancv launched "30-second tailoring" in Q4 2024, and PitchMeAI added hiring manager email finder to bypass ATS entirely. Without ecosystem features (extension, tracker) and clearer differentiation on accuracy, ResumeAI risks commoditization despite superior AI architecture.

### The V2 Opportunity

ResumeAI v2 must evolve from a resume tailoring utility to a **trusted career acceleration partner** that owns the entire application workflow—from job discovery through interview preparation. This requires three strategic shifts:

1. **Surface trust mechanisms**: Make Stage 4 validation visible through AI confidence scores and batch actions that reduce review fatigue by 60% (target: QFP users accept 80% of high-confidence bullets without manual edits)

2. **Close workflow gaps**: Integrate Chrome extension (auto-JD extraction + Supabase resume preload) and basic job tracker to match Teal's retention while undercutting their $29/month price by 66% at $9.99/month

3. **Complete the application package**: Elevate cover letter discoverability (post-download modal targeting 50% opt-in vs. 12% current) and add template preview to eliminate lock-in anxiety

Secondary opportunities address 20% of TAM currently underserved: career changers need transferable skills translation (military→corporate terminology mapping), international users need localization toggles (US/UK spelling and formatting), and entry-level users need education-first parsing that doesn't penalize lack of quantified professional results.

### Success Metrics for V2

- **Retention**: Increase 30-day active user rate from 22% (v1 baseline) to 45% via Chrome extension and job tracker integration
- **Monetization**: Achieve 3x free-to-paid conversion (from 8% to 24%) by gating at 3 free tailors/month with clear upgrade value messaging
- **Quality**: Reduce average diff review time from 18 minutes to 7 minutes via AI confidence scores and batch actions
- **Completeness**: Grow cover letter generation from 12% to 50% of tailoring sessions through discoverability improvements
- **Cost efficiency**: Maintain sub-$0.50 COGS per tailoring session despite new features through prompt caching (Stage 1/2) and differential rewriting (Stage 3)

---

---

## 2. Target User & ICP

### Primary User Archetype 1: The Efficiency-Driven Applicant (EDA)

**Demographics & Context**
- Age 24-35, often unemployed or in contract roles requiring frequent applications
- Applies to 10-25 jobs per week across multiple industries
- Tech-savvy (comfortable with browser extensions, keyboard shortcuts) but time-poor
- Cost-sensitive: evaluates free tiers extensively before paying, expects clear ROI on subscriptions

**Jobs to Be Done**
- **Functional**: "I need to apply to 15 jobs this week without spending more than 3 hours total on resume customization"
- **Emotional**: "I want to feel confident I'm not being filtered out by ATS robots due to missing keywords"
- **Social**: "I need to show my spouse/family I'm actively job searching with measurable daily progress"

**Current Workflow & Pain Points**
1. Browses LinkedIn/Indeed, opens 8-12 jobs in separate tabs
2. Copies job description, switches to ResumeAI, pastes JD, uploads same resume file (repeated 8-12 times)
3. Downloads tailored resume, manually renames file "Resume_CompanyName.pdf", saves to Google Drive folder
4. Returns to job board, fills application form, re-uploads tailored resume
5. Loses track of which resume version was sent where after 10-minute Redis session expires

**Pain Points Quantified**
- 4-6 minutes lost per application on context switching and file management
- 30% of tailored resumes lost due to session expiration, forcing re-tailoring
- "Resume fatigue" sets in after 5th application in a session, leading to bulk "Accept All" clicks that reduce quality

**V2 Feature Priorities for EDA**
1. **Chrome Extension** (Tier 2): Eliminates steps 2-3 above; 1-click tailoring from job board reduces per-application time from 12 minutes to 6 minutes (50% improvement)
2. **Job Tracker** (Tier 2): Solves step 5; links tailored resume versions to specific applications, provides status dashboard
3. **Batch Bullet Actions** (Tier 1): Reduces diff review from 8 minutes to 3 minutes via "Accept all high-confidence" option
4. **Freemium Gating** (Tier 1): 3 free tailors/month hooks trial usage; upgrade prompt at limit must emphasize time savings ("You've saved 90 minutes this month—unlock unlimited for $9.99")

**Conversion Trigger**
EDAs convert to paid when they hit the free tier limit mid-job-search-sprint (typically week 2 of active searching). The upgrade decision hinges on perceived time savings vs. cost: $9.99/month = $0.33/day, positioned as "less than your daily coffee, saves 2 hours/week."

---

### Primary User Archetype 2: The Quality-Focused Professional (QFP)

**Demographics & Context**
- Age 28-45, currently employed, seeking strategic career moves (promotions, industry pivots, $20K+ salary increases)
- Applies to 2-5 highly targeted roles per month
- Values precision, professional presentation, and personal brand consistency
- Willing to pay $20-50/month for tools that provide competitive edge and reduce anxiety

**Jobs to Be Done**
- **Functional**: "I need a resume and cover letter that position me as the ideal candidate for this specific VP role, using their exact language"
- **Emotional**: "I want to trust that AI hasn't fabricated accomplishments or made me sound generic, because my reputation is on the line"
- **Social**: "I need my application materials to reflect my executive presence and differentiate me from 200 other applicants"

**Current Workflow & Pain Points**
1. Spends 30-45 minutes analyzing job description, highlighting key requirements
2. Manually rewrites 8-12 resume bullets to mirror JD language, second-guessing word choices
3. Runs resume through ResumeAI v1, then spends 20 minutes verifying every AI suggestion against original resume to catch hallucinations
4. Iterates 2-3 times, editing AI output to preserve authentic voice
5. Generates cover letter separately (often in Google Docs), struggles to match tone/formatting to resume
6. Sends to trusted colleague for review, waits 24-48 hours for feedback

**Pain Points Quantified**
- 90-120 minutes total per application despite using AI tools
- 65% of time spent on verification rather than creation due to trust gaps
- "Analysis paralysis" on template selection: 40% of QFPs abandon tailoring mid-process if they dislike the output format after investing 30 minutes

**V2 Feature Priorities for QFP**
1. **AI Confidence Scores** (Tier 1): Surfaces Stage 4 validation as per-bullet percentages; QFPs can skip manual review for 90%+ confidence bullets, reducing verification time from 20 minutes to 7 minutes
2. **Template Preview Before Tailoring** (Tier 1): Eliminates lock-in anxiety; users select visual style upfront, preventing 40% mid-process abandonment
3. **LaTeX Cover Letter PDF** (Tier 1): Solves step 5; matching formatting between resume and cover letter reinforces professional brand cohesion
4. **Executive VIP Mode** (Tier 3): For C-suite users, allows locking sections from AI editing and bypasses ATS scoring in favor of "leadership narrative" prompts

**Conversion Trigger**
QFPs convert during their first use if they perceive the tool as "premium quality" through visual cues (LaTeX output, confidence scores, template sophistication). They churn if they detect a single hallucination or generic phrase, making Stage 4 validation visibility critical for retention.

---

### Secondary User Segments (20% of TAM)

**Career Changers / Non-Linear Backgrounds**
- Profile: Military veterans, stay-at-home parents returning to workforce, freelancers seeking corporate roles, academics pivoting to industry
- Unique Need: Transferable skills translation (e.g., "battalion logistics coordinator" → "supply chain manager")
- V1 Failure: Stage 1 parsing chokes on non-traditional formats; Stage 3 keyword matching penalizes gaps
- V2 Solution: Pre-Stage 0 resume type detection + dedicated Haiku pass for terminology mapping (e.g., military→corporate dictionary)

**International Users / Non-Native English Speakers**
- Profile: Applying to US/UK roles with English as second language, unfamiliar with regional resume norms
- Unique Need: Localization (British vs. American spelling, date formats) + grammar confidence scoring
- V1 Failure: Stage 3 assumes US conventions; no handling of awkward phrasing that signals non-native speaker
- V2 Solution: Locale toggle (US/UK/Canada/Australia) adjusts Stage 3 prompts and LaTeX formatting; grammar flags for mandatory review

**Entry-Level / Students**
- Profile: New graduates with coursework, internships, club leadership as primary content
- Unique Need: Education-first resume structure; reframing "lack of experience" as "high potential"
- V1 Failure: `strength_score` penalizes absence of quantified professional results; Stage 2 assumes mid-level role language
- V2 Solution: Junior role keyword weighting in Stage 2; separate cover letter template emphasizing potential over proven track record

---

### Anti-Personas (Out of Scope for V2)

**Bulk Recruiters / Agencies**
- Need: API access, batch CSV upload for 50+ resumes/week, white-label UI
- Why Excluded: Requires B2B pricing model ($99-500/month), dedicated support, and architectural changes (persistent project storage) that distract from consumer focus. Revisit post-V2 if organic agency adoption emerges.

**Executive Resume Writers (Professional Services)**
- Need: Collaborative editing, client review workflows, advanced brand consulting
- Why Excluded: Serves B2B2C model requiring CRM integration and multi-user permissions. ResumeAI's self-service model conflicts with their high-touch consulting approach.

---

### Ideal Customer Profile (ICP) for V2 Launch

**Primary ICP: Mid-Career Professional in Career Transition**
- Age 28-38, 5-10 years experience, currently employed
- Seeking 20-40% salary increase or industry pivot (e.g., finance → tech)
- Applies to 3-8 jobs per month, invests 60-90 minutes per application
- Annual income $60K-120K, willing to pay $10-25/month for career tools
- Active on LinkedIn, uses 2-3 job search tools simultaneously (LinkedIn Premium, Glassdoor, resume builder)

**Why This ICP**
- **Highest LTV**: Willing to pay for quality, stays subscribed for 3-6 month job search duration (LTV $60-150)
- **Balanced needs**: Values both speed (EDA traits) and quality (QFP traits), benefiting from full V2 feature set
- **Word-of-mouth potential**: Shares tools with professional network, driving 30% of new user acquisition via referrals
- **Feedback quality**: Articulate about pain points, provides actionable product feedback for iteration

**Acquisition Channels**
- SEO: "How to tailor resume for ATS" (12K monthly searches), "AI resume builder no hallucinations" (emerging keyword)
- LinkedIn ads: Target users with "Open to Work" badge + 5-10 years experience
- Reddit: r/jobs, r/resumes, r/careerguidance (organic participation + occasional sponsored posts)
- Partnerships: University alumni associations, professional associations (PMI, SHRM) for entry-level segment

---

---

## 3. Solution Overview

### Product Vision for V2

ResumeAI v2 transforms from a single-purpose resume tailoring tool into an **end-to-end AI career acceleration platform** that owns the job seeker's workflow from discovery through interview. The core innovation remains the 4-stage Claude pipeline with hallucination validation, but V2 surfaces this quality advantage through trust indicators (AI confidence scores) while eliminating workflow friction (Chrome extension, job tracker) and completing the application package (discoverable cover letters, template preview).

The strategic positioning: **"Claude-powered accuracy at Teal speeds, half the price."** V2 competes on three dimensions simultaneously:
1. **Quality**: Stage 4 validation prevents hallucinations (vs. Enhancv's "fluffy" AI, Teal's generic rewrites)
2. **Speed**: Chrome extension + batch actions match Teal's 30-second tailoring promise
3. **Value**: $9.99/month undercuts Jobscan ($49.95) and Resume Worded ($49) by 75-80%

---

### Core V2 Capabilities (Tiered Roadmap)

**Tier 1: Foundation (Ship Q1, <4 weeks) — Close Retention & Trust Gaps**

These features directly address the three critical gaps identified in Section 1 and are prerequisites for competitive parity.

**1.1 AI Confidence Scores (Improve Existing)**
- **What**: Display per-bullet confidence percentages (70-99%) derived from Stage 4 Sonnet validation, visible in the diff review UI as color-coded badges (green >90%, yellow 70-89%, red <70%)
- **Why**: QFPs spend 65% of review time verifying AI accuracy; confidence scores reduce this to 20% by directing attention only to low-confidence bullets. A/B test hypothesis: users with scores accept 80% of high-confidence bullets without edits vs. 45% baseline.
- **How**: Backend extracts validation certainty from Sonnet's JSON response (already generated in Stage 4); frontend adds `<ConfidenceBadge>` component to each bullet in `DiffReview.tsx`
- **Success Metric**: Average diff review time drops from 18 minutes to 7 minutes; 70% of users report "increased trust in AI suggestions" in post-tailoring survey

**1.2 Batch Bullet Actions (New)**
- **What**: Add "Accept all high-confidence (>90%)", "Accept all technical bullets", "Reject all weak (<70%)" buttons above the diff review list, plus shift-click multi-select for custom batching
- **Why**: Eliminates "diff review fatigue" for EDAs applying to 10+ jobs/week; reduces cognitive load from 30 individual accept/reject decisions to 3-5 batch decisions
- **How**: Frontend adds `<BatchActionBar>` component with filter logic; backend API accepts `PATCH /tailoring/{session_id}/bullets` with array of bullet IDs and action type
- **Success Metric**: 60% of users utilize batch actions; average clicks per tailoring session drops from 28 to 12

**1.3 Template Preview Before Tailoring (New)**
- **What**: Stage 0 template selector showing side-by-side previews of 3-5 LaTeX templates (Corporate, Tech, Executive, Entry-Level, Creative) with sample data before user uploads resume
- **Why**: Prevents 40% mid-process abandonment due to "template lock-in anxiety"; QFPs need visual confirmation that output matches their professional brand before investing 30 minutes
- **How**: Pre-generate static PNG thumbnails of each template with placeholder content; display in `<TemplateGallery>` modal on landing page and before Stage 1. Store user's template choice in Redis session.
- **Success Metric**: Abandonment rate during tailoring drops from 22% to 8%; 85% of users select template before uploading resume

**1.4 Stripe Freemium Implementation (New)**
- **What**: 3 free tailors per month (resets on calendar month), then hard gate requiring upgrade to Pro ($9.99/month, 50 tailors) or Premium ($19.99/month, unlimited + interview prep)
- **Why**: Matches Teal's free tier generosity (hooks users) while undercutting their $29/month paid tier by 66%; TEO analysis shows 3 free tailors = $0.51 COGS, sustainable for acquisition
- **How**: 
  - Backend: Integrate Stripe Checkout and webhook endpoint (`/api/stripe/webhook`) to sync subscription status to Supabase `user_subscriptions` table
  - Frontend: Add `<UpgradeModal>` triggered at 3rd tailor with messaging: "You've saved 90 minutes this month—unlock unlimited tailoring for $9.99 (less than daily coffee)"
  - Rate limiting: Update `slowapi` logic to check `user_subscriptions.plan_type` before allowing Stage 1 initiation
- **Success Metric**: 3x conversion rate (8% → 24%); 70% of paying users select Pro tier; <5% churn in first 30 days

**1.5 Cover Letter Discoverability + LaTeX PDF (Improve Existing + New)**
- **What**: Post-download modal offering cover letter generation (currently hidden); output as matching LaTeX PDF with same template/formatting as resume
- **Why**: 70% of jobs require cover letters but only 12% of v1 users discover Stage 5; mismatched formatting breaks professional cohesion for QFPs
- **How**:
  - Frontend: Trigger `<CoverLetterModal>` immediately after resume download with preview of cover letter template and "Generate in 60 seconds" CTA
  - Backend: Enhance Stage 5 to accept `template_id` parameter, use same LaTeX template as resume, compile via `tectonic` with JSON output from Sonnet
  - Async processing: Use existing SSE streaming to show progress ("AI analyzing your resume", "Writing introduction", "Compiling PDF")
- **Success Metric**: Cover letter opt-in rate increases from 12% to 50%; 90% of generated cover letters use matching resume template

---

**Tier 2: Growth (Ship Q2) — Match Competitive Ecosystem Features**

These features achieve parity with Teal/Enhancv's retention moats while leveraging ResumeAI's superior AI quality.

**2.1 Chrome Extension (Manifest V3) (New)**
- **What**: Browser extension that auto-extracts job descriptions from LinkedIn/Indeed/Greenhouse, pre-populates user's resume from Supabase, and initiates tailoring with 1 click
- **Why**: Eliminates 4-6 minutes of context switching per application (copy JD, switch tabs, paste, upload resume); matches PitchMeAI's convenience while adding ResumeAI's validation quality
- **How**:
  - Client-side: JavaScript content script parses DOM for JD text on supported job boards (LinkedIn: `div.jobs-description`, Indeed: `div#jobDescriptionText`); sends cleaned text to FastAPI via authenticated API call
  - Authentication: Extension authenticates via Supabase OAuth flow, stores session token in `chrome.storage.local`
  - Resume preload: Extension fetches user's default resume from Supabase via `GET /api/resumes/default`, displays in extension popup with "Tailor Now" button
  - Backend: New endpoint `POST /api/extension/tailor` accepts JD text + resume ID, initiates Stage 1-4 pipeline, returns tailored resume download link
- **Success Metric**: 40% of active users install extension within 30 days; extension users have 2.5x higher 30-day retention (55% vs. 22%)

**2.2 Job Tracker Integration (New)**
- **What**: Dashboard showing all tailored resumes linked to specific job applications, with status tracking (Saved, Applied, Interviewing, Rejected, Offer), notes field, and application date
- **Why**: Solves EDA's "lost tailored resumes" problem (30% lose versions after Redis expiration); provides progress visibility that satisfies emotional job ("show family I'm actively searching")
- **How**:
  - Database: Add Supabase tables `jobs` (id, company, title, jd_text, url, created_at) and `applications` (id, user_id, job_id, resume_version_id, status, notes, applied_date)
  - Backend: CRUD endpoints for jobs/applications (`POST /api/jobs`, `PATCH /api/applications/{id}/status`)
  - Frontend: New `<JobTracker>` page with Kanban board view (columns for each status), search/filter by company/date, click to download associated resume version
- **Success Metric**: 65% of users track at least 3 applications; tracked users have 40% higher 30-day retention

---

**Tier 3: Differentiation (Ship Q3+, Post-Validation) — Premium Features for Moat**

These features require user research validation and higher development cost but create long-term competitive moats.

**3.1 Interview Prep Mode (Stage 6) (New)**
- **What**: AI-generated interview questions based on tailored resume + JD, with conversational practice mode where users record/type answers and receive Sonnet-powered feedback on content, structure, and confidence
- **Why**: Extends platform value beyond application phase; no competitor offers integrated interview prep tied to specific tailored resume. QFPs willing to pay $4.99 add-on for this.
- **How**:
  - Question generation: Haiku analyzes tailored resume + JD, generates 10-15 behavioral + technical questions (cost: ~3K tokens)
  - Practice mode: User submits text/audio answers; Sonnet evaluates against STAR framework, provides scored feedback (1-10) with improvement suggestions (cost: ~8K tokens per answer)
  - State management: Store interview session history in Supabase `interview_sessions` table (not Redis due to multi-day usage)
  - Rate limiting: Gate behind Premium tier ($19.99/month) or $4.99 one-time add-on; limit to 3 interview prep sessions per month on Pro tier
- **Validation Needed**: Survey 100 QFP users: "Would you pay $4.99 for AI interview prep tied to your tailored resume?" Target: 60% yes
- **Success Metric**: 30% of Premium users activate interview prep; 4.2+ average rating on feedback quality

**3.2 Secondary User Hardening (New)**
- **What**: Dynamic AI adaptations for underserved segments:
  - **Career changers**: Pre-Stage 0 resume type selector ("Military to Civilian", "Freelance to Corporate"); triggers Haiku pass to map terminology (e.g., "battalion logistics" → "supply chain management")
  - **International users**: Locale toggle (US/UK/Canada/Australia) adjusts Stage 3 prompts for spelling (color/colour), terminology (CV vs. resume), and LaTeX date formatting
  - **Entry-level**: Education-first parsing promotes coursework/projects in Stage 1 JSON; Stage 2 weights "willingness to learn" keywords over "proven track record"
- **Why**: Captures 20% of TAM currently underserved; differentiates from US-centric competitors (Enhancv, Teal)
- **How**:
  - Frontend: Add `<ResumeTypeSelector>` and `<LocaleToggle>` to onboarding flow
  - Backend: Conditional prompt engineering in Stage 2/3 based on `user_profile.resume_type` and `user_profile.locale` from Supabase
  - Terminology mapper: Haiku call with career-changer dictionary (military→corporate, academic→industry) before Stage 2
- **Success Metric**: 15% of users select non-default resume type/locale; these users have 25% higher satisfaction scores

---

### What V2 Explicitly Does NOT Include

**Deprioritized for Post-V2:**
- **B2B Bulk Tailoring API**: Requires separate pricing model ($99-500/month), white-label UI, and persistent project storage. Revisit if 10+ agencies request organically.
- **Advanced Template Customization**: Letting users edit LaTeX code or upload custom templates adds support burden and edge cases. V2 offers 5 high-quality templates; custom design is out of scope.
- **Salary Negotiation Tools**: While adjacent to job search, requires separate AI training and legal review (compensation advice liability). Monitor user requests but don't build speculatively.
- **Networking/Outreach Features**: PitchMeAI's hiring manager email finder is a narrow moat (90% verification rate) but high compliance risk (GDPR, CAN-SPAM). Focus on application quality, not outreach volume.

---

### Technical Architecture Principles for V2

**Cost-Conscious AI Pipeline:**
- Implement prompt caching (Upstash Redis, 24-hour TTL) for Stage 1 parsed resumes and Stage 2 JD analyses; reduces repeat user costs by 40%
- Differential rewriting in Stage 3: Pre-score bullets with Haiku (2K tokens), only send <70% match bullets to Sonnet for rewriting; saves 30-50% Stage 3 tokens per TEO analysis
- Batch validation in Stage 4: Consolidate multiple bullets into single Sonnet call; saves 25% tokens

**Scalable Async Processing:**
- Enhance existing SSE streaming for long-running tasks (cover letter, interview prep)
- Introduce job queue (Celery/RQ with Redis backend) for Stage 5/6 to prevent FastAPI blocking

**Secure State Management:**
- Move critical user data (tailored resumes, job tracker, interview sessions) from Redis (10min TTL) to Supabase for persistence
- Maintain Redis for ephemeral session state (current tailoring progress, template selection)

**Modular Integrations:**
- Stripe: Webhook-driven subscription sync to Supabase `user_subscriptions` table
- Chrome Extension: OAuth via Supabase, client-side JD extraction (no server load), authenticated API endpoints
- LaTeX: Template files in S3-compatible storage, dynamic data injection via `tectonic` compiler

---

### Success Criteria for V2 Launch

**Adoption Metrics (90 days post-launch):**
- 10,000 total users (3x v1 baseline)
- 45% 30-day active user rate (vs. 22% v1)
- 24% free-to-paid conversion (vs. 8% v1)
- 40% Chrome extension installation rate among active users

**Quality Metrics:**
- Average diff review time: 7 minutes (vs. 18 minutes v1)
- AI confidence score accuracy: 85%+ of >90% confidence bullets accepted without edits
- Cover letter opt-in: 50% (vs. 12% v1)
- Template preview usage: 85% of users select template before tailoring

**Business Metrics:**
- $0.45 average COGS per tailoring session (including new features, via caching/optimization)
- $12 average revenue per paying user per month (ARPU)
- <5% monthly churn for paid users
- $60 customer lifetime value (LTV) at 5-month average subscription duration

**Competitive Positioning:**
- Net Promoter Score (NPS): 50+ (vs. Teal ~40, Jobscan ~35 based on G2 reviews)
- "Would you recommend ResumeAI over [Teal/Jobscan]?" survey: 70%+ yes among users who tried both
- SEO ranking: Top 3 for "AI resume tailoring" and "ATS resume builder no hallucinations" keywords

---

## 4. Goals

#

---

## 5. User Stories

#

---

## 6. Features

This section organizes V2 features into three tiers based on strategic value, technical feasibility, and user impact. Each feature includes its rationale, success metrics, and implementation considerations.

#

---

## 7. Functional Requirements

This section details the specific behaviors, inputs, outputs, and edge cases for each V2 feature. Requirements are written as testable acceptance criteria.

#

---

## 8. UX & Design Considerations

#

---

## 9. Non-Functional Requirements

#

---

## 10. Technical Architecture Notes

#

---

## 11. Non-Goals

This section defines what ResumeAI v2 will explicitly **not** pursue to maintain focus, manage scope, and preserve the product's core value proposition. These boundaries protect against feature creep and ensure resources align with the primary user archetypes (EDAs and QFPs).

#

---

## 12. Go-to-Market Strategy

This section outlines how ResumeAI v2 will acquire users, convert free users to paid subscribers, and compete against established players (Teal, Jobscan, Resume Worded) in the $200M AI resume tailoring market. The strategy leverages ResumeAI's unique technical moat (Stage 4 hallucination validation + Sonnet rewriting accuracy) and aggressive pricing ($9.99/month vs. competitor average of $35/month) to capture 2x market share within 12 months of V2 launch.

#

---

## 13. Success Metrics

#

---

## 14. Open Questions

#

---

## 15. Implementation Sequence

### Phase 1: Foundation & Cost Optimization (Weeks 1-4)

**Goal:** Reduce token costs by 50%+ and establish monetization infrastructure before adding new features.

**Sprint 1-2: Token Economics & Instrumentation (Weeks 1-2)**
- Implement prompt caching for Stage 1 (resume parsing) and Stage 2 (JD analysis) using Upstash Redis with 24-hour and 7-day TTLs respectively
- Add differential rewriting logic: pre-filter bullets with <70% keyword match before Stage 3 Sonnet calls (expected 30-50% token reduction)
- Consolidate Stage 4 validation into single batch calls per session (25% token savings)
- Deploy token usage tracking table in Supabase with per-stage, per-model cost attribution
- Instrument 15 critical analytics events: stage completions, bullet actions (accept/reject/edit), download clicks, rate limit hits
- **Success Metric:** Achieve $0.029/job average cost (50% reduction from $0.058 baseline) with n=200 test sessions

**Sprint 3-4: Stripe Freemium & Paywall (Weeks 3-4)**
- Integrate Stripe checkout and webhook endpoints in FastAPI for subscription events
- Create `user_subscriptions` table in Supabase linking Stripe customer IDs to auth.users
- Update slowapi rate limiting to enforce 3 free tailors/month, check subscription status before Stage 1
- Build paywall modal triggered at rate limit with two A/B variants:
  - Variant A: "You've used 3 free tailors. Upgrade for unlimited at $9.99/mo" (scarcity framing)
  - Variant B: "Unlock AI confidence scores + 5 templates for $9.99/mo" (feature value)
- Add post-download upsell banner: "Get unlimited tailoring like Teal+ for 67% less"
- **Success Metric:** 9-15% free-to-paid conversion rate within 30 days (3x baseline 3-5%)

### Phase 2: Core Experience Enhancements (Weeks 5-8)

**Goal:** Close retention gaps vs. Teal/Enhancv by improving template selection and review workflow.

**Sprint 5: Template Gallery & Preview (Week 5)**
- Design 5 LaTeX templates: Corporate (ATS-safe serif), Tech (modern sans-serif), Executive (two-column with summary), Entry-Level (education-first), Creative (minimal with accent colors)
- Build template preview system using pre-generated static PNG screenshots with placeholder data (avoids slow LaTeX compilation)
- Add Stage 0 template selector before upload with hover previews and "Popular for [Job Type]" labels
- Store selected template ID in Redis session, pass to reportlab/tectonic at download
- Track `template_previewed`, `template_selected`, `template_regret` (changed post-tailoring) events
- **Success Metric:** <5% template regret rate, 80%+ users engage with preview before upload

**Sprint 6-7: AI Confidence Scores & Batch Actions (Weeks 6-7)**
- Extend Stage 3 Sonnet output JSON to include per-bullet confidence percentage (0-100%)
- Display confidence badges in diff review UI: High (>85%, green), Medium (70-85%, yellow), Low (<70%, orange)
- Add batch action buttons above bullet list:
  - "Accept All High Confidence" (>85%)
  - "Review Medium & Low" (auto-collapse high confidence bullets)
  - "Reject All Low Confidence" (<70%)
- A/B test confidence display: Control (no scores) vs. Variant (scores + batch actions)
- Track `time_to_download`, `bullet_edit_rate` by confidence bucket, `batch_action_used` events
- **Success Metric:** 25%+ faster time-to-download in variant group, <3 point difference in final match_percent vs. control

**Sprint 8: Cover Letter Discoverability (Week 8)**
- Replace passive cover letter link with modal triggered immediately after PDF/DOCX download
- Modal copy: "80% of hiring managers read cover letters first. Generate yours in 30 seconds with AI."
- Add LaTeX cover letter compilation to existing Stage 5 async job queue
- Stream progress via SSE: "Analyzing your resume..." → "Writing personalized intro..." → "Compiling PDF..."
- Track `cover_letter_modal_shown`, `cover_letter_generated`, `time_from_download_sec` events
- **Success Metric:** 50%+ opt-in rate (up from estimated 10-15% current link clicks)

### Phase 3: Growth Features (Weeks 9-14)

**Goal:** Match Teal/PitchMeAI ecosystem features for user retention and acquisition.

**Sprint 9-11: Chrome Extension (Manifest V3) (Weeks 9-11)**
- Build extension with client-side DOM parsing for job description extraction (LinkedIn, Indeed, Greenhouse career pages)
- Implement Supabase OAuth flow for secure authentication from extension
- Create `/api/extension/resume/list` and `/api/extension/tailor` FastAPI endpoints with CORS configuration
- Add "Tailor with ResumeAI" button overlay on job posting pages
- Store last-used resume in extension local storage for 1-click tailoring
- Enforce 3 auto-tailors/hour rate limit to prevent token abuse (per TEO recommendation)
- Track `extension_jd_extracted` (source_domain, success rate), `extension_to_tailor_conversion` events
- **Success Metric:** 60%+ extension button click → Stage 4 completion rate (vs. 40% manual upload baseline)

**Sprint 12-13: Basic Job Tracker (Weeks 12-13)**
- Create Supabase tables: `jobs` (jd_text, company, url, created_at), `applications` (user_id, job_id, resume_version_id, status, notes)
- Build CRUD API endpoints in FastAPI for job/application management
- Add "Save to Tracker" checkbox on download page, auto-populate job details from Stage 2 JD analysis
- Create simple tracker dashboard in React: Kanban board with Applied/Interviewing/Offer/Rejected columns
- Link each application to the exact tailored resume version used (download from tracker)
- Track `job_added_to_tracker`, `jobs_tracked_per_user`, `job_status_changed` events
- **Success Metric:** 8+ jobs tracked per user correlates with 70%+ 30-day retention (Teal benchmark: 12 jobs)

**Sprint 14: Secondary User Hardening (Week 14)**
- Add "Resume Type" selector in upload flow: Standard, Career Changer, Entry-Level, Executive, International (US/UK)
- Implement dynamic prompt routing in FastAPI:
  - Career Changer: Add Haiku pre-pass to map military/academic/freelance terms to industry equivalents before Stage 2
  - Entry-Level: Adjust Stage 2 keyword weighting to prioritize "foundational skills" over "proven track record"
  - Executive: Add VIP mode flag to bypass ATS scoring, focus Stage 3 on "leadership narrative" prompt
  - International: Pass locale parameter to Stage 3 for British vs. American spelling/terminology
- Add optional "Must-Keep Terms" input field (5-10 technical jargon terms) that Stage 3 preserves verbatim
- Track `resume_type_selected`, `must_keep_terms_used` events
- **Success Metric:** 60%+ of beta testers (n=50, 25 career changers + 25 international) report "AI understood my unique background" in post-use survey

### Phase 4: Premium Differentiation (Weeks 15-18, Post-Validation)

**Goal:** Validate demand for high-margin features before full build.

**Sprint 15-16: Interview Prep Mode (Premium Only) (Weeks 15-16)**
- Survey 200 existing users: "Would you pay $4.99 for AI interview prep based on your resume?" (need 40%+ "definitely yes" to proceed)
- If validated, build dedicated `/api/interview` service in FastAPI with conversational state machine
- Use Haiku for question generation from tailored resume + JD (5-8 behavioral questions)
- Reserve Sonnet for answer evaluation with structured feedback JSON (strengths, improvements, score 1-10)
- Store interview sessions in Supabase `interview_sessions` table (not Redis) for persistence
- Implement strict context window: last 5 Q&A pairs only to control token costs
- Gate behind $19.99/mo Premium tier or $4.99 one-time add-on
- Track `interview_session_started`, `questions_answered_per_session`, `interview_session_token_count`, `interview_session_cost_usd` events
- **Success Metric:** <$0.10/session token cost (alert if exceeded), 8+ questions answered per session for perceived value

**Sprint 17-18: B2B Pilot (Optional, If Demand Exists) (Weeks 17-18)**
- Validate demand via outreach to 10 university career centers and 5 recruiting agencies
- If 3+ express interest, build `/api/batch/tailor` endpoint accepting CSV input (resume URLs + JD URLs)
- Create separate `b2b_accounts` table with API key authentication and usage quotas
- Offer white-label option: custom branding CSS variables in React app
- Pricing: $99/mo for 500 tailors, $500/mo minimum for white-label
- **Success Metric:** 2+ paying B2B customers within 60 days of launch (validates $500/mo minimum)

### Deprioritized for V2 (Move to V3 Backlog)

- **Advanced Interview Prep Features:** Multi-session tracking, company-specific question banks (wait for initial adoption data)
- **Bulk Template Expansion:** Beyond 5 templates (diminishing returns per competitive analysis)
- **Mobile App:** Focus on web + extension first, validate mobile demand via analytics (current mobile web traffic %)
- **LinkedIn Profile Optimization:** Separate product line, requires different AI prompts and UX
- **Video Interview Prep:** Requires webcam integration and video processing infrastructure (too complex for V2)

### Rollout Strategy

**Beta Testing (2 weeks before each phase):**
- Phase 1: Internal team + 20 power users (5+ tailors in V1)
- Phase 2: 100 users (50 EDA, 50 QFP archetypes based on edit_rate clustering)
- Phase 3: 500 users (prioritize Chrome extension waitlist)
- Phase 4: Premium tier only (existing paid users + targeted outreach)

**Feature Flags (LaunchDarkly/GrowthBook):**
- All new features behind flags for gradual rollout (10% → 50% → 100%)
- Instant rollback capability if error rates >5% or token costs exceed budget

**Communication Cadence:**
- Weekly engineering standups: review token cost dashboards, stage completion funnels, A/B test results
- Bi-weekly product review: prioritization adjustments based on user feedback and competitive moves
- Monthly all-hands: share key metrics (MRR, conversion rate, NPS by archetype)

---

---

## 16. Risks & Assumptions

### High-Severity Risks (Require Mitigation Plans)

**Risk 1: Token Cost Overruns Destroy Unit Economics**
- **Assumption:** TEO's caching and differential rewriting strategies will achieve 50-70% cost reduction to $0.017-0.029/job
- **Risk:** If cache hit rates <30% (power users don't reuse resumes) or differential rewriting degrades quality, costs remain at $0.058/job
- **Impact:** At $9.99/mo Pro tier with 50 tailors/month, token costs alone = $2.90 (29% margin before infrastructure). If costs stay at $0.058/job, margin drops to -19% (unsustainable)
- **Mitigation:**
  - **Pre-launch validation:** Run 200 test sessions with caching enabled, measure actual hit rates and quality scores (match_percent, ats_score must stay within 3 points of non-cached)
  - **Dynamic pricing:** If costs don't decrease, adjust Pro tier to 30 tailors/month or increase price to $14.99/mo
  - **Kill switch:** Revert to V1 pipeline if token costs exceed $0.045/job for 7 consecutive days
- **Owner:** Engineering lead + Finance (weekly cost review)

**Risk 2: Freemium Cannibalization (Users Stay on Free Tier)**
- **Assumption:** 3 free tailors/month is sufficient to demonstrate value but scarce enough to drive 9-15% conversion
- **Risk:** If users game the system (multiple accounts, wait 30 days) or 3 tailors satisfies 80%+ of use cases, conversion stays at 3-5%
- **Impact:** At 3% conversion, need 3,333 signups/month to hit $1,000 MRR (vs. 1,111 at 9%). CAC of $5 (competitive benchmark) = $16,665/mo acquisition cost for $1,000 MRR (16.7x payback period)
- **Mitigation:**
  - **A/B test free limits:** Run 2-month test with 2 tailors/month vs. 3 tailors/month cohorts, measure conversion delta
  - **Feature gating:** Reserve AI confidence scores, template gallery, and cover letters for paid tiers (not just volume limits)
  - **Email nurture:** Trigger upgrade prompts at tailor #2 ("You're almost out! Upgrade now for 20% off") and day 7 post-signup if no return visit
  - **Account abuse detection:** Flag users with >1 account from same IP/device fingerprint, soft-block after 2nd violation
- **Owner:** Product manager + Growth lead (bi-weekly conversion funnel review)

**Risk 3: Chrome Extension Security Breach**
- **Assumption:** Supabase OAuth flow and client-side JD extraction are secure enough to prevent credential theft or data leakage
- **Risk:** Extensions are high-value targets for attackers. If compromised, attacker gains access to user resumes (PII), Supabase sessions, or can inject malicious JDs
- **Impact:** Data breach affects 100% of extension users, potential GDPR fines (4% revenue or €20M), loss of user trust (estimated 60% churn)
- **Mitigation:**
  - **Security audit:** Hire external penetration tester to audit extension before public launch (budget: $5,000)
  - **Minimal permissions:** Request only `activeTab` and `storage` permissions (not `<all_urls>`), no persistent background scripts
  - **Short-lived tokens:** Extension exchanges Supabase session for 1-hour JWT from FastAPI, re-authenticates on expiry
  - **Content Security Policy:** Strict CSP headers to prevent XSS in extension popup
  - **Rate limiting:** 3 auto-tailors/hour per user (already planned) prevents bulk data exfiltration
  - **Monitoring:** Alert on anomalous extension API usage (e.g., 100+ requests/hour from single user)
- **Owner:** Security engineer + Extension developer (weekly threat model review)

**Risk 4: LaTeX Compilation Failures Block Downloads**
- **Assumption:** Tectonic + reportlab can reliably compile 95%+ of resumes across 5 templates with user-provided data
- **Risk:** Edge cases (special characters in names, extremely long bullet points, malformed JSON from Stage 1) cause compilation errors
- **Impact:** If 10% of downloads fail, user frustration leads to 1-star reviews and 40% churn (based on SaaS error tolerance studies)
- **Mitigation:**
  - **Fallback rendering:** If LaTeX fails, auto-generate DOCX with python-docx (lower quality but functional)
  - **Input sanitization:** Escape special LaTeX characters (\, {, }, %, &) in Stage 1 JSON output before template injection
  - **Error logging:** Capture full LaTeX compilation logs in Supabase, create Slack alert for any failure
  - **Golden test suite:** Run 100 edge-case resumes (Unicode names, 50+ bullet points, multiple degrees) through all templates weekly
  - **User feedback loop:** "Download failed? Try DOCX format or contact support" message with 1-click error report
- **Owner:** Backend engineer + QA lead (daily error rate monitoring)

### Medium-Severity Risks (Monitor & Adapt)

**Risk 5: Interview Prep Mode Low Adoption**
- **Assumption:** 40%+ of surveyed users will pay $4.99 for interview prep, translating to 20%+ of Premium tier users actually using it
- **Risk:** Survey responses overstate intent (hypothetical bias). Actual usage may be <10% due to time commitment or preference for human mock interviews
- **Impact:** Wasted 4 weeks of engineering effort (Sprint 15-16), $0.075/session token costs with minimal revenue offset
- **Mitigation:**
  - **Validate before build:** Require 40%+ "definitely yes" in survey of n=200 users. If <40%, deprioritize to V3
  - **Soft launch:** Release to Premium tier only (not as add-on) for first 60 days, measure adoption rate
  - **Kill criteria:** If <10% of Premium users try interview prep in first 30 days, sunset feature and reallocate tokens to core tailoring
- **Owner:** Product manager (monthly feature adoption review)

**Risk 6: Competitive Response (Teal/Jobscan Copy Features)**
- **Assumption:** ResumeAI's Stage 4 hallucination validation and lower pricing ($9.99 vs. $29-50) create defensible moat
- **Risk:** Teal (raised $6.5M Series A in 2024) can afford to match pricing or add validation features within 6 months
- **Impact:** Lose differentiation, price war compresses margins, harder to acquire users at $5 CAC
- **Mitigation:**
  - **Speed to market:** Ship Phase 1-2 in 8 weeks (vs. typical 12-16 week competitor cycles)
  - **Brand positioning:** Emphasize "Claude-powered accuracy" and "no hallucinations" in all marketing (Teal uses generic GPT-4)
  - **Network effects:** Job tracker + extension create switching costs (users have data locked in platform)
  - **Continuous innovation:** Reserve 20% of engineering capacity for experimental features (e.g., salary negotiation scripts, LinkedIn headline optimizer)
- **Owner:** CEO + Product manager (quarterly competitive landscape review)

**Risk 7: Secondary User Features Dilute Core Experience**
- **Assumption:** Career changer/international/entry-level prompts improve quality for 20% of users without degrading experience for remaining 80%
- **Risk:** Dynamic prompt routing adds complexity, increases Stage 2-3 latency by 15-20%, or introduces bugs that affect all users
- **Impact:** If core tailoring slows from 90 seconds to 110 seconds, EDA archetype (speed-focused) abandonment increases 25% (estimated from UX research on load time tolerance)
- **Mitigation:**
  - **Performance budget:** Stage 2-3 combined must stay <100 seconds at p95 latency. If exceeded, simplify prompts or add Haiku pre-filtering
  - **Feature flag isolation:** Secondary user prompts behind separate flags, instant rollback if error rates spike
  - **A/B test impact:** Run 2-week test with 20% of users on dynamic prompts, measure stage completion rates and match_percent vs. control
- **Owner:** Engineering lead (weekly latency dashboard review)

### Low-Severity Risks (Accept & Monitor)

**Risk 8: Template Gallery Doesn't Drive Upgrades**
- **Assumption:** 5 templates with preview will increase perceived value and reduce "design regret" (users unhappy with default template)
- **Risk:** Users satisfied with 1-2 templates, don't explore gallery, or prefer to format in Word post-download
- **Impact:** 3 weeks of design/engineering effort (Sprint 5) doesn't move conversion needle
- **Mitigation:** Track `template_previewed` and `template_regret` events. If <50% users preview templates or regret rate stays >10%, deprioritize template expansion in V3
- **Owner:** Product designer (monthly UX metrics review)

**Risk 9: Job Tracker Maintenance Burden**
- **Assumption:** Basic Kanban board (Applied/Interviewing/Offer/Rejected) is sufficient for MVP, users don't need advanced features (reminders, analytics)
- **Risk:** Users request Teal-level features (follow-up reminders, response rate analytics, contact management), creating support burden
- **Impact:** 10+ feature requests/week, pressure to expand scope beyond V2 timeline
- **Mitigation:** Set expectations in UI: "Simple tracker to organize your tailored resumes. More features coming in V3." Add feedback widget to capture requests for prioritization
- **Owner:** Product manager (monthly feature request triage)

### Critical Assumptions Requiring Validation

**Assumption 1: Supabase Can Handle 10x User Growth**
- **Current State:** V1 likely has <1,000 users based on "V1 live" status
- **V2 Goal:** Freemium + extension could drive 10,000+ signups in first 6 months
- **Validation:** Load test Supabase with 10,000 concurrent sessions, 100 req/sec to `/api/tailor` endpoint. Measure database connection pool exhaustion, query latency at scale
- **Contingency:** If Supabase struggles, migrate to self-hosted PostgreSQL on AWS RDS (4-week migration effort)

**Assumption 2: Users Will Accept AI Confidence Scores**
- **Risk:** Showing "Low Confidence (65%)" might erode trust in AI, causing users to reject all suggestions
- **Validation:** A/B test in Sprint 6-7 must show equal or higher `user_trust_score` in post-download survey vs. control group
- **Contingency:** If trust scores drop >10 points, hide confidence percentages, show only "AI Suggested" badge

**Assumption 3: 3 Free Tailors/Month Is Optimal**
- **Benchmark:** Teal offers unlimited resumes but limits AI generations. Jobscan offers 5 free scans/month
- **Validation:** A/B test 2 vs. 3 vs. 5 free tailors with 1,000 users each, measure conversion rate and LTV over 90 days
- **Contingency:** If 5 free tailors converts 2x better with acceptable LTV, increase limit

**Assumption 4: Chrome Extension Drives 2x Engagement**
- **Hypothesis:** Extension users will tailor 2x more resumes/month than web-only users due to reduced friction
- **Validation:** Compare `tailors_per_user_per_month` for extension cohort vs. web cohort over 60 days
- **Contingency:** If no engagement lift, deprioritize extension maintenance, focus on web experience

---

---

## 17. Dependencies & Integrations

### External Service Dependencies

**Anthropic Claude API (Critical Path)**
- **Integration Points:** All 6 stages (parse, analyze, rewrite, validate, cover letter, interview prep)
- **Current Status:** V1 uses Haiku (Stages 1-2) and Sonnet (Stages 3-5). Interview prep (Stage 6) planned for Haiku questions + Sonnet evaluation
- **V2 Requirements:**
  - Prompt caching API (announced by Anthropic in 2024, confirm availability in production)
  - Increased rate limits to support 10x user growth (current 10 req/min may bottleneck at 1,000+ concurrent users)
  - Batch API for Stage 4 validation (if available, reduces latency by 30%)
- **Risk:** Anthropic pricing changes or API deprecations. Haiku/Sonnet models updated with breaking prompt behavior
- **Mitigation:**
  - Lock Claude API version in FastAPI client (e.g., `anthropic==0.25.0`), test new versions in staging before upgrading
  - Budget 20% buffer for token cost increases ($0.035/job instead of $0.029 target)
  - Maintain fallback prompts for older Claude versions in case of rollback
  - Monitor Anthropic status page, subscribe to API changelog emails
- **Owner:** Backend engineer (weekly API health check, monthly cost review)

**Stripe (Critical for Monetization)**
- **Integration Points:** Checkout, subscription management, webhook events (payment success/failure, subscription updates, cancellations)
- **V2 Requirements:**
  - Stripe Checkout for one-time payments ($4.99 interview prep add-on) and subscriptions ($9.99 Pro, $19.99 Premium)
  - Webhook endpoint in FastAPI to sync subscription status to Supabase `user_subscriptions` table
  - Customer portal for users to manage billing, update payment methods, cancel subscriptions
- **Risk:** Webhook delivery failures cause subscription status desync (user pays but stays on free tier, or vice versa)
- **Mitigation:**
  - Implement idempotent webhook handler (use

---

## 18. Appendix: Pre-RC Research Summary

| Persona | Provider | Tokens | Stage |
|---------|----------|--------|-------|
| Meta Product Architect | gemini | 2,689 | stage-1-meta |
| Research Program Director | claude | 2,240 | stage-1-meta |
| Token Economics Optimizer | claude | 1,758 | stage-1-meta |
| Primary User Archetype Researcher | gemini | 7,139 | stage-2-user-intelligence |
| Secondary & Edge User Analyst | claude | 5,055 | stage-2-user-intelligence |
| Demand-Side Research Theorist | gemini | 6,156 | stage-2-user-intelligence |
| Market Landscape & Competitive Intelligence Analyst | perplexity | 8,975 | stage-3-business-market |
| Systems Architect | gemini | 13,443 | stage-4-technical |
| AI/ML Systems Specialist | claude | 13,013 | stage-4-technical |
| Data & Telemetry Strategist | claude | 13,136 | stage-4-technical |
| Cognitive Load & Behavioral Psychology Analyst | gemini | 19,845 | stage-5-ux |
| Content & Language Strategist | claude | 20,583 | stage-5-ux |
| Persona Coverage Auditor | claude | 24,004 | stage-6-validation |
| Research Synthesis & Compression Specialist | claude | 24,296 | stage-6-validation |
| PRD Translation Specialist | claude | 24,994 | stage-6-validation |
| Persona Coverage Auditor | claude | 0 | stage-6-validation |
| Research Synthesis & Compression Specialist | claude | 32,864 | stage-6-validation |
| PRD Translation Specialist | claude | 33,784 | stage-6-validation |

Full research artifacts: `pre-rc-research/stage-{1-6}/`

---

## 19. RC Method Metadata

- **Parent PRD:** None (this is the master)
- **Child PRDs:** None yet
- **Phase:** Define (generated from Pre-RC Research)
- **Gate Status:** Gate 3 Approved
- **Research Deliverables:** 18 deliverables from 18 research specialists
- **Research AI Usage:** 253,974
- **Synthesis AI Usage:** 148,646
- **Anti-Pattern Check:** Not yet run

### Pipeline Tracking

| Phase | Status | Tool | Output |
|-------|--------|------|--------|
| **Research** | Complete | Pre-RC Stages 1-5 | 18 specialist deliverables |
| **Analysis** | Complete | Pre-RC Stage 6 + Synthesis | This PRD + task list |
| **Define & Architect** | Pending | RC-Method `rc_define` + `rc_architect` | Refined PRD + UX child PRD + architecture |
| **Sequence & Build** | Pending | RC-Method `rc_sequence` + `rc_forge` | Sequenced tasks + implementation |
| **Validate** | Pending | RC-Method `rc_validate` | Quality gates + anti-pattern scan |

**Handoff:** This PRD is the Pre-RC output. Feed into RC-Method `rc_start` -> `rc_define` to continue.