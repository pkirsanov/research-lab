# Scope 07: Linked Model Families And Scenario Computation

Planning authority: [spec.md](../../spec.md), [design.md](../../design.md), and the [scope index](../_index.md). Execution evidence belongs in [report.md](report.md).

**Status:** Not Started

**Scope-Kind:** runtime-behavior

**Tags:** `foundation:true`, `model:true`, `scenario:true`, `ui:true`

**Depends On:** Scope 06 - MSFT, CMG, And JPM Source-Qualified Overlays

**Primary Outcome:** Versioned ordinary-company and financial-institution model graphs recompute every dependency-reachable output from explicit accepted assumptions, preserve reported history and scenario lineage, and block invalid branches with exact reasons rather than hidden balancing values.

## Requirement Coverage

- **Functional:** FR-010-051 through FR-010-062.
- **Non-functional:** deterministic graph evaluation is governed by NFR-010-009 and explicit failure by NFR-010-011.
- **Primary scenarios:** SCN-010-014 and SCN-010-016.

## Gherkin Scenarios

### SCN-010-014 - Linked Scenario Recompute

```gherkin
Scenario: Editing one driver recomputes one dependency graph
  Given an accepted scenario and acyclic model definition produce valid linked outputs
  When editAssumption changes one company-specific driver and creates a draft
  Then every reachable statement, cash, balance, KPI, per-share, and valuation node recomputes from the draft tuple
  And unreachable history is unchanged and any failed node reports its dependency path
```

### SCN-010-016 - Estimate To Actual

```gherkin
Scenario: A sourced release adds an actual without rewriting its estimate
  Given an estimate observation exists for a period and a later eligible filing supplies a comparable reported observation
  When the publication reconciles the period
  Then estimate and reported observations retain separate classes, sources, and clocks
  And forecast error is derived only when definition, unit, currency, and period are compatible
```

## UI Scenario Matrix

| Scenario | Preconditions | Steps | Exact user-visible result | Test Type |
| --- | --- | --- | --- | --- |
| SCN-010-014 | Valid saved scenario and acyclic company model | Edit one driver; inspect linked outputs, integrity, comparison, and sensitivity | All reachable draft outputs change from one revision; history/saved revisions do not; failed branches name dependency path | e2e-ui |
| SCN-010-016 | Prior estimate and later comparable reported observation | Open Statements/Model and compare estimate to actual | Both observations retain class/source/clock; forecast error appears only when comparable | e2e-ui |

## Implementation Plan

1. Implement `ModelDefinition/v1` with named formula IDs, explicit input/output nodes, dependency edges, integrity checks, prohibited ranges, and economically named balancing-item policy. Configuration cannot contain executable expressions.
2. Implement deterministic topological sorting and branch evaluation in `rlcompany.js`. Reject cycles before evaluation; non-finite results, invalid denominators, prohibited values, failed identities, and unresolved anchors block only dependency-reachable outputs with exact paths.
3. Implement ordinary-company nodes for company-selected revenue drivers, profits/expenses/tax, D&A, capex, working capital, cash flow, financing, debt/cash/equity, shares/EPS, and valuation. Missing relationships remain unavailable rather than balanced by an unnamed residual.
4. Implement financial-institution nodes for earning assets, NIM/NII, noninterest revenue/expense, provisions/credit cost, income, loans/deposits/funding/reserves, RWA/CET1, preferred capital, distributions, shares, and valuation. Industrial FCF/current-ratio/net-debt formulas never execute for JPM.
5. Implement immutable `ScenarioRevision/v1`, explicit assumptions with owner/class/unit/period/rationale/source, base/upside/downside/user names over one historical cutoff, draft evaluation, saved revision lineage, sensitivity bounds, invalid regions, and valuation method/date/limitations.
6. Preserve reported/guidance/estimate/user-assumption/model-output classes. A sourced actual appends a reported observation; forecast error requires compatible definition/unit/currency/period and the prior estimate remains auditable.
7. Deliver the Detailed Model vertical slice: scenario/revision controls, assumptions, linked outputs, integrity, proposal holding area, comparison, sensitivity, accessible tables, and concise recomputation announcements.

## Change Boundary And Rollback

