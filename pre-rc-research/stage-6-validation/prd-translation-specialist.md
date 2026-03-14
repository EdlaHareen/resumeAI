# PRD Translation Specialist

**Stage:** stage-6-validation
**LLM:** claude
**Mode:** autonomous
**Tokens:** 33784
**Generated:** 2026-03-07T05:57:25.837Z

---

# PRD Translation Specialist: ResumeAI v2

## 1. Production-Ready PRD Structure

### Product Overview
**Name:** ResumeAI v2.0 - AI Career Acceleration Platform  
**Launch Target:** 6 weeks from sprint start  
**Core Objective:** Increase free→paid conversion 3x (to 9-15%) while reducing token costs 48% through transparent AI assistance and workflow optimization.

---

## 2. Critical User Stories (Prioritized by Impact)

### P0: Revenue Enablement (Week 1-2)

**US-001: Freemium Monetization**
```
As a ResumeAI business stakeholder,
I want to enforce tiered usage limits and collect payments via Stripe,
So that we achieve sustainable unit economics at scale.

Acceptance Criteria:
- Free tier: 3 tailors/month (hard limit)
- Pro tier ($9.99/mo): 50 tailors + cover letters
- Premium tier ($19.99/mo): Unlimited + future interview prep
- Paywall triggers at tailor #4 with A/B tested messaging
- Stripe webhook handles subscription lifecycle events
- Rate limit check occurs before Stage 1 execution
- User sees remaining credits in header (e.g., "2/3 free tailors left")

Technical Notes:
- Supabase: Add `user_subscriptions` table with `tailors_used_this_month` counter
- Reset counter via cron job (1st of month)
- Stripe integration: Use Checkout Sessions API, not deprecated Charges
```

**US-002: Token Cost Optimization**
```
As a ResumeAI engineer,
I want to reduce AI costs by 48% through caching and selective rewriting,
So that freemium economics are viable at $9.99/mo.

Acceptance Criteria:
- Stage 2 JD analysis cached for 24hrs (SHA256 hash key)
- Stage 3 only rewrites bullets with <70% semantic similarity (Voyage embeddings)
- System prompts cached via Claude's prompt caching API
- Target: <$0.03/job (from $0.058 baseline)
- Monitoring: Real-time cost tracking in Supabase `token_usage` table

Technical Notes:
- Upstash Redis: Extend TTL from 10min to 24hr for JD cache
- Add pre-Stage 3 similarity scoring (Voyage AI: $0.0001/1K tokens)
- Cache miss fallback: Full rewrite (graceful degradation)
```

---

### P1: Trust & Quality (Week 3-4)

**US-003: AI Confidence Transparency**
```
As a Quality-Focused Professional,
I want to see how confident the AI is in each rewritten bullet,
So I can focus my review on uncertain suggestions and trust the process.

Acceptance Criteria:
- Display confidence badge per bullet:
  ✓ High (85-100%): "Strong match—aligns perfectly with job"
  ⚠ Medium (70-84%): "Review suggested—verify accuracy"
  ✋ Low (<70%): "Manual review needed—significant changes"
- Tooltip shows evidence: "92% confident—found 'Python' + 'API design' in original"
- A/B test: 50% control (no scores), 50% variant (scores shown)
- Success metric: Variant reduces `time_to_download` by 25%+ AND maintains `bullet_acceptance_rate` >70%

Technical Notes:
- Extract logprobs from Sonnet API response (requires `top_logprobs` parameter)
- Derive confidence: Average logprob of key tokens (action verbs, skills) → normalize to 0-100
- Frontend: Conditional rendering based on A/B test assignment (LaunchDarkly flag)
```

**US-004: Batch Bullet Management**
```
As an Efficiency-Driven Applicant,
I want to approve all high-confidence bullets at once,
So I can complete my review in 3 minutes instead of 10.

Acceptance Criteria:
- Show smart batch actions above bullet list:
  "Approve 8 high-confidence bullets (>85%)" [pre-selected]
  "Review 3 flagged bullets manually" [expanded by default]
  "Reject 2 low-scoring suggestions"
- For users with `edit_rate >40%` (QFP pattern): Hide "Approve all", show "Review manually recommended"
- Track adoption: 40% of users with 10+ bullets use batch actions within first session

Technical Notes:
- Backend clusters users by `edit_rate` (DTS cohort analysis)
- Frontend: Conditional UI based on user persona classification
- Prevent accidental mass-accept: Require confirmation modal for "Approve all"
```

