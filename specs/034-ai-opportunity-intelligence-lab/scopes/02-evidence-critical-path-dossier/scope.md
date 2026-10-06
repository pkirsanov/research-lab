# Scope 2 — Evidence and critical-path dossier

Scope ID: `02-evidence-critical-path-dossier`
**Status:** Not Started
Scope-Kind: runtime-behavior
Depends On: `01-preserving-universe-foundation`

## Outcome And Requirements

Deliver one reconstructable outside-in company dossier. Source records carry rights, clocks, origin clusters, units, denominators, subject linkage, contradictions, milestone gates, dependency edges, and next evidence. Financial timing stays unavailable until acceptance/recognition gates exist. FR-034-017–034; SCN-034-005–010, 027; NFR-034-001–002, 005, 012.

## Gherkin

```gherkin
Scenario: SCN-034-005 Correlated sources form one evidence cluster
  Given several reports repeat one original company release
  When the dossier assesses corroboration
  Then the reports share one origin cluster
  And repetition does not satisfy independent corroboration

Scenario: SCN-034-006 A contradiction blocks promotion
  Given compatible operating evidence both supports and contradicts realization
  When the dossier reviews the claims
  Then both evidence records remain visible
  And the unresolved conflict blocks realization promotion

Scenario: SCN-034-007 Water allocation remains an allowance
  Given a public record increases a site's water allocation
  When the infrastructure milestone is assessed
  Then the allocation ratio may be calculated
  But consumption, IT load, billable capacity, revenue and productivity remain unresolved

Scenario: SCN-034-008 Recruitment stages remain distinct
  Given one requisition names several planned training dates
  When the workforce evidence is recorded
  Then one requisition and its planned dates are recorded
  And hires, training completions, accepted work and billable utilization remain unknown

Scenario: SCN-034-009 Inflection timing follows dated gates
  Given commissioning, customer acceptance and recognition lag have supported date ranges
  When the critical path is composed
  Then earliest and latest realization bounds name their controlling gates

Scenario: SCN-034-010 Installed capacity is not billable capacity
  Given an asset is installed but customer acceptance is unavailable
  When the earnings period is assessed
  Then installed capacity remains observed
  And billable output and revenue timing remain unresolved

Scenario: SCN-034-027 Distinguish response and relevant rows
  Given response bytes change while relevant company rows are identical
  When the source comparison runs
  Then retrieval change is recorded without promoting a milestone
```

## Implementation Plan

1. Extend `rlaiopportunity.js` with exact evidence, cluster, dependency, and milestone contracts. Preserve publication, observation, retrieval, and first-detection clocks.
2. Use one origin-cluster identity for syndicated release copies and correlated panels. Keep supporting, conflicting, refuting, and superseding links concurrently inspectable.
3. Add review adapters that keep allowance, installed capacity, acceptance, billability, requisition, hire, training, and paid utilization as distinct measurement classes.
4. Derive acyclic critical paths only from dated compatible gates and named accounting lag. Reject cycles, unmatched geography/period/denominator, and parent promotion without exposure linkage.
5. Add a production-format dossier for a selected seed entity, including counterevidence, falsifier, next evidence, and explicit unavailable outputs; no result-led source becomes a leading pre-event signal.

## Test Plan

| ID | Type | Scenario ID | Persistent File and Exact Title | Command | Live system |
| --- | --- | --- | --- | --- | --- |
| TP-02-01 | unit | SCN-034-005 | `tests/ai-opportunity-evidence.unit.mjs` — `correlated reports form one origin cluster` | `node --test tests/ai-opportunity-evidence.unit.mjs` | No |
| TP-02-02 | functional | SCN-034-006 | `tests/ai-opportunity-evidence.functional.mjs` — `compatible contradiction remains visible and blocks promotion` | `node --test tests/ai-opportunity-evidence.functional.mjs` | Yes, real dossier composer |
| TP-02-03 | unit | SCN-034-007 | `tests/ai-opportunity-evidence.unit.mjs` — `water allowance never becomes consumption or realized output` | `node --test tests/ai-opportunity-evidence.unit.mjs` | No |
| TP-02-04 | unit | SCN-034-008 | `tests/ai-opportunity-evidence.unit.mjs` — `requisition plans never become hires or billable utilization` | `node --test tests/ai-opportunity-evidence.unit.mjs` | No |
| TP-02-05 | functional | SCN-034-009 | `tests/ai-opportunity-critical-path.functional.mjs` — `dated gates publish bounded realization dates` | `node --test tests/ai-opportunity-critical-path.functional.mjs` | Yes, real critical-path composer |
| TP-02-06 | integration | SCN-034-010 | `tests/ai-opportunity-critical-path.integration.mjs` — `missing acceptance withholds billable output and revenue timing` | `node --test tests/ai-opportunity-critical-path.integration.mjs` | Yes, real dossier and recognition bridge |
| TP-02-07 | e2e-api | SCN-034-027 | `tests/ai-opportunity-dossier.e2e.mjs` — `Regression: changed response with unchanged relevant rows never promotes a milestone` | `node --test tests/ai-opportunity-dossier.e2e.mjs` | Yes, real record graph in disposable publication root |

### Definition of Done

- [ ] SCN-034-005: Correlated sources form one evidence cluster is verified against the specified Given/When/Then behavior.
- [ ] SCN-034-006: A contradiction blocks promotion is verified against the specified Given/When/Then behavior.
- [ ] SCN-034-007: Water allocation remains an allowance is verified against the specified Given/When/Then behavior.
- [ ] SCN-034-008: Recruitment stages remain distinct is verified against the specified Given/When/Then behavior.
- [ ] SCN-034-009: Inflection timing follows dated gates is verified against the specified Given/When/Then behavior.
- [ ] SCN-034-010: Installed capacity is not billable capacity is verified against the specified Given/When/Then behavior.
- [ ] SCN-034-027: Distinguish response and relevant rows is verified against the specified Given/When/Then behavior.
- [ ] TP-02-01 passes with raw cluster-independence evidence.
- [ ] TP-02-02 passes with concurrent contradiction and blocked-promotion evidence.
- [ ] TP-02-03 passes with allowance-stage refusal evidence.
- [ ] TP-02-04 passes with recruitment-stage refusal evidence.
- [ ] TP-02-05 passes with dated gate-bound evidence.
- [ ] TP-02-06 passes with missing-acceptance and unavailable-revenue evidence.
- [ ] TP-02-07 passes with response-versus-row diff and unchanged-milestone proof.
- [ ] Scenario-specific E2E regression tests for every new/changed/fixed behavior pass.
- [ ] Broader E2E regression suite passes.
- [ ] Build quality gate: selftest, contract/source-rights validation, artifact lint, model note and security checks pass; no result-led leading signal is emitted.
