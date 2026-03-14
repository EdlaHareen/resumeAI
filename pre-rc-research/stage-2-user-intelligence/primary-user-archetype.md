# Primary User Archetype Researcher

**Stage:** stage-2-user-intelligence
**LLM:** gemini
**Mode:** autonomous
**Tokens:** 7139
**Generated:** 2026-03-07T05:50:49.668Z

---

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