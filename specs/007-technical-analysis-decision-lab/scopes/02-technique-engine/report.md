# Scope 02 Report: Technique Engine And Evidence Independence

Evidence contract: [scope.md](scope.md), [spec.md](../../spec.md), [scope index](../_index.md), and [uservalidation.md](../../uservalidation.md).

**Evidence status:** Delivered. All 7 Test Plan rows executed with current-session command output recorded below.

## Summary

Scope 02 implements the 17 owned declarations, plus 5 shared helpers, inside the marker block in `technical-analysis-decision-lab.html`. Fifteen technique implementations are reachable only through `tadEvaluateTechnique`, a closed id-to-code dispatch; `tadClusterEvidenceFamilies` collapses correlated transforms into declared clusters before anything is counted.

Three properties carried the design, and each is pinned by an assertion proven to fail when the property is removed:

1. **The dispatch is closed by construction.** JSON selects a known implementation id and its parameters. It cannot supply the code path, so `formula` remains inspectable prose and is never evaluated. An unknown id is refused, not resolved.
2. **Claim admission gates activation.** A technique runs only if every claim it cites carries a ledger record with a `supported` or `bounded` verdict plus grounding, tier, scope, limitation, and allowed treatment. `claim-hidden-actor` is `rejected` in the committed ledger, so a method citing it is refused and stays audit-only.
3. **A cluster casts one vote regardless of membership.** Four participation transforms are worth one vote, not four. Opposing members inside a cluster resolve to `unstable` rather than cancelling into false agreement.

## Decision Record

**Strength is not direction (defect found and fixed during execution).** The first directional map scored ADX `weak` as a negative direction and treated `strong`, `expanding`, `above`, and `strengthening` as directional. That is wrong: `design.md` states plainly that ATR and ADX strength never supply direction by themselves and that volatility qualifies but never votes direction. The symptom was `trend-filters` reporting `unstable` on a series that clearly trended. The map now contains only genuinely directional states, and an assertion pins that strength, location, and context states cast a zero vote.

**`qualifying` and `unavailable` are different facts (defect found and fixed during execution).** The first rollup labelled any cluster with no directional vote `unavailable`. That made the page state something false: ATR reading `high` and pivots reading `range` are readings, and reporting them as "could not run" understates the evidence actually on the page. Clusters now carry `readCount`, and a cluster whose members read but point nowhere is `qualifying`. Family denominators keep supports, contradicts, unstable, qualifying, and unavailable separate.

**Raw method count is published beside the cluster count.** SCN-007-010 requires that a reader can inspect raw methods without the raw count becoming confidence. Publishing only the collapsed count would hide the methods; publishing only the raw count would invite counting it as agreement. The page publishes both and states the relationship, so the gap between 15 raw readings and 11 independent votes is visible rather than implied.

**The rejected claim is exercised, not asserted.** Rather than printing prose that the rejected record is inert, the page constructs a probe method citing `claim-hidden-actor`, dispatches it for real, and reports the refusal it receives. The claim's inertness is therefore demonstrated on every render.

**Fixture posture.** `tests/fixtures/technical-analysis-decision/analytic/technique-series.json` is analytic-deterministic and declares `liveClaim: false`. Rows are compact `[o,h,l,c,v]` with the constant envelope fields declared once, and each series carries its closed-form derivation, so a reviewer can regenerate and diff rather than trust 840 opaque objects. Series were designed from each scenario's economic description *before* the engine was consulted; the recorded states are what the engine then reported.

## Completion Statement

All 7 Test Plan rows executed in this session with the exact commands in `scope.md`. Selftest 1675 passed / 0 failed; validator 55 checks PASS; reader-legibility 0 leaks across 26 pages; Feature 007 browser suite 9 passed. Four adversarial controlled breaks each failed their own named test and were fully reverted.

## Code Diff Evidence

Path-scoped to the Scope 02 change boundary. No excluded path was modified.

```
technical-analysis-decision-lab.html                                      marker block + Scope 02 UI sections + render path
scripts/validate-technical-analysis-decision.mjs                          47 -> 55 checks
scripts/selftest.mjs                                                      Feature 007 marker, Scope 02 sub-block
scripts/build-technique-series-fixture.mjs                                new: deterministic fixture generator
tests/fixtures/technical-analysis-decision/analytic/technique-series.json new: analytic fixture
tests/technical-analysis-decision-lab.spec.mjs                            4 new Regression titles
```

