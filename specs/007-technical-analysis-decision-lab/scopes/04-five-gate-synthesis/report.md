# Scope 04 Report: Five-Gate Synthesis And Candidate Selection

Evidence contract: [scope.md](scope.md), [spec.md](../../spec.md), [scope index](../_index.md), and [uservalidation.md](../../uservalidation.md).

**Evidence status:** Recaptured. Every Test Plan row and scenario contract below carries command output re-executed in the recapture session, not reconstructed prose.

**Why this section was rewritten.** The original delivery session ticked 16 Definition-of-Done items against evidence anchors that resolved to headings containing no output at all. The work itself had landed — the commits are real and the checks pass — but the recorded proof did not exist. Every block below was produced by re-running the row's own command and pasting what came back. Nothing is reconstructed from memory and nothing is copied from a sibling scope.

**Replay changed three conclusions.** One claim is contradicted outright (TP-04-03 asserted `readState=NO_EDGE`; the fixture deterministically produces `MIXED`), and two claims rest on RED records that were never captured. All three are recorded in Uncertainty Declarations and their DoD items are unticked. Counts that grew because the repository grew — selftest assertions, validator checks, browser tests, audited pages — are reported at their observed values with the original figure named alongside, since a stale count is not a contradiction.

## Summary

Scope 04 implements the 8 owned declarations inside the marker block: the five gate evaluators, ordered synthesis, deterministic candidate ranking, and the unified read.

Three properties carry the scope, and each is pinned by an assertion proven to fail when the property is removed:

1. **A failed mandatory gate cannot be outvoted.** All five gate records are always computed so the reader sees the whole picture, but eligibility stops at the first `fail` or `unavailable`, and every later gate is marked `diagnosticOnly`. An aligned, confirmed uptrend that is extended away from every governed zone is NO EDGE, not a bullish trigger.
2. **Direction is absent from ranking.** A candidate is selected for the completeness and strength of its gate and validation evidence. Direction is not a rank dimension, does not appear in ranked output, and a validator check greps the ranking function to keep it that way.
3. **Abstaining is a real answer.** With no candidate clearing every mandatory gate the read is `NO_EDGE` or `MIXED`, may name the nearest candidate and its missing condition, and never manufactures a low-confidence direction.

## Decision Record

**A scenario requirement was missing on first implementation.** SCN-007-004 requires that when tactical strength conflicts with a confirmed primary, only setup families explicitly eligible for countertrend research may remain armed. The first regime gate recorded the conflict as a reason code and then ignored it, so a trend-continuation family would have stayed armed against its own primary — the conflict would have been *displayed* while changing nothing. A shared `tadTimeframeConflict` helper now backs both the primary and regime gates so they cannot disagree, and the regime gate narrows eligibility to declared countertrend-eligible families or fails naming `primary-not-reversed`.

**The validator found a config reality worth pinning rather than flattening.** The first draft asserted that every setup declares all five mandatory gates. `trend-exhaustion-watch/v1` declares only three, and it also declares no trigger events and no target selectors — it is a watch setup that can never trigger, so requiring a trigger gate of it would have been wrong. The check now requires all five gates only of triggerable setups, adds the converse check that a watch-only setup declares no trigger or validation gate, and a selftest pins that such a setup stays `ARMED` even when handed a trigger event.

**A fixture mis-modelled its own scenario.** The no-edge competition originally used the `structural-invalidation` situation for its reversal candidate, which made the read `INVALIDATED` rather than `NO_EDGE`/`MIXED`. That was the fixture's fault, not the engine's: SCN-007-022 describes models with *unresolved contradictions*, not a confirmed invalidation. A `reversal-unconfirmed` situation now models the scenario as written.

**Gate records carry `observed` and `required` on every outcome, including passes.** A gate that only explains itself when it fails cannot be audited when it passes, and "why did this trigger?" is exactly the question a reader asks of a passing gate.

**Fixture posture.** `tests/fixtures/technical-analysis-decision/analytic/gate-synthesis.json` is analytic-deterministic and declares `liveClaim: false`. It supplies gate *inputs* only. Every gate outcome, rank, read state, and identity on the page is computed by the owned functions; no fixture carries an expected verdict field.

## Completion Statement

All 9 Test Plan rows were re-executed with the exact commands in `scope.md`. Every command exited 0: selftest 3429 passed / 0 failed; validator 216 checks PASS with all seven `scope04-*` checks green; reader-legibility 0 leaks across 29 pages; the cumulative Feature 007 browser suite 38 passed. Six of the six scenario contracts execute and pass.

