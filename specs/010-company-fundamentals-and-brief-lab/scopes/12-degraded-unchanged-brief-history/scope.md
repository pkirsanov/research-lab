# Scope 12: Degraded And Unchanged Brief History

Planning authority: [spec.md](../../spec.md), [design.md](../../design.md), and the [scope index](../_index.md). Execution evidence belongs in [report.md](report.md).

**Status:** Not Started

**Scope-Kind:** runtime-behavior

**Tags:** `foundation:true`, `brief-history:true`, `freshness:true`, `ui:true`

**Depends On:** Scope 11 - Narrative, Sentiment, And Macro Boundaries

**Primary Outcome:** Per-class freshness and append-only history preserve last valid dated truth under stale/partial/conflicted evidence, and reviewed duplicate/confirmation/immaterial evidence produces one explicit unchanged outcome without novelty or duplicate history.

## Requirement Coverage

- **Functional:** FR-010-080 and FR-010-098.
- **Non-functional:** NFR-010-014 and NFR-010-016.
- **Primary scenarios:** SCN-010-024 and SCN-010-031.

## Gherkin Scenarios

### SCN-010-024 - Stale Evidence

```gherkin
Scenario: Stale evidence retains its cutoff and constrains current claims
  Given the latest valid KPI observation exceeds its explicit class freshness policy
  When the brief and Simple selectors run
  Then the KPI state is stale with its original cutoff and required update
  And unsupported current claims and model-impact proposals are absent while prior dated truth remains visible
```

### SCN-010-031 - Unchanged Brief

```gherkin
Scenario: Immaterial reviewed evidence produces an unchanged outcome
  Given a prior validated brief exists and every new eligible observation is duplicate, confirmation, or immaterial to active claims/drivers
  When the evidence-change and brief pipelines run
  Then brief status is unchanged and reviewed evidence plus no-change rationale are recorded
  And no material-change item, model proposal, or duplicate narrative content is created
```

## UI Scenario Matrix

| Scenario | Preconditions | Steps | Exact user-visible result | Test Type |
| --- | --- | --- | --- | --- |
| SCN-010-024 | Last valid KPI exceeds explicit class freshness policy | Open Simple/Brief/history and inspect dependent rows | Original cutoff/limitation/update needed remain; prior truth stays; unsupported current claims/proposals are absent | e2e-ui |
| SCN-010-031 | Prior brief and newly reviewed duplicate/confirmation/immaterial evidence exist | Produce/open current brief and history | Status is `Unchanged`; reviewed evidence and reason appear once; no material change/proposal/duplicate narrative event | e2e-ui |

## Implementation Plan

1. Implement per-class freshness evaluation from explicit policy, observation/cutoff, and current evaluation time. No page-level date or retrieval time upgrades statement/KPI/estimate/transcript/news/sentiment/market freshness.
2. Implement partial, stale, conflicted, unavailable, and unchanged `AdaptiveCompanyBrief/v1` validation. Unsupported claims/proposals are withheld while independently valid prior facts/scenario/brief remain with original cutoffs.
3. Implement semantic evidence, proposal, brief, revision, and owner-read fingerprints. Reprocessing identical accepted source bytes/config/policies creates no duplicate fact, change, proposal, brief content, or history row.
4. Implement partitioned append-only company brief/read/revision history rows with immutable refs and explicit material/unchanged/rejected-proposal/conflict/correction outcomes. Historical brief view is read-only and cannot activate its scenario.
5. Append an unchanged receipt only when a genuinely new evidence set was reviewed. Record disposition and no-change rationale; do not rewrite prior thesis text for novelty.
6. Deliver stale/partial/conflicted/unchanged Simple/Brief/history UI, retained cutoff, required evidence, read-only historical status, return-to-current focus, and no-color/non-hover meaning.

## Test Environment And History Boundary

- History integration tests write only to `tests/.tmp/<run-id>/` or run-owned fixture overlays and destroy the run directory. They never append to committed current/history paths during test execution.
- Committed history validation is read-only except when the implementation command intentionally publishes a fully validated generation.
- Duplicate processing tests run the production pipeline twice and compare semantic IDs/history row counts; they do not assert a test-authored duplicate flag.

## Change Boundary And Rollback

