# Scope 14: Real Canary Acquisition And Cross-Capability Hardening

Planning authority: [spec.md](../../spec.md), [design.md](../../design.md), and the [scope index](../_index.md). Execution evidence belongs in [report.md](report.md).

**Status:** Not Started

**Scope-Kind:** runtime-behavior

**Tags:** `hardening:true`, `live-source:true`, `canary:true`, `release:atomic`, `ui:true`

**Depends On:** Scope 13 - Accepted Export And Feature 002 Owner Read

**Primary Outcome:** Controlled live SEC acquisition and reviewed issuer evidence produce validated current MSFT, CMG, and JPM publications, then the full static route, models, briefs, export, Feature 002 boundary, registries, accessibility, and existing Research Lab consumers pass one final cross-capability gate.

## Requirement Coverage

- **Functional:** integrated verification of FR-010-001 through FR-010-104, with primary ownership of the cross-currency/fiscal comparability behavior in SCN-010-007.
- **Non-functional:** NFR-010-013 and NFR-010-022, plus integrated verification of NFR-010-001 through NFR-010-022.
- **Primary scenario:** SCN-010-007.

## Gherkin Scenarios

### SCN-010-007 - Currency And Fiscal Incompatibility

```gherkin
Scenario: An unsupported cross-currency or fiscal comparison remains unavailable
  Given two company or peer facts differ in currency or non-aligned period and no explicit conversion/alignment object exists
  When the comparison selector evaluates compatibility
  Then the original values and bases remain visible
  And growth, aggregate statistic, and rank are unavailable with the exact incompatibility reason
```

## UI Scenario Matrix

| Journey | Preconditions | Steps | Exact user-visible result | Test Type |
| --- | --- | --- | --- | --- |
| SCN-010-007 fiscal/currency integrity | Source-qualified companies have non-aligned fiscal periods or an adversarial copied observation has another currency without conversion | Request comparison and trace qualification | Original values/bases remain; growth/statistic/rank unavailable with exact reason; no zero/conversion appears | e2e-ui |
| Three live canaries | Required `SEC_USER_AGENT` is supplied privately; explicit MSFT/CMG/JPM cutoffs/config are valid | Run each controlled acquisition and open each route | Current pointers select whole hash-valid publications; company-specific questions and source clocks match acquired/reviewed evidence | integration/e2e-ui |
| Full cross-capability release | Every prior scope is Done | Run full Node/validator/browser/registry/Feature 002/existing-consumer matrix | Zero prior regression; one coherent route/owner read; all findings accounted for before promotion | e2e-ui |

## Implementation Plan

1. Before external calls, require the operator to supply `SEC_USER_AGENT` directly in the process environment. The script checks presence only and never prints, persists, hashes, logs, exports, or includes the value in receipts. Missing/empty input exits before network access with the typed config error.
2. Run controlled acquisition with explicit company and cutoff for MSFT, CMG, and JPM. Preserve bounded request receipts, response hashes, CIK identity, source clocks, accepted/rejected/restated/conflicted counts, rights checks, and pointer-change status without headers or contact values.
3. Reconcile reviewed issuer KPI/definition/guidance manifests for each company, validate public rights projections, generate content-addressed objects/history/owner reads, validate the whole graph, and swap each current pointer last.
4. Prove source arrival is available to the next scheduled company/Market Brief processing run after ingestion and that ingestion failure remains visible without changing current pointers.
5. Exercise SCN-010-007 over real source-qualified period/calendar records plus an adversarial copy that changes currency without an alignment object; assert production compatibility output and UI qualification.
6. Run complete Feature 010 pure/functional/integration/browser tests, every exact SCN-010-001 through SCN-010-032 Regression title, full three-company UI at 1440/768/320, canvas pixels/tables, keyboard/focus/ARIA, export/read/history/deep links, and no-interception/no-external-browser-provider scans.
7. Run source lock, page integrity, Feature 002 distributed-brief/atomicity/session-date checks, registry/nav parity, representative existing tool browser suites, artifact lint/freshness, G094, framework write guard, repo readiness, and changed-path/finding accounting.

## Live Source Acquisition Commands

These commands are distinct from deterministic recorded-source tests. They are executed only after `SEC_USER_AGENT` is present in the invoking environment; the value is never placed on the command line or captured in evidence.

