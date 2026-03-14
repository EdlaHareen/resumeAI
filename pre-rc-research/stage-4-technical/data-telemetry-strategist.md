# Data & Telemetry Strategist

**Stage:** stage-4-technical
**LLM:** claude
**Mode:** autonomous
**Tokens:** 13136
**Generated:** 2026-03-07T05:52:26.053Z

---

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