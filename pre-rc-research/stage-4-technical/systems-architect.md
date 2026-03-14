# Systems Architect

**Stage:** stage-4-technical
**LLM:** gemini
**Mode:** autonomous
**Tokens:** 13443
**Generated:** 2026-03-07T05:52:26.046Z

---

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