`technical-analysis-decision-universe.json` was consumed as committed and required no change this scope. `git diff --check` clean. Excluded paths (`rldata.js`, `rlvalidation.js`, Strategy Validation, owner publisher pages, registries/navigation, shared shell/chart/ticker/glossary, Market Brief, package/workflow files, Feature 005/006) untouched; the Feature 007 shared-behavior canary test continues to pass.

## Test Evidence

### TP-02-01

Command: `node scripts/selftest.mjs`

```
Research-Lab self-test: 1675 passed, 0 failed
================================================
```

Scope 02 contributed 30 assertions (1643 -> 1675 across this scope, including 2 added when the `qualifying` defect was fixed). Coverage: all 17 declarations present exactly once; all 15 ids dispatch with a status inside their own declared vocabulary; SMA and EMA distinct; RSI bounded 0..100; MACD histogram identity; ATR percent identity; ADX bounds; Bollinger bracket; participation proxy lineage with `actorIdentified === false`; single participation family; volume-profile value-area bracket with `restingLiquidityClaimed === false`; VWAP monotonic bands; pivot confirmed/provisional separation; relative-strength spread and `incompatible` on mixed policies; insufficient history to `unavailable`; out-of-bounds parameter refusal; byte-identical determinism on repeat; unknown-id refusal; rejected-claim refusal; ungrounded-claim refusal; complete claim records; two members one vote; opposing to unstable; strength casts no vote; qualifying is not unavailable; raw method count exceeds cluster count; family denominators sum to clusterCount.

### TP-02-02

Command: `node scripts/validate-technical-analysis-decision.mjs`

```
[tad-validator] browser-suite-no-fake-live-claims=PASS
[tad-validator] selftest-marker-boundary-exact=PASS
[tad-validator] checks=55
[tad-validator] result=PASS
[tad-validator] END Scope 01 capability foundation
```

The declaration-count check no longer hardcodes a literal; it derives the expected count from the Scope 01 and Scope 02 name lists, so adding a declaration without listing it fails. New checks: `scope02-production-declarations-17-exact`, `scope02-technique-output-vocabulary-parity`, `scope02-technique-family-cluster-parity`, `scope02-technique-claim-reference-parity`, `scope02-technique-family-reference-parity`, `scope02-claim-ledger-record-completeness`, `scope02-rejected-claim-cannot-activate-a-technique`, `scope02-unknown-technique-id-refused`.

### TP-02-03

Command: `npx --no-install playwright test tests/technical-analysis-decision-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-007-009 breakout volume supports one proxy family without actor identity" --reporter=list`

```
[SCN-007-009] participationMethods=4 clusterVotes=1
[SCN-007-009] relativeVolume=expanding ratio=4.161
[SCN-007-009] actorIdentified=false
[SCN-007-009] proxy=ohlcv-volume-transform
[SCN-007-009] familyState=supports
  ✓  5 [system-chrome] › Regression: SCN-007-009 breakout volume supports one proxy family without actor identity
```

### TP-02-04

Command: `npx --no-install playwright test tests/technical-analysis-decision-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-007-010 correlated indicators count once and raw count is not confidence" --reporter=list`

```
[SCN-007-010] rawMethods=15 independentClusterVotes=11
[SCN-007-010] movingAverageMembers=ema-stack/v1,sma-stack/v1 vote=1
[SCN-007-010] macdCluster=ema-momentum rsiCluster=bounded-momentum
[SCN-007-010] countPresentedAsConfidence=false
[SCN-007-010] rawMethodsInspectable=true
  ✓  6 [system-chrome] › Regression: SCN-007-010 correlated indicators count once and raw count is not confidence
```

### TP-02-05

Command: `npx --no-install playwright test tests/technical-analysis-decision-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-007-011 unresolved range preserves competing phase hypotheses and no long trigger" --reporter=list`

```
[SCN-007-011] pivotState=range
[SCN-007-011] trendFilters=unstable supports=1 contradicts=1
[SCN-007-011] competingHypothesesVisible=true
[SCN-007-011] setupPublished=false
[SCN-007-011] longTriggerPublished=false
  ✓  7 [system-chrome] › Regression: SCN-007-011 unresolved range preserves competing phase hypotheses and no long trigger
```

### TP-02-06