```bash
node scripts/ingest-company-fundamentals.mjs --company MSFT --cutoff 2026-07-15
node scripts/ingest-company-fundamentals.mjs --company CMG --cutoff 2026-07-15
node scripts/ingest-company-fundamentals.mjs --company JPM --cutoff 2026-07-15
node scripts/validate-company-fundamentals.mjs
```

## Shared Infrastructure Impact Sweep

| High-fan-out surface | Protected behavior | Independent canary before broad tests | Rollback unit |
| --- | --- | --- | --- |
| `scripts/selftest.mjs` | Every pre-Feature-010 check/group/summary/exit | Current baseline and all additive Feature 010 groups | Exact Feature 010 markers only |
| `tools.json` / `index.html` / `rlnav.js` | Existing entries/order/navigation/data-settings/focus | Registry selftest plus representative old route navigation | Exact Feature 010 rows only |
| `scripts/brief-refresh.mjs` | Existing owner reads/no-action/history/session-date/atomicity | Distributed-brief, atomicity, date-drift, and current Market Brief browser tests | Exact owner adapter marker only |
| Current pointers/history | Coherent generation, immutable objects, append-only audit | Validator over prior and candidate refs before pointer swap | Pointer selection to prior validated manifest plus append-only rollback receipt |
| Static browser/test runtime | No interception/external provider and clean server shutdown | Complete Feature 010 suite plus named existing consumer suites | Scope-owned tests/support only |

## Change Boundary And Rollback

**Allowed:** live Feature 010 source/publication data generated by approved ingestion, reviewed three-company issuer manifests, exact final Feature 010 product/test/docs/registry/Feature 002 hunks already authorized by prior scopes, and scope-owned hardening tests.

**Excluded:** international/IFRS or other issuers, commercial-provider activation, personalized/trading behavior, automatic proposal application, Feature 009 assumption changes, existing market/provider formulas, deployment/release-train configuration, package/source-lock changes, and framework-managed files.

**Rollback:** for data, revalidate and select the previous company manifest, append a rollback receipt, and preserve all immutable objects/history. For source/shared code, reverse only Feature 010 marker-bounded hunks/entries and rerun the independent shared canaries; unrelated user changes remain untouched.

## Scenario-First Red/Green Contract

Author fiscal/currency qualification, live acquisition identity/hash/pointer, next-run availability, three-company overlay, registry/Feature 002, accessibility, and existing-consumer assertions before final promotion. A network outage is an honest source failure, not a test pass and not deterministic RED. Every pass/fail claim requires current execution output.

## Test Plan

| ID | Type | Category | Scenario | File / Location | Exact behavior / persistent title | Command | Live System |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TP-14-01 | Live SEC acquisition | integration | SCN-010-001 | `scripts/ingest-company-fundamentals.mjs` | Acquire and promote MSFT through the controlled adapter with explicit cutoff, verified CIK, hashes, rights, whole graph, and pointer-last receipt | `node scripts/ingest-company-fundamentals.mjs --company MSFT --cutoff 2026-07-15` | Yes |
| TP-14-02 | Live SEC acquisition | integration | SCN-010-002 | `scripts/ingest-company-fundamentals.mjs` | Acquire and promote CMG through the controlled adapter with explicit cutoff, verified identity, lease/unit evidence, hashes, rights, and pointer-last receipt | `node scripts/ingest-company-fundamentals.mjs --company CMG --cutoff 2026-07-15` | Yes |
| TP-14-03 | Live SEC acquisition | integration | SCN-010-003 | `scripts/ingest-company-fundamentals.mjs` | Acquire and promote JPM through the controlled adapter with explicit cutoff, verified identity, bank evidence, hashes, rights, and pointer-last receipt | `node scripts/ingest-company-fundamentals.mjs --company JPM --cutoff 2026-07-15` | Yes |
| TP-14-04 | Complete production/selftest | functional | SCN-010-001 through SCN-010-032 | `scripts/selftest.mjs` | Preserve the 497 pre-feature checks and execute every Feature 010 production/config/registry/Feature 002/shared canary | `node scripts/selftest.mjs` | No |
| TP-14-05 | Whole publication validator | integration | SCN-010-001 through SCN-010-032 | `scripts/validate-company-fundamentals.mjs` | Validate current three-company object graphs, source/rights/privacy, history, models, briefs, exports, owner reads, clocks, parity, next-run availability, and hashes | `node scripts/validate-company-fundamentals.mjs` | Yes |
| TP-14-06 | Regression E2E | e2e-ui | SCN-010-007 | `tests/company-fundamentals-lab.spec.mjs` | `Regression: SCN-010-007 mixed currency and fiscal periods remain visible and unavailable for forced comparison` | `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-010-007 mixed currency and fiscal periods remain visible and unavailable for forced comparison" --reporter=list` | Yes |
| TP-14-07 | Complete Feature 010 Regression E2E | e2e-ui | SCN-010-001 through SCN-010-032 | `tests/company-fundamentals-lab.spec.mjs` | Execute every exact Feature 010 Regression title over the real static server and current source-qualified publications with no interception | `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| TP-14-08 | Existing shared-consumer Regression E2E | e2e-ui | SCN-010-030 | `tests/provider-credentials.spec.mjs`, `tests/market-brief-session-date-drift.spec.mjs`, `tests/causal-rotation-lab.spec.mjs`, `tests/bond-regime-lab.spec.mjs`, `tests/fx-regime-relative-value-lab.spec.mjs`, `tests/palm-springs-rental-market-lab.spec.mjs`, `tests/trend-dynamics-cycle-lab.spec.mjs`, `tests/technical-analysis-decision-lab.spec.mjs` | Preserve provider credentials, Market Brief, Causal, Bond, FX, Palm Springs, Trend Dynamics, and Technical Analysis after all shared additions | `npx --no-install playwright test tests/provider-credentials.spec.mjs tests/market-brief-session-date-drift.spec.mjs tests/causal-rotation-lab.spec.mjs tests/bond-regime-lab.spec.mjs tests/fx-regime-relative-value-lab.spec.mjs tests/palm-springs-rental-market-lab.spec.mjs tests/trend-dynamics-cycle-lab.spec.mjs tests/technical-analysis-decision-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |

### Definition of Done

#### Core Delivery Items

- [ ] FR-010-001 through FR-010-104 and NFR-010-001 through NFR-010-022 are integrated across controlled source acquisition, immutable publications, all three overlays, models, UI, briefs, exports, history, owner reads, and Feature 002.
- [ ] SCN-010-007 proves incompatible currency/fiscal observations remain visible and cannot produce forced growth/statistics/ranks; every other scenario retains its single primary owner and passes in the complete suite.
- [ ] Required `SEC_USER_AGENT` presence is checked before network access and its value is absent from command lines, output, receipts, artifacts, exports, logs, and history.
- [ ] Live MSFT/CMG/JPM acquisition evidence is source-qualified and distinct from deterministic recorded-input/parser/model/UI evidence.
- [ ] Shared Infrastructure Impact Sweep, exact rollback units, consumer canaries, and zero excluded/collateral changes are proven before any completion request.
- [ ] Scenario-first RED and identical-command GREEN evidence exists for every final hardening behavior.

#### Test Evidence Items - Exact Parity With 8 Test Plan Rows

- [ ] TP-14-01 live integration evidence proves controlled source-qualified MSFT acquisition and promotion.
- [ ] TP-14-02 live integration evidence proves controlled source-qualified CMG acquisition and promotion.
- [ ] TP-14-03 live integration evidence proves controlled source-qualified JPM acquisition and promotion.
- [ ] TP-14-04 selftest evidence preserves all 497 pre-feature checks and proves every Feature 010 production/shared contract.
- [ ] TP-14-05 integration evidence proves all current publication graphs, histories, models, briefs, exports, reads, clocks, rights, privacy, and next-run availability.
- [ ] TP-14-06 Regression E2E evidence proves SCN-010-007.
- [ ] TP-14-07 complete Feature 010 E2E evidence proves every exact SCN-010-001 through SCN-010-032 regression title.
- [ ] TP-14-08 existing-consumer E2E evidence proves every named shared route remains green after final integration.

#### Build Quality Gate

- [ ] Complete RED/GREEN ledger, live-source receipts and secret-safe output scan, source lock, page integrity, no-interception/external-browser-provider scan, three-company source/rights/hash/pointer/history checks, all viewport/accessibility/pixel/table checks, Feature 002/atomicity/date-drift/registry/nav existing-consumer canaries, editor diagnostics, `git diff --check`, artifact lint/freshness, G094, traceability, implementation reality, framework write guard, repository readiness, and changed-path/finding accounting are current and clean in `report.md`.
