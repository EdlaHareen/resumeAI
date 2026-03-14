# ResumeAI v2 Implementation Task List

## Project Overview
Transform ResumeAI from a single-purpose resume tailoring tool into an end-to-end AI career acceleration platform with trust indicators, workflow integrations, and complete application package support.

## Implementation Phases

### Phase 1: Foundation & Cost Optimization (Weeks 1-4)
### Phase 2: Core Experience Enhancements (Weeks 5-8)
### Phase 3: Growth Features (Weeks 9-14)
### Phase 4: Premium Differentiation (Weeks 15-18)

---

## Task 0.0: Project Setup & Environment Configuration

**Priority:** Critical
**Estimated Effort:** 4 hours
**Dependencies:** None

### Sub-tasks:

#### 0.1: Create feature branch and verify development environment
- Create new Git branch `feature/resumeai-v2` from main
- Verify Python 3.11+ environment is active
- Confirm all V1 dependencies install correctly (FastAPI, Anthropic SDK, Supabase client, reportlab, tectonic)
- Run existing V1 test suite to establish baseline (all tests must pass)
- Document any environment-specific configuration needed for local development

#### 0.2: Set up token usage tracking infrastructure
- Create Supabase migration for `token_usage` table with columns: id, user_id, session_id, stage, model, prompt_tokens, completion_tokens, cost_usd, created_at
- Add database indexes on user_id, session_id, and created_at for query performance
- Create utility function to log token usage after each Claude API call
- Set up daily aggregation query to calculate per-user and per-stage costs
- Verify token tracking works by running a test tailoring session and checking database entries

#### 0.3: Configure analytics event tracking
- Create Supabase migration for `analytics_events` table with columns: id, user_id, session_id, event_name, event_properties (JSONB), created_at
- Define 15 critical events as constants: stage_completed, bullet_accepted, bullet_rejected, bullet_edited, download_clicked, rate_limit_hit, template_previewed, template_selected, cover_letter_modal_shown, cover_letter_generated, batch_action_used, job_added_to_tracker, extension_jd_extracted, interview_session_started, upgrade_modal_shown
- Create helper function to track events with automatic user_id and session_id injection
- Add event tracking to existing V1 download endpoint as proof of concept
- Verify events are logged correctly in Supabase

#### 0.4: Set up feature flag system
- Install feature flag library (LaunchDarkly SDK or GrowthBook SDK)
- Create feature flags for all V2 features: prompt_caching, differential_rewriting, ai_confidence_scores, batch_actions, template_preview, stripe_freemium, cover_letter_modal, chrome_extension, job_tracker, interview_prep
- Configure flag defaults (all off except prompt_caching and differential_rewriting for Phase 1)
- Add middleware to FastAPI to check feature flags on relevant endpoints
- Test flag toggling in development environment

**Relevant Files:**
- `.git/` (new branch)
- `requirements.txt` (verify dependencies)
- `supabase/migrations/001_token_usage_table.sql`
- `supabase/migrations/002_analytics_events_table.sql`
- `backend/utils/token_tracker.py` (new)
- `backend/utils/analytics.py` (new)
- `backend/config/feature_flags.py` (new)
- `backend/tests/test_tracking.py` (new)

---

## Task 1.0: Implement Prompt Caching for Stage 1 & 2

**Priority:** Critical (Phase 1, Sprint 1)
**Estimated Effort:** 12 hours
**Dependencies:** Task 0.0

### Sub-tasks:

#### 1.1: Set up Upstash Redis connection
- Create Upstash Redis account and provision database instance
- Add Upstash Redis credentials to environment variables (UPSTASH_REDIS_URL, UPSTASH_REDIS_TOKEN)
- Install redis-py client library
- Create Redis connection utility with connection pooling and error handling
- Test connection with ping command and basic set/get operations

#### 1.2: Implement Stage 1 resume parsing cache
- Generate cache key from resume file hash (SHA-256 of file contents)
- Before calling Claude API in Stage 1, check Redis for cached parsed resume JSON
- If cache hit, return cached result and skip API call
- If cache miss, call Claude API, store result in Redis with 24-hour TTL
- Add cache hit/miss tracking to analytics events
- Test with same resume uploaded twice to verify cache works

#### 1.3: Implement Stage 2 job description analysis cache
- Generate cache key from job description text hash (SHA-256 of cleaned JD text)
- Before calling Claude API in Stage 2, check Redis for cached JD analysis JSON
- If cache hit, return cached result and skip API call
- If cache miss, call Claude API, store result in Redis with 7-day TTL (JDs change less frequently than resumes)
- Add cache hit/miss tracking to analytics events
- Test with same JD used twice to verify cache works

#### 1.4: Add cache warming for common resume templates
- Identify 5 most common resume structures from V1 usage data
- Create synthetic test resumes representing these structures
- Pre-populate Redis cache with parsed versions of these templates on application startup
- Add cache warming status to health check endpoint
- Verify cache warming reduces cold start latency for new users

