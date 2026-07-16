# Scope 02: Controlled Source Ingestion And Pointer-Last Promotion

Planning authority: [spec.md](../../spec.md), [design.md](../../design.md), and the [scope index](../_index.md). Execution evidence belongs in [report.md](report.md).

**Status:** Not Started

**Scope-Kind:** runtime-behavior

**Tags:** `foundation:true`, `source-ingestion:true`, `security:true`, `publication:true`

**Depends On:** Scope 01 - Contract, Config, Validator, And Publication Foundation

**Primary Outcome:** Controlled Node adapters ingest bounded SEC and reviewed issuer evidence into a staged immutable generation, preserve amendments and rights metadata, and promote only a complete validated pointer while source failure leaves the last valid dossier usable.

## Requirement Coverage

- **Functional:** FR-010-008, FR-010-009, FR-010-099, and FR-010-100.
- **Non-functional:** NFR-010-012, NFR-010-015, NFR-010-017, and NFR-010-018.
- **Primary scenarios:** SCN-010-006 and SCN-010-027.

## Gherkin Scenarios

### SCN-010-006 - Restatement Lineage

```gherkin
Scenario: An amended filing becomes current without deleting the original
  Given two eligible observations share company, concept, period, and unit and the later accession proves an amendment relation
  When reconcileFactObservations builds the normalized fact
  Then resolutionState is restated and currentObservationId names the amended observation
  And both observation IDs remain in lineage and the change pipeline classifies the event as restatement
```

### SCN-010-027 - Optional Provider Failure

```gherkin
Scenario: Optional enrichment failure preserves the source-qualified dossier
  Given a current hash-valid SEC/issuer publication is accepted
  When an eligible optional enrichment request fails validation or transport
  Then the accepted dossier, scenario, and prior brief remain rendered
  And only that evidence class reports unavailable and no credential field or synthetic value appears
```

## UI Scenario Matrix

| Scenario | Preconditions | Steps | Exact user-visible result | Test Type |
| --- | --- | --- | --- | --- |
| SCN-010-006 | Original and proven amended observations exist in one validated publication | Open the amended metric, history, and trace | Current value carries amended filing identity; earlier value and restatement reason remain inspectable | e2e-ui |
| SCN-010-027 | Last valid publication exists and one independently dated enrichment class fails | Load the company and inspect the scoped banner/coverage | Dossier and scenario remain; only failed class is unavailable; no credential prompt or synthetic replacement appears | e2e-ui |

## Implementation Plan

1. Implement `scripts/ingest-company-fundamentals.mjs` with explicit company/cutoff selection, run-owned staging outside public paths, bounded phase receipts, and no current-pointer/history mutation before complete validation.
2. Implement the SEC adapter for only the two design-approved `data.sec.gov` endpoint families. Require non-empty `SEC_USER_AGENT` before network access; never provide a built-in value, echo it, persist it, include it in argv/receipts, or log request headers.
3. Enforce HTTPS, exact host/path allowlists, serial requests, configured minimum interval, timeout, response byte cap, attempt count, retryable statuses, JSON content type, cross-origin redirect rejection, and configured CIK response identity. Exhaustion yields a typed source failure with no proxy/provider substitution.
4. Implement `IssuerEvidenceManifest/v1` review/rights validation for exact source locator, issuer, period/window, class, units, hash, rights, and rationale. Public projection includes only rights-permitted structured facts/citations/bounded summaries.
5. Build immutable source observations, quarantine receipts for wrong-company/wrong-currency/future/non-finite/duplicate/malformed evidence, append-only restatement lineage, deterministic semantic IDs, and pointer-last promotion.
6. Add atomic integration coverage over real filesystem staging and immutable captured SEC bytes. Replay at the external boundary is explicitly recorded-source validation, separate from live SEC acquisition in Scope 14.
7. Extend the route's evidence health/restatement/source-failure states using only accepted publication objects; source transport never runs in the browser.

## Test Environment And Source Boundary

- Recorded inputs are immutable real SEC response bytes with source URL, CIK, retrieval time, response hash, and capture provenance. Adversarial cases are mutations of copies passed through production parsers/validators.
- Run-owned staging uses `tests/.tmp/<run-id>/` and is destroyed after the run; cleanup is not used to make a persistent public data path safe.
- Live SEC acquisition is absent from deterministic parser/publication/browser commands. Scope 14 runs the separately identified live acquisition gate.
- Tests never target shared monitoring, backup, deployment, manifest, or release-train state.

