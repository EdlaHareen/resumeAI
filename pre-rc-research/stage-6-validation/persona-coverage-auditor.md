# Persona Coverage Auditor

**Stage:** stage-6-validation
**LLM:** claude
**Mode:** passthrough
**Tokens:** 0
**Generated:** 2026-03-07T05:57:25.831Z

---

## Persona Coverage Auditor - Manual Mode

> **Why manual mode?** Automatic mode failed after retries: 429 {"type":"error","error":{"type":"rate_limit_error","message":"This request would exceed your organization's rate limit of 30,000 input tokens per minute (org: bf5284d1-ce75-4310-b4c4-108f5cdca848, model: claude-sonnet-4-5-20250929). For details, refer to: https://docs.claude.com/en/api/rate-limits. You can see the response headers for current usage. Please reduce the prompt length or the maximum tokens requested, or try again later. You may also contact sales at https://www.anthropic.com/contact-sales to discuss your options for a rate limit increase."},"request_id":"req_011CYoCoPHWq14qqYGm4gjg6"}

### Knowledge Reference
[Knowledge file not found: personas/persona-coverage-auditor.md]

---

### Research Prompt
# Product Brief

**Project:** ResumeAI v2
**Description:** ResumeAI is an AI-powered resume tailoring platform (V1 live). Core flow: user uploads resume (PDF/DOCX) + pastes job description → Claude AI runs a 4-stage pipeline (Stage 1: parse resume to structured JSON via Haiku, Stage 2: analyze JD for ATS keywords via Haiku, Stage 3: rewrite bullets to match

ResumeAI is an AI-powered resume tailoring platform (V1 live). Core flow: user uploads resume (PDF/DOCX) + pastes job description → Claude AI runs a 4-stage pipeline (Stage 1: parse resume to structured JSON via Haiku, Stage 2: analyze JD for ATS keywords via Haiku, Stage 3: rewrite bullets to match JD without hallucination via Sonnet, Stage 4: hallucination validation via Sonnet) → user reviews diff of original vs tailored bullets (accept/reject/edit per bullet) → downloads tailored resume as PDF or DOCX → optional AI cover letter (Stage 5: async Sonnet, JSON output for LaTeX PDF). Stack: FastAPI backend + React 19/TypeScript/Tailwind CSS 4 frontend, Supabase auth (optional), Upstash Redis session store (10min TTL), slowapi rate limiting (10/min tailor, 5/min cover-letter), reportlab + python-docx + LaTeX (tectonic) for output. Scoring: match_percent (keyword overlap), ats_score (heuristics), strength_score (action verbs + quantified results). Features already built: SSE streaming progress, edge case detection, bullet accept/reject/edit, ATS keyword chips, download bar with PDF+DOCX. Planned for V2: LaTeX cover letter PDF (detailed plan ready), Stripe freemium (pricing UI in LandingPage already), resume template gallery (3 LaTeX templates), interview prep mode (Stage 6), Chrome extension (Manifest V3). The question: what should V2 look like — what new features to add, what existing features to improve, and how to prioritize them?


# Complexity Classification

**Domain:** complex
**Product Class:** AI Career Assistant
**Complexity Factors:** Multi-stage AI pipeline with external LLM dependencies, AI output quality control and hallucination validation, Dynamic content generation and complex document rendering
**Reasoning:** The product is fundamentally an AI-native platform with a multi-stage AI pipeline that involves complex tasks like parsing, rewriting, and hallucination validation. The inherent unpredictability and continuous need to refine AI output quality, coupled with the evolving nature of AI technology and the addition of new AI features like 'Interview prep mode', place it firmly in the Complex domain.


# Previous Research Context

## Meta Product Architect (stage-1-meta)

As the Meta Product Architect, my analysis for ResumeAI v2 focuses on leveraging the existing robust foundation to strategically expand the platform's value, enhance user experience, and solidify its market position as a comprehensive AI career assistant.

---

## Research Analysis: ResumeAI v2

**Strategic Imperatives for V2:**

1.  **Deepen Core Value & AI Differentiation:** Evolve beyond just

## Research Program Director (stage-1-meta)

# Research Program Director Analysis: ResumeAI V2

## 1. Strategic Research Priorities

### Primary Research Questions
1. **AI Quality Perception**: How do users evaluate "good" vs "bad" AI-tailored content? What triggers manual edits vs acceptance?
2. **Conversion Friction**: At what point in the 4-stage pipeline do users abandon? What causes freemium→paid conversion?
3. **Feature Value Hierarchy**: Which planned V2 features (LaTeX templates, interview prep, Chrome extension) drive retention vs acquisition?

### Research Approach
- **Quantitative**: Instrument existing V1 flow with analytics (Amplitude/Mixpanel) to track:
  - Stage completion rates (1→2→3→4→download)
  - Bullet acceptance rate by stage 3 quality
  - Time-to-first-download (proxy for value realization)
  - Redis session data mining (10min TTL captures abandonment patterns)
- **Qualitative**: 15 user interviews (5 recent converters, 5 free users, 5 churned) focusing on:
  - AI trust calibration: "How did you verify the tailored bullets were accurate?"
  - Feature discovery: "Did you know about cover letter generation?"
  - Competitive context: "What other tools did you try?"

## 2. Critical Knowledge Gaps

### High-Impact Unknowns
1. **Hallucination Validation Efficacy**: Stage 4 exists, but do users *trust* it? Need A/B test showing validation results vs hiding them.
2. **ATS Keyword Obsession**: Are users over-optimizing for `match_percent` at the expense of readability? Test correlation between high scores and interview callbacks.
3. **Cover Letter Adoption**: Stage 5 is "optional" and async—what % of users discover it? Is LaTeX PDF output a differentiator or invisible?

### Competitive Intelligence Gaps
- **Benchmarking**: No mention of competitive analysis. Need teardown of Teal, Rezi, Kickresume (pricing, AI quality, template variety).
- **Chrome Extension Moat**: LinkedIn/Indeed job scrapers are commoditized. What unique value does ResumeAI's extension provide beyond auto-paste?

## 3. User Behavior Insights Needed

### Workflow Friction Points
- **Upload→Parse**: Stage 1 (Haiku JSON parsing) likely has formatting errors with complex resumes (tables, graphics). Need error log analysis + recovery UX research.
- **Diff Review Fatigue**: Reviewing 15+ bullets with accept/reject/edit is cognitively taxing. Test batch actions ("Accept all technical bullets") or AI confidence scores per bullet.
- **Template Lock-In**: Users invest time tailoring, then discover template doesn't match their industry (creative vs corporate). Need upfront template selection + preview.

### Monetization Research
- **Willingness-to-Pay Triggers**: Interview users who *would* pay to identify threshold features:
  - Hypothesis: Unlimited tailoring attempts (rate limit removal) > templates > interview prep
- **Freemium Boundary**: Current rate limits (10/min tailor, 5/min cover letter) may be too generous. Test 3 tailors/month free tier.

## 4. V2 Feature Prioritization Framework

### Tier 1: Retention & Quality (Ship First)
1. **AI Confidence Scores**: Surface Sonnet's certainty per bullet (0-100%) so users know what to review closely. Low effort, high trust impact.
2. **Batch Bullet Actions**: "Accept all," "Reject weak bullets" based on `strength_score`. Reduces review fatigue.
3. **Template Preview Before Tailoring**: Let users pick LaTeX template in Stage 0, preview with their data. Prevents post-tailoring disappointment.

### Tier 2: Monetization Enablers (Revenue Unlock)
4. **Stripe Freemium Implementation**: Gate at 3 free tailors, then $9.99/month or $2.99/tailor. Pricing UI exists; backend integration is table stakes.
5. **Cover Letter Discoverability**: Promote Stage 5 in post-download modal ("Want a matching cover letter? 2min"). Track opt-in rate.

### Tier 3: Differentiation (Competitive Moat)
6. **Interview Prep Mode (Stage 6)**: High complexity, unclear ROI. Delay until user research validates demand ("Would you pay $4.99 for AI interview Q&A based on your resume?").
7. **Chrome Extension**: Only ship if it auto-extracts JD *and* pre-populates user's resume from Supabase. Otherwise, it's a shortcut to existing flow (low value).

### Deprioritize
- **3 LaTeX Templates**: Diminishing returns after 2 (corporate, creative). Focus on quality over quantity.

## 5. Risk Mitigation Research

### AI Pipeline Risks
- **Prompt Drift**: As Claude models update, Stage 3 rewriting quality may degrade. Establish regression test suite with 50 "golden" resume+JD pairs, track `strength_score` over time.
- **Hallucination False Negatives**: Stage 4 may miss subtle fabrications (inflated metrics). User study: show 10 tailored bullets (5 with planted hallucinations), measure detection rate.

### Technical Debt
- **Redis 10min TTL**: Users who step away lose progress. Research: survey interrupted users—would they pay for "Save draft" (Supabase persistence)?

## 6. Immediate Next Steps (2-Week Sprint)

1. **Instrument V1**: Add Mixpanel events to all stages, bullet actions, download formats. Let bake 2 weeks for n=500+ sessions.
2. **Competitive Teardown**: PM + Designer audit Teal/Rezi (AI quality, pricing, templates). Document gaps.
3. **User Interviews**: Recruit 5 recent users via email. Ask: "What almost stopped you?" and "What would make you pay?"
4. **A/B Test**: Show AI confidence scores to 50% of users. Measure impact on bullet acceptance rate + time-to-download.

**Success Metric**: V2 should increase free→paid conversion by 3x (baseline TBD from instrumentation) and reduce Stage 3→4 abandonment by 40%.

## Token Economics Optimizer (stage-1-meta)

# Token Economics Optimization Analysis: ResumeAI v2

## Current Token Consumption Profile

**Stage-by-stage token usage (estimated per job):**
- Stage 1 (Parse): ~2K tokens (Haiku) - $0.0005
- Stage 2 (JD Analysis): ~3K tokens (Haiku) - $0.0008
- Stage 3 (Rewrite): ~8K tokens (Sonnet) - $0.024
- Stage 4 (Validation): ~6K tokens (Sonnet) - $0.018
- Stage 5 (Cover Letter): ~5K tokens (Sonnet) - $0.015
- **Total per complete flow: ~24K tokens, ~$0.058/job**

At 10 req/min rate limit: **max $35/hour burn rate** during peak usage.

## Critical V2 Token Optimization Opportunities

### 1. **Caching Strategy (Highest ROI)**
**Implementation:** Leverage Claude's prompt caching for Stage 1 & 2
- Cache resume parse results (Stage 1) for 5min TTL → reuse if user tries multiple JDs
- Cache JD analysis (Stage 2) for same job URL/hash → save 5K tokens on duplicate applications
- **Impact:** 40-60% token reduction for power users (avg 2.3 JDs/resume)
- **Cost:** Negligible (Upstash Redis already in stack)

### 2. **Differential Rewriting (Stage 3 Optimization)**
**Current:** Rewrites ALL bullets regardless of match quality
**Proposed:** Pre-filter bullets by relevance score
- Only rewrite bullets with <70% keyword match
- Pass high-match bullets through unchanged
- **Impact:** 30-50% Stage 3 token reduction (biggest cost center)
- **Quality trade-off:** Minimal - already-strong bullets don't need AI

### 3. **Batch Validation (Stage 4 Consolidation)**
**Current:** Separate validation pass for each rewritten bullet
**Proposed:** Single validation call with all bullets in structured JSON
- Reduces overhead from repeated system prompts
- **Impact:** 25% Stage 4 token savings
- **Risk:** Slightly higher latency (mitigate with SSE streaming)

## V2 Feature Token Budget Planning

### Interview Prep Mode (Stage 6) - **HIGH RISK**
**Estimated:** 15-25K tokens per session (conversational, multi-turn)
- **Mitigation:** Implement strict context window (last 5 Q&A pairs only)
- **Pricing gate:** Must be premium-tier only (>$0.075/session cost)
- **Alternative:** Haiku for question generation, Sonnet only for answer evaluation

### Chrome Extension - **MEDIUM RISK**
- If auto-detecting JDs: +5K tokens/page scan
- **Mitigation:** Client-side JD extraction (DOM parsing), send only cleaned text
- **Rate limit:** 3 auto-tailors/hour to prevent abuse

### Template Gallery - **LOW IMPACT**
- Token cost unchanged (rendering only)
- **Opportunity:** Cache template-specific formatting instructions

## Freemium Tier Token Gating

**Recommended limits aligned with unit economics:**
- **Free:** 3 tailors/month (24K × 3 = 72K tokens = $0.17 + infra)
- **Pro ($15/mo):** 50 tailors (1.2M tokens = $2.90 + cover letters)
- **Premium ($30/mo):** Unlimited tailors + interview prep

**Break-even:** ~6 tailors/month at $15 tier (accounting for 40% payment processing + CDN)

## Immediate Action Items for V2

1. **Pre-launch:** Implement prompt caching (2-day eng effort, 50% cost reduction)
2. **Phase 1:** Add differential rewriting toggle (1-week, A/B test quality)
3. **Phase 2:** Gate interview prep behind Premium tier with Haiku-first architecture
4. **Monitoring:** Add per-stage token tracking to Supabase analytics (cost attribution)

**Projected V2 savings:** 55-70% token cost reduction with zero quality degradation, enabling sustainable freemium model at current pricing.

## Primary User Archetype Researcher (stage-2-user-intelligence)

# Primary User Archetype Research: ResumeAI v2

As the Primary User Archetype Researcher, my analysis focuses on defining the core users of ResumeAI v2, understanding their motivations and pain points, and how planned features will impact their experience and adoption.

---

## 1. Primary User Archetypes

Based on the product's value proposition and the current market, two primary archetypes emerge, each with distinct needs and behaviors that will shape V2's success.

### Archetype 1: The "Efficiency-Driven Applicant" (EDA)

*   **Profile:** Often a high-volume job seeker, potentially unemployed, or actively exploring multiple opportunities. They are tech-savvy but time-poor.
*   **Goals:**
    *   Apply to many jobs quickly and efficiently.
    *   Maximize chances of passing ATS scans without extensive manual effort.
    *   Reduce the mental load of tailoring each application.
    *   Secure interviews faster.
*   **Pain Points:**
    *   Time-consuming manual resume customization for each job.
    *   Fear of missing critical keywords or formatting issues.
    *   "Resume fatigue" from repetitive tasks.
    *   Cost-sensitive; looks for value or free tiers.
*   **Motivations:** Speed, automation, ATS compliance, ease of use, cost-effectiveness.
*   **Key V1 Interactions:** Primarily uses the core 4-stage pipeline, values `match_percent` and `ats_score`. Likely accepts most AI suggestions to save time.
*   **V2 Expectations:** Seamless, faster workflows. Clear value proposition for paid tiers.

### Archetype 2: The "Quality-Focused Professional" (QFP)

*   **Profile:** Strategic job seekers targeting specific, higher-level, or niche roles. They are often employed but seeking career advancement or a significant transition. Values precision and a highly polished brand.
*   **Goals:**
    *   Craft a highly targeted, impactful resume and cover letter for a specific role.
    *   Ensure the application reflects their unique value proposition and professional brand.
    *   Build confidence for interviews related to the tailored application.
    *   Maintain full control over the final output, trusting but verifying AI suggestions.
*   **Pain Points:**
    *   Concerns about AI hallucinations or generic output.
    *   Difficulty articulating complex experiences concisely.
    *   Need for a cohesive, professional application package (resume + cover letter).
    *   Desire for a unique, visually appealing resume format.
*   **Motivations:** Accuracy, professional presentation, control, differentiation, career growth. Willing to pay for premium features that ensure quality and provide a competitive edge.
*   **Key V1 Interactions:** Carefully reviews diffs, uses edit features, values `strength_score`, may generate cover letters.
*   **V2 Expectations:** Enhanced AI quality, advanced customization, comprehensive support for their job search strategy.

---

## 2. User Journey & V2 Touchpoints

Mapping the journey of these archetypes highlights critical touchpoints for V2 features.

### A. EDA Journey (Emphasis on Speed & Volume)

1.  **Discovery:** Sees an ad, hears word-of-mouth, or searches for "AI resume builder."
2.  **Onboarding/Trial:** Uploads resume, pastes JD. Expects immediate, visible value from the tailoring process.
    *   **V2 Touchpoint:** *Stripe Freemium:* Will hit free tier limits quickly. The prompt to upgrade must clearly articulate value (e.g., "You've tailored 3 resumes this month! Upgrade for unlimited tailoring and more features.").
3.  **Tailoring & Review:** Quickly scans `match_percent` and `ats_score`. May use "Accept all" or "Accept all strong bullets" (RPD's "Batch Bullet Actions") if available.
    *   **V2 Touchpoint:** *AI Confidence Scores:* Useful for quick verification, allowing faster acceptance.
4.  **Download:** Downloads tailored resume.
5.  **Re-engagement:** Finds another job, repeats the process.
    *   **V2 Touchpoint:** *Chrome Extension:* Crucial for reducing friction here, allowing them to initiate tailoring directly from a job board with minimal clicks.
6.  **Cover Letter (Optional):** May generate a cover letter if it's quick and easy, but not a primary driver.
    *   **V2 Touchpoint:** *Cover Letter Discoverability:* Needs to be prominent post-download.

### B. QFP Journey (Emphasis on Quality & Strategy)

1.  **Discovery:** Researches advanced career tools, seeks specific solutions for resume/cover letter gaps.
2.  **Onboarding/Trial:** Uploads resume, pastes JD. Expects sophisticated, nuanced tailoring.
    *   **V2 Touchpoint:** *Template Preview Before Tailoring:* Essential for QFPs to ensure the visual aesthetic matches their professional brand *before* investing time.
3.  **Tailoring & Review:** Meticulously reviews each bullet, comparing original vs. tailored. Actively uses edit features. Values `strength_score` and `ats_score` for strategic optimization, not just keyword stuffing.
    *   **V2 Touchpoint:** *AI Confidence Scores:* Directly addresses their need to trust but verify, guiding their manual review efforts.
    *   **V2 Touchpoint:** *Batch Bullet Actions:* Can be used strategically (e.g., "Accept all technical bullets," then focus on soft skills).
4.  **Download & Cover Letter:** Downloads tailored resume. Actively seeks a matching, high-quality cover letter.
    *   **V2 Touchpoint:** *LaTeX Cover Letter PDF:* High-quality, professional output is a key differentiator.
5.  **Interview Preparation:** Once an interview is secured, seeks tools to prepare.
    *   **V2 Touchpoint:** *Interview Prep Mode:* A significant value-add, extending the platform's utility beyond the application phase.
6.  **Template Exploration:** May browse templates to ensure their resume stands out visually.
    *   **V2 Touchpoint:** *Resume Template Gallery (LaTeX):* Quality over quantity is key here; a few excellent, professional templates are more valuable than many mediocre ones.

---

## 3. V2 Feature Impact & Prioritization (User-Centric)

Based on archetype needs, here’s how V2 features should be prioritized and improved for the PRD:

### Tier 1: Core Quality & Retention (High Impact for both EDA & QFP)

1.  **AI Confidence Scores (Improve existing):** Directly addresses QFP's need for trust and EDA's need for quick verification. This is a low-effort, high-impact feature that builds user trust and reduces review fatigue. **Action:** Implement as an A/B test per RPD.
2.  **Template Preview Before Tailoring (New):** Critical for QFP satisfaction and preventing "template lock-in" (RPD). EDA also benefits from seeing the final look early. **Action:** Integrate into Stage 0/1 of the flow.
3.  **Batch Bullet Actions (New):** Reduces "diff review fatigue" for both archetypes. EDA benefits from "Accept all," QFP from selective batching. **Action:** Implement granular batching options (e.g., "Accept all technical," "Reject weak").
4.  **Stripe Freemium Implementation (New):** Essential for monetization. The key is *how* it's implemented. For EDA, the free tier must provide enough value to hook them, then clearly articulate the paid benefits. For QFP, it should unlock advanced quality features. **Action:** Design freemium gates aligned with TEO's recommendations, focusing on value messaging.

### Tier 2: Strategic Differentiation & Monetization (High Impact for QFP, growing for EDA)

5.  **LaTeX Cover Letter PDF (New):** A significant differentiator for QFP, providing a complete, professional application package. High-quality output reinforces ResumeAI's premium positioning. **Action:** Prioritize robust implementation and clear discoverability (RPD).
6.  **Cover Letter Discoverability (Improve existing):** Crucial for driving adoption of Stage 5, especially for EDAs who might not actively seek it. **Action:** Implement post-download modal and in-app prompts.

### Tier 3: Growth & Long-Term Moat (High Impact for specific segments, higher risk)

7.  **Interview Prep Mode (Stage 6 - New):** A strong differentiator for QFP and CTN users, extending the platform's value beyond application. However, as TEO notes, it's high cost. **Action:** Delay until V2 core is stable. Conduct targeted user research to validate demand and willingness to pay (RPD). Implement with a Haiku-first architecture as per TEO.
8.  **Chrome Extension (New):** Primarily benefits EDA by reducing friction in the application process. Its unique value (RPD) must go beyond auto-pasting. **Action:** Focus on auto-extracting JD *and* pre-populating user's resume from Supabase. Delay until V2 core is stable and competitive analysis confirms a strong moat.

### Deprioritize / Re-evaluate:

*   **3 LaTeX Templates (New):** RPD correctly points to diminishing returns. Focus on **quality and versatility** of 1-2 excellent templates that cater to broad professional styles, rather than a fixed number. QFP cares about the *quality* of the template, not just the quantity. **Action:** Refine template strategy to offer 1-2 highly customizable, professional templates.

---

## 4. Critical User Research Gaps (Archetype-Specific)

To validate and refine these insights, the following research is crucial:

1.  **EDA Conversion Triggers:**
    *   "At what point does the rate limit (3 free tailors) become a blocker for you?"
    *   "What specific feature or benefit would make you upgrade from the free tier immediately?"
    *   "How much time do you *expect* to save per application using ResumeAI?"
2.  **QFP Trust & Control:**
    *   "How do you currently verify the accuracy and quality of AI-generated content in your resume?"
    *   "What level of AI confidence score (e.g., 70%, 90%) would make you accept a bullet without review?"
    *   "Describe your ideal process for selecting and customizing a resume template."
3.  **Interview Prep Demand (for both):**
    *   "If ResumeAI could help you prepare for interviews based on your tailored resume, what specific features would you find most valuable?" (e.g., mock questions, AI feedback on answers, salary negotiation tips).
    *   "Would you pay an additional fee for an AI interview preparation module?" If so, how much?
4.  **Chrome Extension Value:**
    *   "When applying for jobs, what are the most frustrating manual steps you take?"
    *   "If a Chrome extension could automatically tailor your resume for a job you're viewing on LinkedIn, how much faster would that make your process?"
    *   "What concerns, if any, would you have about installing a Chrome extension that accesses job descriptions?"

By addressing these questions, ResumeAI v2 can be meticulously designed to meet the diverse needs of its primary user archetypes, driving both engagement and monetization.

## Secondary & Edge User Analyst (stage-2-user-intelligence)

# Secondary & Edge User Analysis: ResumeAI v2

## 1. Secondary User Segments (Underserved)

### Career Changers / Non-Linear Backgrounds
**Profile:** Users with 10+ year gaps, military→civilian transitions, freelance portfolios, or academic→industry pivots.

**Current V1 Failures:**
- Stage 1 parsing chokes on non-traditional formats (project portfolios, volunteer work, skill-based resumes)
- Stage 3 keyword matching penalizes transferable skills (e.g., "team leadership" in military context doesn't map to "agile project management")
- ATS scoring biased toward linear career progressions

**V2 Opportunities:**
1. **Pre-Stage 0: Resume Type Detection** - Identify non-traditional formats, route to specialized prompts
2. **Transferable Skills Translator** - Dedicated Haiku pass to map military/academic/freelance terminology to industry equivalents before Stage 2
3. **Gap Explanation Assistant** - Optional field for context (caregiving, education) that Stage 3 weaves into bullets naturally

**Validation:** Interview 10 career changers who abandoned V1. Hypothesis: 70%+ cite "AI didn't understand my background."

---

### International Users / Non-Native English Speakers
**Profile:** Users with English as 2nd language, applying to US/UK roles with localized resume conventions.

**Current V1 Failures:**
- Stage 3 rewrites assume US resume norms (bullets, not paragraphs; quantified results)
- No handling of British vs American spelling/terminology
- LaTeX templates likely US-centric (date formats, phone number patterns)

**V2 Opportunities:**
1. **Localization Toggle** - Pre-flow selector: US/UK/Canada/Australia (affects Stage 3 prompts + LaTeX formatting)
2. **Grammar Confidence Scoring** - Flag bullets with awkward phrasing for mandatory user review (reduce "AI made me sound worse" complaints)
3. **Cultural Norm Hints** - Tooltip system explaining US expectations ("Include GPA only if >3.5")

**Token Impact:** +2K tokens for localization pass, but captures 30% of global market.

---

### Entry-Level / Students (Zero Experience)
**Profile:** New grads with coursework, internships, and club leadership as primary content.

**Current V1 Failures:**
- `strength_score` penalizes lack of quantified professional results
- Stage 2 keyword extraction assumes mid-level role requirements (5+ years experience language)
- Cover letter Stage 5 struggles with "why hire me with no experience" framing

**V2 Opportunities:**
1. **Education-First Parsing** - Promote coursework projects and academic achievements in Stage 1 JSON structure
2. **Junior Role Keyword Weighting** - Adjust Stage 2 to prioritize "willingness to learn," "foundational skills" over "proven track record"
3. **Entry-Level Cover Letter Template** - Separate Sonnet prompt emphasizing potential over experience

**Monetization Angle:** Partner with university career centers (B2B2C) - free for .edu emails, upsell to alumni.

---

## 2. Edge Cases Requiring Hardening

### Edge Case: Highly Technical/Specialized Roles
**Scenario:** Data scientists, researchers, engineers with niche skills (e.g., "CUDA optimization," "GxP compliance").

**Failure Mode:** Stage 2 JD analysis misses domain-specific jargon; Stage 3 rewrites dilute technical precision ("improved algorithm performance" → generic "enhanced system efficiency").

**Solution:**
- **Jargon Preservation List:** User can flag 5-10 must-keep terms that bypass Stage 3 rewriting
- **Technical Depth Toggle:** Haiku pre-scores JD complexity (1-10); high scores trigger Sonnet for Stage 2 (better context understanding)

**Test:** Run 20 ML Engineer JDs through V1; measure how many key terms (TensorFlow, PyTorch, MLOps) survive Stage 3.

---

### Edge Case: Executive/C-Suite Resumes
**Scenario:** 2-page resumes with board positions, P&L responsibility, strategic initiatives (not bullet-point friendly).

**Failure Mode:** 
- Stage 1 truncates content to fit JSON schema
- Stage 3 over-optimizes for ATS at expense of executive voice (sounds junior)
- LaTeX templates too dense for senior positioning

**Solution:**
- **VIP Mode:** Bypass ATS scoring, focus Stage 3 on "leadership narrative" prompt
- **Two-Page Template:** Add executive-specific LaTeX layout (summary section, board roles sidebar)
- **Manual Override:** Let users lock entire sections from AI editing

**Monetization:** Premium-only feature ($50/tailor for exec resumes).

---

### Edge Case: Bulk Tailoring (Agency/Recruiter Use)
**Scenario:** Career coaches tailoring 50+ resumes/week; recruiters prepping candidate pools.

**Failure Mode:**
- Rate limits (10/min) block legitimate use
- No batch upload (1 resume + 1 JD at a time)
- Session TTL loses progress on large queues

**Solution:**
- **B2B Tier:** $99/mo for 500 tailors, API access, batch CSV upload (resume URLs + JD URLs)
- **White-Label Option:** Rebrandable UI for agencies
- **Persistent Projects:** Supabase storage for "resume library" (bypass Redis TTL)

**Risk:** Cannibalization of consumer tier. Mitigate with $500/mo minimum for B2B.

---

## 3. Accessibility & Inclusion Gaps

### Screen Reader Compatibility
**Issue:** Diff review UI (accept/reject/edit per bullet) likely inaccessible; ATS keyword chips not ARIA-labeled.

**Fix:** WCAG 2.1 AA audit before V2 launch. Keyboard navigation for all actions.

---

### Low-Literacy Users
**Issue:** Stage 4 hallucination validation shows technical errors ("Fabricated metric: 40% increase") - confusing for non-expert users.

**Fix:** Plain-language explanations: "We couldn't verify this number from your original resume."

---

## 4. V2 Prioritization for Secondary Users

**Must-Have (Blocks 20%+ of TAM):**
1. Career changer transferable skills translator
2. Entry-level education-first parsing
3. Technical jargon preservation

**Should-Have (Differentiation):**
4. Localization toggle (UK/US)
5. Executive VIP mode

**Could-Have (Future):**
6. B2B bulk tailoring API

**Validation Sprint:** 2-week beta with 50 users (25 career changers, 25 international). Success = 60%+ report "AI understood my unique background" (vs. 20% baseline from V1 feedback mining).

## Demand-Side Research Theorist (stage-2-user-intelligence)

As the Demand-Side Research Theorist, my analysis for ResumeAI v2 centers on understanding the deep-seated motivations, anxieties, and workflow friction points of job seekers. The ultimate "job to be done" is not merely to create a resume, but to *secure an interview and a job offer*. V2 must therefore elevate ResumeAI from a utility tool to a trusted career acceleration partner.

## Core Demand-Side Hypothesis for V2

ResumeAI v2's primary demand-side objective should be to evolve from a resume *tailoring tool* to a trusted, intelligent *career acceleration partner

## Market Landscape & Competitive Intelligence Analyst (stage-3-business-market)

# Market Landscape & Competitive Intelligence Analysis: ResumeAI v2

## 1. Market Overview & TAM Opportunity

The AI resume builder market is projected to grow from $200M in 2025 to $1.2B by 2030 (CAGR 43%), driven by ATS optimization demands and job seeker automation needs.[1] ResumeAI v2 targets the tailoring sub-segment (60% of market revenue), where tools like Jobscan and Teal dominate with 70% share via freemium models.[1] V1's multi-stage Claude pipeline (Haiku parsing + Sonnet rewriting/validation) positions it strongly against single-model competitors, but lacks ecosystem features (job tracking, Chrome extensions) that retain 40% more users.[1][2]

**Key Gap for ResumeAI:** No integrated job tracker or outreach—Teal/Enhancv users spend 2x longer engaged due to these.[1][2]

## 2. Competitor Teardown (Pricing, Features, Moats)

Analyzed 5 direct competitors via 2026 pricing pages and feature matrices. ResumeAI V1 beats on hallucination validation (unique Stage 4) but trails in free tier generosity and extensions.[1][2]

| Competitor | Pricing Tiers | Core Tailoring Features | Strengths (Moat) | Weaknesses (ResumeAI Opportunity) |
|------------|---------------|--------------------------|------------------|-----------------------------------|
| **Teal** [1] | Free (unlimited resumes/basic AI); Teal+ $29/mo (unlimited AI) | JD keyword extraction, bullet rewriting, match scores; Chrome extension for job bookmarking/tracking | All-in-one tracker (jobs/contacts); forever-free core hooks volume users | Limited AI generations (free); no explicit hallucination checks—users report generic rewrites |
| **Jobscan** [1] | $49.95/mo (5 free scans/mo); Enterprise custom | 20+ ATS criteria scans (Taleo/Greenhouse sim), real-time keyword gaps, side-by-side diffs | Data-driven ATS reverse-engineering (proven callback lifts) | No rewriting (analysis-only); high price alienates EDAs—ResumeAI's Sonnet rewriting + validation wins at lower cost |
| **Resume Worded** [1] | Free basic; $49/mo premium (LinkedIn opt.) | 30+ point analysis (verbs/impact), targeted JD rewrites, LinkedIn sync | Deep feedback (hiring mgr.-validated); authentic voice preservation | No Chrome ext./tracker; paywall for rewrites—ResumeAI's per-bullet accept/reject + scores superior for QFPs |
| **Enhancv** [2] | Free trial; Pro $24.99/mo (unlimited tailoring) | 30-sec JD tailoring (summary/bullets/keywords), inline AI rewriter, cover letters, job tracker | One-click tailoring + tracker; entry/exec modes; unlimited downloads | US-centric (no localization); AI suggestions often "fluffy"—ResumeAI Stage 4 validation differentiates on accuracy |
| **PitchMeAI** [1] | $22/mo (3 free credits); trial | Chrome ext. for JD/resume adapt + hiring mgr. email finder/outreach | Outreach moat (90% email verification, auto-emails)—bypasses ATS | Narrow focus (ext.-only); higher cost—ResumeAI can match ext. value cheaper via Supabase resume preload |

**Pricing Benchmark:** Average entry paid tier $35/mo (Teal lowest at $29, Jobscan highest $50). ResumeAI's proposed $9.99/mo or $2.99/tailor undercuts all; align free tier to Teal (3-5 tailors/mo) for 3x conversion per RPD.[1]

**Feature Parity Gaps:**
- **Chrome Extensions:** 80% competitors have (Teal/PitchMeAI/Jobscan)—auto-JD extract + resume preload critical; ResumeAI's Manifest V3 plan matches but must add Supabase sync for moat.[1]
- **Job Trackers:** Teal/Enhancv lead (statuses/notes/analytics)—add to V2 for EDA retention (40% uplift).[1][2]
- **Templates:** Enhancv/Rezi offer 20+ ATS-safe; ResumeAI's 3 LaTeX planned is low—expand to 5 (corporate/tech/exec) but prioritize preview (RPD).[2]
- **Unique ResumeAI Edges:** Stage 4 validation absent in all; SSE streaming + per-bullet diffs beat Enhancv's "one-click"; LaTeX PDF > competitors' basic exports.

## 3. V2 Feature Recommendations & Prioritization

Prioritize based on competitor gaps, archetype needs (EDA speed, QFP quality), and token economics (TEO). Roadmap: Tier 1 (Q1 ship, <4 weeks), Tier 2 (Q2), Tier 3 (Q3+ post-research).

### Tier 1: Close Retention Gaps (Beat Teal/Enhancv Free Tiers)
1. **Stripe Freemium (3 free tailors/mo, $9.99/mo unlimited):** Matches Teal's hook but gates at lower price; add post-download upsell ("Unlimited like Teal+ for less"). Impact: 3x conversion.[1]
2. **Template Preview + Gallery (5 LaTeX: corp/tech/exec/entry/creative):** Prevents lock-in; Enhancv's auto-format wins here—integrate Stage 0 selector.[2]
3. **Batch Actions + AI Confidence Scores:** Reduces fatigue (vs Jobscan diffs); surface per-bullet % (Sonnet-derived) for QFP trust.[1]
4. **Cover Letter Discoverability + LaTeX PDF:** Modal post-download (50% opt-in target); beats Resume Worded's paywalled version.[1][2]

### Tier 2: Match Growth Features (Parity with PitchMeAI/Teal)
5. **Chrome Extension (Manifest V3):** Auto-JD extract (client-side DOM) + Supabase resume preload/tailor button. Unique: 1-click Stage 1-4 run. Low token risk via TEO mitigations.[1]
6. **Job Tracker Integration:** Basic (statuses/notes per tailored resume/JD); import from Sheets like Enhancv. EDA moat—track via Supabase.[2]

### Tier 3: Differentiation (Post-Validation per RPD)
7. **Interview Prep (Stage 6, Premium-only):** Haiku questions + Sonnet eval; validate demand vs competitors (none have). High token risk—gate at $4.99 add-on.[1]
8. **Secondary User Hardening:** Localization toggle (US/UK via prompts), transferable skills mapper (Haiku pass). Targets 20% TAM gaps (career changers/int'l).[2]

**Deprioritize:** Bulk B2B API (low consumer fit); excess templates (diminishing ROI post-5).[1]

## 4. Monetization & Positioning Strategy

- **Freemium Sweet Spot:** 3 tailors/mo free (Teal parity, $0.17 COGS via TEO caching); Pro $9.99/mo (50 tailors, cover letters); Premium $19.99 (unlimited + interview). Undercuts Jobscan/Resume Worded by 50-80%.[1]
- **Positioning:** "Claude-powered accuracy (no hallucinations) at Teal speeds, half the price." Hero metrics: `match_percent` + Stage 4 validation % vs Jobscan scores.
- **Win EDA:** Chrome ext. + tracker (speed/volume).
- **Win QFP:** Confidence scores + exec templates (trust/quality).
- **Secondary:** Localization/skills mapper steals Enhancv int'l share.[2]

## 5. Critical Intelligence Gaps & Next Steps (1-Week Sprint)

1. **Quantitative:** Scrape Teal/Jobscan session data (public analytics via SimilarWeb)—benchmark abandonment rates.[UNVERIFIED - needs manual validation]
2. **Qualitative:** Mystery shop 3 competitors (tailor same resume/JD); score on hallucination/quality vs ResumeAI V1.
3. **Funding/Market:** Search Crunchbase for Teal/Jobscan raises (Teal: $6.5M Series A 2024)—track acquisition risks.[UNVERIFIED - needs manual validation]
4. **A/B Test:** Extension prototype vs no-ext (measure EDA repeat rate).

**Success KPIs:** V2 acquisition cost < $5 (vs Teal $8); LTV > $60 (4mo retention at 20% churn). Grounds PRD in competitive reality for 2x market share capture.

---

### Sources
[1] https://pitchmeai.com/blog/best-ai-resume-tailoring-tools
[2] https://enhancv.com/ai-resume-builder/
[3] https://www.firstresume.ai/post/the-ai-resume-builder-checklist-five-features-to-look-for-beyond-ats-optimization
[4] https://useresume.ai/comparison/useresume-vs-resume-io
[5] https://www.taskade.com/convert/resume
[6] https://www.wahresume.com/alternatives
[7] https://www.careerflow.ai/blog/5-ai-job-search-tools-youre-not-using


## Systems Architect (stage-4-technical)

# Systems Architect Research Analysis: ResumeAI v2

## Executive Summary

ResumeAI v2 presents a strategic evolution from a resume tailoring utility to a comprehensive career acceleration platform. From a Systems Architect perspective, the core challenge is to expand functionality (e.g., Interview Prep, Chrome Extension, Job Tracker) while maintaining the high quality and performance of the existing multi-stage AI pipeline, optimizing operational costs (especially LLM tokens), and ensuring scalability, security, and maintainability. The existing FastAPI/React/Supabase/Claude stack provides a solid foundation, but V2 features will require significant architectural enhancements, particularly in state management, asynchronous processing, and external integrations.

**Key Architectural Imperatives for V2:**
1.  **Cost-Optimized AI Pipeline:** Implement robust caching and intelligent LLM invocation strategies to control token spend.
2.  **Scalable Asynchronous Processing:** Enhance the existing async capabilities to handle new, potentially long-running AI tasks.
3.  **Secure & Persistent State Management:** Move beyond ephemeral Redis sessions for critical user data and new conversational AI features.
4.  **Modular & Extensible Integrations:** Design for seamless integration with new external services (Stripe, Chrome Extension, LaTeX templates).
5.  **Performance & Reliability:** Ensure new features do not degrade the core tailoring experience, especially under load.

## Architectural Principles for V2

*   **Cost-Conscious Design:** Prioritize token and compute optimization in all AI-related features.
*   **Event-Driven Architecture:** Leverage message queues for decoupled, fault-tolerant processing of long-running tasks (e.g., cover letters, interview prep).
*   **Secure by Design:** Implement robust authentication, authorization, and data encryption for all new components, especially the Chrome extension and persistent user data.
*   **Observability First:** Integrate comprehensive logging, monitoring, and tracing across the entire system, especially for AI pipeline stages and new integrations.
*   **Progressive Enhancement:** Design features to provide value incrementally, allowing for phased rollouts and A/B testing.

---

## Key V2 Feature Architectural Implications & Recommendations

### 1. Core AI Pipeline Optimization (Token Economics & Performance)

**Challenge:** Mitigating LLM costs and improving throughput as identified by TEO.
**Recommendations:**
*   **Prompt Caching (Stage 1 & 2):**
    *   **Implementation:** Introduce a dedicated caching layer in FastAPI for Claude API calls. Use a content-based hash (e.g., SHA256 of the resume text for Stage 1, JD text for Stage 2) as the cache key.
    *   **Storage:** Leverage Upstash Redis (already in stack) with a longer TTL for parsed resumes (e.g., 24 hours) and JD analyses (e.g., 7 days) if the input doesn't change.
    *   **Impact:** Significant token reduction for power users and repeat job applications.
*   **Differential Rewriting (Stage 3):**
    *   **Implementation:** Before invoking Sonnet for rewriting, add a pre-processing step (e.g., a small Haiku call or a heuristic Python function) to score each bullet's relevance/match against the JD. Only send bullets below a defined threshold (e.g., <70% match) to Sonnet for rewriting.
    *   **Data Structure:** The Stage 1 JSON output needs to include original bullet points and potentially a unique ID for each, allowing for selective updates.
    *   **Impact:** Substantial Stage 3 token savings (TEO estimates 30-50%) with minimal quality trade-off for already strong bullets.
*   **Batch Validation (Stage 4):**
    *   **Implementation:** Consolidate multiple rewritten bullets into a single, structured JSON input for Sonnet's validation call. This reduces prompt overhead and API call frequency.
    *   **Impact:** 25% Stage 4 token savings. Requires careful prompt engineering to ensure Sonnet can validate multiple bullets simultaneously without losing context.

### 2. Monetization & User Management (Stripe Freemium)

**Challenge:** Integrating Stripe for subscriptions and enforcing freemium tiers.
**Recommendations:**
*   **Stripe Integration:**
    *   **Backend:** Implement a secure webhook endpoint in FastAPI to listen for Stripe events (ee.g., `checkout.session.completed`, `customer.subscription.updated`, `invoice.payment_failed`).
    *   **Supabase:** Extend `auth.users` table or create a new `user_subscriptions` table to store Stripe customer IDs, subscription IDs, and current plan status.
    *   **Rate Limiting:** Update `slowapi` rate limiting logic to check user's subscription status from Supabase. Free tier users get 3 tailors/month, paid users get higher/unlimited limits.
*   **Freemium Gating:**
    *   **Enforcement:** All AI pipeline stages should check the user's remaining "credits" or subscription status before proceeding.
    *   **User Experience:** Clear messaging on the frontend when hitting limits, directing users to the upgrade path.

### 3. Document Generation & Templating (LaTeX Cover Letter, Template Gallery, Preview)

**Challenge:** Efficiently generating high-quality, customizable documents and previews.
**Recommendations:**
*   **LaTeX Cover Letter PDF (Stage 5):**
    *   **Asynchronous Processing:** As it's an "async Sonnet" task, ensure robust job queuing (e.g., Celery/RQ with Redis backend) for Stage 5. The FastAPI endpoint should submit the job and return a job ID.
    *   **Progress Streaming:** Use SSE to stream progress updates (e.g., "AI generating content," "Compiling PDF") back to the user.
    *   **Error Handling:** Implement comprehensive error handling for LaTeX compilation failures (e.g., invalid JSON input, template errors), providing user-friendly feedback.
*   **Resume Template Gallery (3+ LaTeX Templates):**
    *   **Storage:** Store LaTeX template files securely (e.g., S3-compatible storage or within application bundle).
    *   **Dynamic Injection:** The backend (Python `tectonic` / `reportlab` / `python-docx`) will need a templating engine capable of injecting user data (from Stage 1 JSON) into the chosen LaTeX/DOCX template.
*   **Template Preview Before Tailoring:**
    *   **Lightweight Preview:** Full LaTeX compilation for every preview is too slow/costly. Options:
        1.  **Static Images:** Pre-generate screenshots of templates with placeholder data.
        2.  **HTML/CSS Approximation:** Render a simplified, non-PDF preview using HTML/CSS that closely mimics the LaTeX template's layout. This requires maintaining two rendering paths but offers immediate feedback.
        3.  **PDF Thumbnail Service:** A dedicated microservice that quickly generates a low-res PDF thumbnail from a LaTeX template and sample data.

### 4. New AI Modes (Interview Prep Mode)

**Challenge:** Managing conversational state and high token consumption for a multi-turn AI interaction.
**Recommendations:**
*   **Dedicated Conversational Service:** Implement a separate FastAPI service or module for Interview Prep. This service will manage conversational state, potentially using a state machine pattern.
*   **Persistent Session State:** Move beyond Redis's 10min TTL for interview prep. Store conversational history and context in Supabase (e.g., `interview_sessions` table) for longer-term persistence. This is critical for QFP users who might spend more time.
*   **Tiered LLM Usage (TEO):**
    *   **Question Generation:** Use Haiku for generating interview questions from the tailored resume and JD.
    *   **Answer Evaluation:** Reserve Sonnet for evaluating user's answers, ensuring higher quality and nuance.
    *   **Context Window Management:** Implement strict token limits by only passing the last `N` Q&A pairs to the LLM to control costs.
*   **Rate Limiting:** Enforce strict rate limits on interview prep sessions, especially for free tiers, as token consumption is high. Gate behind premium tiers.

### 5. Chrome Extension (Manifest V3)

**Challenge:** Securely integrating a browser extension with the backend, handling user authentication, and JD extraction.
**Recommendations:**
*   **Authentication:**
    *   **Supabase Integration:** The extension should authenticate users directly with Supabase via a secure OAuth flow or by exchanging a short-lived token generated by the FastAPI backend after a successful Supabase login. Avoid storing long-lived credentials in the extension.
    *   **Session Management:** Maintain a secure session token in the extension's local storage (with appropriate security measures) or leverage Supabase's session management.
*   **JD Extraction:**
    *   **Client-Side DOM Parsing:** As suggested by TEO, implement JD extraction logic entirely client-side within the extension (JavaScript DOM parsing) to reduce server load and token costs. Only send cleaned text to FastAPI.
*   **API Endpoints:**
    *   Create dedicated, securely authenticated FastAPI endpoints for the extension to submit JDs and retrieve tailored resumes.
    *   **CORS:** Ensure FastAPI has appropriate CORS headers configured to allow requests from the Chrome extension's origin.
*   **Supabase Resume Preload:**
    *   The extension should be able to fetch the user's stored resume(s) from Supabase via a FastAPI endpoint, allowing for 1-click tailoring. This requires robust authorization to ensure users only access their own data.

### 6. Job Tracker Integration

**Challenge:** Storing and managing job application data within the platform.
**Recommendations:**
*   **Supabase Schema:** Create new tables in Supabase:
    *   `jobs`: Stores JD, company name, URL, etc.
    *   `applications`: Links `jobs` to `users` and `tailored_resumes`, tracking status (Applied, Interviewing, Rejected), notes, and dates.
*   **FastAPI Endpoints:** Develop CRUD (Create, Read, Update, Delete) endpoints for managing jobs and applications.
*   **Data Model:** Link tailored resume versions to specific job applications, allowing users to revisit the exact resume used for an application.

### 7. Secondary User Hardening (Dynamic AI & Data Handling)

**Challenge:** Adapting the AI pipeline for diverse user backgrounds (career changers, international, execs, entry-level) and specialized content.
**Recommendations:**
*   **Dynamic Prompt Engineering:**
    *   **Conditional Logic:** Implement logic in FastAPI to dynamically select and construct Claude prompts based on user-selected "resume type" (e.g., "Career Changer," "Entry-Level," "Executive") or detected resume characteristics.
    *   **Localization Toggle:** Add a `locale` parameter to the user profile and pass it to Claude prompts for linguistic (spelling, terminology) and cultural (formatting) adjustments in Stage 3 and 5.
*   **Jargon Preservation/VIP Mode:**
    *   **User Input Field:** Allow users to input a list of "must-keep" technical terms or phrases.
    *   **Prompt Directives:** Incorporate these terms into Claude's Stage 3 prompt as explicit instructions for preservation.
    *   **JSON Flagging:** Add a flag to the Stage 1 JSON output for bullets/sections that are "locked" from AI modification for Executive VIP mode.

---

## Technical Debt & Risk Mitigation

*   **Redis 10min TTL:** While Upstash Redis is good for session caching, it's insufficient for persistent user data like tailored resumes (

## AI/ML Systems Specialist (stage-4-technical)

# AI/ML Systems Specialist Analysis: ResumeAI v2

## 1. AI Pipeline Architecture Review & Optimization

### Current 4-Stage Pipeline Assessment

**Stage 1 (Haiku Parse):** Solid choice for structured extraction, but brittle to edge cases.
- **Risk:** Non-standard formats (tables, graphics, multi-column) likely cause JSON schema failures
- **Improvement:** Add pre-processing layer with vision model (Claude 3 Haiku with image input) for PDF layouts before text extraction—reduces parse failures by 60-80%
- **Fallback:** Implement graceful degradation—if JSON validation fails, return partial schema + flag missing sections for user review

**Stage 2 (Haiku JD Analysis):** Appropriate model for keyword extraction.
- **Improvement:** Add semantic clustering (embed keywords via Voyage AI, $0.0001/1K tokens) to group synonyms ("managed" + "led" + "oversaw")—reduces Stage 3 rewrites by 20%
- **Cache Optimization:** Hash JD text; cache analysis for 24hrs (not 5min)—same jobs reposted across platforms

**Stage 3 (Sonnet Rewrite):** Highest cost, highest quality risk.
- **Critical Gap:** No confidence calibration—Sonnet outputs lack uncertainty quantification
- **Solution:** Add logprobs analysis (via API) to derive per-bullet confidence scores (0-100%)—surface to users as RPD recommends
- **Hallucination Prevention:** Implement constrained generation—pass original bullet as hard constraint in prompt ("ONLY use facts from: [original text]")

**Stage 4 (Sonnet Validation):** Unique differentiator but underutilized.
- **Enhancement:** Output structured validation report (JSON: `{bullet_id, hallucination_risk: low/med/high, evidence: [original_facts]}`)—enables batch rejection of high-risk bullets
- **A/B Test:** Show validation details to 50% users; measure trust via acceptance rate

### Token Efficiency Deep Dive

**Prompt Compression Opportunities:**
1. **System Prompt Caching:** Cache Stage 3/4 system instructions (2K tokens, 90% cost reduction on cached portion)—update only on prompt version changes
2. **Few-Shot Pruning:** Current prompts likely use 3-5 examples; A/B test 1-shot vs 3-shot—may reduce tokens 30% with <5% quality loss
3. **Differential Processing (TEO's proposal):** Add pre-filter using sentence embeddings (Voyage AI)—only rewrite bullets with <0.7 cosine similarity to JD—saves 40% Stage 3 tokens

**Projected V2 Token Budget (per job):**
- Stage 1: 1.5K (vision pre-process) + 2K (parse) = 3.5K
- Stage 2: 2K (cached JD hash hit rate 40%) = 1.2K avg
- Stage 3: 5K (differential rewrite, 40% reduction) = 3K avg  
- Stage 4: 4K (batch validation) = 4K
- **Total: ~11.7K tokens/job (51% reduction), ~$0.028/job**

## 2. Model Selection & Upgrade Path

### Haiku → Haiku 3.5 Migration
**Trigger:** When parsing accuracy drops <92% (establish baseline via golden dataset)
**Benefit:** 3.5 has better structured output adherence—reduces JSON validation failures
**Risk:** Prompt drift—regression test 50 resumes before rollout

### Sonnet 3.5 → Sonnet 4 (When Available)
**Watch For:** Extended context (200K+ tokens)—enables whole-resume + JD + all examples in single call (eliminates Stage 2)
**Cost:** Likely 2x current; only upgrade if quality gains >30% (measure via human eval)

### Embedding Models for Semantic Features
**Current Gap:** Keyword matching is lexical (misses "managed team" ≈ "led group")
**Add:** Voyage AI embeddings ($0.0001/1K tokens) for:
1. JD-bullet similarity scoring (replace simple keyword overlap)
2. Duplicate bullet detection (user's resume may have redundant content)
3. Transferable skills mapping (Secondary User Analyst's career changer use case)

## 3. Quality Assurance & Monitoring

### Hallucination Detection Beyond Stage 4
**Multi-Layer Validation:**
1. **Fact Extraction:** Use Haiku to extract atomic facts from original bullets → store as ground truth
2. **Cross-Reference:** Stage 4 checks rewritten bullets against fact database
3. **Quantification Validation:** Regex + LLM check for numbers—if rewritten bullet adds metrics not in original, flag as high-risk
4. **User Feedback Loop:** Track accepted vs rejected bullets by hallucination risk score—retrain Stage 4 prompt monthly

### Real-Time Quality Metrics (Add to V2)
**Per-Session Tracking:**
- `parse_confidence`: % of resume fields successfully extracted
- `rewrite_divergence`: Semantic similarity between original/rewritten (target: >0.85)
- `validation_flags`: Count of hallucination warnings per job
- `user_override_rate`: % bullets edited after AI suggestion

**Alerting:** If `validation_flags` >3 per job for 10+ consecutive sessions, trigger prompt review

### Regression Testing Framework
**Golden Dataset (Build for V2 Launch):**
- 100 resume+JD pairs across archetypes (EDA, QFP, career changers, technical roles)
- Human-labeled ground truth (expected keywords, acceptable rewrites)
- Run nightly via CI/CD—alert if `match_percent` drops >5% or `strength_score` drops >10%

## 4. V2 Feature AI/ML Recommendations

### Interview Prep Mode (Stage 6) - Architecture
**High Token Risk Mitigation:**
1. **Hybrid Approach:** 
   - Haiku generates 10 common questions from JD (2K tokens)
   - User records/types answers
   - Sonnet evaluates only top 3 answers user selects (5K tokens total)
2. **Caching:** Cache question generation per JD hash (reuse across users for same job)
3. **Async Processing:** Run evaluation in background; show results in 30-60s (not blocking)

**Quality Controls:**
- Compare user answer against resume facts (prevent hallucination in user's response)
- Provide structured feedback: `{strength: 1-5, missing_keywords: [], suggested_improvements: []}`

**Pricing Gate:** Premium-only ($4.99 add-on or included in $19.99 tier)—unit economics require 3+ uses/month to break even at $0.075/session

### Chrome Extension - AI Integration
**Client-Side Intelligence:**
1. **JD Extraction:** Use DOM parsing (no tokens)—send only cleaned text to backend
2. **Smart Pre-Fill:** Fetch user's last-used resume from Supabase (cached)—predict best template based on JD industry (simple classifier, <1K tokens)
3. **One-Click Tailor:** Trigger Stages 1-4 from extension—stream progress via SSE

**Rate Limiting:** 3 auto-tailors/hour (prevent abuse)—show "upgrade for unlimited" after limit

### Template Gallery - AI-Powered Matching
**Template Recommender (New Feature):**
- Embed JD + user's industry/role → cosine similarity to 5 template archetypes
- Show top 2 templates with reasoning: "Corporate template recommended—JD emphasizes traditional finance role"
- Costs <500 tokens via Voyage embeddings

## 5. Secondary User AI Hardening

### Career Changers - Transferable Skills Mapper
**Architecture:**
1. **Skills Taxonomy:** Build mapping (military ranks → corporate titles, academic terms → industry jargon) via one-time Sonnet pass (cache results)
2. **Stage 1.5 (New):** After parse, run Haiku pass to detect non-standard terms → replace with industry equivalents before Stage 2
3. **User Control:** Show mappings for approval ("Captain → Project Manager")—build trust

**Token Cost:** +2K per resume (one-time)—cache mappings per user

### International Users - Localization
**Prompt Engineering (No New Models):**
- Add locale parameter to Stage 3 system prompt: "Rewrite in British English with UK resume conventions (CV format, no GPA)"
- Store locale-specific rules in prompt cache (US: quantify results, UK: emphasize qualifications)

**Cost:** Negligible (prompt variation only)

## 6. Risk Mitigation & Failover

### Model Outage Handling
**Current Gap:** If Claude API fails, entire pipeline breaks
**V2 Resilience:**
1. **Graceful Degradation:** If Stage 3 fails, return Stage 2 analysis + original resume (user can manually edit)
2. **Model Fallback:** If Sonnet unavailable, use Haiku for Stage 3 (lower quality but functional)—notify user of degraded mode
3. **Retry Logic:** Exponential backoff (3 retries over 10s)—99.9% uptime with proper error handling

### Prompt Drift Monitoring
**Quarterly Audit:** Re-run golden dataset; if quality degrades, version-lock prompts or update few-shot examples
**User Reports:** Add "AI quality issue" button—flags for manual review + retraining data

## 7. Immediate V2 AI/ML Priorities

**Week 1-2 (Pre-Launch):**
1. Implement prompt caching (Stages 2-4)—51% cost reduction
2. Add logprobs-based confidence scores—A/B test with 50% users
3. Build golden dataset (100 pairs)—establish quality baseline

**Week 3-4 (Launch):**
4. Deploy vision-based PDF pre-processing—reduce parse failures
5. Add semantic similarity scoring (Voyage embeddings)—improve match accuracy
6. Implement real-time quality metrics dashboard—monitor for regressions

**Post-Launch (Continuous):**
7. Monthly prompt audits using golden dataset
8. Quarterly model upgrade evaluations (Haiku 3.5, Sonnet 4)

**Success Metrics:** 
- Parse accuracy >95% (from ~85% baseline)
- User acceptance rate >70% (from ~50% estimated)
- Hallucination flags <1 per job (from unknown baseline)
- Token cost <$0.03/job (from $0.058)

This AI/ML foundation ensures V2 scales quality and cost-efficiency while enabling advanced features like interview prep and international support.

## Data & Telemetry Strategist (stage-4-technical)

# Data & Telemetry Strategy: ResumeAI v2

## 1. Critical V1 Instrumentation Gaps

**Current State:** No mention of existing analytics infrastructure beyond Redis session store (10min TTL) and slowapi rate limiting. This is a **critical blind spot** for V2 prioritization.

### Immediate Instrumentation Requirements (Pre-V2 Launch)

**Stage-Level Funnel Tracking:**
```
Event Schema (Mixpanel/Amplitude):
- stage_1_started (resume_format, file_size_kb)
- stage_1_completed (parse_time_ms, json_fields_count)
- stage_1_failed (error_type, retry_attempted)
- stage_2_completed (jd_word_count, keywords_extracted_count)
- stage_3_completed (bullets_rewritten_count, avg_confidence_score)
- stage_4_completed (hallucinations_detected_count)
- bullet_action (action: accept|reject|edit, bullet_index, original_confidence)
- download_clicked (format: pdf|docx, match_percent, ats_score, strength_score)
- cover_letter_generated (time_from_download_sec)
```

**Why This Matters:** Without stage completion rates, V2 prioritization is guesswork. RPD hypothesizes Stage 3→4 abandonment—**we need baseline metrics** (target: <15% drop-off per stage).

---

## 2. V2 Feature Instrumentation Strategy

### Tier 1 Features: Validation-Critical Metrics

**AI Confidence Scores (A/B Test Design):**
- **Hypothesis:** Showing confidence scores reduces review time by 30% without decreasing download quality.
- **Metrics:**
  - `time_to_download` (control vs. variant)
  - `bullet_edit_rate` by confidence bucket (<70%, 70-85%, >85%)
  - `user_trust_score` (post-download survey: "How confident are you in this resume?")
- **Success Criteria:** Variant group has 25%+ faster time-to-download AND equal/higher trust scores.

**Template Preview (Stage 0 Addition):**
- **Events:** 
  - `template_previewed` (template_id, time_spent_sec)
  - `template_selected` (template_id, changed_after_stage_3: boolean)
  - `template_regret` (changed post-tailoring, from_template, to_template)
- **Key Metric:** `template_regret_rate` (target: <5%). If >10%, preview UX insufficient.

**Batch Actions:**
- **Events:** `batch_action_used` (action_type: accept_all|accept_strong|reject_weak, bullets_affected_count)
- **Adoption Target:** 40% of users with 10+ bullets use batch actions within first session.
- **Quality Check:** Compare `match_percent` of batch users vs. manual reviewers (must be within 3 points).

### Tier 2 Features: Growth & Retention Signals

**Chrome Extension:**
- **Critical Metric:** `extension_to_tailor_conversion` (clicked ext. button → completed Stage 4)
  - **Benchmark:** Should exceed 60% (vs. ~40% for manual upload flow per typical SaaS).
- **Events:** `extension_jd_extracted` (source_domain, extraction_time_ms, success: boolean)
- **Churn Risk:** Track `extension_uninstall_event` (via Chrome API) + survey prompt.

**Job Tracker (If Prioritized):**
- **Engagement Metric:** `jobs_tracked_per_user` (target: 8+ for 30-day retention >70%)
- **Events:** `job_added_to_tracker`, `job_status_changed`, `resume_version_linked_to_job`
- **Competitive Parity:** Teal users average 12 tracked jobs—aim for 10+ within 2 weeks of signup.

### Tier 3 Features: Monetization & Validation

**Interview Prep Mode:**
- **Pre-Launch Research Metric:** Survey existing users: "Would you pay $4.99 for AI interview prep based on your resume?" (need 40%+ "definitely yes" to justify build).
- **Token Economics Tracking:** `interview_session_token_count`, `interview_session_cost_usd` (alert if >$0.10/session).
- **Engagement:** `questions_answered_per_session` (target: 8+ for perceived value).

---

## 3. Monetization & Conversion Telemetry

### Freemium Gate Optimization

**Current Blind Spot:** No mention of how rate limits are tracked/communicated to users.

**Required Events:**
```
- rate_limit_hit (limit_type: tailor|cover_letter, remaining_free_uses)
- paywall_shown (trigger: rate_limit|feature_gate, user_tailors_count)
- upgrade_clicked (from_screen: paywall_modal|pricing_page|download_bar)
- checkout_started (plan: pro|premium, monthly|annual)
- checkout_completed (plan, revenue_usd, discount_applied)
```

**Key Conversion Metrics:**
- **Free→Paid Conversion Rate:** Baseline target 3-5% (per RPD's 3x goal = 9-15%).
- **Time-to-Conversion:** Median days from signup to first payment (optimize for <7 days).
- **Conversion Trigger Analysis:** % conversions by trigger (rate limit vs. feature gate vs. organic pricing page visit).

**A/B Test Paywall Messaging:**
- Variant A: "You've used 3 free tailors. Upgrade for unlimited!" (scarcity)
- Variant B: "Unlock AI confidence scores + templates for $9.99/mo" (feature value)
- **Hypothesis:** Variant B converts QFPs 2x better; Variant A converts EDAs 1.5x better.

---

## 4. AI Quality & Cost Monitoring

### Hallucination Detection Efficacy (Stage 4 Validation)

**Current Gap:** Stage 4 exists, but no metrics on false positive/negative rates.

**Quality Assurance Events:**
```
- hallucination_detected (bullet_index, fabrication_type: metric|role|company)
- user_overrode_hallucination_flag (kept_flagged_bullet: boolean)
- golden_test_run (test_id, hallucinations_missed_count, false_positives_count)
```

**Regression Testing:** Run 50 "golden" resume+JD pairs weekly (per RPD). Alert if `hallucinations_missed_count` increases >10% week-over-week (indicates prompt drift).

### Token Cost Attribution (Per TEO Recommendations)

**Per-User Cost Tracking:**
```sql
-- Supabase analytics schema
CREATE TABLE token_usage (
  user_id UUID,
  session_id TEXT,
  stage INT,
  model TEXT, -- haiku|sonnet
  input_tokens INT,
  output_tokens INT,
  cost_usd DECIMAL(10,6),
  cached BOOLEAN,
  timestamp TIMESTAMPTZ
);
```

**Dashboards (Metabase/Grafana):**
- **Cost per Conversion:** `SUM(cost_usd) / COUNT(DISTINCT paid_users)` (target: <$2 CAC from AI costs).
- **Cache Hit Rate:** `COUNT(cached=true) / COUNT(*)` (target: 50%+ post-TEO optimizations).
- **High-Cost User Alerts:** Flag users with >$5 token spend/month (potential abuse or edge cases).

---

## 5. User Behavior Cohort Analysis

### Archetype Validation via Behavioral Clustering

**Hypothesis from PUAR:** EDAs accept 80%+ bullets quickly; QFPs edit 40%+ bullets.

**Clustering Dimensions:**
```python
# K-means input features
- avg_time_per_bullet_review (seconds)
- edit_rate (edits / total_bullets)
- batch_action_usage (boolean)
- cover_letter_generated (boolean)
- template_changes_count
- days_to_second_tailor
```

**Actionable Outputs:**
- **EDA Cluster:** Prioritize Chrome extension, batch actions in onboarding.
- **QFP Cluster:** Highlight confidence scores, template preview in first-run tour.
- **Churn Risk Cluster:** Users with 1 tailor + no return in 7 days → trigger email with free cover letter offer.

---

## 6. Competitive Benchmarking Telemetry

**Proxy Metrics (No Direct Competitor Access):**
- **Session Duration:** ResumeAI target 8-12 min (Teal ~15 min per SimilarWeb estimates). If <6 min, flow too fast (low engagement); if >15 min, friction exists.
- **Repeat Usage Rate:** % users with 2+ tailors within 30 days (target: 50%+, Teal ~60%).
- **NPS by Archetype:** Survey post-download: "How likely are you to recommend ResumeAI?" (target: EDA 40+, QFP 60+).

---

## 7. V2 Launch Readiness: Data Health Checklist

**Pre-Launch (Week -2):**
- [ ] All Tier 1 events firing in staging (validate with 20 test sessions)
- [ ] Supabase token_usage table populated
- [ ] A/B test framework configured (LaunchDarkly/GrowthBook)
- [ ] Baseline V1 metrics documented (stage completion, conversion rate)

**Post-Launch (Week +1):**
- [ ] Daily dashboard review: stage drop-offs, paywall conversion, token costs
- [ ] Anomaly detection alerts (e.g., Stage 1 parse failures >10%)

**Month +1:**
- [ ] Cohort analysis: EDA vs QFP behavior validation
- [ ] ROI calculation: V2 dev cost / (new MRR - token cost increase)

---

## 8. Immediate Next Steps (2-Week Sprint)

1. **Instrument V1 Core Flow:** Add 15 critical events (stage completions, bullet actions, downloads). Deploy to production, collect n=500+ sessions.
2. **Token Cost Baseline:** Backfill Redis session logs (if retained) to estimate current per-user costs. Establish TEO's $0.058/job baseline.
3. **Survey Existing Users:** Email 200 recent users (50 EDA, 50 QFP per PUAR segmentation proxy): 
   - "What feature would make you upgrade?"
   - "Rate AI quality 1-10"
   - "Would you pay for interview prep?"
4. **Competitor Session Recording:** Use Hotjar on Teal/Jobscan free tiers—identify UX patterns (e.g., how they surface paywalls).

**Success Criteria for V2 PRD:** Every prioritized feature has a **defined success metric** with baseline and target. No "build and hope."

## Cognitive Load & Behavioral Psychology Analyst (stage-5-ux)

# Cognitive Load & Behavioral Psychology Analyst: ResumeAI v2

## Executive Summary

ResumeAI v2's success hinges on transcending its functional utility to become a *trusted career acceleration partner*. This requires a meticulous focus on minimizing cognitive load, fostering psychological safety, and leveraging behavioral nudges to guide users toward their goals (securing interviews) and conversion. The multi-stage AI pipeline, while powerful, introduces inherent cognitive burdens related to trust, verification, and decision-making. V2 must strategically address "diff review fatigue," build transparent AI trust, and frame monetization to align with user motivations rather than creating friction.

## 1. Cognitive Load Hotspots & Friction Points

The current V1 and planned V2 features present several areas where users experience elevated mental effort, anxiety, or decision fatigue:

1.  **AI Trust & Verification Burden (Stage 3 & 4):**
    *   **Problem:** Users, especially Quality-Focused Professionals (QFPs), bear the cognitive burden of "trust but verify" for *every* AI-rewritten bullet. Despite Stage 4's hallucination validation, the user still expends mental energy assessing the AI's assessment. This is a form of **meta-cognitive load**. (RPD: "do users trust Stage 4?").
    *   **Impact:** Leads to slower review times, increased manual edits, and potential abandonment due to perceived lack of control or fear of AI errors.
    *   **Secondary Users:** This burden is amplified for Career Changers (fear of misrepresenting transferable skills) and International Users (concern about cultural/linguistic nuance).

2.  **Diff Review Fatigue (Stage 4):**
    *   **Problem:** Reviewing 15+ bullets with individual accept/reject/edit actions is highly repetitive and cognitively taxing. This leads to **decision fatigue**, where users become less discerning over time or simply "accept all" without proper review, potentially compromising quality. (RPD, PUAR: "cognitively taxing").
    *   **Impact:** Increased abandonment rates at Stage 4, lower perceived value of AI suggestions, and potential for user error (accepting poor suggestions).

3.  **Template Selection & Customization Anxiety (V2 Planned):**
    *   **Problem:** Introducing a template gallery, while valuable, can create the **"paradox of choice"**. Users, especially Entry-Level/Students, may struggle to choose the "best" template, fearing their choice might hinder their application. "Template lock-in" (RPD) creates regret.
    *   **Impact:** Delay in starting the tailoring process, frustration if the chosen template doesn't fit after tailoring, and increased support queries.

4.  **Freemium Gating & Loss Aversion (V2 Planned):**
    *   **Problem:** Hitting a rate limit (e.g., 3 free tailors/month) after investing time and effort triggers **loss aversion**. Users perceive losing access to a valuable, already-experienced service rather than gaining access to new features. The sudden stop creates negative emotional friction. (PUAR: EDA hits limits quickly).
    *   **Impact:** High abandonment at the paywall if the perceived value of paid features doesn't outweigh the "loss" of free access, or if the upgrade message is poorly framed.

5.  **New Feature Onboarding (Interview Prep, Chrome Extension):**
    *   **Problem:** Each new feature introduces a learning curve and requires users to update their mental model of ResumeAI. For the Interview Prep Mode, managing conversational state and understanding AI feedback adds **extrinsic cognitive load**.
    *   **Impact:** Low adoption of new features if their value isn't immediately clear or if the interaction is too complex.

## 2. Behavioral Psychology Opportunities & Nudges

ResumeAI v2 can leverage psychological principles to enhance user experience and drive desired outcomes:

1

## Content & Language Strategist (stage-5-ux)

# Content & Language Strategist Analysis: ResumeAI v2

## 1. Core Voice & Messaging Audit

**V1 Implicit Voice:** Technical, feature-focused ("4-stage pipeline," "ATS score," "hallucination validation"). This appeals to power users but alienates anxious job seekers.

**V2 Voice Pivot:** Shift from "AI tool" to "career confidence partner."
- **EDA Tone:** Urgent, efficiency-driven. "Tailor in 3 minutes. Apply to 10 jobs today."
- **QFP Tone:** Authoritative, precision-focused. "Every word vetted. Your expertise, amplified."
- **Universal:** Reduce jargon. Replace "Stage 3 rewriting" with "AI refines your bullets."

---

## 2. Critical Microcopy for V2 Features

### AI Confidence Scores (Tier 1)
**Problem:** Users won't trust a raw percentage without context.

**Microcopy Solutions:**
- **High confidence (>85%):** "✓ Strong match—this bullet aligns perfectly with the job."
- **Medium (70-85%):** "⚠ Review suggested—we improved keyword density, verify accuracy."
- **Low (<70%):** "✋ Manual review needed—significant changes made."

**A/B Test Variant:** Add explainability: "92% confident (found 'Python' + 'API design' in original resume)."

### Template Preview (Tier 1)
**Current Gap:** Users don't know *why* a template fits.

**Recommendation Labels:**
- "Corporate Classic—Best for finance, consulting, law"
- "Tech-Forward—Highlights projects + GitHub for engineers"
- "Executive Brief—Senior roles, board experience emphasis"

**Microcopy on Preview:** "This template emphasizes [leadership metrics/technical skills]. Switch anytime."

### Batch Actions (Tier 1)
**Risk:** "Accept all" sounds reckless to QFPs.

**Reframe Options:**
- ~~"Accept all"~~ → "Approve high-confidence bullets (8 found)"
- ~~"Reject weak"~~ → "Remove low-scoring suggestions (2 flagged)"
- Add: "Review manually (recommended for senior roles)"

### Freemium Paywall (Tier 1)
**EDA Messaging (Scarcity):**
- "You've tailored 3 resumes this month—unlock unlimited for $9.99/mo."
- CTA: "Keep applying" (not "Upgrade now"—reduces friction)

**QFP Messaging (Value):**
- "Get AI confidence scores + executive templates to stand out."
- CTA: "Unlock premium features"

**Post-Rate-Limit Modal:** "Great progress! You've applied to [X] jobs. Go unlimited to keep momentum."

---

## 3. Feature Discoverability Content

### Cover Letter (Stage 5)
**Current Issue:** "Optional" and "async" = invisible.

**Post-Download Modal (50% Opt-In Target):**
- **Headline:** "Complete your application in 2 minutes"
- **Body:** "Generate a matching cover letter using your tailored resume. Hiring managers read these first."
- **CTA:** "Create cover letter" (not "Generate"—less robotic)

**In-App Prompt (During Stage 3):** Tooltip: "💡 Tip: 67% of hirers prefer resumes with cover letters. Add yours after download."

### Chrome Extension (Tier 2)
**Value Prop on Landing Page:**
- "Tailor resumes instantly from LinkedIn, Indeed, or any job board—no copy/paste."
- **Trust Signal:** "Your data stays private. We only read job descriptions you choose."

**First-Run Onboarding (Extension):**
1. "Click the ResumeAI icon on any job posting."
2. "We'll extract the description and tailor your resume in 3 minutes."
3. "Download and apply—it's that fast."

### Interview Prep Mode (Tier 3)
**Demand Validation Survey (Per RPD):**
- Question: "After tailoring your resume, what's your biggest interview challenge?"
  - A) Anticipating questions
  - B) Articulating achievements confidently
  - C) Researching the company
  - D) Salary negotiation

**Feature Messaging (If Built):**
- "Practice answers to questions pulled from *your* tailored resume."
- "Get AI feedback on clarity, keywords, and confidence."
- **Pricing:** "Interview Prep add-on: $4.99 per job" (emphasize per-job value, not subscription fatigue)

---

## 4. Error & Edge Case Messaging

### Stage 1 Parse Failures (Secondary Users)
**Current:** Likely generic "Upload failed."

**Improved (Career Changers/Non-Traditional):**
- "We had trouble reading your resume format. Try a simpler layout (no tables/graphics) or upload a DOCX version."
- **Actionable CTA:** "Use our template to reformat" (link to blank LaTeX export)

### Hallucination Flags (Stage 4)
**Current Risk:** Technical language ("Fabricated metric: 40%") confuses users.

**Plain-Language Rewrite:**
- ~~"Hallucination detected"~~ → "⚠ We added details not in your original resume"
- **Explanation:** "This bullet mentions '40% increase'—we couldn't verify this number. Edit or remove it to stay accurate."

### Rate Limit Messaging (Freemium)
**Avoid:** "Rate limit exceeded" (sounds punitive).

**Reframe:**
- "You've used your 3 free tailors this month! Upgrade to keep applying or wait until [date]."
- **Urgency (EDA):** "Jobs expire fast—unlock unlimited tailoring now."

---

## 5. Localization & Inclusivity (Secondary Users)

### International Users (UK/Canada/Australia)
**Prompt-Level Fixes (Per AI/ML Specialist):**
- Add locale toggle in UI: "Resume style: 🇺🇸 US / 🇬🇧 UK / 🇨🇦 Canada"
- **Microcopy Differences:**
  - US: "Quantify your impact" → UK: "Evidence your contributions"
  - US: "GPA" → UK: "Degree classification (e.g., First Class Honours)"

**LaTeX Template Adjustments:**
- UK: Date format DD/MM/YYYY, "CV" header (not "Resume")
- Canada: Bilingual option (English/French headings)

### Entry-Level / Students
**Tone Shift:** Less corporate, more encouraging.
- Landing page: "No experience? No problem. Highlight your coursework, projects, and potential."
- **Stage 3 Prompt Modifier:** Emphasize "transferable skills from academics" (e.g., "Led team project" → "Demonstrated leadership in capstone project")

---

## 6. Content Hierarchy for V2 Landing Page

**Hero Section (Above Fold):**
- **Headline:** "Tailor your resume to any job in 3 minutes—powered by AI that never lies."
- **Subhead:** "Beat ATS, impress hiring managers, and apply faster. Trusted by [X] job seekers."
- **CTA:** "Tailor your first resume free" (not "Sign up"—lower friction)

**Social Proof (Mid-Page):**
- "92% of users get interviews within 2 weeks" (establish metric via post-launch survey)
- Testimonial format: "[Name], [Role] at [Company]—'ResumeAI helped me pivot from teaching to tech in 6 weeks.'"

**Feature Blocks (Scan-Friendly):**
- ✓ AI rewrites bullets without hallucinations
- ✓ See exactly what changed (accept/reject per line)
- ✓ Download as PDF or Word in your choice of templates

**Pricing Clarity:**
- "3 free tailors/month. Upgrade anytime for $9.99/mo—cancel anytime."

---

## 7. Immediate Content Priorities (Pre-V2 Launch)

**Week 1-2:**
1. **Rewrite all error messages** (parse failures, rate limits, hallucination flags) using plain language + actionable CTAs.
2. **Draft A/B test copy** for paywall modal (EDA scarcity vs. QFP value variants).

## Persona Coverage Auditor (stage-6-validation)

# Persona Coverage Audit: ResumeAI v2

## 1. Cross-Persona Feature Validation Matrix

Analyzing V2 features against all identified personas reveals critical gaps in how features serve different user segments:

| Feature | EDA Coverage | QFP Coverage | Career Changers | International | Entry-Level | Executive | Gap Severity |
|---------|--------------|--------------|-----------------|---------------|-------------|-----------|--------------|
| AI Confidence Scores | ✓ (speed) | ✓✓ (trust) | ✓ (verify transferable skills) | ✓ | ✓ | ✓ | **LOW** |
| Template Preview | ✓ | ✓✓ | ✓ | ⚠ (needs locale variants) | ✓✓ | ⚠ (needs exec template) | **MEDIUM** |
| Batch Actions | ✓✓ (efficiency) | ✓ (strategic) | ✓ | ✓ | ✓ | ✗ (inappropriate for exec voice) | **MEDIUM** |
| Chrome Extension | ✓✓ (volume) | ✓ | ✓ | ✓ | ✓ | ✗ (execs don't mass-apply) | **LOW** |
| Interview Prep | ✓ | ✓✓ | ✓✓ (reframe experience) | ⚠ (needs cultural norms) | ✓✓ (compensate for gaps) | ✓ | **HIGH** |
| Localization Toggle | ✗ | ✓ | ✓ | ✓✓ (critical) | ✓ | ✓ | **HIGH** |
| Transferable Skills Mapper | ✗ | ⚠ | ✓✓ (essential) | ✓ | ✓ (academic→industry) | ✗ | **CRITICAL** |

**Key Finding:** **Transferable Skills Mapper** is underweighted in current V2 plan despite serving 3+ personas and addressing 20% TAM gap (per SEUA).

---

## 2. Critical Persona Blindspots

### **Blindspot 1: Executive/C-Suite Persona Underserved**
**Evidence:** 
- SEUA identifies "VIP Mode" and "two-page templates" but these aren't in Tier 1-2 priorities
- Batch actions and Chrome extension (Tier 1-2) actively harm exec positioning
- No exec-specific messaging in CLS analysis

**Impact:** Execs are highest willingness-to-pay ($50/tailor per SEUA) but V2 optimizes for volume users.

**Fix:** Create "Executive Track" in V2:
- Separate onboarding flow detecting 2-page resumes or C-suite titles
- Disable batch actions/Chrome extension for this cohort
- Gate behind Premium tier ($30/mo) with dedicated template + manual override controls
- Add exec-specific microcopy (CLS): "Preserve your leadership voice—AI suggests, you decide"

---

### **Blindspot 2: Career Changers Lack Dedicated UX Path**
**Evidence:**
- SEUA identifies "Resume Type Detection" and "Transferable Skills Translator" as high-priority
- PUAR notes 70% cite "AI didn't understand my background"
- No Stage 0 persona detection in current architecture

**Impact:** 20% TAM abandons at Stage 1 parse or Stage 3 rewrite due to misalignment.

**Fix:** Add **Pre-Stage 0: Background Selector**
- UI: "What best describes your situation?" [Traditional career / Career change / Military transition / International applicant / Student/Entry-level]
- Routes to specialized prompts (per AI/ML Specialist's "dynamic prompt engineering")
- Career changers get **Stage 1.5: Skills Translation Pass** (Haiku, +2K tokens, cached per user)
- Microcopy (CLS): "We'll translate your [military/academic/freelance] experience into corporate language"

---

### **Blindspot 3: International Users Treated as Edge Case**
**Evidence:**
- SEUA identifies as secondary user but MCLA notes 30% global market opportunity
- Localization toggle planned for Tier 3 despite serving multiple personas
- No mention in CLBA's cognitive load analysis (trust issues with US-centric AI)

**Impact:** International users experience higher cognitive load (verify cultural appropriateness) + lower trust (AI sounds "American").

**Fix:** Promote **Localization Toggle to Tier 1**
- Add to Stage 0 alongside template preview: "Resume style: 🇺🇸 US / 🇬🇧 UK / 🇨🇦 CA / 🇦🇺 AU"
- Affects Stage 3 prompts (spelling, terminology) + LaTeX formatting (dates, headers)
- Token cost: negligible (prompt variation only per AI/ML Specialist)
- Builds trust via CLBA's "transparent AI" principle

---

## 3. Persona-Specific Feature Conflicts

### **Conflict 1: Batch Actions vs. Quality Control**
- **EDA:** Needs "Accept all strong bullets" for speed
- **QFP + Exec:** Perceives as reckless, undermines trust

**Resolution:** Contextual batch actions based on user behavior clustering (per DTS):
- If `edit_rate < 20%` (EDA pattern): Show "Accept all high-confidence (8 found)"
- If `edit_rate > 40%` (QFP pattern): Show "Review manually recommended" + granular batching only
- Execs: Hide batch actions entirely

---

### **Conflict 2: Interview Prep Token Economics vs. Persona Value**
- **EDA:** Low willingness-to-pay for prep (focused on volume applications)
- **QFP + Entry-Level:** High value (compensates for experience gaps, strategic prep)

**Resolution:** Tiered interview prep (per AI/ML Specialist):
- **Free (EDA):** Haiku-generated 5 common questions only (no evaluation, 1K tokens)
- **Premium ($4.99 add-on):** Full Sonnet evaluation for QFP/Entry-Level (5K tokens)
- Prevents subsidizing low-value EDA usage with high-cost feature

---

## 4. Messaging Misalignment by Persona

### **CLS Analysis Gap: No Persona-Specific Landing Page Variants**
Current hero: "Tailor your resume to any job in 3 minutes—powered by AI that never lies."

**Persona Optimization:**
- **EDA Landing Variant:** "Apply to 10 jobs today—AI tailors each resume in 3 min"
- **QFP Landing Variant:** "Every word verified. AI confidence scores show exactly what changed"
- **Career Changer Variant:** "Translate your unique background into any industry—AI maps transferable skills"
- **Entry-Level Variant:** "No experience? Highlight coursework + projects—AI shows your potential"

**Implementation:** A/B test 4 variants via UTM params; route to persona-specific onboarding flows.

---

## 5. Underserved Persona Research Priorities

Per RPD's 2-week sprint, add persona-specific validation:

**Week 1:**
1. **Career Changer Interviews (n=10):** "Show your V1-tailored resume. What felt inaccurate about how AI described your background?"
2. **International User Survey (n=50):** "Rate how 'American' your tailored resume sounds (1-10). Would you pay for UK/CA/AU localization?"
3. **Executive Competitive Analysis:** Audit TopResume ($150/resume) and The Muse ($120) exec services—what justifies premium pricing?

**Week 2:**
4. **Entry-Level A/B Test:** Show 50% "education-first" parsing (projects promoted above work experience). Measure `match_percent` vs. control.
5. **Batch Actions Usability:** Watch 10 QFPs use feature—do they understand "Accept high-confidence" or feel pressured to use it?

---

## 6. PRD Requirement: Persona-Adaptive Architecture

**Missing from Systems Architect + AI/ML Specialist:** No persona detection layer.

**Recommendation:** Add **Persona Classification Service**
- **Input:** Resume structure (2-page = exec, .edu email = entry-level, 10yr gap = career changer), user-selected background, behavioral signals (edit rate, time-to-download)
- **Output:** Persona tag stored in Supabase `user_profiles.persona_type`
- **Effects:**
  - Routes to specialized Stage 1.5 prompts
  - Customizes UI (hide batch actions for execs, promote skills mapper for career changers)
  - Personalizes email campaigns (per DTS cohort analysis)
  - Informs pricing (exec VIP mode, entry-level .edu discounts)

**Token Cost:** +500 tokens one-time Haiku classification, cached indefinitely.

---

## 7. Immediate Action Items for PRD

**Add to Tier 1 (Blocks 20%+ TAM):**
1. **Localization Toggle** (international users, 30% global market)
2. **Transferable Skills Mapper Stage 1.5** (career changers, entry-level, 20% TAM per SEUA)
3. **Persona Detection + Adaptive UI** (prevents exec alienation, improves EDA conversion)

**Add to Research Validation (Pre-Build):**
4. Career changer + international user interviews (Week 1)
5. Executive competitive pricing analysis (Week 1)
6. Batch actions usability testing with QFPs (Week 2)

**Update Messaging Strategy:**
7. Create 4 persona-specific landing page variants (CLS + CLBA collaboration)
8. Add exec-specific microcopy for VIP mode (CLS)

**Success Metric:** V2 should achieve <10% persona-specific abandonment (career changers at Stage 1, execs at paywall, international at Stage 3 review).

## Research Synthesis & Compression Specialist (stage-6-validation)

# Research Synthesis & Compression: ResumeAI v2 PRD

## Executive Synthesis

ResumeAI v2 must evolve from a resume tailoring utility to a **trusted career acceleration platform** while maintaining strict cost discipline. Seven specialist analyses converge on three strategic imperatives:

1. **Quality & Trust Foundation** (Tier 1): Solve core UX friction before expansion
2. **Monetization Enablement** (Tier 2): Unlock revenue with minimal technical debt
3. **Differentiation Moat** (Tier 3): Build competitive advantages post-validation

**Critical Insight**: V1 lacks instrumentation—**defer 60% of planned V2 features** until baseline metrics (stage drop-offs, conversion rates, token costs) are established via 2-week data collection sprint.

---

## Tier 1: Core Quality & Retention (Ship First—4 Weeks)

### 1. AI Confidence Scores + Transparent Validation
**Rationale**: Addresses #1 cognitive load issue (trust burden) and differentiates from all competitors.

**Implementation**:
- Extract logprobs from Sonnet Stage 3/4 outputs → derive 0-100% confidence per bullet
- **Microcopy**: "92% confident—'Python' + 'API design' verified in original" (not raw %)
- A/B test: Show scores to 50% users; measure `time_to_download` (-25% target) and `bullet_acceptance_rate`

**Token Impact**: +500 tokens/job for logprobs analysis = $0.0015 (negligible vs. trust gains)

### 2. Batch Bullet Actions + Smart Defaults
**Rationale**: Reduces Stage 4 abandonment (RPD's critical unknown). EDAs need speed; QFPs need control.

**UX Design**:
- "Approve 8 high-confidence bullets (>85%)" [default pre-selected]
- "Review 3 flagged bullets manually" [expanded by default]
- "Reject 2 low-scoring suggestions"

**Behavioral Nudge**: Frame as "recommendations" not binary choices—reduces decision fatigue by 40% (cognitive load research).

### 3. Template Preview Before Tailoring (Stage 0)
**Rationale**: Prevents "template lock-in" regret (5-10% of users per SEUA estimates).

**Architecture**:
- **Lightweight HTML/CSS preview** (not full LaTeX compile—too slow)
- Show 3 templates with AI-driven labels: "Corporate Classic (finance/consulting)" vs. "Tech-Forward (engineers)"
- Allow template switching post-tailoring with 1-click re-render

**Token Cost**: +1K tokens for template recommendation via Voyage embeddings = $0.0001

### 4. Prompt Caching + Differential Rewriting
**Rationale**: TEO's 51% token reduction ($0.058 → $0.028/job) funds freemium sustainability.

**Technical Implementation**:
- Cache Stage 1 parsed resumes (24hr TTL) + Stage 2 JD analysis (7-day TTL) in Upstash Redis
- Pre-filter Stage 3: only rewrite bullets with <70% semantic similarity (Voyage embeddings) to JD
- Batch Stage 4 validation in single Sonnet call

**ROI**: Saves $1,500/month at 2,000 tailors/month; enables 3 free tailors/month at <$0.20 CAC.

---

## Tier 2: Monetization Enablers (6 Weeks Post-Tier 1)

### 5. Stripe Freemium with Behavioral Pricing Gates
**Pricing Structure** (undercuts all competitors by 50%):
- **Free**: 3 tailors/month (EDA hook)
- **Pro $9.99/mo**: 50 tailors + cover letters + confidence scores (QFP value)
- **Premium $19.99/mo**: Unlimited + interview prep (future)

**Paywall Microcopy A/B Test**:
- **Variant A (EDA)**: "You've applied to 3 jobs—keep momentum with unlimited tailoring"
- **Variant B (QFP)**: "Unlock AI confidence scores + executive templates for $9.99/mo"

**Conversion Target**: 9-15% free→paid (3x industry baseline per RPD).

### 6. LaTeX Cover Letter PDF + Discoverability
**Post-Download Modal** (50% opt-in target):
- **Headline**: "Complete your application in 2 minutes"
- **Body**: "67% of hiring managers prefer cover letters—generate yours now"
- **CTA**: "Create matching cover letter" (async Sonnet, 5K tokens)

**Quality Control**: Validate against resume facts (prevent hallucination in cover letter).

### 7. Template Gallery (5 LaTeX, Not 3)
**Rationale**: Competitive parity (Enhancv has 20+) but focus on quality.

**Archetypes**:
1. Corporate Classic (finance/consulting/law)
2. Tech-Forward (engineers—projects + GitHub)
3. Executive Brief (C-suite—board roles sidebar)
4. Entry-Level Academic (coursework emphasis)
5. Creative Portfolio (designers—visual hierarchy)

**Token Cost**: Negligible (rendering only; template recommendation via embeddings <1K tokens).

---

## Tier 3: Differentiation Moat (12+ Weeks, Post-Validation)

### 8. Interview Prep Mode (Premium-Only, $4.99 Add-On)
**Pre-Build Validation** (per RPD):
- Survey 200 users: "Would you pay $4.99 for AI interview prep?" (need 40%+ "definitely yes")
- If validated, implement Haiku-first architecture:
  - Haiku generates 10 questions from JD (2K tokens)
  - User selects top 3 to practice
  - Sonnet evaluates answers (5K tokens total = $0.075/session)

**Pricing Gate**: Must achieve 3+ uses/month to break even at unit economics.

### 9. Chrome Extension (Manifest V3)
**Unique Value** (vs. competitors' basic auto-paste):
- Client-side JD extraction (DOM parsing—zero tokens)
- **Supabase resume preload**: 1-click tailoring from LinkedIn/Indeed
- Stream Stages 1-4 progress via SSE in extension popup

**Rate Limit**: 3 auto-tailors/hour (prevent abuse).

**Adoption Target**: 60%+ extension→tailor conversion (vs. 40% manual upload).

### 10. Job Tracker Integration
**Rationale**: Teal/Enhancv retain 40% more users with trackers.

**Minimal Viable Implementation**:
- Supabase tables: `jobs` (JD, company, URL) + `applications` (status, notes, linked resume version)
- Basic UI: Kanban board (Applied → Interviewing → Offer/Rejected)
- **Engagement Target**: 8+ tracked jobs per user for 70% 30-day retention.

---

## Deprioritized / Research-Gated Features

**Delay Until Post-V2 Metrics**:
- **B2B Bulk API**: Low consumer fit; revisit if 5+ agency inquiries
- **3+ Additional Templates**: Diminishing returns beyond 5 archetypes
- **Interview Prep Conversational UI**: High complexity; validate demand first

---

## Secondary User Hardening (Integrated Across Tiers)

### Career Changers / Non-Traditional Backgrounds
- **Stage 1.5 (New)**: Haiku pass to map military/academic terms → industry equivalents (e.g., "Captain" → "Project Manager")
- **User Control**: Show mappings for approval—builds trust
- **Token Cost**: +2K tokens/resume (one-time, cached per user)

### International Users
- **Localization Toggle**: US/UK/Canada selector in Stage 0
- **Prompt Modifiers**: Adjust Stage 3 for spelling (colour vs. color), formatting (CV vs. Resume), cultural norms (GPA inclusion)
- **Token Cost**: Negligible (prompt variation only)

### Entry-Level / Students
- **Education-First Parsing**: Promote coursework projects in Stage 1 JSON
- **Tone Shift**: "No experience? Highlight your potential" (landing page)
- **Stage 3 Modifier**: Emphasize transferable skills from academics

### Technical / Executive Roles
- **Jargon Preservation**: User flags 5-10 must-keep terms (bypass Stage 3 rewriting)
- **VIP Mode**: Lock sections from AI editing (Premium-only)

---

## Critical 2-Week Pre-Build Sprint

**Immediate Actions** (blocks all V2 prioritization):
1. **Instrument V1**: Deploy Mixpanel/Amplitude events for all stages, bullet actions, downloads (15 events minimum)
2. **Establish Baselines**: Collect n=500+ sessions to measure:
   - Stage completion funnel (target: <15% drop-off per stage)
   - Current free→paid conversion (need 3-5% baseline for 3x goal)
   - Token cost per user ($0.058 estimated → validate)
3. **Competitive Teardown**: Mystery shop Teal/Jobscan/Enhancv—document AI quality, pricing, UX gaps
4. **User Interviews**: 15 users (5 recent converters, 5 free, 5 churned)—validate EDA/QFP archetypes + feature demand

**Success Gate**: V2 PRD cannot proceed without documented baselines for all Tier 1 success metrics.

---

## V2 Success Metrics (12-Week Post-Launch)

**Quality & Trust**:
- Stage 4 abandonment rate: <10% (from unknown baseline)
- Bullet acceptance rate: >70% (from ~50% estimated)
- Parse accuracy: >95% (from ~85% estimated)

**Monetization**:
- Free→paid conversion: 9-15% (3x current rate)
- MRR growth: $15K/month (500 Pro users @ $9.99)
- Token cost per paying user: <$0.50/month (enables 50 tailors/month profitability)

**Engagement**:
- 30-day retention: >60% (Teal benchmark: 70%)
- Cover letter opt-in: >50% (post-download modal)
- Chrome extension adoption: >40% of active users within 60 days

**Cost Efficiency**:
- Token spend reduction: 51% via caching + differential rewriting
- CAC from AI costs: <$2 (vs. $5+ industry average)

---

## Final Recommendation

**Ship Tier 1 in 4 weeks** (confidence scores, batch actions, template preview, token optimization). These features:
1. Solve V1's core UX friction (trust, fatigue, regret)
2. Differentiate from all competitors (Stage 4 validation transparency)
3. Enable sustainable freemium economics (51% cost reduction)

**Gate Tier 2/3 on validated metrics**—no Chrome extension or interview prep until baseline data proves demand and unit economics. This disciplined approach prevents feature bloat and ensures V2 compounds V1's strengths rather than diluting focus.

## PRD Translation Specialist (stage-6-validation)

# PRD Translation Specialist Analysis: ResumeAI v2

## 1. Executive PRD Framework

**Product Vision Statement:**
ResumeAI v2 evolves from a resume tailoring utility to an AI-powered career acceleration platform that helps job seekers secure interviews 2x faster through transparent AI assistance, multi-format application support, and intelligent workflow automation.

**Success Metrics (Measurable within 90 days):**
- Free→Paid conversion: 9-15% (3x baseline of 3-5%)
- Stage 3→4 completion: >85% (40% improvement per RPD)
- Time-to-first-download: <8 minutes (median)
- Token cost per job: <$0.03 (48% reduction from $0.058)
- 30-day user retention: >50% (2+ tailors)

---

## 2. Prioritized Feature Roadmap (MoSCoW)

### MUST HAVE (V2.0 Launch - 6 weeks)

**M1: AI Confidence Scores + Explainability**
- **User Story:** As a QFP, I want to see how confident the AI is in each rewritten bullet (0-100%) so I can focus my review on uncertain suggestions.
- **Acceptance Criteria:**
  - Display confidence badge (✓ High 85%+, ⚠ Medium 70-85%, ✋ Low <70%) per bullet
  - Tooltip explains: "92% confident—found 'Python' + 'API design' in original"
  - A/B test: 50% users see scores, measure impact on `time_to_download` and `bullet_edit_rate`
- **Dependencies:** AI/ML to implement logprobs analysis; UX for badge design
- **Rationale:** Directly addresses "trust but verify" cognitive burden (CBPA); low-effort, high-trust impact (RPD Tier 1)

**M2: Template Preview Before Tailoring**
- **User Story:** As a user, I want to preview how my resume will look in different templates *before* I invest time tailoring, so I avoid "template regret."
- **Acceptance Criteria:**
  - Stage 0: User selects from 3 templates (Corporate, Tech, Executive) with static preview images + descriptions
  - Preview shows placeholder data in chosen template layout (HTML/CSS approximation, not full PDF)
  - Track `template_regret_rate` (changed post-tailoring) <5%
- **Dependencies:** Systems Architect for HTML/CSS preview rendering; Designer for template mockups
- **Rationale:** Prevents QFP lock-in frustration (RPD); reduces support queries (SEUA)

**M3: Batch Bullet Actions**
- **User Story:** As an EDA, I want to accept all high-confidence bullets at once so I can review my resume in 3 minutes instead of 10.
- **Acceptance Criteria:**
  - Add UI buttons: "Approve high-confidence (X found)" and "Review low-confidence (Y flagged)"
  - Option: "Review manually (recommended for senior roles)" for QFPs
  - Track adoption: 40% of users with 10+ bullets use batch actions
- **Dependencies:** Frontend for batch action UI; Backend to filter bullets by confidence threshold
- **Rationale:** Reduces decision fatigue (CBPA); serves EDA speed need (PUAR)

**M4: Stripe Freemium Implementation**
- **User Story:** As ResumeAI, I want to convert free users to paid subscribers after 3 tailors/month by clearly communicating value.
- **Acceptance Criteria:**
  - Backend: Supabase `user_subscriptions` table; Stripe webhook integration
  - Paywall modal: A/B test EDA (scarcity: "Keep applying") vs QFP (value: "Unlock confidence scores")
  - Rate limit: 3 tailors/month free; Pro $9.99/mo (50 tailors); Premium $19.99/mo (unlimited + interview prep)
  - Track: `paywall_shown` → `checkout_completed` conversion by variant
- **Dependencies:** Systems Architect for Stripe API; CLS for paywall copy; DTS for event tracking
- **Rationale:** Revenue unlock (RPD Tier 1); aligns with TEO unit economics ($0.17 COGS for 3 free tailors)

**M5: Token Optimization (Caching + Differential Rewriting)**
- **User Story:** As ResumeAI, I want to reduce AI costs by 50% so freemium economics are sustainable.
- **Acceptance Criteria:**
  - Implement prompt caching for Stage 2 (JD hash, 24hr TTL) and Stage 3/4 system prompts
  - Add pre-filter: Only rewrite bullets with <70% semantic similarity to JD (Voyage AI embeddings)
  - Target: <$0.03/job (from $0.058); cache hit rate >50%
  - Monitor via Supabase `token_usage` table
- **Dependencies:** AI/ML for embedding integration; TEO for cost tracking dashboard
- **Rationale:** Enables $9.99/mo pricing (TEO); critical for scale (MLCA)

---

### SHOULD HAVE (V2.1 - 8 weeks post-launch)

**S1: LaTeX Cover Letter PDF + Discoverability**
- **User Story:** As a QFP, I want a professionally formatted cover letter that matches my tailored resume so I submit a complete, cohesive application.
- **Acceptance Criteria:**
  - Post-download modal: "Complete your application in 2 minutes" (50% opt-in target)
  - Async Stage 5 generates LaTeX PDF; SSE streams progress
  - Track: `cover_letter_generated` rate; time from download
- **Dependencies:** Systems Architect for async job queue; CLS for modal copy
- **Rationale:** Differentiator vs Jobscan (analysis-only); QFP value driver (MLCA)

**S2: Chrome Extension (Manifest V3)**
- **User Story:** As an EDA, I want to tailor my resume directly from LinkedIn/Indeed without copy-pasting, so I apply faster.
- **Acceptance Criteria:**
  - Client-side JD extraction (DOM parsing); Supabase resume preload
  - 1-click triggers Stages 1-4; streams progress
  - Rate limit: 3 auto-tailors/hour; track `extension_to_tailor_conversion` >60%
- **Dependencies:** Systems Architect for auth flow; Frontend for extension UI
- **Rationale:** Matches Teal/PitchMeAI parity (MLCA); EDA retention driver (40% uplift per SEUA)

**S3: Resume Template Gallery (5 LaTeX)**
- **User Story:** As a user, I want to choose from templates optimized for my industry (corporate/tech/exec/entry/creative) so my resume stands out visually.
- **Acceptance Criteria:**
  - Expand from 3 to 5 templates with industry-specific formatting
  - AI recommender: Embed JD → suggest top 2 templates with reasoning
  - Track: `template_selected` distribution; `template_regret_rate`
- **Dependencies:** AI/ML for recommender (Voyage embeddings); Designer for new templates
- **Rationale:** Quality over quantity (RPD); QFP differentiation (PUAR)

---

### COULD HAVE (V2.2 - 12 weeks post-launch)

**C1: Job Tracker Integration**
- **User Story:** As an EDA, I want to track which jobs I've applied to and their statuses so I stay organized.
- **Acceptance Criteria:**
  - Supabase schema: `jobs` + `applications` tables
  - Basic UI: Job list with statuses (Applied, Interviewing, Rejected), notes
  - Track: `jobs_tracked_per_user` (target 8+ for 70% retention)
- **Dependencies:** Systems Architect for CRUD endpoints; Frontend for tracker UI
- **Rationale:** Teal/Enhancv parity (MLCA); EDA moat (SEUA)

**C2: Secondary User Hardening (Localization + Skills Mapper)**
- **User Story:** As an international user, I want my resume formatted for UK conventions so I don't look unprofessional.
- **Acceptance Criteria:**
  - Locale toggle (US/UK/Canada) adjusts Stage 3 prompts + LaTeX formatting
  - Career changers: Stage 1.5 maps military/academic terms to industry equivalents (cached)
  - Track: `locale_selected` distribution; user feedback on accuracy
- **Dependencies:** AI/ML for prompt variants; CLS for localized microcopy
- **Rationale:** Captures 20% TAM (SEUA); reduces parse failures for non-traditional resumes

---

### WON'T HAVE (Deprioritized for V2)

**W1: Interview Prep Mode (Stage 6)**
- **Rationale:** High token cost ($0.075/session); unclear ROI until user research validates demand (RPD). Delay to V2.3+ pending survey results ("Would you pay $4.99?").

**W2: Bulk B2B API**
- **Rationale:** Low consumer fit; requires separate pricing/support model. Revisit post-V2 if inbound demand emerges.

---

## 3. Technical Specifications (For Engineering Handoff)

### API Contracts

**New Endpoint: POST /api/v2/confidence-scores**
```json
Request: { "session_id": "abc123", "stage": 3 }
Response: {
  "bullets": [
    {
      "id": 1,
      "confidence": 92,
      "explanation": "Found 'Python' + 'API design' in original",
      "risk_level": "low"
    }
  ]
}
```

**Modified Endpoint: POST /api/v2/tailor (Stage 3)**
- Add query param: `?differential=true` (only rewrites bullets with <70% similarity)
- Response includes `bullets_skipped_count` for analytics

### Database Schema Changes (Supabase)

```sql
-- User subscriptions
CREATE TABLE user_subscriptions (
  user_id UUID REFERENCES auth.users PRIMARY KEY,
  stripe_customer_id TEXT,
  plan TEXT CHECK (plan IN ('free', 'pro', 'premium')),
  tailors_used_this_month INT DEFAULT 0,
  subscription_status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Token usage tracking
CREATE TABLE token_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users,
  stage INT,
  model TEXT,
  input_tokens INT,
  output_tokens INT,
  cost_usd DECIMAL(10,6),
  cached BOOLEAN,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);
```

### Event Tracking Schema (Mixpanel)

```javascript
// Critical V2 events
mixpanel.track('confidence_score_viewed', {
  bullet_index: 3,
  confidence: 85,
  user_action: 'accepted' // or 'edited', 'rejected'
});

mixpanel.track('template_previewed', {
  template_id: 'corporate',
  time_spent_sec: 12
});

mixpanel.track('paywall_shown', {
  trigger: 'rate_limit', // or 'feature_gate'
  user_tailors_count: 3,
  variant: 'eda_scarcity' // or 'qfp_value'
});
```

---

## 4. User Research Validation (Pre-Build)

**Required Before M4 (Freemium) Build:**
- Survey 200 users: "What would make you upgrade?" (open-ended)
- A/B test paywall copy with 100 users hitting rate limit
- Validate pricing: Test $9.99 vs $14.99 Pro tier (willingness-to-pay)

**Required Before C1 (Interview Prep) Build:**
- Interview 15 users (5 EDA, 5 QFP, 5 churned): "Would you pay $4.99 for AI interview prep?"
- Success gate: >40% "definitely yes" to justify build

---

## 5. Go-to-Market Messaging (For Marketing Handoff)

**V2 Launch Positioning:**
- **Headline:** "Tailor your resume to any job in 3 minutes—powered by AI that never lies."
- **Key Differentiators:**
  1. Confidence scores (transparent AI)
  2. Hallucination validation (accuracy guarantee)
  3. $9.99/mo (50% cheaper than Jobscan)

**Target Segments:**
- **Primary:** EDAs (volume job seekers) via Chrome extension + batch actions
- **Secondary:** QFPs (strategic seekers) via confidence scores + exec templates

**Competitive Positioning:**
- vs Teal: "Claude-powered accuracy at Teal speeds, half the price"
- vs Jobscan: "We don't just analyze—we rewrite and validate every word"

---

## 6. Success Criteria & Launch Readiness

**V2.0 Launch Blockers (Must Pass):**
- [ ] A/B test shows confidence scores reduce `time_to_download` by 25%+
- [ ] Template preview reduces `template_regret_rate` to <5%
- [ ] Token cost <$0.03/job (validated via 100 test sessions)
- [ ] Freemium paywall converts >5% of rate-limited users
- [ ] All Tier 1 events firing in production (DTS validation)

**Post-Launch (Week 1-4):**
- Daily monitoring: Stage drop-offs, paywall conversion, token costs
- User interviews: 10 users (5 converted, 5 free) on V2 experience
- Adjust: Confidence score thresholds, paywall copy, template recommendations

**V2 Success = 3x conversion (9-15%), 50% token cost reduction, 50%+ retention at 30 days.**



# Your Task

You are the **Persona Coverage Auditor**. Using your specialized knowledge framework and the product context above, produce your research analysis.

Focus on actionable insights that will directly inform the PRD. Be specific, not generic.
Token budget: ~3072 tokens. Be concise but thorough.

---

### Output Instructions
Save the research output to: stage-6-validation/persona-coverage-auditor.md
Token budget: 3072 tokens