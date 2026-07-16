# Scope 02: Mandate And Cash-Need Authority

Planning authority: [spec.md](../../spec.md), [design.md](../../design.md), and the [scope index](../_index.md). Execution evidence belongs in [report.md](report.md).

**Status:** Not Started

**Scope-Kind:** runtime-behavior

**Tags:** `foundation:true`, `privacy-critical:true`, `vertical-slice:true`

**Depends On:** Scope 01 - Private Portfolio Import And Atomic Store

**Primary Outcome:** A user can enter and atomically confirm an explicit mandate, constraints, and dated cash needs; every dependent route state cites that revision, and absent or conflicting inputs stay absent/infeasible without inferred goals or hidden values.

## Requirement Coverage

- **Functional:** FR-011 through FR-016.
- **Non-functional:** NFR-003, NFR-005, NFR-007, NFR-012, and NFR-022.
- **Cross-cutting:** FR-017, FR-022, FR-033, and the no-advice/no-behavior-authority constraints are mechanically rechecked.

## Gherkin Scenarios

### SCN-008-003 - Explicit mandate owns hard constraints

```gherkin
Scenario: Dated cash needs and constraints come only from user input
  Given the user explicitly enters a horizon, a dated cash need, and allocation bounds
  When survival and allocation analyses run
  Then every affected result cites those user-entered constraints
  And behavior history does not add, remove, or modify a constraint
  And missing mandate fields remain absent rather than inferred
```

### SCN-008-004 - No mandate means no goal-fit claim

```gherkin
Scenario: A portfolio can be researched before goals are entered
  Given a valid local portfolio exists
  But no valid mandate or cash need exists
  When the user opens Risk X-Ray, Path Lab, or Allocation Comparison
  Then descriptive distributions and comparisons may be shown
  And goal-fit and survival-to-goal states are unavailable with an explicit reason
  And no default goal, risk tolerance, or liquidity need is invented
```

## UI Scenario Matrix

| Scenario | Preconditions | User Steps | Exact Visible Result | Test Type |
|----------|---------------|------------|----------------------|-----------|
| SCN-008-003 explicit authority | Current portfolio; mandate absent or editable | Enter horizon, units, hard/research classification, constraints, dated need; confirm | One `MandateRevision/v1` is cited by Path and Allocation previews; behavior contributes to none of its fields | e2e-ui |
| SCN-008-004 research-only | Current portfolio; no valid mandate/survival condition | Visit `#risk-xray`, `#path-lab`, and `#allocation` | Descriptive results remain available; goal fit and survival show exact unavailable reason with no inferred floor/tolerance/horizon | e2e-ui |
| Conflicting constraints | Explicit minimums, maximums, exclusions, liquidity/cash rules conflict | Submit mandate draft and inspect impact preview | Conflict remains visible, no constraint is relaxed, and current portfolio/mandate identity remains unchanged until explicit correction | e2e-ui |

## Implementation Plan

1. Extend `rlportfolio.js` with exact `MandateRevision/v1`, `CashNeed/v1`, survival-definition, cost-policy, expected-return-policy, explicit constraint, hard/research classification, input-authority, currency, date, priority, and chronological ordering validation.
2. Preserve absence as `null`; do not prefill horizon, floor, objective, liquidity, cost, risk aversion, expected return, or cash need from holdings, behavior, settings, route state, or production fallback.
3. Add mandate/cash-need editor and impact preview to the existing bounded sheet. Validate units, dates, past needs, mixed currency/FX requirements, amount/fraction basis, timing policy, and visible conflict sets before atomic confirmation.
4. Project the same confirmed revision into Risk X-Ray, Path Lab, and Allocation Comparison shell states: descriptive research can render without a mandate, while goal-fit/survival and constraint-dependent conclusions remain unavailable.
5. Make every mandate change create a new WorkspaceIdentity input and supersede dependent result identities without mutating the current portfolio or any prior dossier record.
6. Add unit/functional and real-route assertions using deterministic mandate/cash-need fixtures; behavior fixtures deliberately support unrelated domains to prove they cannot change constraints.

## Change Boundary And Rollback

**Allowed files:** `rlportfolio.js`, `portfolio-survival-allocation-lab.html`, `portfolio-survival-allocation.config.json`, `tests/portfolio-foundation.unit.mjs`, `tests/portfolio-privacy.functional.mjs`, `tests/portfolio-survival-foundation.spec.mjs`, and Scope 02 fixture entries under `tests/fixtures/portfolio-survival-allocation/**`.

**Explicitly excluded:** all shared runtime modules, generic Market Brief surfaces, registries/docs, analytics implementation beyond explicit unavailable/input projection, behavior relevance calculations, package/source-lock files, Feature 001-007 work, and unrelated tools/tests.