Four figures in the original statement are lower than what runs today — selftest 1811, validator 78 checks, legibility 27 pages, suite 20 passed. Those are growth, not regression: later scopes added assertions, checks, pages and tests to the same shared commands, and each command still exits 0. The original figures are named here so the difference is visible rather than quietly overwritten.

One figure is not growth. TP-04-03 recorded `readState=NO_EDGE`; the row reports `readState=MIXED` and cannot report anything else, because `tadBuildUnifiedRead` selects `MIXED` whenever more than one candidate carries a contradiction, which the `noEdgeCompetition` fixture always does. The test passes because it asserts `not TRIGGERED` rather than the specific state, so nothing failed — the wrong value simply went unrecorded. See Uncertainty Declarations.

The four adversarial controlled breaks described below remain narrative. They were not re-executed in the recapture session, because performing them requires editing `technical-analysis-decision-lab.html`, which is outside this session's change boundary.

## Code Diff Evidence

**Phase:** implement
**Claim Source:** executed
**Executed:** YES (current session)
**Commands:** `git log --oneline -S'Feature 007 Scope 04: five-gate synthesis' -- technical-analysis-decision-lab.html`, then `git show --stat --oneline <sha>` for each commit.

The diff was recoverable in full. Scope 04 landed in exactly two commits, and their combined path list matches the Change Boundary declared in `scope.md` with nothing outside it.

```text
b03e411ca feat(007-04): five ordered gates, deterministic ranking, unified read
 scripts/selftest.mjs                             | 119 ++++++++++++++
 scripts/validate-technical-analysis-decision.mjs |  21 ++-
 technical-analysis-decision-lab.html             | 190 +++++++++++++++++++++++
 3 files changed, 329 insertions(+), 1 deletion(-)

ab23f09b4 feat(007-04): close Scope 4 — gate views, six browser regressions, closeout
 .../scopes/04-five-gate-synthesis/report.md        |  57 ++++++-
 .../scopes/04-five-gate-synthesis/scope.md         |  34 ++---
 .../scopes/_index.md                               |   2 +-
 .../007-technical-analysis-decision-lab/state.json |   9 +-
 technical-analysis-decision-lab.html               | 100 ++++++++++++
 .../analytic/gate-synthesis.json                   |  83 ++++++++++
 tests/technical-analysis-decision-lab.spec.mjs     | 168 +++++++++++++++++++++
 7 files changed, 427 insertions(+), 26 deletions(-)
```

Path-scoped totals across both commits, against the allowed-edit list:

| Path | Change | Allowed by Change Boundary |
| --- | --- | --- |
| `technical-analysis-decision-lab.html` | +290 | Feature 007 page |
| `tests/technical-analysis-decision-lab.spec.mjs` | +168 | Feature 007 browser file |
| `scripts/selftest.mjs` | +119 | Feature 007 selftest marker |
| `tests/fixtures/technical-analysis-decision/analytic/gate-synthesis.json` | +83 | Feature 007 fixtures |
| `scripts/validate-technical-analysis-decision.mjs` | +21 / -1 | Feature 007 validator |

No shared runtime helper, owner publisher, registry, navigation file, note, Market Brief file, package file, workflow file, or Feature 005/006 path appears in either commit, so the declared exclusions hold.

**Marker containment.** The page edit is bounded: `grep -n` places the Scope 04 markers at lines 1933 and 2121 of `technical-analysis-decision-lab.html`, and all 8 owned declarations fall inside that range — `tadEvaluatePrimaryGate` 1950, `tadEvaluateRegimeGate` 1962, `tadEvaluateLocationGate` 1983, `tadEvaluateTriggerGate` 1995, `tadEvaluateValidationRiskProcessGate` 2007, `tadSynthesizeFiveGates` 2021, `tadRankCandidates` 2043, `tadBuildUnifiedRead` 2081. The validator pins this independently as `scope04-marker-block-present=PASS`.

**Prior-candidate ledger preservation.** Scanning the marker block for any lifecycle mutation returns nothing:

```text
$ awk 'NR>=1933 && NR<=2121 && /tadRecordCandidateEvent|tadTransitionCandidate|candidateEvents|appendEvent|tadEvaluateSetupDefinition/ {print NR": "$0}' technical-analysis-decision-lab.html
(no output)
```

Scope 04 therefore reads candidate state and appends no event to it, and every Scope 03 ledger assertion continues to pass inside the green selftest recorded under TP-04-01.

