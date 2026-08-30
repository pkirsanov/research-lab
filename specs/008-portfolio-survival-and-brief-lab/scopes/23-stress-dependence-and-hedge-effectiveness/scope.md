# Scope 23: Stress Dependence And Hedge Effectiveness

Links: [spec.md](../../spec.md) | [design.md](../../design.md) | [scope index](../_index.md) | [report.md](report.md)

**Status:** In Progress
**Scope-Kind:** runtime-behavior
**Tags:** `overlay:diversification`, `remediation`
**Depends On:** 22
**Entry Gate:** Every scope in `Depends On` must be Done.
**Findings:** F008-DIVERSIFICATION-001, F008-HEDGE-001
**Requirements:** FR-105 through FR-122; NFR-005, NFR-006, NFR-021.

## Outcome

Deliver distinct normal/stress/tail/appraisal diagnostics and return-regression hedge effectiveness on the same scenario basis, with intervals, costs, and no automatic diversification or hedge prescription.

## Gherkin Scenario And Ownership

### SCN-008-049: Stress diversification and hedge claims use distinct evidence and common scenarios

```gherkin
Scenario: A user evaluates diversification and hedge effectiveness across normal stress and path states
  Given tranquil and stress samples are distinct and a hedge proxy has aligned target and proxy returns
  When dependence appraisal and hedge diagnostics run on the frozen evidence and common ScenarioSpecification
  Then raw and Forbes Rigobon qualified stress estimates show sample variance orientation and intervals separately
  And tail co-exceedance downside drawdown and recovery overlap remain distinct
  And appraisal assets expose valuation age liquidity cost smoothing and de-smoothing sensitivity before a conclusion
  And hedge ratio horizon carry direct cost turnover liquidity basis regression and residual exposure are explicit
  And normal stress and path effectiveness share the same scenario basis without prescribing a personal hedge
```

## Implementation Plan

1. Define distinct named tranquil/stress/date-or-quantile samples and confidence/bootstrap interval policy.
2. Implement eligible anchor-oriented Forbes-Rigobon adjustment with unavailable reasons and no same-sample shortcut.
3. Add empirical tail, downside co-exceedance, drawdown overlap, and recovery overlap with separate counts/intervals.
4. Add appraisal quality, stale/liquidity/cost records and observed versus de-smoothed sensitivity.
5. Replace entered-vol/config-correlation basis risk with aligned target/proxy return regression and explicit residual variance.
6. Evaluate unhedged and explicit hedge-ratio variants over declared horizons, costs, normal/stress samples, and Scope 22 common paths.

## Change Boundary

**Allowed file families:** the dependence, stress-sample, and hedge-effectiveness regions of `rlportfolioanalytics.js`, the Diversification regions of `portfolio-survival-allocation-lab.html`, `tests/portfolio-analytics.unit.mjs`, `tests/portfolio-diversification.functional.mjs`, `tests/portfolio-survival-diversification.spec.mjs`, and the dependence/hedge fixtures under `tests/fixtures/portfolio-survival-allocation/**`.

**Excluded surfaces:** `rlportfolio.js` personal store, `rlportfoliobrief.js` ranking, `market-brief.*` and `scripts/brief-*`, the core path engine in `rlportfolioanalytics.js` except typed consumption, its allocation-solver regions, dossier persistence (`tests/portfolio-dossier.functional.mjs`), `rldata.js`, `rlnav.js`, `rlbrief.js`, `tools.json`, `index.html`, `README.md`, `notes/**`, `package.json`, `package-lock.json`, `specs/001-*` through `specs/007-*`, and `.github/bubbles/**`.

- **Allowed:** dependence/hedge portions of `rlportfolioanalytics.js`, Diversification route regions, related fixtures, `tests/portfolio-analytics.unit.mjs`, a focused diversification functional carrier, and `tests/portfolio-survival-diversification.spec.mjs`.
- **Excluded:** personal store, brief ranking, generic publisher, core path engine except typed consumption, allocation solvers, dossier persistence, registry/docs, and framework-managed files.

## Shared Infrastructure Impact Sweep

| Contract | Consumers | Canary |
|---|---|---|
| Stress sample identity | Dependence, hedge, dossier trials | Normal and stress memberships differ and are frozen. |
| Scenario common-random basis | Hedge and allocation comparison | Same path IDs are reused when only hedge/allocation changes. |
| Appraisal quality state | Diversification and dossier | Missing frequency/cost/liquidity blocks strong claims. |
| Hedge regression | Gross/net/path outcomes | Known regression fixture recovers coefficient and residual variance. |

