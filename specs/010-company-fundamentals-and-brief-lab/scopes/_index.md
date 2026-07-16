# Feature 010 Scope Index

Planning authority: [spec.md](../spec.md) and [design.md](../design.md). User acceptance is tracked in [uservalidation.md](../uservalidation.md). Every scope is gated by its own `scope.md` and `report.md`; no later scope starts until its dependency is Done.

## Execution Outline

### Phase Order

1. **Contract, configuration, validator, and publication foundation** defines reusable company objects, fail-loud configuration, graph validation, source lineage, and coherent immutable publications.
2. **Controlled source ingestion and promotion** acquires SEC and reviewed issuer evidence through bounded Node adapters, stages complete generations, and swaps pointers last.
3. **Period-safe reconciliation and accounting integrity** normalizes period meaning, preserves amendments/conflicts, and propagates integrity failures only to dependent consumers.
4. **Derived metrics, resilience, and capital allocation** implements transparent formulas and raw/contextual diagnostics without a composite score.
5. **Archetype, KPI, and peer policy foundation** selects evidenced research questions and admits peer observations only when definitions are compatible.
6. **MSFT, CMG, and JPM overlays** binds three source-qualified canary definitions to the shared contracts without copying formulas or facts between issuers.
7. **Linked model families and scenario computation** implements ordinary-company and financial-institution graphs with explicit invalid branches and actual/estimate separation.
8. **Accepted browser state and proposal decisions** preserves company isolation, user-owned revisions, and explicit accept/edit/reject transitions.
9. **Simple/Detailed accessible research workspace** renders every workspace from one accepted state with keyboard, narrow-screen, and chart/table parity.
10. **Material-change adaptive brief** classifies and ranks new filing, KPI, and management evidence against company mechanisms and model sensitivity.
11. **Narrative, sentiment, and macro boundaries** keeps weaker evidence in its class and admits context only through an evidenced company mechanism.
12. **Degraded and unchanged brief history** preserves stale/partial truth, records no-change outcomes, and avoids duplicate narrative/history events.
13. **Accepted export and Feature 002 owner read** projects the accepted state once and preserves all owner clocks and non-recomputation boundaries.
14. **Real canary acquisition and cross-capability hardening** publishes MSFT/CMG/JPM from controlled source-qualified inputs and validates the whole static-site/brief boundary.

### New Types And Signatures

- `CompanyIdentity/v1`, `ReportingPeriod/v1`, `SourceArtifact/v1`, `FactObservation/v1`, `NormalizedFact/v1`
- `DerivedMetric/v1`, `DiagnosticCheck/v1`, `ArchetypeDefinition/v1`, `ArchetypeAssignment/v1`, `PeerSet/v1`
- `CompanyDossier/v1`, `ModelDefinition/v1`, `ScenarioRevision/v1`, `EvidenceChange/v1`, `ModelImpactProposal/v1`
- `AdaptiveCompanyBrief/v1`, `FundamentalsToolRead/v1`, `CompanyPublicationManifest/v1`, `CompanyAcceptedState/v1`
- `validateCompanyConfig(config)`, `validatePublicationGraph(manifest, objects)`, `canonicalizeCompanyObject(value)`
- `classifyReportingPeriod(context)`, `reconcileFactObservations(observations, policy)`, `evaluateStatementIntegrity(facts)`
- `evaluateDerivedMetric(formulaId, inputs)`, `evaluateDiagnostic(policyId, facts, archetype)`, `evaluateModel(definition, revision)`
- `reduceCompanySelection(state, event)`, `reduceScenarioDraft(state, event)`, `reduceProposalDecision(state, event)`
- `rankEvidenceChanges(changes, policy)`, `buildAdaptiveCompanyBrief(input)`, `buildAcceptedExport(state)`, `buildFundamentalsToolRead(state)`
- Node entrypoints: `scripts/ingest-company-fundamentals.mjs` and `scripts/validate-company-fundamentals.mjs`
- Browser route: `company-fundamentals-lab.html?company=<id>&mode=<simple|detailed>&tab=<workspace>&ref=<same-company-id>`

### Validation Checkpoints

- Scopes 01-05 each gate the next foundation layer with production-helper tests in `node scripts/selftest.mjs` and validator-backed integration checks.
- Scope 06 proves the three overlay definitions use shared facts while selecting materially different KPI, diagnostic, model, and peer policies.
- Scopes 07-09 gate model, state, and UI independently before any adaptive narrative or Feature 002 consumer work begins.
- Scopes 10-12 require deterministic change/brief receipts plus scenario-specific browser regression tests before export or global-brief integration.
- Scope 13 runs owner-read/Feature 002 boundary tests before registry participation is allowed.
- Scope 14 reruns the exact baseline command, validator, real-browser suite, registry canaries, freshness/capability checks, and the three controlled live acquisitions before promotion.

## Protected Shared-Surface Gate

The following files are high-fan-out and may be changed only in the named scope after its prerequisites pass:

