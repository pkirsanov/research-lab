# Scope 05: Archetype, KPI, And Peer Policy Foundation

Planning authority: [spec.md](../../spec.md), [design.md](../../design.md), and the [scope index](../_index.md). Execution evidence belongs in [report.md](report.md).

**Status:** Not Started

**Scope-Kind:** runtime-behavior

**Tags:** `foundation:true`, `archetype:true`, `peer-comparability:true`, `ui:true`

**Depends On:** Scope 04 - Derived Metrics, Contextual Resilience, And Capital Allocation

**Primary Outcome:** Evidenced archetype and KPI policies alter priority and applicability without mutating shared facts, preserve a useful unclassified state, and admit peer statistics only from compatible observations with explicit sample truth.

## Requirement Coverage

- **Functional:** FR-010-041 through FR-010-046, FR-010-050, and FR-010-082 through FR-010-087.
- **Non-functional:** NFR-010-021.
- **Primary scenarios:** SCN-010-008, SCN-010-009, and SCN-010-028.

## Gherkin Scenarios

### SCN-010-008 - Archetype Priority Without Fact Mutation

```gherkin
Scenario: Software and restaurant overlays select different priorities over shared facts
  Given MSFT and CMG publications use the same normalized revenue and cash-flow contracts but different accepted archetypes
  When selectSimpleView runs for each accepted state
  Then MSFT prioritizes software drivers and CMG prioritizes unit/lease drivers
  And the shared fact IDs, values, periods, units, and sources remain byte-equivalent to their dossier records
```

### SCN-010-009 - Unclassified Company

```gherkin
Scenario: An unclassified company receives no inherited overlay
  Given a verified company publication has shared statements but ArchetypeAssignment/v1 status unclassified
  When Simple and Detailed selectors run
  Then shared statements and source trace remain available
  And KPI priorities, archetype diagnostics, model definition, and company-specific brief claims are unavailable with evidence requirements
```

### SCN-010-028 - Peer Compatibility

```gherkin
Scenario: Incompatible peers do not enter statistics or ranks
  Given a PeerSet/v1 contains comparable, qualified, and excluded observations with explicit purposes
  When selectPeersView computes level or trend context
  Then only comparable observations enter the named statistic and sample size
  And qualified/excluded rows, missing counts, outliers, and exact reasons remain visible with no zero insertion
```

## UI Scenario Matrix

| Scenario | Preconditions | Steps | Exact user-visible result | Test Type |
| --- | --- | --- | --- | --- |
| SCN-010-008 | Software and restaurant states share normalized facts but have different evidenced archetypes | Open both Simple views and trace a shared fact | Driver priorities differ; shared fact IDs/values/periods/units/sources match dossier objects | e2e-ui |
| SCN-010-009 | Verified issuer has shared facts and unclassified assignment | Open Simple and Detailed | Shared statements/trace remain; KPI/model/overlay claims state what evidence is required | e2e-ui |
| SCN-010-028 | Peer set has comparable, qualified, excluded, missing, and outlier observations | Select purpose, metric, level/trend, and inspect exclusions | Only comparable rows enter statistic/rank; sample/missing/outlier/method and exclusion reasons remain visible | e2e-ui |

## Implementation Plan

1. Implement versioned `ArchetypeDefinition/v1`, `ArchetypeAssignment/v1`, KPI definition, diagnostic applicability, model-definition selection, brief-priority, and peer-purpose contracts. Primary/secondary assignments require evidence refs and rationale.
2. Implement `unclassified` as a first-class accepted state that preserves shared statements and trace while withholding overlay-only KPI, diagnostic, model, and brief conclusions with exact evidence requirements.
3. Implement KPI continuity rules for issuer definition, units, period, source, materiality, and definition breaks. Similar labels never create continuity without an accepted definition relationship.
4. Implement `PeerSet/v1` and production compatibility functions over purpose, identity, archetype, metric definition, period, currency, accounting basis, coverage, missing values, outliers, sample size, and statistic.
5. Deliver company-specific driver selection and the Detailed Peers vertical slice. Qualified/excluded rows remain discoverable, user-selected peers are identified, and no missing/incompatible observation becomes zero or forced rank.
6. Prove extension stability: adding a new assignment/definition changes only versioned policy/config and preserves prior publications/brief interpretations.

## Change Boundary And Rollback

**Allowed:** shared archetype/KPI/peer policy/config/functions, Simple driver projection, Peers workspace, unclassified state, and scope-owned tests.