**Rollback/restore:** remove only Scope 02 marker-bounded contract/editor/test additions. Reopen the Scope 01 valid portfolio and prove its current revision, import, storage, and privacy behavior are byte-equivalent; no mandate rollback deletes or rewrites portfolio data.

## Scenario-First Red/Green Contract

Add each named assertion and persistent title before mandate behavior. Execute every row through `.github/bubbles/scripts/tool-log.sh` with the Feature 008 spec, `SCOPE-02`, `TP-*`, and red/green tags. RED must identify missing explicit authority or an invented-value defect; rerun the identical command after the smallest owned change.

## Test Plan

| ID | Type | Category | Scenario | File / Location | Exact Behavior / Persistent Title | Command | Live System | Evidence Anchor |
|----|------|----------|----------|-----------------|-----------------------------------|---------|-------------|-----------------|
| TP-02-01 | Unit | unit | SCN-008-003, SCN-008-004 | `tests/portfolio-foundation.unit.mjs` | Validate mandate/cash-need keys, units, dates, currencies, hard/research authority, null absence, conflict preservation, deterministic revision identity, and behavior/settings exclusion through production functions | `node --test tests/portfolio-foundation.unit.mjs` | No | `report.md#tp-02-01` |
| TP-02-02 | Functional | functional | SCN-008-003, SCN-008-004 | `tests/portfolio-privacy.functional.mjs` | Commit/reload explicit mandate revisions, preserve portfolio generation semantics, project the same constraints to all consumers, and prove absent/conflicting fields never acquire defaults | `node --test tests/portfolio-privacy.functional.mjs` | No | `report.md#tp-02-02` |
| TP-02-03 | Regression E2E | e2e-ui | SCN-008-003 | `tests/portfolio-survival-foundation.spec.mjs` | `Regression: SCN-008-003 explicit mandate alone supplies every hard constraint` | `npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-003 explicit mandate alone supplies every hard constraint" --reporter=list` | Yes | `report.md#scenario-scn-008-003` |
| TP-02-04 | Regression E2E | e2e-ui | SCN-008-004 | `tests/portfolio-survival-foundation.spec.mjs` | `Regression: SCN-008-004 no mandate leaves goal fit and survival unavailable` | `npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-004 no mandate leaves goal fit and survival unavailable" --reporter=list` | Yes | `report.md#scenario-scn-008-004` |
| TP-02-05 | Broader Regression E2E | e2e-ui | SCN-008-001 through SCN-008-004 | `tests/portfolio-survival-foundation.spec.mjs` | Execute the cumulative foundation browser suite and prove mandate additions preserve Scope 01 import/storage behavior | `npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes | `report.md#tp-02-05` |

### Definition of Done

#### Core Delivery Items

- [ ] FR-011 through FR-016 are fully implemented with explicit purpose, units, hard/research authority, dates, amounts, currencies, priorities, treatment, unchanged candidate propagation, and loud infeasibility without constraint relaxation.
- [ ] NFR-003, NFR-005, NFR-007, NFR-012, and NFR-022 are satisfied by provenance, missing-state integrity, atomic revisions, latest-complete identity publication, and adjacent research/advice boundaries.
- [ ] FR-017, FR-022, and FR-033 checks prove user entries remain user entries and behavior/settings cannot create or modify mandate, cash need, expected return, floor, objective, or constraint state.
- [ ] Scope 01 import/storage behavior remains unchanged, rollback is exact, and every Scope 02 behavior has intended RED and same-command GREEN evidence.

#### Test Evidence Items - Exact Parity With 5 Test Plan Rows

- [ ] TP-02-01 unit evidence proves closed mandate/cash-need authority, absence, identity, conflicts, and behavior/settings exclusion.
- [ ] TP-02-02 functional evidence proves atomic mandate round trips and one unchanged constraint set across every consumer.
- [ ] TP-02-03 Regression E2E evidence proves SCN-008-003 displays only explicit user-entered hard constraints across dependent route states.
- [ ] TP-02-04 Regression E2E evidence proves SCN-008-004 retains descriptive research and shows unavailable goal fit/survival with no hidden values.
- [ ] TP-02-05 broader E2E evidence proves the cumulative foundation route remains green after mandate/cash-need behavior lands.

#### Build Quality Gate

- [ ] Focused RED/GREEN records, mandate/config parity, authority/forbidden-input scans, exact rollback, no-interception/external-request scan, source-lock/runner checks, editor diagnostics, `git diff --check`, artifact lint/freshness, G094, Test Plan/DoD parity, plan sync, and traceability are current and clean with every finding individually accounted for in `report.md`.