## Consumer Impact Sweep

| Consumer | Required proof |
|---|---|
| Diversification Simple and Power | Raw, adjusted, tail, downside, drawdown, recovery, and appraisal states stay separate. |
| Hedge comparison | Ratio, horizon, regression, residual, cost, and common-path identities remain explicit. |
| Allocation and dossier | Qualified dependence, path, cost, and tried-variant records remain reusable without reinterpretation. |

The consumer-facing surface is the `portfolio-survival-allocation-lab.html#diversification` deep link (`workspaceTabDiversification`), which carries the Simple and Power dependence, stress, and hedge panels. The sweep is a stale-reference scan confirming that hash, its tab id, and the qualified dependence/hedge field names stay identical for the allocation and dossier consumers.

## UI Scenario Matrix

| Scenario | Preconditions | Steps | Expected | Test Type |
|---|---|---|---|---|
| SCN-008-049 stress lenses | Distinct tranquil/stress fixtures | Switch raw/adjusted/tail/downside/drawdown/recovery | Separate samples, intervals, caveats | e2e-ui |
| SCN-008-049 appraisal | Quarterly stale manual series | Inspect observed/de-smoothed rows | Quality warnings precede conclusion | e2e-ui |
| SCN-008-049 hedge | Explicit ratio/horizon/cost/proxy | Compare normal/stress/path | Regression basis and complete gross/net fields | e2e-ui |

## Test Plan

All six remediation rows are authored. Their current execution evidence is recorded in the linked Scope 23 report sections.

| ID | Test Type | Category | Scenario | File / Location | Executable Behavior | Command | Live System | Evidence |
|---|---|---|---|---|---|---|---|---|
| TP-23-01 | Unit | unit | 049 | `tests/portfolio-analytics.unit.mjs` | Distinct samples, adjustment, intervals, overlap, de-smoothing, and hedge regression identities | `node --test tests/portfolio-analytics.unit.mjs` | No | `report.md#tp-23-01` |
| TP-23-02 | Functional | functional | 049 | `tests/portfolio-diversification.functional.mjs` | Complete dependence/appraisal/hedge projection over one frozen evidence/scenario basis | `node --test tests/portfolio-diversification.functional.mjs` | No | `report.md#tp-23-02` |
| TP-23-03 | Regression E2E | e2e-ui | 049 | `tests/portfolio-survival-diversification.spec.mjs` | Exact title: `Regression: SCN-008-049 stress dependence appraisal and hedge effectiveness retain distinct qualified evidence` | `npx --no-install playwright test tests/portfolio-survival-diversification.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-049 stress dependence appraisal and hedge effectiveness retain distinct qualified evidence" --reporter=list` | Yes | `report.md#tp-23-03` |
| TP-23-04 | Adversarial mutation | unit | 049 | `tests/portfolio-analytics.unit.mjs` | Disposable same-sample, unused-adjustment, missing-overlap, fixed-ratio, and cost-free-net mutations each fail | `node --test --test-name-pattern="Adversarial: reduced diversification and hedge shortcuts cannot satisfy the contract" tests/portfolio-analytics.unit.mjs` | No | `report.md#tp-23-04` |
| TP-23-05 | Common-path regression E2E | e2e-ui | 049 | `tests/portfolio-survival-diversification.spec.mjs` | Exact title: `Regression: SCN-008-049 hedge variants reuse the selected survival scenario and path identities` | `npx --no-install playwright test tests/portfolio-survival-diversification.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-049 hedge variants reuse the selected survival scenario and path identities" --reporter=list` | Yes | `report.md#tp-23-05` |
| TP-23-06 | Broader regression | functional | 049 | `scripts/selftest.mjs` | Shared analytics and route invariants remain green | `node scripts/selftest.mjs` | No | `report.md#tp-23-06` |

## Rollback And Restore

- Preserve raw sample memberships, estimates, and prior hedge variants while new qualified results validate.
- A failed adjustment/regression/path comparison yields unavailable/partial state and cannot overwrite raw evidence or the last valid variant.
- Revert only dependence/hedge files and tests; Scope 22 scenario records remain intact.

### Definition of Done - Tiered Validation

