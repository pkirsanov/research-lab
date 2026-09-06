# Feature 031 Scopes — Shock Transmission Foundation

Planning authority: [spec.md](spec.md) and [design.md](design.md). Execution evidence belongs in [report.md](report.md). Human acceptance belongs in [uservalidation.md](uservalidation.md).

This five-scope plan delivers one topic-neutral foundation through the existing Research Agenda route. It creates no standalone Shock Transmission Lab. It makes no implementation, test-pass, release, or certification claim.

All planned UI work stays inside the existing Research Agenda route. No standalone Lab, secondary page, registry row, navigation target, or Horizon Ladder change is an implementation target.

<!-- markdownlint-disable MD024 -->

## Execution Outline

### Phase Order

1. **Scope 1 — Canonical contract, exact refusals, and production binding.** Add the pure `RLSHOCK` contract, canonical identity, strict nested validation, and byte-boundary enforcement. Bind it permanently on the existing Research Agenda route.
2. **Scope 2 — Net graph, actor, and policy state engine.** Compose gross shock, offsets, graph paths, actor authority, policy layers, restoration, and local hypotheticals.
3. **Scope 3 — Dynamic definitions and immutable v1/v2 publication.** Create the geopolitical and food v2 definition bytes once. Add dynamic registries, single-write publication, and predecessor isolation.
4. **Scope 4 — Three adapters and lossless production consumption.** Consume Scope 3 definitions. Prove resolver branches, exact callers, compact consumers, rollback coherence, and live Agenda Power use.
5. **Scope 5 — Existing Research Agenda experience and boundary closure.** Render the shared view state on the current route. Prove every protected boundary.

Scope 1 is tagged `foundation:true`. Every overlay scope depends on Scope 1. Scope execution is strictly sequential even when the dependency graph would permit a wider ready set.

### New Types And Signatures

- `RLSHOCK.canonicalize(value) -> canonical JSON text`.
- `RLSHOCK.digest(value) -> sha256:<hex>`.
- `RLSHOCK.resolveResourcePolicy(config) -> frozen shock-transmission/resource-policy/v1 | shock-transmission/error/v1`.
- `RLSHOCK.validateDefinition(value, resourcePolicy) -> admitted definition | shock-transmission/error/v1`.
- `RLSHOCK.validateObservationSet(value, definition, cutoff) -> admitted observations | error`.
- `RLSHOCK.validateAdapterOutput(value, definition, resourcePolicy) -> admitted adapter output | error`.
- `RLSHOCK.composeSnapshot(definition, observationSet, adapterOutput, resourcePolicy) -> shock-transmission/v1`.
- `RLSHOCK.validateSnapshot(value, definition, resourcePolicy) -> admitted snapshot | error`.
- `RLSHOCK.compareSnapshots(current, predecessor) -> additive comparison`.
- `RLSHOCK.projectViewState(snapshot, definition, projectionInput) -> shock-transmission/view-state/v1`.
- `RLSHOCK.buildFindingReferenceSeam(snapshot) -> research-finding-reference-seam/v2`.
- `RLSHOCK.projectClaimRows(viewState) -> frozen shock-transmission/claim-row/v1 rows`.
- `RLSHOCK.projectEdgeRows(viewState) -> frozen shock-transmission/edge-row/v1 rows`.
- `RLSHOCK.projectFindingRows(seam) -> frozen shock-transmission/finding-row/v1 rows`.
- `RLSHOCK.resolveDefinitionRegistries(definition) -> distinct frozen horizon and lever registries`.
- `RLSHOCK.readerSentence(error) -> plain reader text with machine path`.
- `research-agenda/shock-foundation-binding/v1 -> frozen { contractVersion, foundationContractVersion, resourcePolicy, resourcePolicyDigest }`.
- `getShockFoundationBinding() -> read-only frozen Scope 1 binding projection`.
- `RLSHOCKADAPTERS[adapterId].adapt({ definition, observationSet, ownerReads, leverValues }) -> shock-transmission/adapter-output/v1 | error`.
- `RLAGENDA.resolveAgendaConsumerState(request, dependencies) -> frozen success pair { viewState, findingSeam } or frozen refusal`.

### Validation Checkpoints

- **Checkpoint 1:** Dedicated production-unit and functional tests prove canonical identity, exact paths, closed shapes, and byte ceilings. Focused Playwright then proves the registered Research Agenda route executes the permanent foundation binding before Scope 2 starts.
- **Checkpoint 2:** Composition tests prove interval math, DAG rules, conflict preservation, actor authority, policy lifecycle, and non-persistence before publication changes.
- **Checkpoint 3:** Integration tests publish each production v2 definition once. They prove version-bound writes, cutoff rules, immutable history, and pointer-last recovery before adapters migrate.
- **Checkpoint 4:** Direct resolver, caller-dataflow, compact-consumer, definition-consumption, rollback, conformance, and focused Playwright tests must pass before Scope 5 starts.
- **Checkpoint 5:** Playwright proves the current Research Agenda route, Simple and Power parity, dynamic controls, accessibility, reset, and no new product surface.
- **Final planning checks:** Artifact, traceability, obligation, mechanism, requirement, capability, context-fit, vertical-plan, reference, prose, and changed-path guards must pass.

## Plan Boundary And Preconditions

### Existing Legacy Defect Route

`LEGACY-031-001` records the current geopolitical `situation-shape-invalid` refusal with no field path. Its repair belongs to `bubbles.bug` and is not Feature 031 work.

- Scope 1 may implement exact-path behavior for new v2 records without changing the legacy validator.
- Scope 4 may prove geopolitical adapter conformance from source-backed test inputs.
- Scope 3 and Scope 4 must not select a geopolitical v2 definition as current production truth while `LEGACY-031-001` remains open.
- Scope 5 must render the current legacy unavailability honestly. It must say that the current review published no path.
- Production expansion requires a complete bug packet, an owner-verified repair, and current regression evidence before the registry selects the geopolitical v2 definition.

This gate preserves the audit ordering without hiding the defect or absorbing its repair.

### Protected Adjacent Product

These Horizon Ladder surfaces are read-only:

- `horizon-ladder-lab.html`.
- `horizon-ladder-universe.json`.
- `notes/horizon-ladder-lab.md`.
- `tests/horizon-ladder-lab.spec.mjs`.
- The existing `horizon-ladder-lab` rows in `tools.json`, `index.html`, and `rlnav.js`.

The six horizons, long and short directions, and twelve `0/20` withholding cells remain unchanged. This plan makes no formal certification claim about Horizon Ladder.

### Protected History And Legacy Readers

- `specs/019-custom-recurring-research-agenda/**` remains unchanged.
- Existing files under `research/agenda/generations/**`, `research/agenda/reviews/**`, and existing history records remain byte-immutable.
- Existing v1 definitions remain readable and unchanged.
- `RLAGENDA.computeAgendaViewState()` remains the legacy v1 reader.
- `research-agenda-read/v1` remains readable by Market Brief and Company Intelligence.
- New v2 definitions and records use additive content-addressed paths.
- Tests mutate publications only inside owned ephemeral repositories or directories. Each test verifies restoration.

### Repository-Wide Exclusions

No scope may change these surface groups:

- Tool registration: `tools.json`, `index.html`, `rlnav.js`, or `site-exclusions.json`.
- Owner logic: `rlcausal.js`, `rlregime.js`, `rlmarketaction.js`, or `rlcompanyintel.js`.
- Owner pages: `trend-dynamics-cycle-lab.html` or `bond-regime-lab.html`.
- Feature 020 planning artifacts, Horizon Ladder files, or existing immutable Research Agenda records.
- Framework-managed files, package source locks, or deployment files.

## AUD-031-002 Planning Reconciliation

| Audit obligation | Current planning disposition |
| --- | --- |
| Scope-kind canonicality | Scope 1 and Scope 3 through Scope 5 use exact `runtime-behavior` tokens. Scope 2 uses the exact `contract-only` token. None carries punctuation. |
| Runtime regression checkpoints | Scope 1 adds TP-01-11 as a focused live production-binding canary. Scope 3 adds TP-03-13 as a focused live compatibility canary. Scope 1 and Scope 3 through Scope 5 carry the exact scenario-specific and broader E2E DoD obligations required for their runtime kind. |
| G026 applicability | No latency or throughput target is declared or required by design section 19. TP-01-07, TP-03-10, TP-04-10, and TP-04-11 remain structural and owner-bound resource checks, so a new timing stress command would duplicate no required proof and is not applicable. |
| G043 applicability | Not applicable. Routes, paths, contracts, identifiers, symbols, links, breadcrumbs, navigation, redirects, clients, generated clients, documentation, configuration, deep links, and test target identities remain intact. The nine reported checks arose from adversarial member-omission or rollback prose, not an interface-identity change. Existing additive consumer-compatibility tables remain as proportionate high-fan-out proof. |
| Shared-infrastructure protection | Scope 1 reuses TP-01-08 as its independent canary. Scope 5 reuses TP-05-01 as its existing-route canary. Each scope carries exact canary and rollback DoD text. No duplicate test is introduced. |
| Change containment | Scope 1 carries the exact cross-plan Change Boundary DoD obligation. Every scope already lists allowed file families and excluded surfaces. |
| Receipt freshness | Historical receipts and `AUD-031-002` remain append-only. After the final planning bytes are fixed, `bubbles.audit` must execute the current applicable checks, append receipts with matching evidence identities and current input closures for every stale identity reported by `evidence-receipt-check.sh`, and require its strict projection to report zero stale receipts before a clean audit verdict. |

## Requirement Coverage Matrix

| Scope | Primary FR ownership | Primary NFR ownership | Scenario ownership |
| --- | --- | --- | --- |
| 1 | FR-031-001 through FR-031-008, FR-031-012, FR-031-014, FR-031-016, FR-031-029, FR-031-030 | NFR-031-001, NFR-031-004, NFR-031-008 | SCN-031-001, SCN-031-002, SCN-031-003, SCN-031-004, SCN-031-007 |
| 2 | FR-031-009 through FR-031-011, FR-031-013, FR-031-015, FR-031-017 through FR-031-022, FR-031-031 | — | SCN-031-005, SCN-031-006, SCN-031-008, SCN-031-009, SCN-031-010, SCN-031-011, SCN-031-012, SCN-031-013, SCN-031-024 |
| 3 | FR-031-023 through FR-031-027 | NFR-031-009 | SCN-031-014, SCN-031-015, SCN-031-016, SCN-031-017 |
| 4 | FR-031-028, FR-031-032 through FR-031-034 | NFR-031-002, NFR-031-005, NFR-031-007, NFR-031-010 | SCN-031-018, SCN-031-019, SCN-031-020, SCN-031-021, SCN-031-026 |
| 5 | FR-031-035 through FR-031-037 | NFR-031-003, NFR-031-006 | SCN-031-022, SCN-031-023, SCN-031-025 |

Every FR and NFR has one primary owner. Cross-scope tests may verify an earlier requirement through its first production consumer without changing that ownership.

### Exact Requirement Coverage Ledger

| Requirement | Owning scope | Primary proof ID | Discriminating assertion |
| --- | --- | --- | --- |
| FR-031-001 | 1 | TP-01-01 | The accepted root version equals `shock-transmission/v1`; any other root version refuses. |
| FR-031-002 | 1 | TP-01-06 | Topic-neutral closed-shape validation rejects a country, commodity, company, policy-actor, or topic-specific foundation member at its exact path. |
| FR-031-003 | 1 | TP-01-01 | Version, adapter, record identity, as-of time, and predecessor semantics survive canonical admission. |
| FR-031-004 | 1 | TP-01-02 | Deleting each required nested member returns that member's deterministic JSONPath. |
| FR-031-005 | 1 | TP-01-06 | Missing, unknown, malformed, duplicate, and incompatible members each return the expected code and path. |
| FR-031-006 | 1 | TP-01-06 | Refused members are not defaulted, renamed, discarded, repaired, or projected. |
| FR-031-007 | 1 | TP-01-01 | Reordered equivalent input yields one identity; changed canonical content yields a different identity. |
| FR-031-008 | 1 | TP-01-01 | Every required Shock field survives validation; deleting any field refuses at its exact path. |
| FR-031-009 | 2 | TP-02-09 | One valid extension kind passes; field deletion, duplicate id, or unknown operator refuses exactly. |
| FR-031-010 | 2 | TP-02-02 | Capacity, lag, expiry, uncertainty, source, provenance, and as-of fields remain complete. |
| FR-031-011 | 2 | TP-02-01 | Perturbing each effective offset changes the computed net range; omitting one refuses or withholds. |
| FR-031-012 | 1 | TP-01-05 | Finite `low <= base <= high` values share one declared unit; each violating boundary refuses. |
| FR-031-013 | 2 | TP-02-02 | Unavailable capacity widens or withholds the net result and never inserts zero. |
| FR-031-014 | 1 | TP-01-05 | Deleting every Edge field, limitation, or refuter refuses; TP-01-10 checks the full reader row. |
| FR-031-015 | 2 | TP-02-04 | Discontinuous, repeated, or wrong-outcome edge sequences refuse before finding composition. |
| FR-031-016 | 1 | TP-01-04 | An inferred edge without a limitation or observable refuter cannot publish. |
| FR-031-017 | 2 | TP-02-09 | Moving claims among observed, stated, inferred, constraint, and falsifier classes fails closed. |
| FR-031-018 | 2 | TP-02-05 | Five policy actor ids remain independent; executive ownership cannot replace Federal Reserve ownership. |
| FR-031-019 | 2 | TP-02-09 | Deleting each Policy Action field or cross-wiring owner, layer, trigger, or restoration ref refuses. |
| FR-031-020 | 2 | TP-02-07 | Growth, inflation, liquidity, credibility, and physical-capacity effects remain separate. |
| FR-031-021 | 2 | TP-02-08 | The action names one layer and condition; only admitted evidence may satisfy that condition. |
| FR-031-022 | 2 | TP-02-09 | Every lifecycle permits only its declared transitions; illegal promotion and regression refuse. |
| FR-031-023 | 3 | TP-03-01 | Horizon ids, order, labels, durations, and interval bounds remain definition-owned. |
| FR-031-024 | 3 | TP-03-07 | New horizon ids remain additive; legacy tokens and historical bytes are not rewritten. |
| FR-031-025 | 3 | TP-03-02 | Every state is exclusive and finite; totals pass only within the declared tolerance. |
| FR-031-026 | 3 | TP-03-02 | Keeping curve-level evidence intact while independently omitting each row-level provenance, evidence, source, as-of, or limitation member returns its exact-path refusal. |
| FR-031-027 | 3 | TP-03-11 | Shock, Edge, Path, Curve, Finding, Policy, and Restoration revisions require valid predecessors. |
| FR-031-028 | 4 | TP-04-03 | All seven financial dimensions pass; one missing dimension or undeclared state refuses without a physical-domain substitute. |
| FR-031-029 | 1 | TP-01-06 | Closed Finding validation admits every required field and public subject; deleting any qualifier or adding a private subject refuses at its exact path. |
| FR-031-030 | 1 | TP-01-09 | Claim rows label evidence quality and contain no market-success probability. |
| FR-031-031 | 2 | TP-02-09 | Stale, missing, conflicted, unsupported, and invalidated findings remain explicit and refuse any directional substitute before projection. |
| FR-031-032 | 4 | TP-04-04 | `causalPath`, `refutedBy`, and `limitations` remain byte-equivalent with all existing fields. |
| FR-031-033 | 4 | TP-04-04 | Omitting any required Finding member returns `RLSHOCK-PROJECTION-LOSSY` at its exact path. |
| FR-031-034 | 4 | TP-04-05 | Geopolitical, agricultural, and financial outputs pass the same neutral structural validator. |
| FR-031-035 | 5 | TP-05-16 | Protected hashes and semantics preserve six horizons, two directions, and twelve withheld cells. |
| FR-031-036 | 5 | TP-05-15 | Discovery finds no Iran-only route, tool, navigation target, or foundation member. |
| FR-031-037 | 5 | TP-05-16 | The truth table keeps admission false when any evidence set is absent, rejects duplicate or test-only callers, and turns true only with all three sets plus two unique production consumers. |
| NFR-031-001 | 1 | TP-01-01 | Identical canonical inputs produce identical bytes and identity across key-order permutations. |
| NFR-031-002 | 4 | TP-04-12 | Foundation and adapters run without network, key, account, clock, or server globals. |
| NFR-031-003 | 5 | TP-05-16 | Every private subject, position, size, cost, profit, account, and credential field refuses. |
| NFR-031-004 | 1 | TP-01-08 | The same UMD exports load through Node and browser globals without a bundler. |
| NFR-031-005 | 4 | TP-04-07 | Adapter order permutations preserve unrelated definition, registry, input, and output fingerprints. |
| NFR-031-006 | 5 | TP-05-03 | The production route shows plain text plus the exact machine path and no replacement value. |
| NFR-031-007 | 4 | TP-01-07, TP-03-10, TP-04-10, TP-04-11 | By Scope 4 completion, exact lower, boundary, and adversarial cases have exercised every direct and inherited numeric budget through its owner. |
| NFR-031-008 | 1 | TP-01-06 | Malformed, missing, stale, conflicted, and incompatible records reach distinct assertions. |
| NFR-031-009 | 3 | TP-03-06 | Every prior artifact remains readable and byte-identical after revision and rollback. |
| NFR-031-010 | 4 | TP-04-07 | Topic order and count permutations preserve per-topic outputs, graph-size validation remains bounded, and a topic-id branch mutation fails the matrix. |

### Numeric Budget Proof Ledger

| Budget id | Limit | Ownership | Exact proof ids | Required edge assertions |
| --- | --- | --- | --- | --- |
| BUDGET-031-HORIZONS | 48 horizons | Feature 031 resource policy | TP-01-07 | 47 and 48 valid rows pass. The 49th row refuses at `$.horizonRegistry[48]` before row traversal. |
| BUDGET-031-GRAPH-NODES | 200 nodes | Feature 031 resource policy | TP-01-07 | 199 and 200 valid nodes pass. Node 201 refuses at `$.graph.nodes[200]` before endpoint or path traversal. |
| BUDGET-031-ARTIFACT-BYTES | 262144 canonical UTF-8 bytes | Feature 031 applicability through the existing Feature 019 owner guard | TP-03-10 | 262143 and 262144 pass through the real transaction. 262145 refuses before immutable creation. No duplicate byte counter is added. |
| BUDGET-031-ACQUISITION-BYTES | 524288 acquisition bytes | Existing web-evidence acquisition owner | TP-04-10 | The owner accepts 524288 and refuses 524289 with `E012-WEB-BUDGET`. Each adapter receives only the admitted bundle identity. |
| BUDGET-031-AUTHOR-SECONDS | 900 seconds | Existing Research Agenda author owner | TP-04-11 | The owner passes 900000 milliseconds and returns `author-timeout`. Each adapter remains timer-free and does not run after timeout. |

