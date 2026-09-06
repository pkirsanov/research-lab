# BUG-009 Expected Behavior Specification

## Problem Statement

Feature 008's strict mutation registry requires every applied mutation to fail
one selected test through that test's protective assertion. The sole remaining
finding, `F008-RISK-INPUT-001`, currently selects a whole-projection title whose
mutant failure is a downstream `TypeError`.

This specification repairs mutation-to-assertion causality. It does not change
product behavior, public contracts, risk calculations, persisted data, or the
mutation infrastructure.

## Outcome Contract

**Intent:** Make `F008-RISK-INPUT-001` prove that a persistent test directly
protects unsupported-holding treatment.

**Success Signal:** A focused `assetTreatment()` title passes on shipped source
and fails with `ERR_ASSERTION` under the exact registered mutation. The complete
strict registry then runs three outer tests green and certifies all 18 mutation
cases.

**Hard Constraints:**

- Preserve all 18 mutation cases.
- Preserve the exact `F008-RISK-INPUT-001` `find`, `replace`, module, scope,
  carrier, and intended hook.
- Remap only the selected title for `F008-RISK-INPUT-001`.
- Call the exported production `assetTreatment()` function directly.
- Assert the named unsupported holding and a concrete look-through result.
- Require one shipped pass and one mutant `ERR_ASSERTION` failure.
- Reject injector, preload, setup, anchor, syntax, module-load, and runtime
  property-access failures as mutation proof.
- Keep product source, injector code, other mappings, BUG-007, BUG-008, parent
  Feature 008 artifacts, and concurrent dirty paths unchanged.
- Keep human acceptance unclaimed.

**Failure Condition:** The repair fails if the focused title is absent, broad,
green under mutation, red for a non-assertion reason, or accompanied by a
change outside the declared test-only boundary.

## Requirements

### FR-B009-001 - Focused direct carrier

Add exactly one persistent title,
`BUG-009 risk mapping: unsupported holdings remain named exclusions`, in
`tests/portfolio-risk.functional.mjs` that calls the real exported
`RLPA.assetTreatment()` function directly.

### FR-B009-002 - Mixed input is explicit

The fixture must contain at least one listed holding and one unsupported
holding. The test must not reach the contract indirectly through
`riskXRayProjection()`.

### FR-B009-003 - Exact shipped assertions

The focused title must directly assert:

- `state === "ok"`
- `marketBased` contains the listed symbol
- `excludedFromMarketAnalytics` contains the unsupported symbol and its
  `assetType`
- look-through is `partial`
- covered and missing holding ids, plus covered and uncovered weight, reflect
  the fixture

### FR-B009-004 - Assertion-origin mutation RED

Under the unchanged `F008-RISK-INPUT-001` mutation, the focused title must run
exactly once and fail with `ERR_ASSERTION`. A `TypeError` or
`ERR_TEST_FAILURE` cannot satisfy this requirement.

### FR-B009-005 - One mapping changes

Only the `title` value for `F008-RISK-INPUT-001` may change in the strict
registry. The anchor, replacement, carrier, hook, finding id, scope, and other
17 entries remain byte-equivalent.

### FR-B009-006 - Complete registry certification

The full `tests/portfolio-test-integrity.unit.mjs` file must execute three outer
tests green. All 18 source mutations must apply once through their declared
hook, and each selected mutant title must fail once through `ERR_ASSERTION`.

### FR-B009-007 - Regression containment

The focused title, complete risk carrier, relevant Node carriers, risk browser
carrier, broader Feature 008 browser matrix, canonical selftest, adversarial
regression guard, canonical fixed G028 scanner, and packet gates must pass.

### FR-B009-008 - Human acceptance remains separate

The repair changes test infrastructure only. Automation must not claim human
acceptance or check the human-owned acceptance item.

## Acceptance Criteria

| ID | Criterion | Planned verification |
| --- | --- | --- |
| AC-1 | The pre-fix strict registry is RED with only `F008-RISK-INPUT-001`. | `TP-B009-000` |
| AC-2 | The focused title is GREEN on shipped source. | `TP-B009-001` |
| AC-3 | The exact mutation makes that title RED through `ERR_ASSERTION`. | `TP-B009-002` |
| AC-4 | The complete strict registry is 3/3 GREEN with all 18 cases causal. | `TP-B009-003` |
| AC-5 | Risk and broader carriers remain green. | `TP-B009-004` through `TP-B009-008` |
| AC-6 | Adversarial, G028, and packet gates remain green. | `TP-B009-009` through `TP-B009-011` |

## Product Principle Alignment

### Admission Test

The repair improves the measurement of decision quality. It makes the claimed
protection of mixed portfolio risk treatment causal rather than incidental.

### P23 - A guard that cannot fail is not a guard

The current title does fail, but for infrastructure rubble rather than the
represented contract. P23 requires the exact unsupported-holding assertion to
fail when the defect is injected.

### Current And Planned Behavior

Current product behavior remains unchanged. The planned work adds one focused
test and remaps one mutation title.

## Release Train

Not applicable. Research Lab has no release-train registry or train-specific
feature-flag bundle. This bug introduces no feature flag.

## Human Acceptance

No user-visible behavior changes. Human acceptance is unclaimed and recorded as
N/A until a human confirms that disposition.

## Non-Goals

- Changing `assetTreatment()` or any product source.
- Changing the mutation anchor, replacement, injector, or causality predicate.
- Editing any of the other 17 mappings.
- Expanding the existing whole-projection title.
- Editing BUG-007, BUG-008, parent Feature 008 artifacts, or dirty paths.