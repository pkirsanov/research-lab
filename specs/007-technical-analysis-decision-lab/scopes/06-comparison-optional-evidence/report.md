# Scope 06 Report: Comparison And Optional Evidence

Evidence contract: [scope.md](scope.md), [spec.md](../../spec.md), [scope index](../_index.md), and [uservalidation.md](../../uservalidation.md).

**Evidence status:** Execution complete. Every command below was run in this session and the output is copied verbatim.

## Summary

Four comparison roles — broad-market, sector/industry, direct-peer, and optional-context — are constructed, aligned, evaluated, and reported separately. `tadBuildComparisonSet` freezes membership with rationale and classification provenance into a content-addressed identity; `tadBuildComparisonEvidence` evaluates each role over the Scope 02 `tadRelativeStrength` technique and the foundation's `tadAlignSeries`, deriving no ratio of its own.

Relative weakness is surfaced as a contradiction rather than blended into a single number. A peer percentile exists only at or above the declared minimum denominator; below it the named pairwise ratios survive and the percentile is withheld. No comparator is ever auto-replaced.

## Decision Record

**D-06-1 — role separation is structural, not presentational.** Each role reports only its own declared members (`symbolIds`), so a sector reading can never stand in for a peer reading even when one role is unavailable. The four roles are evaluated in a fixed declared order.

**D-06-2 — Dow's industrial/transport rule is not generalized.** That rule was a claim about two specific averages. The page carries the disclaimer, the committed `claimLedger` records the limitation and its allowed treatment, and `dowEquivalenceClaimed` is a published `false` rather than an absence a reader has to infer.

**D-06-3 — every behaviour-bearing field is inside the identity digest.** Membership (including role, rationale, classification source, and as-of), normalization, currency/session/adjustment policy, minimum denominator, and decision vintage all enter `digestPayload`. Anything omitted could change a published result without changing its identity, which is precisely what would let a stale validation passport survive a real change.

**D-06-4 — declared membership order is part of the identity.** Reversing the declared order produces a distinct identity rather than being silently normalized, because the order is what the user declared and a passport is attached to a declaration.

**D-06-5 — raw-price similarity is refused, not approximated.** `normalizationId` must equal the policy's `total-return-ratio`; a raw-price request is refused with `TAD-COMPARISON-NORMALIZATION`.

## Completion Statement

All five Test Plan rows executed with recorded output. All Definition of Done items are checked with inline evidence. Two controlled breaks were applied to real source, confirmed present, detected by both the selftest and the browser layer, and restored. Scope 06 is Done.

## Code Diff Evidence

One marker-bounded block in the Feature 007 page holds all four declarations, one UI band, one render path, one fixture, one selftest sub-block, and two browser regressions. No owner page was touched in this scope.

```
$ node /tmp/f7-syntax-check.mjs technical-analysis-decision-lab.html
ok   technical-analysis-decision-lab.html  inlineScripts=2  ownerReadMarkers=0
RESULT: all inline scripts compile
```

## Test Evidence

### TP-06-01

```
$ node scripts/selftest.mjs
================================================
Research-Lab self-test: 1897 passed, 0 failed
================================================
```

Baseline entering this scope was 1863 passed / 0 failed, so Scope 06 adds 34 assertions and breaks none.

### TP-06-02

```
$ node scripts/validate-technical-analysis-decision.mjs
[tad-validator] scope05-adapter-declarations-4-exact=PASS
[tad-validator] scope06-comparison-declarations-4-exact=PASS
[tad-validator] checks=153
[tad-validator] result=PASS
```

Baseline was 133 checks. The declaration inventory is derived from the scope name lists, so the four new comparison declarations had to be registered explicitly.

### TP-06-03, TP-06-04

```
$ npx --no-install playwright test tests/technical-analysis-decision-lab.spec.mjs \
    --config=playwright.config.mjs --project=system-chrome \
    --grep 'SCN-007-014|SCN-007-028' --reporter=list

Running 2 tests using 1 worker

  ✓  1 Regression: SCN-007-014 market sector and peer roles expose relative weakness separately (742ms)
[SCN-007-028] baseline=tad-comparison:184fbcceb4ce60f distinctIdentities=4
  ✓  2 Regression: SCN-007-028 comparison membership change creates a new variant and preserves prior validation (470ms)

  2 passed (3.6s)
```

### TP-06-05

```
$ npx --no-install playwright test tests/technical-analysis-decision-lab.spec.mjs \
    --config=playwright.config.mjs --project=system-chrome --reporter=list
[Feature-007-owner] market-heatmap-lab=published truth=current
[Feature-007-owner] sector-research-lab=published truth=unavailable
[Feature-007-owner] seededPublication=true closedCoverage=836 liveOwnersPublished=4
[Feature-007-owner] strategyValidationParity=true rlvalidKeys=7
  ✓  25 Regression: Feature 007 owner integrations preserve source cutoffs limitations and existing reads (32.5s)
  ✓  26 Regression: SCN-007-014 market sector and peer roles expose relative weakness separately (917ms)
[SCN-007-028] baseline=tad-comparison:184fbcceb4ce60f distinctIdentities=4
  ✓  27 Regression: SCN-007-028 comparison membership change creates a new variant and preserves prior validation (748ms)

  27 passed (58.5s)
```