## Change Boundary And Rollback

**Allowed:** Scope 02 ingestion/promotion scripts, source/rights contracts in `rlcompany.js`, source-qualified fixtures, ingestion/publication tests, immutable Feature 010 object/history paths, and the route's scoped restatement/failure rendering.

**Excluded:** browser SEC/provider transport, CORS proxy logic, page-local credentials, existing provider eligibility, mutable prior objects/history, registry/navigation, Feature 002, and unrelated data paths.

**Rollback:** a failed run cannot change current state. A post-promotion rollback selects a previously validated manifest only after ref/hash revalidation and appends a rollback receipt; newer immutable objects and history remain unchanged.

## Scenario-First Red/Green Contract

Author amendment-lineage, pointer atomicity, redaction, rights, and last-valid preservation assertions first. RED must identify production source/promotion behavior; an unavailable network is not RED for recorded-source deterministic tests. Re-run identical commands for GREEN.

## Test Plan

| ID | Type | Category | Scenario | File / Location | Exact behavior / persistent title | Command | Live System |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TP-02-01 | Source contract | functional | SCN-010-006, SCN-010-027 | `tests/company-fundamentals-source-contract.functional.mjs` | Production SEC/issuer parsers consume immutable recorded real inputs, enforce identity/rights/bounds, and never expose `SEC_USER_AGENT` | `node --test tests/company-fundamentals-source-contract.functional.mjs` | No |
| TP-02-02 | Publication integration | integration | SCN-010-006, SCN-010-027 | `tests/company-fundamentals-publication.integration.mjs` | Real filesystem staging validates object graph/history and changes pointer last; injected phase failure preserves prior pointer bytes | `node --test tests/company-fundamentals-publication.integration.mjs` | Yes |
| TP-02-03 | Regression E2E | e2e-ui | SCN-010-006 | `tests/company-fundamentals-lab.spec.mjs` | `Regression: SCN-010-006 amended facts become current while original observations remain auditable` | `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-010-006 amended facts become current while original observations remain auditable" --reporter=list` | Yes |
| TP-02-04 | Regression E2E | e2e-ui | SCN-010-027 | `tests/company-fundamentals-lab.spec.mjs` | `Regression: SCN-010-027 optional source failure preserves the last valid dossier without credential prompts` | `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-010-027 optional source failure preserves the last valid dossier without credential prompts" --reporter=list` | Yes |
| TP-02-05 | Broader Regression E2E | e2e-ui | SCN-010-006, SCN-010-027 | `tests/company-fundamentals-lab.spec.mjs` | Complete cumulative Feature 010 browser suite through Scope 02 over accepted static publications | `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |

### Definition of Done

#### Core Delivery Items

- [ ] FR-010-008, FR-010-009, FR-010-099, FR-010-100, NFR-010-012, NFR-010-015, NFR-010-017, and NFR-010-018 are implemented through bounded source adapters, rights validation, immutable staging, and pointer-last promotion.
- [ ] `SEC_USER_AGENT` is required and missing/empty input blocks before network access; no built-in identity, persisted value, logged header, or credential-bearing browser surface exists.
- [ ] SCN-010-006 and SCN-010-027 preserve append-only truth and the last valid accepted dossier through production source/publication/UI behavior.
- [ ] Recorded-source deterministic validation and live external acquisition are classified and executed as separate evidence categories.
- [ ] Scenario-first RED and identical-command GREEN evidence exists for every Scope 02 behavior.

#### Test Evidence Items - Exact Parity With 5 Test Plan Rows

- [ ] TP-02-01 functional evidence proves production parsing, identity, rights, request bounds, and secret-safe receipt behavior over recorded real inputs.
- [ ] TP-02-02 integration evidence proves real staging, whole-graph validation, append-only history, pointer-last promotion, and rollback boundary.
- [ ] TP-02-03 Regression E2E evidence proves SCN-010-006 on the accepted route.
- [ ] TP-02-04 Regression E2E evidence proves SCN-010-027 without browser interception or credential UI.
- [ ] TP-02-05 broader E2E evidence proves the cumulative Scope 01-02 route behavior.

#### Build Quality Gate

- [ ] Exact RED/GREEN ledger, recorded-source provenance, no-secret-output scan, source/path allowlist tests, run-owned staging teardown, hash/history/pointer checks, editor diagnostics, `git diff --check`, selftest, validator, artifact lint, capability-foundation check, framework write guard, and changed-path classification are current and every finding is individually accounted for in `report.md`.