The unchanged owner test `Regression: agenda acquisition rejects query URL byte time and concurrency limits at capacity plus one` protects the acquisition policy.
The unchanged owner test `Regression: every Feature 019 artifact family accepts exactly 262144 bytes and refuses 262145 before publication` protects the canonical artifact guard.
The unchanged owner test `Regression: research lane timeout leaves every critical lane output byte-identical` protects author-timeout isolation.

### Test Plan Cardinality Derivation

The reconciled plan contains 80 distinct test rows. This count follows from the proof obligations below. It is not a target chosen before the obligations were reviewed.

| Scope | Distinct proof obligations | Row count |
| --- | --- | --- |
| 1 | Five direct contract regressions, one closed-traversal matrix, one resource-boundary matrix, one staged canary, two pure reader projections, and one focused existing-route production binding | 11 |
| 2 | Eight direct engine regressions, one lifecycle-and-authority matrix, one staged canary, one pure hypothetical projection, and one dedicated hypothetical sink integration | 12 |
| 3 | Three direct definition regressions, one revision round trip, one dual-read matrix, one rollback matrix, one cutoff and calibration matrix, one staged functional canary, one pure lever-registry prerequisite, one artifact-byte boundary, one lineage matrix, one immutable-definition publication proof, and one live legacy-reader compatibility canary | 13 |
| 4 | Four adapter and seam regressions, one conformance matrix, five parent-resolver branch and refusal matrices, one authority and scaling matrix, two compact-consumer regressions, one staged canary, two inherited-owner boundaries, one offline boundary, two caller-dataflow proofs, one immutable-definition consumption proof, one rollback-coherence proof, and two focused live browser proofs | 23 |
| 5 | Sixteen focused browser regressions, one unchanged Horizon Ladder suite, one complete Feature 031 browser suite, one functional boundary matrix, and two pure reader projections | 21 |
| **Total** | **Every row has a unique id, DoD id, command purpose, and discriminating assertion** | **80** |

The duplicate review removed SCN-031-024 sink isolation from TP-02-09. TP-02-12 is the sole integration obligation for that behavior and uses `tests/shock-transmission.hypothetical.integration.mjs`. TP-02-09 remains necessary for the distinct extension-kind, reaction-class, policy-field, lifecycle, conflict, and predecessor-isolation matrix. Broad canary and complete-suite rows remain because they verify staged inventory and cross-test integration rather than replacing focused regressions.

## Active Scope Inventory

| # | Scope | Surfaces | Primary tests | DoD summary | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | Canonical contract, exact refusals, and production binding | UMD foundation, domain SST, existing Research Agenda route, dedicated unit, functional, and focused live tests | Unit, functional, resource boundary, E2E UI | Closed contract, exact paths, canonical identity, byte limits, permanent registered-route binding | In Progress |
| 2 | Net graph, actor, and policy engine | UMD foundation, dedicated unit tests, existing-route projection helpers | Unit, functional, adversarial | Offset math, DAGs, conflicts, actor authority, lifecycle, local state | Not Started |
| 3 | Dynamic definitions and immutable publication | Agenda resolver, refresh and generation transaction, v2 definitions, migration tests | Unit, functional, integration | Dynamic registries, cutoff and vintage, dual-read, single-write, history | Not Started |
| 4 | Three adapters and lossless consumer | UMD adapters, parent resolver, exact callers, definition consumption, Agenda Power seam, compact consumers | Unit, functional, integration, E2E UI | Three domains, closed resolution, live lossless consumer, coherent rollback | Not Started |
| 5 | Existing-route experience and boundaries | Research Agenda Simple and Power, Playwright, discovery and protected-product checks | E2E UI, functional, regression, build | Honest UI, accessibility, non-persistence, no new route, protected history | Not Started |

## Scope 1: Canonical Contract And Exact Refusal Foundation

**Status:** In Progress

**Depends On:** None.

**Scope-Kind:** runtime-behavior

**Tags:** `foundation:true`, `red-first:true`, `public-artifact:true`.

**Lockdown-FRs:** `FR-031-001`, `FR-031-002`, `FR-031-003`, `FR-031-004`, `FR-031-005`, `FR-031-006`, `FR-031-007`, `FR-031-008`, `FR-031-012`, `FR-031-014`, `FR-031-016`, `FR-031-029`, `FR-031-030`.

**Primary Outcome:** One pure `RLSHOCK` API admits canonical public records and rejects malformed nested data with deterministic codes and exact JSONPath locations. The existing registered Research Agenda route executes one permanent, policy-validated foundation binding before its initial topic selection and then preserves its current legacy reader behavior.

### Gherkin Scenarios

```gherkin
Scenario: SCN-031-001 A complete shock is admitted
Given a topic adapter submits a shock with source, start, capacity, observed loss, uncertainty, and repair path
When the foundation validates the shock
Then it admits one versioned shock record
And every numeric member retains its source, provenance, and as-of time

Scenario: SCN-031-002 A missing member is refused by exact field path
Given a foundation record omits one required nested member
When the foundation validates the record
Then validation refuses the record
And the refusal names the exact missing field path
And no generic shape reason replaces that path

Scenario: SCN-031-003 An unknown member fails closed
Given a topic adapter submits an undeclared member
When the foundation validates the record
Then validation refuses the unknown member by exact field path
And the member is not ignored or copied into a public finding

Scenario: SCN-031-004 Evidence and inference remain distinct
Given one claim is an observed fact and another is a model inference
When both claims enter one transmission path and a reader opens that path on the existing Research Agenda route
Then each keeps its own claim class and evidence grade
And the route labels the observed fact and model inference separately
And the inferred claim presents its limitation and refuter

Scenario: SCN-031-007 A transmission edge carries a bounded range
Given a supported connection between two states
When the edge is published and a reader opens its path on the existing Research Agenda route
Then it carries sign, unit, low, base, high, lag, persistence, evidence, and refuter
And low is not greater than base
And base is not greater than high
And the route presents the complete bounded range and qualifiers without collapsing them into one value
```

### Implementation Plan

1. Add dedicated persistent tests and complete public fixtures before production edits. Record a meaningful missing-module or missing-export RED.
2. Add `rlshock.js` as a frozen UMD and CommonJS-compatible module with no DOM, clock, fetch, storage, Node-only, or owner-module dependency.
3. Implement closed shape traversal, deterministic first-error ordering, exact JSONPath construction, and `valueEchoed: false`.
4. Implement canonical normalization, stable digests, nested version identities, source and provenance checks, public-subject checks, and recursive private-field refusal.
5. Implement quantity, range, unit, sign, claim-class, evidence, limitation, and refuter validation.
6. Implement `projectClaimRows(viewState)` and `projectEdgeRows(viewState)` as pure frozen projections over validated view state. Refuse missing evidence semantics or edge qualifiers before returning a row.
7. Add the planned `ShockTransmissionDefinition`, `ShockTransmissionSnapshot`, and `ShockFinding` entities and four invariants to `config/domain-model.yaml`.
8. Add a sentinel-bounded Feature 031 canary to `scripts/selftest.mjs` only after dedicated tests pass.
9. Implement `resolveResourcePolicy(config)` against the required `shock-transmission/resource-policy/v1` block in `market-brief.config.json`. Pass the frozen result explicitly to definition, adapter-output, composition, and snapshot validation. Refuse missing, extra, malformed, or mismatched policy fields by exact path without module fallbacks.
10. Add the exact TP-01-11 Playwright regression before changing the route. Require its RED control to detect a missing script, a removed or duplicate policy-resolution call, a changed binding member, or a rejected policy.
11. Bind `rlshock.js` on the existing registered Research Agenda route. Load it immediately before `rlagenda.js`. During `boot()`, resolve the required repository policy exactly once before initial topic selection. Freeze `research-agenda/shock-foundation-binding/v1`, expose only its four members through `getShockFoundationBinding()`, and continue through the unchanged legacy terminal view after successful admission.
12. Keep this binding policy-only. It creates no snapshot, adapter output, finding seam, parent-resolver call, synthetic v2 record, route, registry row, navigation entry, or standalone Lab. Scope 4 extends this permanent prefix with full v2 resolution and lossless finding consumption.
13. Exercise 47, 48, and 49 horizons and 199, 200, and 201 graph nodes.
14. Route Feature 031 artifacts through the existing 262144-byte transaction guard without duplicating its counter.

### Exact Source And Change Boundary

#### Allowed Product Files

- Planned new `rlshock.js`.
- `market-brief.config.json` for the exact required `shock-transmission/resource-policy/v1` block defined in design section 19.1. No unrelated policy field may change.
- `config/domain-model.yaml` for the exact three entities and four invariants defined in design section 4.5.
- Planned new `tests/shock-transmission.contracts.unit.mjs`.
- Planned new `tests/shock-transmission.validation.functional.mjs`.
- Planned new `tests/shock-transmission.resource.functional.mjs`.
- Planned new `tests/shock-transmission.canary.functional.mjs` for the exact TP-01-08 title. TP-02-10, TP-03-08, and TP-04-09 add distinct titles to the same file.
- Planned new `tests/shock-transmission.reader.unit.mjs` rows for `projectClaimRows(viewState)` and `projectEdgeRows(viewState)`.
- Limit `research-agenda-lab.html` changes to the exact Scope 1 binding regions. They cover script order, policy admission, frozen binding, read-only projection, explicit failure, and unchanged legacy continuation.
- Planned new `tests/shock-transmission.e2e.spec.mjs` only for TP-01-11, titled `Regression: SCN-031-022 existing Agenda binds the shock foundation without a new route`.
- Planned new `tests/fixtures/shock-transmission/**` public synthetic contract corpus.
- One Feature 031 sentinel region in `scripts/selftest.mjs`.
- `docs/DomainModel.md` only through its documentation owner and only for the exact domain SST mirror.

#### Excluded Surfaces

- `rlagenda.js`, publisher scripts, topic definitions, and adapters.
- Every Research Agenda HTML region outside the exact Scope 1 module-order, boot binding, boot-failure, debug-projection, and unchanged-legacy-continuation boundary.
- Registries, navigation, Horizon Ladder, and existing immutable records.
- Feature 019 artifacts, Feature 020 artifacts, package files, and framework-managed files.
- Legacy `validateResearchSituation()` and its `situation-shape-invalid` behavior.
- Any topic-specific calculation or country-specific foundation field.

### Consumer Trace

G043 is not applicable to Scope 1 because every existing first-party interface identity remains intact. The table records additive consumer compatibility for the new foundation.

| Consumer | Contract impact | Planned proof |
| --- | --- | --- |
| Existing registered Research Agenda route | Loads `rlshock.js` immediately before `rlagenda.js`, resolves the required policy once before initial topic selection, freezes the exact four-member binding, and then reaches the unchanged legacy terminal view | TP-01-11 opens the real static route. Removing the script tag or policy call, duplicating policy resolution, changing the snapshot contract, or rejecting the policy fails the focused proof |
| Scope 2 composition | Consumes validated quantities, edges, paths, actors, and errors | Dedicated unit imports the frozen production API |
| Scope 3 publisher and reader resolver | Consumes version, identity, and refusal contracts | Migration integration tests use real `RLSHOCK` exports |
| Scope 4 adapters | Must return a closed adapter-output shape | Three-adapter conformance tests pass through foundation validation |
| Scope 5 Research Agenda view | Renders `readerSentence(error)`, `projectClaimRows(viewState)`, and `projectEdgeRows(viewState)` without owning version dispatch | Playwright asserts visible reason, machine path, claim semantics, and bounded edge qualifiers |
| Product domain model | Names shared entities and invariants | Domain-model guards and the documentation mirror agree |

### Shared Infrastructure Impact Sweep

| Protected surface | Blast radius | Independent canary | Rollback or restore |
| --- | --- | --- | --- |
| `scripts/selftest.mjs` | Every repository invariant group and summary count | Dedicated unit, functional, and resource tests run first. The complete selftest then retains every unrelated group | Remove only the Feature 031 sentinel region and compare surrounding bytes |
| `market-brief.config.json` | Existing artifact, acquisition, and publication policy consumers | Resolve the new block through `RLSHOCK.resolveResourcePolicy(config)`. Run existing policy consumers unchanged before the broad selftest | Remove only the exact Feature 031 resource-policy block. No module constant or fallback may replace it |
| `config/domain-model.yaml` | Product-wide entity and invariant resolution | Domain-model consistency and correspondence guards run before the broad selftest | Reverse only the three entity rows and four invariant rows |
| Existing UMD load order and Research Agenda boot | Every static route depends on stable global loading. The registered Agenda route becomes the first production consumer | Dedicated CommonJS and browser-global contract tests run first. TP-01-11 then proves exact script order, one policy admission, frozen binding identity, and unchanged legacy terminal rendering on the real route | Reverse only the exact script tag, boot binding, failure, and debug-projection regions. Existing Agenda reader logic and all other modules remain unchanged |

### Rollback And Recovery

- A failed validation test leaves no production record and no registry movement.
- A failed selftest canary restores only the Feature 031 sentinel region.
- A failed domain-model guard restores only the exact Feature 031 entities and invariants.
- A failed production-binding proof reverses only the exact Research Agenda script tag, boot binding, boot-failure, and debug-projection regions. It removes only the TP-01-11 title and leaves the existing route, legacy reader, registries, and navigation unchanged.
- Fixture roots use unique names and are deleted after each run. Cleanup failure keeps the scope open.

### Test Plan

| ID | Scenario | Type | Category | File and exact title | Exact command | Live system | Required result |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TP-01-01 | SCN-031-001 | unit | unit | Planned `tests/shock-transmission.contracts.unit.mjs` — `Regression: SCN-031-001 complete shock admission preserves canonical provenance`; planning host `scripts/selftest.mjs` | `node --test --test-name-pattern='^Regression: SCN-031-001 complete shock admission preserves canonical provenance$' tests/shock-transmission.contracts.unit.mjs` | No | Production `RLSHOCK` admits the complete record and recomputes stable identities. |
| TP-01-02 | SCN-031-002 | unit | unit | Planned `tests/shock-transmission.contracts.unit.mjs` — `Regression: SCN-031-002 every missing nested member returns its exact path`; planning host `scripts/selftest.mjs` | `node --test --test-name-pattern='^Regression: SCN-031-002 every missing nested member returns its exact path$' tests/shock-transmission.contracts.unit.mjs` | No | The complete deletion matrix returns one deterministic path per required nested member. |
| TP-01-03 | SCN-031-003 | unit | unit | Planned `tests/shock-transmission.contracts.unit.mjs` — `Regression: SCN-031-003 unknown members fail closed and never project`; planning host `scripts/selftest.mjs` | `node --test --test-name-pattern='^Regression: SCN-031-003 unknown members fail closed and never project$' tests/shock-transmission.contracts.unit.mjs` | No | Unknown root, nested, array, and dynamic-map members refuse and cannot enter a finding. |
| TP-01-04 | SCN-031-004 | unit | unit | Planned `tests/shock-transmission.contracts.unit.mjs` — `Regression: SCN-031-004 observed and inferred claims retain distinct evidence contracts`; planning host `scripts/selftest.mjs` | `node --test --test-name-pattern='^Regression: SCN-031-004 observed and inferred claims retain distinct evidence contracts$' tests/shock-transmission.contracts.unit.mjs` | No | Observed and inferred claims remain distinct. Missing inferred limitations or refuters refuse. |
| TP-01-05 | SCN-031-007 | unit | unit | Planned `tests/shock-transmission.contracts.unit.mjs` — `Regression: SCN-031-007 ranges units and signs reject every boundary mismatch`; planning host `scripts/selftest.mjs` | `node --test --test-name-pattern='^Regression: SCN-031-007 ranges units and signs reject every boundary mismatch$' tests/shock-transmission.contracts.unit.mjs` | No | Ordered ranges pass. Non-finite, reversed, unknown-unit, and sign-mismatch cases fail at exact paths. |
| TP-01-06 | SCN-031-001, SCN-031-002, SCN-031-003, SCN-031-004, SCN-031-007 | functional | functional | `tests/shock-transmission.validation.functional.mjs` — `Feature 031 exact refusal and canonical traversal matrix` | `node --test tests/shock-transmission.validation.functional.mjs` | No | Missing, unknown, malformed, duplicate, incompatible, private, and lossy inputs fail with exact codes and paths. |
| TP-01-07 | SCN-031-001, SCN-031-014 | functional | functional | `tests/shock-transmission.resource.functional.mjs` — `Feature 031 resource policy enforces horizon and graph boundaries` | `node --test tests/shock-transmission.resource.functional.mjs` | No | The 47/48/49 horizon and 199/200/201 node matrices discriminate exact policy boundaries before collection traversal. |
| TP-01-08 | SCN-031-001, SCN-031-002, SCN-031-003, SCN-031-004, SCN-031-007 | functional | functional | `tests/shock-transmission.canary.functional.mjs` — `Feature 031 foundation canary preserves the registered selftest inventory` | `node --test --test-name-pattern='^Feature 031 foundation canary preserves the registered selftest inventory$' tests/shock-transmission.canary.functional.mjs` | No | Canary: the focused production-export path compares the repository selftest inventory before the broad selftest runs. |
| TP-01-09 | SCN-031-004 | ui-unit | ui-unit | `tests/shock-transmission.reader.unit.mjs` — `Regression: SCN-031-004 claim rows retain distinct visible evidence semantics` | `node --test --test-name-pattern='^Regression: SCN-031-004 claim rows retain distinct visible evidence semantics$' tests/shock-transmission.reader.unit.mjs` | No | `projectClaimRows()` returns distinct labels and grades. Removing the inferred limitation or refuter fails the assertion. |
| TP-01-10 | SCN-031-007 | ui-unit | ui-unit | `tests/shock-transmission.reader.unit.mjs` — `Regression: SCN-031-007 edge rows retain the complete bounded qualifier contract` | `node --test --test-name-pattern='^Regression: SCN-031-007 edge rows retain the complete bounded qualifier contract$' tests/shock-transmission.reader.unit.mjs` | No | `projectEdgeRows()` preserves identity, order, sign, unit, interval, lag, persistence, evidence, limitations, and refuters. |
| TP-01-11 | SCN-031-022 | e2e-ui | e2e-ui | Planned `tests/shock-transmission.e2e.spec.mjs` — `Regression: SCN-031-022 existing Agenda binds the shock foundation without a new route`; planning host `tests/tool-experience.spec.mjs` | `npx --no-install playwright test tests/shock-transmission.e2e.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep='Regression: SCN-031-022 existing Agenda binds the shock foundation without a new route$' --reporter=list` | Yes | The registered route loads `rlshock.js` immediately before `rlagenda.js`, resolves the required policy exactly once before initial topic selection, freezes the exact four-member binding with the declared snapshot contract and policy digest, exposes only that read-only projection, and reaches the unchanged legacy terminal view. Removing the script or call, duplicating the call, changing a binding member, or rejecting the policy fails. |

The project config declares no `testImpact` or `traceContracts`. No impact-plan, trace, or SLO row applies.

### Definition of Done — Tiered Validation

Planning does not execute delivery work. Every item remains unchecked until its owning phase records current evidence.

#### Core Items