## Test Evidence

### TP-04-01

**Phase:** implement
**Command:** `node scripts/selftest.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Executed:** YES (current session)
**Output window:** bounded capture via `.github/bubbles/scripts/evidence-capture.sh`; the sha256 covers all 3898 produced lines.

```text
# TP-04-01 node scripts/selftest.mjs
$ node scripts/selftest.mjs
exit: 0
lines: 3898
sha256: 36357c7c9f9808b798b6605020a98954848f6d4c1e413974376757e4adc2725d
--- first 20 ---

Step 1 security — escaped model sinks and CSP on every page
  ✓ every shipped HTML page carries a Content-Security-Policy meta
  ✓ all pages use one identical CSP instead of drifting per page
  ✓ CSP keeps the single-file inline-script design while defaulting to self
  ✓ CSP blocks object, base-tag, and form exfiltration paths
  ✓ CSP connect-src is an explicit origin allowlist, never wildcard https
  ✓ CSP preserves fixed providers, StockAnalysis, and custom-port tailnet proxy paths
  ✓ CSP allows no open URL-forwarding relay origin
  ✓ production pages and shared runtime contain no open URL-forwarding relay chain
  ✓ no model/config-authored field reaches innerHTML without esc()
  ✓ the sink detector catches an unescaped model-authored title
