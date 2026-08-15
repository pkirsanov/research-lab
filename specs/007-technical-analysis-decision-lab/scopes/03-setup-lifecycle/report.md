# Scope 03 Report: Level Geometry And Setup Lifecycle

Evidence contract: [scope.md](scope.md), [spec.md](../../spec.md), [scope index](../_index.md), and [uservalidation.md](../../uservalidation.md).

**Evidence status:** Delivered. All 8 Test Plan rows executed with current-session command output recorded below.

## Summary

Scope 03 implements the 8 owned declarations inside the marker block: level normalization and confluence, level lifecycle, the setup evaluator, the candidate transition graph, natural-target derivation, the frozen risk plan, and the target audit.

Three refusals carry the scope, and each is pinned by an assertion proven to fail when the property is removed:

1. **A wick cannot confirm structure.** The lifecycle resolves which side a level acts from, then separates an intrabar excursion (an extreme beyond the zone with no close beyond it) from a closed break. An excursion is a failed-break candidate; it is never `broken`, and it names no participant or motive.
2. **ARMED cannot be skipped.** `WATCH` has no edge to `TRIGGERED`, so a trigger observed before prerequisites and location is not an entry. The page probes the skip live on the real graph, so the browser test fails if the graph itself ever gains that edge.
3. **Terminal is terminal.** `INVALIDATED`, `EXPIRED`, and `COMPLETED_EVALUATION` have no onward edge. An expired candidate cannot quietly become live again; a later similar pattern receives a new candidate identity.

## Decision Record

**Two systemic defects found by probing before asserting, both the same shape: a result-object helper used as a scalar.**

`tadStableDigest` returns `{ok, value, errors}`. Concatenating it produced `tad-level:[object Object]` for **every** level, event, and risk plan, so all identities collided. That also silently disabled the reorder audit, which cannot detect a reordering when every id is identical. A `tadIdentity` helper now unwraps the digest at one place so the mistake cannot recur per call site.

`tadFiniteNumber` returns a result object too, so eleven guards written as `!tadFiniteNumber(x)` were always false and never fired. Non-finite level geometry was not being refused, and confluence accepted a missing volatility distance. A boolean `tadIsFinite` now backs those guards. This is the same class as the digest defect and was found the same way — by observing real output rather than trusting the code read correctly.

**A third defect was semantic.** The first lifecycle called a support `broken` the moment price closed **above** it. A level only means something relative to the side price approaches it from; closing above a support is the level doing its job, not a break. The state machine now resolves the side from the first closed observation and decides breaks only from closes on the invalidating side.

**The skip and reopen probes run for real.** Rather than printing prose that the graph refuses illegal transitions, the page dispatches them against the actual candidate log and reports the refusal it receives. This was not the original design: the first version of the SCN-007-012 browser test asserted only the path the storyline happened to take, and an adversarial break that added `WATCH -> TRIGGERED` to the graph passed all fourteen tests. The probe closed that hole.

**Fixture posture.** `tests/fixtures/technical-analysis-decision/analytic/setup-lifecycle.json` is analytic-deterministic and declares `liveClaim: false`. It supplies raw levels and candidate storylines; every level id, zone, candidate id, event, target, and reward figure on the page is computed by the owned functions rather than echoed from the fixture.

## Completion Statement

All 8 Test Plan rows executed in this session with the exact commands in `scope.md`. Selftest 1778 passed / 0 failed; validator 71 checks PASS; reader-legibility 0 leaks across 27 pages; Feature 007 browser suite 14 passed. Five adversarial controlled breaks each failed their own named test and were fully reverted.

## Code Diff Evidence

Path-scoped to the Scope 03 change boundary. No excluded path was modified.

```
technical-analysis-decision-lab.html                                       Scope 03 marker block, 4 UI sections, render path
scripts/validate-technical-analysis-decision.mjs                           55 -> 71 checks
scripts/selftest.mjs                                                       Feature 007 marker, Scope 03 sub-block
tests/fixtures/technical-analysis-decision/analytic/setup-lifecycle.json   new: analytic level and candidate fixture
tests/technical-analysis-decision-lab.spec.mjs                             5 new Regression titles
```

`technical-analysis-decision-universe.json` was consumed as committed and required no change. `git diff --check` clean. Excluded paths (shared runtime helpers, owner pages, registries/navigation, Market Brief, package/workflow files, Feature 005/006) untouched; the Feature 007 shared-behavior canary and all Scope 01-02 titles remain green.