#### 1.5: Monitor cache performance and cost impact
- Create dashboard query to calculate cache hit rate (hits / (hits + misses)) for Stage 1 and Stage 2
- Run 50 test tailoring sessions with caching enabled
- Compare token costs to V1 baseline ($0.058/job)
- Verify cache hit rate is >30% and cost reduction is >40%
- Document cache performance metrics in implementation notes

#### 1.6: Test caching system
- Write unit tests for cache key generation (same input = same key)
- Write integration tests for cache hit/miss scenarios
- Test cache expiration (verify 24-hour and 7-day TTLs work correctly)
- Test Redis connection failure handling (graceful degradation to direct API calls)
- Verify no PII is stored in cache keys (only hashes)

**Relevant Files:**
- `backend/config/redis.py` (new)
- `backend/services/cache_service.py` (new)
- `backend/stages/stage1_parse.py` (modify to add caching)
- `backend/stages/stage2_analyze.py` (modify to add caching)
- `backend/utils/cache_warming.py` (new)
- `backend/tests/test_caching.py` (new)

---

## Task 2.0: Implement Differential Rewriting for Stage 3

**Priority:** Critical (Phase 1, Sprint 1-2)
**Estimated Effort:** 16 hours
**Dependencies:** Task 1.0

### Sub-tasks:

#### 2.1: Create bullet pre-filtering logic with Haiku
- Extract all resume bullets from Stage 1 parsed JSON
- For each bullet, calculate keyword match score against Stage 2 JD analysis (count overlapping keywords, normalize by JD keyword count)
- Send only bullets with <70% keyword match to Haiku for quick rewrite assessment
- Haiku prompt: "Does this bullet need rewriting to match the job description? Respond with YES or NO and confidence 0-100."
- Parse Haiku response and flag bullets for Sonnet rewriting
- Track pre-filtering decisions in analytics events

#### 2.2: Implement selective Sonnet rewriting
- Take flagged bullets from pre-filtering step
- Batch up to 10 bullets per Sonnet API call (reduces overhead)
- Send to existing Stage 3 Sonnet rewriting prompt
- For bullets not flagged for rewriting, pass through unchanged from original resume
- Merge rewritten and unchanged bullets back into full resume structure
- Verify final resume has same number of bullets as original

#### 2.3: Add quality validation for differential rewriting
- Compare match_percent scores between full rewriting (V1 baseline) and differential rewriting
- Run 100 test resumes through both approaches
- Verify differential rewriting stays within 3 points of full rewriting quality
- If quality degrades >3 points, adjust pre-filtering threshold (try 60% or 80% instead of 70%)
- Document optimal threshold in configuration

#### 2.4: Calculate token cost savings
- Track token usage for pre-filtering Haiku calls
- Track token usage for selective Sonnet calls
- Compare total Stage 3 tokens to V1 baseline (full Sonnet rewriting)
- Verify 30-50% token reduction target is met
- Add cost tracking to token_usage table with differential_rewriting flag

#### 2.5: Test differential rewriting system
- Write unit tests for keyword match scoring algorithm
- Write integration tests comparing differential vs. full rewriting outputs
- Test edge cases: resume with all bullets <70% match (full rewrite), resume with all bullets >70% match (no rewrite)
- Verify batch processing handles exactly 10 bullets correctly
- Test error handling if Haiku or Sonnet API calls fail mid-batch

**Relevant Files:**
- `backend/stages/stage3_rewrite.py` (major modifications)
- `backend/services/keyword_matcher.py` (new)
- `backend/services/bullet_batcher.py` (new)
- `backend/tests/test_differential_rewriting.py` (new)
- `backend/config/rewriting_config.py` (new - stores threshold values)

---

## Task 3.0: Implement Batch Validation for Stage 4

**Priority:** High (Phase 1, Sprint 2)
**Estimated Effort:** 8 hours
**Dependencies:** Task 2.0

### Sub-tasks:

#### 3.1: Consolidate Stage 4 validation into single API call
- Modify Stage 4 to accept array of rewritten bullets instead of processing one at a time
- Update Sonnet validation prompt to handle multiple bullets in single request
- Prompt format: "Validate these bullets for hallucinations. Return JSON array with {bullet_index, is_valid, confidence_percent, issues}."
- Parse Sonnet JSON response and map confidence scores back to individual bullets
- Verify all bullets receive validation scores

#### 3.2: Add confidence score extraction
- Extract confidence_percent (0-100) from Sonnet validation response for each bullet
- Store confidence scores in session state (Redis) alongside rewritten bullets
- Add confidence scores to Stage 4 output JSON structure
- Verify confidence scores are available for downstream use in diff review UI

#### 3.3: Calculate token savings from batch validation
- Track token usage for batch validation vs. individual validation
- Run 50 test sessions with varying bullet counts (5, 10, 20, 30 bullets)
- Verify 25% token reduction target is met
- Document token savings in implementation notes

#### 3.4: Test batch validation system
- Write unit tests for JSON parsing of batch validation responses
- Test edge cases: single bullet, 50+ bullets, bullets with special characters
- Verify confidence scores are correctly mapped to original bullet indices
- Test error handling if Sonnet returns incomplete JSON
- Verify validation quality matches V1 individual validation approach

