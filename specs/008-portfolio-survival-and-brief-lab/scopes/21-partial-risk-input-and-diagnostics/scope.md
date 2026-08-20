# Scope 21: Partial Risk Input And Diagnostics

Links: [spec.md](../../spec.md) | [design.md](../../design.md) | [scope index](../_index.md) | [report.md](report.md)

**Status:** Not Started
**Scope-Kind:** runtime-behavior
**Tags:** `overlay:risk`, `remediation`
**Depends On:** 20
**Entry Gate:** Every scope in `Depends On` must be Done.
**Findings:** F008-RISK-INPUT-001, F008-RISK-DIAGNOSTICS-001
**Requirements:** FR-068 through FR-085; NFR-005, NFR-021.

## Outcome

Allow each eligible holding and metric family to contribute independently, then deliver exact elapsed-time return, concentration, factor, CAPM, covariance, and contribution diagnostics without refusing the whole portfolio or silently repairing matrices.

## Gherkin Scenario And Ownership

### SCN-008-047: Mixed portfolio inputs produce complete eligible risk diagnostics

```gherkin
Scenario: A portfolio combines weight-only listed assets cash and a manual alternative
  Given each holding supplies only the evidence required by its eligible metric families
  When Risk X-Ray freezes the common cutoff and computes diagnostics
  Then valid listed and weight-only holdings contribute to every supported return and risk metric
  And cash and manual alternatives retain explicit treatment frequency and unavailable fields
  And one unsupported holding limits only affected metrics rather than refusing the portfolio
  And CAGR uses exact elapsed dates while factor look-through CAPM covariance and asset/factor contributions expose coverage uncertainty and reconciliation
  And non-positive-definite or conditioned covariance remains visibly distinct
```

## Implementation Plan

1. Implement `AssetMetricEligibility/v1` for listed weight-only, quantity/value, cash, and manual inputs across every designed metric family.
2. Refactor alignment to return per-holding and per-metric inclusion/exclusion records; aggregate state is partial when independent results remain valid.
3. Compute CAGR from first/last eligible dates, not return count, and preserve arithmetic/geometric/drag separation.
4. Add issuer/sector/factor/look-through coverage, versioned proxy factor regression, CAPM uncertainty, and missing-source states.
5. Compute asset and factor marginal/total contributions with explicit reconciliation and return contribution kept separate.
6. Preserve raw covariance diagnostics, conditioning choice, minimum-eigen/PD/condition state, and no automatic lambda escalation.

## Change Boundary

- **Allowed:** `rlportfolioanalytics.js`, risk projections in the route, Feature 008 risk/coverage fixtures, `tests/portfolio-analytics.unit.mjs`, a focused risk functional carrier, and `tests/portfolio-survival-risk.spec.mjs`.
- **Excluded:** personal storage lifecycle, brief ranking, path cash-flow engine, dependence/hedge formulas, allocation solvers, dossier persistence, registry/docs, and framework-managed files.

## Shared Infrastructure Impact Sweep

| Protected surface | Downstream contract | Canary |
|---|---|---|
| Aligned return matrix | Paths, dependence, hedge, allocation | Exact-date/missing/FX/calendar canaries remain green. |
| Covariance and factor outputs | Risk contribution and optimizers | Raw/conditioned identities and PD diagnostics are stable. |
| Partial-result vocabulary | Every analytics tab | One unsupported asset cannot erase independent results. |

## Consumer Impact Sweep

| Consumer | Required proof |
|---|---|
| Risk X-Ray Simple and Power | Both render identical eligibility, coverage, covariance, factor, and reconciliation states. |
| Path, dependence, hedge, and allocation foundations | Typed aligned-return, covariance, and eligibility outputs remain consumable without route-local repair. |
| Dossier diagnostics | Raw and conditioned identities, exclusions, and uncertainty remain attributable. |

## UI Scenario Matrix

| Scenario | Preconditions | Steps | Expected | Test Type |
|---|---|---|---|---|
| SCN-008-047 mixed inputs | Listed weight-only, cash, manual, one unsupported | Open Risk X-Ray Simple/Power | Eligible metrics render; exact per-result reasons remain | e2e-ui |
| SCN-008-047 covariance | Singular raw matrix and explicit conditioned matrix | Inspect contributions | Both states visible; only valid state reconciles | e2e-ui |

## Test Plan

Every remediation assertion and exact title below is `planned-not-authored` at P1. Existing carrier paths do not imply that the new test exists.

| ID | Test Type | Category | Scenario | File / Location | Executable Behavior | Command | Live System | Evidence |
|---|---|---|---|---|---|---|---|---|
| TP-21-01 | Unit | unit | 047 | `tests/portfolio-analytics.unit.mjs` | Eligibility matrix, elapsed-time CAGR, CAPM/factors, covariance diagnostics, and contributions | `node --test tests/portfolio-analytics.unit.mjs` | No | `report.md#tp-21-01` |
| TP-21-02 | Functional | functional | 047 | `tests/portfolio-risk.functional.mjs` | Mixed portfolio freezes one cutoff and composes partial structured risk output | `node --test tests/portfolio-risk.functional.mjs` | No | `report.md#tp-21-02` |
| TP-21-03 | Regression E2E | e2e-ui | 047 | `tests/portfolio-survival-risk.spec.mjs` | Exact title: `Regression: SCN-008-047 mixed portfolio inputs preserve eligible risk diagnostics and partial truth` | `npx --no-install playwright test tests/portfolio-survival-risk.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-047 mixed portfolio inputs preserve eligible risk diagnostics and partial truth" --reporter=list` | Yes | `report.md#tp-21-03` |
| TP-21-04 | Adversarial mutation | unit | 047 | `tests/portfolio-analytics.unit.mjs` | Disposable return-count, whole-refusal, missing-factor, and silent-conditioning mutations each fail | `node --test --test-name-pattern="Adversarial: reduced risk input and diagnostic paths cannot satisfy Risk X Ray" tests/portfolio-analytics.unit.mjs` | No | `report.md#tp-21-04` |
| TP-21-05 | Broader regression | functional | 047 | `scripts/selftest.mjs` | Existing analytics and static-site invariants remain green | `node scripts/selftest.mjs` | No | `report.md#tp-21-05` |

## Rollback And Restore

- Keep the prior aligned-return and raw covariance outputs available for exact before/after comparison during implementation.
- A failed metric-family computation returns a scoped unavailable state and retains the last valid Risk X-Ray view model.
- Revert only risk analytics, projections, fixtures, and tests; downstream path/allocation callers remain on the prior typed boundary until the new contract is green.

### Definition of Done - Tiered Validation

- [ ] SCN-008-047 is implemented with partial eligibility, complete diagnostics, and no silent covariance repair.
- [ ] TP-21-01 unit evidence passes.
- [ ] TP-21-02 functional evidence passes.
- [ ] TP-21-03 real-page regression passes.
- [ ] TP-21-04 adversarial mutation proof rejects every audited reduced diagnostic.
- [ ] TP-21-05 broader regression passes.
- [ ] Shared Infrastructure Impact Sweep and rollback proof are recorded.
- [ ] Build Quality Gate passes with zero skips/warnings and no excluded-file changes.
