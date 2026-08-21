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

## UI Scenario Matrix

| Scenario | Preconditions | Steps | Expected | Test Type |
|---|---|---|---|---|
| SCN-008-049 stress lenses | Distinct tranquil/stress fixtures | Switch raw/adjusted/tail/downside/drawdown/recovery | Separate samples, intervals, caveats | e2e-ui |
| SCN-008-049 appraisal | Quarterly stale manual series | Inspect observed/de-smoothed rows | Quality warnings precede conclusion | e2e-ui |
| SCN-008-049 hedge | Explicit ratio/horizon/cost/proxy | Compare normal/stress/path | Regression basis and complete gross/net fields | e2e-ui |

## Test Plan

Every remediation assertion and exact title below is `planned-not-authored` at P1. Existing carrier paths do not imply that the new test exists.

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

- [ ] SCN-008-049 is implemented with distinct samples, qualified adjustment, appraisal limits, regression basis risk, costs, and common paths.
- [ ] TP-23-01 unit evidence passes.
- [ ] TP-23-02 functional evidence passes.
- [ ] TP-23-03 complete real-page regression passes.
- [ ] TP-23-04 adversarial mutation proof rejects every audited shortcut.
- [ ] TP-23-05 common-path real-page regression passes.
- [ ] TP-23-06 broader regression passes.
- [ ] Shared Infrastructure Impact Sweep and rollback proof are recorded.
- [ ] Build Quality Gate passes with zero skips/warnings and no excluded-file changes.