- [x] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior
  - **Two facts together, 2026-08-29 (session-bound).** Existence and discrimination: all 55 manifest scenarios resolve to receipt-derived states across RED_VERIFIED → IMPLEMENTED → GREEN_TARGETED → GREEN_LIVE → REGRESSION_GREEN, so each has a carrier proven to fail when its behavior is broken. Passing: those carriers ran green inside the complete-repository suite at HEAD `1bfa922c9` — `767 passed (16.5m)`. A pass alone would not show the tests discriminate; the receipts are what make this more than a green count.
- [x] Broader E2E regression suite passes
  - **Re-verified 2026-08-29 (session-bound):** `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome` at HEAD `1bfa922c9` → `767 passed (16.5m)`, zero failures. A complete-repository pass is a superset of this scope's named broad row, so it discharges it directly.
- [ ] Scope-23 attribution covers every claimed path and marker, hunk, or whole-file ownership declaration, with no unauthorized excluded coupling. It makes no isolated-commit claim and no claim about unrelated co-committed paths. → **Resolution condition:** the Scope 23 `boundary` result from the Feature 008 verifier passes, its attributed path set is complete, and an independent audit accepts the result.
- [ ] Consumer impact sweep completed; zero stale first-party references remain → **Resolution condition:** the Scope 23 `consumer` result from the Feature 008 verifier proves non-vacuous matches for every declared canonical identifier, source surface, consumer class, and test carrier, with zero forbidden stale aliases. The focused behavior tests named in this scope's Test Plan pass, and an independent audit accepts the result.

- [x] SCN-008-049 behavior: a user evaluates diversification and hedge effectiveness across normal, stress, and path states, and raw and Forbes-Rigobon qualified stress estimates report sample, variance, orientation, and intervals separately, tail co-exceedance, downside, drawdown, and recovery overlap stay distinct, appraisal assets expose valuation age, liquidity, cost, smoothing, and de-smoothing sensitivity before any conclusion, hedge ratio, horizon, carry, direct cost, turnover, liquidity, basis regression, and residual exposure are explicit, and all three effectiveness states share one scenario basis without prescribing a personal hedge. Evidence: [TP-23-03 and complete carrier](report.md#tp-23-03-and-tp-23-05) — 10/10 including `SCN-008-049 stress dependence appraisal and hedge effectiveness retain distinct qualified evidence`, `SCN-008-049 hedge variants reuse the selected survival scenario and path identities`, and the sibling `SCN-008-022`/`SCN-008-024`/`SCN-008-025` rows that keep raw versus qualified adjustment, appraisal smoothing, and carry versus basis risk apart; [TP-23-01](report.md#tp-23-01) and [coverage](report.md#coverage-report) — sample identity, stress selection, raw and adjusted estimates, intervals, tail events, downside, drawdown, recovery, de-smoothing, hedge regression, costs, and opaque common paths; [TP-23-04](report.md#tp-23-04) — reduced diversification and hedge shortcuts are refused; [uncertainty declarations](report.md#uncertainty-declarations) — the route makes no personal hedge recommendation.
- [x] SCN-008-049 is implemented with distinct samples, qualified adjustment, appraisal limits, regression basis risk, costs, and common paths. Evidence: [scenario contract](report.md#scenario-contract-evidence), [coverage](report.md#coverage-report), and [real-page behavior](report.md#tp-23-03-and-tp-23-05).
- [x] TP-23-01 unit evidence passes. Evidence: [TP-23-01](report.md#tp-23-01).
- [x] TP-23-02 functional evidence passes. Evidence: [TP-23-02](report.md#tp-23-02).
- [x] TP-23-03 complete real-page regression passes. Evidence: [TP-23-03 and complete carrier](report.md#tp-23-03-and-tp-23-05).
- [x] TP-23-04 adversarial mutation proof rejects every audited shortcut. Evidence: [TP-23-04](report.md#tp-23-04).
- [x] TP-23-05 common-path real-page regression passes. Evidence: [TP-23-05 and complete carrier](report.md#tp-23-03-and-tp-23-05).
- [x] TP-23-06 broader regression passes. Evidence: [TP-23-06](report.md#tp-23-06).
- [x] Shared Infrastructure Impact Sweep and rollback proof are recorded. Evidence: [shared infrastructure and rollback](report.md#shared-infrastructure-and-rollback) and [last-valid preservation](report.md#tp-23-02).
- [x] Build Quality Gate passes with zero skips/warnings and no excluded-file changes. Evidence: [lint and quality](report.md#lint-and-quality) and [bounded code diff](report.md#code-diff-evidence).
