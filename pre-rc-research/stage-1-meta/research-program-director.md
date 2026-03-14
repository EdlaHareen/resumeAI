# Research Program Director

**Stage:** stage-1-meta
**LLM:** claude
**Mode:** autonomous
**Tokens:** 2240
**Generated:** 2026-03-07T05:50:05.512Z

---

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