**Allowed:** model/scenario/formula production contracts, ordinary-company and bank family definitions, Model workspace, accepted deterministic model packs, and scope-owned tests.

**Excluded:** evidence proposal application decisions, adaptive brief prose, paid consensus, any default assumption, edits to MSFT specialist calculations, registry/Feature 002, and market/source transport.

**Rollback:** reverse only Scope 07 model/UI/test hunks and select prior validated model/publication refs. Accepted historical facts and earlier scenario revisions remain immutable.

## Scenario-First Red/Green Contract

Author graph reachability, cycle, invalid branch, no-hidden-balance, estimate/actual separation, and browser output assertions first. Numeric expectations must be derived from known production relationships and inputs; pass-through or fixture-authored model outputs cannot satisfy the tests.

## Test Plan

| ID | Type | Category | Scenario | File / Location | Exact behavior / persistent title | Command | Live System |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TP-07-01 | Unit | unit | SCN-010-014, SCN-010-016 | `tests/company-fundamentals-model.unit.mjs` | Production graph/topology/formulas/revisions/sensitivity/valuation and actual-estimate compatibility, including invalid branch matrix | `node --test tests/company-fundamentals-model.unit.mjs` | No |
| TP-07-02 | Publication validator | integration | SCN-010-014, SCN-010-016 | `scripts/validate-company-fundamentals.mjs` | Recompute model packs from accepted facts/assumptions, verify formula IDs/lineage, and reject hidden defaults or class drift | `node scripts/validate-company-fundamentals.mjs` | Yes |
| TP-07-03 | Regression E2E | e2e-ui | SCN-010-014 | `tests/company-fundamentals-lab.spec.mjs` | `Regression: SCN-010-014 one driver edit recomputes linked outputs and exposes every invalid dependency` | `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-010-014 one driver edit recomputes linked outputs and exposes every invalid dependency" --reporter=list` | Yes |
| TP-07-04 | Regression E2E | e2e-ui | SCN-010-016 | `tests/company-fundamentals-lab.spec.mjs` | `Regression: SCN-010-016 sourced actuals preserve prior estimates classes clocks and comparable forecast error` | `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-010-016 sourced actuals preserve prior estimates classes clocks and comparable forecast error" --reporter=list` | Yes |
| TP-07-05 | Broader Regression E2E | e2e-ui | SCN-010-014, SCN-010-016 | `tests/company-fundamentals-lab.spec.mjs` | Complete cumulative Feature 010 browser suite through Scope 07 | `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |

### Definition of Done

#### Core Delivery Items

- [ ] FR-010-051 through FR-010-062 are implemented through explicit versioned graph, scenario, sensitivity, valuation, and estimate/actual contracts with no hidden assumptions or balancing values.
- [ ] SCN-010-014 and SCN-010-016 are delivered in production model/statement/publication paths for ordinary-company and financial-institution families.
- [ ] MSFT/CMG use explicit ordinary-company overlay nodes and JPM uses the financial-institution graph without industrial formulas.
- [ ] Scenario-specific E2E regression coverage exists for every Scope 07 user-visible behavior and the broader E2E suite passes.
- [ ] Scenario-first RED and identical-command GREEN evidence exists for every Scope 07 behavior.

#### Test Evidence Items - Exact Parity With 5 Test Plan Rows

- [ ] TP-07-01 unit evidence proves graph, model-family, revision, sensitivity, valuation, and estimate/actual production behavior.
- [ ] TP-07-02 integration evidence proves accepted model pack recomputation, formula lineage, and no-default validation.
- [ ] TP-07-03 Regression E2E evidence proves SCN-010-014.
- [ ] TP-07-04 Regression E2E evidence proves SCN-010-016.
- [ ] TP-07-05 broader E2E evidence proves cumulative behavior through Scope 07.

#### Build Quality Gate

- [ ] Exact RED/GREEN ledger, graph cycle/reachability/invalid-region matrix, no-eval/no-default/no-hidden-balance scans, actual/estimate separation, accessible model table/chart parity, editor diagnostics, `git diff --check`, selftest, validator, artifact lint, G094 capability check, framework write guard, and changed-path classification are current and every finding is individually accounted for in `report.md`.
