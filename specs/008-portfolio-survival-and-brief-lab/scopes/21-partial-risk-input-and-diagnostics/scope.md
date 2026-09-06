# Scope 21: Partial Risk Input And Diagnostics

Links: [spec.md](../../spec.md) | [design.md](../../design.md) | [scope index](../_index.md) | [report.md](report.md)

**Status:** In Progress
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

**Allowed file families:** the eligibility, alignment, concentration, CAPM, factor, covariance, and risk-contribution regions of `rlportfolioanalytics.js`, the Risk X-Ray regions of `portfolio-survival-allocation-lab.html`, `tests/portfolio-analytics.unit.mjs`, `tests/portfolio-risk.functional.mjs`, `tests/portfolio-survival-risk.spec.mjs`, and the risk/coverage fixtures under `tests/fixtures/portfolio-survival-allocation/**`.

**Excluded surfaces:** the storage-lifecycle regions of `rlportfolio.js`, `rlportfoliobrief.js` ranking, the path, dependence/hedge, allocation-solver, and dossier regions of `rlportfolioanalytics.js` and their carriers (`tests/portfolio-paths.functional.mjs`, `tests/portfolio-diversification.functional.mjs`, `tests/portfolio-allocation.functional.mjs`, `tests/portfolio-dossier.functional.mjs`), `rldata.js`, `rlnav.js`, `rlbrief.js`, `market-brief.*`, `scripts/brief-*`, `tools.json`, `index.html`, `README.md`, `notes/**`, `package.json`, `package-lock.json`, `specs/001-*` through `specs/007-*`, and `.github/bubbles/**`.

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
| Risk diagnostic causal authority: `riskXRayProjection` → `riskProjection` → `appendRiskXRay` → `#riskXray` | TP-21-03 exact title `Regression: SCN-008-047 mixed portfolio inputs preserve eligible risk diagnostics and partial truth` reads `#riskXray` and its `#riskStructuredDiagnostics` subtree, then asserts the partial route state, per-metric eligibility and coverage, exact-date CAGR, raw/conditioned covariance distinction, no automatic lambda increase, and identical Simple/Power structured output. |
| Risk X-Ray Simple and Power | Both render identical eligibility, coverage, covariance, factor, and reconciliation states. |
| Path, dependence, hedge, and allocation foundations | Typed aligned-return, covariance, and eligibility outputs remain consumable without route-local repair. |
| Dossier diagnostics | Raw and conditioned identities, exclusions, and uncertainty remain attributable. |

The consumer-facing surface is the `portfolio-survival-allocation-lab.html#risk-xray` deep link (`workspaceTabRiskXray`), which both Simple and Power render from. The sweep is a stale-reference scan confirming that hash, its tab id, and the typed eligibility/covariance field names stay identical for the downstream path, dependence, hedge, and allocation consumers.

## UI Scenario Matrix

| Scenario | Preconditions | Steps | Expected | Test Type |
|---|---|---|---|---|
| SCN-008-047 mixed inputs | Listed weight-only, cash, manual, one unsupported | Open Risk X-Ray Simple/Power | Eligible metrics render; exact per-result reasons remain | e2e-ui |
| SCN-008-047 covariance | Singular raw matrix and explicit conditioned matrix | Inspect contributions | Both states visible; only valid state reconciles | e2e-ui |

## Test Plan

Four rows have authored current declarations, including exact TP-21-01 through TP-21-04 titles in their named files. TP-21-05 remains an aggregate planned carrier because the named selftest file has no exact TP-21-05 declaration. This authorship reconciliation grants no execution credit.

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

- [x] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior
  - **Two facts together, 2026-08-29 (session-bound).** Existence and discrimination: all 55 manifest scenarios resolve to receipt-derived states across RED_VERIFIED → IMPLEMENTED → GREEN_TARGETED → GREEN_LIVE → REGRESSION_GREEN, so each has a carrier proven to fail when its behavior is broken. Passing: those carriers ran green inside the complete-repository suite at HEAD `1bfa922c9` — `767 passed (16.5m)`. A pass alone would not show the tests discriminate; the receipts are what make this more than a green count.
