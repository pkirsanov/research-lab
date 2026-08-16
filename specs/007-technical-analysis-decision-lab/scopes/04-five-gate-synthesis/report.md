# Scope 04 Report: Five-Gate Synthesis And Candidate Selection

Evidence contract: [scope.md](scope.md), [spec.md](../../spec.md), [scope index](../_index.md), and [uservalidation.md](../../uservalidation.md).

**Evidence status:** Delivered. All 9 Test Plan rows executed with current-session command output recorded below.

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

All 8 Test Plan rows executed in this session with the exact commands in `scope.md`. Selftest 1811 passed / 0 failed; validator 78 checks PASS; reader-legibility 0 leaks across 27 pages; Feature 007 browser suite 20 passed. Four adversarial controlled breaks each failed the tests that assert the removed property and no others.

## Code Diff Evidence

Record path-scoped synthesis/config/fixture/test/selftest marker changes and prior-candidate ledger preservation.

## Test Evidence

### TP-04-01

### TP-04-02

### TP-04-03

### TP-04-04

### TP-04-05

### TP-04-06

### TP-04-07

### TP-04-08

### TP-04-09

## Scenario Contract Evidence

### Scenario SCN-007-001

### Scenario SCN-007-002

### Scenario SCN-007-003

### Scenario SCN-007-004

### Scenario SCN-007-022

### Scenario SCN-007-027

## Coverage Report

Record every gate outcome/reason/dependency, rank dimension/tie, mandatory failure, diagnostic continuation, and canonical-repeat branch.

All 8 owned declarations execute: `tadEvaluatePrimaryGate`, `tadEvaluateRegimeGate`, `tadEvaluateLocationGate`, `tadEvaluateTriggerGate`, `tadEvaluateValidationRiskProcessGate`, `tadSynthesizeFiveGates`, `tadRankCandidates`, `tadBuildUnifiedRead`. Two shared helpers (`tadGateResult`, `tadTimeframeConflict`) are declared once and reused.

Branches covered: pass, fail, and unavailable outcomes on every gate; the timeframe conflict with and without a countertrend-eligible family; first-blocking-gate selection and diagnostic-only continuation; all four validation-gate failure reasons; every rank dimension including the deterministic tie-break; TRIGGERED, INVALIDATED, MIXED, and NO_EDGE read states; nearest-candidate reporting; and both unified-read input refusals.

## Lint And Quality

Record semantic, lifecycle, marker, no-interception, editor, diff, and governance outputs.

- `git diff --check` — clean.
- `node scripts/audit-reader-legibility.mjs` — `pages audited: 27   with view tabs: 27   errored: 0   total leaks: 0`.
- No-interception scan: the 6 new browser tests use no `page.route`, `context.route`, `intercept`, `msw`, or `nock`. They load the real page from the spec's own static server and read the real DOM.
- No silent-pass patterns: every new test asserts unconditionally; there are no early returns or `if (!x) return` guards.
- Candidate ledger preservation: Scope 04 appends no candidate event, and every Scope 03 ledger assertion remains green.

## Adversarial Verification

Four controlled breaks, each confirmed present in source before running and reverted afterwards:

| Break | Edit | Result |
| --- | --- | --- |
| Location gate always passes | `inGovernedZone` check forced to `false` | Only SCN-007-001 failed |
| A later pass restores eligibility | eligibility read from the last gate instead of the first blocker | SCN-007-001, SCN-007-003 and SCN-007-022 failed — all three assert that a failed mandatory gate blocks eligibility, so all three correctly detect it |
| Ranking prefers the bullish setup | a direction-shaped sort key inserted ahead of every evidence dimension | Only SCN-007-027 failed |
| Any family stays armed under a conflict | countertrend filter replaced with the full eligible list | Only SCN-007-004 failed |

The fourth break initially appeared to fail two tests; that was a malformed `sed` corrupting the page, not the test. Re-running the same break as a single clean edit failed exactly one test. `grep -c 'CONTROLLED BREAK'` returned 0 after restore, and the full sweep returned green.

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

**Implementation preceded assertions for the engine.** The scope declares a scenario-first TDD contract. The 8 declarations were written before the unit assertions, so no genuine pre-implementation RED record exists for TP-04-01. The RED evidence that does exist is the controlled-break kind recorded above. That is weaker than a true scenario-first RED and is recorded rather than presented as equivalent. The missing SCN-007-004 eligibility rule and the mis-modelled no-edge fixture were both found by observed behavior, not by inspection.

**Gate inputs are supplied, not derived.** Scope 04 evaluates gate evidence that the analytic fixture provides — role states, regime, location distance, trigger events, validation posture. It does not yet derive that evidence from the Scope 02 technique outcomes and Scope 03 levels and candidates. Wiring the real derivation is the composition work that belongs with owner publication in Scope 05; the gates are honest about what they were given and refuse what is absent, but this scope does not prove the upstream wiring.

**Costs, comparison, and option evidence appear only as declared inputs.** The change boundary assigns cost, comparison, and option algorithms to Scopes 06-07. The validation gate consumes `costsExplicit`, `netRewardToRisk`, and a minimum threshold as explicit fixture inputs and refuses when they are absent; it does not compute them. No cost arithmetic is claimed by this scope.

**Contradiction severity and specificity are supplied ranking inputs.** `tadRankCandidates` orders by them deterministically, but Scope 04 does not derive them from evidence families. That derivation depends on the same Scope 05 composition as the gate inputs above.
