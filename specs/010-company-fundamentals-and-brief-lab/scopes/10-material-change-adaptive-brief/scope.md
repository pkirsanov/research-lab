# Scope 10: Material-Change Adaptive Brief

Planning authority: [spec.md](../../spec.md), [design.md](../../design.md), and the [scope index](../_index.md). Execution evidence belongs in [report.md](report.md).

**Status:** Not Started

**Scope-Kind:** runtime-behavior

**Tags:** `foundation:true`, `adaptive-brief:true`, `materiality:true`, `ui:true`

**Depends On:** Scope 09 - Accessible Simple And Detailed Research Workspace

**Primary Outcome:** A deterministic evidence-change pipeline leads with genuinely material company-specific changes, preserves management commentary as a claim, ranks model-sensitive KPI evidence above repeated generic headlines, and creates bounded model-impact proposals without applying them.

## Requirement Coverage

- **Functional:** FR-010-063 through FR-010-072 and FR-010-077.
- **Non-functional:** repeatable change classification is governed by NFR-010-009 and explanation by NFR-010-010.
- **Primary scenarios:** SCN-010-017, SCN-010-018, and SCN-010-022.

## Gherkin Scenarios

### SCN-010-017 - Material Filing Update

```gherkin
Scenario: A material reported change leads the adaptive brief
  Given prior and current publications differ on a sourced fact linked to an active claim and sensitive model driver
  When the evidence-change and brief pipelines run
  Then the change is material with source, period, mechanism, claim effect, and model-impact proposal when numeric support exists
  And unchanged claims are not emitted as new changes
```

### SCN-010-018 - Management Claim Boundary

```gherkin
Scenario: Transcript language remains a management claim
  Given a rights-valid issuer evidence manifest records a management assertion without reported delivery evidence
  When the brief pipeline evaluates it
  Then the observation class remains management-claim with its window and source
  And it may create a watch condition or proposal but cannot create a reported fact or actual
```

### SCN-010-022 - Materiality Beats Headline Count

```gherkin
Scenario: One sensitive KPI outranks repeated generic articles
  Given one new high-quality KPI change affects a sensitive driver and several duplicate generic news observations do not
  When rankEvidenceChanges applies the versioned ranking policy
  Then the KPI change ranks first with its component scores
  And duplicate headline count contributes no independent source-quality or materiality weight
```

## UI Scenario Matrix

| Scenario | Preconditions | Steps | Exact user-visible result | Test Type |
| --- | --- | --- | --- | --- |
| SCN-010-017 | Prior/current publications differ on a sourced material fact tied to claim/driver | Open Simple/Brief; trace change and proposal | Changed fact leads with source/period/mechanism/claim effect; unchanged claims are not relabeled new | e2e-ui |
| SCN-010-018 | Rights-valid management assertion lacks reported delivery | Inspect brief class, support/conflict, watch/proposal, Sources | Item remains `Management claim`; it cannot appear as reported actual | e2e-ui |
| SCN-010-022 | One sensitive KPI update and repeated generic articles arrive | Inspect ranked change list and component rationale | KPI ranks first from source quality/materiality/sensitivity/novelty; duplicate count adds no weight | e2e-ui |

## Implementation Plan

1. Implement `EvidenceChange/v1` comparison across immutable current/prior observation, mapping, metric, claim, scenario, and source identities. Closed dispositions are material, immaterial, duplicate, confirmation, conflict, and not-evaluable.
2. Implement versioned deterministic ranking from source quality, company materiality, active model sensitivity, novelty, event proximity, and unresolved risk. Raw article/headline count is absent from scoring.
3. Link evidence only through explicit company mechanisms to thesis claims and model drivers. Preserve source class, period/window, source refs, affected claim/driver refs, component scores, and disposition.
4. Implement deterministic thesis, financial resilience, catalyst, risk, watch, invalidation, and `ModelImpactProposal/v1` records. Numeric proposals require affected assumption IDs, direction/range, rationale, confidence, supporting/conflicting refs, and invalidation; they remain pending for Scope 08 user decisions.
5. Implement `AdaptiveCompanyBrief/v1` material-update projection with company/archetype, current/prior refs, evidence/model cutoffs, scenario revision, coverage, changes, claims, proposals, catalysts/risks/watch/invalidations, source refs, and validation checks.
6. If a bounded author adapter is enabled, its input is the validated structured records and its output is schema-valid text plus existing refs only. Unsupported text/number/ref rejects the candidate and preserves the prior brief; source strings are untrusted data, never instructions/HTML/paths/shell args.
7. Deliver Simple adaptive brief/material changes and the Detailed Brief change/timeline/thesis/proposal/catalyst/risk/watch bands from the same accepted brief object.

