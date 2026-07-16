# Scope 08: Accepted Browser State And Proposal Decisions

Planning authority: [spec.md](../../spec.md), [design.md](../../design.md), and the [scope index](../_index.md). Execution evidence belongs in [report.md](report.md).

**Status:** Not Started

**Scope-Kind:** runtime-behavior

**Tags:** `foundation:true`, `accepted-state:true`, `user-authority:true`, `privacy:true`, `ui:true`

**Depends On:** Scope 07 - Linked Model Families And Scenario Computation

**Primary Outcome:** One accepted browser state enforces latest-company publication identity and keeps local user revisions separate from source refresh; evidence proposals remain pending until explicit accept/edit confirmation and rejection remains auditable without changing the active scenario.

## Requirement Coverage

- **Functional:** FR-010-078, FR-010-079, and the company-switch isolation portion of FR-010-091.
- **Non-functional:** NFR-010-019.
- **Primary scenarios:** SCN-010-013 and SCN-010-023.

## Gherkin Scenarios

### SCN-010-013 - Evidence Refresh Preserves User Assumptions

```gherkin
Scenario: A newer publication cannot overwrite a local accepted scenario
  Given local scenario revision U3 is active for the same company and model definition
  When a newer hash-valid company publication is accepted
  Then U3 values and revision identity remain active without rebasing
  And affected drivers receive separate ModelImpactProposal/v1 records requiring a user decision
```

### SCN-010-023 - Proposal Acceptance

```gherkin
Scenario: A model-impact proposal applies only after explicit confirmation
  Given active scenario revision R4 and a validated pending proposal target one assumption
  When the proposal arrives or the user opens it
  Then R4 remains active and unchanged
  When the user accepts or edits and confirms the proposal
  Then a new immutable revision R5 is created and rejection instead records a decision with no revision change
```

## UI Scenario Matrix

| Scenario | Preconditions | Steps | Exact user-visible result | Test Type |
| --- | --- | --- | --- | --- |
| SCN-010-013 | Local accepted revision matches company/model and newer publication is valid | Accept refresh; inspect active scenario and proposals; reload | Same revision/values remain active; proposals are separate; no silent rebase or cross-company state | e2e-ui |
| SCN-010-023 | Active revision and validated pending proposal exist | Open proposal; accept/edit-confirm/reject on separate runs | Arrival does nothing; confirm creates exactly one child revision; reject records decision and leaves revision unchanged | e2e-ui |

## Implementation Plan

1. Implement `CompanyAcceptedState/v1` and pure reducers for company selection, publication acceptance, market observation, display, draft edits, saved revisions, proposal decisions, and sanitized receipts.
2. `selectCompany` increments request sequence and clears all prior-company values immediately. Publication acceptance requires matching requested identity, generation, manifest/object hashes, and required summary refs; stale async responses cannot overwrite newer selection.
3. Store only schema/display preference, last company ID, per-company user scenario revisions, active local revision ID, and proposal decisions in `localStorage.rlCompanyUserStateV1`. Store no filings, source facts, restricted text, credentials, account/position/cost/P&L data, or unpublished notes.
4. Restore a local revision only when company ID, dossier cutoff, and model definition version match. A mismatch remains inactive for explicit review and cannot silently rebase.
5. Implement proposal arrival, review, edit, confirm, and reject contracts. Arrival cannot focus, announce interruptively, mutate draft/active assumptions, or create history. Confirmation creates one immutable child revision; rejection retains evidence/decision with no revision change.
6. Extend the Model/Simple proposal UI with exact affected assumptions, direction/range, rationale, support/conflict, confidence, invalidation, and three real buttons plus confirmation/focus-return behavior.

## Shared Infrastructure Impact Sweep

| Surface | Downstream contract at risk | Independent canary before broad tests | Rollback unit |
| --- | --- | --- | --- |
| Browser local storage namespace | Other company/user-state keys and prior-company isolation | Seed unrelated keys and two company states; prove only exact Feature 010 company-bound records change | `rlCompanyUserStateV1` reducer/storage block only |
| Async publication loader | Request ordering and last-valid same-company state | Race two companies/generations on the real static server without interception and assert latest request identity | Scope-owned request sequence/acceptance functions only |