**US-005: Template Selection UX**
```
As any user,
I want to preview templates before tailoring,
So I avoid "template regret" after investing 10 minutes.

Acceptance Criteria:
- Stage 0: Show 3 templates (Corporate, Tech-Forward, Executive) with:
  - Static preview image (HTML/CSS rendering, not PDF)
  - Industry label: "Best for finance, consulting, law"
  - AI recommendation badge: "Recommended based on your JD"
- Allow template change post-tailoring with 1-click re-render
- Track `template_regret_rate` (changed after Stage 4) <5%

Technical Notes:
- Template recommender: Embed JD (Voyage AI) → cosine similarity to template archetypes
- HTML preview: Render user's Stage 1 JSON with placeholder styling (faster than LaTeX compile)
- Cache preview HTML for 24hrs per user
```

---

## 3. Technical Implementation Specs

### API Changes

**New: GET /api/v2/subscription/status**
```json
Response: {
  "plan": "free",
  "tailors_remaining": 1,
  "tailors_used_this_month": 2,
  "next_reset_date": "2025-02-01T00:00:00Z"
}
```

**Modified: POST /api/v2/tailor**
```json
Request: {
  "resume_file": "base64_encoded",
  "job_description": "text",
  "differential_rewrite": true,  // NEW: Skip high-similarity bullets
  "template_id": "corporate"     // NEW: Pre-selected template
}

Response: {
  "session_id": "abc123",
  "bullets": [
    {
      "id": 1,
      "original": "Led team of 5 engineers",
      "rewritten": "Directed cross-functional team of 5 engineers...",
      "confidence": 92,           // NEW
      "similarity_score": 0.65,   // NEW: Pre-rewrite similarity
      "skipped": false            // NEW: True if >70% similar
    }
  ],
  "bullets_skipped_count": 3      // NEW: For analytics
}
```

### Database Migrations (Supabase)

```sql
-- Priority 1: Monetization
CREATE TABLE user_subscriptions (
  user_id UUID PRIMARY KEY REFERENCES auth.users,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  plan TEXT CHECK (plan IN ('free', 'pro', 'premium')) DEFAULT 'free',
  tailors_used_this_month INT DEFAULT 0,
  subscription_status TEXT CHECK (subscription_status IN ('active', 'canceled', 'past_due')),
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_subs_stripe_customer ON user_subscriptions(stripe_customer_id);

-- Priority 2: Cost tracking
CREATE TABLE token_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users,
  session_id TEXT,
  stage INT CHECK (stage BETWEEN 1 AND 5),
  model TEXT CHECK (model IN ('haiku', 'sonnet', 'voyage')),
  input_tokens INT,
  output_tokens INT,
  cost_usd DECIMAL(10,6),
  cached BOOLEAN DEFAULT false,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_token_usage_user_date ON token_usage(user_id, DATE(timestamp));

-- Priority 3: Persona classification
ALTER TABLE auth.users ADD COLUMN persona_type TEXT CHECK (persona_type IN ('eda', 'qfp', 'career_changer', 'international', 'entry_level', 'executive'));
ALTER TABLE auth.users ADD COLUMN edit_rate DECIMAL(5,2); -- Calculated: edits / total_bullets
```

---

## 4. Analytics Instrumentation (Mixpanel)

### Critical Events (Deploy Week 1)

```javascript
// Monetization funnel
mixpanel.track('rate_limit_hit', {
  limit_type: 'tailor',
  remaining_free_uses: 0,
  user_plan: 'free'
});

mixpanel.track('paywall_shown', {
  trigger: 'rate_limit', // or 'feature_gate'
  variant: 'eda_scarcity', // A/B test group
  user_tailors_count: 3
});

mixpanel.track('checkout_completed', {
  plan: 'pro',
  revenue_usd: 9.99,
  monthly_or_annual: 'monthly'
});

// Quality metrics
mixpanel.track('confidence_score_interacted', {
  bullet_index: 3,
  confidence: 85,
  user_action: 'accepted', // 'edited', 'rejected'
  time_spent_sec: 5
});

mixpanel.track('batch_action_used', {
  action_type: 'approve_high_confidence',
  bullets_affected: 8,
  user_persona: 'eda'
});

// Cost tracking
mixpanel.track('token_usage_logged', {
  stage: 3,
  tokens_used: 8000,
  cost_usd: 0.024,
  cached: false
});
```