**Relevant Files:**
- `backend/stages/stage4_validate.py` (major modifications)
- `backend/tests/test_batch_validation.py` (new)

---

## Task 4.0: Integrate Stripe Freemium & Subscription Management

**Priority:** Critical (Phase 1, Sprint 3-4)
**Estimated Effort:** 20 hours
**Dependencies:** Task 0.0

### Sub-tasks:

#### 4.1: Set up Stripe account and products
- Create Stripe account (or use existing)
- Create three products in Stripe dashboard: Free (0 tailors after limit), Pro ($9.99/month, 50 tailors), Premium ($19.99/month, unlimited)
- Generate Stripe API keys (publishable and secret) for development and production
- Add Stripe keys to environment variables
- Install Stripe Python SDK

#### 4.2: Create user subscriptions database schema
- Create Supabase migration for `user_subscriptions` table with columns: id, user_id (FK to auth.users), stripe_customer_id, stripe_subscription_id, plan_type (free/pro/premium), status (active/canceled/past_due), current_period_start, current_period_end, created_at, updated_at
- Add index on user_id for fast lookups
- Create default row for all existing users with plan_type='free'
- Add helper function to get user's current subscription status

#### 4.3: Implement Stripe Checkout flow
- Create FastAPI endpoint `/api/stripe/create-checkout-session` that accepts plan_type (pro/premium)
- Generate Stripe Checkout session with success_url and cancel_url
- Return checkout session URL to frontend
- Create React component `<UpgradeModal>` with two plan cards (Pro and Premium)
- Add "Upgrade" button that calls checkout endpoint and redirects to Stripe
- Test checkout flow in Stripe test mode

#### 4.4: Implement Stripe webhook handler
- Create FastAPI endpoint `/api/stripe/webhook` to receive Stripe events
- Verify webhook signature using Stripe SDK
- Handle events: checkout.session.completed (create subscription record), customer.subscription.updated (update status), customer.subscription.deleted (mark as canceled)
- Update user_subscriptions table based on webhook events
- Add idempotency handling (use Stripe event ID to prevent duplicate processing)
- Test webhook locally using Stripe CLI

#### 4.5: Implement rate limiting based on subscription
- Create middleware to check user's subscription status before allowing Stage 1 initiation
- For free tier: check `tailor_count` in current month from analytics_events table
- If count >= 3, return 429 error with upgrade message
- For Pro tier: check count >= 50
- For Premium tier: no limit
- Add rate limit tracking to analytics events
- Test rate limiting with mock users at each tier

#### 4.6: Create upgrade modal with A/B test variants
- Variant A: "You've used 3 free tailors. Upgrade for unlimited at $9.99/mo" (scarcity framing)
- Variant B: "Unlock AI confidence scores + 5 templates for $9.99/mo" (feature value)
- Use feature flag to randomly assign users to variant A or B
- Track which variant is shown in analytics events
- Display modal when user hits rate limit
- Add "Remind me later" option that shows modal again after 24 hours

#### 4.7: Add post-download upsell banner
- Create banner component that appears after resume download for free tier users
- Message: "Get unlimited tailoring like Teal+ for 67% less"
- Add "Upgrade Now" button that opens upgrade modal
- Track banner impressions and clicks in analytics events
- Test banner appearance and dismissal

#### 4.8: Test Stripe integration
- Write integration tests for checkout session creation
- Test webhook handler with Stripe test events
- Test rate limiting for all three tiers
- Test subscription status sync from Stripe to Supabase
- Verify upgrade modal appears at correct trigger points
- Test edge cases: user cancels during checkout, subscription expires, payment fails

**Relevant Files:**
- `supabase/migrations/003_user_subscriptions_table.sql`
- `backend/services/stripe_service.py` (new)
- `backend/api/stripe_routes.py` (new)
- `backend/middleware/rate_limiter.py` (modify existing)
- `frontend/components/UpgradeModal.tsx` (new)
- `frontend/components/UpsellBanner.tsx` (new)
- `backend/tests/test_stripe_integration.py` (new)

---

## Task 5.0: Build Template Gallery with Preview System

**Priority:** High (Phase 2, Sprint 5)
**Estimated Effort:** 16 hours
**Dependencies:** Task 0.0

### Sub-tasks:

#### 5.1: Design five LaTeX resume templates
- Create LaTeX template files: corporate.tex (ATS-safe serif, single column), tech.tex (modern sans-serif, clean), executive.tex (two-column with summary section), entry_level.tex (education-first layout), creative.tex (minimal with accent colors)
- Each template must support dynamic data injection via JSON (name, contact, experience bullets, education, skills)
- Test each template compiles correctly with tectonic using sample data
- Verify templates handle edge cases: long names, 50+ bullets, multiple degrees, special characters

#### 5.2: Generate static preview images for templates
- Create sample resume data JSON with realistic placeholder content
- Compile each template with sample data to generate PDF
- Convert PDFs to PNG images (300 D