# BUG-008 Scopes

**Layout:** single-file
**Mode:** `bugfix-fastlane`
**Packet status:** `in_progress`
**Next required owner:** `bubbles.plan`

[Spec](spec.md) | [Design](design.md) | [Report](report.md) |
[User validation](uservalidation.md) |
[Scenario manifest](scenario-manifest.json) |
[Structured Test Plan](test-plan.json)

This filing changes no product source, persistent test, BUG-007 artifact, or
parent Feature 008 artifact.

## Execution Outline

### Phase Order

1. **Scope 1 - Restore Mutation Mapping Causality:** reconcile the initial
   filing plan, record the exact comprehensive registry RED, prove or replace
   each of the seven stale title mappings, run all five focused carriers, then
   run the full registry, browser regressions, canonical selftest, adversarial
   integrity checks, and validation gates.

### Validation Checkpoints

1. The comprehensive registry RED applies all 18 mutations and names the seven
   selected titles that remain green.
2. Each candidate remap first proves shipped GREEN and mutation RED.
3. Each assertion addition observes the exact mutated value or state.
4. Every mutant fails through the selected title's assertion, not through test
   infrastructure.
5. Full mutation, affected functional, browser, selftest, packet, and
   transition checks remain required before certification.

| Scope | Outcome | Planned test paths | Status |
| --- | --- | --- | --- |
| 1 | Make all seven stale mutation mappings causally protective | `tests/portfolio-test-integrity.unit.mjs` plus five affected functional carriers | Not Started |

## Scope 1 - Restore Mutation Mapping Causality

**Scope ID:** `01-restore-mutation-mapping-causality`
**Status:** Not Started
**Depends On:** -
**Finding:** `B008-MAPPING-001`
**Execution dependency:** `bubbles.plan` -> `bubbles.test` (RED) ->
`bubbles.test` (carrier repair and GREEN) -> quality phases ->
`bubbles.validate`

### Implementation Files

| Path | Planned role |
| --- | --- |
| `tests/portfolio-test-integrity.unit.mjs` | Preserve the 18-case registry and update only the seven stale title mappings after causal proof. |
| `tests/portfolio-privacy.functional.mjs` | Assert the public-exclusion inventory for `F008-CLEAR-TEST-001`. |
| `tests/portfolio-paths.functional.mjs` | Assert direct token identity rejection and exact dated cash-need scheduling. |
| `tests/portfolio-diversification.functional.mjs` | Assert qualified Forbes-Rigobon output and aligned excess-return sample refusal. |
| `tests/portfolio-allocation.functional.mjs` | Reuse or add the exact constraint-feasibility assertion that becomes RED when constraints are dropped. |
| `tests/portfolio-dossier.functional.mjs` | Assert incomplete decision-fold request refusal. |

### Change Boundary

Allowed changes are limited to the six test paths above and phase-owned BUG-008
packet updates.

Excluded changes include all product source, the shared defect injector,
BUG-007, parent Feature 008 artifacts, and unrelated tests. A grounded need for
an excluded path must return to planning before any edit.

### Shared Infrastructure Impact Sweep

The full 18-mutation registry is mandatory after every mapping repair. It must
retain one case per audited finding, one marker application per case, one
selected test per case, and assertion-origin failure under every mutation.

The shared injector remains byte-identical. Rollback reverts only the registry
mapping and focused carrier assertions.

### Consumer Impact Sweep

| Consumer | Required outcome |
| --- | --- |
| Scope 28 `SCN-008-054` | All audited defects are load-bearing again. |
| Privacy carrier | Public exclusions are observed separately from personal deletion. |
| Path carrier | Stale identity and dated cash-need behavior are both causal. |
| Diversification carrier | Qualified adjustment and hedge sample contracts are causal. |
| Allocation carrier | Declared constraints can make a named candidate infeasible. |
| Dossier carrier | Incomplete fold requests fail their exact contract. |
| Feature 008 browser surface | Existing behavior remains unchanged. |

### Gherkin Scenario

```gherkin
Scenario: SCN-B008-MUTATION-MAPPING-CAUSALITY
  Given the complete 18-case Feature 008 mutation registry
  And every mutation retains its audited source anchor
  And each case names exactly one persistent protective title
  When the selected title runs on shipped source and its represented mutation
  Then the shipped title passes once
  And the mutation is applied exactly once
  And the same title fails once through its protective assertion
  And no injector preload setup anchor syntax or module-load failure counts as protection
  And no mutation remains green or becomes baselined skipped or removed
```

### UI Scenario Matrix

No new user-visible behavior is planned. Existing Feature 008 browser carriers
serve as regression coverage for accidental product-test weakening.

### Implementation Plan

1. Reconcile this initial packet under `bubbles.plan` without changing the
   exact seven mutation anchors.