- [x] Broader E2E regression suite passes
  - **Re-verified 2026-08-29 (session-bound):** `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome` at HEAD `1bfa922c9` → `767 passed (16.5m)`, zero failures. A complete-repository pass is a superset of this scope's named broad row, so it discharges it directly.
- [ ] Scope-21 attribution covers every claimed path and marker, hunk, or whole-file ownership declaration, with no unauthorized excluded coupling. It makes no isolated-commit claim and no claim about unrelated co-committed paths. → **Resolution condition:** the Scope 21 `boundary` result from the Feature 008 verifier passes, its attributed path set is complete, and an independent audit accepts the result.
- [ ] Consumer impact sweep completed; zero stale first-party references remain → **Resolution condition:** the Scope 21 `consumer` result from the Feature 008 verifier proves non-vacuous matches for every declared canonical identifier, source surface, consumer class, and test carrier, with zero forbidden stale aliases. The focused behavior tests named in this scope's Test Plan pass, and an independent audit accepts the result.

- [x] SCN-008-047 behavior: a portfolio that combines weight-only listed assets, cash, and a manual alternative keeps every eligible holding contributing to its supported return and risk metrics, gives cash and manual alternatives explicit treatment frequency and unavailable fields, lets one unsupported holding limit only the affected metrics instead of refusing the portfolio, derives CAGR from exact elapsed dates while look-through, CAPM, covariance, and asset/factor contributions expose coverage uncertainty and reconciliation, and keeps non-positive-definite or conditioned covariance visibly distinct. Evidence: [report.md#tp-21-03](report.md#tp-21-03) — the complete Risk X-Ray carrier passes 13/13 including `SCN-008-047 mixed portfolio inputs preserve eligible risk diagnostics and partial truth` and `Risk X-Ray retains partial eligible results rather than whole-refusing`; [report.md#coverage-report](report.md#coverage-report) — six input classes across five metric families, exact elapsed CAGR, actual-frequency manual results, concentration, CAPM, proxy factors, raw/conditioned covariance, and asset/factor/return contributions; [report.md#tp-21-04](report.md#tp-21-04) — the reduced-input adversarial row cannot satisfy Risk X-Ray; [report.md#spot-check-recommendations](report.md#spot-check-recommendations) — the singular-matrix case and the `lambdaWasAutoRaised:false` assertion together keep conditioned covariance distinct from silent repair.
- [x] SCN-008-047 is implemented with partial eligibility, complete diagnostics, and no silent covariance repair. Evidence: [report.md#validation-summary](report.md#validation-summary), [report.md#red-and-green](report.md#red-and-green), [report.md#code-diff-evidence](report.md#code-diff-evidence).
- [x] TP-21-01 unit evidence passes. Evidence: [report.md#tp-21-01](report.md#tp-21-01).
- [x] TP-21-02 functional evidence passes. Evidence: [report.md#tp-21-02](report.md#tp-21-02).
- [x] TP-21-03 real-page regression passes. Evidence: [report.md#tp-21-03](report.md#tp-21-03).
- [x] TP-21-04 adversarial mutation proof rejects every audited reduced diagnostic. Evidence: [report.md#tp-21-04](report.md#tp-21-04), [report.md#red-and-green](report.md#red-and-green).
- [x] TP-21-05 broader regression passes. Evidence: [report.md#tp-21-05](report.md#tp-21-05).
- [x] Shared Infrastructure Impact Sweep and rollback proof are recorded. Evidence: [report.md#tp-21-02](report.md#tp-21-02), [report.md#validation-summary](report.md#validation-summary).
- [x] Build Quality Gate passes with zero skips/warnings and no excluded-file changes. Evidence: [report.md#lint-and-quality](report.md#lint-and-quality), [report.md#code-diff-evidence](report.md#code-diff-evidence).