**Allowed:** freshness/fingerprint/history production contracts, partitioned Feature 010 history artifacts, degraded/unchanged brief rendering, and scope-owned tests.

**Excluded:** current pointer mutation outside validated publication flow, prior history rewrites, generic Market Brief history, automatic proposal application, registry/Feature 002, and unrelated JSONL ledgers.

**Rollback:** select a prior validated current pointer and append a rollback receipt. Never delete or rewrite newer immutable objects or history rows; reverse only Scope 12 code/UI/test hunks.

## Scenario-First Red/Green Contract

Author stale cutoff/withholding, identical-processing idempotency, unchanged rationale, no-duplicate-content, and historical read-only assertions first. Production fingerprints and pipeline output, not fixture-authored flags, must establish the result.

## Test Plan

| ID | Type | Category | Scenario | File / Location | Exact behavior / persistent title | Command | Live System |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TP-12-01 | Unit | unit | SCN-010-024, SCN-010-031 | `tests/company-fundamentals-brief.unit.mjs` | Production per-class freshness, semantic fingerprint, unchanged disposition, and dependent-claim withholding | `node --test tests/company-fundamentals-brief.unit.mjs` | No |
| TP-12-02 | History integration | integration | SCN-010-024, SCN-010-031 | `tests/company-fundamentals-history.integration.mjs` | Real run-owned filesystem publication twice proves append-only partitioning, idempotency, historical read-only refs, and rollback receipt | `node --test tests/company-fundamentals-history.integration.mjs` | Yes |
| TP-12-03 | Regression E2E | e2e-ui | SCN-010-024 | `tests/company-fundamentals-lab.spec.mjs` | `Regression: SCN-010-024 stale evidence retains its cutoff and withholds unsupported current claims` | `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-010-024 stale evidence retains its cutoff and withholds unsupported current claims" --reporter=list` | Yes |
| TP-12-04 | Regression E2E | e2e-ui | SCN-010-031 | `tests/company-fundamentals-lab.spec.mjs` | `Regression: SCN-010-031 immaterial reviewed evidence produces one unchanged brief without narrative churn` | `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-010-031 immaterial reviewed evidence produces one unchanged brief without narrative churn" --reporter=list` | Yes |
| TP-12-05 | Broader Regression E2E | e2e-ui | SCN-010-024, SCN-010-031 | `tests/company-fundamentals-lab.spec.mjs` | Complete cumulative Feature 010 browser suite through Scope 12 including current and historical briefs | `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |

### Definition of Done

#### Core Delivery Items

- [ ] FR-010-080, FR-010-098, NFR-010-014, and NFR-010-016 are implemented through explicit per-class freshness, semantic idempotency, and append-only current/history contracts.
- [ ] SCN-010-024 and SCN-010-031 prove retained dated truth, dependent withholding, unchanged rationale, and zero duplicate proposal/narrative/history output.
- [ ] Test storage is run-owned and ephemeral; committed history is never used as a mutable test backing store.
- [ ] Scenario-specific E2E regression coverage exists for every Scope 12 user-visible behavior and the broader E2E suite passes.
- [ ] Scenario-first RED and identical-command GREEN evidence exists for every Scope 12 behavior.

#### Test Evidence Items - Exact Parity With 5 Test Plan Rows

- [ ] TP-12-01 unit evidence proves freshness, fingerprint, unchanged, and dependent-withholding production behavior.
- [ ] TP-12-02 integration evidence proves run-owned append-only history, idempotency, immutable historical refs, and rollback receipt.
- [ ] TP-12-03 Regression E2E evidence proves SCN-010-024.
- [ ] TP-12-04 Regression E2E evidence proves SCN-010-031.
- [ ] TP-12-05 broader E2E evidence proves cumulative current/history behavior through Scope 12.

#### Build Quality Gate

- [ ] Exact RED/GREEN ledger, per-class freshness matrix, twice-run semantic/hash/history counts, read-only historical-state proof, run-owned teardown, no-deferral/no-duplicate scans, accessible current/history parity, editor diagnostics, `git diff --check`, selftest, validator, artifact lint, G094 capability check, framework write guard, and changed-path classification are current and every finding is individually accounted for in `report.md`.
