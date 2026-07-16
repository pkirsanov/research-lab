# Scope 06: MSFT, CMG, And JPM Source-Qualified Overlays

Planning authority: [spec.md](../../spec.md), [design.md](../../design.md), and the [scope index](../_index.md). Execution evidence belongs in [report.md](report.md).

**Status:** Not Started

**Scope-Kind:** runtime-behavior

**Tags:** `overlay:true`, `canary:true`, `source-qualified:true`, `ui:true`

**Depends On:** Scope 05 - Archetype, KPI, And Peer Policy Foundation

**Primary Outcome:** Recorded real source evidence drives three materially different company overlays over one foundation: MSFT prioritizes recurring software economics, CMG preserves lease/unit context, and JPM uses bank capital/credit/liquidity questions without an industrial debt verdict.

## Requirement Coverage

- **Functional:** FR-010-047 through FR-010-049.
- **Non-functional:** NFR-010-020.
- **Primary scenarios:** SCN-010-001, SCN-010-002, and SCN-010-003.

## Gherkin Scenarios

### SCN-010-001 - Microsoft Source-Qualified Simple Read

```gherkin
Scenario: Microsoft opens from one coherent publication
  Given CompanyIndex/v1 maps MSFT to sec-cik-0000789019 and its current pointer selects a hash-valid publication
  And that publication contains sourced software KPIs, an accepted scenario revision, and separately dated market evidence
  When the browser GETs the index, pointer, manifest, and referenced summary objects and renders Simple
  Then the accepted state prioritizes cloud, backlog, capex, depreciation, margin, cash-conversion, and dilution records that exist
  And the statement, model, brief, and market cutoffs equal the owner objects and the MSFT specialist cutoff remains separate
```

### SCN-010-002 - Chipotle Lease Context

```gherkin
Scenario: Chipotle raw and contextual leverage remain distinct
  Given the source-qualified CMG publication contains funded-debt, lease-liability, equity, treasury-stock, and share observations
  When selectResilienceView evaluates the cash/debt and liabilities/equity checks
  Then the raw formulas use the reported observations without adjustment
  And the contextual records name lease and treasury-stock effects with exact refs and no pass/fail value
```

### SCN-010-003 - JPMorgan Bank Applicability

```gherkin
Scenario: JPMorgan does not execute an industrial-company debt rule
  Given the accepted JPM archetype is financial-institution with deposits, credit, liquidity, CET1, and preferred-capital facts
  When the resilience selector resolves diagnostic applicability
  Then ordinary liabilities/equity and net-debt/EBITDA checks are inapplicable with the financial-institution policy ID
  And bank-specific facts remain available without producing an industrial weakness rank
```

## UI Scenario Matrix

| Scenario | Preconditions | Steps | Exact user-visible result | Test Type |
| --- | --- | --- | --- | --- |
| SCN-010-001 | Valid recorded-source MSFT publication with software KPI evidence and separate specialist/market clocks | Select MSFT and inspect Simple/truth strip/specialist link | Software priorities appear only when sourced; four clocks match owner objects; specialist model remains separately labeled | e2e-ui |
| SCN-010-002 | Valid recorded-source CMG publication with lease/treasury/share observations | Select CMG and inspect Resilience | Raw accounting formulas remain unchanged beside lease/treasury context; no unconditional pass/fail | e2e-ui |
| SCN-010-003 | Valid recorded-source JPM publication with financial-institution policy/evidence | Select JPM and inspect Resilience/driver rows | Industrial rules are inapplicable/qualified; deposits, credit, liquidity, CET1, preferred capital remain available | e2e-ui |

## Implementation Plan

1. Add explicit company identities, accepted mappings, reviewed issuer evidence manifests, archetype assignments, KPI definitions, diagnostic policies, model-definition references, peer purposes, and freshness/rights policies for MSFT, CMG, and JPM.
2. Build each overlay from immutable recorded real SEC/issuer source captures and production mappings. No company file copies another company's facts, KPI definition, model graph, or diagnostic result.
3. Implement MSFT recurring-revenue/software priority for sourced cloud/Azure growth, RPO/backlog, AI/data-center capex, depreciation, margins, cash conversion, and dilution. Add only an explicit `SpecialistOverlayLink/v1`; preserve the July-print model's own cutoff and assumptions.
4. Implement CMG unit-economics/lease priority for sourced comparable sales, units/openings/closures, restaurant economics, labor/food costs, and lease obligations. Raw funded debt, leases, treasury-stock-reduced equity, issuance, and net shares remain distinct.
5. Implement JPM financial-institution priority for sourced NII/NIM, deposits, loans, credit losses/reserves, fee/trading mix, CET1, liquidity, preferred/regulatory capital, and distributions. Industrial free-cash-flow/net-debt/current-ratio/liabilities-equity policies remain inapplicable unless an explicit valid definition exists.
6. Produce validator-approved recorded-source canary publications for browser and deterministic tests. Live acquisition/pointer promotion for all three companies remains the final Scope 14 gate.

