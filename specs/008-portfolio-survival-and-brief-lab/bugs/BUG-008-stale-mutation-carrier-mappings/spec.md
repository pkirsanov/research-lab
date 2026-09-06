# BUG-008 Expected Behavior Specification

## Problem Statement

Feature 008 uses `tests/portfolio-test-integrity.unit.mjs` to challenge every
audited defect with an in-memory mutation. Seven current entries apply their
mutation but select a test that does not reject the represented behavior.

This bug specification repairs mutation-to-carrier causality. It does not
change any product calculation, public contract, policy value, route, or stored
data.

## Outcome Contract

**Intent:** Make every audited mutation prove that one persistent test protects
the exact represented behavior.

**Success Signal:** The complete `SCN-008-054` registry applies all 18 mutations.
Each mutation discovers exactly one selected test. The test passes on shipped
source and fails through its own assertion under the mutation. The seven named
stale mappings no longer remain green.

**Hard Constraints:**

- Keep all 18 audited mutation cases.
- Preserve each exact mutation anchor unless current execution proves the
  represented product behavior changed.
- Require exactly one applied mutation marker per case.
- Require exactly one discovered and executed selected test per case.
- Reject a mutant that exits through injector, preload, anchor, syntax, setup,
  or module-load failure.
- Reject a mutant whose selected test remains green.
- Never weaken product source to make a carrier discriminate.
- Never remove, skip, baseline, or reclassify a stale mapping as acceptable.
- Keep changes inside the registry and the smallest owning functional carrier.
- Preserve existing user-visible and calculation behavior.

**Failure Condition:** The repair fails if any mutation is missing, applies
more than once, selects zero or multiple tests, stays green, fails outside the
selected assertion, or requires a product runtime change.

## Requirements

### FR-B008-001 - One causal carrier per audited mutation

Every audited Feature 008 mutation must map to exactly one test title. The title
must execute once on shipped source and once on represented source.

### FR-B008-002 - Seven stale mappings become protective

The registry must establish causal protection for
`F008-CLEAR-TEST-001`, `F008-PATH-CONTRACT-001`,
`F008-SURVIVAL-PATH-001`, `F008-DIVERSIFICATION-001`, `F008-HEDGE-001`,
`F008-ALLOCATION-001`, and `F008-DOSSIER-001`.

### FR-B008-003 - Exact mutation anchors remain stable

The repair must retain the current seven source substitutions. A planning or
test owner may change an anchor only after execution proves that the audited
product behavior or its controlling source changed.

### FR-B008-004 - Assertion-origin failure is mandatory

An applied marker is necessary but insufficient. The mutant process must name
the selected title as failed and carry an assertion failure from that title.
Infrastructure failures cannot satisfy mutation adequacy.

### FR-B008-005 - Minimal carrier repair

For each stale mapping, select an existing title only after a mutation RED proves
it protective. Otherwise add the smallest assertion that observes the mutated
behavior in the owning functional carrier.

### FR-B008-006 - No weakening or baselining

The repair must not alter expected product behavior, relax an assertion, remove
a mutation case, skip a carrier, accept a green mutant, or add a baseline for
the seven failures.

### FR-B008-007 - Complete verification

Verification must include a persistent RED/GREEN carrier, the full 18-mutation
registry, every affected functional carrier, affected and broader Feature 008
browser regression, the canonical selftest, and adversarial integrity checks.

### FR-B008-008 - Scope 28 certification remains fail-closed

`SCN-008-054`, Scope 28, and downstream hardening cannot certify while any
audited mutation lacks a causal selected test.

## Acceptance Criteria

| ID | Criterion | Planned verification |
| --- | --- | --- |
| AC-1 | The pre-repair comprehensive registry is RED because the seven mutations remain green. | `TP-B008-000` |
| AC-2 | All 18 registry mutations apply once and fail one selected protective assertion after repair. | `TP-B008-001` |
| AC-3 | The five owning functional carriers directly assert all seven represented behaviors. | `TP-B008-002` through `TP-B008-006` |
| AC-4 | No affected user-visible Feature 008 behavior regresses. | `TP-B008-007` and `TP-B008-008` |
| AC-5 | The canonical selftest and adversarial integrity guard remain green without a baseline. | `TP-B008-009` and `TP-B008-010` |

## Product Principle Alignment

### Admission Test

The repair improves the measurement of decision quality. It restores the claim
that tests guarding portfolio decisions can detect the defects they name.

### P23 - A guard that cannot fail is not a guard

This bug is a direct violation of P23. Seven mutations reach their source
anchors while the selected tests remain green. The repair requires a RED under
each represented defect and GREEN on shipped source.

### Current And Planned Behavior

Current product behavior is not under repair. Current test infrastructure has
seven stale title-to-behavior mappings. Planned work changes only mutation
mapping and causal assertions in persistent test carriers.

## Release Train

Not applicable in this repository. Research Lab has no release-train registry
or train-specific feature-flag bundle. This bug introduces no feature flag.

## Human Acceptance

This is a test-infrastructure defect with no planned user-visible behavior
change. Repository policy still requires a human-owned checklist. Automation
must leave that checklist unchecked and must not claim acceptance.

## Non-Goals

- Changing product calculations or runtime behavior.
- Reworking the shared injector coordination repaired for `HARDEN-B007-001`.
- Replacing the complete mutation registry with a smaller sample.
- Weakening exact mutation anchors or selected carrier expectations.
- Editing BUG-007 or parent Feature 008 planning and evidence artifacts.