## Change Boundary And Rollback

**Allowed:** evidence-change/ranking/claim/proposal/brief production functions and contracts, brief projections/renderers, rights-safe author adapter boundary, and scope-owned tests.

**Excluded:** automatic proposal application, unrestricted/free-form authoring, reported-fact mutation, generic Market Brief edits, Feature 002 adapter, news/sentiment/macro policy beyond their existing class, and registry/navigation.

**Rollback:** reverse only Scope 10 brief pipeline/UI/test hunks and select the prior validated brief/publication refs. Prior brief and evidence-change objects remain immutable and addressable.

## Scenario-First Red/Green Contract

Author materiality, unchanged-claim exclusion, management-class containment, KPI-over-headline ranking, unsupported-author rejection, and user-visible trace assertions first. Ranking tests invoke production scoring over source-qualified observations; they do not inject expected ranks.

## Test Plan

| ID | Type | Category | Scenario | File / Location | Exact behavior / persistent title | Command | Live System |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TP-10-01 | Unit | unit | SCN-010-017, SCN-010-018, SCN-010-022 | `tests/company-fundamentals-brief.unit.mjs` | Production evidence diff, ranking components, claim classes, proposal eligibility, and unsupported author-output rejection | `node --test tests/company-fundamentals-brief.unit.mjs` | No |
| TP-10-02 | Brief functional | functional | SCN-010-017, SCN-010-018, SCN-010-022 | `tests/company-fundamentals-brief.functional.mjs` | Prior/current accepted publications produce one validated material brief and pending proposals without state mutation | `node --test tests/company-fundamentals-brief.functional.mjs` | No |
| TP-10-03 | Regression E2E | e2e-ui | SCN-010-017 | `tests/company-fundamentals-lab.spec.mjs` | `Regression: SCN-010-017 a material filing change leads the brief and links thesis and model effects` | `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-010-017 a material filing change leads the brief and links thesis and model effects" --reporter=list` | Yes |
| TP-10-04 | Regression E2E | e2e-ui | SCN-010-018 | `tests/company-fundamentals-lab.spec.mjs` | `Regression: SCN-010-018 management language remains a claim and never becomes a reported actual` | `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-010-018 management language remains a claim and never becomes a reported actual" --reporter=list` | Yes |
| TP-10-05 | Regression E2E | e2e-ui | SCN-010-022 | `tests/company-fundamentals-lab.spec.mjs` | `Regression: SCN-010-022 one sensitive KPI outranks repeated generic headlines without volume weighting` | `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-010-022 one sensitive KPI outranks repeated generic headlines without volume weighting" --reporter=list` | Yes |
| TP-10-06 | Broader Regression E2E | e2e-ui | SCN-010-017, SCN-010-018, SCN-010-022 | `tests/company-fundamentals-lab.spec.mjs` | Complete cumulative Feature 010 browser suite through Scope 10 | `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |

### Definition of Done

#### Core Delivery Items

- [ ] FR-010-063 through FR-010-072 and FR-010-077 are implemented through deterministic, source-linked, company-specific change/brief/proposal contracts.
- [ ] SCN-010-017, SCN-010-018, and SCN-010-022 prove materiality, claim containment, ranking rationale, pending proposal, and trace behavior from production logic.
- [ ] Any author adapter is bounded and cannot add facts, refs, proposals, source classes, or authority; validation failure preserves the prior brief.
- [ ] Scenario-specific E2E regression coverage exists for every Scope 10 user-visible behavior and the broader E2E suite passes.
- [ ] Scenario-first RED and identical-command GREEN evidence exists for every Scope 10 behavior.

#### Test Evidence Items - Exact Parity With 6 Test Plan Rows

- [ ] TP-10-01 unit evidence proves evidence-change, ranking, claim, proposal, and author-validation production behavior.
- [ ] TP-10-02 functional evidence proves end-to-end deterministic brief construction from accepted publications without state mutation.
- [ ] TP-10-03 Regression E2E evidence proves SCN-010-017.
- [ ] TP-10-04 Regression E2E evidence proves SCN-010-018.
- [ ] TP-10-05 Regression E2E evidence proves SCN-010-022.
- [ ] TP-10-06 broader E2E evidence proves cumulative behavior through Scope 10.

#### Build Quality Gate

- [ ] Exact RED/GREEN ledger, ranking component and duplicate matrix, class/clock/ref preservation, author prompt-injection/unsupported-ref rejection, no-auto-apply/no-headline-volume scans, accessible Brief/trace parity, editor diagnostics, `git diff --check`, selftest, validator, artifact lint, G094 capability check, framework write guard, and changed-path classification are current and every finding is individually accounted for in `report.md`.
