# Design: BUG-009 Risk Mutation Assertion Origin

## Design Brief

### Current State

`F008-RISK-INPUT-001` mutates the unsupported-holding branch in
`rlportfolioanalytics.js#assetTreatment`. The registry maps it to a broad
`riskXRayProjection()` title. The selected mutant title fails at a later
property access with `ERR_TEST_FAILURE`, so the strict assertion-origin check
rejects it.

### Target State

One focused title calls exported `assetTreatment()` directly, observes the
exact mixed-input contract, and fails through `ERR_ASSERTION` under the
unchanged mutation. Only the registry title mapping changes.

### Patterns To Follow

- Use the real exported function.
- Keep the fixture minimal and mixed: one listed holding and one unsupported
  holding.
- Assert complete values rather than object existence.
- Make the first assertion distinguish the early-return mutant.
- Preserve the full registry and strict causality predicate.

### Patterns To Avoid

- Do not route through the whole risk projection.
- Do not accept a thrown runtime error as discrimination.
- Do not modify product source to make the title fail.
- Do not change the anchor, injector, or other mappings.
- Do not absorb concurrent dirty work.

## Root Cause Analysis

### Investigation Summary

Current-session execution established two facts:

1. The focused strict registry exits `1` with 60 source-output lines and names
   only `F008-RISK-INPUT-001`.
2. Running the mapped risk title under only that mutation exits `1` at
   `tests/portfolio-risk.functional.mjs:94` with
   `Cannot read properties of undefined (reading 'state')`, code
   `ERR_TEST_FAILURE`, and name `TypeError`.

Current-tree inspection establishes that:

- the registry mutation replaces the `excluded.push(...)` branch with an
  early return
- `assetTreatment()` normally returns state, market inclusion, named
  exclusions, and look-through diagnostics
- `assetTreatment` is exported
- the mapped title calls `riskXRayProjection()` and later reads
  `projection.assetTreatment.lookThrough.state`
- the strict causality helper requires the selected title, `not ok 1`, and
  `ERR_ASSERTION`

### Root Cause

The mutation mapping selects a test at the wrong abstraction level. The broad
title verifies many risk outputs and assumes `assetTreatment()` returned its
normal nested shape. The early-return mutant violates that assumption before a
direct unsupported-holding assertion runs. This produces incidental runtime
failure rather than causal contract failure.

### Impact Analysis

- Affected components: one functional carrier title and one registry title
  mapping
- Affected product data: none
- Affected users: none directly; this is test-certification integrity
- Certification impact: strict `SCN-008-054` cannot pass

## Fix Design

### Focused Carrier

Add this exact title to `tests/portfolio-risk.functional.mjs`:

`BUG-009 risk mapping: unsupported holdings remain named exclusions`

Call `RLPA.assetTreatment()` with:

- listed holding `AAA`, id `listed`, weight `0.6`, and complete declared
  look-through
- unsupported holding `UNKNOWN`, id `unsupported`, weight `0.4`, and
  `assetType: "unresolved"`

Directly assert:

- `state` is `ok`
- `marketBased` is `["AAA"]`
- `excludedFromMarketAnalytics` is
  `[{ symbol: "UNKNOWN", assetType: "unresolved" }]`
- look-through state is `partial`
- covered ids are `["listed"]`
- missing ids are `["unsupported"]`
- covered weight is `0.6`
- uncovered weight is `0.4`

The early-return mutant makes the first state assertion fail with
`ERR_ASSERTION`. No downstream property access is needed to discriminate.

### Registry Remap

In the `F008-RISK-INPUT-001` entry, change only `title` from the current
`SCN-008-047` whole-projection title to the new BUG-009 title.

Preserve these fields exactly:

- `finding`
- `scope`
- `defect`
- `module`
- `find`
- `replace`
- `carrier`
- `intendedHook`

### Failure Causality Contract

The repair is acceptable only when:

- shipped title discovers one test, passes one, and exits zero
- mutant title discovers one test, fails one, and exits nonzero
- the mutation applies exactly once to `rlportfolioanalytics.js`
- the declared hook remains `Module._compile`
- TAP names the exact BUG-009 title as `not ok 1`
- output carries `ERR_ASSERTION`
- output carries no injector, preload, setup, anchor, syntax, module-load, or
  downstream `TypeError` substitute

## Change Containment

The implementation transaction contains only:

- one new title in `tests/portfolio-risk.functional.mjs`
- one title remap in `tests/portfolio-test-integrity.unit.mjs`
- phase-owned BUG-009 packet updates

The product module remains an inspected production owner, not an implementation
file for this repair.

## Shared Infrastructure Impact Sweep

The mutation registry is shared infrastructure. The complete three-test file
must remain green after the remap. All 18 mappings retain exact application,
title cardinality, and assertion-origin enforcement.

The injector remains byte-equivalent. Rollback reverts only the focused title
and one mapping value.

## Consumer Impact Sweep

| Consumer | Required outcome |
| --- | --- |
| Focused `assetTreatment()` carrier | Shipped GREEN and exact mutation `ERR_ASSERTION` RED. |
| Full risk functional carrier | All risk-input and diagnostic titles remain green. |
| Risk analytics unit carrier | Existing analytics calculations remain green. |
| Risk browser carrier | Existing user-visible Risk X-Ray behavior remains green. |
| Full Feature 008 browser matrix | No cross-surface regression. |
| Strict 18-case registry | Three outer tests and all 18 causal cases remain green. |
| Canonical selftest | Repository invariants remain green. |
| Fixed canonical G028 scanner | No implementation-reality finding is introduced. |

## Regression Design

### Persistent Before-Fix RED

The exact focused strict-registry command is already RED with one finding. Keep
that current-session capture in `report.md`.

### Focused Shipped GREEN

Run only the new title against shipped source. Require one test, one pass, zero
failures, zero skips, and zero todos.

### Focused Mutation RED

Run the same title under the unchanged injector environment and source
substitution. Require one failed test and `ERR_ASSERTION`. Explicitly reject
`TypeError` and `ERR_TEST_FAILURE` as the discrimination signal.

### Full Registry GREEN

Run all of `tests/portfolio-test-integrity.unit.mjs`. Require three tests, three
passes, and all 18 per-case mutation obligations satisfied.

### Broader Regression

Run the full risk carrier, relevant Node carriers, risk browser carrier, full
Feature 008 browser matrix, canonical selftest, regression-quality guard,
canonical fixed G028 scanner, and packet gates.

## Alternatives Considered

1. Accept the current `TypeError` as mutation RED. Rejected because it does not
   prove the selected protective assertion.
2. Add assertions to the broad projection title. Rejected because unrelated
   projection structure can still fail before the exact contract assertion.
3. Change the product function to preserve shape under the mutant. Rejected
   because the product implementation is correct and the mutant represents the
   defect.
4. Relax the registry to accept `ERR_TEST_FAILURE`. Rejected because that would
   reopen infrastructure-rubble certification.
5. Change the mutation anchor. Rejected because current execution proves the
   anchor applies once through the intended hook.

## Complexity Tracking

None - the simplest viable fix is one direct test and one title remap.