Command: `npx --no-install playwright test tests/technical-analysis-decision-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-007-031 ungrounded transcript claim stays rejected across model and copy" --reporter=list`

```
[SCN-007-031] rejectedClaims=claim-hidden-actor
[SCN-007-031] techniquesCitingRejected=0
[SCN-007-031] probeRefused=true code=TAD-CLAIM-REJECTED
[SCN-007-031] ledgerNamesRequiredEvidence=true
[SCN-007-031] universalEdgeOrHiddenActorCopy=absent
  ✓  8 [system-chrome] › Regression: SCN-007-031 ungrounded transcript claim stays rejected across model and copy
```

### TP-02-07

Command: `npx --no-install playwright test tests/technical-analysis-decision-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`

```
[Feature-007-canary] legacyRldataBytesEqual=true
[Feature-007-canary] qualifiedRows=2
[Feature-007-canary] credentialApi=preserved
[Feature-007-canary] rlvalidDeclarations=7
[Feature-007-canary] strategyParity=true
  ✓  9 [system-chrome] › Regression: Feature 007 qualified series and RLVALID preserve legacy shared behavior (1.7s)

  9 passed (12.6s)
```

All 5 Scope 01 titles and the shared-behavior canary remain green alongside the 4 new Scope 02 titles.

Broader repository suite, run alone after the scope was complete:

```
# tests 853
# pass 825
# fail 28
```

28 failures match the pre-existing baseline (stale registry-count pins in Features 002 and 012) and are unchanged by this scope. An earlier run reported 29 while a second suite was executing concurrently; the clean solo run above is the accurate figure.

## Scenario Contract Evidence

### Scenario SCN-007-009

Series `breakout-participation` closes beyond its base boundary on expanding volume. `relative-volume/v1` reads `expanding` at ratio 4.161; `obv/v1` `confirms`; `cmf/v1` `positive`; `effort-result/v1` `confirms`. All four declare `proxy=ohlcv-volume-transform` and `actorIdentified=false`, and `effort-result` additionally declares `motiveInferred=false`.

The four methods sit in one family and one cluster, so `participation-proxy` reports `methodCount=4, clusterCount=1, supports=1`. Participation supports the breakout **once**. The visible page states "No participant identity is inferred", and the reading surface matches no actor vocabulary (`institution|smart money|whale|dark pool|accumulating by|who is buying`).

### Scenario SCN-007-010

Series `correlated-uptrend` produces `sma-stack=stacked-up`, `ema-stack=stacked-up`, `macd=positive`, `adx-dmi=strong-plus` simultaneously. The `moving-average` cluster holds exactly `[ema-stack/v1, sma-stack/v1]` with `memberCount=2` and `|vote|=1`. MACD stays in `ema-momentum` and RSI in `bounded-momentum` rather than merging.

The page publishes `rawMethodCount=15` and `independentClusterCount=11` and names the largest cluster as casting one vote. The reading surface matches no count-as-confidence phrasing.

### Scenario SCN-007-011

Series `unresolved-range` declines then ranges without a completed spring, sign of strength, or confirmed break. `closing-pivots/v1` reads `range` — neither `break-candidate` nor `reversal-confirmed`. `trend-filters` reports `supports=1, contradicts=1, state=unstable`: the moving-average cluster and the directional-movement cluster genuinely disagree, and that disagreement is preserved rather than resolved.

The page lists every family's competing counts and states that contradicting and unstable readings "remain visible and are not resolved away". `setupPublished=false` and `probabilityPublished=false`; the reading surface matches no long-trigger phrasing.

### Scenario SCN-007-031

`claim-hidden-actor` carries verdict `rejected`, tier D, and allowed treatment "audit-only rejected record". Zero committed techniques cite it. The live probe dispatches a method citing it and receives `TAD-CLAIM-REJECTED`, which the page reports along with the evidence required for reconsideration.

The disclosure surface (claim ledger and probe) **names** the rejected idea, because naming it is how the tool reports that it is rejected. The reading surface must never assert it. The test enforces exactly that split, and bans only the affirmative form — the page is required to print "No resting liquidity is claimed", so a polarity-blind word ban would have failed the tool for making the disclaimer it must make.

## Coverage Report

