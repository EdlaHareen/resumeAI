# Secondary & Edge User Analyst

**Stage:** stage-2-user-intelligence
**LLM:** claude
**Mode:** autonomous
**Tokens:** 5055
**Generated:** 2026-03-07T05:50:49.671Z

---

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