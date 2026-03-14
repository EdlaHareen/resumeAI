# Research Synthesis & Compression Specialist

**Stage:** stage-6-validation
**LLM:** claude
**Mode:** autonomous
**Tokens:** 32864
**Generated:** 2026-03-07T05:57:25.836Z

---

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