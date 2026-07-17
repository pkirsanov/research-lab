# Feature 010 Scopes — Company Fundamentals And Adaptive Brief Lab

Planning authority: [spec.md](spec.md) and [design.md](design.md). User acceptance is tracked in [uservalidation.md](uservalidation.md). Execution evidence is recorded in [report.md](report.md). This is a single-file, seven-scope plan. Every scope is a vertical, user-visible slice; no later scope starts until every scope it depends on is Done.

Single-file layout is deliberate. Switching to per-scope directories would pull the retired plan's fourteen `scopes/NN/report.md` evidence directories — including the preserved foreign Scope 01 evidence at [scopes/01-contract-config-validator-publication-foundation/report.md](scopes/01-contract-config-validator-publication-foundation/report.md) — into the active per-directory report set and break scope/report parity, and that foreign evidence must not be deleted. Single-file is therefore the layout that passes the framework while preserving that evidence.

This plan replaces the retired fourteen-scope horizontal per-directory plan. The retired plan is preserved as non-executable archival prose in [Superseded Scopes (Do Not Execute)](#superseded-scopes-do-not-execute); its Scope 01 implement/test raw evidence remains untouched under [scopes/01-contract-config-validator-publication-foundation/report.md](scopes/01-contract-config-validator-publication-foundation/report.md).

## Execution Outline

### Phase Order

Three vertical delivery increments, seven sequential scopes.

1. **Increment A — Source-qualified MSFT tool (four vertical slices).** Increment A is a large net-new build on the foundation skeleton, decomposed so each slice is independently completable in one implementation pass and each leaves `node scripts/selftest.mjs`, `node scripts/validate-company-fundamentals.mjs`, and the fingerprint-bound MSFT publication green at its boundary.
   - **Scope 1 — MSFT Source-Qualified Facts, Periods, Reconciliation & Statement Integrity.** Config concept mappings and an enriched multi-fact MSFT dossier (`sec-cik-0000789019`) from retained SEC bytes through validated identity, period classification, restatement/conflict reconciliation, statement integrity (new `C010-INTEGRITY-BALANCE-SHEET`), and missing-concept honesty, rendered as a minimal Simple facts read.
   - **Scope 2 — MSFT Derived Metrics, Contextual Resilience Diagnostics, Capital Allocation & Trustworthy Simple Cockpit.** Config formulas and archetypes, transparent derived metrics, raw-beside-contextual resilience diagnostics with no universal score, capital-allocation interpretation, the MSFT archetype/KPI prioritization, and the complete Simple cockpit with separated statement/model/brief/market clocks.
   - **Scope 3 — MSFT Linked Model & User-Owned Accepted State.** The ordinary-company linked model recomputing forward outputs from one user-owned accepted state that survives evidence refresh and changes only through explicit accept/edit/reject, with actual/estimate separation and comparable forecast error.
   - **Scope 4 — MSFT Detailed Workspaces, Peers, Export, Tool Read, Registry & Regression.** The six Detailed workspaces with Simple/Detailed parity, peers, the accepted-state export, the committed `FundamentalsToolRead/v1`, registry/navigation/deep-link discoverability, and the browser regression suite.
2. **Increment B — Dynamic company brief.**
   - **Scope 5 — Dynamic Adaptive Company Brief And Feature 002 Consume-Once.** Material-change, unchanged, partial, and degraded brief/history behavior with deterministic company-specific ranking; management/rumor/sentiment/macro class boundaries; separate evidence/model/market clocks; append-only deduplicated history; and the committed owner read consumed once by Feature 002 without recomputation.
3. **Increment C — Additional archetypes and hardening.**
   - **Scope 6 — CMG And JPM Source-Qualified Overlays.** The Chipotle unit-economics/lease overlay and the JPMorgan financial-institution overlay with archetype-specific KPIs, diagnostics applicability, and the bank model family on the shared foundation — no formula or fact copied between issuers.
   - **Scope 7 — Real Canary Acquisition, Cross-Capability Regression, Accessibility, And Static-Site Hardening.** The three controlled real MSFT/CMG/JPM SEC acquisitions, cross-capability regression across registry/navigation/brief/specialist separation, full WCAG 2.2 AA keyboard/narrow/parity accessibility, and final static-site freshness/inline-script/capability hardening.

### New Types And Signatures (Foundation Skeleton Present vs Net-New Build)

The untracked Feature 010 materialization is a **foundation skeleton**, not a finished tool. Increment A is a large net-new build on top of it. This section states plainly what exists and what each slice must build; it is not a reuse-and-confirm inventory.

**Present today (foundation skeleton — reuse as-is unless a scenario proves a gap):**

- `rlcompany.js` helpers that EXIST: `canonicalizeCompanyObject`, `sha256`, `validateCompanyConfig`, `parseSecSubmissionsResponse`, `validateIdentity`, `validatePeriod`, `validateSourceArtifact`, `validateFactObservation`, `validateNormalizedFact`, `validateDossier`, `validatePublicationManifest`, `validateError`, `validatePublicationGraph`, `propagateDependencyStates`, `selectSourcesView`, a minimal `selectSimpleView`, `projectAcceptedPublication`, `loadCompanyPublication`.
- `scripts/validate-company-fundamentals.mjs` whole-publication validator; retained exact MSFT SEC capture fixtures under `tests/fixtures/company-fundamentals/source-qualified/`; the committed identity-only MSFT publication (`sec-cik-0000789019`) whose dossier revenue is deliberately absent and whose `modelPackRef` and `briefRef` are `null`; the marker-bounded Feature 010 group in `scripts/selftest.mjs`.
- `company-fundamentals-lab.html` renders a Simple-only minimal view: no `#modeSeg`, no Detailed workspaces, no export, no `RLDATA.putToolRead`, and no `rldata`/`rlapp` shell. The tool is NOT registered in `tools.json`, `index.html`, or `rlnav.js`. `tests/company-fundamentals-lab.spec.mjs` covers 2 of the ~19 Increment-A browser scenarios.
- `company-fundamentals.config.json` ships empty scaffolding: `mappings=[]`, `archetypes.definitions/assignments=[]`, `formulas=[]`, `peers=[]`, `freshnessPolicies` unconfigured, materiality not-authorized, `feature002.briefSubjects=[]`.

**Net-new to build across Increment A (does NOT exist yet):**

- `rlcompany.js` helpers ABSENT today, built by the slice that owns them: `classifyReportingPeriod`, `reconcileFactObservations`, `evaluateStatementIntegrity` (plus new `ERROR_CODES` entry `C010-INTEGRITY-BALANCE-SHEET`) in Scope 1; `evaluateDerivedMetric`, `evaluateDiagnostic`, and archetype KPI prioritization inside `selectSimpleView` in Scope 2; `evaluateModel`, `reduceScenarioDraft`, `reduceProposalDecision`, `reduceCompanySelection` in Scope 3; `selectPeersView`, `buildAcceptedExport`, `buildFundamentalsToolRead` in Scope 4. Increment B adds `rankEvidenceChanges` and `buildAdaptiveCompanyBrief`.
- Config population: MSFT `mappings` (Scope 1), `formulas` and `archetypes` (Scope 2), the ordinary-company `model` definition and scenario (Scope 3), `peers` (Scope 4), and the freshness/materiality authorizations each consuming slice needs.
- Data: an enriched multi-fact MSFT dossier (revenue plus statement facts with restatement/conflict/imbalance/capital-allocation/diagnostic fixtures) regenerated into a hash-valid publication with a non-null `modelPackRef` (Scope 3) and a committed `ownerReadRef` export (Scope 4).
- UI/registry: the full Simple cockpit and six-workspace Detailed UI, `#modeSeg`, the `rldata`/`rlapp` shell, export, `putToolRead`, registry/navigation/deep-link, and ~19 real Playwright scenarios.

**Fingerprint constraint (drives slice boundaries):** `configFingerprint` is bound into the publication manifest and the selftest, so ANY config edit re-hashes the whole publication — the publication is all-or-nothing. Each Increment-A slice therefore OWNS the config additions, data fixtures, helper(s), minimal UI wiring, and the validator plus selftest expectation updates needed to leave `node scripts/selftest.mjs`, `node scripts/validate-company-fundamentals.mjs`, and the regenerated publication green and coherent at its boundary.

**Contracts (from `design.md`, established as each slice needs them):** `CompanyIdentity/v1`, `ReportingPeriod/v1`, `SourceArtifact/v1`, `FactObservation/v1`, `NormalizedFact/v1`, `DerivedMetric/v1`, `DiagnosticCheck/v1`, `ArchetypeDefinition/v1`, `ArchetypeAssignment/v1`, `PeerSet/v1`, `CompanyDossier/v1`, `ModelDefinition/v1`, `ScenarioRevision/v1`, `EvidenceChange/v1`, `ModelImpactProposal/v1`, `AdaptiveCompanyBrief/v1`, `FundamentalsToolRead/v1`, `CompanyPublicationManifest/v1`, `CompanyAcceptedState/v1`.

- Browser route: `company-fundamentals-lab.html?company=<id>&mode=<simple|detailed>&tab=<workspace>&ref=<same-company-id>`.
- Feature 002 owner read: registry adapter `company-fundamentals-owner-v1` produced in Scope 4 and consumed once by `scripts/brief-refresh.mjs` in Scope 5.

### Validation Checkpoints

- **Design dependency order (honored inside Increment A):** the fact/period/reconciliation/integrity foundation and its regenerated publication are established before any metric, archetype, model, or publish work (Scope 1); Feature 002 integration happens only after a committed owner read exists (Scope 5, after Scope 4 publishes the read).
- **Fingerprint checkpoint (every Increment-A slice):** each slice regenerates the fingerprint-bound MSFT publication and updates the validator and the selftest Feature 010 group so that `node scripts/selftest.mjs`, `node scripts/validate-company-fundamentals.mjs`, and the publication are green and coherent at the slice boundary — no partial or hash-invalid publication is left behind.
- Scope 1 gates the tool on trustworthy MSFT numbers: validated identity/periods, restatement/conflict reconciliation, statement integrity, and missing-concept honesty, browser-proven on a minimal Simple facts read, before any metric or archetype work.
- Scope 2 gates the complete trustworthy Simple cockpit (derived metrics, raw-beside-contextual diagnostics, capital allocation, archetype/KPI prioritization, separated clocks) before any model work.
- Scope 3 gates the linked model and user-owned accepted state (recompute, actual/estimate, inert proposals) before the Detailed workspaces and publish.
- Scope 4 gates one-state Simple/Detailed parity, peers, export, and the committed `FundamentalsToolRead/v1` with registry discoverability before any adaptive-brief or Feature 002 work.
- Scope 5 gates the deterministic material/unchanged/partial/degraded brief and the Feature 002 consume-once boundary before additional archetypes.
- Scope 6 proves CMG and JPM select materially different KPIs, diagnostics, and model families from the SAME shared facts before final hardening.
- Scope 7 reruns the exact baseline selftest, the validator, the full real-browser suite, registry/brief/specialist canaries, freshness/capability checks, and the three controlled live acquisitions before the tool is considered hardened.

## Protected Shared-Surface Gate

These high-fan-out surfaces may change only in the named scope after its prerequisites pass; each requires an independent canary before edit and a scoped rollback boundary.

| Surface | Earliest owning scope | Required independent canary before edit | Rollback boundary |
| --- | --- | --- | --- |
| `scripts/selftest.mjs` | 1 | Record the current full result and verify pre-existing groups remain unchanged | Reverse only the scope-owned additive marker-bounded Feature 010 group |
| `tools.json` | 4 | Existing registry parity; every pre-existing tool ID/route remains valid | Remove only the new Feature 010 registry entry |
| `index.html` | 4 | Existing launcher entries and data-settings anchor remain discoverable | Reverse only the new launcher entry |
| `rlnav.js` | 4 | Existing shared navigation renders for representative old tools | Reverse only the new nav registration |
| `scripts/brief-refresh.mjs` | 5 | Feature 002 existing owner-read and no-action canaries pass before modification | Disable/remove only `company-fundamentals-owner-v1` |

`rldata.js` and `rlapp.js` remain excluded from active edits; an implementation-discovered shared gap requires replanning with an independent downstream canary and a scope-specific rollback path. `msft-july-print-model.html`, Feature 009 assumptions, provider eligibility, release-train configuration, deployment surfaces, and unrelated tools remain excluded. Data rollback changes only a per-company current pointer to a previously validated manifest after hash revalidation; immutable objects and append-only history are never rewritten. Test acquisition staging uses run-owned temporary paths and cannot mutate current pointers until whole-publication validation succeeds. `SEC_USER_AGENT` is a required non-secret process input; missing/empty input blocks acquisition before network access and its value is never committed, persisted, echoed, included in receipts, or logged.

## Scope 1: MSFT Source-Qualified Facts, Periods, Reconciliation & Statement Integrity (Increment A)

**Status:** Done (all 13 DoD items checked; TP-1-01 through TP-1-06 green; independently verified via resolved TR-F010-SCOPE01-TEST-OWNERSHIP-01)

**Scope-Kind:** runtime-behavior

**Tags:** `foundation:true`, `source-truth:true`, `ui:true`, `increment:A`

**Depends On:** -

**Primary Outcome:** A research user opens Microsoft (`sec-cik-0000789019`) from retained SEC source bytes and receives trustworthy numbers in a minimal Simple facts read: verified identity, exact-meaning periods (annual/quarter/YTD/instant/amended), reconciled facts whose amendments are restated and whose genuine disagreements stay conflicted (never averaged), statement integrity that blocks only dependent conclusions while source facts stay inspectable, and missing concepts that remain explicitly unavailable rather than zero — every material number traceable to source, with no fabricated value and no credentialed browser request. This slice establishes and regenerates the fingerprint-bound multi-fact MSFT publication that Scopes 2–4 extend.

### Requirement Coverage

- **Functional:** FR-010-001 through FR-010-012 (identity, periods, source truth, freshness, clocks); FR-010-013 through FR-010-022 (historical statements and accounting integrity); FR-010-088 (Simple default); FR-010-099 through FR-010-102 and FR-010-104 (failure, first-view credential/privacy boundary, insufficient evidence).
- **Non-functional:** NFR-010-001 (source-qualified first view), NFR-010-009 through NFR-010-012 (determinism, explainability, no fallback success, append-only corrections), NFR-010-017 (credential/private-research exclusion), NFR-010-022 (fiscal/currency/sparse tolerance).
- **Primary scenarios:** SCN-010-004, SCN-010-005, SCN-010-006, SCN-010-025, SCN-010-026.

### Gherkin Scenarios

```gherkin
Scenario: SCN-010-004 annual quarterly YTD and instant history preserve exact period meaning
  Given one company dossier contains compatible and incompatible ReportingPeriod records
  When the user selects annual, quarterly, trailing, and comparison controls
  Then each computed delta uses only matching duration, concept, unit, currency, and comparability states
  And a YTD or instant observation never appears as a standalone quarter

Scenario: SCN-010-005 statement imbalance blocks clean dependent conclusions and preserves source facts
  Given a copied accepted SEC fact set is changed so assets fall outside the summed XBRL rounding intervals for liabilities and equity
  When the production publication validator runs statement integrity and dependent projections
  Then it emits C010-INTEGRITY-BALANCE-SHEET with input refs, difference, and allowed interval
  And clean resilience plus dependent model and brief outputs are blocked while source facts remain inspectable

Scenario: SCN-010-006 amended facts become current while original observations remain auditable
  Given two eligible observations share company, concept, period, and unit and the later accession proves an amendment relation
  When reconcileFactObservations builds the normalized fact
  Then resolutionState is restated and currentObservationId names the amended observation
  And both observation IDs remain in lineage and the change pipeline classifies the event as restatement

Scenario: SCN-010-025 conflicting sources remain visible and never become an average
  Given two eligible observations appear to map to one company concept and period but materially disagree without amendment relation
  When reconciliation and dependent projections run
  Then both observations remain visible and the normalized fact state is conflicted
  And no average is created and dependent metrics, anchors, and claims inherit conflicted or unavailable state

Scenario: SCN-010-026 missing concepts remain unavailable while independent facts stay usable
  Given an accepted dossier lacks one required fact observation while independent facts are valid
  When derived metrics and model nodes evaluate
  Then the concept remains unavailable and no zero or carried value is created
  And only dependency-reachable outputs are withheld with the missing fact ID
```

### Implementation Plan

1. Reuse the existing skeleton contracts and validators (`validateCompanyConfig`, the `validate*` family, `validatePublicationGraph`, `propagateDependencyStates`, `loadCompanyPublication`, `projectAcceptedPublication`) and the retained exact MSFT SEC capture; keep fail-loud config validation with no default company/source/threshold/freshness value.
2. Populate MSFT concept `mappings` in `company-fundamentals.config.json` (empty today) so statement facts map to `FactObservation/v1`/`NormalizedFact/v1`; the `configFingerprint` change re-hashes the whole publication, so regenerate it within this slice.
3. Build the enriched multi-fact MSFT dossier data: revenue plus the income/balance/cash statement facts, an amendment pair, a genuine conflict pair, and a deliberately imbalanced balance-sheet fixture, all from retained bytes through the content-addressed objects with the current pointer swapped last, honoring the required `SEC_USER_AGENT` process input.
4. Build the net-new helpers `classifyReportingPeriod` (annual/quarter/YTD/instant/amended, never a YTD or instant as a standalone quarter), `reconcileFactObservations` (restatement sets `resolutionState=restated` and `currentObservationId` and keeps both observation IDs in lineage; genuine disagreement stays `conflicted`, never averaged), and `evaluateStatementIntegrity` (adds the new `ERROR_CODES` entry `C010-INTEGRITY-BALANCE-SHEET` with input refs, difference, and allowed rounding interval), propagating missing/conflicted/restated states only through real dependency edges (SCN-010-004/005/006/025/026).
5. Extend the minimal `selectSimpleView` and `company-fundamentals-lab.html` to render identity, period selection, reconciled/restated/conflicted facts, statement-integrity blocking, and missing-concept honesty from one accepted state over the real static server with no credential field.
6. Regenerate `scripts/validate-company-fundamentals.mjs` expectations and the marker-bounded Feature 010 group in `scripts/selftest.mjs` to the new hash-valid multi-fact publication after recording the current full baseline; add only additive production-helper checks and leave every pre-existing group unchanged.

### Shared Infrastructure Impact Sweep

| Surface | Downstream contract at risk | Independent canary before broad tests | Rollback unit |
| --- | --- | --- | --- |
| `scripts/selftest.mjs` | Existing pure-helper extraction, group order, pass/fail summary, exit code | Run the unchanged baseline first; after the additive group, rerun every existing group and require no count loss | Exact Feature 010 marker-bounded group only |
| Static object loader (`rlcompany.js`) | Same-origin path safety, hash acceptance, company isolation | Load valid and adversarial copied real objects through production loader functions | Scope-owned loader/validator functions only |
| `company-fundamentals-lab.html` Simple route | Existing shared scripts and static-server behavior | Direct route plus a representative existing tool boot test | Scope-owned route and Feature 010 scripts only |

### Change Boundary And Rollback

**Allowed:** `rlcompany.js`, `company-fundamentals.config.json`, the Simple surfaces of `company-fundamentals-lab.html`, `scripts/validate-company-fundamentals.mjs`, scope-owned recorded-source fixtures/tests, and the additive Feature 010 block in `scripts/selftest.mjs`.

**Excluded:** `rldata.js`, `rlapp.js`, `tools.json`, `index.html`, `rlnav.js`, `scripts/brief-refresh.mjs`, Market Brief artifacts, Feature 009 assumptions, provider policies, deployment/configuration governance, and unrelated tools/tests.

**Rollback:** reverse only Scope 1 product/test hunks and the exact selftest marker; no immutable publication or history is rewritten.

### Test Plan

| ID | Type | Category | Scenario | File / Location | Exact behavior / persistent title | Command | Live System |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TP-1-01 | Unit | unit | SCN-010-004, SCN-010-005, SCN-010-006, SCN-010-025, SCN-010-026 | `tests/company-fundamentals-contracts.unit.mjs` | Production `classifyReportingPeriod`, `reconcileFactObservations`, and `evaluateStatementIntegrity` helpers preserve period meaning, set restated/conflicted states without averaging, emit `C010-INTEGRITY-BALANCE-SHEET`, and withhold only dependency-reachable outputs | `node --test tests/company-fundamentals-contracts.unit.mjs` | No |
| TP-1-02 | Complete production selftest | functional | SCN-010-004, SCN-010-005, SCN-010-006, SCN-010-025, SCN-010-026 | `scripts/selftest.mjs` | Existing baseline remains intact and the additive Feature 010 period/reconciliation/integrity group executes production functions over the regenerated multi-fact publication | `node scripts/selftest.mjs` | No |
| TP-1-03 | Integration validator | integration | SCN-010-004, SCN-010-005, SCN-010-006, SCN-010-025, SCN-010-026 | `scripts/validate-company-fundamentals.mjs` | Whole-publication validation of the regenerated MSFT multi-fact publication proves exact retained bytes, statement integrity, and restatement/conflict lineage | `node scripts/validate-company-fundamentals.mjs` | No |
| TP-1-04 | Regression E2E | e2e-ui | SCN-010-004, SCN-010-005, SCN-010-006 | `tests/company-fundamentals-lab.spec.mjs` | Persistent titles `Regression: SCN-010-004 annual quarterly YTD and instant history preserve exact period meaning`, `Regression: SCN-010-005 statement imbalance blocks clean dependent conclusions and preserves source facts`, `Regression: SCN-010-006 amended facts become current while original observations remain auditable` | `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "SCN-010-004\|SCN-010-005\|SCN-010-006" --reporter=list` | Yes |
| TP-1-05 | Regression E2E | e2e-ui | SCN-010-025, SCN-010-026 | `tests/company-fundamentals-lab.spec.mjs` | Persistent titles `Regression: SCN-010-025 conflicting sources remain visible and never become an average`, `Regression: SCN-010-026 missing concepts remain unavailable while independent facts stay usable` | `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "SCN-010-025\|SCN-010-026" --reporter=list` | Yes |
| TP-1-06 | Broader Regression E2E | e2e-ui | SCN-010-004, SCN-010-005, SCN-010-006, SCN-010-025, SCN-010-026 | `tests/company-fundamentals-lab.spec.mjs` | Complete cumulative Feature 010 browser suite through Scope 1 over the real static server without request interception | `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |

### Definition of Done

**Core Delivery Items**

- [x] FR-010-001 through FR-010-012, FR-010-013 through FR-010-022, FR-010-088, FR-010-099 through FR-010-102, FR-010-104, NFR-010-001, NFR-010-009 through NFR-010-012, NFR-010-017, and NFR-010-022 are delivered through explicit contracts and fail-loud validation with no browser credential path or hidden value. (evidence: [report.md](report.md#scope-1-execution))
- [x] SCN-010-004, SCN-010-005, SCN-010-006, SCN-010-025, and SCN-010-026 are delivered through production period/reconciliation/integrity projections and the real minimal Simple facts route over source-qualified recorded MSFT inputs with no self-validating assertion path. (evidence: [report.md](report.md#scenario-evidence-map))
- [x] The regenerated fingerprint-bound MSFT multi-fact publication is hash-valid, and `node scripts/selftest.mjs` plus `node scripts/validate-company-fundamentals.mjs` are green at the slice boundary. (evidence: [report.md](report.md#tp-1-02--node-scriptsselftestmjs-exit-0))
- [x] Shared Infrastructure Impact Sweep and rollback boundaries are proven before and after the exact `scripts/selftest.mjs` addition. (evidence: [report.md](report.md#build-quality) — selftest additive 508→511, single 70-line additive hunk, zero removals)
- [x] Change Boundary is respected and zero excluded file families are changed. (evidence: [report.md](report.md#build-quality))
- [x] Scenario-first RED and identical-command GREEN evidence exists for every Scope 1 behavior. (evidence: RED — helpers `undefined` + validator `FAIL C010-CONFIG-VERSION` on the stale publication; GREEN — [report.md](report.md#scope-1-execution))

**Test Evidence Items — Exact Parity With 6 Test Plan Rows**

- [x] TP-1-01 unit evidence proves period/reconciliation/integrity production behavior. (evidence: [report.md](report.md#tp-1-01--node---test-testscompany-fundamentals-contractsunitmjs-exit-0))
- [x] TP-1-02 selftest evidence preserves all existing checks and proves the additive period/reconciliation/integrity group. (evidence: [report.md](report.md#tp-1-02--node-scriptsselftestmjs-exit-0))
- [x] TP-1-03 validator evidence proves whole-publication integrity and restatement/conflict lineage on the regenerated MSFT publication. (evidence: [report.md](report.md#tp-1-03--node-scriptsvalidate-company-fundamentalsmjs-exit-0))
- [x] TP-1-04 Regression E2E evidence proves SCN-010-004/005/006 on the real route. (evidence: [report.md](report.md#tp-1-04--npx---no-install-playwright-test-testscompany-fundamentals-labspecmjs---configplaywrightconfigmjs---projectsystem-chrome---grep-scn-010-004scn-010-005scn-010-006---reporterlist-exit-0))
- [x] TP-1-05 Regression E2E evidence proves SCN-010-025/026 on the real route. (evidence: [report.md](report.md#tp-1-05--npx---no-install-playwright-test-testscompany-fundamentals-labspecmjs---configplaywrightconfigmjs---projectsystem-chrome---grep-scn-010-025scn-010-026---reporterlist-exit-0))
- [x] TP-1-06 broader E2E evidence proves the complete cumulative Scope 1 browser behavior without interception. (evidence: [report.md](report.md#tp-1-06--npx---no-install-playwright-test-testscompany-fundamentals-labspecmjs---configplaywrightconfigmjs---projectsystem-chrome---reporterlist-exit-0))

**Build Quality Gate**

- [x] Exact RED/GREEN ledger, source-qualified fixture provenance, page/script integrity, no-credential/no-private-data scans, selftest baseline parity, editor diagnostics, `git diff --check`, artifact lint, capability-foundation check, and framework write guard are current and every finding is individually accounted for in `report.md`. (evidence: [report.md](report.md#build-quality); artifact-lint / traceability-guard / capability-foundation-guard / framework-write-guard run green at the slice boundary)

## Scope 2: MSFT Derived Metrics, Contextual Resilience Diagnostics, Capital Allocation & Trustworthy Simple Cockpit (Increment A)

**Status:** Done (all 13 Definition-of-Done items checked; TP-2-01 through TP-2-07 executed green; shared facts proven byte-stable; scenario-first RED/GREEN ledger recorded in [report.md](report.md#scope-2-execution))

**Scope-Kind:** runtime-behavior

**Tags:** `overlay:true`, `ui:true`, `increment:A`

**Depends On:** 1

**Primary Outcome:** A research user reading Microsoft receives the complete trustworthy Simple cockpit: transparent derived metrics with exposed formulas and inputs, raw-beside-contextual resilience diagnostics with no universal score, capital-allocation interpretation that accounts for issuance and dilution, MSFT-prioritized company-specific drivers that never mutate shared facts, and an optional-source failure that preserves the last valid dossier without a credential prompt — every clock (statement/model/brief/market) separate, and an unclassified company inheriting no convenient lens.

### Requirement Coverage

- **Functional:** FR-010-023 through FR-010-040 (derived metrics, capital allocation, contextual resilience lens); FR-010-041 through FR-010-047 (archetype/KPI foundation and MSFT prioritization); FR-010-088 (Simple default); FR-010-104 (insufficient evidence).
- **Non-functional:** NFR-010-001 (source-qualified first view), NFR-010-009 through NFR-010-012 (determinism, explainability, no fallback success, append-only corrections), NFR-010-017 (credential/private-research exclusion).
- **Primary scenarios:** SCN-010-001, SCN-010-008, SCN-010-009, SCN-010-010, SCN-010-011, SCN-010-012, SCN-010-027.

### Gherkin Scenarios

```gherkin
Scenario: SCN-010-001 Microsoft opens with a company-specific Simple read
  Given CompanyIndex maps MSFT to sec-cik-0000789019 and its current pointer selects a hash-valid publication with sourced software KPIs and separately dated market evidence
  When the browser GETs the index, pointer, manifest, and referenced summary objects and renders Simple
  Then the accepted state prioritizes cloud, backlog, capex, depreciation, margin, cash-conversion, and dilution records that exist
  And the statement, model, brief, and market cutoffs equal the owner objects and the MSFT specialist cutoff remains separate

Scenario: SCN-010-008 archetypes change KPI priority without changing shared financial facts
  Given MSFT and CMG publications use the same normalized revenue and cash-flow contracts but different accepted archetypes
  When selectSimpleView runs for each accepted state
  Then MSFT prioritizes software drivers and the shared fact IDs, values, periods, units, and sources remain byte-equivalent to their dossier records

Scenario: SCN-010-009 unclassified companies retain shared facts and inherit no default lens
  Given a verified company publication has shared statements but an unclassified archetype assignment
  When Simple and Detailed selectors run
  Then shared statements and source trace remain available
  And KPI priorities, archetype diagnostics, model definition, and company-specific brief claims are unavailable with evidence requirements

Scenario: SCN-010-010 raw and contextual diagnostics remain side by side with complete trace
  Given a DiagnosticCheck has valid raw inputs and one evidenced contextual adjustment
  When the Resilience workspace selects that check
  Then raw value, formula, threshold, input refs, and period render before contextual output
  And adjustment amount, rationale, source refs, sensitivity, and applicability render without erasing the raw record

Scenario: SCN-010-011 omitted preferred stock is absent from source and never zero or pass
  Given no eligible observation proves preferred stock present or explicit zero
  When the preferred-stock diagnostic runs
  Then its state is absent-from-eligible-source or unavailable
  And no numeric zero, positive interpretation, or summary pass is emitted

Scenario: SCN-010-012 buyback interpretation includes issuance dilution and net share change
  Given a publication contains gross repurchases, treasury stock, issuance, SBC, diluted shares, debt change, and available price context
  When the capital-allocation metric and interpretation run
  Then gross repurchase and treasury balance remain distinct from period flows
  And any interpretation cites net share change and dilution rather than treating repurchase existence as beneficial

Scenario: SCN-010-027 optional source failure preserves the last valid dossier without credential prompts
  Given a current hash-valid SEC/issuer publication is accepted
  When an eligible optional enrichment request fails validation or transport
  Then the accepted dossier, scenario, and prior brief remain rendered
  And only that evidence class reports unavailable and no credential field or synthetic value appears
```

### Implementation Plan

1. Reuse the Scope 1 fact/period/reconciliation/integrity foundation and the minimal `selectSimpleView`; extend the publication rather than rebuilding it.
2. Populate `formulas` and `archetypes` (definitions and MSFT assignment) in `company-fundamentals.config.json` (empty today); the `configFingerprint` change re-hashes the whole publication, so regenerate it within this slice.
3. Build the net-new `evaluateDerivedMetric` (expose formula, inputs, and qualifications with no universal score) and `evaluateDiagnostic` (raw value/formula/threshold/input refs/period render before any evidenced contextual adjustment; preferred-stock absence stays absent-from-eligible-source and never zero; capital-allocation interpretation cites net share change and dilution) (SCN-010-010/011/012).
4. Build archetype KPI prioritization inside `selectSimpleView` so the MSFT archetype reorders company-specific drivers WITHOUT mutating any shared fact ID/value/period/unit/source, while an unclassified assignment inherits no lens and shared statements and source trace remain available (SCN-010-001/008/009).
5. Extend `company-fundamentals-lab.html` into the complete Simple cockpit: identity, evidence coverage, direction, resilience (raw beside contextual), top drivers, freshness, separated statement/model/brief/market clocks, and an optional-source failure that preserves the accepted dossier without a credential field (SCN-010-001/027).
6. Regenerate the validator expectations and the marker-bounded Feature 010 selftest group to the new hash-valid publication after recording the current baseline; add only additive production-helper checks and leave every pre-existing group unchanged.

### Shared Infrastructure Impact Sweep

| Surface | Downstream contract at risk | Independent canary before broad tests | Rollback unit |
| --- | --- | --- | --- |
| `scripts/selftest.mjs` | Existing group order and summary | Rerun the full baseline; require no count loss after the additive metric/diagnostic/archetype group | Exact Feature 010 marker-bounded group only |
| `company-fundamentals-lab.html` Simple cockpit | Scope 1 minimal facts render and shared static scripts | Re-run the Scope 1 facts route before adding the metric/diagnostic/archetype cockpit sections | Scope-owned Simple cockpit sections only |
| Derived-metric/diagnostic evaluators (`rlcompany.js`) | Shared fact IDs/values remain byte-stable | Assert shared facts are byte-equivalent before and after archetype prioritization | Scope-owned evaluator/selector functions only |

### Change Boundary And Rollback

**Allowed:** `rlcompany.js` metric/diagnostic/archetype helpers, `formulas`/`archetypes` in `company-fundamentals.config.json`, the Simple cockpit surfaces of `company-fundamentals-lab.html`, `scripts/validate-company-fundamentals.mjs`, scope-owned tests, and the additive Feature 010 selftest block.

**Excluded:** `rldata.js`, `rlapp.js`, `tools.json`, `index.html`, `rlnav.js`, `scripts/brief-refresh.mjs`, Market Brief artifacts, Feature 009 assumptions, provider policies, deployment/configuration governance, and unrelated tools/tests.

**Rollback:** reverse only Scope 2 product/test hunks and the exact selftest marker; the immutable Scope 1 objects and append-only history are never rewritten.

### Test Plan

| ID | Type | Category | Scenario | File / Location | Exact behavior / persistent title | Command | Live System |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TP-2-01 | Unit | unit | SCN-010-001, SCN-010-008, SCN-010-009, SCN-010-010, SCN-010-011, SCN-010-012, SCN-010-027 | `tests/company-fundamentals-contracts.unit.mjs` | Production `evaluateDerivedMetric`, `evaluateDiagnostic`, and archetype-prioritized `selectSimpleView` expose formulas/inputs, keep raw beside contextual with no universal score, and never mutate shared facts | `node --test tests/company-fundamentals-contracts.unit.mjs` | No |
| TP-2-02 | Complete production selftest | functional | SCN-010-001, SCN-010-008, SCN-010-009, SCN-010-010, SCN-010-011, SCN-010-012, SCN-010-027 | `scripts/selftest.mjs` | Existing baseline remains intact and the additive Feature 010 metric/diagnostic/archetype group executes production functions over the regenerated publication | `node scripts/selftest.mjs` | No |
| TP-2-03 | Integration validator | integration | SCN-010-001, SCN-010-008, SCN-010-009, SCN-010-010, SCN-010-011, SCN-010-012, SCN-010-027 | `scripts/validate-company-fundamentals.mjs` | Whole-publication validation of the regenerated publication proves derived metrics, diagnostics, and archetype prioritization keep shared facts byte-stable | `node scripts/validate-company-fundamentals.mjs` | No |
| TP-2-04 | Regression E2E | e2e-ui | SCN-010-010, SCN-010-011, SCN-010-012 | `tests/company-fundamentals-lab.spec.mjs` | Persistent titles `Regression: SCN-010-010 raw and contextual diagnostics remain side by side with complete trace`, `Regression: SCN-010-011 omitted preferred stock is absent from source and never zero or pass`, `Regression: SCN-010-012 buyback interpretation includes issuance dilution and net share change` | `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "SCN-010-010\|SCN-010-011\|SCN-010-012" --reporter=list` | Yes |
| TP-2-05 | Regression E2E | e2e-ui | SCN-010-001, SCN-010-008, SCN-010-009 | `tests/company-fundamentals-lab.spec.mjs` | Persistent titles `Regression: SCN-010-001 Microsoft Simple prioritizes sourced software drivers and preserves separate clocks`, `Regression: SCN-010-008 archetypes change KPI priority without changing shared financial facts`, `Regression: SCN-010-009 unclassified companies retain shared facts and inherit no default lens` | `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "SCN-010-001\|SCN-010-008\|SCN-010-009" --reporter=list` | Yes |
| TP-2-06 | Regression E2E | e2e-ui | SCN-010-027 | `tests/company-fundamentals-lab.spec.mjs` | Persistent title `Regression: SCN-010-027 optional source failure preserves the last valid dossier without credential prompts` | `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "SCN-010-027" --reporter=list` | Yes |
| TP-2-07 | Broader Regression E2E | e2e-ui | SCN-010-001, SCN-010-008, SCN-010-009, SCN-010-010, SCN-010-011, SCN-010-012, SCN-010-027 | `tests/company-fundamentals-lab.spec.mjs` | Complete cumulative Feature 010 browser suite through Scope 2 over the real static server without request interception | `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |

### Definition of Done

**Core Delivery Items**

- [x] FR-010-023 through FR-010-040, FR-010-041 through FR-010-047, FR-010-088, FR-010-104, NFR-010-001, NFR-010-009 through NFR-010-012, and NFR-010-017 are delivered through explicit metric/diagnostic/archetype contracts with no universal score and no browser credential path.
- [x] SCN-010-001, SCN-010-008, SCN-010-009, SCN-010-010, SCN-010-011, SCN-010-012, and SCN-010-027 are delivered through production derived-metric, diagnostic, and archetype-prioritized Simple projections over the real route with no self-validating assertion path.
- [x] The regenerated fingerprint-bound publication is hash-valid, shared facts remain byte-stable, and `node scripts/selftest.mjs` plus `node scripts/validate-company-fundamentals.mjs` are green at the slice boundary.
- [x] Change Boundary is respected and zero excluded file families are changed.
- [x] Scenario-first RED and identical-command GREEN evidence exists for every Scope 2 behavior.

**Test Evidence Items — Exact Parity With 7 Test Plan Rows**

- [x] TP-2-01 unit evidence proves derived-metric, diagnostic, and archetype-prioritization production behavior with byte-stable shared facts.
- [x] TP-2-02 selftest evidence preserves all existing checks and proves the additive metric/diagnostic/archetype group.
- [x] TP-2-03 validator evidence proves the regenerated publication keeps shared facts byte-stable under the new derived layer.
- [x] TP-2-04 Regression E2E evidence proves SCN-010-010/011/012 on the real route.
- [x] TP-2-05 Regression E2E evidence proves SCN-010-001/008/009 on the real route.
- [x] TP-2-06 Regression E2E evidence proves SCN-010-027 on the real route.
- [x] TP-2-07 broader E2E evidence proves the complete cumulative Scope 2 browser behavior without interception. (evidence: [report.md](report.md#scope-2-execution) — TP-2-07 full cumulative suite, 13 passed, exit 0)

**Build Quality Gate**

- [x] Exact RED/GREEN ledger, shared-fact byte-stability proof, no-universal-score scan, no-credential/no-private-data scans, selftest baseline parity, editor diagnostics, `git diff --check`, artifact lint, capability-foundation check, and framework write guard are current and every finding is individually accounted for in `report.md`.

## Scope 3: MSFT Linked Model & User-Owned Accepted State (Increment A)

**Status:** Not Started

**Scope-Kind:** runtime-behavior

**Tags:** `overlay:true`, `integration:true`, `increment:A`

**Depends On:** 2

**Primary Outcome:** A research user models Microsoft from one user-owned accepted state: the ordinary-company linked model recomputes only dependency-reachable outputs from one draft tuple and reports the dependency path of any invalid node, evidence refresh never rebases accepted assumptions but raises separate pending proposals, actual and estimate observations keep separate classes/clocks with comparable forecast error, and the active scenario revision changes only when the user accepts or edits and confirms — with proposal arrival inert and rejection recorded without change. This slice makes the publication `modelPackRef` non-null.

### Requirement Coverage

- **Functional:** FR-010-051 through FR-010-062 (linked scenario modeling and actual/estimate separation); FR-010-078 and FR-010-079 (proposal decisions and revision creation).
- **Non-functional:** NFR-010-002 through NFR-010-004 (transition responsiveness, history rendering scale, stable controls); NFR-010-019 (local scenario state never shared without export).
- **Primary scenarios:** SCN-010-013, SCN-010-014, SCN-010-016, SCN-010-023.

### Gherkin Scenarios

```gherkin
Scenario: SCN-010-013 evidence refresh preserves accepted user assumptions and creates pending proposals only
  Given local scenario revision U3 is active for the same company and model definition
  When a newer hash-valid company publication is accepted
  Then U3 values and revision identity remain active without rebasing
  And affected drivers receive separate ModelImpactProposal records requiring a user decision

Scenario: SCN-010-014 one driver edit recomputes linked outputs and exposes every invalid dependency
  Given an accepted scenario and acyclic model definition produce valid linked outputs
  When editAssumption changes one company-specific driver and creates a draft
  Then every reachable statement, cash, balance, KPI, per-share, and valuation node recomputes from the draft tuple
  And unreachable history is unchanged and any failed node reports its dependency path

Scenario: SCN-010-016 sourced actuals preserve prior estimates classes clocks and comparable forecast error
  Given an estimate observation exists for a period and a later eligible filing supplies a comparable reported observation
  When the publication reconciles the period
  Then estimate and reported observations retain separate classes, sources, and clocks
  And forecast error is derived only when definition, unit, currency, and period are compatible

Scenario: SCN-010-023 proposal arrival is inert and confirmation alone creates a new scenario revision
  Given active scenario revision R4 and a validated pending proposal target one assumption
  When the proposal arrives or the user opens it
  Then R4 remains active and unchanged
  And when the user accepts or edits and confirms, a new immutable revision R5 is created, and rejection instead records a decision with no revision change
```

### Implementation Plan

1. Reuse the Scope 2 accepted-state projection and the regenerated publication; extend it with the model pack rather than rebuilding it.
2. Populate the ordinary-company `model` definition and an accepted scenario in `company-fundamentals.config.json` and `data/company-fundamentals/**`; the `configFingerprint` change re-hashes the publication and `modelPackRef` becomes non-null, so regenerate the publication within this slice.
3. Build the net-new `evaluateModel` (recompute only dependency-reachable statement/cash/balance/KPI/per-share/valuation nodes from one draft tuple, block cycles/non-finite/invalid branches with explicit dependency-path reasons, never mutate history) and `reduceScenarioDraft` (SCN-010-014).
4. Build actual/estimate separation and forecast-error derivation only for compatible definition/unit/currency/period, keeping separate classes, sources, and clocks (SCN-010-016).
5. Build the accepted-state reducers `reduceCompanySelection` and `reduceProposalDecision` so evidence refresh cannot rebase user assumptions (affected drivers get separate `ModelImpactProposal` records), proposal arrival is inert, accept/edit confirmation creates one new immutable revision, and rejection records a decision without change (SCN-010-013/023).
6. Regenerate the validator expectations and the marker-bounded Feature 010 selftest group to the new hash-valid publication with a non-null `modelPackRef` after recording the baseline; additive checks only, every pre-existing group unchanged.

### Shared Infrastructure Impact Sweep

| Surface | Downstream contract at risk | Independent canary before broad tests | Rollback unit |
| --- | --- | --- | --- |
| `scripts/selftest.mjs` | Existing group order and summary | Rerun the full baseline; require no count loss after the additive model/state group | Exact Feature 010 marker-bounded group only |
| Model/accepted-state reducers (`rlcompany.js`) | Scope 2 Simple cockpit values remain stable | Re-run the Scope 2 Simple route before adding model recompute | Scope-owned model/reducer functions only |
| Publication `modelPackRef` (`data/company-fundamentals/**`) | Immutable objects and append-only history | Validate the regenerated model-pack publication before pointer swap | Per-company current pointer to the prior validated manifest only |

### Change Boundary And Rollback

**Allowed:** `rlcompany.js` model/reducer helpers, the `model`/scenario entries in `company-fundamentals.config.json` and `data/company-fundamentals/**`, the model and scenario surfaces of `company-fundamentals-lab.html`, `scripts/validate-company-fundamentals.mjs`, scope-owned tests, and the additive Feature 010 selftest block.

**Excluded:** `rldata.js`, `rlapp.js`, `tools.json`, `index.html`, `rlnav.js`, `scripts/brief-refresh.mjs`, Market Brief artifacts, Feature 009 assumptions, provider policies, and unrelated tools/tests.

**Rollback:** reverse only Scope 3 product/test hunks; immutable prior objects and append-only history are never rewritten and the data pointer reverts only to a previously validated manifest after hash revalidation.

### Test Plan

| ID | Type | Category | Scenario | File / Location | Exact behavior / persistent title | Command | Live System |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TP-3-01 | Unit | unit | SCN-010-013, SCN-010-014, SCN-010-016, SCN-010-023 | `tests/company-fundamentals-contracts.unit.mjs` | Production `evaluateModel`, `reduceScenarioDraft`, `reduceCompanySelection`, and `reduceProposalDecision` recompute only reachable nodes, keep actual/estimate classes separate, and change the active revision only on explicit confirmation | `node --test tests/company-fundamentals-contracts.unit.mjs` | No |
| TP-3-02 | Complete production selftest | functional | SCN-010-013, SCN-010-014, SCN-010-016, SCN-010-023 | `scripts/selftest.mjs` | Existing baseline remains intact and the additive Feature 010 model/state group executes production functions over the regenerated model-pack publication | `node scripts/selftest.mjs` | No |
| TP-3-03 | Integration validator | integration | SCN-010-013, SCN-010-014, SCN-010-016, SCN-010-023 | `scripts/validate-company-fundamentals.mjs` | Whole-publication validation proves the non-null `modelPackRef` model pack recomputes from one generation and rejects drift | `node scripts/validate-company-fundamentals.mjs` | No |
| TP-3-04 | Regression E2E | e2e-ui | SCN-010-014, SCN-010-016 | `tests/company-fundamentals-lab.spec.mjs` | Persistent titles `Regression: SCN-010-014 one driver edit recomputes linked outputs and exposes every invalid dependency`, `Regression: SCN-010-016 sourced actuals preserve prior estimates classes clocks and comparable forecast error` | `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "SCN-010-014\|SCN-010-016" --reporter=list` | Yes |
| TP-3-05 | Regression E2E | e2e-ui | SCN-010-013, SCN-010-023 | `tests/company-fundamentals-lab.spec.mjs` | Persistent titles `Regression: SCN-010-013 evidence refresh preserves accepted user assumptions and creates pending proposals only`, `Regression: SCN-010-023 proposal arrival is inert and confirmation alone creates a new scenario revision` | `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "SCN-010-013\|SCN-010-023" --reporter=list` | Yes |
| TP-3-06 | Broader Regression E2E | e2e-ui | SCN-010-013, SCN-010-014, SCN-010-016, SCN-010-023 | `tests/company-fundamentals-lab.spec.mjs` | Complete cumulative Feature 010 browser suite through Scope 3 over the real static server without request interception | `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |

### Definition of Done

**Core Delivery Items**

- [x] FR-010-051 through FR-010-062, FR-010-078, FR-010-079, NFR-010-002 through NFR-010-004, and NFR-010-019 are delivered with a dependency-reachable linked model, user-owned assumptions inert against refresh, and revision change only on explicit confirmation.
- [x] SCN-010-013, SCN-010-014, SCN-010-016, and SCN-010-023 are delivered through production model, reducer, and actual/estimate projections with no self-validating assertion path.
- [x] The regenerated fingerprint-bound publication has a non-null `modelPackRef`, is hash-valid, and `node scripts/selftest.mjs` plus `node scripts/validate-company-fundamentals.mjs` are green at the slice boundary.
- [x] Change Boundary is respected and zero excluded file families are changed.
- [x] Scenario-first RED and identical-command GREEN evidence exists for every Scope 3 behavior.

**Test Evidence Items — Exact Parity With 6 Test Plan Rows**

- [x] TP-3-01 unit evidence proves model recompute, reducer, and actual/estimate production behavior.
- [x] TP-3-02 selftest evidence preserves all existing checks and proves the additive model/state group.
- [x] TP-3-03 validator evidence proves the non-null model-pack publication recomputes from one generation with drift rejection.
- [x] TP-3-04 Regression E2E evidence proves SCN-010-014/016 on the real route.
- [x] TP-3-05 Regression E2E evidence proves SCN-010-013/023 on the real route.
- [x] TP-3-06 broader E2E evidence proves the complete cumulative Scope 3 browser behavior without interception. (evidence: [report.md](report.md#scope-3-execution) — TP-3-06 full cumulative suite, 17 passed, exit 0)

**Build Quality Gate**

- [x] Exact RED/GREEN ledger, model-graph acyclicity/dependency-path proof, history-immutability scan, selftest baseline parity, editor diagnostics, `git diff --check`, artifact lint, capability-foundation check, and framework write guard are current and every finding is individually accounted for in `report.md`. (evidence: [report.md](report.md#build-quality))

## Scope 4: MSFT Detailed Workspaces, Peers, Export, Tool Read, Registry & Regression (Increment A)

**Status:** Not Started

**Scope-Kind:** runtime-behavior

**Tags:** `overlay:true`, `ui:true`, `integration:true`, `increment:A`

**Depends On:** 3

**Primary Outcome:** A research user audits Microsoft across the six Detailed workspaces (statements, resilience, scenarios, brief, source trace, peers) that share one truth with the Simple cockpit with no mode/tab refetch or reinterpretation, peers admit only comparable observations with visible exclusions, every material claim traces to its exact source chain, and the accepted state exports and publishes a committed `FundamentalsToolRead/v1` discoverable through the registry/navigation/deep-link — locked by a scenario-specific browser regression suite. This slice makes the publication `ownerReadRef` non-null.

### Requirement Coverage

- **Functional:** FR-010-082 through FR-010-087 (peer sets and compatibility); FR-010-089 through FR-010-091 (Detailed exposure, one-state parity, no state leak); FR-010-093 through FR-010-096 (export and `FundamentalsToolRead/v1` production); FR-010-097 (owner-read boundary on the producer side).
- **Non-functional:** NFR-010-002 through NFR-010-004 (transition responsiveness, history rendering scale, stable controls); NFR-010-018 (source rights recorded); NFR-010-019 (local scenario state never shared without export).
- **Primary scenarios:** SCN-010-015, SCN-010-028, SCN-010-029.

### Gherkin Scenarios

```gherkin
Scenario: SCN-010-015 Simple Detailed and six tabs share one state without refetch or reinterpretation
  Given one CompanyAcceptedState has a fixed publication, scenario, brief, coverage, and market observation
  When the user switches Simple to Detailed and across all six tabs
  Then no company publication request is initiated by the mode/tab actions
  And every shared value, classification, cutoff, conflict, proposal, and limitation matches the Simple selector

Scenario: SCN-010-028 incompatible peers stay outside statistics and ranks with exact reasons
  Given a PeerSet contains comparable, qualified, and excluded observations with explicit purposes
  When selectPeersView computes level or trend context
  Then only comparable observations enter the named statistic and sample size
  And qualified/excluded rows, missing counts, outliers, and exact reasons remain visible with no zero insertion

Scenario: SCN-010-029 every material claim reaches its exact source transformation and consumer chain
  Given a Simple direction, resilience, change, catalyst, or risk claim is rendered with data-ref
  When the user activates its trace control
  Then Sources focuses the exact observation, artifact, period/window, mapping, formula or interpretation, and consumers
  And restatements, conflicts, rights limits, and unavailable links remain in the chain
```

### Implementation Plan

1. Reuse the Scope 3 accepted state and model pack; build the shared-shell wiring in `company-fundamentals-lab.html` that includes and calls the existing `rldata.js`/`rlapp.js` shell without modifying them, the `#modeSeg` Simple/Detailed toggle, and the six Detailed workspaces as selectors over one `CompanyAcceptedState/v1` with zero mode/tab-triggered publication requests and full parity with the Simple cockpit (SCN-010-015).
2. Build the net-new `selectPeersView` and populate `peers` in `company-fundamentals.config.json` (empty today) so only comparable observations enter the named statistic and sample size while qualified/excluded rows, missing counts, outliers, and exact reasons remain visible with no zero insertion (SCN-010-028); the `configFingerprint` change re-hashes the publication, so regenerate it within this slice.
3. Build the source-trace workspace so every material claim resolves to its exact observation, artifact, period/window, mapping, formula or interpretation, and consumers, keeping restatements/conflicts/rights limits/unavailable links in the chain with focus return (SCN-010-029).
4. Build the net-new `buildAcceptedExport` and `buildFundamentalsToolRead` (calling `RLDATA.putToolRead`) so the export and committed `FundamentalsToolRead/v1` project the accepted generation with all clocks/classes/conflicts/limitations and no private data, and `scripts/validate-company-fundamentals.mjs` recomputes and rejects drift; the committed `ownerReadRef` becomes non-null.
5. Registry registration is DEFERRED to Scope 5. The additive `tools.json`/`index.html`/`rlnav.js` entries, the deep-link route exposure, and the `market-brief.payload.json` `toolCoverage` update land in Scope 5 so that `scripts/brief-refresh.mjs` regenerates `toolCoverage` in the same slice as the registry entry — a registered tool ID must appear in `toolCoverage` for the `node scripts/selftest.mjs` registry-wide coverage group to stay green, and `market-brief.payload.json` is an excluded Market Brief artifact here. This slice keeps only the step-4 producer that makes the committed `ownerReadRef` non-null, giving Scope 5 a valid committed owner read to register.
6. Add scenario-specific persistent Regression E2E titles to `tests/company-fundamentals-lab.spec.mjs`, regenerate the validator and selftest expectations to the new hash-valid publication, and leave every pre-existing group unchanged.

### Shared Infrastructure Impact Sweep

| Surface | Downstream contract at risk | Independent canary before broad tests | Rollback unit |
| --- | --- | --- | --- |
| `scripts/selftest.mjs` | Existing group order and summary | Rerun the full baseline; require no count loss after the additive peers/export/read group | Exact Feature 010 marker-bounded group only |

### Change Boundary And Rollback

**Allowed:** `rlcompany.js` peers/export/read helpers, the shared-shell wiring plus the Detailed and export surfaces of `company-fundamentals-lab.html`, `peers` in `company-fundamentals.config.json`, `scripts/validate-company-fundamentals.mjs`, scope-owned tests, and the additive Feature 010 selftest block.

**Excluded:** `rldata.js` and `rlapp.js` source (called but never modified), `tools.json`, `index.html`, `rlnav.js`, the deep-link route exposure, and the `market-brief.payload.json` `toolCoverage` list (registry registration deferred to Scope 5), `scripts/brief-refresh.mjs`, Market Brief artifacts, Feature 009 assumptions, provider policies, and unrelated tools/tests.

**Rollback:** reverse only Scope 4 product/test hunks and the exact additive selftest entries; immutable publications, prior briefs, and append-only history are never rewritten.

### Test Plan

| ID | Type | Category | Scenario | File / Location | Exact behavior / persistent title | Command | Live System |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TP-4-01 | Unit | unit | SCN-010-015, SCN-010-028, SCN-010-029 | `tests/company-fundamentals-contracts.unit.mjs` | Production one-state selectors, `selectPeersView`, claim-trace, `buildAcceptedExport`, and `buildFundamentalsToolRead` behave from one accepted tuple with only comparable peers and no private data | `node --test tests/company-fundamentals-contracts.unit.mjs` | No |
| TP-4-02 | Complete production selftest | functional | SCN-010-015, SCN-010-028, SCN-010-029 | `scripts/selftest.mjs` | Existing baseline remains intact and the additive Feature 010 peers/export/read group executes production functions over the regenerated publication | `node scripts/selftest.mjs` | No |
| TP-4-03 | Integration validator | integration | SCN-010-015, SCN-010-028, SCN-010-029 | `scripts/validate-company-fundamentals.mjs` | Whole-publication validation proves the non-null `ownerReadRef` export and `FundamentalsToolRead/v1` recompute from one generation with all clocks/classes and reject drift | `node scripts/validate-company-fundamentals.mjs` | No |
| TP-4-04 | Regression E2E | e2e-ui | SCN-010-015 | `tests/company-fundamentals-lab.spec.mjs` | Persistent title `Regression: SCN-010-015 Simple Detailed and six tabs share one state without refetch or reinterpretation` | `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "SCN-010-015" --reporter=list` | Yes |
| TP-4-05 | Regression E2E | e2e-ui | SCN-010-028, SCN-010-029 | `tests/company-fundamentals-lab.spec.mjs` | Persistent titles `Regression: SCN-010-028 incompatible peers stay outside statistics and ranks with exact reasons`, `Regression: SCN-010-029 every material claim reaches its exact source transformation and consumer chain` | `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "SCN-010-028\|SCN-010-029" --reporter=list` | Yes |
| TP-4-06 | Broader Regression E2E | e2e-ui | SCN-010-015, SCN-010-028, SCN-010-029 | `tests/company-fundamentals-lab.spec.mjs` | Complete cumulative Feature 010 browser suite through Scope 4 over the real static server without interception | `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |

### Definition of Done

**Core Delivery Items**

- [x] FR-010-082 through FR-010-087, FR-010-089 through FR-010-091, FR-010-093 through FR-010-097, NFR-010-002 through NFR-010-004, NFR-010-018, and NFR-010-019 are delivered with one-state Simple/Detailed parity, comparable-only peers, a validated committed owner read, and no private data. (evidence: [report.md](report.md#scope-4-execution))
- [x] SCN-010-015, SCN-010-028, and SCN-010-029 are delivered through production Detailed-workspace, peers, and claim-trace projections with no self-validating assertion path. (evidence: [report.md](report.md#scope-4-execution))
- [x] The regenerated fingerprint-bound publication has a non-null `ownerReadRef` (registry/navigation/deep-link registration and the `market-brief.payload.json` `toolCoverage` update are deferred to Scope 5). (evidence: [report.md](report.md#tp-4-03--node-scriptsvalidate-company-fundamentalsmjs-exit-0))
- [x] Change Boundary is respected and zero excluded file families are changed (`rldata.js`/`rlapp.js` source is unmodified). (evidence: [report.md](report.md#build-quality-scope-4))
- [x] Scenario-first RED and identical-command GREEN evidence exists for every Scope 4 behavior. (evidence: [report.md](report.md#scope-4-execution) — RED 32/4 with helpers absent → GREEN 36/0)

**Test Evidence Items — Exact Parity With 6 Test Plan Rows**

- [x] TP-4-01 unit evidence proves one-state selector, peers, trace, export, and owner-read production behavior. (evidence: [report.md](report.md#tp-4-01--node---test-testscompany-fundamentals-contractsunitmjs-exit-0))
- [x] TP-4-02 selftest evidence preserves all existing checks and proves the additive peers/export/read group. (evidence: [report.md](report.md#tp-4-02--node-scriptsselftestmjs-exit-0))
- [x] TP-4-03 validator evidence proves the non-null owner-read export recomputes from one generation with drift rejection. (evidence: [report.md](report.md#tp-4-03--node-scriptsvalidate-company-fundamentalsmjs-exit-0))
- [x] TP-4-04 Regression E2E evidence proves SCN-010-015 on the real route. (evidence: [report.md](report.md#tp-4-04--tp-4-05--tp-4-06--npx---no-install-playwright-test-testscompany-fundamentals-labspecmjs---configplaywrightconfigmjs---projectsystem-chrome---reporterlist-exit-0))
- [x] TP-4-05 Regression E2E evidence proves SCN-010-028/029 on the real route. (evidence: [report.md](report.md#tp-4-04--tp-4-05--tp-4-06--npx---no-install-playwright-test-testscompany-fundamentals-labspecmjs---configplaywrightconfigmjs---projectsystem-chrome---reporterlist-exit-0))
- [x] TP-4-06 broader E2E evidence proves the complete cumulative Scope 4 browser behavior without interception. (evidence: [report.md](report.md#scope-4-execution) — TP-4-06 full cumulative suite, 19 passed, exit 0)

**Build Quality Gate**

- [x] Exact RED/GREEN ledger, export/owner-read privacy scan, `rldata.js`/`rlapp.js` unmodified proof, selftest baseline parity, editor diagnostics, `git diff --check`, artifact lint, capability-foundation check, and framework write guard are current and every finding is individually accounted for in `report.md`. (evidence: [report.md](report.md#build-quality-scope-4))

## Scope 5: Dynamic Adaptive Company Brief And Feature 002 Consume-Once (Increment B)

**Status:** Not Started

**Scope-Kind:** runtime-behavior

**Tags:** `foundation:true`, `integration:true`, `increment:B`

**Depends On:** 4

**Primary Outcome:** A research user reads a dynamic MSFT company brief that leads with deterministic, company-specific material change, keeps management/rumor/sentiment/macro evidence in its own class and clock, produces a truthful unchanged/partial/degraded outcome without narrative churn, and appends deduplicated history — and Feature 002 consumes the committed owner read exactly once without recomputing facts, applying proposals, changing the archetype, or collapsing the statement/model/brief/market clocks. This slice also completes the registry discoverability deferred from Scope 4: because `scripts/brief-refresh.mjs` regenerates `market-brief.payload.json` `toolCoverage` here, `company-fundamentals-lab` is registered additively in `tools.json`/`index.html`/`rlnav.js` with its deep-link route exposed in the same slice, so the tool becomes registry-discoverable and its `toolCoverage` entry lands together — keeping the `node scripts/selftest.mjs` registry-parity and registry-wide coverage groups green.

### Requirement Coverage

- **Functional:** FR-010-063 through FR-010-081 (adaptive brief: material-change lead, class separation, ranking, proposals, sentiment containment, macro-through-mechanism, market clock); FR-010-097 and FR-010-098 (Feature 002 non-recomputation boundary and history preservation); FR-010-103 and FR-010-104 (no advice; insufficient evidence honesty).
- **Non-functional:** NFR-010-013 through NFR-010-016 (freshness availability, independent staleness policies, optional-failure preservation, no duplicate processing); NFR-010-017 (rights/private-research exclusion in shared briefs).
- **Registry discoverability (deferred from Scope 4):** the additive `tools.json`/`index.html`/`rlnav.js` registration and deep-link route exposure that make `company-fundamentals-lab` and its `FundamentalsToolRead/v1` deep links (discoverability aspect of FR-010-095) reachable, plus the `market-brief.payload.json` `toolCoverage` parity the registry-wide brief-coverage contract requires — landed here because `scripts/brief-refresh.mjs` regenerates `toolCoverage` and the registry entry must ship together.
- **Primary scenarios:** SCN-010-017, SCN-010-018, SCN-010-019, SCN-010-020, SCN-010-021, SCN-010-022, SCN-010-024, SCN-010-030, SCN-010-031.

### Gherkin Scenarios

```gherkin
Scenario: SCN-010-017 a material filing change leads the brief and links thesis and model effects
  Given prior and current publications differ on a sourced fact linked to an active claim and sensitive model driver
  When the evidence-change and brief pipelines run
  Then the change is material with source, period, mechanism, claim effect, and a model-impact proposal when numeric support exists
  And unchanged claims are not emitted as new changes

Scenario: SCN-010-018 management language remains a claim and never becomes a reported actual
  Given a rights-valid issuer evidence manifest records a management assertion without reported delivery evidence
  When the brief pipeline evaluates it
  Then the observation class remains management-claim with its window and source
  And it may create a watch condition or proposal but cannot create a reported fact or actual

Scenario: SCN-010-019 unverified news cannot change facts assumptions or scenario revision
  Given a news observation has no authoritative confirmation and may affect event risk
  When the brief and scenario reducers process it
  Then the item remains news with unverified limitation and evidence needed
  And the accepted facts, assumptions, and scenario revision are byte-equivalent to their pre-evaluation state

Scenario: SCN-010-020 sentiment divergence preserves both clocks and fundamental direction
  Given a current sentiment observation is positive and a separately sourced reported trend is deteriorating
  When selectBriefView renders the current thesis
  Then both evidence classes, windows, sources, and divergent directions are present
  And confidence is constrained without changing the reported fundamental direction

Scenario: SCN-010-021 macro context enters only through an evidenced company mechanism
  Given a macro observation changes and an accepted company mechanism links it to financing, demand, valuation, or operating economics
  When the change ranker evaluates relevance
  Then the brief cites that mechanism and affected driver or risk
  And the same macro observation is context-only or excluded for a company with no evidenced mechanism

Scenario: SCN-010-022 one sensitive KPI outranks repeated generic headlines without volume weighting
  Given one new high-quality KPI change affects a sensitive driver and several duplicate generic news observations do not
  When rankEvidenceChanges applies the versioned ranking policy
  Then the KPI change ranks first with its component scores
  And duplicate headline count contributes no independent source-quality or materiality weight

Scenario: SCN-010-024 stale evidence retains its cutoff and withholds unsupported current claims
  Given the latest valid KPI observation exceeds its explicit class freshness policy
  When the brief and Simple selectors run
  Then the KPI state is stale with its original cutoff and required update
  And unsupported current claims and model-impact proposals are absent while prior dated truth remains visible

Scenario: SCN-010-030 Feature 002 preserves owner clocks limitations and non recomputation boundary
  Given the frozen registry selects company-fundamentals-owner-v1 and its committed owner-read manifest
  When Feature 002 builds ToolModelRead and the final Market Brief consumes it
  Then statement, model, company-brief, and market cutoffs equal the owner records and limitations remain intact
  And no Feature 002 function recomputes facts, changes archetype, applies proposals, or promotes price movement to fresh fundamentals

Scenario: SCN-010-031 immaterial reviewed evidence produces one unchanged brief without narrative churn
  Given a prior validated brief exists and every new eligible observation is duplicate, confirmation, or immaterial to active claims/drivers
  When the evidence-change and brief pipelines run
  Then brief status is unchanged and reviewed evidence plus no-change rationale are recorded
  And no material-change item, model proposal, or duplicate narrative content is created
```

### Implementation Plan

1. Confirm `rankEvidenceChanges` and `buildAdaptiveCompanyBrief` lead with deterministic material change, separate reported/management/estimate/model/market/news/sentiment classes, and rank by demonstrated materiality without headline volume (SCN-010-017/018/022).
2. Confirm rumor/news/sentiment cannot alter accepted facts/assumptions/revision and that macro enters only through an evidenced company mechanism (SCN-010-019/020/021).
3. Confirm stale/partial constrain claims while preserving prior dated truth, and immaterial evidence yields one explicit unchanged outcome with append-only deduplicated history (SCN-010-024/031).
4. Confirm the committed owner read is consumed once by `scripts/brief-refresh.mjs` via `company-fundamentals-owner-v1`, preserving all four clocks and limitations and recomputing nothing (SCN-010-030); run Feature 002 existing owner-read and no-action canaries first.
5. Complete the registry discoverability deferred from Scope 4: after the brief is built and `scripts/brief-refresh.mjs` regenerates `market-brief.payload.json` `toolCoverage`, register `company-fundamentals-lab` surgically and additively in `tools.json`/`index.html`/`rlnav.js` and expose its deep-link route — running the registry-wide canaries first (every pre-existing tool ID/route still resolves) and confirming the regenerated `toolCoverage` covers every registered tool so the `node scripts/selftest.mjs` registry-parity and registry-wide coverage groups stay green. Insert the new entry non-adjacent to any concurrent unrelated entry and never reorder or delete an existing tool.
6. Add scenario-specific persistent Regression E2E titles to `tests/company-fundamentals-lab.spec.mjs` and the Feature 002 boundary assertion.

### Shared Infrastructure Impact Sweep

| Surface | Downstream contract at risk | Independent canary before broad tests | Rollback unit |
| --- | --- | --- | --- |
| `scripts/brief-refresh.mjs` | Feature 002 existing owner-read and no-action outcomes | Run Feature 002 existing owner-read and no-action canaries before modification | Disable/remove only `company-fundamentals-owner-v1` |
| `scripts/selftest.mjs` | Existing group order and summary | Rerun the full baseline; require no count loss after the additive brief group | Exact Feature 010 marker-bounded group only |
| Brief/history append path (`rlcompany.js`) | Append-only history, no duplicate events | Replay identical evidence and assert one unchanged history event | Scope-owned brief/history helpers only |
| `tools.json` | Existing registry parity and pre-existing tool IDs/routes | Assert every pre-existing tool ID and route resolves before and after the additive entry | Remove only the new Feature 010 registry entry |
| `index.html` | Existing launcher entries and data-settings anchor | Confirm existing launcher entries and the data-settings anchor remain discoverable | Reverse only the new launcher entry |
| `rlnav.js` | Shared navigation for representative old tools | Load shared navigation for representative old tools and confirm unchanged render | Reverse only the new nav registration |
| `market-brief.payload.json` | Registry-wide `toolCoverage` parity (every `tools.json` id covered) | Regenerate `toolCoverage` via `scripts/brief-refresh.mjs` and assert the selftest registry-wide coverage group stays green | Reverse only the `company-fundamentals-lab` `toolCoverage` entry |

### Change Boundary And Rollback

**Allowed:** `rlcompany.js` brief/change/history helpers, the Brief and evidence-change surfaces of `company-fundamentals-lab.html`, the additive `company-fundamentals-owner-v1` path in `scripts/brief-refresh.mjs`, `scripts/validate-company-fundamentals.mjs`, the additive `company-fundamentals-lab` registry entries in `tools.json`/`index.html`/`rlnav.js` and its deep-link route, the regenerated `company-fundamentals-lab` `toolCoverage` entry in `market-brief.payload.json` (produced by `scripts/brief-refresh.mjs`), scope-owned tests, and the additive Feature 010 selftest block.

**Excluded:** `rldata.js`, `rlapp.js`, prior Feature 002 registry entries and brief/history artifacts other than the additive owner read, the Market Brief payload beyond the additive `company-fundamentals-lab` `toolCoverage` entry, pre-existing `tools.json`/`index.html`/`rlnav.js` entries (never reordered or deleted), Feature 009 assumptions, and unrelated tools/tests.

**Rollback:** reverse only Scope 5 product/test hunks, the `company-fundamentals-owner-v1` registration, and the additive `company-fundamentals-lab` registry and `toolCoverage` entries; never rewrite prior brief/history artifacts or reorder pre-existing registry entries.

### Test Plan

| ID | Type | Category | Scenario | File / Location | Exact behavior / persistent title | Command | Live System |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TP-5-01 | Unit | unit | SCN-010-017, SCN-010-018, SCN-010-019, SCN-010-020, SCN-010-021, SCN-010-022, SCN-010-024, SCN-010-030, SCN-010-031 | `tests/company-fundamentals-contracts.unit.mjs` | Production evidence-change, ranking, class-boundary, staleness, unchanged, and owner-read projection helpers behave deterministically over recorded inputs | `node --test tests/company-fundamentals-contracts.unit.mjs` | No |
| TP-5-02 | Complete production selftest | functional | SCN-010-017, SCN-010-018, SCN-010-019, SCN-010-020, SCN-010-021, SCN-010-022, SCN-010-024, SCN-010-030, SCN-010-031 | `scripts/selftest.mjs` | Existing baseline remains intact and the additive Feature 010 brief/ranking/history group executes production functions | `node scripts/selftest.mjs` | No |
| TP-5-03 | Integration validator plus Feature 002 owner read | integration | SCN-010-017, SCN-010-018, SCN-010-019, SCN-010-020, SCN-010-021, SCN-010-022, SCN-010-024, SCN-010-030, SCN-010-031 | `scripts/validate-company-fundamentals.mjs` | Validator proves brief/history determinism and the committed owner read; Feature 002 consumes it once preserving four clocks and recomputing nothing | `node scripts/validate-company-fundamentals.mjs` | No |
| TP-5-04 | Regression E2E | e2e-ui | SCN-010-017, SCN-010-018, SCN-010-022 | `tests/company-fundamentals-lab.spec.mjs` | Persistent titles `Regression: SCN-010-017 a material filing change leads the brief and links thesis and model effects`, `Regression: SCN-010-018 management language remains a claim and never becomes a reported actual`, `Regression: SCN-010-022 one sensitive KPI outranks repeated generic headlines without volume weighting` | `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "SCN-010-017\|SCN-010-018\|SCN-010-022" --reporter=list` | Yes |
| TP-5-05 | Regression E2E | e2e-ui | SCN-010-019, SCN-010-020, SCN-010-021 | `tests/company-fundamentals-lab.spec.mjs` | Persistent titles `Regression: SCN-010-019 unverified news cannot change facts assumptions or scenario revision`, `Regression: SCN-010-020 sentiment divergence preserves both clocks and fundamental direction`, `Regression: SCN-010-021 macro context enters only through an evidenced company mechanism` | `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "SCN-010-019\|SCN-010-020\|SCN-010-021" --reporter=list` | Yes |
| TP-5-06 | Regression E2E | e2e-ui | SCN-010-024, SCN-010-030, SCN-010-031 | `tests/company-fundamentals-lab.spec.mjs` | Persistent titles `Regression: SCN-010-024 stale evidence retains its cutoff and withholds unsupported current claims`, `Regression: SCN-010-030 Feature 002 preserves owner clocks limitations and non recomputation boundary`, `Regression: SCN-010-031 immaterial reviewed evidence produces one unchanged brief without narrative churn` | `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "SCN-010-024\|SCN-010-030\|SCN-010-031" --reporter=list` | Yes |
| TP-5-07 | Broader Regression E2E | e2e-ui | SCN-010-017, SCN-010-018, SCN-010-019, SCN-010-020, SCN-010-021, SCN-010-022, SCN-010-024, SCN-010-030, SCN-010-031 | `tests/company-fundamentals-lab.spec.mjs` | Complete cumulative Feature 010 browser suite through Scope 5 over the real static server without interception | `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |
| TP-5-08 | Registry discoverability + toolCoverage parity | functional | SCN-010-030 | `scripts/selftest.mjs` | After registration and `toolCoverage` regeneration, the selftest registry-parity and registry-wide brief-coverage groups prove `company-fundamentals-lab` is present and consistently ordered across `tools.json`/`index.html`/`rlnav.js`, its deep-link route resolves, and it is covered in `market-brief.payload.json` `toolCoverage` while every pre-existing tool ID/route still resolves | `node scripts/selftest.mjs` | No |

### Definition of Done

**Core Delivery Items**

- [ ] FR-010-063 through FR-010-081, FR-010-097, FR-010-098, FR-010-103, FR-010-104, and NFR-010-013 through NFR-010-017 are delivered with deterministic company-specific ranking, class/clock separation, truthful unchanged/partial/degraded outcomes, and a once-consumed non-recomputing owner read.
- [ ] SCN-010-017, SCN-010-018, SCN-010-019, SCN-010-020, SCN-010-021, SCN-010-022, SCN-010-024, SCN-010-030, and SCN-010-031 are delivered through production brief, ranking, history, and Feature 002 owner-read projections with no self-validating assertion path.
- [ ] Feature 002 existing owner-read and no-action canaries pass before and after the `company-fundamentals-owner-v1` addition; no prior brief/history artifact is rewritten.
- [ ] The registry discoverability deferred from Scope 4 is completed: `company-fundamentals-lab` is registered additively in `tools.json`/`index.html`/`rlnav.js` with its deep-link route, `scripts/brief-refresh.mjs` regenerates `market-brief.payload.json` `toolCoverage` to cover it, every pre-existing tool ID/route still resolves, and no pre-existing registry entry is reordered or deleted.
- [ ] Change Boundary is respected and zero excluded file families are changed.
- [ ] Scenario-first RED and identical-command GREEN evidence exists for every Scope 5 behavior.

**Test Evidence Items — Exact Parity With 8 Test Plan Rows**

- [ ] TP-5-01 unit evidence proves evidence-change, ranking, class-boundary, staleness, unchanged, and owner-read projection behavior.
- [ ] TP-5-02 selftest evidence preserves all existing checks and proves the additive brief/ranking/history group.
- [ ] TP-5-03 validator plus Feature 002 evidence proves the once-consumed owner read preserves four clocks and recomputes nothing.
- [ ] TP-5-04 Regression E2E evidence proves SCN-010-017/018/022 on the real route.
- [ ] TP-5-05 Regression E2E evidence proves SCN-010-019/020/021 on the real route.
- [ ] TP-5-06 Regression E2E evidence proves SCN-010-024/030/031 on the real route.
- [ ] TP-5-07 broader E2E evidence proves the complete cumulative Scope 5 browser behavior without interception.
- [ ] TP-5-08 registry-discoverability evidence proves `company-fundamentals-lab` is registered across `tools.json`/`index.html`/`rlnav.js` with its deep-link route and covered in `market-brief.payload.json` `toolCoverage`, with the selftest registry-parity and registry-wide coverage groups green and every pre-existing tool ID/route resolving.

**Build Quality Gate**

- [ ] Exact RED/GREEN ledger, Feature 002 canary parity, registry/nav canary parity, `market-brief.payload.json` `toolCoverage` parity, brief/history dedup proof, private-research exclusion scan, selftest baseline parity, editor diagnostics, `git diff --check`, artifact lint, capability-foundation check, and framework write guard are current and every finding is individually accounted for in `report.md`.

## Scope 6: CMG And JPM Source-Qualified Overlays (Increment C)

**Status:** Not Started

**Scope-Kind:** runtime-behavior

**Tags:** `overlay:true`, `ui:true`, `increment:C`

**Depends On:** 5

**Primary Outcome:** A research user opens Chipotle and JPMorgan and receives archetype-correct, source-qualified reads on the SAME shared foundation: Chipotle preserves raw leverage beside lease and treasury-stock context, JPMorgan uses bank credit/liquidity/capital rules and marks the industrial liabilities/equity heuristic inapplicable, and each issuer selects materially different KPIs, diagnostics, and model family from the same normalized facts — with no formula or fact copied between issuers.

### Requirement Coverage

- **Functional:** FR-010-048 (Chipotle unit/lease KPIs), FR-010-049 (JPMorgan bank KPIs), FR-010-050 (archetype review without rewriting prior facts/briefs), FR-010-031 through FR-010-040 (contextual resilience applicability reused for lease and bank inapplicability), FR-010-034 (explicit lease/regulatory-capital contextual adjustments).
- **Non-functional:** NFR-010-020 (add a company that fits an existing archetype without redefining shared contracts), NFR-010-021 (new archetype/KPI preserves prior interpretation and states applicability), NFR-010-022 (fiscal/currency/accounting tolerance).
- **Primary scenarios:** SCN-010-002, SCN-010-003.

### Gherkin Scenarios

```gherkin
Scenario: SCN-010-002 Chipotle preserves raw leverage beside lease and treasury context
  Given the source-qualified CMG publication contains funded-debt, lease-liability, equity, treasury-stock, and share observations
  When selectResilienceView evaluates the cash/debt and liabilities/equity checks
  Then the raw formulas use the reported observations without adjustment
  And the contextual records name lease and treasury-stock effects with exact refs and no pass/fail value

Scenario: SCN-010-003 JPMorgan uses bank capital credit and liquidity rules without an industrial score
  Given the accepted JPM archetype is financial-institution with deposits, credit, liquidity, CET1, and preferred-capital facts
  When the resilience selector resolves diagnostic applicability
  Then ordinary liabilities/equity and net-debt/EBITDA checks are inapplicable with the financial-institution policy ID
  And bank-specific facts remain available without producing an industrial weakness rank
```

### Implementation Plan

1. Add source-qualified CMG and JPM publications and configs to `data/company-fundamentals/**` and `company-fundamentals.config.json` using the shared foundation contracts, with no new shared fact, scenario, diagnostic, or brief vocabulary (NFR-010-020).
2. Add the CMG unit-economics/lease archetype overlay (comparable sales, unit count, restaurant margin, lease obligations) and confirm raw leverage renders beside lease/treasury context with exact refs and no pass/fail value (SCN-010-002).
3. Add the JPM financial-institution archetype overlay and the bank model family, and confirm industrial liabilities/equity and net-debt/EBITDA checks are marked inapplicable with the financial-institution policy ID while bank facts remain available (SCN-010-003).
4. Confirm archetype review does not rewrite prior facts or briefs and that new KPI/archetype definitions state their applicability (FR-010-050, NFR-010-021).
5. Add scenario-specific persistent Regression E2E titles to `tests/company-fundamentals-lab.spec.mjs`.

### Shared Infrastructure Impact Sweep

| Surface | Downstream contract at risk | Independent canary before broad tests | Rollback unit |
| --- | --- | --- | --- |
| `company-fundamentals.config.json` | Existing MSFT config and shared policy versions | Validate the MSFT publication still passes unchanged after CMG/JPM config additions | Remove only the CMG/JPM config entries |
| Shared foundation contracts (`rlcompany.js`) | MSFT publication remains byte-stable | Revalidate the MSFT canary before broad CMG/JPM tests | Scope-owned overlay definitions only |
| `scripts/selftest.mjs` | Existing group order and summary | Rerun the full baseline; require no count loss after the additive overlay group | Exact Feature 010 marker-bounded group only |

### Change Boundary And Rollback

**Allowed:** CMG/JPM entries in `company-fundamentals.config.json` and `data/company-fundamentals/**`, the CMG/JPM archetype overlays and bank model family in `rlcompany.js`, the overlay surfaces of `company-fundamentals-lab.html`, `scripts/validate-company-fundamentals.mjs`, scope-owned tests, and the additive Feature 010 selftest block.

**Excluded:** the MSFT publication and its accepted facts, `rldata.js`, `rlapp.js`, `scripts/brief-refresh.mjs` other than any owner subjects, Market Brief artifacts, Feature 009 assumptions, and unrelated tools/tests.

**Rollback:** reverse only the CMG/JPM config/data/overlay hunks; the MSFT publication, immutable objects, and append-only history are never rewritten.

### Test Plan

| ID | Type | Category | Scenario | File / Location | Exact behavior / persistent title | Command | Live System |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TP-6-01 | Unit | unit | SCN-010-002, SCN-010-003 | `tests/company-fundamentals-contracts.unit.mjs` | Production CMG lease/treasury context and JPM bank applicability helpers select different KPIs/diagnostics/models from shared facts without mutation | `node --test tests/company-fundamentals-contracts.unit.mjs` | No |
| TP-6-02 | Complete production selftest | functional | SCN-010-002, SCN-010-003 | `scripts/selftest.mjs` | Existing baseline remains intact and the additive Feature 010 CMG/JPM overlay group executes production functions | `node scripts/selftest.mjs` | No |
| TP-6-03 | Integration validator | integration | SCN-010-002, SCN-010-003 | `scripts/validate-company-fundamentals.mjs` | Whole-publication validation proves CMG and JPM publications are coherent and the MSFT publication is unchanged | `node scripts/validate-company-fundamentals.mjs` | No |
| TP-6-04 | Regression E2E | e2e-ui | SCN-010-002 | `tests/company-fundamentals-lab.spec.mjs` | Persistent title `Regression: SCN-010-002 Chipotle preserves raw leverage beside lease and treasury context` | `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "SCN-010-002" --reporter=list` | Yes |
| TP-6-05 | Regression E2E | e2e-ui | SCN-010-003 | `tests/company-fundamentals-lab.spec.mjs` | Persistent title `Regression: SCN-010-003 JPMorgan uses bank capital credit and liquidity rules without an industrial score` | `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "SCN-010-003" --reporter=list` | Yes |
| TP-6-06 | Broader Regression E2E | e2e-ui | SCN-010-002, SCN-010-003 | `tests/company-fundamentals-lab.spec.mjs` | Complete cumulative Feature 010 browser suite through Scope 6 with all three archetypes over the real static server without interception | `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |

### Definition of Done

**Core Delivery Items**

- [ ] FR-010-048, FR-010-049, FR-010-050, FR-010-031 through FR-010-040, FR-010-034, NFR-010-020, NFR-010-021, and NFR-010-022 are delivered so CMG and JPM select materially different KPIs/diagnostics/models from shared facts with no fact/formula copied between issuers.
- [ ] SCN-010-002 and SCN-010-003 are delivered through production overlays with source-qualified CMG/JPM inputs and no self-validating assertion path.
- [ ] The MSFT publication and its accepted facts remain byte-stable after CMG/JPM additions.
- [ ] Change Boundary is respected and zero excluded file families are changed.
- [ ] Scenario-first RED and identical-command GREEN evidence exists for every Scope 6 behavior.

**Test Evidence Items — Exact Parity With 6 Test Plan Rows**

- [ ] TP-6-01 unit evidence proves CMG lease/treasury context and JPM bank applicability production behavior over shared facts.
- [ ] TP-6-02 selftest evidence preserves all existing checks and proves the additive CMG/JPM overlay group.
- [ ] TP-6-03 validator evidence proves CMG and JPM publications are coherent and MSFT is unchanged.
- [ ] TP-6-04 Regression E2E evidence proves SCN-010-002 on the real route.
- [ ] TP-6-05 Regression E2E evidence proves SCN-010-003 on the real route.
- [ ] TP-6-06 broader E2E evidence proves the complete cumulative three-archetype browser behavior without interception.

**Build Quality Gate**

- [ ] Exact RED/GREEN ledger, MSFT byte-stability proof, source-qualified CMG/JPM fixture provenance, selftest baseline parity, editor diagnostics, `git diff --check`, artifact lint, capability-foundation check, and framework write guard are current and every finding is individually accounted for in `report.md`.

## Scope 7: Real Canary Acquisition, Cross-Capability Regression, Accessibility, And Static-Site Hardening (Increment C)

**Status:** Not Started

**Scope-Kind:** runtime-behavior

**Tags:** `hardening:true`, `integration:true`, `ui:true`, `increment:C`

**Depends On:** 6

**Primary Outcome:** The tool is hardened and honest end to end: MSFT, CMG, and JPM are published from controlled real SEC/issuer source-qualified acquisitions (no invented or self-validating fixture output as proof of source), mixed currency/fiscal comparisons are visible but unavailable for a forced statistic, the full research journey is WCAG 2.2 AA keyboard/narrow/parity accessible at 320 pixels with no body overflow or color-only meaning, and the whole static-site/brief boundary passes cross-capability regression across registry, navigation, brief, and MSFT-specialist separation plus freshness/inline-script/capability checks.

### Requirement Coverage

- **Functional:** FR-010-092 (chart/table accessible equivalents and non-visual understandability), integrated verification of FR-010-001 through FR-010-104 across the three real canaries, and the comparability boundary for mixed currency/fiscal periods.
- **Non-functional:** NFR-010-005 through NFR-010-008 (WCAG 2.2 AA keyboard/focus/name-role-value/contrast, accessible chart tables, non-color state, polite announcements), NFR-010-013 (freshness availability by the next scheduled brief run), NFR-010-022 (fiscal/currency/sparse tolerance), and integrated verification of NFR-010-001 through NFR-010-022.
- **Primary scenarios:** SCN-010-007, SCN-010-032.

### Gherkin Scenarios

```gherkin
Scenario: SCN-010-007 mixed currency and fiscal periods remain visible and unavailable for forced comparison
  Given two company or peer facts differ in currency or non-aligned period and no explicit conversion/alignment object exists
  When the comparison selector evaluates compatibility
  Then the original values and bases remain visible
  And growth, aggregate statistic, and rank are unavailable with the exact incompatibility reason

Scenario: SCN-010-032 keyboard research flow is accessible at 320 pixels without body overflow
  Given the real page loads a source-qualified company publication in system Chrome at 320 CSS pixels
  When the user selects a company, switches modes/tabs, edits a draft, reviews a proposal, and traces a claim using the keyboard
  Then focus order, names, roles, selected states, error descriptions, live summaries, and focus return are correct
  And chart-equivalent tables expose the same values and the document body has no horizontal overflow or color-only state
```

### Implementation Plan

1. Perform the three controlled real MSFT/CMG/JPM SEC/issuer acquisitions using the required `SEC_USER_AGENT`, capturing exact source bytes into run-owned staging and swapping current pointers last; capture the exact acquisition command and validator output separately, and never treat an invented fixture output as source proof (AC-010-014).
2. Confirm the comparison selector keeps original currency/fiscal bases visible and marks growth/statistic/rank unavailable with the exact incompatibility reason across the three canaries (SCN-010-007).
3. Confirm full WCAG 2.2 AA keyboard/focus/name-role-value/contrast behavior, accessible chart-equivalent tables, non-color state, and polite announcements across the research journey at 320/768/1440 with no body overflow (SCN-010-032, FR-010-092, NFR-010-005 through NFR-010-008).
4. Run cross-capability regression: registry/navigation parity, Feature 002 owner-read and no-action canaries, Market Brief compatibility, MSFT specialist separation, and all existing tool boot behavior; run page inline-script/id-integrity and repository freshness/capability checks.
5. Rerun the exact baseline selftest, the validator, and the full real-browser suite as the final hardening gate.

### Shared Infrastructure Impact Sweep

| Surface | Downstream contract at risk | Independent canary before broad tests | Rollback unit |
| --- | --- | --- | --- |
| Current pointers (`data/company-fundamentals/**`) | Immutable objects and append-only history | Validate each new generation before pointer swap; keep prior validated manifest for pointer rollback | Per-company current pointer only, after hash revalidation |
| `tools.json` / `index.html` / `rlnav.js` | Registry/nav parity for all tools | Registry-wide canary before and after hardening edits | Reverse only the specific hardening entry |
| `scripts/brief-refresh.mjs` | Feature 002 owner-read and no-action outcomes | Run Feature 002 canaries before broad regression | Disable/remove only `company-fundamentals-owner-v1` |
| `scripts/selftest.mjs` | Existing group order and summary | Rerun the full baseline; require no count loss | Exact Feature 010 marker-bounded group only |

### Change Boundary And Rollback

**Allowed:** controlled real acquisitions materialized into `data/company-fundamentals/**`, accessibility and hardening surfaces of `company-fundamentals-lab.html`, `scripts/validate-company-fundamentals.mjs`, scope-owned tests, and the additive Feature 010 selftest block; any surgical registry/nav/brief hardening within the protected-surface gate.

**Excluded:** `rldata.js`, `rlapp.js`, `msft-july-print-model.html`, Feature 009 assumptions, provider eligibility, release-train configuration, deployment surfaces, and unrelated tools/tests.

**Rollback:** data rollback changes only a per-company current pointer to a previously validated manifest after hash revalidation; immutable objects and append-only history are never rewritten; reverse only Scope 7 product/test hunks and the exact selftest marker.

### Test Plan

| ID | Type | Category | Scenario | File / Location | Exact behavior / persistent title | Command | Live System |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TP-7-01 | Unit | unit | SCN-010-007, SCN-010-032 | `tests/company-fundamentals-contracts.unit.mjs` | Production comparability and accessible-table-equivalent helpers keep incompatible bases visible and unavailable and expose chart-equivalent values | `node --test tests/company-fundamentals-contracts.unit.mjs` | No |
| TP-7-02 | Complete production selftest | functional | SCN-010-007, SCN-010-032 | `scripts/selftest.mjs` | The exact baseline reruns intact and the cumulative Feature 010 group passes as the final hardening gate | `node scripts/selftest.mjs` | No |
| TP-7-03 | Integration validator plus controlled acquisition | integration | SCN-010-007, SCN-010-032 | `scripts/validate-company-fundamentals.mjs` | Whole-publication validation proves the three real MSFT/CMG/JPM acquisitions, comparability boundary, and cross-capability parity with exact retained bytes | `node scripts/validate-company-fundamentals.mjs` | No |
| TP-7-04 | Regression E2E | e2e-ui | SCN-010-007 | `tests/company-fundamentals-lab.spec.mjs` | Persistent title `Regression: SCN-010-007 mixed currency and fiscal periods remain visible and unavailable for forced comparison` | `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "SCN-010-007" --reporter=list` | Yes |
| TP-7-05 | Regression E2E accessibility | e2e-ui | SCN-010-032 | `tests/company-fundamentals-lab.spec.mjs` | Persistent title `Regression: SCN-010-032 keyboard research flow is accessible at 320 pixels without body overflow` | `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "SCN-010-032" --reporter=list` | Yes |
| TP-7-06 | Broader cross-capability Regression E2E | e2e-ui | SCN-010-007, SCN-010-032 | `tests/company-fundamentals-lab.spec.mjs` | Complete cumulative Feature 010 browser suite plus registry/brief/specialist separation over the real static server without interception | `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |

### Definition of Done

**Core Delivery Items**

- [ ] FR-010-092 and integrated FR-010-001 through FR-010-104 are verified across the three real canaries, and NFR-010-005 through NFR-010-008, NFR-010-013, NFR-010-022, and integrated NFR-010-001 through NFR-010-022 are satisfied.
- [ ] SCN-010-007 and SCN-010-032 are delivered through production comparability and accessibility behavior over controlled real source-qualified acquisitions with no invented or self-validating fixture proof.
- [ ] The three controlled MSFT/CMG/JPM acquisitions capture exact source bytes with their exact command and validator output recorded separately.
- [ ] Change Boundary is respected and zero excluded file families are changed.
- [ ] Scenario-first RED and identical-command GREEN evidence exists for every Scope 7 behavior.

**Test Evidence Items — Exact Parity With 6 Test Plan Rows**

- [ ] TP-7-01 unit evidence proves comparability and accessible-equivalent production behavior.
- [ ] TP-7-02 selftest evidence reruns the exact baseline intact as the final hardening gate.
- [ ] TP-7-03 validator plus controlled-acquisition evidence proves the three real acquisitions and comparability boundary with exact retained bytes.
- [ ] TP-7-04 Regression E2E evidence proves SCN-010-007 on the real route.
- [ ] TP-7-05 Regression E2E accessibility evidence proves SCN-010-032 at 320 pixels without body overflow.
- [ ] TP-7-06 broader cross-capability E2E evidence proves registry/brief/specialist separation and the complete suite without interception.

**Build Quality Gate**

- [ ] Exact RED/GREEN ledger, three controlled-acquisition command/validator captures, registry/nav/brief/specialist cross-capability canary parity, accessibility evidence, page/inline-script/id integrity, repository freshness/capability checks, selftest baseline parity, editor diagnostics, `git diff --check`, artifact lint, capability-foundation check, and framework write guard are current and every finding is individually accounted for in `report.md`.

## Shared Planning Expectations

These expectations apply to every active scope above and are not themselves an executable scope.

- Active delivery is U.S. SEC / US GAAP and the named MSFT, CMG, and JPM canaries. International/IFRS normalization, personalized advice or trading, automatic proposal application, and commercial-provider activation are excluded from the active inventory and have no executable scope here.
- Every scope begins Not Started and every Definition-of-Done checkbox begins unchecked; no scope writes implementation evidence during planning.
- Deterministic tests execute production logic over immutable recorded real source inputs; controlled live SEC acquisition is a separate integration category; browser rows use the real ephemeral static server and committed source-qualified publications with no request interception, external browser provider, or self-validating fixture assertion.
- Every scope's Test Plan row count equals its Test Evidence Definition-of-Done item count.
- `SEC_USER_AGENT` is a required non-secret process input; missing or empty input blocks acquisition before network access and the value is never committed, persisted, echoed, included in receipts, or logged.
- The `spec.md` Release Train gate remains in force; no train id is invented, and Feature 010 stays `not_started` until the release-train owner acts.

## Superseded Scopes (Do Not Execute)

The following fourteen-scope horizontal per-directory plan is retired and is preserved here as non-executable archival history only. It has no active status, no active Test Plan, and no active Definition of Done. Do not execute or resume any item below; execute only the seven active scopes above.

The retired plan decomposed the work into fourteen thin horizontal layers ordered foundation-first: (01) contract, config, validator, and publication foundation; (02) controlled source ingestion and pointer-last promotion; (03) period-safe reconciliation and accounting integrity; (04) derived metrics, contextual resilience, and capital allocation; (05) archetype, KPI, and peer policy foundation; (06) MSFT, CMG, and JPM source-qualified overlays; (07) linked model families and scenario computation; (08) accepted browser state and proposal decisions; (09) accessible Simple and Detailed research workspace; (10) material-change adaptive brief; (11) narrative, sentiment, and macro boundaries; (12) degraded and unchanged brief history; (13) accepted export and Feature 002 owner read; and (14) real canary acquisition and cross-capability hardening.

That horizontal decomposition produced eleven-plus layers of untestable foundation before any single company could be exercised end to end, so it was replaced by three vertical increments across seven sequential scopes. The mapping from the retired fourteen scopes to the active seven is recorded below.

| Retired scope (do not execute) | Active home |
| --- | --- |
| 01 contract, config, validator, publication foundation | Scope 1 (foundation established while delivering the MSFT facts read) |
| 02 controlled source ingestion and pointer-last promotion | Scope 1 (MSFT retained-byte ingestion); real acquisition in Scope 7 |
| 03 period-safe reconciliation and accounting integrity | Scope 1 |
| 04 derived metrics, contextual resilience, capital allocation | Scope 2 |
| 05 archetype, KPI, peer policy foundation | Scope 2 (archetype/KPI); peer workspace in Scope 4 |
| 06 MSFT, CMG, JPM source-qualified overlays | Scope 2 (MSFT overlay) and Scope 6 (CMG and JPM overlays) |
| 07 linked model families and scenario computation | Scope 3 (ordinary-company model) and Scope 6 (bank model family) |
| 08 accepted browser state and proposal decisions | Scope 3 |
| 09 accessible Simple and Detailed research workspace | Scope 2 (Simple cockpit), Scope 4 (Detailed workspace parity), and Scope 7 (accessibility hardening) |
| 10 material-change adaptive brief | Scope 5 |
| 11 narrative, sentiment, macro boundaries | Scope 5 |
| 12 degraded and unchanged brief history | Scope 5 |
| 13 accepted export and Feature 002 owner read | Scope 4 (export and owner-read production) and Scope 5 (Feature 002 consume-once) |
| 14 real canary acquisition and cross-capability hardening | Scope 7 |

All thirty-two SCN-010 scenario contracts are preserved and remapped to their new primary scope in `scenario-manifest.json`; none were invalidated or dropped. The retired plan's Scope 01 implement and test raw evidence is preserved unchanged under `scopes/01-contract-config-validator-publication-foundation/report.md` and remains referenced by the foreign transition requests and execution history in `state.json`; that archival evidence is historical and is not an active execution surface.