2. Rerun the comprehensive title and record the persistent RED with all seven
   green mutant mappings named.
3. For each mapping, try a grounded existing title and retain it only after the
   mutation makes that title fail through `ERR_ASSERTION`.
4. If no existing title is protective, add one exact assertion to the owning
   functional carrier.
5. Run each affected carrier on shipped source after its assertion change.
6. Run the full 18-case mutation registry and all three outer integrity tests.
7. Run affected and broader Feature 008 browser regressions.
8. Run the canonical selftest and adversarial integrity guard.
9. Run packet and transition guards before validate-owned certification.

### Test Plan

| Plan ID | Test Type | Category | Live system | Persistent file | Required behavior | Command | State |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `TP-B008-000` | Scenario-first pre-fix RED | `unit` | No | `tests/portfolio-test-integrity.unit.mjs` | The complete registry applies all 18 mutations and fails because the seven named mappings remain green. | `timeout 240 node --test --test-name-pattern="^Adversarial: SCN-008-054 every audited Feature 008 defect class remains load-bearing$" tests/portfolio-test-integrity.unit.mjs` | Planned for owner re-execution; inherited diagnostic reports RED |
| `TP-B008-001` | Full mutation registry GREEN | `unit` | No | `tests/portfolio-test-integrity.unit.mjs` | All three outer tests pass; all 18 registry entries apply once and fail one selected assertion under mutation. | `timeout 240 node --test tests/portfolio-test-integrity.unit.mjs` | Planned, not executed by this filing |
| `TP-B008-002` | Clear mapping functional carrier | `functional` | No | `tests/portfolio-privacy.functional.mjs` | Public exclusion recording becomes a direct assertion and the mutation makes its selected title RED. | `timeout 240 node --test tests/portfolio-privacy.functional.mjs` | Planned, not executed by this filing |
| `TP-B008-003` | Path mappings functional carrier | `functional` | No | `tests/portfolio-paths.functional.mjs` | Token identity mismatch and dated cash-need scheduling have separate causal assertions. | `timeout 240 node --test tests/portfolio-paths.functional.mjs` | Planned, not executed by this filing |
| `TP-B008-004` | Diversification mappings functional carrier | `functional` | No | `tests/portfolio-diversification.functional.mjs` | Qualified Forbes-Rigobon output and aligned excess-return sample refusal have causal assertions. | `timeout 240 node --test tests/portfolio-diversification.functional.mjs` | Planned, not executed by this filing |
| `TP-B008-005` | Allocation mapping functional carrier | `functional` | No | `tests/portfolio-allocation.functional.mjs` | A declared cap produces the exact named infeasible candidate and the dropped-constraints mutation fails. | `timeout 240 node --test tests/portfolio-allocation.functional.mjs` | Planned, not executed by this filing |
| `TP-B008-006` | Dossier mapping functional carrier | `functional` | No | `tests/portfolio-dossier.functional.mjs` | An incomplete decision-fold request returns `request-invalid` and the acceptance mutation fails. | `timeout 240 node --test tests/portfolio-dossier.functional.mjs` | Planned, not executed by this filing |
| `TP-B008-007` | Scenario-specific Regression E2E | `e2e-ui` | Yes | affected Feature 008 browser carriers | Existing visible privacy, path, diversification, allocation, and dossier behavior remains unchanged. | `timeout 1800 npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs tests/portfolio-survival-paths.spec.mjs tests/portfolio-survival-diversification.spec.mjs tests/portfolio-survival-allocation.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Planned, not executed by this filing |
| `TP-B008-008` | Broader Regression E2E | `e2e-ui` | Yes | all Feature 008 browser carriers | The complete Feature 008 route matrix remains green. | `timeout 1800 npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs tests/portfolio-survival-brief.spec.mjs tests/portfolio-survival-risk.spec.mjs tests/portfolio-survival-paths.spec.mjs tests/portfolio-survival-diversification.spec.mjs tests/portfolio-survival-allocation.spec.mjs tests/portfolio-survival-mobile.spec.mjs tests/portfolio-survival-accessibility.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Planned, not executed by this filing |
| `TP-B008-009` | Canonical repository selftest | `functional` | No | `scripts/selftest.mjs` | Repository invariants remain green without budget or baseline changes. | `timeout 1800 node scripts/selftest.mjs` | Planned, not executed by this filing |
| `TP-B008-010` | Adversarial integrity checks | `functional` | No | registry and five functional carriers | Bugfix regression quality finds no bailout, skip, interception, optional assertion, or tautological carrier. | `timeout 600 bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/portfolio-test-integrity.unit.mjs tests/portfolio-privacy.functional.mjs tests/portfolio-paths.functional.mjs tests/portfolio-diversification.functional.mjs tests/portfolio-allocation.functional.mjs tests/portfolio-dossier.functional.mjs` | Planned, not executed by this filing |
| `TP-B008-011` | Planning packet guards | `artifact` | No | BUG-008 packet | Artifact shape and traceability remain coherent. | `timeout 600 bash .github/bubbles/scripts/artifact-lint.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-008-stale-mutation-carrier-mappings && timeout 600 bash .github/bubbles/scripts/traceability-guard.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-008-stale-mutation-carrier-mappings` | Filing execution required |
| `TP-B008-012` | Transition guard | `guard` | No | BUG-008 packet | Completion remains blocked until RED/GREEN, all regressions, human disposition, and validate-owned certification are complete. | `timeout 600 bash .github/bubbles/scripts/state-transition-guard.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-008-stale-mutation-carrier-mappings` | Planned for final validation |

