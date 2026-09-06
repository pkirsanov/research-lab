# BUG-008: Stale Mutation Carrier Mappings

**Status:** Confirmed from current-tree inspection and inherited diagnostic input
**Severity:** High
**Reported:** 2026-08-26
**Source finding:** `B008-MAPPING-001`
**Feature:** `specs/008-portfolio-survival-and-brief-lab`
**Affected module:** `tests/portfolio-test-integrity.unit.mjs`

## Summary

The comprehensive `SCN-008-054` mutation registry applies all 18 registered
Feature 008 mutations. Seven entries select tests that stay green after their
mutation is applied. Those tests do not assert the behavior changed by the
registered mutation.

The earlier shared-injector coordination defect caused mutation runs to fail
inside the injector. That failure masked these seven stale mappings. Once the
injector reaches the selected carrier cleanly, the selected tests expose no
causal assertion for these mutations:

1. `F008-CLEAR-TEST-001`
2. `F008-PATH-CONTRACT-001`
3. `F008-SURVIVAL-PATH-001`
4. `F008-DIVERSIFICATION-001`
5. `F008-HEDGE-001`
6. `F008-ALLOCATION-001`
7. `F008-DOSSIER-001`

## Severity

High. The test-integrity gate falsely certified seven audited defect classes as
load-bearing. A regression in any represented behavior could therefore pass the
integrity suite while the registry reports that the mutation was applied.

The product runtime is not the root cause. Current inspection found each exact
mutation anchor in its production module. The defect is the stale relationship
between a mutation and its selected protective title.

## Reproduction

1. Start from the current working tree after the shared injector coordination
   repair for `HARDEN-B007-001`.
2. Run `timeout 240 node --test tests/portfolio-test-integrity.unit.mjs`.
3. Confirm that Node discovers three outer tests.
4. Confirm that two tests pass and the comprehensive `SCN-008-054` registry
   test fails.
5. Inspect the comprehensive registry result.
6. Confirm that all 18 mutations report an applied marker.
7. Confirm that the seven findings listed above select tests that remain green.

This filing did not rerun the product test command. The result above is
operator-supplied current-session diagnostic input. `report.md` keeps that
provenance separate from commands executed by this filing.

## Expected Behavior

Every audited mutation maps to exactly one selected test that exercises the
represented defect. The shipped test must pass. The same test must fail through
its own protective assertion when the mutation is applied.

A mutation that remains green must fail the integrity suite. It cannot certify
Scope 28 or any downstream hardening phase.

## Actual Behavior

The applied marker proves that the mutation reached an in-memory source copy.
It does not prove that the selected title asserts the mutated behavior. Seven
selected titles remain green, so the registry cannot establish the claimed
causal protection for those findings.

## Environment

- Repository: Research Lab
- Feature: `008-portfolio-survival-and-brief-lab`
- Platform: Linux
- Runtime: Node test runner
- Filing base: `42a568957de196e1ffbafd1aabe5cf06c514f1a1`
- Working tree: concurrent Feature 008 source, test, scope, report, state, and
  root test-plan changes are present and excluded from this packet

## Diagnostic Result

The following is a diagnostic summary supplied by the operator. It is not raw
output captured by this filing agent.

```text
command: timeout 240 node --test tests/portfolio-test-integrity.unit.mjs
outer tests: 3
passed: 2
failed: 1
comprehensive registry: failed
registered mutations applied: 18 of 18
selected tests that stayed green: 7
F008-CLEAR-TEST-001
F008-PATH-CONTRACT-001
F008-SURVIVAL-PATH-001
F008-DIVERSIFICATION-001
F008-HEDGE-001
F008-ALLOCATION-001
F008-DOSSIER-001
```

## Root Cause

Each failing registry entry points at a valid mutation anchor, but its selected
test checks a neighboring contract or only output shape. The registry currently
treats title discovery, shipped GREEN, and an applied marker as prerequisites.
The selected title still needs a causal assertion that becomes RED under the
represented defect.

The seven concrete mismatches are documented in `design.md#mapping-analysis`.

## Proposed Resolution

For each stale mapping, first search the owning functional carrier for a title
that already rejects the exact mutation. Select it only after a RED mutation run
proves causality. If no such title exists, add the smallest persistent assertion
to the owning carrier.

Preserve every current mutation anchor unless execution proves that the audited
behavior changed. Do not weaken product source, remove a registry case, accept
an infrastructure failure, or baseline a green mutant.

## Change Boundary

This filing changes only the new BUG-008 packet. Delivery may change the
registry and these five owning functional carriers:

- `tests/portfolio-test-integrity.unit.mjs`
- `tests/portfolio-privacy.functional.mjs`
- `tests/portfolio-paths.functional.mjs`
- `tests/portfolio-diversification.functional.mjs`
- `tests/portfolio-allocation.functional.mjs`
- `tests/portfolio-dossier.functional.mjs`

Product source, the shared injector, BUG-007, and parent Feature 008 artifacts
remain excluded unless a new grounded finding changes the ownership boundary.

## Related

- Parent feature: `specs/008-portfolio-survival-and-brief-lab`
- Parent scenario: `SCN-008-054`
- Parent Test Plan row: `TP-28-04`
- Prior injector finding:
  `../BUG-007-compose-brief-prototype-sensitive-keys/report.md#harden-b007-001`
- Fix design: `design.md`
- Fix scope: `scopes.md`