The Scope 05 owner matrix ran inside this same cumulative suite and stayed green, which is the required owner-read canary: no owner page was edited in Scope 06 and none regressed.

## Scenario Contract Evidence

### Scenario SCN-007-014

The subject rises 20% while market (+30%), sector (+28%), and all three peers (+22% to +26%) rise more, and optional context rises less (+10%). All four roles are reported separately and in declared order; market, sector, and peer each read `relative-weakness` while optional context reads `confirms-strength` on its own terms. Three contradictions are published rather than blended into one score. Each role's `symbolIds` contains only its own declared members. Ratios are normalized total return and every peer ratio is below 1. The Dow disclaimer is asserted present, and the affirmative equivalence claim is banned with negative lookbehind so the disclaimer itself cannot satisfy the ban.

### Scenario SCN-007-028

Four declared memberships produce four distinct `comparisonSetId` values and four distinct `membershipDigest` values. Reclassifying one peer as optional context changes the identity even though the symbol set is unchanged, and it correctly lowers the peer denominator to 2 so the percentile is withheld. The prior validation record stays attached to the baseline identity only, asserted both in the diagnostics and in the visible variant text. The selftest additionally proves that an added member, a removed member, a changed rationale, a changed classification as-of, a changed decision vintage, and a changed denominator policy each create a distinct identity, while an unchanged request reproduces its identity so a passport stays attached.

## Coverage Report

Comparison-set construction, member field requirements, role registration, decision vintage, policy contract, normalization refusal, timestamp alignment, role separation, relative weakness as contradiction, normalized ratios, denominator threshold in both directions, incompatibility exclusion by exact reason, no auto-replacement, unavailable roles, identity change across six behaviour-bearing dimensions, identity stability for an unchanged request, and declared-order sensitivity are each covered by at least one selftest assertion. The validator additionally pins the committed policy, the closed role order, the digest payload composition, the percentile gate, the exclusion reasons, the fixture shape, and the Dow claim-ledger entry. Both scenarios are covered by a browser regression asserting user-visible text.

## Lint And Quality

```
$ node scripts/audit-reader-legibility.mjs
pages audited: 27   with view tabs: 27   errored: 0   total leaks: 0
```

## Spot-Check Recommendations

Open `technical-analysis-decision-lab.html?fixture=comparison-roles` and read the Comparison roles band: four roles reported separately with their own members, the peer denominator against its minimum, the withheld percentile in the thin and incompatible situations, the named exclusion reasons, and four distinct identities in the membership-change list.

## Validation Summary

All five Test Plan rows executed with recorded output. Selftest 1897/0, validator 153 checks PASS, focused browser regressions 2/2, cumulative Feature 007 browser suite 27/27, reader legibility 0 leaks across 27 pages.

## Audit Verdict

One correctness issue was caught before it could ship, by checking the contract rather than assuming it.

**A-06-1 — the technique outcome shape was assumed and was wrong.** The first draft of `tadEvaluateComparisonRole` read `outcome.admitted`, `outcome.state`, and `outcome.detail`. The real `tadTechniqueOutcome` returns `{ok, techniqueId, familyId, clusterId, status, metrics, errors}`. Every comparator would have been excluded as `relative-strength-unavailable`, so every role would have reported `unavailable` and the whole band would have looked plausibly empty rather than broken. Found by reading the actual declaration before running anything, and corrected to `outcome.ok`, `outcome.status`, and `outcome.metrics`.

### Adversarial verification

Both breaks were confirmed present with `grep -c 'CONTROLLED BREAK'` before their run.

| Break | Change | Detected by |
| --- | --- | --- |
| E | percentile gate lowered from the declared minimum to 1 | selftest `Below the minimum denominator no peer percentile is published` and `Excluding comparators lowers the denominator rather than substituting replacements`; browser SCN-007-014 |
| F | membership digest drops rationale and classification provenance | selftest `A changed classification as-of creates a distinct comparison identity` and `A changed rationale creates a distinct comparison identity`; browser SCN-007-028 |

Break F is the important one: without it, a reclassification or a corrected rationale would have produced the SAME identity, so a prior validation passport would have silently survived a real membership change. Both breaks were detected at both the unit and browser layers. Restored tree re-verified at `breaks: 0`, selftest 1897/0, validator 153 PASS.

## Uncertainty Declarations

1. **Comparison evidence is not yet wired into the five gates.** Scope 06 publishes role outcomes and contradictions on their own band. Feeding those contradictions into the Scope 04 gate inputs is not part of this scope's Test Plan and has not been done; the gate band still runs from its own fixture. This is the same composition gap Scope 04 declared honestly and it remains open.

2. **Optional option and microstructure evidence is rendered by the Scope 05 band, not re-rendered here.** Implementation item 8 asks for compatible option positioning to appear as a separately labelled optional family. The Scope 05 owner-admission band already renders exactly that, with snapshot, convention, and assumptions visible and the unavailable footprint/depth/large-trade records intact, and Scope 06 adds no second copy. Duplicating it would have created two surfaces that could disagree.

3. **Comparator series in the fixture are analytic, not source-qualified market data.** Closes are explicit integers chosen so every ratio and denominator is reproducible by hand. This proves the calculation and the identity rules; it does not exercise a real vendor's alignment or vintage behaviour.