| Surface | Earliest owning scope | Required independent canary before edit | Rollback boundary |
| --- | --- | --- | --- |
| `scripts/selftest.mjs` | 01 | Record the current full result (`497 passed, 0 failed`) and verify pre-existing groups remain unchanged | Reverse only the scope-owned additive test group; retain production helpers and unrelated tests untouched |
| `tools.json` | 13 | Existing registry parity and every pre-existing tool ID/route remain valid | Remove only the new Feature 010 registry entry if its consumer gate fails |
| `index.html` | 13 | Existing launcher entries and data-settings anchor remain discoverable | Reverse only the new launcher entry and preserve surrounding user edits |
| `rlnav.js` | 13 | Existing shared navigation renders for representative old tools | Reverse only the new nav registration; no wholesale registry rewrite |
| `scripts/brief-refresh.mjs` | 13 | Feature 002 existing owner-read and no-action canaries pass before modification | Disable/remove only `company-fundamentals-owner-v1`; never rewrite prior brief/history artifacts |

Additional protected boundaries:

- `rldata.js` and `rlapp.js` are excluded from active edits. An implementation-discovered shared gap requires replanning with an independent downstream canary and a scope-specific rollback path.
- `msft-july-print-model.html`, Feature 009 assumptions, existing provider eligibility, release-train configuration, deployment surfaces, and unrelated tools remain excluded.
- Registry and Feature 002 edits are surgical, additive, and occur only after a valid committed owner read exists.
- Data rollback changes only a per-company current pointer to a previously validated manifest after hash revalidation; immutable objects and append-only history are never rewritten.
- Test acquisition staging uses run-owned temporary paths and cannot mutate current pointers until whole-publication validation succeeds.

## Dependency Graph

| # | Scope | Tags | Depends On | Surfaces | Primary BS coverage | Status |
| --- | --- | --- | --- | --- | --- | --- |
| 01 | Contract, config, validator, and publication foundation | `foundation:true` | - | `rlcompany.js`, config schema, validator, immutable object contracts, selftest | BS-010-026, BS-010-029 | Not Started |
| 02 | Controlled source ingestion and pointer-last promotion | `foundation:true` | 01 | Node SEC/issuer adapters, staging, receipts, content-addressed objects | BS-010-006, BS-010-027 | Not Started |
| 03 | Period-safe reconciliation and accounting integrity | `foundation:true` | 02 | Period normalization, mapping, statement checks, conflict propagation, Statements/Sources slice | BS-010-004, BS-010-005, BS-010-025 | Not Started |
| 04 | Derived metrics, contextual resilience, and capital allocation | `foundation:true` | 03 | Metrics, Buffett lens, capital-allocation decomposition, Resilience slice | BS-010-010, BS-010-011, BS-010-012 | Not Started |
| 05 | Archetype, KPI, and peer policy foundation | `foundation:true` | 04 | Archetype/KPI definitions, peer compatibility, unclassified behavior, Peers slice | BS-010-008, BS-010-009, BS-010-028 | Not Started |
| 06 | MSFT, CMG, and JPM source-qualified overlays | `overlay:true` | 05 | Three company configs/manifests, KPI/model/diagnostic policies, Simple canaries | BS-010-001, BS-010-002, BS-010-003 | Not Started |
| 07 | Linked model families and scenario computation | `foundation:true` | 06 | Ordinary-company/bank graphs, estimates/actuals, sensitivity, Model slice | BS-010-014, BS-010-016 | Not Started |
| 08 | Accepted browser state and proposal decisions | `foundation:true` | 07 | Publication loader, reducer, local user revisions, proposal decisions | BS-010-013, BS-010-023 | Not Started |
| 09 | Simple/Detailed accessible research workspace | `overlay:true` | 08 | One-state shell, six workspaces, responsive/a11y/chart-table behavior | BS-010-015, BS-010-032 | Not Started |
| 10 | Material-change adaptive brief | `foundation:true` | 09 | Evidence changes, ranking, claims, proposals, Brief slice | BS-010-017, BS-010-018, BS-010-022 | Not Started |
| 11 | Narrative, sentiment, and macro boundaries | `overlay:true` | 10 | News/sentiment/market/macro classification and divergence | BS-010-019, BS-010-020, BS-010-021 | Not Started |
| 12 | Degraded and unchanged brief history | `foundation:true` | 11 | Freshness, partial/unchanged outcomes, deduplicated append-only history | BS-010-024, BS-010-031 | Not Started |
| 13 | Accepted export and Feature 002 owner read | `integration:true` | 12 | Export, owner-read projection, registry/nav, Feature 002 adapter | BS-010-030 | Not Started |
| 14 | Real canary acquisition and cross-capability hardening | `hardening:true` | 13 | Controlled MSFT/CMG/JPM acquisition, validator, browser/registry/brief regression | BS-010-007 | Not Started |

## Primary Scenario Ownership

Each business scenario has exactly one primary scope. Supporting tests may exercise a scenario as a dependency but must cite its primary owner rather than claim duplicate primary coverage.

