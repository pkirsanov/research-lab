# BUG-009: Risk Mutation Assertion Origin

**Status:** Confirmed by current-session execution
**Severity:** High
**Reported:** 2026-08-27
**Source finding:** `F008-RISK-INPUT-001`
**Feature:** `specs/008-portfolio-survival-and-brief-lab`
**Affected tests:** `tests/portfolio-test-integrity.unit.mjs` and `tests/portfolio-risk.functional.mjs`

## Summary

The strict Feature 008 mutation registry now applies all 18 source mutations
exactly once through their declared hook. Seventeen selected carriers fail
causally. `F008-RISK-INPUT-001` is the sole remaining finding because its
selected whole-projection title fails through a downstream `TypeError` rather
than through the protective assertion required by the registry.

The risk mutation changes `assetTreatment()` from naming an unsupported holding
in `excludedFromMarketAnalytics` to returning early with
`{ state: "unsupported-holding", symbol }`. The current mapped title exercises
the larger `riskXRayProjection()` result. It reaches
`projection.assetTreatment.lookThrough.state` after the mutation has removed
the expected nested shape, so Node reports `ERR_TEST_FAILURE` rather than
`ERR_ASSERTION`.

## Severity

High. Strict mutation certification cannot pass, and the current title does not
prove that the exact partial-risk-input contract is protected. Counting its
runtime rubble would weaken the assertion-origin rule repaired by the injector
causality work.

## Reproduction

1. Start from commit `7c0c5d64e`, which follows injector-causality commit
   `82d1db5e5` and contains the seven BUG-008 carrier repairs.
2. Run the exact focused strict-registry command in
   `report.md#current-session-strict-registry-red`.
3. Confirm exit `1`, 60 source-output lines, and only
   `F008-RISK-INPUT-001` in the finding list.
4. Run the selected risk title under only the registered mutation, as captured
   in `report.md#selected-title-mutant-origin`.
5. Confirm the title fails at `tests/portfolio-risk.functional.mjs:94` with a
   `TypeError`, code `ERR_TEST_FAILURE`, while reading `lookThrough.state`.

## Expected Behavior

`F008-RISK-INPUT-001` must select one focused test that calls the exported real
`assetTreatment()` function. On shipped source, that test must assert:

- top-level state `ok`
- the listed holding remains in `marketBased`
- the unsupported holding is named in `excludedFromMarketAnalytics`
- look-through remains partial and names its covered and missing holding ids

Under the exact registered mutation, the same title must fail through
`ERR_ASSERTION`. The full strict registry must then pass all three outer tests
and all 18 causal mutation cases.

## Actual Behavior

The current selected title calls `riskXRayProjection()`. Under mutation it
reaches a downstream property access after `assetTreatment()` returns the
wrong shape. The title fails, but not through a protective assertion. The
strict registry correctly rejects that failure origin.

## Environment

- Repository: Research Lab
- Platform: Linux
- Runtime: Node test runner
- Filing base: `7c0c5d64e`
- Injector-causality prerequisite: `82d1db5e5`
- Seven-carrier prerequisite: `7c0c5d64e`
- Working tree: concurrent source, test, BUG-007, and parent Feature 008 changes
  exist and are excluded from this packet

## Root Cause

The mutation-to-carrier mapping is too broad. It selects a title that validates
the whole risk projection rather than the exported function and exact value
changed by `F008-RISK-INPUT-001`. The mutant therefore destroys a nested shape
before the title reaches a direct assertion for unsupported-holding treatment.

The strict registry's assertion-origin predicate is working as designed. The
defect is the selected title, not the product implementation, mutation anchor,
injector, or causality predicate.

## Proposed Resolution

Add one focused title in `tests/portfolio-risk.functional.mjs`:

`BUG-009 risk mapping: unsupported holdings remain named exclusions`

The title calls `RLPA.assetTreatment()` with one listed holding and one
unsupported holding. It directly asserts state, market inclusion, the named
exclusion row, and the partial look-through result. Remap only
`F008-RISK-INPUT-001` to that title in
`tests/portfolio-test-integrity.unit.mjs`.

## Change Boundary

Allowed delivery paths:

- `tests/portfolio-risk.functional.mjs`
- the `title` field of `F008-RISK-INPUT-001` in
  `tests/portfolio-test-integrity.unit.mjs`
- phase-owned updates inside this BUG-009 packet

Excluded paths:

- all product source, including `rlportfolioanalytics.js`
- `tests/portfolio-defect-injector.cjs`
- the mutation anchor and replacement for `F008-RISK-INPUT-001`
- the other 17 mutation mappings
- BUG-007, BUG-008, and every parent Feature 008 artifact
- every concurrent dirty path

## Related

- Parent feature: `specs/008-portfolio-survival-and-brief-lab`
- Parent scenario: `SCN-008-054`
- Current broad carrier: `SCN-008-047 mixed portfolio freezes one cutoff and composes partial structured risk output`
- Fix design: [design.md](design.md)
- Fix scope: [scopes.md](scopes.md)
- Evidence: [report.md](report.md)