**Excluded:** concrete MSFT/CMG/JPM mappings and source values, model formulas, brief authoring, registry/Feature 002, international/IFRS normalization, and commercial-provider enablement.

**Rollback:** reverse only Scope 05 policy/config/rendering/test hunks and select the prior validated pointer. Prior archetype assignments and brief interpretations remain addressable by immutable refs.

## Scenario-First Red/Green Contract

Author shared-fact byte-equivalence, unclassified withholding, KPI definition-break, and peer sample/exclusion assertions before production behavior. A test cannot prove priority by injecting the expected ordered output; it must invoke production policy over source-qualified dossier records.

## Test Plan

| ID | Type | Category | Scenario | File / Location | Exact behavior / persistent title | Command | Live System |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TP-05-01 | Unit | unit | SCN-010-008, SCN-010-009, SCN-010-028 | `tests/company-fundamentals-archetype-peer.unit.mjs` | Production archetype evidence, KPI continuity, unclassified withholding, and peer compatibility/statistic functions | `node --test tests/company-fundamentals-archetype-peer.unit.mjs` | No |
| TP-05-02 | Publication validator | integration | SCN-010-008, SCN-010-009, SCN-010-028 | `scripts/validate-company-fundamentals.mjs` | Validate policy IDs/evidence, shared-fact immutability, peer sample math, and absence of forced universal rank | `node scripts/validate-company-fundamentals.mjs` | Yes |
| TP-05-03 | Regression E2E | e2e-ui | SCN-010-008 | `tests/company-fundamentals-lab.spec.mjs` | `Regression: SCN-010-008 archetypes change KPI priority without changing shared financial facts` | `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-010-008 archetypes change KPI priority without changing shared financial facts" --reporter=list` | Yes |
| TP-05-04 | Regression E2E | e2e-ui | SCN-010-009 | `tests/company-fundamentals-lab.spec.mjs` | `Regression: SCN-010-009 unclassified companies retain shared facts and inherit no default lens` | `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-010-009 unclassified companies retain shared facts and inherit no default lens" --reporter=list` | Yes |
| TP-05-05 | Regression E2E | e2e-ui | SCN-010-028 | `tests/company-fundamentals-lab.spec.mjs` | `Regression: SCN-010-028 incompatible peers stay outside statistics and ranks with exact reasons` | `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-010-028 incompatible peers stay outside statistics and ranks with exact reasons" --reporter=list` | Yes |
| TP-05-06 | Broader Regression E2E | e2e-ui | SCN-010-008, SCN-010-009, SCN-010-028 | `tests/company-fundamentals-lab.spec.mjs` | Complete cumulative Feature 010 browser suite through Scope 05 | `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |

### Definition of Done

#### Core Delivery Items

- [ ] FR-010-041 through FR-010-046, FR-010-050, FR-010-082 through FR-010-087, and NFR-010-021 are implemented through evidenced, versioned archetype/KPI/peer policies.
- [ ] SCN-010-008, SCN-010-009, and SCN-010-028 use shared production facts/selectors and expose all priority, unclassified, sample, missing, outlier, and exclusion truth.
- [ ] No international/IFRS normalization or commercial-provider activation enters active config, source code, public data, or tests.
- [ ] Scenario-specific E2E regression coverage exists for every Scope 05 user-visible behavior and the broader E2E suite passes.
- [ ] Scenario-first RED and identical-command GREEN evidence exists for every Scope 05 behavior.

#### Test Evidence Items - Exact Parity With 6 Test Plan Rows

- [ ] TP-05-01 unit evidence proves archetype, KPI continuity, unclassified, and peer compatibility production behavior.
- [ ] TP-05-02 integration evidence proves publication policy/evidence/shared-fact/sample integrity.
- [ ] TP-05-03 Regression E2E evidence proves SCN-010-008.
- [ ] TP-05-04 Regression E2E evidence proves SCN-010-009.
- [ ] TP-05-05 Regression E2E evidence proves SCN-010-028.
- [ ] TP-05-06 broader E2E evidence proves cumulative behavior through Scope 05.

#### Build Quality Gate

- [ ] Exact RED/GREEN ledger, shared-fact hash parity, unclassified/no-default scans, KPI definition-break matrix, peer compatibility/sample/outlier checks, accessible table parity, editor diagnostics, `git diff --check`, selftest, validator, artifact lint, G094 capability check, framework write guard, and changed-path classification are current and every finding is individually accounted for in `report.md`.