| Scenario | Primary scope | Scenario | Primary scope | Scenario | Primary scope | Scenario | Primary scope |
| --- | --- | --- | --- | --- | --- | --- | --- |
| BS-010-001 | 06 | BS-010-009 | 05 | BS-010-017 | 10 | BS-010-025 | 03 |
| BS-010-002 | 06 | BS-010-010 | 04 | BS-010-018 | 10 | BS-010-026 | 01 |
| BS-010-003 | 06 | BS-010-011 | 04 | BS-010-019 | 11 | BS-010-027 | 02 |
| BS-010-004 | 03 | BS-010-012 | 04 | BS-010-020 | 11 | BS-010-028 | 05 |
| BS-010-005 | 03 | BS-010-013 | 08 | BS-010-021 | 11 | BS-010-029 | 01 |
| BS-010-006 | 02 | BS-010-014 | 07 | BS-010-022 | 10 | BS-010-030 | 13 |
| BS-010-007 | 14 | BS-010-015 | 09 | BS-010-023 | 08 | BS-010-031 | 12 |
| BS-010-008 | 05 | BS-010-016 | 07 | BS-010-024 | 12 | BS-010-032 | 09 |

## Requirement-To-Scope/Test/DoD Map

This is the primary ownership map. Scope 14 performs integrated verification but does not replace the owning scope's scenario, Test Plan, or DoD evidence.

| Scope | Primary functional requirements | Primary non-functional requirements | Test Plan proof | DoD proof |
| --- | --- | --- | --- | --- |
| 01 | FR-010-001, FR-010-002, FR-010-005 through FR-010-007, FR-010-010 through FR-010-012, FR-010-101, FR-010-102, FR-010-104 | NFR-010-009, NFR-010-011 | TP-01-01 through TP-01-05 | Scope 01 Core Delivery Items plus exact five-row evidence parity |
| 02 | FR-010-008, FR-010-009, FR-010-099, FR-010-100 | NFR-010-012, NFR-010-015, NFR-010-017, NFR-010-018 | TP-02-01 through TP-02-05 | Scope 02 Core Delivery Items plus exact five-row evidence parity |
| 03 | FR-010-003, FR-010-004, FR-010-013 through FR-010-022 | NFR-010-010 | TP-03-01 through TP-03-06 | Scope 03 Core Delivery Items plus exact six-row evidence parity |
| 04 | FR-010-023 through FR-010-040 | - | TP-04-01 through TP-04-06 | Scope 04 Core Delivery Items plus exact six-row evidence parity |
| 05 | FR-010-041 through FR-010-046, FR-010-050, FR-010-082 through FR-010-087 | NFR-010-021 | TP-05-01 through TP-05-06 | Scope 05 Core Delivery Items plus exact six-row evidence parity |
| 06 | FR-010-047 through FR-010-049 | NFR-010-020 | TP-06-01 through TP-06-06 | Scope 06 Core Delivery Items plus exact six-row evidence parity |
| 07 | FR-010-051 through FR-010-062 | - | TP-07-01 through TP-07-05 | Scope 07 Core Delivery Items plus exact five-row evidence parity |
| 08 | FR-010-078, FR-010-079 | NFR-010-019 | TP-08-01 through TP-08-05 | Scope 08 Core Delivery Items plus exact five-row evidence parity |
| 09 | FR-010-088 through FR-010-092 | NFR-010-001 through NFR-010-008 | TP-09-01 through TP-09-06 | Scope 09 Core Delivery Items plus exact six-row evidence parity |
| 10 | FR-010-063 through FR-010-072, FR-010-077 | - | TP-10-01 through TP-10-06 | Scope 10 Core Delivery Items plus exact six-row evidence parity |
| 11 | FR-010-073 through FR-010-076, FR-010-081 | - | TP-11-01 through TP-11-06 | Scope 11 Core Delivery Items plus exact six-row evidence parity |
| 12 | FR-010-080, FR-010-098 | NFR-010-014, NFR-010-016 | TP-12-01 through TP-12-05 | Scope 12 Core Delivery Items plus exact five-row evidence parity |
| 13 | FR-010-093 through FR-010-097, FR-010-103 | - | TP-13-01 through TP-13-06 | Scope 13 Core Delivery Items plus exact six-row evidence parity |
| 14 | Integrated FR-010-001 through FR-010-104 verification | NFR-010-013, NFR-010-022 plus integrated NFR-010-001 through NFR-010-022 verification | TP-14-01 through TP-14-08 | Scope 14 Core Delivery Items plus exact eight-row evidence parity |

## Active Delivery Boundaries

- Active delivery is U.S. SEC/US GAAP and the named MSFT, CMG, and JPM canaries.
- Licensed/commercial enrichment remains disabled unless an already-approved adapter policy supplies explicit rights, endpoint, credential transport, and failure behavior.
- International/IFRS normalization, personalized advice or trading, and automatic proposal application are excluded from the active inventory and have no executable scope here.
- `SEC_USER_AGENT` is a required non-secret process input. Missing/empty input blocks acquisition before network access; its value is never committed, persisted, echoed, included in receipts, or logged.
- No scope writes implementation evidence during planning. Every scope begins `Not Started` and every DoD checkbox begins unchecked.