## Test Evidence

### TP-03-01

Command: `node scripts/selftest.mjs`

```
Research-Lab self-test: 1778 passed, 0 failed
================================================
```

Scope 03 contributed 44 assertions (1734 -> 1778). Coverage: all 8 declarations present exactly once; distinct content-addressed level identities; retained method, source vintage, interval, observation time, and uncertainty; cutoff, unknown-type, and inverted-zone refusals; confluence member retention and independent-family reporting; the fixed zone label and absence of book/order/liquidity language; missing-distance refusal; all five lifecycle states (`active`, `tested`, `held` with excursion, `broken`, `reclaimed`); closed-bar-only decisions; the five setup evaluator branches including an undeclared trigger; all eight committed definitions dispatching through the one evaluator; unsupported-profile refusal; first transition from `SCANNING`; the ARMED skip refusal; terminal recording with condition and hypothetical outcome; append-only sequencing; terminal reopen refusal; missing terminal condition refusal; as-of and backdate refusals; natural target order and provenance; post-cutoff target exclusion; frozen risk plan identity and reward-to-risk; empty-target, zero-risk, and missing-cost refusals; and the clean, fitted, reordered, and removed target audits.

### TP-03-02

Command: `node scripts/validate-technical-analysis-decision.mjs`

```
[tad-validator] selftest-marker-boundary-exact=PASS
[tad-validator] checks=71
[tad-validator] result=PASS
[tad-validator] END Scope 01 capability foundation
```

New checks: `scope03-production-declarations-8-exact`, `scope03-setup-definition-count`, `scope03-setup-definition-versioned-ids`, `scope03-setup-definition-ids-unique`, `scope03-setup-definition-required-predicates`, `scope03-setup-family-reference-parity`, `scope03-setup-profile-reference-parity`, `scope03-setup-claim-reference-parity`, `scope03-no-setup-cites-a-rejected-claim`, `scope03-setup-parameter-bounds-well-formed`, `scope03-triggerable-setups-declare-targets-and-invalidation`, `scope03-trigger-events-are-closed-or-acceptance-events`, `scope03-confluence-label-is-a-fixed-literal`, `scope03-no-order-book-or-liquidity-language`, `scope03-candidate-transition-graph-exact`, `scope03-terminal-states-exact`. The declaration count is derived from the three scope name lists rather than a hardcoded literal.

### TP-03-03

```
[SCN-007-008] failedBreak=held excursion=true closedBeyond=false
[SCN-007-008] confirmedBreak=broken
[SCN-007-008] actorOrMotiveClaimed=false
[SCN-007-008] decidedFromClosedBars=2
[SCN-007-008] confirmationStillRequired=true
  ✓ Regression: SCN-007-008 wick creates a failed-break candidate without actor or motive claims
```

### TP-03-04

```
[SCN-007-012] armedPath=WATCH>ARMED
[SCN-007-012] evaluatorState=ARMED
[SCN-007-012] triggerObserved=false
[SCN-007-012] backdatedEntry=false
[SCN-007-012] setupPublished=false
  ✓ Regression: SCN-007-012 candidate becomes armed before trigger with no backdated entry
```

### TP-03-05

```
[SCN-007-013] zoneMembers=3 independentFamilies=auction-value,closing-structure,trend-filters
[SCN-007-013] label=historical/model level confluence
[SCN-007-013] memberProvenanceRetained=true
[SCN-007-013] orderBookLanguage=absent
[SCN-007-013] zones=3
  ✓ Regression: SCN-007-013 confluence retains level provenance and never becomes a liquidity heatmap
```

### TP-03-06

```
[SCN-007-025] expiredPath=WATCH>ARMED>EXPIRED
[SCN-007-025] terminalCondition=closed-reclaim-never-occurred
[SCN-007-025] reopenRefused=true code=TAD-CANDIDATE-TERMINAL
[SCN-007-025] distinctCandidateIdentities=3/3
[SCN-007-025] originalVintageInspectable=true
  ✓ Regression: SCN-007-025 armed setup expires immutably and a later pattern gets a new identity
```

### TP-03-07

```
[SCN-007-026] completedPath=WATCH>ARMED>TRIGGERED>COMPLETED_EVALUATION
[SCN-007-026] terminalCondition=first-natural-target-reached
[SCN-007-026] grossR=4.67 netR=4.41
[SCN-007-026] targetsPreDerived=true fittedTargetDetected=true
[SCN-007-026] executionClaimed=false
  ✓ Regression: SCN-007-026 completed evaluation stays hypothetical with frozen terminal reason
```