- [x] `DOD-01-C01` The frozen UMD foundation, domain SST additions, exact refusal contract, canonical identities, and recursive public-scope guard match the design. → Evidence: [Scope 01 foundation and domain contract](report.md#scope-01-dod-c01)
- [x] `DOD-01-C02` Every `Lockdown-FRs` requirement and NFR-031-001, NFR-031-004, and NFR-031-008 has production behavior and an adversarial assertion. → Evidence: [Scope 01 locked requirements and adversarial assertions](report.md#scope-01-dod-c02)
- [x] Independent canary suite for shared fixture/bootstrap contracts passes before broad suite reruns. `DOD-01-C03` TP-01-08 validates production-export and selftest-inventory contracts before the complete selftest. → Evidence: [Scope 01 independent canary](report.md#scope-01-dod-c03)
- [x] Change Boundary is respected and zero excluded file families were changed. `DOD-01-C04` Scope 1 stays inside its allowed file families and preserves every excluded surface byte. → Evidence: [Scope 01 change boundary](report.md#scope-01-dod-c04)
- [x] Rollback or restore path for shared infrastructure changes is documented and verified. `DOD-01-C05` The Feature 031 sentinel, resource-policy block, domain-model additions, and UMD load-order changes each restore only their declared bytes. → Evidence: [Scope 01 rollback and restore boundaries](report.md#scope-01-dod-c05)
- [x] `DOD-01-C06` The existing registered Research Agenda route owns the permanent Scope 1 binding. It loads `rlshock.js` immediately before `rlagenda.js`. It resolves the required policy once before initial topic selection. It freezes only the designed four-member value. Invalid binding input fails explicitly. Successful admission reaches the unchanged legacy terminal view. → Evidence: [revision 6 live binding](report.md#scope-01-revision-6-live-binding)

#### Test Evidence Items

- [x] `DOD-01-TP-01-01` SCN-031-001 A complete shock is admitted: TP-01-01 passes at the implementation revision. → Evidence: [TP-01-01 complete shock admission](report.md#scope-01-tp-01-01)
- [x] `DOD-01-TP-01-02` SCN-031-002 A missing member is refused by exact field path: TP-01-02 passes and its nested deletion matrix is complete. → Evidence: [TP-01-02 exact missing paths](report.md#scope-01-tp-01-02)
- [x] `DOD-01-TP-01-03` SCN-031-003 An unknown member fails closed: TP-01-03 passes and unknown members never project. → Evidence: [TP-01-03 unknown-member refusal](report.md#scope-01-tp-01-03)
- [x] `DOD-01-TP-01-04` SCN-031-004 Evidence and inference remain distinct: TP-01-04 passes and inferred claims require limitations and refuters. → Evidence: [TP-01-04 evidence and inference separation](report.md#scope-01-tp-01-04)
- [x] `DOD-01-TP-01-05` SCN-031-007 A transmission edge carries a bounded range: TP-01-05 passes across range, unit, sign, and non-finite boundaries. → Evidence: [TP-01-05 range, unit, and sign boundaries](report.md#scope-01-tp-01-05)
- [x] `DOD-01-TP-01-06` TP-01-06 passes with each declared negative control producing RED before GREEN. → Evidence: [TP-01-06 exact refusal traversal matrix](report.md#scope-01-tp-01-06)
- [x] `DOD-01-TP-01-07` TP-01-07 proves exactly-at-limit, limit-plus-one, and large-DAG structural resource behavior without asserting elapsed-time performance. → Evidence: [TP-01-07 resource policy boundaries](report.md#scope-01-tp-01-07)
- [x] `DOD-01-TP-01-08` TP-01-08 passes before the full repository selftest and preserves its inventory. → Evidence: [TP-01-08 selftest inventory canary](report.md#scope-01-tp-01-08)
- [x] `DOD-01-TP-01-09` TP-01-09 proves pure claim-row projection without substituting for browser proof. → Evidence: [TP-01-09 claim-row projection](report.md#scope-01-tp-01-09)
- [x] `DOD-01-TP-01-10` TP-01-10 proves pure edge-row projection without substituting for browser proof. → Evidence: [TP-01-10 edge-row projection](report.md#scope-01-tp-01-10)
- [x] `DOD-01-TP-01-11` SCN-031-022 production binding: TP-01-11 passes through the real static server. It detects every missing-script, missing-call, duplicate-call, binding-shape, snapshot-contract, and rejected-policy mutation. → Evidence: [revision 6 live browser proof](report.md#scope-01-revision-6-live-binding)
- [x] Scenario-specific E2E regression tests for every new or changed runtime behavior pass. `DOD-01-C07` TP-01-11 proves the Scope 1 registered-route foundation binding without claiming full v2 snapshot or finding consumption. → Evidence: [revision 6 scenario regression](report.md#scope-01-revision-6-live-binding)
- [x] Broader E2E regression suite passes. `DOD-01-C08` The canonical broad Research Agenda browser suite passes after TP-01-11 and before Scope 2 starts. → Evidence: [revision 6 Agenda browser regression](report.md#scope-01-revision-6-agenda-browser-regression)

#### Build Quality Gate

- [ ] `DOD-01-BQ` The complete Scope 1 build-quality gate passes with no excluded-path changes. → Evidence: [revision 6 broad selftest](report.md#scope-01-revision-6-broad-selftest)
   > **Uncertainty Declaration**
   > **What was attempted:** `bubbles.test` ran all eleven Scope 1 Test Plan rows, the five-test Research Agenda browser closure, and `node scripts/selftest.mjs` under finite revision-6 bounds on unchanged product bytes.
   > **What was observed:** Tool-log row 427 exited `1` with `3419 passed, 5 failed`. All three Feature 031 assertions pass. The failures are three options-flow assertions, five historical references to a retired test path reported as one finding, and one BUG-017 scope-progress contradiction.
   > **Why this is uncertain:** This item requires a zero-exit broad selftest. Current work-boundary resolution classifies every repair path as `route-same-repo`, so changing those files inside Feature 031 would violate the declared boundary.
   > **What would resolve this:** The owning classified packets must repair `F031-BROAD-OPTIONS-FLOW-001`, `XRL-PATH-GUARD-HIST-001`, and `XRL-BUG017-DOD-001`. The same broad command must then exit `0` on otherwise unchanged Scope 1 bytes.

## Scope 2: Net Graph Actor And Policy State Engine

**Status:** Not Started

**Depends On:** Scope 1.

**Scope-Kind:** contract-only

**Tags:** `foundation-extension:true`, `state-machine:true`, `nonpersistent-hypothetical:true`.

**Lockdown-FRs:** `FR-031-009`, `FR-031-010`, `FR-031-011`, `FR-031-013`, `FR-031-015`, `FR-031-017`, `FR-031-018`, `FR-031-019`, `FR-031-020`, `FR-031-021`, `FR-031-022`, `FR-031-031`.

**Primary Outcome:** A validated snapshot composes net transmission through a bounded DAG while preserving conflict, institutional authority, policy-layer independence, restoration evidence, and non-persistable local comparison.

### Gherkin Scenarios

```gherkin
Scenario: SCN-031-005 Gross disruption does not become net loss
Given a measured gross disruption and at least one potential offset
When the foundation composes the net transmission range
Then it accounts for accessible offset capacity, lag, expiry, and uncertainty
And it does not copy the gross disruption percentage into the downstream outcome

Scenario: SCN-031-006 An unavailable offset widens uncertainty
Given an offset is relevant but its capacity is unavailable
When the foundation composes a path
Then the offset remains unavailable
And the net range widens or remains unavailable
And no zero-capacity assumption is inserted

Scenario: SCN-031-008 Conflicting edges remain visible
Given two supported paths imply opposite effects on the same outcome
When the finding is composed
Then both paths remain visible
And the output records a conflict
And no average hides the disagreement

Scenario: SCN-031-009 Physical and financial mechanisms stay separate
Given a physical shortage and a financial amplification mechanism occur together
When the foundation composes their effects
Then each remains a separate path until an evidenced edge connects them
And a physical shortage alone does not assert a credit-system break

Scenario: SCN-031-010 Independent policy actors remain independent
Given executive, Treasury, Energy Department, Federal Reserve, and congressional actions appear in one review
When the foundation records actor reactions
Then each action belongs to its actual owner
And coordination does not imply control
And Federal Reserve action is not attributed to the administration

Scenario: SCN-031-011 An announcement is not implementation
Given an actor announces a policy action
When no implementation evidence exists
Then the action remains announced rather than implemented
And no effectiveness claim is published

Scenario: SCN-031-012 Policy layers may conflict
Given one action improves market liquidity but worsens inflation exposure
When the action is evaluated
Then liquidity and inflation effects remain separate
And the liquidity benefit does not imply restored solvency or physical supply

Scenario: SCN-031-013 Restoration requires its named condition
Given a policy action targets one impaired layer
When the declared restoration condition has not been observed
Then that layer remains unrestored
And no success label is inferred from the action itself

Scenario: SCN-031-024 A local hypothetical leaves canonical research unchanged
Given the existing Research Agenda route has a validated published baseline
When the operator changes a definition-owned lever, compares the result, and resets it on the same topic
Then every changed result is labelled User hypothetical and exists only in the current route session
And the comparison cannot be saved, published, or reused as canonical research
And no acquisition, dossier, history, current pointer, payload, tool read, or immutable record changes
And reset removes every hypothetical value and restores the exact loaded baseline identity
```

### Implementation Plan

1. Extend `rlshock.js` with offset lifecycles, interval subtraction, lag and expiry gating, unknown-capacity upper bounds, and unavailable net states.
2. Add DAG endpoint, rank, topological, path continuity, no-repeat, conflict-group, and time-unfolded feedback validation.
3. Add actor, reaction, policy action, effect, and restoration contracts with closed authority and lifecycle transitions.
4. Add current and predecessor isolation so `composeSnapshot()` cannot read predecessor values.
5. Add `shock-transmission/hypothetical/v1`, complete lever-map validation, `persistable: false`, and reset-to-baseline projection.
6. Add dedicated tests before extending the shared selftest sentinel.
7. Prove every new guard through a bounded mutation or perturbed input against the production branch.

### Exact Source And Change Boundary

#### Allowed Product Files

- `rlshock.js` within composition, graph, lifecycle, policy, and hypothetical sections.
- `tests/shock-transmission.composition.unit.mjs` as a planned new dedicated suite.
- `tests/shock-transmission.lifecycle.functional.mjs` as a planned new dedicated suite.
- `tests/shock-transmission.reader.unit.mjs` for pure hypothetical projection and reset.
- `tests/shock-transmission.hypothetical.integration.mjs` for real persistence-sink refusal.
- Existing Feature 031 fixtures under `tests/fixtures/shock-transmission/**`.
- The existing Feature 031 sentinel region in `scripts/selftest.mjs`.

#### Excluded Surfaces

- Adapters, Agenda resolver, publisher, topic files, Research Agenda HTML, registries, owner modules, Horizon Ladder, existing history, and legacy validator diagnostics.
- No predecessor value may enter `composeSnapshot()`.
- No local hypothetical may enter a dossier, history event, pointer, payload, or tool read.

### Consumer Trace

G043 is not applicable to Scope 2 because every existing first-party interface identity remains intact. The table records additive consumption of the state engine.

| Consumer | Scope 2 contract | Planned proof |
| --- | --- | --- |
| Scope 3 publication | Receives one immutable current snapshot and an optional comparison record | Integration tests perturb predecessor values and require unchanged current bytes |
| Scope 4 adapters | Supply offsets, nodes, edges, actors, policies, and conditions | Adapter outputs pass the same production validators |
| Scope 5 Simple and Power | Consume one view state with ordered paths and policy rows | Playwright compares visible graph, table, policy, and baseline identities |
| Feature 019 transaction | May persist canonical snapshots only | Hypothetical persistence attempts refuse before artifact creation |

### Shared Infrastructure Impact Sweep

The Feature 031 selftest sentinel is the only shared file in this scope. Dedicated tests run first. The complete selftest runs before Scope 3 starts. Rollback reverses only the Scope 2 additions inside that sentinel.

### Rollback And Recovery

- Composition failure returns an unavailable or refused result and creates no snapshot identity.
- A graph cycle refuses at its closing edge path. Tests remove only their owned mutation and verify restoration.
- Hypothetical reset discards the in-memory object and reprojects the exact baseline identity.
- Any failed cleanup or baseline mismatch keeps the scope open.

### Test Plan

| ID | Scenario | Type | Category | File and exact title | Exact command | Live system | Required result |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TP-02-01 | SCN-031-005 | unit | unit | Planned `tests/shock-transmission.composition.unit.mjs` — `Regression: SCN-031-005 net transmission subtracts every effective offset interval`; planning host `scripts/selftest.mjs` | `node --test --test-name-pattern='^Regression: SCN-031-005 net transmission subtracts every effective offset interval$' tests/shock-transmission.composition.unit.mjs` | No | Interval subtraction uses every effective offset and never copies gross loss. |
| TP-02-02 | SCN-031-006 | unit | unit | Planned `tests/shock-transmission.composition.unit.mjs` — `Regression: SCN-031-006 unavailable offsets widen or withhold without zero substitution`; planning host `scripts/selftest.mjs` | `node --test --test-name-pattern='^Regression: SCN-031-006 unavailable offsets widen or withhold without zero substitution$' tests/shock-transmission.composition.unit.mjs` | No | A sourced upper bound widens the range. No upper bound withholds it. Neither path inserts zero. |
| TP-02-03 | SCN-031-008 | unit | unit | Planned `tests/shock-transmission.composition.unit.mjs` — `Regression: SCN-031-008 opposing supported paths remain visible and unaveraged`; planning host `scripts/selftest.mjs` | `node --test --test-name-pattern='^Regression: SCN-031-008 opposing supported paths remain visible and unaveraged$' tests/shock-transmission.composition.unit.mjs` | No | Both ordered paths and the conflict survive projection. |
| TP-02-04 | SCN-031-009 | unit | unit | Planned `tests/shock-transmission.composition.unit.mjs` — `Regression: SCN-031-009 physical and financial paths require an evidenced joining edge`; planning host `scripts/selftest.mjs` | `node --test --test-name-pattern='^Regression: SCN-031-009 physical and financial paths require an evidenced joining edge$' tests/shock-transmission.composition.unit.mjs` | No | An absent joining edge cannot support a financial-break finding. |
| TP-02-05 | SCN-031-010 | unit | unit | Planned `tests/shock-transmission.composition.unit.mjs` — `Regression: SCN-031-010 policy actions retain five independent owners and layers`; planning host `scripts/selftest.mjs` | `node --test --test-name-pattern='^Regression: SCN-031-010 policy actions retain five independent owners and layers$' tests/shock-transmission.composition.unit.mjs` | No | Federal Reserve ownership cannot collapse into executive ownership. |
| TP-02-06 | SCN-031-011 | unit | unit | Planned `tests/shock-transmission.composition.unit.mjs` — `Regression: SCN-031-011 announcement evidence cannot promote implementation or effect`; planning host `scripts/selftest.mjs` | `node --test --test-name-pattern='^Regression: SCN-031-011 announcement evidence cannot promote implementation or effect$' tests/shock-transmission.composition.unit.mjs` | No | Announcement remains announced without implementation evidence. |
| TP-02-07 | SCN-031-012 | unit | unit | Planned `tests/shock-transmission.composition.unit.mjs` — `Regression: SCN-031-012 liquidity and inflation effects remain independent by layer`; planning host `scripts/selftest.mjs` | `node --test --test-name-pattern='^Regression: SCN-031-012 liquidity and inflation effects remain independent by layer$' tests/shock-transmission.composition.unit.mjs` | No | Conflicting effects remain separate and do not restore solvency or supply. |
| TP-02-08 | SCN-031-013 | unit | unit | Planned `tests/shock-transmission.composition.unit.mjs` — `Regression: SCN-031-013 restoration requires its named admitted observation`; planning host `scripts/selftest.mjs` | `node --test --test-name-pattern='^Regression: SCN-031-013 restoration requires its named admitted observation$' tests/shock-transmission.composition.unit.mjs` | No | Only an admitted observation can set one named condition to met. |
| TP-02-09 | SCN-031-005, SCN-031-006, SCN-031-008, SCN-031-009, SCN-031-010, SCN-031-011, SCN-031-012, SCN-031-013 | functional | functional | Planned `tests/shock-transmission.lifecycle.functional.mjs` — `Feature 031 composition lifecycle and authority mutation matrix`; planning host `scripts/selftest.mjs` | `node --test tests/shock-transmission.lifecycle.functional.mjs` | No | The matrix covers extension kinds, every Actor Reaction class, every Policy Action field, lifecycle transitions, conflicts, and predecessor isolation. It independently preserves `stale`, `missing`, `conflicted`, `unsupported`, and `invalidated` Finding states and rejects a directional substitute for each state. |
| TP-02-10 | SCN-031-005, SCN-031-006, SCN-031-008, SCN-031-009, SCN-031-010, SCN-031-011, SCN-031-012, SCN-031-013, SCN-031-024 | functional | functional | Planned `tests/shock-transmission.canary.functional.mjs` — `Feature 031 composition canary preserves the registered selftest inventory`; planning host `scripts/selftest.mjs` | `node --test --test-name-pattern='^Feature 031 composition canary preserves the registered selftest inventory$' tests/shock-transmission.canary.functional.mjs` | No | The canary executes production composition and lifecycle paths before the full selftest runs. |
| TP-02-11 | SCN-031-024 | ui-unit | ui-unit | Planned `tests/shock-transmission.reader.unit.mjs` — `Regression: SCN-031-024 hypothetical projection is nonpersistable and reset is exact`; planning host `tests/tool-experience.spec.mjs` | `node --test --test-name-pattern='^Regression: SCN-031-024 hypothetical projection is nonpersistable and reset is exact$' tests/shock-transmission.reader.unit.mjs` | No | `projectViewState()` labels the comparison, sets `persistable: false`, clears every local value, and reproduces the baseline digest. |
| TP-02-12 | SCN-031-024 | integration | integration | `tests/shock-transmission.hypothetical.integration.mjs` — `Regression: SCN-031-024 every canonical sink refuses local hypothetical state` | `node --test --test-name-pattern='^Regression: SCN-031-024 every canonical sink refuses local hypothetical state$' tests/shock-transmission.hypothetical.integration.mjs` | Yes | An owned ephemeral repository proves no dossier, history, pointer, payload, tool read, immutable file, URL, storage, or network sink changes. |

### Definition of Done — Tiered Validation

Planning does not execute delivery work. Every item remains unchecked until its owning phase records current evidence.

#### Core Items

- [ ] `DOD-02-C01` Net composition, DAGs, time-unfolded feedback, conflict preservation, actor authority, policy layers, restoration, and local hypothetical behavior match the design.
- [ ] `DOD-02-C02` Current computation has no predecessor input and local hypothetical state cannot enter any canonical path.
- [ ] `DOD-02-C03` Scope 2 changes only its allowed file families and leaves owner modules and consumer surfaces unchanged.

#### Test Evidence Items

- [ ] `DOD-02-TP-02-01` SCN-031-005 Gross disruption does not become net loss: TP-02-01 passes and every effective offset contributes to the interval result.
- [ ] `DOD-02-TP-02-02` SCN-031-006 An unavailable offset widens uncertainty: TP-02-02 passes with upper-bound widening and no-bound withholding.
- [ ] `DOD-02-TP-02-03` SCN-031-008 Conflicting edges remain visible: TP-02-03 passes and opposing paths remain visible.
- [ ] `DOD-02-TP-02-04` SCN-031-009 Physical and financial mechanisms stay separate: TP-02-04 passes and physical evidence alone cannot assert financial breakage.
- [ ] `DOD-02-TP-02-05` SCN-031-010 Independent policy actors remain independent: TP-02-05 passes across all five independent policy actors.
- [ ] `DOD-02-TP-02-06` SCN-031-011 An announcement is not implementation: TP-02-06 passes and announcement cannot promote implementation or effect.
- [ ] `DOD-02-TP-02-07` SCN-031-012 Policy layers may conflict: TP-02-07 passes and policy layers remain independent.
- [ ] `DOD-02-TP-02-08` SCN-031-013 Restoration requires its named condition: TP-02-08 passes and restoration requires its named observation.
- [ ] `DOD-02-TP-02-09` TP-02-09 passes its extension-kind, reaction-class, policy-field, lifecycle, conflict, predecessor-isolation, five non-current Finding-state, and directional-substitute mutations before GREEN.
- [ ] `DOD-02-TP-02-10` TP-02-10 passes before the full repository selftest and preserves its inventory.
- [ ] `DOD-02-TP-02-11` SCN-031-024 A local hypothetical leaves canonical research unchanged: TP-02-11 proves pure projection and exact reset.
- [ ] `DOD-02-TP-02-12` SCN-031-024 sink isolation: TP-02-12 proves every canonical sink remains unchanged in an owned ephemeral repository.

#### Build Quality Gate

- [ ] `DOD-02-BQ` Node, source-lock, artifact, scenario, mechanism, reference, prose, diff, no-skip, and change-boundary checks pass before Scope 3 starts.

## Scope 3: Dynamic Definitions And Immutable V1 V2 Publication

**Status:** Not Started

**Depends On:** Scope 1, Scope 2.

**Scope-Kind:** runtime-behavior

**Tags:** `overlay:true`, `migration:true`, `immutable-history:true`.

**Lockdown-FRs:** `FR-031-023`, `FR-031-024`, `FR-031-025`, `FR-031-026`, `FR-031-027`.

**Primary Outcome:** Research Agenda reads complete v1 and v2 tuples and writes one definition-selected version. It preserves cutoffs, predecessors, and immutable records.

### Gherkin Scenarios

```gherkin
Scenario: SCN-031-014 Topic definitions declare arbitrary horizons
Given two topics need different time horizons
When each adapter declares its horizon set
Then the foundation accepts both valid sets additively
And neither topic is forced into structural, swing, or tactical labels

Scenario: SCN-031-015 Scenario probabilities account for the whole curve
Given a topic publishes mutually exclusive scenarios for one horizon
When the scenario curve is validated
Then every scenario has a probability and provenance
And the probabilities sum to one within the declared tolerance

Scenario: SCN-031-016 Unsupported probability remains withheld
Given evidence does not support a scenario probability update
When the review is published
Then the prior curve remains unchanged or the current curve is unavailable
And no neutral or default probability is inserted

Scenario: SCN-031-017 A revised curve preserves its predecessor
Given a new observation changes one scenario curve
When the revision is published
Then a new version references the prior version
And both versions remain readable
And the change names the evidence that caused it
```

### Implementation Plan

1. Add exact v1 and v2 parent artifact contracts and request constituents in `rlagenda.js`. Preserve the existing v1 reader. Add no second version resolver. Scope 4 owns the sole `RLAGENDA.resolveAgendaConsumerState(request, dependencies)` export and every new publisher or browser dispatch call.
2. Add definition-owned units, horizons, levers, scenario sets, calibration policies, and adapter selection through `research-topic-definition/v2`. Implement `RLSHOCK.resolveDefinitionRegistries(definition)` as the single pure export that returns the selected definition's distinct frozen horizon and lever registries.
3. Add `research-situation/v2`, `research-review/v2`, and `research-dossier/v2` composition in the existing generation transaction.
4. Preserve the current pointer contract while requiring explicit artifact versions on each topic ref.
5. Enforce current evidence cutoff, available-time ordering, source vintage identity, and exclusion of later evidence.
6. Enforce v1/v2 dual-read and definition-selected single-write. Reject mixed or duplicate tuples before immutable creation.
7. Keep `composeSnapshot()` predecessor-free. Compare only after current validation through `compareSnapshots()`.
8. Add definition-owned calibration thresholds with immediately-below and at-threshold tests. Keep this scope's registry behavior horizon-only.
9. Create and publish the content-addressed geopolitical and food-input v2 definition files exactly once in this scope. Record each canonical digest before any registry movement. No later scope may recreate or edit those immutable bytes.
10. Gate geopolitical production selection on `LEGACY-031-001`. Conformance can proceed from source-backed owned inputs.

### Exact Source And Change Boundary

#### Allowed Product Files

- `rlagenda.js` only for exact v1 and v2 successor artifact contracts and request constituents. The sole new resolver export and its callers belong to Scope 4.
- `rlshock.js` only for `resolveDefinitionRegistries(definition)` and its closed frozen registry result.
- `scripts/research-agenda-generation.mjs` for v2 composition inside the existing transaction.
- `scripts/research-agenda-refresh.mjs` for definition-selected adapter and v2 input preparation.
- `research-agenda.json` only for a validated versioned definition reference after `LEGACY-031-001` closes. No other row may change.
- Planned new content-addressed files under `research/agenda/definitions/<topicId>/<digest>.json`.
- Planned new `tests/shock-transmission.migration.integration.mjs`.
- Planned new `tests/shock-transmission.definitions.unit.mjs`.
- Planned new `tests/shock-transmission.definitions.functional.mjs`.
- `tests/shock-transmission.reader.unit.mjs` for the pure selected-definition registry model.
- Existing `tests/brief-refresh-atomicity.test.mjs` through a bounded Feature 031 block.
- Existing Feature 031 selftest sentinel.

#### Excluded Surfaces

- Legacy definition files, current legacy review and dossier bytes, existing generations, and existing history.
- Feature 019 artifacts, the compact reader shape, and Feature 020 artifacts.
- Adapters, route HTML, registries, owner modules, and Horizon Ladder.
- The legacy writer remains available until all design retirement conditions hold. The legacy reader remains permanently readable.

### Consumer Impact Sweep

G043 is not applicable to Scope 3 because existing reader, route, path, horizon-token, and compact-consumer identities remain intact. The table records additive version compatibility.

| Consumer | Migration impact | Planned proof |
| --- | --- | --- |
| Publisher | Constructs one exact versioned transaction tuple from the chosen definition | Duplicate v1 and v2 writes refuse before canonical creation. Scope 4 binds that tuple to the sole parent resolver before activation |
| Current pointer | Keeps v1 contract and explicit artifact versions per topic | Mixed-version refs refuse and pointer movement stays last |
| Browser reader | Receives exact versioned artifacts without field-presence inference | Complete v1 and v2 fixtures validate through their version-owned contracts. Scope 4 owns the sole browser resolver call |
| Market Brief and Company Intelligence | Continue reading compact `research-agenda-read/v1` | Existing compact consumer tests remain green and unchanged |
| Feature 019 history | Receives additive review events only | Ephemeral repository test compares all pre-existing immutable bytes |
| Historical `structural`, `swing`, `tactical` values | Remain readable v1 values | New v2 horizons retain their own ids with no coercion |

The wide-refactor contract phase does not apply.

### Shared Infrastructure Impact Sweep

| Protected surface | Blast radius | Independent canary | Rollback or restore |
| --- | --- | --- | --- |
| `rlagenda.js` | Existing publisher, page, Simple adapter, selftest, and compact reads | Dedicated definitions and migration tests, then full selftest | Reverse only explicit v2 dispatch branches. Preserve v1 branches byte-for-byte |
| Generation transaction | Every Research Agenda publication and pointer update | Existing atomicity suite plus dedicated mixed-version matrix in an owned ephemeral repository | Restore the complete mutable baseline and remove only transaction-created immutable files |
| `research-agenda.json` | Topic cadence and definition selection | No edit while `LEGACY-031-001` is open. After closure, validate the exact one-row diff | Restore only the selected topic definition ref |

### Rollback And Recovery

- Any mixed version, digest mismatch, cutoff breach, or duplicate write refuses before immutable creation.
- Any failure after immutable creation restores mutable files and removes only transaction-created immutable records.
- Current pointer failure leaves the prior complete graph reachable.
- Rollback repoints to the prior complete graph and never converts or deletes v2 artifacts.
- Definition publication creates each geopolitical and food v2 digest once. An identical retry reuses the immutable bytes. Changed content requires a predecessor-linked successor.
- Existing v1 fixtures and immutable bytes are hash-checked before and after every migration test.

### Test Plan

| ID | Scenario | Type | Category | File and exact title | Exact command | Live system | Required result |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TP-03-01 | SCN-031-014 | unit | unit | Planned `tests/shock-transmission.definitions.unit.mjs` — `Regression: SCN-031-014 definitions retain independent ordered horizons`; planning host `scripts/selftest.mjs` | `node --test --test-name-pattern='^Regression: SCN-031-014 definitions retain independent ordered horizons$' tests/shock-transmission.definitions.unit.mjs` | No | Two unrelated definitions retain horizon ids, order, labels, durations, and intervals without legacy coercion. |
| TP-03-02 | SCN-031-015 | unit | unit | Planned `tests/shock-transmission.definitions.unit.mjs` — `Regression: SCN-031-015 mutually exclusive scenario curves sum within declared tolerance`; planning host `scripts/selftest.mjs` | `node --test --test-name-pattern='^Regression: SCN-031-015 mutually exclusive scenario curves sum within declared tolerance$' tests/shock-transmission.definitions.unit.mjs` | No | At-bound totals pass. Outside-tolerance curves refuse. With curve-level evidence unchanged, independent deletion of each scenario row's provenance, evidence refs, source refs, as-of time, or limitations refuses at the exact row path. |
| TP-03-03 | SCN-031-016 | unit | unit | Planned `tests/shock-transmission.definitions.unit.mjs` — `Regression: SCN-031-016 unsupported probabilities remain unavailable without a neutral curve`; planning host `scripts/selftest.mjs` | `node --test --test-name-pattern='^Regression: SCN-031-016 unsupported probabilities remain unavailable without a neutral curve$' tests/shock-transmission.definitions.unit.mjs` | No | Unsupported current curves have no rows. Prior curves remain history or unchanged current bytes. |
| TP-03-04 | SCN-031-017 | integration | integration | Planned `tests/shock-transmission.migration.integration.mjs` — `Regression: SCN-031-017 curve revision appends a predecessor-linked immutable version`; planning host `tests/brief-refresh-atomicity.test.mjs` | `node --test --test-name-pattern='^Regression: SCN-031-017 curve revision appends a predecessor-linked immutable version$' tests/shock-transmission.migration.integration.mjs` | Yes | An owned ephemeral publication creates one new version, retains the predecessor, and records changed evidence. |
| TP-03-05 | SCN-031-014, SCN-031-015, SCN-031-016, SCN-031-017 | integration | integration | `tests/shock-transmission.migration.integration.mjs` — `Feature 031 v1 v2 dual-read and version-bound single-write matrix` | `node --test tests/shock-transmission.migration.integration.mjs` | Yes | The existing v1 reader accepts a complete v1 tuple. Complete v2 artifacts form one resolver-ready tuple. Mixed tuples, duplicate writes, and bad predecessors refuse before mutation without introducing a second dispatch authority. |
| TP-03-06 | SCN-031-017 | integration | integration | `tests/shock-transmission.migration.integration.mjs` — `Regression: Feature 031 v2 publication preserves pointer-last rollback and immutable history` | `node --test --test-name-pattern='^Regression: Feature 031 v2 publication preserves pointer-last rollback and immutable history$' tests/shock-transmission.migration.integration.mjs` | Yes | Failure at each create or rename restores mutable state and preserves every existing immutable file. |
| TP-03-07 | SCN-031-014, SCN-031-015, SCN-031-016, SCN-031-017 | functional | functional | `tests/shock-transmission.definitions.functional.mjs` — `Feature 031 cutoff vintage interval and calibration boundary matrix` | `node --test tests/shock-transmission.definitions.functional.mjs` | No | Post-cutoff evidence is excluded. Vintages stay additive. Horizon intervals never overlap. Calibration tests immediately below and at each minimum. |
| TP-03-08 | SCN-031-014, SCN-031-015, SCN-031-016, SCN-031-017 | functional | functional | Planned `tests/shock-transmission.canary.functional.mjs` — `Feature 031 definition and migration canary preserves the registered selftest inventory`; planning host `scripts/selftest.mjs` | `node --test --test-name-pattern='^Feature 031 definition and migration canary preserves the registered selftest inventory$' tests/shock-transmission.canary.functional.mjs` | No | Dynamic horizon-definition and migration paths execute before the full repository selftest. |
| TP-03-09 | SCN-031-026 | ui-unit | ui-unit | Planned `tests/shock-transmission.reader.unit.mjs` — `Regression: SCN-031-026 selected definitions expose independent ordered lever models`; planning host `tests/tool-experience.spec.mjs` | `node --test --test-name-pattern='^Regression: SCN-031-026 selected definitions expose independent ordered lever models$' tests/shock-transmission.reader.unit.mjs` | No | `resolveDefinitionRegistries(definition)` returns distinct frozen horizon and lever registries with stable ids, order, labels, units, bounds, steps, baseline paths, target ids, and digests. It performs no topic switch and makes no clearing or route claim. |
| TP-03-10 | SCN-031-017 | integration | integration | `tests/shock-transmission.migration.integration.mjs` — `Regression: Feature 031 artifacts traverse the canonical byte owner boundary` | `node --test --test-name-pattern='^Regression: Feature 031 artifacts traverse the canonical byte owner boundary$' tests/shock-transmission.migration.integration.mjs` | Yes | Feature 031 families pass at 262143 and 262144 canonical UTF-8 bytes and refuse at 262145 before immutable creation. |
| TP-03-11 | SCN-031-017 | functional | functional | `tests/shock-transmission.definitions.functional.mjs` — `Regression: every revised Feature 031 primitive preserves valid predecessor lineage` | `node --test --test-name-pattern='^Regression: every revised Feature 031 primitive preserves valid predecessor lineage$' tests/shock-transmission.definitions.functional.mjs` | No | Shock, Edge, Path, Curve, Finding, Policy, and Restoration revisions reject missing, unresolved, or cyclic predecessors. |
| TP-03-12 | SCN-031-014, SCN-031-017 | integration | integration | Planned `tests/shock-transmission.migration.integration.mjs` — `Regression: Feature 031 publishes geopolitical and food v2 definitions exactly once before selection` | `node --test --test-name-pattern='^Regression: Feature 031 publishes geopolitical and food v2 definitions exactly once before selection$' tests/shock-transmission.migration.integration.mjs` | Yes | An owned repository publishes both content-addressed definition families before registry movement. Identical content reuses one digest. Changed content requires a predecessor-linked successor. Legacy bytes remain unchanged. |
| TP-03-13 | SCN-031-017 | e2e-ui | e2e-ui | Planned `tests/shock-transmission.e2e.spec.mjs` — `Regression: SCN-031-017 legacy route remains readable beside additive v2 publication`; planning host `tests/tool-experience.spec.mjs` | `npx --no-install playwright test tests/shock-transmission.e2e.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep='^Regression: SCN-031-017 legacy route remains readable beside additive v2 publication$' --reporter=list` | Yes | An owned ephemeral publication retains a complete v1 current tuple while writing additive v2 immutable bytes. The real Research Agenda route still reads the v1 tuple, while TP-03-04 and TP-03-12 prove the new v2 bytes and predecessor linkage. |

### Definition of Done — Tiered Validation

Planning does not execute delivery work. Every item remains unchecked until its owning phase records current evidence.

#### Core Items

- [ ] `DOD-03-C01` Definition-owned horizons, levers, units, scenario sets, calibration policies, adapter selection, and `resolveDefinitionRegistries(definition)` match the design.
- [ ] `DOD-03-C02` The existing v1 reader accepts complete v1 tuples. Complete v2 artifacts form the exact resolver-ready tuple. One selected version writes, and ambiguous mixed tuples fail before canonical mutation without a second dispatch authority.
- [ ] `DOD-03-C03` Cutoff, vintage, current and predecessor isolation, immutable history, pointer-last recovery, and sole ownership of geopolitical and food v2 definition publication are complete.
- [ ] `DOD-03-C04` `LEGACY-031-001` blocks geopolitical current selection while leaving v2 exact-path and conformance work independently testable.
- [ ] `DOD-03-C05` The consumer and shared-infrastructure sweeps preserve existing v1 readers, compact readers, Feature 019 history, and excluded files.

#### Test Evidence Items

- [ ] `DOD-03-TP-03-01` SCN-031-014 Topic definitions declare arbitrary horizons: TP-03-01 passes across two independent horizon registries.
- [ ] `DOD-03-TP-03-02` TP-03-02 passes the SCN-031-015 tolerance boundaries. It preserves curve evidence while each row-level provenance deletion returns an exact-path refusal.
- [ ] `DOD-03-TP-03-03` SCN-031-016 Unsupported probability remains withheld: TP-03-03 passes with no neutral probability insertion.
- [ ] `DOD-03-TP-03-04` SCN-031-017 A revised curve preserves its predecessor: TP-03-04 passes through an owned immutable publication round trip.
- [ ] `DOD-03-TP-03-05` TP-03-05 passes the full v1/v2 matrix and refuses duplicate or mixed writes.
- [ ] `DOD-03-TP-03-06` TP-03-06 passes every transaction failure injection and restoration assertion.
- [ ] `DOD-03-TP-03-07` TP-03-07 passes cutoff, vintage, interval, and calibration boundaries.
- [ ] `DOD-03-TP-03-08` TP-03-08 passes before the full repository selftest and preserves its inventory.
- [ ] `DOD-03-TP-03-09` SCN-031-026 lever-registry prerequisite: TP-03-09 proves the pure registry model without performing a topic switch or claiming clearing behavior.
- [ ] `DOD-03-TP-03-10` TP-03-10 proves 262143, 262144, and 262145 canonical artifact behavior through the owner boundary.
- [ ] `DOD-03-TP-03-11` TP-03-11 proves predecessor integrity for every revised primitive.
- [ ] `DOD-03-TP-03-12` TP-03-12 proves Scope 3 alone publishes both production v2 definition families before selection and preserves immutable predecessor rules.
- [ ] `DOD-03-TP-03-13` SCN-031-017 live compatibility: TP-03-13 proves the current v1 Research Agenda route remains readable beside additive v2 immutable publication.
- [ ] Scenario-specific E2E regression tests for every new/changed/fixed behavior pass. `DOD-03-C06` TP-03-13 supplies the live compatibility checkpoint. TP-03-04 through TP-03-12 supply the proportionate contract, persistence, and boundary proofs.
- [ ] Broader E2E regression suite passes. `DOD-03-C07` The canonical broad Research Agenda browser suite passes after TP-03-13 and before Scope 4 starts.

#### Build Quality Gate

- [ ] `DOD-03-BQ` All dedicated, atomicity, compact-reader, selftest, artifact, scenario, mechanism, reference, prose, diff, and immutable-byte checks pass before Scope 4 starts.

## Scope 4: Three Adapters And Lossless Production Consumption

**Status:** Not Started

**Depends On:** Scope 1, Scope 2, Scope 3.

**Scope-Kind:** runtime-behavior

**Tags:** `overlay:true`, `adapter-conformance:true`, `shared-consumer:true`.

**Lockdown-FRs:** `FR-031-028`, `FR-031-032`, `FR-031-033`, `FR-031-034`.

**Primary Outcome:** Three unrelated domains use one neutral adapter output. One parent resolver controls all branches and callers. Agenda Power consumes the lossless seam while compact consumers remain unchanged.

### Gherkin Scenarios

```gherkin
Scenario: SCN-031-018 A geopolitical supply shock uses the neutral contract
Given a chokepoint disruption affects several physical channels
When the geopolitical adapter uses the foundation
Then it maps routes, inventories, rerouting, insurance, demand response, and policy actions without adding country-specific foundation fields

Scenario: SCN-031-019 A food-input shock uses the same neutral contract
Given fertilizer or feedstock costs change near a planting boundary
When the food-input adapter uses the foundation
Then it maps input cost, substitution, acreage, inventory, weather, crop lag, and price effects through the same primitives

Scenario: SCN-031-020 A financial shock uses the same neutral contract
Given technology financing reprices after return disappointment or higher rates
When the financial adapter uses the foundation
Then it maps capex cuts, supplier cash flow, private credit, bank lines, funding, forced sales, and policy restoration without physical-flow assumptions

Scenario: SCN-031-021 Downstream projection preserves every causal qualifier
Given a validated finding carries a causal path, refuters, limitations, triggers, and invalidations
When a downstream consumer projects the finding
Then every member remains present and semantically unchanged
And the consumer refuses any projection that cannot preserve them

Scenario: SCN-031-026 Topic definitions declare independent lever registries
Given two topics require different adjustable inputs
And the reader has changed one lever for the selected topic
When the reader switches to the other topic
Then the prior topic's controls and session-only hypothetical state are cleared
And each registry retains stable lever identities, order, labels, units, bounds, and steps
And the existing Research Agenda route presents only the selected definition's levers
And neither topic inherits a fixed geopolitical lever list or changes an unrelated adapter
```

### Implementation Plan

1. Add `rlshockadapters.js` with one frozen registry and the exact shared adapter interface.
2. Load and verify the exact content-addressed geopolitical and food-input v2 definition bytes created by Scope 3. Refuse any digest mismatch. Do not recreate or edit either immutable definition family.
3. Add the distinct unregistered financial-intermediation conformance definition. It has no Scope 3 predecessor because Scope 3 creates no financial definition artifact.
4. Map owner reads and admitted observations without copying owner formulas.
5. Require foundation validation on every adapter output and reject unknown adapters before domain calculation.
6. Add `research-finding-reference-seam/v2` with byte-equivalent shared fields and complete qualifier arrays.
7. Implement `RLAGENDA.resolveAgendaConsumerState(request, dependencies)` as the only parent version resolver. Validate all thirteen request keys, five current-record keys, and two dependency keys before dispatch. Exercise all eight available and unavailable publish and read branches for v1 and v2.
8. Refuse mixed or unsupported versions, missing capability members, identity or reference mismatches, malformed or mismatched cutoffs, unknown adapters, adapter refusals, and qualifier loss. Also refuse an extra request key, an extra `currentRecord` key, and missing or extra dependency keys. Every refusal returns no partial `value`, `viewState`, or `findingSeam`.
9. Resolve the Feature 031 resource policy once per selected publisher resolution in `scripts/research-agenda-refresh.mjs`. Pass the same frozen object into one exact publish request in `scripts/research-agenda-generation.mjs`. Invoke the parent resolver once and refuse before canonical mutation on bypass, duplication, cutoff drift, or policy-identity drift.
10. Load `rlshock.js`, `rlshockadapters.js`, and the parent Agenda module in the designed order on the existing route. Resolve policy once for each selected baseline, local comparison, reset, or topic selection. Invoke the parent resolver once with the exact read tuple and the same frozen policy identity and generation-backed cutoff.
11. Switch only the existing Power finding-panel region from raw dossier findings to `projectFindingRows(seam)`. Pass only the resolver-returned v2 seam. Expose its contract version and digest as inert attributes. Keep `renderAll()` on the actual route path and refuse a lossy or absent seam without a raw-dossier fallback.
12. Use Scope 3's `resolveDefinitionRegistries(definition)` result in the existing topic-selector and local-compare regions. Clear prior controls and session-only hypothetical state before resolving and rendering the next topic. Do not change unrelated Simple, responsive, or accessibility presentation in this scope.
13. Add the two focused Playwright proofs in this scope. TP-04-13 owns route module loading, read-resolver use, Power seam rendering, and qualifier disclosure. TP-04-14 owns definition-selected controls, pre-render clearing, and adapter non-interference.
14. Preserve `research-agenda-read/v1` for Company Intelligence and Market Brief. Run the existing Market Brief compact-reader regression unchanged. Add no causal, dossier, seam, or graph field to either compact contract.
15. Keep the v2 resolver and seam active until rollback atomically restores a complete v1 pointer, generation, compact read, review, dossier, definition, and cutoff tuple. Refuse every mixed v2-pointer and raw-v1-read state.
16. Gate geopolitical current selection on `LEGACY-031-001`. Source-backed conformance does not claim a current geopolitical dossier.

### Exact Source And Change Boundary

#### Allowed Product Files

- Planned new `rlshockadapters.js`.
- Planned new `research/agenda/conformance/financial-intermediation.definition.json`.
- `rlshock.js` only for the lossless seam and adapter-output validation already defined by the foundation API.
- `rlagenda.js` only for the exact exported `resolveAgendaConsumerState(request, dependencies)` contract, frozen return pair, refusal propagation, and explicit v1/v2 dispatch.
- `scripts/research-agenda-refresh.mjs` only for once-per-selected-resolution policy resolution and exact frozen-policy handoff.
- `scripts/research-agenda-generation.mjs` only for the exact once-only publish-request call to the parent resolver before transaction admission.
- `research-agenda-lab.html` only for the Feature 031 module-loading block, exact read-resolver calls, existing Power finding-panel seam projection, and existing topic-selector and local-compare clearing regions required by TP-04-13 and TP-04-14.
- `rlexperience-adapters/research-agenda.js` only for consuming the resolver-returned `viewState` while preserving its unchanged compact output. It may not implement a second version branch.
- Planned new `tests/shock-transmission.adapters.unit.mjs`.
- Planned new `tests/shock-transmission.adapters.functional.mjs`.
- Planned new `tests/shock-transmission.consumers.integration.mjs`.
- Planned new `tests/shock-transmission.reader.unit.mjs` rows for selected-definition lever models.
- Planned new `tests/shock-transmission.e2e.spec.mjs` rows for the Agenda Power seam consumer and SCN-031-026 topic switching.
- Bounded Feature 031 blocks in `scripts/selftest.mjs` and `tests/company-intelligence.unit.mjs`.

The authored Market Brief regression in `tests/market-brief-scorecard.spec.mjs` is a read-only proof input. Scope 4 must not edit its title or body.

Scope 4 owns the exact Feature 031 route regions named above and the TP-04-13 and TP-04-14 test titles. It does not own the broader Simple and Power layout, responsive behavior, accessibility behavior, or full-suite regression that begins in Scope 5.

#### Excluded Surfaces

- Owner calculation modules and Company Intelligence production code.
- Market Action Center, Causal Rotation, Trend Dynamics, and Bond Regime.
- Feature 020 artifacts, registry files, navigation files, and Horizon Ladder.
- Existing compact-read fields and legacy immutable records.
- Scope 3-owned immutable files under `research/agenda/definitions/geopolitical-supply-shock/**` and `research/agenda/definitions/food-inputs-outlook/**`. Scope 4 reads and digest-verifies these files but cannot recreate or edit them.
- `market-brief.html`, `rlbrief.js`, `scripts/validate-brief-payload.mjs`, and `tests/market-brief-scorecard.spec.mjs`. Scope 4 runs their existing compact-consumer proof without widening or editing the contract.
- The financial adapter remains unregistered. No topic row or route may be added for it.

### Consumer Impact Sweep

G043 is not applicable to Scope 4 because every existing first-party interface identity remains intact. The table records additive resolver, adapter, and seam consumers.

| Consumer | Required result | Planned proof |
| --- | --- | --- |
| Agenda Power finding panel | Reads v2 seam and exposes all qualifiers | Integration plus Playwright consumer-surface assertion |
| Agenda Simple view | Continues to use the same shared view state | Scope 5 Simple and Power parity test |
| Scheduled publisher | Resolves policy once per selected resolution. It calls the sole parent resolver once with the exact publish tuple before mutation | TP-04-19 executes the production caller and fails on bypass, duplicate calls, policy drift, cutoff drift, or pre-refusal mutation |
| Existing Agenda route | Resolves policy once per selected read transition. It calls the parent once for baseline, local comparison, reset, and topic selection | TP-04-20 proves exact caller dataflow without a visible claim. TP-04-13 proves the visible Power result |
| Topic selector and local compare | Use `resolveDefinitionRegistries(definition)` and clear prior controls and local hypothetical state before the next render | TP-04-14 proves selected-definition controls and pre-render clearing on the live route |
| Company Intelligence | Continues consuming compact `research-agenda-read/v1` only | Existing unit test plus no full-finding claim assertion |
| Market Brief | Continues rendering the exact compact Agenda topic shape and excludes dossier, causal, seam, graph, and Feature 020 routing fields | TP-04-21 runs the existing authored production-route regression unchanged |
| Scope 3 definition publisher | Owns creation of geopolitical and food v2 definition bytes | TP-03-12 publishes each digest once. TP-04-22 proves Scope 4 consumes the exact bytes without a write path |
| Rollback reader | Keeps v2 resolution active until a complete prior v1 tuple becomes current | TP-04-23 injects a mixed v2-pointer and raw-v1-read state and requires refusal with the last complete tuple preserved |
| Feature 020 | Receives no destination wiring from Feature 031 | Source scan and unchanged planning-artifact boundary |
| Owner modules | Retain sole authority for their calculations | Import and token audit plus output perturbation through owner reads |
| Three adapters | Produce one closed neutral output shape | Shared conformance validator over all three outputs |

### Shared Infrastructure Impact Sweep

`rlagenda.js`, the Research Agenda page, both publisher scripts, the Simple adapter, and `scripts/selftest.mjs` are high-fan-out surfaces. Dedicated resolver and caller tests run first. Existing Agenda, Company Intelligence, and Market Brief canaries then run. The complete selftest runs before Scope 5. Rollback reverses only exact Feature 031 dispatch, seam, caller, and sentinel blocks.

### Rollback And Recovery

- An adapter refusal produces no snapshot and no partial graph.
- A lossy seam refuses at the first missing or changed qualifier path.
- Rollback keeps the v2 resolver and seam active while any v2 current pointer remains selected. A rollback to the raw v1 finding path must atomically restore the prior complete v1 pointer, generation artifact, compact read, review, dossier, definition tuple, and generation-backed cutoff before the v1 reader is enabled. Any mixed v2 pointer with a raw v1 read refuses and leaves the last complete tuple active.
- Scope 4 never deletes, recreates, or edits the Scope 3 geopolitical and food definition bytes. A digest mismatch refuses adapter selection.
- Geopolitical source-backed conformance remains distinct from current production publication.
- Existing v1 compact consumers and legacy records stay readable throughout rollback.

### Test Plan

| ID | Scenario | Type | Category | File and exact title | Exact command | Live system | Required result |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TP-04-01 | SCN-031-018 | unit | unit | Planned `tests/shock-transmission.adapters.unit.mjs` — `Regression: SCN-031-018 geopolitical supply maps only neutral foundation primitives`; planning host `scripts/selftest.mjs` | `node --test --test-name-pattern='^Regression: SCN-031-018 geopolitical supply maps only neutral foundation primitives$' tests/shock-transmission.adapters.unit.mjs` | No | Physical routes, inventory, insurance, demand, and policy map without country-specific foundation fields. |
| TP-04-02 | SCN-031-019 | unit | unit | Planned `tests/shock-transmission.adapters.unit.mjs` — `Regression: SCN-031-019 food inputs use neutral primitives without route assumptions`; planning host `scripts/selftest.mjs` | `node --test --test-name-pattern='^Regression: SCN-031-019 food inputs use neutral primitives without route assumptions$' tests/shock-transmission.adapters.unit.mjs` | No | Food inputs map substitution, acreage, inventory, weather, crop lag, and prices without route requirements. |
| TP-04-03 | SCN-031-020 | unit | unit | Planned `tests/shock-transmission.adapters.unit.mjs` — `Regression: SCN-031-020 financial intermediation uses neutral primitives without physical assumptions`; planning host `scripts/selftest.mjs` | `node --test --test-name-pattern='^Regression: SCN-031-020 financial intermediation uses neutral primitives without physical assumptions$' tests/shock-transmission.adapters.unit.mjs` | No | The financial adapter admits all seven definition-owned state dimensions without physical-flow fields or copied owner formulas. |
| TP-04-04 | SCN-031-021 | unit | unit | Planned `tests/shock-transmission.adapters.unit.mjs` — `Regression: SCN-031-021 finding projection preserves every causal qualifier byte for byte`; planning host `scripts/selftest.mjs` | `node --test --test-name-pattern='^Regression: SCN-031-021 finding projection preserves every causal qualifier byte for byte$' tests/shock-transmission.adapters.unit.mjs` | No | Shared fields and all qualifier arrays are byte-equivalent. An omitted qualifier refuses at its exact path. |
| TP-04-05 | SCN-031-018, SCN-031-019, SCN-031-020 | functional | functional | `tests/shock-transmission.adapters.functional.mjs` — `Feature 031 three unrelated adapter conformance matrix` | `node --test tests/shock-transmission.adapters.functional.mjs` | No | One structural validator accepts all three outputs and rejects topic-specific foundation fields. |
| TP-04-06 | SCN-031-021 | integration | integration | Planned `tests/shock-transmission.consumers.integration.mjs` — `Regression: SCN-031-021 parent resolver admits every available and unavailable v1 and v2 branch` | `node --test --test-name-pattern='^Regression: SCN-031-021 parent resolver admits every available and unavailable v1 and v2 branch$' tests/shock-transmission.consumers.integration.mjs` | Yes | Direct calls to the real export cover available and unavailable v1 and v2 publish and read. Every request has exactly thirteen keys, every `currentRecord` has five keys, and dependencies have exactly `shock` and `adapterRegistry`. Available branches return the matching frozen seam. Unavailable branches return an unavailable view and null seam. |
| TP-04-07 | SCN-031-018, SCN-031-019, SCN-031-020, SCN-031-021, SCN-031-026 | functional | functional | Planned `tests/shock-transmission.adapters.functional.mjs` — `Feature 031 owner authority adapter isolation and topic scaling matrix`; planning host `scripts/selftest.mjs` | `node --test --test-name-pattern='^Feature 031 owner authority adapter isolation and topic scaling matrix$' tests/shock-transmission.adapters.functional.mjs` | No | Owner formulas remain external. Registry-order and topic-count permutations preserve unrelated adapter fingerprints and non-current Finding states. |
| TP-04-08 | SCN-031-021 | unit | unit | `tests/company-intelligence.unit.mjs` — `Regression: Feature 031 keeps the compact Agenda read compatible and non-causal` | `node --test --test-name-pattern='^Regression: Feature 031 keeps the compact Agenda read compatible and non-causal$' tests/company-intelligence.unit.mjs` | No | Company Intelligence reads the unchanged compact shape and makes no full-finding claim. |
| TP-04-09 | SCN-031-018, SCN-031-019, SCN-031-020, SCN-031-021, SCN-031-026 | functional | functional | `tests/shock-transmission.canary.functional.mjs` — `Feature 031 adapter and seam canary preserves the registered selftest inventory` | `node --test --test-name-pattern='^Feature 031 adapter and seam canary preserves the registered selftest inventory$' tests/shock-transmission.canary.functional.mjs` | No | Adapter, seam, compact-reader, and unrelated production canaries execute before the full selftest. |
| TP-04-10 | SCN-031-018, SCN-031-019, SCN-031-020 | functional | functional | `tests/shock-transmission.adapters.functional.mjs` — `Regression: Feature 031 adapters accept only acquisition-owner-admitted bundles` | `node --test --test-name-pattern='^Regression: Feature 031 adapters accept only acquisition-owner-admitted bundles$' tests/shock-transmission.adapters.functional.mjs` | No | The owner accepts 524288 bytes and rejects 524289 before adapter invocation. Admitted bundle identity reaches each adapter unchanged. |
| TP-04-11 | SCN-031-018, SCN-031-019, SCN-031-020 | integration | integration | `tests/shock-transmission.consumers.integration.mjs` — `Regression: Feature 031 adapters remain timer-free behind the author owner` | `node --test --test-name-pattern='^Regression: Feature 031 adapters remain timer-free behind the author owner$' tests/shock-transmission.consumers.integration.mjs` | Yes | The author owner passes 900000 milliseconds and returns `author-timeout`; no adapter adds a timer or runs after owner timeout. |
| TP-04-12 | SCN-031-018, SCN-031-019, SCN-031-020 | functional | functional | `tests/shock-transmission.adapters.functional.mjs` — `Regression: Feature 031 foundation and adapters compose offline without runtime capabilities` | `node --test --test-name-pattern='^Regression: Feature 031 foundation and adapters compose offline without runtime capabilities$' tests/shock-transmission.adapters.functional.mjs` | No | Production composition succeeds with network, storage, key, account, server, and clock globals absent. Any hidden dependency fails. |
| TP-04-13 | SCN-031-021 | e2e-ui | e2e-ui | Planned `tests/shock-transmission.e2e.spec.mjs` — `Regression: SCN-031-021 Power exposes every qualifier through the production route`; planning host `tests/tool-experience.spec.mjs` | `npx --no-install playwright test tests/shock-transmission.e2e.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep='^Regression: SCN-031-021 Power exposes every qualifier through the production route$' --reporter=list` | Yes | The Scope 4 route loads the Feature 031 modules, calls the exact read resolver, passes only its returned seam to `projectFindingRows(seam)`, and exposes the seam digest plus every qualifier in visible content and the accessibility tree. Deleting the route resolver call or restoring raw-dossier finding reads fails this proof. |
| TP-04-14 | SCN-031-026 | e2e-ui | e2e-ui | Planned `tests/shock-transmission.e2e.spec.mjs` — `Regression: SCN-031-026 topic switching renders only the selected lever registry`; planning host `tests/tool-experience.spec.mjs` | `npx --no-install playwright test tests/shock-transmission.e2e.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep='^Regression: SCN-031-026 topic switching renders only the selected lever registry$' --reporter=list` | Yes | The Scope 4 route calls `resolveDefinitionRegistries(definition)`, clears prior controls and hypothetical state before the next read-resolver call, and renders only the selected definition's ordered controls. Removing pre-render clearing or substituting the prior registry fails this proof. |
| TP-04-15 | SCN-031-021 | integration | integration | Planned `tests/shock-transmission.consumers.integration.mjs` — `Regression: SCN-031-021 mixed unsupported and mismatched parent tuples refuse without a pair` | `node --test --test-name-pattern='^Regression: SCN-031-021 mixed unsupported and mismatched parent tuples refuse without a pair$' tests/shock-transmission.consumers.integration.mjs` | Yes | Mixed or unsupported parent versions, missing v2 capability members, and every topic, review, dossier, pointer, generation, read, candidate, or snapshot identity mismatch return the first exact refusal. Separate mutations add one request key, add one `currentRecord` key, remove each dependency key, and add one dependency key. Every mutation returns no `value`, `viewState`, or `findingSeam`. |
| TP-04-16 | SCN-031-021 | integration | integration | Planned `tests/shock-transmission.consumers.integration.mjs` — `Regression: SCN-031-021 cutoff validation refuses the first malformed or mismatched identity` | `node --test --test-name-pattern='^Regression: SCN-031-021 cutoff validation refuses the first malformed or mismatched identity$' tests/shock-transmission.consumers.integration.mjs` | Yes | Missing, malformed, offset, invalid-date, and equivalent-but-nonidentical cutoffs refuse. Every publish and read equality path is perturbed separately in canonical order. `validateObservationSet()` receives the exact request cutoff once. Every refusal returns no pair. |
| TP-04-17 | SCN-031-018, SCN-031-019, SCN-031-020, SCN-031-021 | integration | integration | Planned `tests/shock-transmission.consumers.integration.mjs` — `Regression: SCN-031-021 unknown and refusing adapters return no partial consumer pair` | `node --test --test-name-pattern='^Regression: SCN-031-021 unknown and refusing adapters return no partial consumer pair$' tests/shock-transmission.consumers.integration.mjs` | Yes | Unknown adapter ids and explicit refusals from each selected adapter stop before snapshot composition. The resolver propagates one exact error and returns no `value`, `viewState`, or `findingSeam`. |
| TP-04-18 | SCN-031-021 | integration | integration | Planned `tests/shock-transmission.consumers.integration.mjs` — `Regression: SCN-031-021 qualifier loss returns one exact refusal and no partial pair` | `node --test --test-name-pattern='^Regression: SCN-031-021 qualifier loss returns one exact refusal and no partial pair$' tests/shock-transmission.consumers.integration.mjs` | Yes | Omitting each causal path, refuter, limitation, trigger, or invalidation independently returns `RLSHOCK-PROJECTION-LOSSY` at its exact path. No raw dossier, v1 seam, history row, compact read, or predecessor becomes a fallback. |
| TP-04-19 | SCN-031-017, SCN-031-021 | integration | integration | Planned `tests/shock-transmission.consumers.integration.mjs` — `Regression: Feature 031 scheduled publisher resolves policy and parent once before mutation` | `node --test --test-name-pattern='^Regression: Feature 031 scheduled publisher resolves policy and parent once before mutation$' tests/shock-transmission.consumers.integration.mjs` | Yes | The production scheduled path resolves policy once per selected resolution. It invokes the sole parent resolver once with the exact publish tuple, same frozen policy object, and candidate `generationCutoff`. Bypass, duplicate invocation, policy drift, or cutoff drift refuses before any mutable or immutable write. |
| TP-04-20 | SCN-031-021, SCN-031-024, SCN-031-026 | integration | integration | Planned `tests/shock-transmission.consumers.integration.mjs` — `Regression: Feature 031 browser resolves policy and parent once for every read transition` | `node --test --test-name-pattern='^Regression: Feature 031 browser resolves policy and parent once for every read transition$' tests/shock-transmission.consumers.integration.mjs` | Yes | The production browser caller resolves policy once and invokes the parent once for baseline, same-topic comparison, reset, and topic selection. Every exact read tuple carries one generation-backed cutoff and the same frozen policy identity. Direct version dispatch, bypass, or duplicate calls fail. This row makes no visibility or accessibility claim. |
| TP-04-21 | SCN-031-021 | e2e-ui | e2e-ui | Authored `tests/market-brief-scorecard.spec.mjs` — `Regression: compact agenda read renders exact mode and change assessment while dossier-only fields remain out of the brief` | `npx --no-install playwright test tests/market-brief-scorecard.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep='^Regression: compact agenda read renders exact mode and change assessment while dossier-only fields remain out of the brief$' --reporter=list` | Yes | The real Market Brief route renders the exact unchanged `research-agenda-read/v1` topic keys. Dossier, causal, seam, graph, and Feature 020 routing fields remain absent. The owner deep link remains the existing Research Agenda Power route. |
| TP-04-22 | SCN-031-018, SCN-031-019 | functional | functional | Planned `tests/shock-transmission.adapters.functional.mjs` — `Regression: Scope 4 consumes Scope 3 geopolitical and food definition bytes without recreation` | `node --test --test-name-pattern='^Regression: Scope 4 consumes Scope 3 geopolitical and food definition bytes without recreation$' tests/shock-transmission.adapters.functional.mjs` | No | Both adapters load the exact Scope 3 content-addressed bytes and verify their digests. A substituted digest refuses. Scope 4 exposes no write, recreate, or in-place edit path for either production definition family. |
| TP-04-23 | SCN-031-017, SCN-031-021 | integration | integration | Planned `tests/shock-transmission.consumers.integration.mjs` — `Regression: Feature 031 rollback never pairs a v2 pointer with a raw v1 read` | `node --test --test-name-pattern='^Regression: Feature 031 rollback never pairs a v2 pointer with a raw v1 read$' tests/shock-transmission.consumers.integration.mjs` | Yes | Rollback retains v2 resolution until the prior complete v1 pointer, generation, compact read, review, dossier, definition, and cutoff tuple is atomically restored. A mixed v2 pointer and raw v1 read refuses and preserves the last complete tuple. |

### Definition of Done — Tiered Validation

Planning does not execute delivery work. Every item remains unchecked until its owning phase records current evidence.

#### Core Items

- [ ] `DOD-04-C01` All three adapters implement one frozen interface and pass one closed production validator.
- [ ] `DOD-04-C02` The financial definition remains unregistered and no adapter duplicates owner calculations.
- [ ] `DOD-04-C03` The resolver covers all eight valid branches and every planned refusal class. It accepts only the exact thirteen-key request, five-key current record, and two-key dependencies. No refusal returns a partial pair.
- [ ] `DOD-04-C04` `LEGACY-031-001` still blocks geopolitical current selection unless its owner supplies verified repair evidence.
- [ ] `DOD-04-C05` Publisher and browser resolve one policy and invoke one parent resolver per selected resolution. Company Intelligence and Market Brief retain the compact v1 read. Scope 4 consumes Scope 3 definition bytes without editing them.
- [ ] `DOD-04-C06` NFR-031-002, NFR-031-005, NFR-031-007, and NFR-031-010 pass their owner-bound offline, non-interference, numeric-budget, and scaling proofs by Scope 4 completion.
- [ ] `DOD-04-C07` Rollback retains v2 resolution until one prior complete v1 tuple is atomically current. Every mixed v2-pointer and raw-v1-read state refuses without changing the last complete tuple.

#### Test Evidence Items

- [ ] `DOD-04-TP-04-01` SCN-031-018 A geopolitical supply shock uses the neutral contract: TP-04-01 passes against source-backed geopolitical inputs.
- [ ] `DOD-04-TP-04-02` SCN-031-019 A food-input shock uses the same neutral contract: TP-04-02 passes without geopolitical route assumptions.
- [ ] `DOD-04-TP-04-03` SCN-031-020 A financial shock uses the same neutral contract: TP-04-03 passes without physical-flow assumptions.
- [ ] `DOD-04-TP-04-04` SCN-031-021 Downstream projection preserves every causal qualifier: TP-04-04 passes and every qualifier-loss mutation fails at an exact path.
- [ ] `DOD-04-TP-04-05` TP-04-05 passes the three-adapter conformance matrix.
- [ ] `DOD-04-TP-04-06` TP-04-06 directly exercises all eight available and unavailable v1 and v2 publish and read branches with exact request, current-record, and dependency shapes.
- [ ] `DOD-04-TP-04-07` TP-04-07 passes with zero duplicate owner-math findings.
- [ ] `DOD-04-TP-04-08` TP-04-08 passes with the compact read unchanged and non-causal.
- [ ] `DOD-04-TP-04-09` TP-04-09 passes before the full repository selftest and preserves its inventory.
- [ ] `DOD-04-TP-04-10` TP-04-10 proves 524288-byte owner admission and 524289-byte refusal without duplicate enforcement.
- [ ] `DOD-04-TP-04-11` TP-04-11 proves the 900-second author boundary and absence of adapter timer authority.
- [ ] `DOD-04-TP-04-12` TP-04-12 proves foundation and adapter composition needs no runtime network, credential, account, server, storage, or clock.
- [ ] `DOD-04-TP-04-13` SCN-031-021 live consumer proof: TP-04-13 passes with module loading, exact read-resolver use, seam-only Power projection, and every visible and accessible qualifier before Scope 4 can complete.
- [ ] `DOD-04-TP-04-14` SCN-031-026 live topic-switch proof: TP-04-14 passes with definition-owned registries, pre-render clearing, exact resolver reuse, and unrelated-adapter preservation before Scope 4 can complete.
- [ ] `DOD-04-TP-04-15` TP-04-15 refuses mixed, unsupported, missing-capability, identity, reference, request-over-shape, current-record-over-shape, dependency-missing, and dependency-over-shape tuples at the first exact path with no partial pair.
- [ ] `DOD-04-TP-04-16` TP-04-16 proves canonical cutoff validation, every ordered publish and read equality check, exact observation cutoff pass-through, and no partial pair.
- [ ] `DOD-04-TP-04-17` TP-04-17 proves unknown and refusing adapters stop before composition and return no partial pair.
- [ ] `DOD-04-TP-04-18` TP-04-18 deletes every causal qualifier independently and proves exact lossy-projection refusal without fallback.
- [ ] `DOD-04-TP-04-19` TP-04-19 proves the scheduled publisher resolves policy and invokes the parent once per selected resolution before mutation.
- [ ] `DOD-04-TP-04-20` TP-04-20 proves the browser resolves policy and invokes the parent once for baseline, comparison, reset, and topic selection without a visibility claim.
- [ ] `DOD-04-TP-04-21` TP-04-21 passes unchanged through the real Market Brief route and preserves the exact compact non-causal read.
- [ ] `DOD-04-TP-04-22` TP-04-22 proves both adapters consume Scope 3 definition bytes and expose no recreation or edit path.
- [ ] `DOD-04-TP-04-23` TP-04-23 proves rollback never pairs a v2 current pointer with the raw v1 reader.
- [ ] Scenario-specific E2E regression tests for every new/changed/fixed behavior pass. `DOD-04-C08` TP-04-13 and TP-04-14 prove the Scope 4 live seam and topic-switch behaviors. The remaining rows provide proportionate non-UI proof.
- [ ] Broader E2E regression suite passes. `DOD-04-C09` The canonical broad Research Agenda browser suite passes after the focused Scope 4 titles and before Scope 5 starts.

#### Build Quality Gate

- [ ] `DOD-04-BQ` Dedicated adapter, consumer, compact-reader, selftest, artifact, scenario, mechanism, consumer-trace, reference, prose, diff, and protected-byte checks pass before Scope 5 starts.

## Scope 5: Existing Research Agenda Experience And Boundary Closure

**Status:** Not Started

**Depends On:** Scope 1, Scope 2, Scope 3, Scope 4.

**Scope-Kind:** runtime-behavior

**Tags:** `overlay:true`, `e2e-ui:true`, `product-boundary:true`.

**Lockdown-FRs:** `FR-031-035`, `FR-031-036`, `FR-031-037`.

**Primary Outcome:** The existing Simple and Power projections expose the foundation honestly. Protected history, adjacent products, owner tools, and unadmitted surfaces remain unchanged.

### Gherkin Scenarios

```gherkin
Scenario: SCN-031-022 Adjacent products and unadmitted surfaces stay separate
Given Horizon Ladder is a registered six-horizon long and short tool with unearned measured-rate cells
And the Shock Transmission Lab admission conditions are not all proven
When Feature 031 is delivered through the existing Research Agenda route
Then Horizon Ladder remains unchanged
And its zero resolved counts remain intentional withholding
And no Shock Transmission Lab route, registry row, wireframe, or Lab exposure is created

Scenario: SCN-031-023 Legacy unavailability does not invent a field path
Given a current legacy Feature 019-backed Research Agenda review is unavailable with a named reason and publishes no field path
When a reader opens the affected topic on the existing Research Agenda route
Then the route presents the named current reason
And it states that no field path was published instead of inventing one
And dated history remains separate from current unavailability
And the legacy record neither satisfies nor weakens the shock-transmission v2 exact-path contract

Scenario: SCN-031-025 The existing route remains accessible and responsive
Given one current transmission is available in Simple, Power, graph, and semantic-table projections
When a reader uses keyboard or touch at 320 CSS pixels, 200 percent text zoom, or reduced motion
Then every control remains operable and every touch target remains at least 44 CSS pixels
And content reflows without lost meaning, clipping, or body-level horizontal scrolling
And the graph and semantic table expose the same ordered path and qualifier set
And every state and quantitative meaning remains visible in text and available to assistive technology
And state changes remain understandable without animation
```

### UI Scenario Matrix

| Journey or state | Preconditions | Steps | User-visible assertions | Exact coverage |
| --- | --- | --- | --- | --- |
| Current baseline first paint | Valid v2 topic tuple | Open existing Research Agenda route | Current banner precedes controls and shows as-of, provenance, definition, and horizon | TP-05-01 |
| Legacy unavailable first paint | Current geopolitical legacy review remains unavailable | Open that topic | Named reason appears. The UI says the current review published no field path. Dated history remains separate | TP-05-02 |
| Exact v2 refusal | V2 record has one missing nested field | Open owned test route state | Plain reason and exact machine path appear. No substitute number renders | TP-05-03 |
| Claim-class visibility | One observed claim and one inferred claim share a path | Open the path in Simple and Power | Both labels and grades render. The inferred limitation and refuter remain visible and accessible | TP-05-22 |
| Bounded-edge visibility | One supported Edge has a complete ordered interval | Open the Edge in Power | Sign, unit, interval, lag, persistence, evidence, limitation, and refuter render without collapse | TP-05-23 |
| Gross, offsets, and conflict | Valid current snapshot has opposing paths | Open Simple, then Power | Gross, offsets, net, both paths, and no merged answer remain visible | TP-05-04 |
| Actor authority | Five independent actors exist | Inspect actor rows | Every action retains its declared owner and Federal Reserve authority stays independent | TP-05-05 |
| Announcement boundary | Announcement evidence exists without implementation evidence | Inspect the action row | Announced remains distinct from Implemented and Effective | TP-05-06 |
| Policy-layer conflict | Liquidity and inflation effects disagree | Inspect policy rows | Effects stay separate and no unrelated layer becomes restored | TP-05-07 |
| Restoration boundary | An action is effective while its named condition remains unmet | Inspect restoration detail | The layer remains unrestored until admitted evidence meets its condition | TP-05-08 |
| Dynamic horizons | Two topics declare different horizon registries | Open each topic in an independent fresh route context and operate its horizon control | Horizon ids, labels, order, durations, and intervals come from that context's definition | TP-05-09 |
| Dynamic levers | Scope 4 has completed two definition-owned lever registries | Recheck the completed topic-switch flow in the broad Feature 031 browser suite | Lever ids, labels, order, units, bounds, steps, and values remain definition-owned | TP-04-14 and TP-05-18 |
| Probability and calibration | Curves exist below and at policy minimum | Inspect scenario rows | Evidence confidence, model probability, and realized rate remain distinct. Withholding shows `n of m` | TP-05-10 |
| Local hypothetical and reset | Valid canonical baseline exists | Change levers, inspect counters, reset | User-hypothetical label appears. Requests and canonical writes stay unchanged. Reset restores exact baseline identity | TP-05-11 |
| Graph and semantic table | Valid graph and paths exist | Select nodes, edges, and table rows | Graph and table represent the same ordered path and qualifier set | TP-05-12 |
| Responsive and accessible use | Existing route at required viewports | Operate tabs, controls, graph, disclosures, and links | Keyboard, touch, reduced motion, 320px, 200 percent zoom, live announcements, and text-node rendering pass | TP-05-13 |
| Lossless finding inspection | Scope 4 has completed a valid live v2 seam consumer | Recheck the finding disclosure in the complete Feature 031 browser suite | Path, refuters, limitations, triggers, invalidations, sources, and owner link remain present | TP-04-13 and TP-05-18 |
| Product boundary | Current registry and Horizon Ladder files | Inspect discovery and both routes | No new Lab or Iran-only route exists. Horizon Ladder semantics and bytes remain unchanged | TP-05-15 through TP-05-18 |
| Authentication and redirect | Public static route | Open the Research Agenda route | No login, account, role, credential, or redirect branch appears | TP-05-16 and broad E2E |

### Implementation Plan

1. Start from Scope 4's completed module-loading, parent-resolver, Power seam, and topic-switch regions. Do not reopen or duplicate those regions.
2. Derive the broader Simple, Power, graph, semantic table, scenario table, policy rows, calibration rows, and owner links from the resolver-returned view state. Use `projectClaimRows(viewState)` and `projectEdgeRows(viewState)` for their exact semantic rows. Reuse the Scope 4 finding rows without another seam or raw-dossier path.
3. Derive horizon controls from the selected definition. Retain the Scope 4 `resolveDefinitionRegistries(definition)` lever-registry and topic-switch behavior without reopening its implementation boundary. Keep projection changes, horizon changes, and local lever changes free of acquisition and canonical writes.
   Scope 5 adds no focused seam-consumption or topic-switch replay. TP-05-18 is the broad regression over the focused TP-04-13 and TP-04-14 proofs.
4. Render every availability state with a word, glyph, explanation, source, as-of time, provenance, unit, and limitation where applicable.
5. Preserve current and dated-history bands. Never promote predecessor content into current truth.
6. Implement local hypothetical comparison in memory only and reset to the exact published baseline.
7. Implement the declared keyboard, focus, touch, reduced-motion, semantic-table, text-node, narrow-width, and zoom contracts.
8. Add dedicated Playwright coverage through the existing shared runtime and one owned ephemeral HTTP server.
9. Prove no new route, registry row, navigation entry, site exclusion, Iran-only surface, or Horizon Ladder change.
10. Build `_site/` and verify the existing route and new modules package without registering another tool.

### Exact Source And Change Boundary

#### Allowed Product Files

- `research-agenda-lab.html` only within the broader Feature 031 Simple, Power layout, state presentation, graph-table interaction, owner-link, responsive, and accessibility regions. The Scope 4 module loader, parent-resolver calls, Power finding seam, and topic-switch clearing regions are excluded.
- Planned new `tests/shock-transmission.e2e.spec.mjs` using the existing Playwright runtime. Scope 5 owns only TP-05 test titles. TP-04-13 and TP-04-14 remain frozen Scope 4 titles and run here only through the broad TP-05-18 regression.
- Planned new `tests/shock-transmission.boundary.functional.mjs`.
- Existing `tests/tool-discovery.spec.mjs` through one bounded Feature 031 no-new-route test.
- Existing `scripts/selftest.mjs` Feature 031 sentinel only.
- Managed documentation updates only through `bubbles.docs` and only for the implemented foundation and existing route.

#### Excluded Surfaces

- `tools.json`, `index.html`, `rlnav.js`, and `site-exclusions.json`.
- Horizon Ladder files, Feature 019 artifacts, Feature 020 artifacts, and owner modules.
- Package configuration, Playwright configuration, and existing immutable Agenda records.
- Scope 4's Feature 031 module-loading block, exact resolver call sites, Power seam projection, topic-switch clearing, selected-lever rendering, and focused TP-04-13 and TP-04-14 test bodies.
- Every standalone Shock Transmission path and every Iran-only path.
- No test interception, detached renderer, hidden legacy DOM, fixture-only identity assertion, login path, new storage path, or new acquisition path may satisfy live UI proof.

### Consumer Impact Sweep

G043 is not applicable to Scope 5 because every existing first-party interface identity remains intact. The table records compatibility for the expanded existing-route presentation.

| Consumer | Required invariant | Planned proof |
| --- | --- | --- |
| Research Agenda Simple | Decision-first current truth and dynamic controls | Visible Playwright assertions over the existing route |
| Research Agenda Power | Complete paths, actors, curves, qualifiers, and history over the Scope 4 seam consumer | Visible and accessibility-tree Playwright assertions without a second seam or resolver implementation |
| Agenda Simple adapter | Consumes the Scope 4 resolver-returned view state with the same definition-driven values | Functional parity and browser comparison without a second v1/v2 dispatch |
| Market Brief and Company Intelligence | Existing compact read remains unchanged and carries no v2 dossier, causal, seam, graph, or routing field | TP-04-08 and the unchanged authored TP-04-21 consumer regression |
| Tool discovery and navigation | No new route or row | Existing discovery suite plus exact source boundary test |
| Horizon Ladder | Six horizons, two directions, twelve `0/20` withheld cells | Existing Horizon Ladder browser suite and byte-boundary audit |
| Feature 019 history | Existing immutable bytes and v1 readers remain reachable | Migration suite and pre/post hash inventory |
| Owner deep links | Resolve only declared same-origin owners | Playwright link and absent-owner assertions |

### Shared Infrastructure Impact Sweep

| Protected surface | Blast radius | Independent canary | Rollback or restore |
| --- | --- | --- | --- |
| Existing Research Agenda route | All three current topics, Simple, Power, history, source links, and local controls | Focused Feature 031 Playwright titles run before the complete file and existing Agenda suite | Reverse only Feature 031 script tags, components, styles, and event blocks |
| Shared Playwright runtime | Every browser suite | No runtime or config edit is allowed. Exact runner identity and existing route suites run unchanged | Delete only the dedicated Feature 031 spec |
| Tool discovery | Every registered tool and navigation order | Existing discovery suite plus source boundary test | Delete only the bounded test block. Product registries remain unchanged |
| Pages build | Every published root artifact | Source-lock validator and build command run after focused tests | Remove generated `_site/` as a build artifact. Do not edit source registries |

### Rollback And Recovery

- A v2 refusal shows unavailable current state and preserves the prior current pointer.
- Local reset removes every hypothetical value and restores the exact loaded baseline identity.
- Browser test fixtures use owned ephemeral paths and close their server and browser resources.
- A UI failure reverses only Feature 031 route blocks. It does not alter v2 immutable records.
- Horizon Ladder, registry, navigation, Feature 019 history, and legacy readers are hash-checked before and after the scope.

### Test Plan

| ID | Scenario | Type | Category | File and exact title | Exact command | Live system | Required result |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TP-05-01 | SCN-031-001 | e2e-ui | e2e-ui | Planned `tests/shock-transmission.e2e.spec.mjs` — `Regression: SCN-031-001 current baseline first paint preserves provenance and identity`; planning host `tests/tool-experience.spec.mjs` | `npx --no-install playwright test tests/shock-transmission.e2e.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep='^Regression: SCN-031-001 current baseline first paint preserves provenance and identity$' --reporter=list` | Yes | Canary: the current Research Agenda route shows current identity, source, provenance, as-of time, definition, and horizon before controls enable. |
| TP-05-02 | SCN-031-023 | e2e-ui | e2e-ui | Planned `tests/shock-transmission.e2e.spec.mjs` — `Regression: SCN-031-023 legacy unavailable state never fabricates a field path`; planning host `tests/tool-experience.spec.mjs` | `npx --no-install playwright test tests/shock-transmission.e2e.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep='^Regression: SCN-031-023 legacy unavailable state never fabricates a field path$' --reporter=list` | Yes | The named legacy reason and explicit no-published-path text render above separate dated history. No v2 path appears. |
| TP-05-03 | SCN-031-002, SCN-031-003 | e2e-ui | e2e-ui | Planned `tests/shock-transmission.e2e.spec.mjs` — `Regression: SCN-031-002 v2 refusal exposes the exact path and no substitute output`; planning host `tests/tool-experience.spec.mjs` | `npx --no-install playwright test tests/shock-transmission.e2e.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep='^Regression: SCN-031-002 v2 refusal exposes the exact path and no substitute output$' --reporter=list` | Yes | The reader shows the exact missing or unknown path and no numeric or finding substitute. |
| TP-05-04 | SCN-031-005, SCN-031-006, SCN-031-008, SCN-031-009 | e2e-ui | e2e-ui | Planned `tests/shock-transmission.e2e.spec.mjs` — `Regression: SCN-031-008 gross offsets conflicts and mechanism boundaries remain visible`; planning host `tests/tool-experience.spec.mjs` | `npx --no-install playwright test tests/shock-transmission.e2e.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep='^Regression: SCN-031-008 gross offsets conflicts and mechanism boundaries remain visible$' --reporter=list` | Yes | Simple and Power show gross, each offset, net state, both conflicts, and physical-financial separation. |
| TP-05-05 | SCN-031-010 | e2e-ui | e2e-ui | Planned `tests/shock-transmission.e2e.spec.mjs` — `Regression: SCN-031-010 policy actions retain independent institutional owners`; planning host `tests/tool-experience.spec.mjs` | `npx --no-install playwright test tests/shock-transmission.e2e.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep='^Regression: SCN-031-010 policy actions retain independent institutional owners$' --reporter=list` | Yes | All five owners remain distinct and Federal Reserve action never belongs to the executive. |
| TP-05-06 | SCN-031-011 | e2e-ui | e2e-ui | Planned `tests/shock-transmission.e2e.spec.mjs` — `Regression: SCN-031-011 announced policy never renders as implemented or effective`; planning host `tests/tool-experience.spec.mjs` | `npx --no-install playwright test tests/shock-transmission.e2e.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep='^Regression: SCN-031-011 announced policy never renders as implemented or effective$' --reporter=list` | Yes | Announcement evidence produces no implementation, effect, or restoration claim. |
| TP-05-07 | SCN-031-012 | e2e-ui | e2e-ui | Planned `tests/shock-transmission.e2e.spec.mjs` — `Regression: SCN-031-012 policy layer effects remain independently visible`; planning host `tests/tool-experience.spec.mjs` | `npx --no-install playwright test tests/shock-transmission.e2e.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep='^Regression: SCN-031-012 policy layer effects remain independently visible$' --reporter=list` | Yes | Liquidity and inflation effects remain separate and no unrelated layer is restored. |
| TP-05-08 | SCN-031-013 | e2e-ui | e2e-ui | Planned `tests/shock-transmission.e2e.spec.mjs` — `Regression: SCN-031-013 restoration waits for its named admitted observation`; planning host `tests/tool-experience.spec.mjs` | `npx --no-install playwright test tests/shock-transmission.e2e.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep='^Regression: SCN-031-013 restoration waits for its named admitted observation$' --reporter=list` | Yes | The visible layer remains unrestored until its named condition receives admitted evidence. |
| TP-05-09 | SCN-031-014 | e2e-ui | e2e-ui | Planned `tests/shock-transmission.e2e.spec.mjs` — `Regression: SCN-031-014 independent route contexts drive distinct horizon controls`; planning host `tests/tool-experience.spec.mjs` | `npx --no-install playwright test tests/shock-transmission.e2e.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep='^Regression: SCN-031-014 independent route contexts drive distinct horizon controls$' --reporter=list` | Yes | Two fresh route contexts each expose their definition's horizon ids, labels, order, durations, and intervals. The test exercises horizon behavior only. |
| TP-05-10 | SCN-031-015, SCN-031-016 | e2e-ui | e2e-ui | Planned `tests/shock-transmission.e2e.spec.mjs` — `Regression: SCN-031-016 probability confidence and realized rate never substitute`; planning host `tests/tool-experience.spec.mjs` | `npx --no-install playwright test tests/shock-transmission.e2e.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep='^Regression: SCN-031-016 probability confidence and realized rate never substitute$' --reporter=list` | Yes | Unsupported probability stays unavailable. Realized rate is withheld below the selected minimum and computed at it. |
| TP-05-11 | SCN-031-024 | e2e-ui | e2e-ui | Planned `tests/shock-transmission.e2e.spec.mjs` — `Regression: SCN-031-024 local hypothetical is nonpersistent and reset restores exact baseline`; planning host `tests/tool-experience.spec.mjs` | `npx --no-install playwright test tests/shock-transmission.e2e.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep='^Regression: SCN-031-024 local hypothetical is nonpersistent and reset restores exact baseline$' --reporter=list` | Yes | The exact label appears. Storage, URL, network, acquisition, history, dossier, pointer, payload, tool read, and immutable fingerprints stay unchanged. |
| TP-05-12 | SCN-031-008, SCN-031-021, SCN-031-025 | e2e-ui | e2e-ui | Planned `tests/shock-transmission.e2e.spec.mjs` — `Regression: SCN-031-021 graph table and finding detail preserve one causal meaning`; planning host `tests/tool-experience.spec.mjs` | `npx --no-install playwright test tests/shock-transmission.e2e.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep='^Regression: SCN-031-021 graph table and finding detail preserve one causal meaning$' --reporter=list` | Yes | Bidirectional graph and table selection preserves edge id, path order, and every qualifier. |
| TP-05-13 | SCN-031-025 | e2e-ui | e2e-ui | Planned `tests/shock-transmission.e2e.spec.mjs` — `Regression: SCN-031-025 existing Agenda remains accessible across required input and viewport modes`; planning host `tests/tool-experience.spec.mjs` | `npx --no-install playwright test tests/shock-transmission.e2e.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep='^Regression: SCN-031-025 existing Agenda remains accessible across required input and viewport modes$' --reporter=list` | Yes | Keyboard, touch, 320 CSS pixels, 200 percent zoom, 44 CSS pixel targets, reduced motion, assistive text, and live regions pass. |
| TP-05-15 | SCN-031-022 | e2e-ui | e2e-ui | `tests/tool-discovery.spec.mjs` — `Regression: SCN-031-022 Shock Transmission adds no route registry navigation or Iran-only surface` | `npx --no-install playwright test tests/tool-discovery.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep='^Regression: SCN-031-022 Shock Transmission adds no route registry navigation or Iran-only surface$' --reporter=list` | Yes | Discovery reaches the existing Agenda and finds no new Feature 031 tool surface. |
| TP-05-16 | SCN-031-022 | functional | functional | Planned `tests/shock-transmission.boundary.functional.mjs` — `Feature 031 protects Horizon Ladder history registries owner math and public scope`; planning host `scripts/selftest.mjs` | `node --test tests/shock-transmission.boundary.functional.mjs` | No | Protected files and semantics remain unchanged. The Lab-admission truth table keeps admission false when interactive need, existing-view insufficiency, or either unique production consumer is absent. Duplicate consumers and test-only callers do not count. Admission turns true only when all three evidence sets include two unique production consumers. Private research fields refuse. |
| TP-05-17 | SCN-031-022 | e2e-ui | e2e-ui | `tests/horizon-ladder-lab.spec.mjs` — complete existing suite | `npx --no-install playwright test tests/horizon-ladder-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes | Existing six-horizon, long and short, and earned-rate withholding behavior remains green without test edits. |
| TP-05-18 | SCN-031-001, SCN-031-002, SCN-031-004, SCN-031-005, SCN-031-006, SCN-031-007, SCN-031-008, SCN-031-009, SCN-031-010, SCN-031-011, SCN-031-012, SCN-031-013, SCN-031-014, SCN-031-015, SCN-031-016, SCN-031-017, SCN-031-021, SCN-031-022, SCN-031-023, SCN-031-024, SCN-031-025, SCN-031-026 | e2e-ui | e2e-ui | `tests/shock-transmission.e2e.spec.mjs` — complete Feature 031 browser suite | `npx --no-install playwright test tests/shock-transmission.e2e.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes | Every declared browser title executes through one real ephemeral HTTP server without interception or silent pass. |
| TP-05-19 | SCN-031-023 | ui-unit | ui-unit | `tests/shock-transmission.reader.unit.mjs` — `Regression: SCN-031-023 legacy reader sentence preserves named no-path state` | `node --test --test-name-pattern='^Regression: SCN-031-023 legacy reader sentence preserves named no-path state$' tests/shock-transmission.reader.unit.mjs` | No | The pure compatibility projection retains the reason, null path, `not-published` state, and separate history refs. |
| TP-05-20 | SCN-031-025 | ui-unit | ui-unit | `tests/shock-transmission.reader.unit.mjs` — `Regression: SCN-031-025 graph and semantic rows preserve one ordered qualifier set` | `node --test --test-name-pattern='^Regression: SCN-031-025 graph and semantic rows preserve one ordered qualifier set$' tests/shock-transmission.reader.unit.mjs` | No | Pure graph and semantic rows deep-equal on edge id, path order, evidence, limitations, and refuters. |
| TP-05-22 | SCN-031-004 | e2e-ui | e2e-ui | `tests/shock-transmission.e2e.spec.mjs` — `Regression: SCN-031-004 observed and inferred claims remain visibly distinct` | `npx --no-install playwright test tests/shock-transmission.e2e.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep='^Regression: SCN-031-004 observed and inferred claims remain visibly distinct$' --reporter=list` | Yes | Simple and Power show both claim labels, evidence grades, the inferred limitation, and its refuter. |
| TP-05-23 | SCN-031-007 | e2e-ui | e2e-ui | `tests/shock-transmission.e2e.spec.mjs` — `Regression: SCN-031-007 Power renders the complete bounded edge contract` | `npx --no-install playwright test tests/shock-transmission.e2e.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep='^Regression: SCN-031-007 Power renders the complete bounded edge contract$' --reporter=list` | Yes | Power exposes sign, unit, low, base, high, lag, persistence, evidence, limitation, and refuter. |

### Definition of Done — Tiered Validation

Planning does not execute delivery work. Every item remains unchecked until its owning phase records current evidence.

#### Core Items

- [ ] `DOD-05-C01` Existing Simple and Power projections consume one view state and preserve all UI states, meanings, controls, qualifiers, and owner links from the design.
- [ ] `DOD-05-C02` Local hypothetical behavior changes no acquisition, dossier, history, pointer, payload, tool read, or immutable record and resets to the exact baseline.
- [ ] `DOD-05-C03` Horizon Ladder files, six horizons, long and short directions, and twelve `0/20` withholding cells remain unchanged without a Feature 031 certification claim.
- [ ] `DOD-05-C04` No standalone Lab, Iran-only route, registry row, navigation item, site exclusion, login path, or new business API exists.
- [ ] `DOD-05-C05` Feature 019 history, existing v1 readers, current legacy unavailability, compact consumers, owner math, and every excluded file remain intact.
- [ ] Independent canary suite for shared fixture/bootstrap contracts passes before broad suite reruns. `DOD-05-C06` TP-05-01 validates current-route loading and first-paint contracts before the complete Feature 031 and Research Agenda browser suites.
- [ ] Rollback or restore path for shared infrastructure changes is documented and verified. `DOD-05-C07` Feature 031 route, test, discovery, and generated-site blocks restore independently while registries and shared runner configuration remain unchanged.

#### Test Evidence Items

- [ ] `DOD-05-TP-05-01` TP-05-01 passes on the existing route with honest current first paint.
- [ ] `DOD-05-TP-05-02` SCN-031-023 Legacy unavailability does not invent a field path: TP-05-02 passes.
- [ ] `DOD-05-TP-05-03` TP-05-03 passes with visible exact v2 refusal and no substitute output.
- [ ] `DOD-05-TP-05-04` TP-05-04 passes across gross, offsets, net, conflicts, and physical-financial separation.
- [ ] `DOD-05-TP-05-05` TP-05-05 passes with all institutional owners separate.
- [ ] `DOD-05-TP-05-06` TP-05-06 passes and announcement never renders as implementation or effect.
- [ ] `DOD-05-TP-05-07` TP-05-07 passes with policy-layer effects independently visible.
- [ ] `DOD-05-TP-05-08` TP-05-08 passes and restoration waits for its named admitted observation.
- [ ] `DOD-05-TP-05-09` TP-05-09 passes for two distinct horizon registries and exercises horizon behavior only.
- [ ] `DOD-05-TP-05-10` TP-05-10 passes immediately below and at each selected calibration minimum.
- [ ] `DOD-05-TP-05-11` SCN-031-024 Local comparison is non-persistent: TP-05-11 passes with exact reset identity.
- [ ] `DOD-05-TP-05-12` TP-05-12 passes with bidirectional graph, table, and finding qualifier parity.
- [ ] `DOD-05-TP-05-13` SCN-031-025 Accessible responsive operation: TP-05-13 passes every declared input and presentation mode.
- [ ] `DOD-05-TP-05-15` SCN-031-022 Adjacent products and unadmitted surfaces stay separate: TP-05-15 passes with no new Feature 031 route or registration.
- [ ] `DOD-05-TP-05-16` TP-05-16 passes the protected-file, history, owner-authority, public-scope, and Lab-admission truth table. It proves each false control, the all-conditions true boundary, unique production-consumer counting, and test-caller exclusion.
- [ ] `DOD-05-TP-05-17` TP-05-17 passes the unchanged Horizon Ladder browser suite.
- [ ] `DOD-05-TP-05-18` TP-05-18 passes the complete Feature 031 Playwright suite with no interception, retry authority, silent return, skip, only, or todo marker.
- [ ] `DOD-05-TP-05-19` TP-05-19 proves the pure legacy no-path projection without replacing live route proof.
- [ ] `DOD-05-TP-05-20` TP-05-20 proves pure graph-table parity without replacing accessible browser proof.
- [ ] `DOD-05-TP-05-22` SCN-031-004 Claim classes remain visible: TP-05-22 passes on Simple and Power.
- [ ] `DOD-05-TP-05-23` SCN-031-007 The bounded Edge remains visible: TP-05-23 passes on Power.
- [ ] Scenario-specific E2E regression tests for every new/changed/fixed behavior pass. `DOD-05-C08` TP-05-01 through TP-05-18, TP-05-22, and TP-05-23 cover every Scope 5 live behavior through the existing route.
- [ ] Broader E2E regression suite passes. `DOD-05-C09` TP-05-18 and the canonical broad Research Agenda browser suite pass after focused rows.

#### Build Quality Gate

- [ ] `DOD-05-BQ` The complete Scope 5 build-quality gate passes, including protected-byte checks.

### Build Quality Command Authority

Use the canonical source-lock, runner-identity, Core selftest, Node unit, Node functional and direct, Node integration, Playwright E2E, and Pages build entries in [.specify/memory/agents.md](../../.specify/memory/agents.md). Do not redeclare their wildcard selectors here. Scenario-specific rows above remain the authoritative focused commands. The runner identity must equal `Version 1.61.1`. The Pages build output stays under generated `_site/`.

## Finding Ledger

Every inherited finding and design risk has one planning disposition. A scope reference means that scope must close the behavior with current evidence. `LEGACY-031-001` remains routed to its owner and gates current geopolitical selection.

### Analyst Findings

| Finding | Planning disposition |
| --- | --- |
| F-031-001 | Scope 5 reads current registry state and never embeds the August 22 count. |
| F-031-002 | Scope 3 preserves the current three-topic pointer and explicit version refs. |
| F-031-003 | Scope 1 creates the first production foundation and labels every pre-execution state as planned. |
| F-031-004 | Scope 4 confines geopolitical terms to its adapter configuration. |
| F-031-005 | `LEGACY-031-001` routes the null-field legacy defect to `bubbles.bug` and blocks geopolitical current selection. |
| F-031-006 | Scope 4 adds the lossless v2 seam and a real Agenda Power consumer. |
| F-031-007 | Scope 4 proves three structurally different adapters through one foundation. |
| F-031-008 | Scope 3 replaces fixed v2 lever and horizon assumptions with definition-owned registries while retaining v1 reads. |
| F-031-009 | Scope 5 protects Horizon Ladder and makes no certification statement. |
| F-031-010 | Scope 5 protects all twelve `0/20` withholding cells as intentional earned-rate state. |
| F-031-011 | Scope 5 proves no new Lab surface while any admission condition is unproven. |

### UX Findings

| Finding | Planning disposition |
| --- | --- |
| H031-UX-ROUTE | The UX-owned mapping keeps SCN-031-023 through SCN-031-026 on both existing projections and the current-unavailability, local-compare, accessible-modes, and topic-registry flows. TP-05-02, TP-05-11, TP-05-13, and TP-04-14 preserve those exact flow anchors. |
| F-UX-031-001 | Scope 5 modifies the existing Simple and Power projections only. |
| F-UX-031-002 | Scope 3 owns definition-driven levers. Scope 5 proves the live controls. |
| F-UX-031-003 | Scope 2 owns non-persistable hypothetical state. Scope 5 proves reset and zero canonical writes. |
| F-UX-031-004 | Scope 3 owns definition calibration minimums. Scope 5 tests immediately below and at each minimum. |
| F-UX-031-005 | Scope 4 owns one lossless projection. Scope 5 proves graph, table, summary, and finding parity. |
| F-UX-031-006 | `LEGACY-031-001` remains routed. Scope 5 renders the missing legacy path honestly. |
| F-UX-031-007 | The existing design resolves the technical-design requirement. No plan edit is required. |
| F-UX-031-008 | This plan supplies complete scope planning and structured test handoff. |
| F-UX-031-009 | [report.md](report.md) supplies the execution-evidence structure without fabricated results. |
| F-UX-031-010 | [uservalidation.md](uservalidation.md) supplies unchecked human acceptance for the existing route. |
| F-UX-031-011 | Scope 1 precedes every overlay and Scope 4 proves all three variations. |

### Design Risks

| Risk | Planning disposition |
| --- | --- |
| D-RISK-031-001 | Scope 3 creates and validates content-addressed definitions before any registry movement. |
| D-RISK-031-002 | Scope 4 requires foundation validation on every adapter output. |
| D-RISK-031-003 | Scope 3 and Scope 5 compare v1 and v2 projections and compact consumers. |
| D-RISK-031-004 | Scope 3 validates lever ids, units, bounds, and targets without interpreting labels or UI order. |
| D-RISK-031-005 | Scope 4 keeps absent financial owner reads unavailable and forbids coverage claims. |
| D-RISK-031-006 | Scope 3 rejects legacy-token coercion from v2 horizons. |
| D-RISK-031-007 | Scope 5 uses complete v2 owned fixtures to exercise UI while preserving current legacy unavailability. |
| D-RISK-031-008 | Scope 1 enforces byte ceilings before publication. Scope 5 verifies packaging boundaries. |

### Cross-Cutting Findings

| Finding | Planning disposition |
| --- | --- |
| X-031-LOSSY-SEAM | Scope 4 preserves causal path, refuters, limitations, triggers, and invalidations and wires Agenda Power. |
| X-031-FIXED-HORIZONS | Scope 3 introduces definition-owned v2 horizon ids and preserves legacy reads. |
| X-031-FIXED-LEVERS | Scope 3 introduces exact definition-owned lever registries. Scope 5 removes private v2 UI lists. |
| X-031-ACTOR-AUTHORITY | Scope 2 enforces owner and layer identity. Scope 5 proves visible separation. |
| X-031-GENERIC-LEGACY-REFUSAL | `LEGACY-031-001` remains routed. Scope 1 provides exact paths only for new v2 records. |

### Inherited Hardening Findings

| Finding | Status | Planning resolution |
| --- | --- | --- |
| H031-H4-001 | Addressed | TP-01-09, TP-01-10, TP-02-11, TP-03-09, TP-05-19, and TP-05-20 are repository-native `ui-unit` rows. Each has separate Playwright proof where the behavior is visible. |
| H031-H5-001 | Addressed | SCN-031-023 exclusively owns legacy no-path behavior through TP-05-02 and TP-05-19. SCN-031-002 retains strict v2 proof through TP-01-02 and TP-05-03. |
| H031-H5-002 | Addressed | SCN-031-024 owns same-topic hypothetical lifetime, sink isolation, and exact reset through TP-02-11, TP-02-12, and TP-05-11. |
| H031-H5-003 | Addressed | SCN-031-025 owns keyboard, touch, viewport, zoom, target size, motion, assistive text, live regions, and graph-table behavior through TP-05-13 and TP-05-20. |
| H031-H5-004 | Addressed | SCN-031-014 owns horizons through TP-03-01 and horizon-only TP-05-09. SCN-031-026 owns topic switching, pre-render clearing, selected levers, and adapter non-interference through TP-03-09, TP-04-07, and TP-04-14. |
| H031-H5-005 | Addressed | TP-04-06 proves only the Node parent resolver and seam. TP-04-13 proves real Agenda Power route consumption through Playwright before Scope 4 can complete. |
| H031-H5-006 | Addressed | TP-01-09 and TP-05-22 cover pure and visible SCN-031-004 behavior. TP-01-10 and TP-05-23 cover pure and visible SCN-031-007 behavior. |
| H031-H6-001 | Addressed | Unit and UI-unit rows use `.unit.mjs`. Functional rows use `.functional.mjs`. Integration rows use `.integration.mjs`. Browser rows use `.spec.mjs` and Playwright. |
| H031-H9-001 | Addressed | Every multi-scenario Test Plan row lists exact scenario ids. Scope 2 lists eight engine scenarios plus SCN-031-024 and never includes SCN-031-007. |
| H031-H9-002 | Addressed | The cardinality ledger derives 80 distinct rows. Markdown, structured JSON, manifest mappings, and DoD ids use the same set. |
| H031-REQ-001 | Addressed | The 47-row requirement ledger names one owning scope, primary proof id, and discriminating assertion for every requirement. |
| H031-REQ-002 | Addressed | The Numeric Budget Proof Ledger names all five limits, exact proof ids, boundary values, and owner boundaries. |
| H031-PROSE-001 | Addressed | Plan-owned procedural prose uses short active sentences. Tables retain exact technical contracts without semicolons. |
| H031-R2-H5-001 | Addressed | SCN-031-022 now uses delivery through the existing Research Agenda route. TP-05-15, TP-05-16, TP-05-17, and TP-05-18 preserve the no-new-surface and Horizon Ladder boundaries. |
| H031-R2-H5-002 | Addressed | SCN-031-024 uses TP-02-11, TP-02-12, and TP-05-11 for same-topic comparison and reset. SCN-031-026 exclusively owns topic switching through TP-03-09, TP-04-07, and TP-04-14. |
| H031-R2-H6-001 | Addressed | The Scope 1 boundary, TP-01-07 row, command target, category, and DOD-01-TP-01-07 all use `tests/shock-transmission.resource.functional.mjs`. |
| H031-R2-H9-001 | Addressed | TP-03-06 names and executes only `tests/shock-transmission.migration.integration.mjs`. DOD-03-TP-03-06 preserves the same transaction-restoration obligation. |
| H031-R2-H9-002 | Addressed | The cardinality ledger derives 80 rows from distinct obligations. SCN-031-024 sink isolation remains solely in TP-02-12. All row and DoD ids remain unique and synchronized. |

### Round 3 Planning Findings

| Finding | Status | Planning resolution |
| --- | --- | --- |
| H031-R3-H4-001 | Addressed | TP-04-13 is the focused Playwright proof for the live Agenda Power seam consumer. It must pass before Scope 4 completes. TP-04-14 does the same for the definition-owned topic-switch flow. Scope 5 keeps only the broad browser regression over these completed behaviors. |
| H031-R3-H5-001 | Addressed | TP-05-09 opens two independent fresh route contexts and asserts horizon fields only. It performs no in-place topic switch, lever assertion, or clearing assertion. SCN-031-026 exclusively owns topic switching and clearing through TP-04-14. |
| H031-R3-H6-001 | Addressed | The 78 planned test rows remain `planned-not-authored`. TP-04-21 and TP-05-17 are authored. All 80 rows remain `planned-not-executed`, and all five structured scope ids remain `not_started`. |
| H031-R3-PLAN-001 | Addressed | The Execution Outline and Scope 1 use `resolveResourcePolicy(config)`. They pass `resourcePolicy` to definition, adapter-output, composition, and snapshot validation exactly as required by the design. |
| H031-R3-PLAN-002 | Addressed | Scope 1 permits only the exact Feature 031 resource-policy block in `market-brief.config.json`. Its impact sweep and rollback preserve every unrelated policy field. |
| H031-R3-ORDER-001 | Addressed | The requirement ledger places each primary proof in its owning scope or an earlier dependency. FR-031-028 and NFR-031-010 move to Scope 4. NFR-031-006 moves to Scope 5. NFR-031-007 completes in Scope 4 after its Scope 1, Scope 3, and Scope 4 owner-bound proofs. No requirement depends on a later scope. |
| H031-R3-STATE-001 | Addressed | The non-certification execution registry records this planning invocation and five not-started scopes. The top status and every certification field remain `not_started` and no delivery claim is added. |

### Round 4 Planning Findings

| Finding | Status | Planning resolution |
| --- | --- | --- |
| H031-R4-DESIGN-001 | Preserved as addressed by `bubbles.design` | Design sections 4.2.1, 6.3 through 6.5, 14.10, 21.3, 21.4, 22.1, 23, 24.1, 25, and 26.7 define the exact shared parent resolver contract. |
| H031-R4-PLAN-001 | Addressed | The Execution Outline, scope implementation plans, test assertions, DoD, consumer traces, and structured mappings name `RLAGENDA.resolveAgendaConsumerState(request, dependencies)`, `projectClaimRows(viewState)`, `projectEdgeRows(viewState)`, `projectFindingRows(seam)`, and `resolveDefinitionRegistries(definition)` with their designed dataflow. |
| H031-R4-SCOPE-001 | Addressed | Scope 4 permits and owns the exact route module loading, sole resolver export and calls, publish and read tuples, Power seam projection, topic-switch clearing regions, and TP-04-13 and TP-04-14 test bodies. Scope 5 excludes those regions and retains broader experience, accessibility, and regression only. |
| H031-R4-META-001 | Addressed | TP-05-17 remains `authored` and `planned-not-executed`. TP-04-21 uses the same classifier for its unchanged authored Market Brief test. The other 76 rows remain `planned-not-authored`. |
| H031-R4-ACCOUNT-001 | Addressed | The UX Findings ledger contains exactly one `H031-UX-ROUTE` row with SCN-031-023 through SCN-031-026 and their four UX flow anchors. |
| H031-R4-ROUTE-001 | Addressed | The External Route Ledger names `bubbles.test` for `XRL-PATH-GUARD-HIST-001` and preserves its historical-report versus active-path classification obligation. |

### Round 5 Planning Findings

| Finding | Status | Planning resolution |
| --- | --- | --- |
| H031-R5-DESIGN-001 | Preserved as addressed by `bubbles.design` | Design sections 6.5.1 through 6.5.6 define the thirteen-key request, canonical `generationCutoff`, five-key current record, equality order, and observation cutoff. |
| H031-R5-H6-001 | Preserved as addressed by `bubbles.design` | Design section 24.6 references the canonical command registry without an executable wildcard declaration. |
| H031-R5-H5-001 | Addressed | TP-04-06 and TP-04-15 through TP-04-18 call the real parent resolver across eight valid branches and each distinct refusal class. Every refusal row asserts that no partial pair exists. |
| H031-R5-H5-002 | Addressed | TP-04-19 and TP-04-20 separately prove publisher and browser policy identity, cutoff identity, exact tuples, once-only calls, and bypass or duplicate controls. TP-04-13 and TP-04-14 retain visible browser proof. |
| H031-R5-H4-001 | Addressed | TP-04-21 reuses the authored Market Brief production-route test with its exact current title. It proves the compact `research-agenda-read/v1` topic shape and excludes dossier, causal, seam, graph, and routing fields. |
| H031-R5-H8-001 | Addressed | Scope 3 alone publishes geopolitical and food v2 definition bytes through TP-03-12. Scope 4 treats those families as read-only inputs and verifies exact consumption through TP-04-22. |
| H031-R5-ROLLBACK-001 | Addressed | Scope 4 keeps v2 resolution active until a complete prior v1 tuple is atomically restored. TP-04-23 rejects a v2-pointer and raw-v1-read mix while preserving the last complete tuple. |
| H031-R5-H6-002 | Addressed | Scope 5 references the canonical command registry without redeclaring its four wildcard selectors. The focused path classifier must report zero Feature 031 errors. |

### Round 6 Planning Findings

| Finding | Status | Planning resolution |
| --- | --- | --- |
| H031-R6-H5-001 | Addressed | TP-04-15 now adds one request key and one `currentRecord` key. It also removes each dependency key and adds one dependency key. Every exact-shape mutation must return no consumer pair. |
| H031-R6-H5-002 | Addressed | TP-03-02 keeps curve-level evidence intact while independently deleting each row-level provenance, evidence, source, as-of, and limitation member. Each deletion must refuse at the exact scenario-row path. |
| H031-R6-H5-003 | Addressed | TP-02-09 now exercises `stale`, `missing`, `conflicted`, `unsupported`, and `invalidated` Finding states in Scope 2. It rejects a directional substitute for each state. |
| H031-R6-H5-004 | Addressed | TP-05-16 now uses false and true controls for interactive need, existing-view insufficiency, and two unique production consumers. Duplicate consumers and test-only callers cannot satisfy admission. |

### External Route Ledger

| Finding | Disposition | Owner boundary |
| --- | --- | --- |
| XRL-PATH-GUARD-HIST-001 | Route only | `bubbles.test` must classify historical report references independently from active paths. Feature 031 historical evidence remains byte-preserved. |
| XRL-BUG017-DOD-001 | Route only | `bubbles.validate` owns reconciliation of the prior BUG-017 certification claim against artifact truth. Feature 031 does not absorb or rewrite that record. |

### Planning Gaps

| Finding | Status | Required owner and gate |
| --- | --- | --- |
| LEGACY-031-001 | Unresolved and separately routed | `bubbles.bug` owns the complete repair packet. Geopolitical v2 selection remains blocked until current verified repair evidence exists. |
| F031-S01-BOUNDARY-001 | Plan-owned mapping reconciled; validate-owned route remains | TP-01-08 is the persistent Scope 1 canary at `tests/shock-transmission.canary.functional.mjs`. `bubbles.validate` must add that exact path to `state.workBoundary.allowedPaths`; planning does not edit state. |
| F031-S01-CONSUMER-001 | Plan-owned mapping reconciled; implementation remains open | Scope 1 is `runtime-behavior`. Its allowed paths include only the exact existing-route binding region and TP-01-11. The Test Plan, structured handoff, report mapping, and unchecked runtime DoD require the production binding and live proof before `bubbles.implement` may claim closure. |
| PLAN-031-001 | Closed by this plan | Dedicated unit, functional, integration, resource, boundary, and Playwright paths have exact planned names and repository-supported command shapes. |
| PLAN-031-002 | Closed by this plan | Design section 19 declares no timing or throughput target. Exact byte and large-graph resource boundaries remain mandatory, and no duplicate timing-stress row is planned. |
| PLAN-031-003 | Closed by this plan | Horizon Ladder and Feature 019 boundaries have named files, tests, immutable-byte checks, and rollback rules. |

## Cross-Scope Completion Rules

- Scopes execute in numeric order. A later scope cannot start until every dependency is Done with current evidence.
- Every scenario has one exact Gherkin identity, one primary persistent regression title, one scenario-manifest entry, and one or more explicit DoD test items.
- Every changed behavior receives persistent regression coverage proportional to its behavior traits.
- Live UI proof uses Playwright through `playwright.config.mjs`, project `system-chrome`, and the current production route. It uses no request interception.
- Static and contract proof imports or executes planned production code. File-presence and fixture-identity checks cannot satisfy behavior claims.
- Every guard has a discriminating negative control. High-risk authority, lifecycle, persistence, version, and projection scenarios require bounded mutation proof.
- The complete registered Node suites and applicable browser suites run after focused tests.
- No checkbox may be checked without current execution evidence and its owning phase attribution.
- Planning completion does not change delivery status, scope status, certification, completed scopes, or human acceptance.
