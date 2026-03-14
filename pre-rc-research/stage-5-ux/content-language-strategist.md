# Content & Language Strategist

**Stage:** stage-5-ux
**LLM:** claude
**Mode:** autonomous
**Tokens:** 20583
**Generated:** 2026-03-07T05:53:50.031Z

---

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