## Change Boundary And Rollback

**Allowed:** accepted-state reducers/controller, non-sensitive Feature 010 local persistence, proposal/revision UI, diagnostics, and scope-owned tests.

**Excluded:** source/public object mutation, automatic proposal application, personalized context, Feature 002/browser scheduled authority, auth/session/payment storage, registry/navigation, and unrelated localStorage namespaces.

**Rollback:** reverse only Scope 08 reducer/controller/UI/test hunks. Existing local scenario records remain inert and versioned; rollback never deletes user state silently or changes public publication pointers.

## Scenario-First Red/Green Contract

Author race, cross-company leak, no-rebase, no-arrival-mutation, exact child revision, rejection, focus, and storage-privacy assertions first. Tests compare pre/post production state fingerprints rather than asserting a fixture-authored decision value.

## Test Plan

| ID | Type | Category | Scenario | File / Location | Exact behavior / persistent title | Command | Live System |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TP-08-01 | Unit | unit | SCN-010-013, SCN-010-023 | `tests/company-fundamentals-state.unit.mjs` | Production reducers enforce request identity, no-rebase, revision lineage, proposal decisions, and safe local schema | `node --test tests/company-fundamentals-state.unit.mjs` | No |
| TP-08-02 | State integration | integration | SCN-010-013, SCN-010-023 | `tests/company-fundamentals-state.integration.mjs` | Real static publication races plus browser storage round trips preserve company isolation and exact active revision | `node --test tests/company-fundamentals-state.integration.mjs` | Yes |
| TP-08-03 | Regression E2E | e2e-ui | SCN-010-013 | `tests/company-fundamentals-lab.spec.mjs` | `Regression: SCN-010-013 evidence refresh preserves accepted user assumptions and creates pending proposals only` | `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-010-013 evidence refresh preserves accepted user assumptions and creates pending proposals only" --reporter=list` | Yes |
| TP-08-04 | Regression E2E | e2e-ui | SCN-010-023 | `tests/company-fundamentals-lab.spec.mjs` | `Regression: SCN-010-023 proposal arrival is inert and confirmation alone creates a new scenario revision` | `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-010-023 proposal arrival is inert and confirmation alone creates a new scenario revision" --reporter=list` | Yes |
| TP-08-05 | Broader Regression E2E | e2e-ui | SCN-010-013, SCN-010-023 | `tests/company-fundamentals-lab.spec.mjs` | Complete cumulative Feature 010 browser suite through Scope 08 | `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |

### Definition of Done

#### Core Delivery Items

- [ ] FR-010-078, FR-010-079, the company-switch isolation portion of FR-010-091, and NFR-010-019 are implemented through one accepted state and explicit user-owned revision transitions.
- [ ] SCN-010-013 and SCN-010-023 prove refresh, race, accept/edit/reject, revision lineage, focus, and safe persistence behavior without automatic application.
- [ ] Shared Infrastructure Impact Sweep proves company/request/storage isolation and a precise rollback boundary.
- [ ] Scenario-specific E2E regression coverage exists for every Scope 08 user-visible behavior and the broader E2E suite passes.
- [ ] Scenario-first RED and identical-command GREEN evidence exists for every Scope 08 behavior.

#### Test Evidence Items - Exact Parity With 5 Test Plan Rows

- [ ] TP-08-01 unit evidence proves accepted-state, request, revision, proposal, and storage production reducers.
- [ ] TP-08-02 integration evidence proves real publication race and storage round-trip isolation.
- [ ] TP-08-03 Regression E2E evidence proves SCN-010-013.
- [ ] TP-08-04 Regression E2E evidence proves SCN-010-023 across accept/edit/reject paths.
- [ ] TP-08-05 broader E2E evidence proves cumulative behavior through Scope 08.

#### Build Quality Gate

- [ ] Exact RED/GREEN ledger, pre/post state fingerprints, request-race and cross-company matrix, sensitive-storage scan, no-auto-apply scan, focus/live-region checks, editor diagnostics, `git diff --check`, selftest, validator, artifact lint, G094 capability check, framework write guard, and changed-path classification are current and every finding is individually accounted for in `report.md`.