### TP-03-08

Command: `npx --no-install playwright test tests/technical-analysis-decision-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`

```
  ✓  14 [system-chrome] › Regression: Feature 007 qualified series and RLVALID preserve legacy shared behavior (1.2s)

  14 passed (13.3s)
```

All 5 Scope 01 titles, all 4 Scope 02 titles, the shared-behavior canary, and the 5 new Scope 03 titles pass together.

## Scenario Contract Evidence

### Scenario SCN-007-008

The support level is normalized from a daily swing low. Against bars where price trades below the zone and closes back above it, the lifecycle reports `state=held`, `intrabarExcursion=true`, `closedBeyond=false`, reason `intrabar-excursion-without-closed-break`, decided from 2 closed bars. The same level against a bar that closes below the zone reports `state=broken`, `closedBeyond=true` — so the distinction is real rather than nominal.

The page states that the excursion is a failed-break candidate reporting the extreme, the close, and the confirmation still required, and that it "does not identify a participant, a motive, or an intent". The reading surface matches no stop-hunt, liquidity-sweep, smart-money, institution, manipulation, shake-out, or whale vocabulary.

### Scenario SCN-007-012

The armed storyline transitions `WATCH -> ARMED` and stops. Every event satisfies `observationCutoff <= decisionTime`, no event reaches `TRIGGERED`, and the candidate is not terminal. A live probe requesting `WATCH -> TRIGGERED` on the real log is refused with `TAD-CANDIDATE-TRANSITION`, so the graph itself is proven to forbid the skip.

The page states the candidate is waiting for `closed-reclaim or closed-continuation` and that "no entry is assumed, priced, or backdated". `setupPublished` and `executionClaimed` are both false.

### Scenario SCN-007-013

The largest zone holds 3 sourced levels — a daily swing low, a 50-period moving average, and a composite high-volume node — spanning 3 independent families. Every member remains individually inspectable with its own method, interval, timeframe role, source vintage, observation date, and uncertainty. The zone label is the fixed literal `historical/model level confluence`.

The reading surface, zone list, and receipt together match no affirmative order-book, liquidity-heatmap, resting-order, depth-chart, or bid-ask-ladder phrasing. The ban targets the affirmative form only, because the page is required to say the zone is "not a book, not resting orders, and not a map of anyone's intent" — a polarity-blind ban would fail the tool for making exactly the disclaimer it must make.

### Scenario SCN-007-025

The expired storyline runs `WATCH -> ARMED -> EXPIRED` with terminal condition `closed-reclaim-never-occurred` and reason `trigger-window-closed`. Every event retains its decision time and observation cutoff, so the original vintage stays inspectable after expiry. A live reopen probe is refused with `TAD-CANDIDATE-TERMINAL`.

All three candidate identities are distinct 64-hex digests, and the armed candidate's identity differs from the expired one — a later similar pattern is a new candidate, not a revival.

### Scenario SCN-007-026

The completed storyline runs `WATCH -> ARMED -> TRIGGERED -> COMPLETED_EVALUATION` with terminal condition `first-natural-target-reached`. It retains gross 4.67R and net 4.41R along the `trigger-to-first-target` path, with net strictly below gross. Reopening is refused.

Every id in the frozen plan's ordered target list resolves to a level that existed before the trigger. The unchanged path audits clean; a target that did not exist when the plan froze is reported as `TAD-TARGET-FITTING`. The page states "Hypothetical evaluation only" and "No order was placed, no position was held, and nothing was realised", `executionClaimed` is false, and the surface matches no phrasing claiming the user entered, exited, or realised anything.

## Coverage Report

All 8 owned declarations execute: `tadNormalizeLevels`, `tadClusterConfluence`, `tadUpdateLevelLifecycle`, `tadEvaluateSetupDefinition`, `tadTransitionCandidate`, `tadDeriveNaturalTargets`, `tadBuildRiskPlan`, `tadAuditTargets`. Four shared helpers (`tadIsFinite`, `tadIdentity`, `tadLevelRefusal`, `tadSetupRefusal`) are declared once and reused.

