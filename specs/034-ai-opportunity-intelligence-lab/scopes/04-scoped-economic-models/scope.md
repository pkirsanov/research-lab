# Scope 4 — Scoped economic models

Scope ID: `04-scoped-economic-models`
**Status:** Not Started
Scope-Kind: runtime-behavior
Depends On: `03-keyed-refresh-generation`

## Outcome And Requirements

Compute compatible workflow productivity, quarterly retained economics, customer demand/deflection, and conditional equity scenarios. Facts, calculations, user assumptions, sensitivities, and eligible forecasts remain distinct. FR-034-046–057; SCN-034-011–014, 028; NFR-034-001–002, 012.

## Gherkin

```gherkin
Scenario: SCN-034-011 Local productivity does not become company productivity
  Given one workflow has measured adoption and efficiency evidence
  And company-wide coverage weights are unavailable
  When the productivity bridge runs
  Then the workflow result is published with its denominator
  And the company-wide productivity multiplier is unavailable

Scenario: SCN-034-012 Redeployed time is not cash savings
  Given AI reduces task time but spending and hiring remain unchanged
  When the economic bridge runs
  Then the result records added capacity
  And retained cash savings remain zero or unavailable according to sourced spending evidence

Scenario: SCN-034-013 Contact deflection uses matched cohorts
  Given customer order volume and contacts per order share a matched period and cohort
  When the outsourcing contribution bridge runs
  Then billed contacts reconcile from both inputs
  And customer savings remain separate from provider contribution

Scenario: SCN-034-014 Revenue growth cannot substitute for order growth
  Given customer revenue grew but order growth and average selling price are unavailable
  When contact volume is assessed
  Then a demand threshold may be shown as a conditional sensitivity
  And no contact-volume prediction is published

Scenario: SCN-034-028 Isolate a user assumption
  Given a declared unpriced-fraction input and a frozen evidence baseline
  When the operator changes the input locally
  Then the result remains a conditional scenario and names the changed output paths
  And the evidence-derived baseline, owner read and forecast remain unchanged
```

## Implementation Plan

1. Add pure decimal/unit-aware bridge functions in `rlaiopportunity.js`. Use one compatible period/denominator for affected cost, deployment, local savings, and incremental cost.
2. Preserve capacity from redeployed time separately. Require spending/hiring-avoidance evidence for cash capture. Separate volume, pricing, mix, gross margin, opex and depreciation.
3. Model live days, ramp, recognition, run/inference/rework, cannibalization, financing, tax and dilution. Keep volume-priced, fixed-fee and outcome-priced contract models separate.
4. Require matched cohort/period orders for contact-volume predictions. Currys revenue growth and historical 0.18 contacts/order yield a threshold sensitivity only. Customer savings need a separate vendor-capture contract.
5. Gate P/E on stable positive forward earnings and priced-in evidence. A user unpriced-fraction assumption is never a measured investor expectation. Missing material inputs return typed unavailability.

## Test Plan

| ID | Type | Scenario ID | Persistent File and Exact Title | Command | Live system |
| --- | --- | --- | --- | --- | --- |
| TP-04-01 | unit | SCN-034-011 | `tests/ai-opportunity-models.unit.mjs` — `workflow productivity retains its measured denominator` | `node --test tests/ai-opportunity-models.unit.mjs` | No |
| TP-04-02 | functional | SCN-034-012 | `tests/ai-opportunity-models.functional.mjs` — `redeployed time remains capacity without sourced cash capture` | `node --test tests/ai-opportunity-models.functional.mjs` | Yes, real bridge composer |
| TP-04-03 | integration | SCN-034-013 | `tests/ai-opportunity-models.integration.mjs` — `matched orders and contacts reconcile provider contribution` | `node --test tests/ai-opportunity-models.integration.mjs` | Yes, real dossier and bridge graph |
| TP-04-04 | functional | SCN-034-014 | `tests/ai-opportunity-models.functional.mjs` — `revenue-only demand evidence yields sensitivity without prediction` | `node --test tests/ai-opportunity-models.functional.mjs` | Yes, real bridge composer |
| TP-04-05 | e2e-api | SCN-034-028 | `tests/ai-opportunity-models.e2e.mjs` — `Regression: local user assumption changes a conditional scenario without changing baseline` | `node --test tests/ai-opportunity-models.e2e.mjs` | Yes, published-format dossier/model graph |

### Definition of Done

- [ ] SCN-034-011: Local productivity does not become company productivity is verified against the specified Given/When/Then behavior.
- [ ] SCN-034-012: Redeployed time is not cash savings is verified against the specified Given/When/Then behavior.
- [ ] SCN-034-013: Contact deflection uses matched cohorts is verified against the specified Given/When/Then behavior.
- [ ] SCN-034-014: Revenue growth cannot substitute for order growth is verified against the specified Given/When/Then behavior.
- [ ] SCN-034-028: Isolate a user assumption is verified against the specified Given/When/Then behavior.
- [ ] TP-04-01 passes with denominator and coverage refusal evidence.
- [ ] TP-04-02 passes with capacity-versus-cash evidence.
- [ ] TP-04-03 passes with matched-cohort reconciliation and capture-boundary evidence.
- [ ] TP-04-04 passes with demand-threshold sensitivity and no-prediction evidence.
- [ ] TP-04-05 passes with local assumption isolation and unchanged-baseline proof.
- [ ] Scenario-specific E2E regression tests for every new/changed/fixed behavior pass.
- [ ] Broader E2E regression suite passes.
- [ ] Build quality gate: selftest, model/source trace, artifact lint, security/privacy and methodology docs pass; no unsupported company-wide multiplier or stock percentage remains.
