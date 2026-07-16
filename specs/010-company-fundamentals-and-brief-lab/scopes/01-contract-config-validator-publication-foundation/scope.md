# Scope 01: Contract, Config, Validator, And Publication Foundation

Planning authority: [spec.md](../../spec.md), [design.md](../../design.md), and the [scope index](../_index.md). Execution evidence belongs in [report.md](report.md).

**Status:** Not Started

**Scope-Kind:** runtime-behavior

**Tags:** `foundation:true`, `source-truth:true`, `publication:true`, `ui:true`

**Depends On:** -

**Primary Outcome:** One fail-loud company contract and validator can accept a coherent source-qualified publication, preserve every material lineage edge, expose missing data honestly, and reject incoherent object graphs before any concrete source adapter or company overlay is allowed to publish.

## Requirement Coverage

- **Functional:** FR-010-001, FR-010-002, FR-010-005 through FR-010-007, FR-010-010 through FR-010-012, FR-010-101, FR-010-102, and FR-010-104.
- **Non-functional:** NFR-010-009 and NFR-010-011.
- **Primary scenarios:** SCN-010-026 and SCN-010-029.

## Gherkin Scenarios

### SCN-010-026 - Missing Field Propagation

```gherkin
Scenario: A missing concept withholds only dependent outputs
  Given an accepted dossier lacks one required fact observation while independent facts are valid
  When derived metrics and model nodes evaluate
  Then the concept remains unavailable and no zero or carried value is created
  And only dependency-reachable outputs are withheld with the missing fact ID
```

### SCN-010-029 - Claim Traceability

```gherkin
Scenario: A material Simple claim resolves to its full evidence chain
  Given a Simple direction, resilience, change, catalyst, or risk claim is rendered with data-ref
  When the user activates its trace control
  Then Sources focuses the exact observation, artifact, period/window, mapping, formula or interpretation, and consumers
  And restatements, conflicts, rights limits, and unavailable links remain in the chain
```

## UI Scenario Matrix

| Scenario | Preconditions | Steps | Exact user-visible result | Test Type |
| --- | --- | --- | --- | --- |
| SCN-010-026 | Hash-valid source-qualified publication with one absent required concept and independent valid facts | Open the direct unregistered route; inspect coverage and dependent rows | Missing concept reads `Unavailable` with the required evidence; independent facts remain visible; no zero/carry value appears | e2e-ui |
| SCN-010-029 | Publication contains a material claim with source, mapping, formula/interpretation, consumer, and rights metadata | Activate the claim's trace control and return | Sources focuses the exact chain, all limitations remain visible, and focus returns to the invoking control | e2e-ui |

## Implementation Plan

1. Add explicit `company-fundamentals.config.json` contracts for policy versions, companies, sources, mappings, archetypes, formulas, freshness, rights, peers, and Feature 002 subjects. Every required property is validated; runtime code supplies no default company, source, threshold, formula, assumption, or freshness window.
2. Add dependency-free dual-runtime `rlcompany.js` with named production validators, canonical JSON/hash-input functions, object-ref checks, closed evidence classes/states, error families, dependency propagation, and accepted projection helpers. Source decimal strings remain reconstructable and finite conversion is explicit.
3. Implement `CompanyIdentity/v1`, `ReportingPeriod/v1`, `SourceArtifact/v1`, `FactObservation/v1`, `NormalizedFact/v1`, `CompanyDossier/v1`, `CompanyPublicationManifest/v1`, and `CompanyError/v1` graph validation. Reject unknown major versions, unsafe paths, wrong-company refs, duplicate IDs, hash mismatch, unbounded strings/arrays, non-finite values, and unknown error codes.
4. Implement canonical content addressing and whole-publication validation. Summary, dossier, model, brief, read, source, and history refs must bind to one generation and company; current pointer promotion is unavailable until the complete graph validates.
5. Add a direct, unregistered `company-fundamentals-lab.html` foundation slice that loads only same-origin source-qualified objects and renders identity, evidence coverage, unavailable dependents, and exact source trace. This is real product behavior for SCN-010-026/029, not a diagnostic-only test page.
6. Use immutable captured real SEC response bytes under `tests/fixtures/company-fundamentals/source-qualified/` as recorded positive inputs. Each capture carries source URL, CIK, retrieval time, content hash, and rights metadata. Assertions validate production normalization and lineage; they never prove behavior by echoing a test-injected output literal.
7. Add one marker-bounded Feature 010 production-helper group to `scripts/selftest.mjs` only after capturing the current `497 passed, 0 failed` baseline. Preserve every existing group, order, summary, and exit behavior.

## Shared Infrastructure Impact Sweep

