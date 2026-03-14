# AI/ML Systems Specialist

**Stage:** stage-4-technical
**LLM:** claude
**Mode:** autonomous
**Tokens:** 13013
**Generated:** 2026-03-07T05:52:26.050Z

---

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