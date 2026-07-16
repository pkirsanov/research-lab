# Report: 001 Causal Rotation Intelligence

**Related artifacts:** [scopes.md](scopes.md) | [uservalidation.md](uservalidation.md) | [scenario-manifest.json](scenario-manifest.json) | [test-plan.json](test-plan.json)

## Planning Baseline

This file is the execution-evidence template for the six sequential scopes in [scopes.md](scopes.md). `bubbles.plan` has not executed or certified product behavior. Execution agents must append current raw command output under the matching scope and scenario headings; no planning statement below is delivery evidence.

## Summary

- Feature intent: deliver an evidence-time-safe Causal Rotation Lab, read-only timing-tool overlays, a low-noise Market Brief handoff, append-only outcome accountability, and comprehensive static-site qualification.
- Scope order: foundation -> owner UI -> timing consumers -> Market Brief -> outcome/registry -> full qualification.
- Evidence policy: source-recorded positive observations only; malformed, stale, unavailable, or conflicting fixtures prove rejection/demotion behavior only.
- Current delivery status: SCOPE-01 implementation and behavior checks are complete, but the scope transition is blocked by plan-owned status syntax and a missing repo-local Bubbles runtime. SCOPE-02 has not started.

## Decision Record (Required for Non-Trivial Work)

Execution agents append implementation decisions here with the affected scope, alternatives considered, contract/version impact, rollback boundary, and current evidence reference. The planning decision is fixed in [design.md](design.md): causal integrity belongs to `rlcausal.js`; existing market tools remain timing owners; Market Brief consumes but does not create causal evidence.

## Completion Statement (Mandatory)

No feature or SCOPE-01 completion claim is made. SCOPE-01 has current behavior evidence, but its final transition item remains unchecked because the canonical transition guard failed. No dependent scope was opened.

## Code Diff Evidence (Required for Implementation-Bearing Work)

No product-code diff is claimed by `bubbles.plan`. Delivery agents must classify changed paths into planning-only, source/runtime, config, contract, test, docs, and other families and preserve unrelated dirty-tree changes.

### Code Diff Evidence