### Test Plan To DoD Parity

| Test Plan row | Primary DoD item |
| --- | --- |
| `TP-B008-000` | Persistent pre-fix registry RED is recorded |
| `TP-B008-001` | Full 18-case mutation registry passes causally |
| `TP-B008-002` | Clear carrier rejects its mutation |
| `TP-B008-003` | Path carrier rejects both mutations |
| `TP-B008-004` | Diversification carrier rejects both mutations |
| `TP-B008-005` | Allocation carrier rejects its mutation |
| `TP-B008-006` | Dossier carrier rejects its mutation |
| `TP-B008-007` | Scenario-specific E2E regression tests pass |
| `TP-B008-008` | Broader E2E regression suite passes |
| `TP-B008-009` | Canonical repository selftest passes |
| `TP-B008-010` | Adversarial integrity checks pass |
| `TP-B008-011` | Planning packet guards pass |
| `TP-B008-012` | Transition guard passes before certification |

### Definition of Done - Tiered Validation

#### Core Items

- [ ] Root cause and all seven title-to-behavior mismatches are confirmed by
  planning and test owners.
- [ ] `SCN-B008-MUTATION-MAPPING-CAUSALITY` holds: every shipped selected title
  passes once, its mutation applies exactly once, the same title fails once
  through its protective assertion, no infrastructure failure counts, and no
  mutation remains green or becomes baselined, skipped, or removed.
- [ ] The change remains inside the declared Change Boundary.
- [ ] The Shared Infrastructure Impact Sweep preserves all 18 registry cases,
  exact marker cardinality, title discovery, and assertion-origin checks.
- [ ] `TP-B008-000` records the persistent pre-fix registry RED before mapping
  or carrier repair. Evidence: `report.md#tp-b008-000`.
- [ ] `TP-B008-001` proves all three outer tests and all 18 mutation cases are
  causally GREEN. Evidence: `report.md#tp-b008-001`.
- [ ] `TP-B008-002` proves the clear carrier rejects
  `F008-CLEAR-TEST-001`. Evidence: `report.md#tp-b008-002`.
- [ ] `TP-B008-003` proves the path carrier rejects
  `F008-PATH-CONTRACT-001` and `F008-SURVIVAL-PATH-001`. Evidence:
  `report.md#tp-b008-003`.
- [ ] `TP-B008-004` proves the diversification carrier rejects
  `F008-DIVERSIFICATION-001` and `F008-HEDGE-001`. Evidence:
  `report.md#tp-b008-004`.
- [ ] `TP-B008-005` proves the allocation carrier rejects
  `F008-ALLOCATION-001`. Evidence: `report.md#tp-b008-005`.
- [ ] `TP-B008-006` proves the dossier carrier rejects
  `F008-DOSSIER-001`. Evidence: `report.md#tp-b008-006`.
- [ ] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior
  pass through `TP-B008-007`. Evidence: `report.md#tp-b008-007`.
- [ ] Broader E2E regression suite passes through `TP-B008-008`. Evidence:
  `report.md#tp-b008-008`.
- [ ] `TP-B008-009` canonical repository selftest passes without a budget or
  baseline change. Evidence: `report.md#tp-b008-009`.
- [ ] `TP-B008-010` adversarial integrity checks pass. Evidence:
  `report.md#tp-b008-010`.
- [ ] `TP-B008-011` planning packet guards pass. Evidence:
  `report.md#tp-b008-011`.
- [ ] Human acceptance disposition remains human-owned in
  `uservalidation.md`.
- [ ] `TP-B008-012` transition guard passes only after every delivery and
  certification prerequisite is complete. Evidence: `report.md#tp-b008-012`.

#### Build Quality Gate

- [ ] Build Quality Gate passes with zero skipped required tests, zero
  unresolved high findings, exact changed-path containment, current packet
  documentation, and no product-source weakening.

All items remain unchecked. This packet records diagnosis and planned work. It
does not claim implementation, test completion, human acceptance, or
certification.