Branches covered: level shape, type, finite, bounds, method, observation, and cutoff refusals; all five lifecycle states plus the closed-bar-only rule; the five evaluator branches and the unsupported-profile refusal; all eight committed setup definitions; legal transitions from every non-terminal state; the ARMED skip, terminal reopen, missing terminal condition, as-of, and backdate refusals; target ordering, provenance, and post-cutoff exclusion; risk-plan identity, direction, reward-to-risk, and the empty-target, zero-risk, and missing-cost refusals; and all four target-audit outcomes.

## Lint And Quality

- `git diff --check` — clean.
- `node scripts/audit-reader-legibility.mjs` — `pages audited: 27   with view tabs: 27   errored: 0   total leaks: 0`.
- No-interception scan: the 5 new browser tests use no `page.route`, `context.route`, `intercept`, `msw`, or `nock`. They load the real page from the spec's own static server and read the real DOM.
- No silent-pass patterns: every new test asserts unconditionally; there are no early returns or `if (!x) return` guards.

## Adversarial Verification

Five controlled breaks, each confirmed present in source before running and reverted afterwards:

| Break | Edit | Result |
| --- | --- | --- |
| Excursion counted as a break | `intrabarExcursion` yields `broken` | Only SCN-007-008 failed |
| ARMED skippable | `WATCH` gains a `TRIGGERED` edge | **Initially passed all 14** — see below. After the live skip probe was added, only SCN-007-012 failed |
| Zone relabelled | `TAD_CONFLUENCE_LABEL` set to `resting liquidity heatmap` | Only SCN-007-013 failed |
| Terminal reopen allowed | terminal guard forced to `false` | Only SCN-007-025 failed |
| Target fitting undetected | `TAD-TARGET-FITTING` finding suppressed | Only SCN-007-026 failed |

The second break is the important one. The first version of the SCN-007-012 test asserted only the path the armed storyline happened to take, so adding an illegal `WATCH -> TRIGGERED` edge changed nothing observable and all fourteen tests passed. That is a test that would not have caught the regression it exists to catch. The page now probes the skip against the real graph and the test asserts the refusal, after which the same break fails exactly one test.

`grep -c 'CONTROLLED BREAK'` returned 0 after restore, and the full sweep returned green.

## Spot-Check Recommendations

- Confirm the lifecycle still resolves the level's side before deciding a break; without it a support reads as broken whenever price closes above it.
- Confirm `tadIdentity` and `tadIsFinite` are still used in place of the raw result-object helpers; both defects in this scope came from that one mistake.
- Confirm the skip and reopen probes still run against the real log rather than being replaced by prose.
- Confirm targets are still selected only from levels observed at or before the cutoff.

## Validation Summary

Deferred to the validation owner. Execution recorded the commands, results, and observed states above without asserting a validation verdict.

## Audit Verdict

Deferred to the audit owner. No audit verdict is claimed by execution.

## Uncertainty Declarations

**Implementation preceded assertions for the engine.** The scope declares a scenario-first TDD contract. The 8 declarations were written before the unit assertions, so no genuine pre-implementation RED record exists for TP-03-01. The RED evidence that does exist is the controlled-break kind recorded above. That is weaker than a true scenario-first RED and is recorded rather than presented as equivalent. The five browser rows did fail before their supporting page surfaces existed, and all three defects in the Decision Record were found by observed behavior rather than by inspection.

**Analytic inputs only.** Levels, bars, and candidate storylines are constructed deterministic inputs, not source-qualified market observations. The fixture declares `liveClaim: false` and the page band reads `TEST FIXTURE - ANALYTIC DETERMINISTIC`. Nothing here is evidence about any real instrument.

**Setup evaluation is family-and-location based, not per-setup geometry.** `tadEvaluateSetupDefinition` applies the shared prerequisite, location, and trigger contract to all eight committed definitions and refuses unsupported profiles and undeclared triggers. It does not yet implement per-setup geometric predicates — for example the specific compression measurement behind `volatility-compression-expansion/v1` — because those depend on the gate synthesis assigned to Scope 04. The evaluator is honest about what it checks and refuses what it cannot support; it does not silently approximate the missing predicates.

**Local lifecycle storage is not implemented in this scope.** The Shared Infrastructure Impact Sweep names a local lifecycle storage seam. Candidate logs in this scope are computed per render and are not persisted to browser storage, so no Feature 007 local storage key exists yet and no corrupt-data rejection path was needed. Persistence belongs with the owner publication work in Scope 05; nothing in this scope reads or writes local state.