---

## 5. A/B Test Specifications

### Test 1: Paywall Messaging (Week 2)
**Hypothesis:** QFPs convert 2x better with feature-value messaging vs. EDAs with scarcity.

| Variant | Copy | Target Segment | Success Metric |
|---------|------|----------------|----------------|
| Control | "Upgrade to continue tailoring" | All | 3-5% conversion |
| A (Scarcity) | "You've applied to 3 jobs—keep momentum with unlimited tailoring" | EDA | 6-8% conversion |
| B (Value) | "Unlock AI confidence scores + executive templates for $9.99/mo" | QFP | 10-15% conversion |

**Traffic Split:** 33% each, run for 200 paywall impressions per variant.

### Test 2: Confidence Score Display (Week 3)
**Hypothesis:** Showing confidence scores reduces review time 25% without decreasing quality.

| Variant | Treatment | Success Metrics |
|---------|-----------|-----------------|
| Control | No confidence scores shown | Baseline `time_to_download`, `bullet_acceptance_rate` |
| Treatment | Show confidence badges + tooltips | -25% time, equal/higher acceptance |

**Traffic Split:** 50/50, run for 500 tailoring sessions.

---

## 6. Launch Blockers & Acceptance Gates

### Pre-Launch Checklist (Must Pass)
- [ ] **Token cost validation:** 100 test sessions average <$0.03/job
- [ ] **Stripe integration:** Successful test payment in sandbox + production
- [ ] **Rate limit enforcement:** Free user blocked at tailor #4, Pro user not blocked
- [ ] **A/B test framework:** LaunchDarkly flags deployed, traffic split verified
- [ ] **Analytics validation:** All P0 events firing in staging (10 test sessions)
- [ ] **Confidence score accuracy:** Golden dataset (50 resumes) shows >90% score reliability

### Week 1 Post-Launch KPIs
- **Revenue:** >5 Pro subscriptions ($50 MRR)
- **Quality:** Stage 3→4 completion >80% (vs. unknown baseline)
- **Cost:** Token spend <$0.03/job average
- **Trust:** Confidence score variant reduces review time >20%

### V2.0 Success Criteria (90 days)
- **Conversion:** 9-15% free→paid (3x baseline)
- **Retention:** 50% 30-day retention (2+ tailors)
- **Unit Economics:** LTV:CAC >3:1 ($30 LTV / <$10 CAC)
- **Cost:** 48% token reduction sustained ($0.03 vs. $0.058)

---

## 7. Out-of-Scope (Deferred to V2.1+)

**Explicitly NOT in V2.0:**
- Interview Prep Mode (requires user research validation)
- Chrome Extension (8-week build, launch in V2.1)
- Job Tracker (requires separate UX design sprint)
- 5-template gallery (launch with 3, expand in V2.1)

**Rationale:** V2.0 focuses on monetization + trust. Growth features (extension, tracker) require V2.0 baseline metrics to validate demand.

---

## 8. Handoff Artifacts

**For Engineering:**
- Database migration scripts (above)
- API contract changes (above)
- Stripe webhook implementation guide (separate doc)

**For Design:**
- Confidence badge mockups (3 states: high/medium/low)
- Paywall modal wireframes (2 variants)
- Template preview UI (3 templates with labels)

**For Marketing:**
- V2 positioning: "Claude-powered accuracy at half the price"
- Launch email: "New: See exactly why AI changed each bullet"
- Pricing page copy: Feature comparison table (free vs. pro vs. premium)

**For Data:**
- Mixpanel event taxonomy (above)
- A/B test tracking plan (LaunchDarkly + Mixpanel integration)
- Weekly dashboard: Conversion funnel, token costs, confidence score adoption

---

**PRD Status:** Ready for engineering kickoff pending stakeholder sign-off on pricing ($9.99 Pro tier) and 6-week timeline.