- Source/runtime: `rlcausal.js`.
- Config/contract: `causal-rotation.config.json`, `causal-rotation-observations.json`, `causal-rotation-ledger.jsonl`.
- Test/validation: `scripts/validate-causal-rotation.mjs`, causal groups in `scripts/selftest.mjs`, `tests/causal-rotation-lab.spec.mjs`, `tests/playwright-runtime.mjs`, and `tests/fixtures/causal-rotation/**`.
- Execution evidence/state: this report, execution-progress checkboxes in `scopes.md`, and implement-owned fields in `state.json`.
- Excluded shared/consumer surfaces: unchanged from the pre-edit line-count baseline; see [SCOPE-01 Change Boundary](#scope-01-change-boundary).
- Dirty-tree preservation: only the listed owned paths were edited; every other worktree path was left untouched by this invocation.

## Test Evidence (All Planned Types Required)

SCOPE-01 unit/property, contract, live-static, browser, and deterministic stress evidence is recorded below. SCOPE-02..06 execution evidence is absent because sequential execution halted at the failed SCOPE-01 transition gate.

## Scope Evidence Index

| Scope | Evidence Section | Planned Scenarios | Status |
| --- | --- | --- | --- |
| SCOPE-01 | [Shared causal foundation](#scope-1-shared-causal-foundation-and-evidence-contracts) | SCN-001-A01..A03 | Blocked after behavior checks |
| SCOPE-02 | [Owner UI](#scope-2-causal-rotation-lab-simplepower-owner-ui) | SCN-001-B01..B03 | Not run |
| SCOPE-03 | [Timing consumers](#scope-3-sector-global-and-real-assets-consumer-integration) | SCN-001-C01..C03 | Not run |
| SCOPE-04 | [Market Brief](#scope-4-market-brief-tier-a-and-validator-integration) | SCN-001-D01..D03 | Not run |
| SCOPE-05 | [Outcome and registry](#scope-5-outcome-ledger-registry-and-operator-documentation) | SCN-001-E01..E03 | Not run |
| SCOPE-06 | [Comprehensive qualification](#scope-6-comprehensive-browser-pages-adversarial-and-load-validation) | SCN-001-F01..F03 | Not run |

## Scope 1: Shared Causal Foundation and Evidence Contracts

### SCOPE-01 RED Stage

**Phase:** implement  
**Claim Source:** executed  
**Executed:** YES (current session, before implementation)  
**Command:** `node scripts/validate-causal-rotation.mjs`  
**Exit Code:** 1  
**Output:**

```text
node:internal/modules/cjs/loader:1572
 throw err;
 ^

Error: Cannot find module '/Users/pkirsanov/Projects/research-lab/scripts/validate-causal-rotation.mjs'
  at Module._resolveFilename (node:internal/modules/cjs/loader:1568:15)
  at wrapResolveFilename (node:internal/modules/cjs/loader:1122:27)
  at defaultResolveImplForCJSLoading (node:internal/modules/cjs/loader:1146:10)
  at resolveForCJSWithHooks (node:internal/modules/cjs/loader:1173:12)
  at Module._load (node:internal/modules/cjs/loader:1345:5)
  at wrapModuleLoad (node:internal/modules/cjs/loader:260:19)
  at Module.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:154:5)
  at node:internal/main/run_main_module:33:47 {
 code: 'MODULE_NOT_FOUND',
 requireStack: []
}

Node.js v26.4.0
(base) pkirsanov@Philippes-MacBook-Pro research-lab %
```

**Result:** FAIL as expected. The planned production validator did not exist before the SCOPE-01 implementation slice.

### SCOPE-01 GREEN Stage

The passing scenario, validator, selftest, live-static, determinism, source-integrity, and evidence-state outputs follow this heading and were executed after the RED proof above.

### Scenario SCN-001-A01

**Phase:** implement  
**Claim Source:** executed  
**Executed:** YES (current session)  
**Command:** `npx playwright test tests/causal-rotation-lab.spec.mjs --grep "Regression: Evidence available after a decision is excluded from that decision" --repeat-each=6 --reporter=list`  
**Exit Code:** 0  
**Output:**

```text
Running 6 tests using 6 workers

 ✓  1 …idence available after a decision is excluded from that decision (419ms)
 ✓  2 …idence available after a decision is excluded from that decision (422ms)
 ✓  3 …idence available after a decision is excluded from that decision (416ms)
 ✓  4 …idence available after a decision is excluded from that decision (419ms)
 ✓  5 …idence available after a decision is excluded from that decision (428ms)
 ✓  6 …idence available after a decision is excluded from that decision (424ms)

 6 passed (1.3s)
(base) pkirsanov@Philippes-MacBook-Pro research-lab %
```

**Result:** PASS. The persistent browser assertion verifies `CR-TIME-INELIGIBLE`, byte-equivalent frozen decision data, an unchanged frozen candidate digest, and later-fact use only in a new falsifying outcome event.

### Scenario SCN-001-A02

**Phase:** implement  
**Claim Source:** executed  
**Executed:** YES (current session)  
**Command:** `npx playwright test tests/causal-rotation-lab.spec.mjs --grep "Regression: One announcement drives price options and ETF activity" --repeat-each=6 --reporter=list`  
**Exit Code:** 0  
**Output:**

```text
Running 6 tests using 6 workers

 ✓  1 …gression: One announcement drives price options and ETF activity (521ms)
 ✓  2 …gression: One announcement drives price options and ETF activity (485ms)
 ✓  3 …gression: One announcement drives price options and ETF activity (479ms)
 ✓  4 …gression: One announcement drives price options and ETF activity (478ms)
 ✓  5 …gression: One announcement drives price options and ETF activity (528ms)
 ✓  6 …gression: One announcement drives price options and ETF activity (484ms)

 6 passed (1.4s)
(base) pkirsanov@Philippes-MacBook-Pro research-lab %
```

**Result:** PASS. The browser executes the production clusterer with three same-release facts plus one dependency-linked reaction fixture and asserts one cluster, one origin, four retained members, and one candidate reason key.

### Scenario SCN-001-A03

**Phase:** implement  
**Claim Source:** executed  
**Executed:** YES (current session)  
**Command:** `npx playwright test tests/causal-rotation-lab.spec.mjs --grep "Regression: Decision-critical valuation and timing inputs are stale or unavailable" --repeat-each=6 --reporter=list`  
**Exit Code:** 0  
**Output:**

```text
Running 6 tests using 6 workers

 ✓  1 …on-critical valuation and timing inputs are stale or unavailable (527ms)
 ✓  2 …on-critical valuation and timing inputs are stale or unavailable (679ms)
 ✓  3 …on-critical valuation and timing inputs are stale or unavailable (551ms)
 ✓  4 …on-critical valuation and timing inputs are stale or unavailable (595ms)
 ✓  5 …on-critical valuation and timing inputs are stale or unavailable (673ms)
 ✓  6 …on-critical valuation and timing inputs are stale or unavailable (549ms)

 6 passed (1.5s)
(base) pkirsanov@Philippes-MacBook-Pro research-lab %
```

**Result:** PASS. Discovery, balanced, and confirmation preserve unavailable valuation, classify the expired owner read as stale with `CR-TIMING-UNAVAILABLE`, and leave `planEligible` false.

### SCOPE-01 Live Static Contract

**Phase:** implement  
**Claim Source:** executed  
**Executed:** YES (current session)  
**Command:** `npx playwright test tests/causal-rotation-lab.spec.mjs --grep "Regression: served causal contracts preserve explicit stale and unavailable states" --repeat-each=6 --reporter=list`  
**Exit Code:** 0  
**Output:**

```text
Running 6 tests using 6 workers

 ✓  1 …d causal contracts preserve explicit stale and unavailable states (46ms)
 ✓  2 …d causal contracts preserve explicit stale and unavailable states (39ms)
 ✓  3 …d causal contracts preserve explicit stale and unavailable states (44ms)
 ✓  4 …d causal contracts preserve explicit stale and unavailable states (39ms)
 ✓  5 …d causal contracts preserve explicit stale and unavailable states (40ms)
 ✓  6 …d causal contracts preserve explicit stale and unavailable states (50ms)

 6 passed (449ms)
(base) pkirsanov@Philippes-MacBook-Pro research-lab %
```

**Result:** PASS. Config, observations, and stale-timing fixture all returned successful live same-origin HTTP responses; unavailable valuation remains serialized explicitly.

### SCOPE-01 Full Selftest

**Phase:** implement  
**Claim Source:** executed  
**Executed:** YES (current session)  
**Command:** `node scripts/selftest.mjs`  
**Exit Code:** 0  
**Output (raw causal section and final runner summary from the full 266-assertion run):**

```text
rlcausal.js — evidence-time safety, independence, sensitivity and immutable outcomes
 ✓ causal committed config and observation contracts validate without defaults
 ✓ causal anti-hindsight excludes evidence first available after decisionAt
 ✓ causal clustering collapses announcement-linked market reactions to one reason
 ✓ causal sensitivity never neutralizes stale or unavailable required evidence
 ✓ causal evaluator returns byte-equivalent normalized output for identical inputs
 ✓ causal evaluator is input-immutable
 ✓ causal stage order preserves emerging and blocking-contradiction states
 ✓ causal candidates preserve current and alternative regime consequences
 ✓ causal owner timing remains required before plan eligibility
 ✓ causal decision digest is stable when later evidence and outcomes are appended
 ✓ causal outcome classifies the frozen candidate without replacing its digest
 ✓ causal sensitivity explains the changed market gate
 ✓ causal sensitivity preserves provenance freshness contradiction and invalidation gates
 ✓ causal evaluator is deterministic and input-immutable across repeated recorded corpus runs
 ✓ shared canary: RLDATA cache and toolReads contracts remain unchanged
 ✓ shared canary: RLAPP resource states remain unchanged without causal registration

================================================
Research-Lab self-test: 266 passed, 0 failed
================================================
(base) pkirsanov@Philippes-MacBook-Pro research-lab %
```

**Result:** PASS. The complete repository runner exited zero; the displayed raw section is the causal group plus the final process summary, and all baseline groups ran in the same invocation.

### SCOPE-01 Causal Contract Validator

**Phase:** implement  
**Claim Source:** executed  
**Executed:** YES (current session)  
**Command:** `node scripts/validate-causal-rotation.mjs`  
**Exit Code:** 0  
**Output:**

```text
[causal-contract] validating production foundation and committed records
 PASS RLCausal API is frozen
 PASS SHA-256 implementation passes the abc reference vector
 PASS CausalConfig/v1 is valid with no implicit policy defaults
 PASS committed observation set is source-complete and digest-valid
 PASS all observation availability times are conservative
 PASS unsupported valuation and revision categories remain explicitly unavailable
 PASS initial append-only ledger parses without hidden or malformed events
 PASS recorded source review rejects transcript authority
 PASS recorded source review makes no market-success claim
 PASS recorded source review contains four independently reviewed primary pages
 PASS recorded sources use named publishers and stable https citations
 PASS same-release NVIDIA facts and outlook form one evidence cluster
 PASS one source origin produces one causal reason key
 PASS cluster retains every linked observation without counting each independently
 PASS every posture preserves unavailable sector valuation
 PASS every posture preserves stale owner timing as non-neutral
 PASS no posture makes stale timing plan-eligible
 PASS sensitivity explanation names changed market and visibility gates
 PASS sensitivity explanation preserves all integrity gates
 PASS later evidence is excluded with CR-TIME-INELIGIBLE
 PASS frozen decision bytes remain unchanged after later evidence
 PASS frozen decision retains its original candidate digest
 PASS later facts may classify a falsified outcome
 PASS outcome classification still leaves frozen decision bytes unchanged
 PASS same inputs produce byte-equivalent normalized snapshots
 PASS evaluator calls do not mutate config observations or input arrays
 PASS committed corpus includes cause-emerging and contradicted states
 PASS committed corpus produces no plan-eligible candidate without owner timing
 PASS compact projection contains no buy or sell instruction
[causal-contract] running rejection-only fixtures
 PASS fixture conflicting-identity fails closed for CR-CONFLICTING-IDENTITY - actual=CR-CONFLICTING-IDENTITY
 PASS fixture dependency-cycle fails closed for CR-CLUSTER-INVALID - actual=CR-CLUSTER-INVALID
 PASS fixture incomplete-source fails closed for CR-SOURCE-INCOMPLETE - actual=CR-SOURCE-INCOMPLETE
 PASS fixture later-evidence fails closed for CR-TIME-INELIGIBLE - actual=CR-TIME-INELIGIBLE
 PASS fixture seasonality-only-action fails closed for CR-SEASONALITY-CONTEXT-ONLY - actual=CR-SEASONALITY-CONTEXT-ONLY
 PASS fixture stale-timing fails closed for CR-TIMING-UNAVAILABLE - actual=CR-TIMING-UNAVAILABLE
 PASS fixture stale-valuation fails closed for CR-EVIDENCE-STALE - actual=CR-EVIDENCE-STALE
 PASS fixture unknown-timing-version fails closed for CR-TIMING-UNAVAILABLE - actual=CR-TIMING-UNAVAILABLE
 PASS recorded fixture directory contains only provenance and explicit-unavailable timing
 PASS snapshot diagnostics remain bounded and structured
[causal-contract] ------------------------------------------------
[causal-contract] checks passed: 39
[causal-contract] checks failed: 0
[causal-contract] candidates: 5
[causal-contract] source observations: 6
[causal-contract] adversarial fixtures: 8
[causal-contract] result: PASS
(base) pkirsanov@Philippes-MacBook-Pro research-lab %
```

**Result:** PASS. Every committed record validates, all source times are conservative, and every rejection-only fixture returns its exact structured failure without creating plan eligibility.

### SCOPE-01 Source Recording Integrity

**Phase:** implement  
**Claim Source:** executed  
**Executed:** YES (current session)  
**Command:** `node -e "const fs=require('fs'); const review=JSON.parse(fs.readFileSync('tests/fixtures/causal-rotation/recorded/source-review.json')); const data=JSON.parse(fs.readFileSync('causal-rotation-observations.json')); console.log('contract',review.contractVersion); console.log('verifiedAt',review.verifiedAt); console.log('transcriptClaimsUsed',review.transcriptClaimsUsed); console.log('marketEvidenceClaimed',review.marketEvidenceClaimed); review.sources.forEach((source,index)=>console.log('source-'+(index+1),source.publisher,source.publishedDate,source.url)); console.log('observationCount',data.observations.length); data.observations.forEach(observation=>console.log(observation.id,'available>=published',Date.parse(observation.availableAt)>=Date.parse(observation.publishedAt),'available>=verified',Date.parse(observation.availableAt)>=Date.parse(observation.verifiedAt))); const explicitUnavailable=data.hypotheses.flatMap(h=>h.unavailableEvidence||[]).map(e=>e.evidenceClass); console.log('explicitUnavailable',Array.from(new Set(explicitUnavailable)).sort().join(',')); const ok=!review.transcriptClaimsUsed&&!review.marketEvidenceClaimed&&review.sources.length===4&&review.sources.every(s=>s.publisher&&s.url.startsWith('https://'))&&data.observations.every(o=>Date.parse(o.availableAt)>=Date.parse(o.publishedAt)&&Date.parse(o.availableAt)>=Date.parse(o.verifiedAt)); console.log('result',ok?'PASS':'FAIL'); if(!ok) process.exit(1);"`  
**Exit Code:** 0  
**Output:**

```text
contract causal-source-review/v1
verifiedAt 2026-07-12T21:45:00Z
transcriptClaimsUsed false
marketEvidenceClaimed false
source-1 Board of Governors of the Federal Reserve System 2026-06-17 https://www.federalreserve.gov/newsevents/pressreleases/monetary20260617a.htm
source-2 Board of Governors of the Federal Reserve System 2026-05-04 https://www.federalreserve.gov/data/sloos/sloos-202604.htm
source-3 NVIDIA Corporation 2026-05-20 https://nvidianews.nvidia.com/news/nvidia-announces-financial-results-for-first-quarter-fiscal-2027
source-4 Intel Corporation 2026-04-23 https://www.intc.com/news-events/press-releases/detail/1767/intel-reports-first-quarter-2026-financial-results
observationCount 6
obs:fomc-target-range-2026-06 available>=published true available>=verified true
obs:sloos-ci-standards-2026-q1 available>=published true available>=verified true
obs:nvidia-q1-fy27-revenue available>=published true available>=verified true
obs:nvidia-q2-fy27-outlook available>=published true available>=verified true
obs:nvidia-china-outlook-limit available>=published true available>=verified true
obs:intel-q2-fy26-eps-guidance available>=published true available>=verified true
explicitUnavailable revision,valuation
result PASS
(base) pkirsanov@Philippes-MacBook-Pro research-lab %
```

**Result:** PASS. Positive records use named primary issuers/agencies and stable citations; transcript ideas and fabricated successful market histories are absent, while unsupported categories remain unavailable.

### SCOPE-01 Determinism And Input Immutability

**Phase:** implement  
**Claim Source:** executed  
**Executed:** YES (current session)  
**Command:** `node -e "require('./rlcausal.js'); const fs=require('fs'); const config=JSON.parse(fs.readFileSync('causal-rotation.config.json')); const observationSet=JSON.parse(fs.readFileSync('causal-rotation-observations.json')); const input={config,observationSet,timingReads:[],posture:'discovery',riskOverlay:'none',asOf:'2026-07-12T22:00:00Z',generatedAt:'2026-07-12T22:00:00Z'}; const inputBefore=RLCausal.canonicalize(input); const baseline=RLCausal.canonicalize(RLCausal.evaluateAll(input)); let stable=true; for(let run=1;run<=250;run++){if(RLCausal.canonicalize(RLCausal.evaluateAll(input))!==baseline||RLCausal.canonicalize(input)!==inputBefore){stable=false;break;}} console.log('contract',config.contracts.snapshot); console.log('candidateCount',RLCausal.evaluateAll(input).candidates.length); console.log('repeatCount',250); console.log('normalizedBytes',baseline.length); console.log('byteEquivalent',stable); console.log('inputImmutable',RLCausal.canonicalize(input)===inputBefore); console.log('configVersion',config.version); console.log('observationCount',observationSet.observations.length); console.log('hypothesisCount',observationSet.hypotheses.length); console.log('timingReadCount',input.timingReads.length); console.log('posture',input.posture); console.log('result',stable?'PASS':'FAIL'); if(!stable) process.exit(1);"`  
**Exit Code:** 0  
**Output:**

```text
contract causal-snapshot/v1
candidateCount 5
repeatCount 250
normalizedBytes 34212
byteEquivalent true
inputImmutable true
configVersion causal-config:1
observationCount 6
hypothesisCount 3
timingReadCount 0
posture discovery
result PASS
(base) pkirsanov@Philippes-MacBook-Pro research-lab %
```

**Result:** PASS. Canonical snapshot bytes stayed identical across 250 full evaluations and the canonical input bytes never changed.

### SCOPE-01 Explicit Evidence States

**Phase:** implement  
**Claim Source:** executed  
**Executed:** YES (current session)  
**Command:** `node -e "require('./rlcausal.js'); const fs=require('fs'); const config=JSON.parse(fs.readFileSync('causal-rotation.config.json')); const data=JSON.parse(fs.readFileSync('causal-rotation-observations.json')); const stale=JSON.parse(fs.readFileSync('tests/fixtures/causal-rotation/invalid/stale-timing.json')); const hyp=data.hypotheses.find(item=>item.id==='hyp:ai-infrastructure-demand'); const candidate=RLCausal.evaluateCandidate({config,observationSet:data,hypothesis:hyp,exposureId:'exp:semiconductors',timingRead:stale.timingRead,posture:'discovery',riskOverlay:'none',asOf:stale.evaluateAt}); const unverified=JSON.parse(JSON.stringify(data.observations[0])); unverified.id='obs:state-unverified'; unverified.classification='unverified'; unverified.contentDigest=RLCausal.digestRecord(unverified); const unverifiedResult=RLCausal.eligibleEvidence({observationIds:[unverified.id]},stale.evaluateAt,{observations:[unverified]}); console.log('missingClass',candidate.missingRequiredEvidenceClasses[0]); console.log('unavailableClass',candidate.unavailableEvidence[0].evidenceClass); console.log('staleTimingState',candidate.clocks.marketConfirmation.state); console.log('staleTimingCode',candidate.clocks.marketConfirmation.code); console.log('unverifiedState',unverifiedResult.excluded[0].state); console.log('unverifiedCode',unverifiedResult.excluded[0].code); console.log('causeStatus',candidate.causeStatus); console.log('postureEligible',candidate.postureEligible); console.log('planEligible',candidate.planEligible); console.log('missingDistinctFromUnavailable',candidate.missingRequiredEvidenceClasses.length>0&&candidate.unavailableEvidence.length>0); console.log('staleDistinctFromUnverified',candidate.clocks.marketConfirmation.state!==unverifiedResult.excluded[0].state); const ok=candidate.missingRequiredEvidenceClasses.includes('valuation')&&candidate.unavailableEvidence.some(item=>item.evidenceClass==='valuation')&&candidate.clocks.marketConfirmation.state==='stale'&&unverifiedResult.excluded[0].state==='unverified'&&!candidate.planEligible; console.log('result',ok?'PASS':'FAIL'); if(!ok) process.exit(1);"`  
**Exit Code:** 0  
**Output:**

```text
missingClass valuation
unavailableClass valuation
staleTimingState stale
staleTimingCode CR-TIMING-UNAVAILABLE
unverifiedState unverified
unverifiedCode CR-SOURCE-INCOMPLETE
causeStatus bounded
postureEligible true
planEligible false
missingDistinctFromUnavailable true
staleDistinctFromUnverified true
result PASS
(base) pkirsanov@Philippes-MacBook-Pro research-lab %
```

**Result:** PASS. Distinct missing, unavailable, stale, and unverified representations survive production evaluation; discovery may display the bounded candidate, but it remains non-plan-eligible.

### SCOPE-01 Change Boundary

**Phase:** implement  
**Claim Source:** executed  
**Executed:** YES (current session)  
**Command:** `printf '%s\n' 'Protected-surface baseline line counts: etf=3334 intraday=2221 strategy=1224 swing=2023 rldata=320 rlapp=165 rlnav=210 index=688 tools=638' && wc -l etf-momentum-lab.html intraday-tape-lab.html strategy-validation-lab.html swing-structure-lab.html rldata.js rlapp.js rlnav.js index.html tools.json && printf '%s\n' 'SCOPE-01 allowed-path status:' && git status --short -- rlcausal.js causal-rotation.config.json causal-rotation-observations.json causal-rotation-ledger.jsonl scripts/validate-causal-rotation.mjs scripts/selftest.mjs tests/fixtures/causal-rotation tests/causal-rotation-lab.spec.mjs tests/playwright-runtime.mjs specs/001-causal-rotation-intelligence/state.json specs/001-causal-rotation-intelligence/scopes.md specs/001-causal-rotation-intelligence/report.md && printf '%s\n' 'SCOPE-01 diff check:' && git diff --check -- rlcausal.js causal-rotation.config.json causal-rotation-observations.json causal-rotation-ledger.jsonl scripts/validate-causal-rotation.mjs scripts/selftest.mjs tests/fixtures/causal-rotation tests/causal-rotation-lab.spec.mjs tests/playwright-runtime.mjs specs/001-causal-rotation-intelligence/state.json specs/001-causal-rotation-intelligence/scopes.md specs/001-causal-rotation-intelligence/report.md && printf '%s\n' 'result PASS'`  
**Exit Code:** 0  
**Output:**

```text
Protected-surface baseline line counts: etf=3334 intraday=2221 strategy=1224 swing=2023 rldata=320 rlapp=165 rlnav=210 index=688 tools=638
  3334 etf-momentum-lab.html
  2221 intraday-tape-lab.html
  1224 strategy-validation-lab.html
  2023 swing-structure-lab.html
   320 rldata.js
   165 rlapp.js
   210 rlnav.js
   688 index.html
   638 tools.json
  10823 total
SCOPE-01 allowed-path status:
 M scripts/selftest.mjs
?? causal-rotation-ledger.jsonl
?? causal-rotation-observations.json
?? causal-rotation.config.json
?? rlcausal.js
?? scripts/validate-causal-rotation.mjs
?? specs/001-causal-rotation-intelligence/report.md
?? specs/001-causal-rotation-intelligence/scopes.md
?? specs/001-causal-rotation-intelligence/state.json
?? tests/causal-rotation-lab.spec.mjs
?? tests/fixtures/causal-rotation/
?? tests/playwright-runtime.mjs
SCOPE-01 diff check:
result PASS
(base) pkirsanov@Philippes-MacBook-Pro research-lab %
```

**Result:** PASS. All nine protected line counts match the pre-edit baseline; the active path list contains only foundation, planned tests/fixtures, and implement-owned execution evidence/state.

## Scope 2: Causal Rotation Lab Simple/Power Owner UI

### Scenario SCN-001-B01

Evidence status: not run. Required proof must exercise the served production page and show cause-emerging without action copy or weakened integrity gates.

### Scenario SCN-001-B02

Evidence status: not run. Required proof must show the same candidate in Simple and Power, with fundamental contradiction and regime alternatives preserved.

### Scenario SCN-001-B03

Evidence status: not run. Required proof must show structured unavailable chart state and a failed storage append remaining an unsaved draft.

## Scope 3: Sector, Global, and Real Assets Consumer Integration

### Scenario SCN-001-C01

Evidence status: not run. Required proof must compare Sector owner metrics/verdict before and after causal projection and show cause unverified separately.

### Scenario SCN-001-C02

Evidence status: not run. Required proof must compare Global owner ordering before and after contradicted/regime-fragile context.

### Scenario SCN-001-C03

Evidence status: not run. Required proof must compare Real Assets owner output and retain unavailable curve/inventory evidence.

## Scope 4: Market Brief, Tier-A, and Validator Integration

### Scenario SCN-001-D01

Evidence status: not run. Required proof must show coverage-only causal context consumes zero action and attention slots.

### Scenario SCN-001-D02

Evidence status: not run. Required proof must show duplicated catalyst reactions add no independent Brief reason key.

### Scenario SCN-001-D03

Evidence status: not run. Required proof must show invalid causal input yields an unavailable read while non-causal Tier-A and Brief output remains usable.

## Scope 5: Outcome Ledger, Registry, and Operator Documentation

### Scenario SCN-001-E01

Evidence status: not run. Required proof must show falsification appends while the original decision bytes, evidence, posture, thresholds, and digest remain unchanged.

### Scenario SCN-001-E02

Evidence status: not run. Required proof must show correction appends and preserves every earlier JSONL line.

### Scenario SCN-001-E03

Evidence status: not run. Required proof must show one resolving causal entry across catalog, registry, nav, notes, and Brief coverage.

## Scope 6: Comprehensive Browser, Pages, Adversarial, and Load Validation

### Scenario SCN-001-F01

Evidence status: not run. Required proof must show one coherent candidate contract across owner, consumers, Brief, and ledger while timing-owner verdicts remain unchanged.

### Scenario SCN-001-F02

Evidence status: not run. Required proof must execute every adversarial case through production validators and a live browser and assert exact fail-closed behavior.

### Scenario SCN-001-F03

Evidence status: not run. Required proof must cover local and Pages desktop/mobile behavior plus deterministic bounded stress/load execution.

## Uncertainty Declarations

SCOPE-01 transition is uncertain only at the governance layer. Behavioral checks are current and passing; the transition guard cannot certify the scope while plan-owned status markers are non-canonical and research-lab lacks the repo-local Bubbles workflow/session surfaces required by central guards. Free forward-valuation, consensus-revision, institutional-flow, futures-curve, and inventory coverage remains explicitly unavailable rather than inferred.

## Scenario Contract Evidence

The authoritative scenario-to-test expectations are in [scenario-manifest.json](scenario-manifest.json) and [test-plan.json](test-plan.json). Evidence links currently resolve to the not-run scenario sections above. Execution agents may append real evidence beneath those headings; they must not replace the stable scenario IDs or test titles.

## Coverage Report

Planned coverage includes unit/property, contract, integration, UI-unit, live-static e2e-api, live-browser e2e-ui, accessibility, deterministic stress, and interactive load checks. Actual counts and outcomes are intentionally absent until execution.

## Lint/Quality

Artifact lint passed after restoring top-level/certification status coherence. Artifact freshness passed with zero failures and zero warnings. The full transition remained blocked; the relevant raw window and follow-on diagnostics are below.

### SCOPE-01 Transition Guard

**Phase:** implement  
**Claim Source:** executed  
**Executed:** YES (current session)  
**Command:** `bash /Users/pkirsanov/Projects/bubbles/bubbles/scripts/state-transition-guard.sh /Users/pkirsanov/Projects/research-lab/specs/001-causal-rotation-intelligence`  
**Exit Code:** 1  
**Output (relevant raw final window from the full guard output):**

```text
============================================================
 TRANSITION GUARD VERDICT
============================================================

🔴 TRANSITION BLOCKED: 84 failure(s), 2 warning(s)

state.json status MUST NOT be set to 'done'.
Fix ALL blocking failures above before attempting promotion.

BEGIN TRANSITION_GUARD_RESULT_V1
schemaVersion: transition-guard-result/v1
workflowMode: full-delivery
auditProfile: delivery-completion-v1
targetStatus: done
applicableCheckClasses: [universal,mode-required,delivery-completion]
notApplicableChecks: []
passedGateIds: [G053,G040,G051,G068,G083,G084,G128,G085,G086,G091,G087,G088,G089,G092,G094,G095,G097,G098,G099,G100]
failedGateIds: [G041,G022,G028,G082,G093,G090]
failedChecks: [Check-4-completion,Check-5-all-done,Check-8-file-existence]
blockingCode: DELIVERY_COMPLETION_FAILED
failureCount: 84
exitStatus: 1
verdict: FAIL
END TRANSITION_GUARD_RESULT_V1
(base) pkirsanov@Philippes-MacBook-Pro research-lab %
```

**Result:** BLOCKED. No `Done` transition was written.

### Unresolved Finding Ledger

| Finding | Disposition | Required owner |
| --- | --- | --- |
| `G041`: all six plan-authored scope status markers use non-canonical `[ ] Not started` syntax | Route status-shape correction; implementation must not rewrite planning structure to satisfy a guard | `bubbles.plan` |
| `G022`: full-delivery phases and provenance are incomplete | No specialist evidence exists beyond implement; fabricating phase records is forbidden | `bubbles.workflow` |
| Test-file/traceability checks resolve current tests against the central Bubbles repo and require files owned by unstarted SCOPE-02..06 | Reconcile global guard timing/root resolution with sequential scope delivery; empty test shells are not valid evidence | `bubbles.plan` + Bubbles framework owner |
| `G053`: implementation delta heading absent when the guard ran | Addressed under [Code Diff Evidence](#code-diff-evidence); guard still requires rerun | `bubbles.implement` addressed |
| `G028`: central reality scan flags the existing approved `localStorage` credential/cache contracts in `rldata.js` and `rlapp.js` | Add/reconcile project policy baseline without weakening the central credential contract | Bubbles/project governance owner |
| `G082`: convergence-cap diagnostic cannot resolve a repo root because research-lab has no `.specify/memory` | Install or explicitly define the repo-local Bubbles runtime contract | Bubbles framework/onboarding owner |
| `G093`: delivery-delta diagnostic cannot find repo-local `bubbles/workflows.yaml` or `.github/bubbles` | Install or explicitly define the repo-local Bubbles runtime contract | Bubbles framework/onboarding owner |
| `G090`: retro health cannot find `.specify/memory/bubbles.session.json` | Install/create the framework-owned session surface through onboarding, not ad hoc implementation | Bubbles framework/onboarding owner |
| Transition warning: no completed-at timestamp and four evidence-shape warnings | Re-evaluate after canonical scope/runtime repair; no terminal claim is made now | `bubbles.validate` |

## Spot-Check Recommendations

- Compare frozen decision canonical bytes before and after outcome append.
- Compare all three timing-owner outputs before and after causal projection.
- Inspect canvas pixels and accessibility text on desktop and mobile.
- Confirm coverage-only causal reads create no Market Brief action/attention DOM.
- Confirm registry and navigation list each tool ID exactly once.

## Validation Summary

Not run for product delivery. Planning-only artifact checks are recorded by the current planning agent outside this template and do not certify implementation.

## Audit Verdict

No audit verdict exists. Only `bubbles.audit` may append an audit attempt, and only `bubbles.validate` may write certification state.