| Surface | Downstream contract at risk | Independent canary before broad tests | Rollback unit |
| --- | --- | --- | --- |
| `scripts/selftest.mjs` | Existing pure-helper extraction, group order, pass/fail summary, exit code | Run the unchanged baseline first; after the additive group, rerun every existing group and require no count loss | Exact Feature 010 marker-bounded group only |
| Static object loader | Same-origin path safety, hash acceptance, company isolation | Load valid and adversarial copied real objects through production loader functions | Scope-owned `rlcompany.js` loader/validator functions only |
| Browser route | Existing shared scripts and static-server behavior | Direct route plus representative existing tool boot test | Scope-owned route and Feature 010 scripts only; route remains unregistered |

## Change Boundary And Rollback

**Allowed:** `rlcompany.js`, `company-fundamentals.config.json`, the direct unregistered `company-fundamentals-lab.html` foundation slice, `scripts/validate-company-fundamentals.mjs`, scope-owned recorded-source fixtures/tests, and one additive Feature 010 block in `scripts/selftest.mjs`.

**Excluded:** `rldata.js`, `rlapp.js`, `tools.json`, `index.html`, `rlnav.js`, `scripts/brief-refresh.mjs`, Market Brief artifacts, Feature 009 assumptions, provider policies, deployment/configuration governance, and unrelated tools/tests.

**Rollback:** reverse only Scope 01 product/test hunks and the exact selftest marker. No immutable publication or history is rewritten; because the route is unregistered, existing user navigation remains unchanged.

## Scenario-First Red/Green Contract

Author missing-value propagation and complete trace-chain assertions before production behavior. RED must fail because production validation, projection, or trace behavior is absent/incorrect; fixture corruption, missing Node/Chrome, or an unrelated repository failure is not valid RED. Re-run the identical command for GREEN.

## Test Plan

| ID | Type | Category | Scenario | File / Location | Exact behavior / persistent title | Command | Live System |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TP-01-01 | Unit | unit | SCN-010-026, SCN-010-029 | `tests/company-fundamentals-contracts.unit.mjs` | Production contracts reject unknown versions/unsafe refs and propagate missing/conflicted states only through real dependency edges | `node --test tests/company-fundamentals-contracts.unit.mjs` | No |
| TP-01-02 | Complete production selftest | functional | SCN-010-026, SCN-010-029 | `scripts/selftest.mjs` | Existing 497-check baseline remains intact and the additive Feature 010 contract/hash/lineage group executes production functions | `node scripts/selftest.mjs` | No |
| TP-01-03 | Regression E2E | e2e-ui | SCN-010-026 | `tests/company-fundamentals-lab.spec.mjs` | `Regression: SCN-010-026 missing concepts remain unavailable while independent facts stay usable` | `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-010-026 missing concepts remain unavailable while independent facts stay usable" --reporter=list` | Yes |
| TP-01-04 | Regression E2E | e2e-ui | SCN-010-029 | `tests/company-fundamentals-lab.spec.mjs` | `Regression: SCN-010-029 every material claim reaches its exact source transformation and consumer chain` | `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-010-029 every material claim reaches its exact source transformation and consumer chain" --reporter=list` | Yes |
| TP-01-05 | Broader Regression E2E | e2e-ui | SCN-010-026, SCN-010-029 | `tests/company-fundamentals-lab.spec.mjs` | Complete cumulative Feature 010 browser suite through Scope 01 over the real static server without request interception | `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |

### Definition of Done

#### Core Delivery Items

- [ ] FR-010-001, FR-010-002, FR-010-005 through FR-010-007, FR-010-010 through FR-010-012, FR-010-101, FR-010-102, FR-010-104, NFR-010-009, and NFR-010-011 are implemented through explicit contracts and fail-loud validation with no browser credential path or hidden value.
- [ ] SCN-010-026 and SCN-010-029 are delivered through production projections and the direct route, with source-qualified recorded inputs and no self-validating assertion path.
- [ ] Shared Infrastructure Impact Sweep and rollback boundaries are proven before and after the exact `scripts/selftest.mjs` addition.
- [ ] Change Boundary is respected and zero excluded file families are changed.
- [ ] Scenario-first RED and identical-command GREEN evidence exists for every Scope 01 behavior.

#### Test Evidence Items - Exact Parity With 5 Test Plan Rows

- [ ] TP-01-01 unit evidence proves contract, ref, hash, closed-state, and dependency propagation production behavior.
- [ ] TP-01-02 selftest evidence preserves all existing checks and proves the additive production-helper group.
- [ ] TP-01-03 Regression E2E evidence proves SCN-010-026 on the real route.
- [ ] TP-01-04 Regression E2E evidence proves SCN-010-029 and keyboard focus return on the real route.
- [ ] TP-01-05 broader E2E evidence proves the complete cumulative Scope 01 browser behavior without interception.

#### Build Quality Gate

- [ ] Exact RED/GREEN ledger, source-qualified fixture provenance, page/script integrity, no-credential/no-private-data scans, selftest baseline parity, editor diagnostics, `git diff --check`, artifact lint, capability-foundation check, framework write guard, and changed-path classification are current and every finding is individually accounted for in `report.md`.