## Change Boundary And Rollback

**Allowed:** three company config/manifest/mapping/overlay definitions, recorded source-qualified captures, immutable canary publications, specialist boundary link, and scope-owned tests/render selectors.

**Excluded:** edits to `msft-july-print-model.html` assumptions or calculations, company facts copied from that page, live SEC acquisition/promotion, international/IFRS issuers, paid providers, universal score/model formulas, registry/Feature 002, and unrelated companies.

**Rollback:** restore the prior validated company pointers and reverse only the three overlay definitions/tests. Source captures, immutable objects, and history remain unchanged; the specialist model is not modified by this scope.

## Scenario-First Red/Green Contract

Author three overlay-specific browser assertions and shared-fact identity checks before overlay config. Recorded source metadata must prove source identity; tests may not inject the expected driver order or diagnostic conclusion as the asserted output.

## Test Plan

| ID | Type | Category | Scenario | File / Location | Exact behavior / persistent title | Command | Live System |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TP-06-01 | Overlay contract | functional | SCN-010-001, SCN-010-002, SCN-010-003 | `tests/company-fundamentals-overlays.functional.mjs` | Production policies select distinct KPI/diagnostic/model families while preserving shared fact bytes and source refs | `node --test tests/company-fundamentals-overlays.functional.mjs` | No |
| TP-06-02 | Publication validator | integration | SCN-010-001, SCN-010-002, SCN-010-003 | `scripts/validate-company-fundamentals.mjs` | Validate all three recorded-source publications, rights, mappings, archetype evidence, clocks, and specialist boundary | `node scripts/validate-company-fundamentals.mjs` | Yes |
| TP-06-03 | Regression E2E | e2e-ui | SCN-010-001 | `tests/company-fundamentals-lab.spec.mjs` | `Regression: SCN-010-001 Microsoft Simple prioritizes sourced software drivers and preserves separate clocks` | `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-010-001 Microsoft Simple prioritizes sourced software drivers and preserves separate clocks" --reporter=list` | Yes |
| TP-06-04 | Regression E2E | e2e-ui | SCN-010-002 | `tests/company-fundamentals-lab.spec.mjs` | `Regression: SCN-010-002 Chipotle preserves raw leverage beside lease and treasury context` | `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-010-002 Chipotle preserves raw leverage beside lease and treasury context" --reporter=list` | Yes |
| TP-06-05 | Regression E2E | e2e-ui | SCN-010-003 | `tests/company-fundamentals-lab.spec.mjs` | `Regression: SCN-010-003 JPMorgan uses bank capital credit and liquidity rules without an industrial score` | `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-010-003 JPMorgan uses bank capital credit and liquidity rules without an industrial score" --reporter=list` | Yes |
| TP-06-06 | Broader Regression E2E | e2e-ui | SCN-010-001, SCN-010-002, SCN-010-003 | `tests/company-fundamentals-lab.spec.mjs` | Complete cumulative Feature 010 browser suite through Scope 06 across all three recorded-source canaries | `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |

### Definition of Done

#### Core Delivery Items

- [ ] FR-010-047 through FR-010-049 and NFR-010-020 are implemented through three source-qualified overlays over one immutable shared foundation.
- [ ] SCN-010-001, SCN-010-002, and SCN-010-003 prove materially different questions and model/diagnostic policies without changing shared fact semantics.
- [ ] MSFT specialist identity/cutoff/assumptions remain separate; CMG leases/treasury context remains explicit; JPM industrial heuristics remain inapplicable.
- [ ] Recorded-source captures and deterministic tests remain distinct from Scope 14 live acquisition evidence.
- [ ] Scenario-first RED and identical-command GREEN evidence exists for every Scope 06 behavior.

#### Test Evidence Items - Exact Parity With 6 Test Plan Rows

- [ ] TP-06-01 functional evidence proves overlay selection and shared-fact immutability.
- [ ] TP-06-02 integration evidence proves all three recorded-source publication graphs, rights, clocks, and boundaries.
- [ ] TP-06-03 Regression E2E evidence proves SCN-010-001.
- [ ] TP-06-04 Regression E2E evidence proves SCN-010-002.
- [ ] TP-06-05 Regression E2E evidence proves SCN-010-003.
- [ ] TP-06-06 broader E2E evidence proves cumulative three-company behavior through Scope 06.

#### Build Quality Gate

- [ ] Exact RED/GREEN ledger, capture provenance/hashes, cross-company shared-fact parity, no-copy/no-universal-score/no-specialist-mutation scans, three-company source/rights/clock validation, editor diagnostics, `git diff --check`, selftest, validator, artifact lint, G094 capability check, framework write guard, and changed-path classification are current and every finding is individually accounted for in `report.md`.