--- omitted 3858 line(s); sha256 above covers the full output ---
--- last 20 ---
================================================
Research-Lab self-test: 3429 passed, 0 failed
================================================
```

The row asserts that the Scope 04 branches execute, not merely that the suite is green, so the block that carries them is located explicitly. `grep -n` puts the Scope 04 selftest block between the `/* ---------- Scope 04: five-gate synthesis ---------- */` marker at line 5050 and the Scope 05 marker at line 5168, and `awk` counts **34 `assert(` calls** inside it. Those assertions cover: all 8 declarations present exactly once; five gate records in the exact declared order; every-gate-pass producing `transitionEligible` with `passCount` 5 and a null blocker; the extended-location failure naming `chase-risk`; later gates continuing as `diagnosticOnly` while `blocksTransition` stays on the first failure; `closed-beyond-invalidation`, `provisional-bar-cannot-confirm` and `undeclared-trigger-event` on the trigger gate; all four validation-gate failure reasons (`costs-not-explicit`, unsupported status, `target-audit-dirty`, `net-reward-below-minimum`); absent regime resolving to `unavailable` rather than a pass; the timeframe conflict failing without a countertrend-eligible family and passing with one; agreeing roles reporting no conflict; direction absent from both rank dimensions and ranked output; ranking determinism under reversed input; the `TRIGGERED` read with a `tad-read:` 64-hex identity; abstention to `NO_EDGE`/`MIXED` with a nearest candidate; a single blocked candidate producing `NO_EDGE` and naming `location`; the `INVALIDATED` read; and both unified-read input refusals.

The original entry recorded 1811 passed. Today the same command reports 3429 because later scopes added assertions to the same shared suite. The Scope 04 assertions are inside that total and the command exits 0.

### TP-04-02

**Phase:** implement
**Command:** `node scripts/validate-technical-analysis-decision.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Executed:** YES (current session)
**Output window:** bounded capture; the sha256 covers all 220 produced lines. All seven `scope04-*` checks land in the first window.

```text
# TP-04-02 contract validator
$ node scripts/validate-technical-analysis-decision.mjs
exit: 0
lines: 220
sha256: 51620a0ec95b57e475a5f6f1decf3f9e0a7c3a991db6f0d81963895fb78682d2
--- first 20 ---
[tad-validator] BEGIN Scope 01 capability foundation
[tad-validator] scope01-production-declarations-20-exact=PASS
[tad-validator] scope02-production-declarations-17-exact=PASS
[tad-validator] scope03-production-declarations-8-exact=PASS
[tad-validator] scope04-production-declarations-8-exact=PASS
[tad-validator] scope05-adapter-declarations-4-exact=PASS
[tad-validator] scope06-comparison-declarations-4-exact=PASS
[tad-validator] scope07-validation-declarations-8-exact=PASS
[tad-validator] scope08-experience-declarations-3-exact=PASS
[tad-validator] scope08-design-declares-65-symbols=PASS
[tad-validator] scope08-all-65-symbols-implemented-once=PASS
[tad-validator] scope04-gate-order-exact=PASS
[tad-validator] scope04-marker-block-present=PASS
[tad-validator] scope04-ranking-never-reads-direction=PASS
[tad-validator] scope04-setup-mandatory-gate-ids-closed=PASS
[tad-validator] scope04-triggerable-setups-declare-all-five-mandatory-gates=PASS
[tad-validator] scope04-watch-only-setups-declare-no-trigger-gate=PASS
--- omitted 180 line(s); sha256 above covers the full output ---
--- last 20 ---
[tad-validator] selftest-marker-boundary-exact=PASS
[tad-validator] checks=216
[tad-validator] result=PASS
[tad-validator] END Scope 01 capability foundation
```

All seven Scope 04 checks pass, including the three the Definition of Done names by id: `scope04-gate-order-exact` (the gate order is the exact literal `["primary", "regime", "location", "trigger", "validation-risk-process"]`), `scope04-ranking-never-reads-direction` (the source between `tadRankCandidates` and `tadBuildUnifiedRead` contains no `direction` token), and `scope04-marker-block-present`. The original entry recorded 78 checks; the same command now runs 216 because the validator covers scopes 01-08.

### TP-04-03

**Phase:** implement
**Command:** `npx --no-install playwright test tests/technical-analysis-decision-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-007-001 aligned trend without governed location remains no edge" --reporter=list`
**Exit Code:** 0
**Claim Source:** executed
**Executed:** YES (current session)

```text
Running 1 test using 1 worker

  ✓  1 …N-007-001 aligned trend without governed location remains no edge (1.1s)
[SCN-007-001] primary=pass location=fail
[SCN-007-001] firstBlockingGate=location
[SCN-007-001] readState=MIXED selected=null
[SCN-007-001] chaseRiskNamed=true
[SCN-007-001] directionPublished=false

  1 passed (3.9s)
```

**The row passes and the recorded claim is still wrong.** Three of the four observations hold: `primary=pass`, `location=fail`, `chaseRiskNamed=true`. The fourth does not. The Definition of Done recorded `readState=NO_EDGE`; the run reports `readState=MIXED`.

This is not drift. `tadBuildUnifiedRead` chooses `MIXED` whenever no candidate is selected, none is invalidated, and more than one candidate carries a contradiction — and the `noEdgeCompetition` fixture holds three contradicting candidates, so `NO_EDGE` was never reachable on this path. The test does not catch it because it asserts `read.state` is `not TRIGGERED` together with a null selection and `directionPublished === false`, never the specific state. The scenario's protection against a bullish trigger is therefore genuinely enforced; only the recorded state value was false. The DoD item is unticked.

### TP-04-04

**Phase:** implement
**Command:** `npx --no-install playwright test tests/technical-analysis-decision-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-007-002 five mandatory gates produce one complete triggered read" --reporter=list`
**Exit Code:** 0
**Claim Source:** executed
**Executed:** YES (current session)

```text
Running 1 test using 1 worker

  ✓  1 …007-002 five mandatory gates produce one complete triggered read (858ms)
[SCN-007-002] gates=primary:pass regime:pass location:pass trigger:pass validation-risk-process:pass
[SCN-007-002] readState=TRIGGERED selected=tad-candidate:60af14972f
[SCN-007-002] selectionBasis=strongest-complete-gate-and-validation-evidence
[SCN-007-002] everyGateStatesObservedAndRequired=true
[SCN-007-002] passCount=5

  1 passed (3.5s)
```

Matches the recorded claim exactly: five passes in the declared order, `passCount=5`, and every gate stating both `observed` and `required` on a pass as well as a failure.

### TP-04-05

**Phase:** implement
**Command:** `npx --no-install playwright test tests/technical-analysis-decision-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-007-003 structural invalidation defeats correlated bullish indicators" --reporter=list`
**Exit Code:** 0
**Claim Source:** executed
**Executed:** YES (current session)

```text
Running 1 test using 1 worker

  ✓  1 …03 structural invalidation defeats correlated bullish indicators (753ms)
[SCN-007-003] passedBefore=primary,regime,location
[SCN-007-003] trigger=fail reason=closed-beyond-invalidation
[SCN-007-003] laterGatePass=pass diagnosticOnly=true
[SCN-007-003] transitionEligible=false
[SCN-007-003] outvotedByIndicators=false

  1 passed (3.1s)
```

Matches the recorded claim exactly. Primary, regime and location all pass first, so the failure is not a shortage of bullish evidence; the trigger gate fails on `closed-beyond-invalidation` and the later passing gate is marked `diagnosticOnly`, so it cannot restore eligibility.

### TP-04-06

**Phase:** implement
**Command:** `npx --no-install playwright test tests/technical-analysis-decision-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-007-004 tactical strength preserves primary downtrend conflict and eligibility" --reporter=list`
**Exit Code:** 0
**Claim Source:** executed
**Executed:** YES (current session)

```text
Running 1 test using 1 worker

  ✓  1 …al strength preserves primary downtrend conflict and eligibility (790ms)
[SCN-007-004] primaryGate=pass conflictStated=true
[SCN-007-004] regimeWithoutCountertrendFamily=fail
[SCN-007-004] regimeWithCountertrendFamily=pass
[SCN-007-004] primaryCalledReversed=false
[SCN-007-004] onlyCountertrendEligibleFamiliesArmed=true

  1 passed (3.2s)
```

Matches the recorded claim exactly: the regime gate fails without a countertrend-eligible family and passes with one, and neither path calls the primary reversed.

### TP-04-07

**Phase:** implement
**Command:** `npx --no-install playwright test tests/technical-analysis-decision-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-007-022 unresolved candidates produce no edge or mixed without a weak signal" --reporter=list`
**Exit Code:** 0
**Claim Source:** executed
**Executed:** YES (current session)

```text
Running 1 test using 1 worker

  ✓  1 …solved candidates produce no edge or mixed without a weak signal (785ms)
[SCN-007-022] readState=MIXED selected=null
[SCN-007-022] nearestReady=tad-candidate:47423a3c6f missing=trigger
[SCN-007-022] blockedCandidates=3
[SCN-007-022] forcedWeakSignal=false
[SCN-007-022] selectionBasis=no-candidate-cleared-every-mandatory-gate

  1 passed (3.2s)
```

The row's claim — a complete no-edge/mixed abstention without a weak substitute — holds. `MIXED` is one of the two states SCN-007-022 explicitly permits ("the UnifiedRead is NO EDGE or MIXED"), the selection is null, the nearest candidate and its missing condition are both named, and no weak directional signal is forced. The item's trailing annotation records `readState=NO_EDGE`, which is the same stale value discussed under TP-04-03; unlike TP-04-03, it does not contradict this row's stated claim, because this scenario admits either state.

### TP-04-08

**Phase:** implement
**Command:** `npx --no-install playwright test tests/technical-analysis-decision-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-007-027 candidate ranking favors complete evidence and keeps alternatives visible" --reporter=list`
**Exit Code:** 0
**Claim Source:** executed
**Executed:** YES (current session)

```text
Running 1 test using 1 worker

  ✓  1 …e ranking favors complete evidence and keeps alternatives visible (1.5s)
[SCN-007-027] selected=failed-break-reclaim/v1 passCount=5
[SCN-007-027] bullishCandidateRank=2
[SCN-007-027] rankDimensions=transitionEligible,passCount,validationStatus,truthState,contradictionSeverity,contradictionCount,specificity,registryIndex,candidateId
[SCN-007-027] alternativesVisible=2
[SCN-007-027] directionInRanking=false

  1 passed (5.5s)
```

Matches the recorded claim exactly: the short failed-break candidate wins on `passCount=5`, the long breakout ranks 2, both alternatives stay visible, and the nine rank dimensions contain no direction term.

### TP-04-09

**Phase:** implement
**Command:** `npx --no-install playwright test tests/technical-analysis-decision-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Exit Code:** 0
**Claim Source:** executed
**Executed:** YES (current session)
**Output window:** bounded capture; the sha256 covers all 164 produced lines.

```text
# TP-04-09 cumulative Feature 007 browser suite
$ npx --no-install playwright test tests/technical-analysis-decision-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
exit: 0
lines: 164
sha256: 66e2297ff90a3c0c10625aa9d73c51f2fe79901e1cac5fd8377b3e0aa540c97d
--- first 20 ---

Running 38 tests using 1 worker

[SCN-007-005] session=09:30-16:00 America/New_York
[SCN-007-005] segments=240,150
[SCN-007-005] remainder=partial/non-confirming
[SCN-007-005] ownerReadPublished=false
  ✓   1 [system-chrome] › tests/technical-analysis-decision-lab.spec.mjs:55:1 › Regression: SCN-007-005 stock four-hour profile exposes session remainder and variant identity (782ms)
--- omitted 124 line(s); sha256 above covers the full output ---
--- last 20 ---
[SCN-007-032] scenarioTitles=32 fixtures=18 rlvalid=7 interception=none
  ✓  38 [system-chrome] › tests/technical-analysis-decision-lab.spec.mjs:1457:1 › Regression: SCN-007-032 complete Feature 007 protected matrix remains executable (5.2s)

  38 passed (1.6m)
```

The cumulative suite is green after the six focused Scope 04 rows, with every Scope 01-03 title still passing. The original entry recorded 20 passed; the same command now runs 38 because Scopes 05-09 added their own regressions to the same file.

## Scenario Contract Evidence

Each contract below was re-executed as its own focused browser row in this session. The command and full captured output are recorded once under the matching Test Plan row; this section records the resulting scenario judgement.

### Scenario SCN-007-001

Re-run under TP-04-03, exit 0. The primary gate passes on an aligned, confirmed uptrend while the location gate fails, `firstBlockingGate=location`, and the failure reason set contains both `outside-governed-zone` and `chase-risk`. The read is not a bullish trigger: `selectedCandidateId` is null, `directionPublished=false`, and the reading surface matches no `bullish trigger`, `buy now/here`, or `go long` phrasing.

**Contract partially unmet as written.** The Gherkin says "the UnifiedRead is NO EDGE rather than a bullish trigger". The observed state is `MIXED`. The second half of that clause is enforced; the first is not, and cannot be on this fixture, because three contradicting candidates force `MIXED`. Correcting it is a planning decision — either the scenario should permit `NO_EDGE`/`MIXED` as SCN-007-022 does, or the fixture should present a single non-contradicting blocked candidate so `NO_EDGE` is genuinely reachable. This scope's owner cannot alter the scenario text, so the gap is recorded rather than closed.

### Scenario SCN-007-002

Re-run under TP-04-04, exit 0. Every mandatory gate passes for one configured setup, in the declared order, with `passCount=5` and a null blocker. The candidate is `TRIGGERED`, the read carries a `tad-read:` 64-hex identity, the selection basis is `strongest-complete-gate-and-validation-evidence`, and every gate states both what it observed and what it required. Contract met.

### Scenario SCN-007-003

Re-run under TP-04-05, exit 0. Primary, regime and location all pass before the trigger gate fails on `closed-beyond-invalidation`, so the outcome is not caused by weak bullish evidence. The later passing gate is `diagnosticOnly` and `transitionEligible` stays false, so correlated bullish methods cannot outvote the structural break. Contract met.

### Scenario SCN-007-004

Re-run under TP-04-06, exit 0. The primary gate passes and records the conflict as a `timeframe-conflict:` reason rather than a reversal, `primaryCalledReversed=false`. The regime gate fails with `timeframe-conflict-without-countertrend-eligible-family` when the family is not declared for countertrend research, and passes recording `primary-not-reversed` when it is. Only explicitly countertrend-eligible families remain armed. Contract met.

### Scenario SCN-007-022

Re-run under TP-04-07, exit 0. With three candidates carrying unresolved contradictions and none clearing every mandatory gate, the read is `MIXED` — one of the two states the scenario permits — with a null selection, the nearest candidate named, its missing condition reported as `trigger`, and `forcedWeakSignal=false`. Contract met.

### Scenario SCN-007-027

Re-run under TP-04-08, exit 0. A bullish breakout, a bearish failed-break and a two-sided mean-reversion candidate compete. The bearish failed-break is selected on `passCount=5` while the bullish breakout ranks 2, so selection follows complete gate and validation evidence rather than direction. Both non-selected candidates stay visible, and none of the nine rank dimensions is a direction term. Contract met.

## Coverage Report

Record every gate outcome/reason/dependency, rank dimension/tie, mandatory failure, diagnostic continuation, and canonical-repeat branch.

All 8 owned declarations execute: `tadEvaluatePrimaryGate`, `tadEvaluateRegimeGate`, `tadEvaluateLocationGate`, `tadEvaluateTriggerGate`, `tadEvaluateValidationRiskProcessGate`, `tadSynthesizeFiveGates`, `tadRankCandidates`, `tadBuildUnifiedRead`. Two shared helpers (`tadGateResult`, `tadTimeframeConflict`) are declared once and reused.

Branches covered: pass, fail, and unavailable outcomes on every gate; the timeframe conflict with and without a countertrend-eligible family; first-blocking-gate selection and diagnostic-only continuation; all four validation-gate failure reasons; every rank dimension including the deterministic tie-break; TRIGGERED, INVALIDATED, MIXED, and NO_EDGE read states; nearest-candidate reporting; and both unified-read input refusals.

## Lint And Quality

**Phase:** implement
**Claim Source:** executed
**Executed:** YES (current session)

**`git diff --check` — one finding, outside this scope.** Exit code 2.

```text
$ git diff --check
specs/008-portfolio-survival-and-brief-lab/scopes/28-spec-driven-adversarial-test-replacement/report.md:1870: new blank line at EOF.
```

The original entry recorded this as clean. It is not clean today, but the single finding is a trailing blank line in an uncommitted spec-008 artifact belonging to concurrent work this session must not touch. No Scope 04 path is implicated. The result is recorded as observed rather than restated as clean.

**Reader legibility — clean.** `node scripts/audit-reader-legibility.mjs`, exit 0, sha256 `683d0c48febd7aa036407509718a2fcb444780e3cd75ab999f6971c89223f02b` over 64 lines.

```text
=== leak class totals (page-view occurrences) ===

pages audited: 29   with view tabs: 29   errored: 0   total leaks: 0
```

`technical-analysis-decision-lab` is audited in that run and reports `views=[Simple|Power|Brief|Journey] clean`. The original entry recorded 27 pages; two pages were added since, and leaks remain 0.

**No-interception scan — clean.** Scanning the whole browser spec for interception primitives returns exactly one line:

```text
$ grep -nE 'page\.route|context\.route|\.intercept|msw|nock|wiremock|routeFromHAR' tests/technical-analysis-decision-lab.spec.mjs
1479:  expect(scanned).not.toMatch(/page\.route\(|context\.route\(|\.fulfill\s*\(|serviceWorker|cy\.intercept|\bmsw\b|\bnock\b/);
```

That single match is the suite's own assertion that no interception exists, not an interception. The six Scope 04 tests load the real page from the spec's static server and read the real DOM, which is independently confirmed by TP-04-09 reporting `interception=none`.

**No silent-pass patterns.** Every Scope 04 assertion is unconditional; the six tests contain no early return and no `if (!x) return` guard.

**Candidate ledger preservation.** Verified by the marker-block scan recorded under Code Diff Evidence: Scope 04 appends no candidate event, and all Scope 03 ledger assertions pass inside the green selftest.

**Not re-verified in this session.** The focused RED records, the semantic gate/rank review, editor diagnostics, artifact lint and freshness, G094, plan sync and traceability were not re-executed here. The recapture task was scoped to evidence for this scope's Test Plan rows and scenario contracts, and several of those checks are owned outside execution. The grouped Build Quality Gate item is unticked accordingly rather than carried on unverified assertions.

## Adversarial Verification

**Claim Source:** not-run (narrative carried forward from the original delivery session)

The four controlled breaks below were described by the original session but never recorded with command output, and they were **not** re-executed during recapture: each one requires editing `technical-analysis-decision-lab.html` to remove a property and then reverting it, which falls outside this session's change boundary. The table is retained as the original author's account, explicitly not as captured evidence.

| Break | Edit | Reported result |
| --- | --- | --- |
| Location gate always passes | `inGovernedZone` check forced to `false` | Only SCN-007-001 failed |
| A later pass restores eligibility | eligibility read from the last gate instead of the first blocker | SCN-007-001, SCN-007-003 and SCN-007-022 failed — all three assert that a failed mandatory gate blocks eligibility, so all three correctly detect it |
| Ranking prefers the bullish setup | a direction-shaped sort key inserted ahead of every evidence dimension | Only SCN-007-027 failed |
| Any family stays armed under a conflict | countertrend filter replaced with the full eligible list | Only SCN-007-004 failed |

The original account also notes that the fourth break initially appeared to fail two tests, which was a malformed `sed` corrupting the page rather than a test result, and that `grep -c 'CONTROLLED BREAK'` returned 0 after restore.

Because no RED output exists for any Test Plan row, the two Definition-of-Done items that assert RED records are unticked. What this session does establish is the GREEN half: all 9 rows re-executed at exit 0.

## Spot-Check Recommendations

Inspect failed location, all-pass trigger, structural invalidation, timeframe conflict, no-edge/mixed, and direction-neutral rank ordering.

## Validation Summary

Record validator-owned conclusions only after current execution.

Deferred to the validation owner. Execution recorded the commands, results, and observed states above without asserting a validation verdict.

## Audit Verdict

Record the audit-owned verdict and complete finding accounting only after audit execution.

Deferred to the audit owner. No audit verdict is claimed by execution.

## Uncertainty Declarations

Planning identified no artifact ambiguity. Execution-time evidence gaps are recorded here against the corresponding unchecked DoD item.

**SCN-007-001 cannot reach `NO_EDGE` on its fixture, and the recorded evidence said it did.** The DoD entry for TP-04-03 recorded `readState=NO_EDGE`. Re-running the row reports `readState=MIXED`, and inspection of `tadBuildUnifiedRead` shows that is the only reachable value here: with no selection, no invalidated candidate, and more than one contradicting candidate, the state is `MIXED` by construction, and the `noEdgeCompetition` fixture always supplies three contradicting candidates. The test never caught it because it asserts `not TRIGGERED` rather than the specific state. This was a false observation in the original record, not drift, and it is the reason the missing evidence mattered: capturing the output at the time would have exposed it immediately. Closing it properly requires either widening the SCN-007-001 Gherkin to permit `NO_EDGE`/`MIXED` as SCN-007-022 already does, or reshaping the fixture so a single non-contradicting blocked candidate makes `NO_EDGE` reachable. Both are planning-owned edits. TP-04-03's DoD item is unticked.

**No RED evidence exists for any Test Plan row.** The scope declares a scenario-first TDD contract, and two DoD items assert that intended RED and same-command GREEN records exist. GREEN is now captured for all 9 rows at exit 0. RED is not captured for any of them: the original session recorded only a narrative controlled-break table, and re-creating those breaks requires editing production page source outside this session's change boundary. The two items that depend on RED records are unticked rather than carried on an uncaptured claim.

**Implementation preceded assertions for the engine.** The 8 declarations were written before the unit assertions, so no genuine pre-implementation RED record exists for TP-04-01 even in principle. The RED evidence that was claimed is the controlled-break kind described above. That is weaker than a true scenario-first RED and is recorded rather than presented as equivalent. The missing SCN-007-004 eligibility rule and the mis-modelled no-edge fixture were both found by observed behavior, not by inspection.

**Three Gherkin scenarios have no faithful DoD item.** The transition guard reports G068 content-fidelity gaps for SCN-007-003, SCN-007-022 and SCN-007-027 in this scope. Adding or rewording DoD items is planning-owned, so this is recorded for the planning owner rather than repaired here.

**`git diff --check` is not clean tree-wide.** One finding exists, in an uncommitted spec-008 artifact belonging to concurrent work. No Scope 04 path is implicated, and this session did not modify the offending file.

**Gate inputs are supplied, not derived.** Scope 04 evaluates gate evidence that the analytic fixture provides — role states, regime, location distance, trigger events, validation posture. It does not yet derive that evidence from the Scope 02 technique outcomes and Scope 03 levels and candidates. Wiring the real derivation is the composition work that belongs with owner publication in Scope 05; the gates are honest about what they were given and refuse what is absent, but this scope does not prove the upstream wiring.

**Costs, comparison, and option evidence appear only as declared inputs.** The change boundary assigns cost, comparison, and option algorithms to Scopes 06-07. The validation gate consumes `costsExplicit`, `netRewardToRisk`, and a minimum threshold as explicit fixture inputs and refuses when they are absent; it does not compute them. No cost arithmetic is claimed by this scope.

**Contradiction severity and specificity are supplied ranking inputs.** `tadRankCandidates` orders by them deterministically, but Scope 04 does not derive them from evidence families. That derivation depends on the same Scope 05 composition as the gate inputs above.

**Gate inputs are supplied, not derived.** Scope 04 evaluates gate evidence that the analytic fixture provides — role states, regime, location distance, trigger events, validation posture. It does not yet derive that evidence from the Scope 02 technique outcomes and Scope 03 levels and candidates. Wiring the real derivation is the composition work that belongs with owner publication in Scope 05; the gates are honest about what they were given and refuse what is absent, but this scope does not prove the upstream wiring.

**Costs, comparison, and option evidence appear only as declared inputs.** The change boundary assigns cost, comparison, and option algorithms to Scopes 06-07. The validation gate consumes `costsExplicit`, `netRewardToRisk`, and a minimum threshold as explicit fixture inputs and refuses when they are absent; it does not compute them. No cost arithmetic is claimed by this scope.

**Contradiction severity and specificity are supplied ranking inputs.** `tadRankCandidates` orders by them deterministically, but Scope 04 does not derive them from evidence families. That derivation depends on the same Scope 05 composition as the gate inputs above.