All 17 owned declarations execute: `tadSmaSeries`, `tadEmaSeries`, `tadAtrSeries`, `tadRsiSeries`, `tadMacdSeries`, `tadBollingerSeries`, `tadAdxDmiSeries`, `tadObvSeries`, `tadCmfSeries`, `tadRelativeVolume`, `tadEffortResult`, `tadVolumeProfile`, `tadVwapEnvelope`, `tadPivots`, `tadRelativeStrength`, `tadEvaluateTechnique`, `tadClusterEvidenceFamilies`. Five shared helpers (`tadTechniqueOutcome`, `tadTechniqueRefusal`, `tadTechniqueColumns`, `tadEmaValues`, `tadWilderValues`) are declared once and reused rather than copied per technique.

Branches covered: formula happy paths for all 15 ids; insufficient-history `unavailable` with reason; non-finite input refusal; out-of-bounds parameter refusal; unknown-id refusal; vocabulary violation refusal; ungrounded, rejected, and incomplete claim refusals; mixed adjustment/session `incompatible`; deterministic byte-identical repeat; cluster single-vote, opposing-unstable, qualifying-not-unavailable, and denominator separation.

## Lint And Quality

- `git diff --check` — clean.
- `node scripts/audit-reader-legibility.mjs` — `pages audited: 26   with view tabs: 26   errored: 0   total leaks: 0`.
- Reader-legibility caught a genuine leak during execution: the string "Scope 02" reached the Power view. Framework scope vocabulary was removed from all reader-facing copy and replaced with "this page". Re-run returned 0 leaks.
- No-interception scan: the 4 new browser tests use no `page.route`, `context.route`, `intercept`, `msw`, or `nock`. They load the real page from the spec's own static server and read the real DOM.
- No silent-pass patterns: every new test asserts unconditionally; there are no early returns and no `if (!x) return` guards.

## Adversarial Verification

Four controlled breaks, each confirmed present in source before running and reverted afterwards:

| Break | Edit | Result |
| --- | --- | --- |
| Actor identification | `actorIdentified: false` to `true` (4 sites) | Only SCN-007-009 failed |
| Vote inflation | every cluster member votes separately | SCN-007-009 and SCN-007-010 failed; both assert cluster collapse, so both correctly detect it |
| Hypothesis collapse | `supports && contradicts` yields `"supports"` instead of `"unstable"` | Only SCN-007-011 failed |
| Claim admission disabled | verdict check forced to `false` | Only SCN-007-031 failed |

`grep -c 'CONTROLLED BREAK'` returned 0 after restore, and the full sweep returned green.

## Spot-Check Recommendations

- Confirm the directional map still excludes strength, location, and context states; re-admitting any of them silently converts a volatility or participation reading into a directional opinion.
- Confirm `tadEvaluateTechnique` still dispatches from a closed literal map and never reads `definition.formula` as code.
- Confirm the reading/disclosure split in the browser tests: the ledger must be free to name a rejected claim, and the reading surface must never assert one.
- Confirm `qualifying` has not been folded back into `unavailable`.

## Validation Summary

Deferred to the validation owner. Execution recorded the commands, results, and observed states above without asserting a validation verdict.

## Audit Verdict

Deferred to the audit owner. No audit verdict is claimed by execution.

## Uncertainty Declarations

**Implementation preceded assertions for the engine itself.** The scope declares a scenario-first TDD contract. For the 17 engine declarations the implementation was written before the unit assertions, so no genuine pre-implementation RED record exists for TP-02-01. The RED evidence that does exist is the controlled-break kind recorded above, which proves each assertion fails when its property is removed. That is weaker than a true scenario-first RED and is recorded rather than presented as equivalent. The four browser rows (TP-02-03 to TP-02-06) did fail before their supporting page surfaces existed, and the two defects in the Decision Record were both found by assertions failing against real behavior.

**Analytic series only.** Scope 02 readings are computed over deterministic constructed series, not source-qualified market observations. The fixture declares `liveClaim: false` and the page band reads "TEST FIXTURE - ANALYTIC DETERMINISTIC". No reading here is evidence about any real instrument.

**`vwap-envelope/v1` runs on daily bars.** Its declared `requiredInputs` is `qualified-intraday-ohlcv`, and the analytic fixture is daily. The method computes and returns a status, so the eligibility contract between `requiredInputs` and the supplied interval is not yet enforced by dispatch. That enforcement belongs to the eligibility work in a later scope; it is recorded here as a known gap rather than silently accepted.
