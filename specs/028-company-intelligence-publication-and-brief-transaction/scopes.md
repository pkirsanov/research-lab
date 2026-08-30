<!-- markdownlint-disable MD024 -->

# Feature 028 Scopes — Company Intelligence Public Delivery and Atomic Brief Refresh

Links: [spec.md](spec.md) · [design.md](design.md) · [report.md](report.md) · [uservalidation.md](uservalidation.md).

**Workflow mode:** `full-delivery`  
**Scope layout:** `single-file`  
**Goal Contract:** `gc:vscode-1f5b7362918071b6b2de16fb3709dfae:3`, revision 3  
**Execution rule:** Complete and certify each scope before starting its dependent scope.

## Execution Outline

### Phase Order

1. **Scope 01 — Company publication foundation and headless owner-read contracts.** Extend the UMD composer with frozen contracts and one real owner read.
2. **Scope 02 — Coupled manifest, immutable promotion, and pointer-last success path.** Bind company versions and the exact brief run into one ordered transaction.
3. **Scope 03 — Whole-transaction restoration and non-authoritative outcomes.** Prove both publication sides restore together across company, brief, covered-set, commit, and dry-run failures.
4. **Scope 04 — Scheduled and on-demand shared trigger integration.** Route both triggers through one launcher, journal, exact-resume path, and frozen-registry contract.
5. **Scope 05 — Public registration, authority-aware UI, and Pages delivery.** Register after the owner read and coupled transaction pass. Reconcile every public consumer.

### New Types and Signatures

- `company-publication-policy/v1` declares the exact covered-subject set and branch budget.
- `company-publication-generation/v1` freezes trigger, cutoff, registry, subjects, revision, and input fingerprints.
- `company-research-plan/v2` binds authorship, subject, generation, branches, source clocks, and budget.
- `company-read-version/v2` extends immutable company history with generation and content identity.
- `company-intelligence-owner-read/v1` extends `tool-model-read/v1` without recommendation authority.
- `company-brief-publication-manifest/v1` binds company candidates to one exact brief run and inventory.
- `company-brief-current-pointer/v1` selects one acknowledged company-and-brief pair.
- `company-publication-attempt/v1` exposes safe scheduled, on-demand, failed, and dry-run attempt states.
- `coupled-publication-state/v1` permits only the eighteen ordered publication phases.
- `validatePublicationPolicy(document) -> { ok, value | error }`.
- `createGeneration(trigger, context) -> { ok, value | error }`.
- `freezePublicationInputs(inputs) -> { ok, value | error }`.
- `validatePlanAuthorResponse(request, response) -> { ok, value | error }`.
- `composeCoveredSubjects(frozen, plans) -> { ok, value | error }`.
- `buildCompanyOwnerRead(generation, versions) -> { ok, value | error }`.
- `buildCoupledManifest(input) -> { ok, value | error }`.
- `validateCoupledPublication(root, generationId) -> { ok, value | error }`.
- `createCoupledState(attemptId)` and `advanceCoupledState(state, nextPhase)` enforce phase order.
- The shared trigger surface accepts `--trigger scheduled|on-demand`, an exact window selector, and optional `--dry-run`.

### Validation Checkpoints

- **After Scope 01:** Run production-unit, direct module, integration owner-read, Feature 025, and source-lock canaries. No trigger or registry consumer may activate yet.
- **After Scope 02:** Run real-filesystem promotion tests and immutable-history canaries. The coupled selector must remain the final write.
- **After Scope 03:** Run fault-injection and temporary-Git process tests. Every abort must preserve the prior acknowledged pair byte-for-byte.
- **After Scope 04:** Run scheduled and on-demand temporary-Git tests through one launcher and bare remote. Resume must reuse the exact local commit.
- **After Scope 05:** Run registry parity, Pages build, real-browser discovery, authority-state, deep-link, accessibility, responsive, and `file://` checks.
- **Final candidate:** Run the complete command set from the project command registry plus planning and delivery guards on one unchanged tree.

## Execution Scope Summary

| Scope | Name | Depends On | Primary surfaces | Scenario set | Status |
| --- | --- | --- | --- | --- | --- |
| 01 | Company publication foundation and headless owner-read contracts | None | UMD contracts, Node publication module, config, domain model | SCN-028-005 through SCN-028-010 | Done |
| 02 | Coupled manifest, immutable promotion, and pointer-last success path | Scope 01 | publication module, Git primitives, company data contracts | SCN-028-011, SCN-028-013, SCN-028-014, SCN-028-021 | Done |
| 03 | Whole-transaction restoration and non-authoritative outcomes | Scope 02 | worker transaction, restoration, private checkouts, dry run | SCN-028-015, SCN-028-016, SCN-028-017, SCN-028-022 | In Progress |
| 04 | Scheduled and on-demand shared trigger integration | Scope 03 | launcher, worker, scheduler, prompt, exact resume | SCN-028-003, SCN-028-004, SCN-028-012, SCN-028-019 | Not Started |
| 05 | Public registration, authority-aware UI, and Pages delivery | Scope 04 | registries, routes, shared UI, docs, Pages package | SCN-028-001, SCN-028-002, SCN-028-018, SCN-028-020 | Not Started |

## Shared Planning Expectations

- `testImpact` and `traceContracts` are absent from the current project configuration. This plan adds no generated impact or telemetry rows.
- Research Lab has no telemetry backend. Structured files, bounded command output, Git identity, and page-visible state provide diagnostics.
- No latency, throughput, memory, or publication-duration target exists. A stress or load row would invent an SLA, so this plan contains none.
- Node tests that drive a real temporary Git repository and bare remote are process E2E tests. Their canonical manifest classification is `functional`, not `e2e-api`.
- Playwright tests use the checkout-local runner, committed configuration, and `system-chrome` project. They are `e2e-ui` tests.
- Every changed behavior receives a persistent scenario-specific regression. Synthetic controls complement real filesystem, Git, package, and browser paths.
- All DoD boxes remain unchecked until the named specialist records current execution evidence at the linked report anchor.
- Feature 025 artifacts remain unchanged. Its production contracts and tests act as predecessor compatibility canaries.

## Pre-Implementation Authority Gate

Goal Contract revision 3 authorizes changes only under `specs/028-company-intelligence-publication-and-brief-transaction/**` and the approved product paths recorded in the current work boundary. This bootstrap preserves that boundary unchanged.

Before product mutation, the top-level runner must issue an approved Goal Contract revision. Its actionable packet must preserve the repository, spec target, and forbidden cross-repository policy.

The revised `allowedPaths` must cover the design-owned implementation inventory below. Any path absent from that approved packet remains read-only.

| Scope | Product paths requiring implementation authority |
| --- | --- |
| Scope 01 | `rlcompanyintel.js`, `company-intelligence.config.json`, `config/domain-model.yaml`, `scripts/company-intelligence-publication.mjs`, `scripts/brief-author.mjs`, `tests/company-intelligence.unit.mjs`, `tests/company-intelligence-publication.unit.mjs`, `tests/company-intelligence-publication.integration.mjs`, `tests/company-intelligence-publication.functional.mjs`, `tests/company-intelligence-publication.e2e.mjs` |
| Scope 02 | `scripts/company-intelligence-publication.mjs`, `scripts/brief-publication.mjs`, `data/company-intelligence/**`, `tests/distributed-briefs.distributed-publish.unit.mjs`, `tests/company-intelligence-publication.integration.mjs`, `tests/company-intelligence-publication.e2e.mjs` |
| Scope 03 | `scripts/company-intelligence-publication.mjs`, `scripts/brief-publication.mjs`, `scripts/brief-refresh-and-push.sh`, `tests/brief-refresh-atomicity.support.mjs`, `tests/brief-refresh-atomicity.test.mjs`, `tests/company-intelligence-publication.integration.mjs`, `tests/company-intelligence-publication.e2e.mjs` |
| Scope 04 | `scripts/brief-refresh.mjs`, `scripts/brief-distributed-publish.mjs`, `scripts/brief-publication.mjs`, `scripts/brief-refresh-and-push.sh`, `scripts/brief-refresh-scheduled.sh`, `scripts/com.researchlab.brief-refresh.plist`, `scripts/validate-distributed-briefs.mjs`, `scripts/validate-brief-payload.mjs`, `.github/prompts/market-brief-update.prompt.md`, `data/bars/**`, `data/options/**`, `briefs/**`, `research/agenda/**`, `brief-history.jsonl`, `brief-history.recent.jsonl`, `market-brief.snapshot.json`, `market-brief.payload.json`, `market-brief.page.json`, `market-brief.config.page.json`, `market-brief.snapshot.page.json`, `market-brief.tools.page.json`, `market-brief.experimental.json`, `market-brief.owner-reads.json`, `market-brief.scorecard.json`, `market-brief.attention-scorecard.json`, `causal-rotation.snapshot.json`, `tests/distributed-briefs.scheduler.unit.mjs`, `tests/distributed-briefs.scheduler.integration.mjs`, `tests/distributed-briefs.scheduler-failures.integration.mjs`, `tests/distributed-briefs.scheduler.e2e.mjs`, `tests/company-intelligence-publication.functional.mjs`, and `tests/company-intelligence-publication.e2e.mjs` |
| Scope 05 | `company-intelligence-lab.html`, `rlnav.js`, `rlbrief.js`, `market-brief.html`, `site-exclusions.json`, `tools.json`, `simple-models.json`, `journeys.json`, `tool-experience.config.json`, `index.html`, `README.md`, `notes/README.md`, `notes/company-intelligence-lab.md`, `rlexperience-adapters/company-intelligence.js`, `scripts/selftest.mjs`, `data/company-intelligence/**`, `briefs/**`, `tests/company-intelligence-lab.spec.mjs`, and `tests/company-intelligence-publication.spec.mjs` |

`tests/tool-discovery.spec.mjs` and `tests/deployed-site-parity.spec.mjs` remain read-only canaries unless an approved binding explicitly adds them.

## Scope 01: Company publication foundation and headless owner-read contracts

**Status:** Done
**Tags:** foundation:true.  
**Depends On:** None.  
**Scope-Kind:** runtime-behavior

**Consumer surface:** The production CLI command boundary exposes `prepare`, `bind-plan`, and `inject-owner-read` inside isolated checkouts.

### Goal Contribution

Goal Contract revision 3 requires one source-qualified company read for every complete recreation. This scope creates that deterministic read before any public registration or trigger activation.

### Requirements Covered

FR-028-006 through FR-028-021 establish the frozen registry, explicit subject policy, complete composition, bounded plan, and real owner read. This scope also establishes the owner-read input required by FR-028-029.

### Gherkin Scenarios

#### SCN-028-005 — The company source has a real owner read

```gherkin
Scenario: Registry membership produces evidence rather than coverage text
Given the frozen registry includes the company tool as a source
When the all-source bundle is built
Then the company tool contributes exactly one validated owner read
And that read references the candidate MSFT version and fingerprint
And no coverage-only outcome represents the company tool
```

#### SCN-028-006 — The coverage floor and horizons remain complete

```gherkin
Scenario: Scheduled composition preserves Feature 025 semantics
Given a covered company candidate is composed from frozen evidence
When composition completes
Then all fifteen mandatory dimensions report one explicit state
And exactly four isolated horizons are present
And no combined direction replaces the four horizons
```

#### SCN-028-007 — Missing and stale evidence stays honest

```gherkin
Scenario: Missing evidence never becomes a fresh company claim
Given one mandatory dimension has no eligible current source
When the candidate company version is composed
Then that dimension reports missing or stale with a named reason
And no prior value or neutral value replaces it
And every affected horizon states the limitation
```

#### SCN-028-008 — Evidence cannot arrive after the cutoff

```gherkin
Scenario: A late source read is refused
Given a source read is dated after the frozen publication cutoff
When the company candidate validates its evidence
Then the late read is refused
And no horizon cites it
And the refusal identifies the source and cutoff conflict
```

#### SCN-028-009 — A research plan is generation-bound and bounded

```gherkin
Scenario: A valid authored plan survives publication
Given the research author records no more than five branches for company:msft
And every branch names its horizon, sources, result, disposition, and stop condition
When the plan is validated for the frozen generation
Then the plan records its author, authored time, subject, and generation
And every source is dated at or before the generation cutoff
And the plan is embedded in the candidate version
```

#### SCN-028-010 — An invalid research plan blocks the candidate

```gherkin
Scenario: Plan validation fails closed
Given an authored plan is unsigned, cross-subject, over budget, or supported by late evidence
When the plan is validated
Then the company candidate is refused
And the prior plan is not relabelled as current
And no brief from this generation publishes
```

### Implementation Plan

1. Extend `company-intelligence.config.json` to v2. Make `publication.coveredSubjects` the sole eligibility set with only `company:msft`.
2. Extend `rlcompanyintel.js` without changing its UMD, clock-free, DOM-free, network-free, storage-free, and filesystem-free boundary.
3. Add policy, source-normalization, plan-v2, version-v2, owner-read, and validation exports while retaining v1 readers.
4. Add `scripts/company-intelligence-publication.mjs` with pure domain results and closed `C028-*` refusals.
5. Add the powerless author request and response boundary to `scripts/brief-author.mjs`.
6. Freeze registry identity, subjects, inputs, owner reads, clocks, cutoff, and source fingerprints before composition.
7. Exclude Company Intelligence and the final aggregator from the company source catalogue.
8. Normalize owner reads without recomputing owner math. Preserve explicit missing, stale, conflicted, and unavailable states.
9. Compose fifteen unique dimensions and four isolated horizons through the existing Feature 025 functions.
10. Validate plan authorship, source membership, subject, generation, cutoff, horizon targets, stopped branches, and the five-attempt budget.
11. Build one company owner read that names candidate identities, fingerprints, clocks, coverage, horizons, limitations, and deep links.
12. Extend `config/domain-model.yaml` with the four Feature 028 invariants named in the design.

### Shared Infrastructure Impact Sweep

| Protected surface | Downstream contracts | Independent canary | Restore path |
| --- | --- | --- | --- |
| `rlcompanyintel.js` | Existing route, Feature 025 v1 versions, current pointer, UMD globals, company unit tests | TP-01-08 runs the existing Feature 025 suite without the new publication CLI | Revert additive exports and config-v2 reader while retaining every v1 byte and artifact |
| `brief-author.mjs` | Existing final-brief author request, schema, byte limits, and powerless process boundary | TP-01-07 exercises the company-plan lane through the real production CLI | Remove the company-plan command branch without changing the final-brief branch |
| Frozen tool registry input | Tool order, participant identity, source fingerprints, and all-source bundle cardinality | TP-01-01 proves exactly one real company outcome in a generated bundle | Reject the candidate and retain the prior acknowledged pair |

### Consumer Impact Sweep

- Preserve all Feature 025 UMD callers and historical v1 readers.
- Preserve `rldata.js` validation of the base `tool-model-read/v1` contract.
- Keep the company-specific owner read additive for `brief-distributed-publish.mjs` and the final brief author.
- Keep direct-source dimensions ownerless when no headless owner exists. Do not invent a substitute owner.
- Keep public registration surfaces unchanged in this scope. P18 forbids visibility before the owner read and coupled path exist.

### Change Boundary

**Allowed file families:**

- `rlcompanyintel.js`, `company-intelligence.config.json`, and `config/domain-model.yaml`.
- `scripts/company-intelligence-publication.mjs`, `scripts/brief-author.mjs`, and Scope 01 tests.

**Excluded surfaces:**

- Feature 025 artifacts, public registries, landing and navigation UI, and Pages registration.
- Current pointers, brief snapshots, acknowledgments, unrelated tools, framework files, and the concurrent primary checkout.

### Test Plan

| Test Type | Test ID | Category | File/Location | Scenario | Exact test title | Command | Live System | Regression | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Integration | TP-01-01 | integration | `tests/company-intelligence-publication.integration.mjs` | SCN-028-005 | `SCN-028-005 complete source bundle contains one real company owner read and no company coverage outcome` | `node --test tests/company-intelligence-publication.integration.mjs` | No — real temporary filesystem | Persistent | [TP-01-01](report.md#tp-01-01) |
| Unit | TP-01-02 | unit | `tests/company-intelligence-publication.unit.mjs` | SCN-028-006 | `SCN-028-006 headless composition preserves fifteen states and four isolated horizons` | `node --test tests/company-intelligence-publication.unit.mjs` | No | Persistent | [TP-01-02](report.md#tp-01-02) |
| Unit mutation | TP-01-03 | unit | `tests/company-intelligence-publication.unit.mjs` | SCN-028-007 | `Mutation: SCN-028-007 missing and stale owner reads remain named and cannot become fresh claims` | `node --test tests/company-intelligence-publication.unit.mjs` | No | Persistent | [TP-01-03](report.md#tp-01-03) |
| Unit mutation | TP-01-04 | unit | `tests/company-intelligence-publication.unit.mjs` | SCN-028-008 | `Mutation: SCN-028-008 evidence after the frozen cutoff is rejected from every horizon` | `node --test tests/company-intelligence-publication.unit.mjs` | No | Persistent | [TP-01-04](report.md#tp-01-04) |
| Unit | TP-01-05 | unit | `tests/company-intelligence-publication.unit.mjs` | SCN-028-009 | `SCN-028-009 signed bounded plan is enriched from the frozen source catalogue` | `node --test tests/company-intelligence-publication.unit.mjs` | No | Persistent | [TP-01-05](report.md#tp-01-05) |
| Unit mutation | TP-01-06 | unit | `tests/company-intelligence-publication.unit.mjs` | SCN-028-010 | `Mutation: SCN-028-010 malformed unsigned cross-subject late and over-budget plans fail closed` | `node --test tests/company-intelligence-publication.unit.mjs` | No | Persistent | [TP-01-06](report.md#tp-01-06) |
| Process E2E | TP-01-07 | functional | `tests/company-intelligence-publication.e2e.mjs` | SCN-028-005 through SCN-028-010 | `Regression E2E: Scope 01 prepare bind-plan and inject-owner-read execute the production CLI without publication authority` | `node --test tests/company-intelligence-publication.e2e.mjs` | Yes — production CLI in a real temporary Git checkout | Persistent | [TP-01-07](report.md#tp-01-07) |
| Compatibility canary | TP-01-08 | unit | `tests/company-intelligence.unit.mjs` | SCN-028-006 and SCN-028-009 | `Regression canary: Feature 025 UMD and v1 contracts remain readable beside publication v2` | `node --test tests/company-intelligence.unit.mjs` | No | Existing plus additive | [TP-01-08](report.md#tp-01-08) |

### Definition of Done — Tiered Validation

#### Core Outcomes

- [x] `company:msft` is the only committed covered subject, and no resource list grants publication eligibility. → Evidence: [Scope 01 contract and boundary evidence](report.md#scope-01-contract-and-boundary-evidence)
- [x] One deterministic owner read preserves fifteen dimension states, four isolated horizons, source clocks, provenance, limitations, and no action authority. → Evidence: [TP-01-01](report.md#tp-01-01)
- [x] The plan author remains powerless, bounded, source-qualified, subject-bound, generation-bound, and text-only. → Evidence: [TP-01-06](report.md#tp-01-06)
- [x] The Shared Infrastructure Impact Sweep, canaries, restore paths, Consumer Impact Sweep, and Change Boundary are satisfied. → Evidence: [Scope 01 implement-owned quality evidence](report.md#scope-01-implement-owned-quality-evidence)

#### Test Evidence Items — 8 rows, exact Test Plan parity

- [x] TP-01-01 proves SCN-028-005: Registry membership produces evidence rather than coverage text. The complete source bundle contains exactly one real company owner read and no coverage-only outcome. → Evidence: [TP-01-01](report.md#tp-01-01)
- [x] TP-01-02 proves SCN-028-006: Scheduled composition preserves Feature 025 semantics. It reports fifteen unique states, four isolated horizons, and no combined direction. → Evidence: [TP-01-02](report.md#tp-01-02)
- [x] TP-01-03 proves SCN-028-007 with missing and stale controls that cannot create a fresh claim. → Evidence: [TP-01-03](report.md#tp-01-03)
- [x] TP-01-04 proves SCN-028-008: A late source read is refused. The post-cutoff source is excluded from every horizon, and the refusal identifies the source and cutoff conflict. → Evidence: [TP-01-04](report.md#tp-01-04)
- [x] TP-01-05 proves SCN-028-009: A valid authored plan survives publication. It records author, authored time, subject, generation, horizon-scoped branches, source clocks at or before cutoff, and budget before embedding the plan in the candidate version. → Evidence: [TP-01-05](report.md#tp-01-05)
- [x] TP-01-06 proves SCN-028-010: Plan validation fails closed. Malformed, unsigned, cross-subject, late, and over-budget plans refuse the company candidate, do not relabel the prior plan as current, and publish no brief from the generation. → Evidence: [Scope 01 independent unit suite](report.md#scope-01-independent-unit-suite)
- [x] TP-01-07 proves the headless production CLI reaches the same contracts without granting publication authority. → Evidence: [Scope 01 independent process E2E](report.md#scope-01-independent-process-e2e)
- [x] TP-01-08 proves Feature 025 UMD behavior and v1 history remain compatible. → Evidence: [Scope 01 independent Feature 025 canary](report.md#scope-01-independent-feature-025-canary)

#### Regression and Change-Boundary Evidence

- [x] Scenario-specific E2E regression tests for every new/changed/fixed behavior pass through TP-01-07 without granting publication authority. → Evidence: [Scope 01 current-session TP-01-07 regression](report.md#scope-01-current-session-tp-01-07-regression)
- [x] Broader E2E regression suite passes for the Scope 01 foundation, Feature 025 compatibility, and source-lock canaries. → Evidence: [Scope 01 current-session broader regression](report.md#scope-01-current-session-broader-regression) and [Scope 01 current-session source-lock canary](report.md#scope-01-current-session-source-lock-canary)
- [x] Change Boundary is respected and zero excluded file families were changed. → Evidence: [Scope 01 current-session strict Change Boundary](report.md#scope-01-current-session-strict-change-boundary)

#### Build Quality Gate

- [x] The changed files parse, the category suites pass without skipped required checks, domain invariants correspond, and planning guards remain clean. → Evidence: [Scope 01 current-session Build Quality execution](report.md#scope-01-current-session-build-quality-execution)

## Scope 02: Coupled manifest, immutable promotion, and pointer-last success path

**Status:** Done
**Depends On:** Scope 01 foundation.  
**Scope-Kind:** runtime-behavior

**Consumer surface:** The production CLI command boundary exposes candidate assembly, promotion, and disk-coherence validation.

### Goal Contribution

Goal Contract revision 3 requires immutable versions before pointer advancement and one coherent generation across company and brief products. This scope implements the successful ordered transaction without exposing it publicly.

### Requirements Covered

FR-028-022 through FR-028-029 define generation identity, retries, predecessors, immutable history, pointer validation, one coupled manifest, and exact owner-read consumption.

### Gherkin Scenarios

#### SCN-028-011 — Same-day windows create distinct history

```gherkin
Scenario: Four daily windows do not collide
Given two successful publication windows occur on the same calendar date
When each creates its company version
Then the two versions have distinct generation identities
And each preserves its own cutoff and predecessor
And neither version overwrites the other
```

#### SCN-028-013 — A stale predecessor refuses publication

```gherkin
Scenario: Pointer drift breaks the candidate chain
Given the candidate names one predecessor
And the baseline pointer now names another version
When pointer advancement is evaluated
Then publication is refused
And the baseline pointer remains unchanged
And the brief candidate does not publish
```

#### SCN-028-014 — The pointer moves last

```gherkin
Scenario: Current changes only after all candidates validate
Given the immutable company version is durable
And the company owner read and complete brief candidate are valid
When the publication transaction reaches its final mutable step
Then the company pointer advances to that version
And a final coherence check proves both products name the same generation
```

#### SCN-028-021 — An unchanged conclusion still records the recreation

```gherkin
Scenario: Unchanged is an explicit new version
Given the new evidence produces the same four horizon directions as the predecessor
When the complete recreation succeeds
Then a new immutable version records the new generation and cutoff
And it identifies the predecessor
And it states that the conclusion is unchanged
```

### Implementation Plan

1. Add generation IDs that bind ET date, window, and generation-key digest.
2. Make `versionPathsFor()` derive immutable v2 paths while retaining historical v1 readability.
3. Add `company-brief-publication-manifest/v1` and `company-brief-current-pointer/v1` validation.
4. Extend `brief-publication.mjs` through additive primitives for declared inventories, staged hashes, pointer ordering, exact commit identity, and resume.
5. Write candidate company versions and content-addressed manifests before mutable pointers.
6. Re-read the baseline pointer before promotion and refuse predecessor drift.
7. Stage only declared non-pointer files, then subject pointers, brief pointers, and the coupled selector last.
8. Validate every version, pointer, owner read, brief object, manifest, projection, registry fingerprint, prior immutable hash, and inventory entry from disk.
9. Preserve identical candidate bytes for the same generation. Refuse divergent bytes at the same identity.
10. Record `changed`, `unchanged`, or `first` without suppressing a successful unchanged recreation.

### Implementation Files

The installed implementation discovery grammar normalizes text after `::`; `Node.js` is a language qualifier, not another path.

- `scripts/company-intelligence-publication.mjs::Node.js`
- `scripts/brief-publication.mjs::Node.js`
- `tests/company-intelligence-publication.integration.mjs::Node.js`
- `tests/company-intelligence-publication.e2e.mjs::Node.js`
- `tests/distributed-briefs.distributed-publish.unit.mjs::Node.js`

### Shared Infrastructure Impact Sweep

| Protected surface | Downstream contracts | Independent canary | Restore path |
| --- | --- | --- | --- |
| `scripts/brief-publication.mjs` | Existing brief object store, pointers, staging, commit trailers, resume, and distributed publication tests | TP-02-06 runs the existing distributed publication suite | Revert additive company manifest hooks without changing existing brief primitives |
| Pointer promotion order | Company pointer, brief pointers, coupled selector, Pages readers | TP-02-03 records every write and requires the selector as the final write | Restore the publication checkout index and every baseline pointer before commit |
| Immutable history paths | Feature 025 v1 history and new v2 versions | TP-02-01 and TP-02-04 hash predecessors before and after promotion | Never rewrite or delete an acknowledged object. Select an earlier validated manifest through a new pointer commit |

### Consumer Impact Sweep

- Keep existing brief manifest and pointer readers valid through additive fields.
- Keep Feature 025 v1 version and pointer readers valid.
- Bind the company owner read and final brief to the same tool-bundle fingerprint.
- Ensure browser projections consume the coupled selector rather than two loose latest pointers.
- Ensure staging, commit trailers, and resume logic use one declared inventory.

### Change Boundary

**Allowed file families:**

- `scripts/company-intelligence-publication.mjs` and `scripts/brief-publication.mjs`.
- Private candidate fixtures and Scope 02 tests.

**Excluded surfaces:**

- Trigger adapters, scheduler configuration, on-demand prompt, public registration, and Pages catalogue.
- Tracked publication data, Feature 025 artifacts, unrelated brief semantics, framework files, and the concurrent primary checkout.

### Test Plan

| Test Type | Test ID | Category | File/Location | Scenario | Exact test title | Command | Live System | Regression | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Integration | TP-02-01 | integration | `tests/company-intelligence-publication.integration.mjs` | SCN-028-011 | `Regression: SCN-028-011 same-day publication windows create distinct files in one predecessor chain` | `node --test tests/company-intelligence-publication.integration.mjs` | No — real temporary filesystem | Persistent | [TP-02-01](report.md#tp-02-01) |
| Integration mutation | TP-02-02 | integration | `tests/company-intelligence-publication.integration.mjs` | SCN-028-013 | `Mutation: SCN-028-013 pointer drift after freeze refuses the candidate and brief` | `node --test tests/company-intelligence-publication.integration.mjs` | No — real temporary filesystem | Persistent | [TP-02-02](report.md#tp-02-02) |
| Integration mutation | TP-02-03 | integration | `tests/company-intelligence-publication.integration.mjs` | SCN-028-014 | `Mutation: SCN-028-014 recorder proves the coupled selector is the final write` | `node --test tests/company-intelligence-publication.integration.mjs` | No — real temporary filesystem | Persistent | [TP-02-03](report.md#tp-02-03) |
| Integration | TP-02-04 | integration | `tests/company-intelligence-publication.integration.mjs` | SCN-028-021 | `Regression: SCN-028-021 unchanged horizon directions still append a distinct immutable version` | `node --test tests/company-intelligence-publication.integration.mjs` | No — real temporary filesystem | Persistent | [TP-02-04](report.md#tp-02-04) |
| Process E2E | TP-02-05 | functional | `tests/company-intelligence-publication.e2e.mjs` | SCN-028-011, SCN-028-013, SCN-028-014, SCN-028-021 | `Regression E2E: Scope 02 production CLI promotes one coherent generation and rejects illegal phase transitions` | `node --test tests/company-intelligence-publication.e2e.mjs` | Yes — production CLI in a real temporary Git checkout | Persistent | [TP-02-05](report.md#tp-02-05) |
| Shared primitive canary | TP-02-06 | unit | `tests/distributed-briefs.distributed-publish.unit.mjs` | SCN-028-014 | `Regression canary: distributed brief publication primitives preserve content addressing and pointer-last behavior` | `node --test tests/distributed-briefs.distributed-publish.unit.mjs` | No | Existing plus additive | [TP-02-06](report.md#tp-02-06) |

### Definition of Done — Tiered Validation

#### Core Outcomes

- [x] Generation, version, manifest, pointer, and content identities are deterministic, additive, and collision-safe. → Evidence: [Scope 02 deterministic identity, collision, and resume](report.md#scope-02-deterministic-identity-collision-and-resume)
- [x] Candidate versions and manifests become durable before subject, brief, and coupled pointers move in the declared order. → Evidence: [Scope 02 durability and pointer order](report.md#scope-02-durability-and-pointer-order)
- [x] Disk coherence validates every referenced byte, prior immutable hash, registry fingerprint, and matching brief source read. → Evidence: [Scope 02 on-disk coherence](report.md#scope-02-on-disk-coherence)
- [x] The Shared Infrastructure Impact Sweep, canaries, restore paths, Consumer Impact Sweep, and Change Boundary are satisfied. → Evidence: [Scope 02 shared impact, consumers, restore contract, and boundary](report.md#scope-02-shared-impact-consumers-restore-contract-and-boundary)

#### Test Evidence Items — 6 rows, exact Test Plan parity

- [x] TP-02-01 proves SCN-028-011, Four daily windows do not collide: two successful same-day publication windows create versions with distinct generation identities, preserve their own cutoffs and predecessors, and overwrite neither version. → Evidence: [TP-02-01](report.md#tp-02-01)
- [x] TP-02-02 proves SCN-028-013, Pointer drift breaks the candidate chain: a candidate whose named predecessor differs from the baseline pointer is refused, the baseline pointer remains unchanged, and the brief candidate does not publish. → Evidence: [TP-02-02](report.md#tp-02-02)
- [x] TP-02-03 proves SCN-028-014, Current changes only after all candidates validate: after the immutable company version is durable and the company owner read and complete brief candidate are valid, the company pointer advances as the final mutable step and a final coherence check proves both products name the same generation. → Evidence: [TP-02-03](report.md#tp-02-03)
- [x] TP-02-04 proves SCN-028-021 by appending a distinct immutable version with an explicit unchanged conclusion. → Evidence: [TP-02-04](report.md#tp-02-04)
- [x] TP-02-05 proves the production CLI success path and every illegal state transition through a real temporary Git checkout. → Evidence: [TP-02-05](report.md#tp-02-05)
- [x] TP-02-06 proves existing distributed brief primitives retain content addressing and pointer-last behavior. → Evidence: [TP-02-06](report.md#tp-02-06)

#### Regression and Change-Boundary Evidence

- [x] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior pass through TP-02-05. → Evidence: [TP-02-05](report.md#tp-02-05)
  > **Phase:** test
  > **Claim Source:** executed
  > **Current execution:** [Scope 02 scenario-specific process E2E](report.md#scenario-specific-tp-02-05-process-e2e)
- [x] Broader E2E regression suite passes through the complete TP-02-05 production CLI process-E2E file. → Evidence: [TP-02-05](report.md#tp-02-05)
  > **Phase:** test
  > **Claim Source:** executed
  > **Current execution:** [Scope 02 broader process E2E](report.md#broader-tp-02-05-process-e2e-file)

#### Build Quality Gate

- [x] The changed files parse, focused and canary suites pass, immutable-history scans remain clean, and no undeclared staged path exists. → Evidence: [Scope 02 final implement-owned Build Quality](report.md#scope-02-final-implement-owned-build-quality)

## Scope 03: Whole-transaction restoration and non-authoritative outcomes

**Status:** In Progress
**Depends On:** Scope 02.  
**Scope-Kind:** runtime-behavior

**Consumer surface:** The production CLI command boundary exposes abort, dry-run, push-resume, and acknowledgment-reconciliation outcomes.

### Goal Contribution

Goal Contract revision 3 forbids one-sided company or brief publication. This scope makes every pre-commit failure, dry run, and covered-set refusal preserve the last acknowledged pair.

### Requirements Covered

FR-028-030 through FR-028-034 define bidirectional restoration, covered-set atomicity, commit and acknowledgment handling, and byte-identical non-authoritative outcomes. FR-028-036 also requires the prior dated version to remain authoritative when refresh fails.

### Gherkin Scenarios

#### SCN-028-015 — Company success and brief failure restore both sides

```gherkin
Scenario: A valid company candidate cannot escape a failed brief
Given all company candidates validate
And final brief validation fails
When the transaction aborts
Then every current company pointer keeps its baseline value
And unpublished company candidates are removed from the working transaction
And all acknowledged brief artifacts keep their baseline bytes
```

#### SCN-028-016 — Brief success and company failure restore both sides

```gherkin
Scenario: A valid brief candidate cannot escape a failed company publication
Given the final brief candidate validates
And a company candidate or pointer validation fails
When the transaction aborts
Then the final brief does not become authoritative
And no company pointer advances
And the previous acknowledged pair remains current
```

#### SCN-028-017 — One covered-subject failure aborts the set

```gherkin
Scenario: Covered companies publish as one set
Given more than one covered subject is configured
And one subject fails composition or validation
When the transaction evaluates the covered-subject set
Then no covered-subject pointer advances
And no brief artifact from that generation publishes
And the failed subject is identified by name
```

#### SCN-028-022 — A dry run leaves no publication mutation

```gherkin
Scenario: Dry-run inspection is non-authoritative
Given the operator requests a dry run
When candidate composition and validation finish
Then no current company pointer changes
And no acknowledged brief artifact changes
And no candidate becomes a published version
```

### Implementation Plan

1. Split candidate composition from publication promotion through two clean checkouts at one verified base commit.
2. Capture byte hashes, Git index state, remote refs, company pointers, brief pointers, selectors, and immutable prefixes before mutation.
3. Restore both checkouts and all mutable baselines for every failure before a successful local commit.
4. Remove unpublished checkout material while retaining validated private retry checkpoints.
5. Abort the whole generation when any covered subject fails. Name the failed subject in the safe error envelope.
6. Preserve a local committed generation when push fails. Retry only that exact commit.
7. Classify ambiguous push results as `remote-outcome-unknown`. Block new generations until remote ancestry resolves the outcome.
8. Treat remote reachability as authority when private acknowledgment persistence fails. Reconstruct the private receipt from remote ancestry.
9. Keep dry-run work inside private checkouts through coherence validation, then remove it without tracked or remote mutation.
10. Sanitize public and private attempt records. Exclude authored rejection text, private paths, operator identity, portfolio data, and credentials.

### Implementation Files

The installed implementation discovery grammar normalizes text after `::`; `Node.js` is a language qualifier, not another path.

- `scripts/brief-publication.mjs::Node.js`
- `scripts/company-intelligence-publication.mjs::Node.js`
- `tests/brief-refresh-atomicity.support.mjs::Node.js`
- `tests/brief-refresh-atomicity.test.mjs::Node.js`
- `tests/company-intelligence-publication.e2e.mjs::Node.js`
- `tests/company-intelligence-publication.integration.mjs::Node.js`
- `tests/distributed-briefs.distributed-publish.unit.mjs::Node.js`

### Shared Infrastructure Impact Sweep

| Protected surface | Downstream contracts | Independent canary | Restore path |
| --- | --- | --- | --- |
| `scripts/brief-refresh-and-push.sh` | Existing brief refresh, author, payload, staging, commit, push, and baseline restoration | TP-03-06 runs the existing atomicity suite against the expanded owned set | Restore the exact captured baseline before commit. Preserve an exact local commit after commit success |
| Atomicity fixture and support module | Existing failure injection, Git setup, tracked-path inventory, and process cleanup | TP-03-01 through TP-03-05 assert independent filesystem and Git outcomes | Recreate each isolated temporary repository from a clean fixture. Never mutate a shared working tree |
| Covered-subject barrier | One committed MSFT policy and synthetic multi-subject fault proof | TP-03-03 creates the second subject only inside the test repository | Keep the committed subject SST unchanged and discard the isolated test repository |

### Consumer Impact Sweep

- Preserve every existing brief-owned baseline and expand restoration to the declared company inventory.
- Preserve the difference between local commit, remote reachability, private acknowledgment, and Pages deployment.
- Keep public attempt diagnostics separate from pair authority.
- Keep failed and dry-run candidates out of public history and current selectors.
- Keep a prior acknowledged pair readable after every fault branch.

### Change Boundary

**Allowed file families:**

- Company publication, brief publication, and shared transaction worker modules.
- Atomicity support, atomicity tests, and Scope 03 tests.

**Excluded surfaces:**

- Public registration, scheduler adapters, prompt adapters, and tracked publication artifacts.
- Committed subject expansion, Feature 025 artifacts, unrelated brief semantics, framework files, and the concurrent primary checkout.

### Test Plan

| Test Type | Test ID | Category | File/Location | Scenario | Exact test title | Command | Live System | Regression | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Integration fault | TP-03-01 | integration | `tests/company-intelligence-publication.integration.mjs` | SCN-028-015 | `Regression: SCN-028-015 brief validation failure removes company candidates and restores both baselines` | `node --test tests/company-intelligence-publication.integration.mjs` | No — real temporary filesystem | Persistent | [TP-03-01](report.md#tp-03-01) |
| Integration fault | TP-03-02 | integration | `tests/company-intelligence-publication.integration.mjs` | SCN-028-016 | `Regression: SCN-028-016 company validation failure with a valid brief restores both baselines` | `node --test tests/company-intelligence-publication.integration.mjs` | No — real temporary filesystem | Persistent | [TP-03-02](report.md#tp-03-02) |
| Integration mutation | TP-03-03 | integration | `tests/company-intelligence-publication.integration.mjs` | SCN-028-017 | `Mutation: SCN-028-017 one failing subject aborts a synthetic two-subject covered set` | `node --test tests/company-intelligence-publication.integration.mjs` | No — isolated multi-subject test repository | Persistent | [TP-03-03](report.md#tp-03-03) |
| Process E2E | TP-03-04 | functional | `tests/company-intelligence-publication.e2e.mjs` | SCN-028-022 | `Regression E2E: SCN-028-022 dry run reaches coherence and leaves repository index pointers artifacts and remote byte-identical` | `node --test tests/company-intelligence-publication.e2e.mjs` | Yes — production CLI with real Git and bare remote | Persistent | [TP-03-04](report.md#tp-03-04) |
| Process E2E fault matrix | TP-03-05 | functional | `tests/company-intelligence-publication.e2e.mjs` | SCN-028-015, SCN-028-016, SCN-028-022 | `Regression E2E: commit failure restores pre-commit state while push and acknowledgment ambiguity preserve the exact classified commit` | `node --test tests/company-intelligence-publication.e2e.mjs` | Yes — production CLI with real Git and bare remote | Persistent | [TP-03-05](report.md#tp-03-05) |
| Shared transaction canary | TP-03-06 | functional | `tests/brief-refresh-atomicity.test.mjs` | SCN-028-015 and SCN-028-016 | `Regression canary: existing brief atomicity restores every prior owned path under coupled fault injection` | `node --test tests/brief-refresh-atomicity.test.mjs` | Yes — production worker in isolated temporary repositories | Existing plus additive | [TP-03-06](report.md#tp-03-06) |

### Definition of Done — Tiered Validation

#### Core Outcomes

- [x] Every company-side, brief-side, covered-set, commit, and dry-run failure leaves the prior acknowledged pair authoritative. → Evidence: [Scope 03 contract audit and repair](report.md#scope-03-contract-audit-and-repair)
- [x] Push and acknowledgment branches preserve honest remote authority and exact-resume semantics without recreating a generation. → Evidence: [Scope 03 exact commit and remote authority](report.md#scope-03-exact-commit-and-remote-authority)
- [x] Attempt records expose safe state and cause codes without granting pair authority or leaking private data. → Evidence: [Scope 03 attempt safety and authority separation](report.md#scope-03-attempt-safety-and-authority-separation)
- [x] The Shared Infrastructure Impact Sweep, canaries, restore paths, Consumer Impact Sweep, and Change Boundary are satisfied. → Evidence: [Scope 03 final implement quality gates](report.md#scope-03-final-implement-quality-gates)
- [x] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior pass for SCN-028-015, SCN-028-016, SCN-028-017, and SCN-028-022. → Evidence: [Scope 03 implement scenario-binding remediation](report.md#current-implement-scenario-receipts)
  > **Phase:** implement
  > **Claim Source:** executed
- [x] Broader E2E regression suite passes for the complete Scope 03 production CLI process-E2E file with no collateral failure. → Evidence: [Scope 03 exact commit and remote authority](report.md#scope-03-exact-commit-and-remote-authority)

#### Test Evidence Items — 6 rows, exact Test Plan parity

- [x] TP-03-01 proves SCN-028-015, A valid company candidate cannot escape a failed brief. All company candidates validate, but final brief validation fails. The transaction aborts. Every current company pointer keeps its baseline value. Unpublished company candidates leave the working transaction. All acknowledged brief artifacts keep their baseline bytes. → Evidence: [TP-03-01](report.md#tp-03-01)
- [x] TP-03-02 proves SCN-028-016, A valid brief candidate cannot escape a failed company publication. The final brief candidate validates, but a company candidate or pointer validation fails. The transaction aborts. The final brief does not become authoritative. No company pointer advances. The previous acknowledged pair remains current. → Evidence: [TP-03-02](report.md#tp-03-02)
- [x] TP-03-03 proves SCN-028-017, Covered companies publish as one set. More than one covered subject is configured, but one subject fails composition or validation. The transaction evaluates the covered-subject set. No covered-subject pointer advances. No brief artifact from that generation publishes. The failed subject is identified by name. → Evidence: [TP-03-03](report.md#tp-03-03)
- [x] TP-03-04 proves SCN-028-022, Dry-run inspection is non-authoritative. The operator requests a dry run. Candidate composition and validation finish. No current company pointer changes. No acknowledged brief artifact changes. No candidate becomes a published version. → Evidence: [TP-03-04](report.md#tp-03-04)
- [x] TP-03-05 proves commit restoration, exact local-commit retention, push classification, and remote-ancestry acknowledgment recovery. → Evidence: [TP-03-05](report.md#tp-03-05)
- [x] TP-03-06 proves the existing brief atomicity contract survives the expanded transaction inventory. → Evidence: [TP-03-06](report.md#tp-03-06)

#### Build Quality Gate

- [x] The changed files parse, isolated fault suites clean their resources, restoration hashes match, and the broad transaction canary passes. → Evidence: [Scope 03 final implement quality gates](report.md#scope-03-final-implement-quality-gates)

## Scope 04: Scheduled and on-demand shared trigger integration

**Status:** Not Started  
**Depends On:** Scope 03.  
**Scope-Kind:** runtime-behavior.

**Consumer surface:** The shared production CLI command accepts scheduled and on-demand trigger requests through one launcher.

### Goal Contribution

Goal Contract revision 3 requires every complete scheduled and on-demand recreation to use the same company-and-brief contract. This scope connects both triggers to one exact-resume launcher and worker.

### Requirements Covered

FR-028-003, FR-028-004, FR-028-006, FR-028-009, FR-028-010, FR-028-015, FR-028-028, FR-028-029, FR-028-033, and FR-028-035 become one executable trigger path. The scope preserves the refusal behavior from FR-028-030 through FR-028-034.

### Gherkin Scenarios

#### SCN-028-003 — A scheduled recreation refreshes the covered company

```gherkin
Scenario: A scheduled brief and company read publish together
Given a scheduled publication window is due
And company:msft is the only covered subject
When the complete recreation succeeds
Then one new immutable MSFT company version is published
And the final brief consumes the owner read derived from that version
And the brief and company pointer identify one publication generation
```

#### SCN-028-004 — An on-demand recreation has the same result

```gherkin
Scenario: On-demand publication cannot use a weaker path
Given the operator requests a declared brief window on demand
When the complete recreation succeeds
Then it refreshes company:msft before final publication
And it applies the same validation and rollback rules as a scheduled run
And it acknowledges one coupled publication
```

#### SCN-028-012 — A retry is idempotent

```gherkin
Scenario: Retrying one logical generation does not fork history
Given a generation failed before acknowledgment
When the same logical generation is retried with the same frozen inputs
Then it resolves to the same candidate identity
And it does not create a divergent duplicate version
And one successful acknowledgment closes the generation
```

#### SCN-028-019 — Registry drift after freeze aborts publication

```gherkin
Scenario: The source set cannot change or become cyclic during a generation
Given the source registry and source fingerprints were frozen
And the company candidate may consume pre-final source reads only
And a participant, order, count, fingerprint, or dependency changes before publication
When the final bundle validates
Then the generation is refused
And a company read that depends on itself or the final brief is refused
And no company pointer or brief artifact advances
```

### Implementation Plan

1. Extend `scripts/brief-refresh-scheduled.sh` into the one shared isolated launcher for both trigger types.
2. Persist a scheduled generation key or on-demand UUID before source work.
3. Acquire one branch-level publication lease and reject or resume a duplicate logical generation.
4. Create candidate and publication checkouts from one verified remote base commit.
5. Drive the full eighteen-phase state machine through `scripts/brief-refresh-and-push.sh`.
6. Make the launchd template pass `--trigger scheduled --due-only` explicitly.
7. Convert `.github/prompts/market-brief-update.prompt.md` into a thin caller with an explicit window.
8. Keep the prompt free of payload, history, configuration, registry, and Git write instructions.
9. Recheck the frozen registry, source order, source count, participant metadata, fingerprints, cutoff, and source-cycle exclusions before final authorship.
10. Resume validated checkpoints without reacquiring evidence or reinvoking a validated author.
11. Resume a committed generation by pushing its exact commit and no other phase.
12. Emit safe phase lines with attempt, generation, phase, and closed outcome codes.

### Shared Infrastructure Impact Sweep

| Protected surface | Downstream contracts | Independent canary | Restore path |
| --- | --- | --- | --- |
| `scripts/brief-refresh-scheduled.sh` | launchd schedule, due-window resolution, locks, isolated checkouts, process cleanup, and scheduler tests | TP-04-05 runs unit, integration, failure, and process suites for the existing scheduler | Revert trigger-adapter parsing while retaining the original scheduled command behavior |
| `.github/prompts/market-brief-update.prompt.md` | on-demand operator entry and publication authority | TP-04-02 compares both triggers through one worker phase history | Restore the prompt to a non-writing invocation of the shared launcher. Never restore manual Git authorship |
| `scripts/brief-refresh-and-push.sh` | all brief-owned transaction behavior plus the new company inventory | TP-04-06 reruns the independent brief atomicity suite after launcher integration | Restore the exact captured baseline before commit or preserve the exact committed generation for push resume |

### Consumer Impact Sweep

- Update the launchd template, scheduler entry, on-demand prompt, worker option parser, and tests together.
- Preserve existing window IDs, due-only behavior, branch configuration, lock behavior, and private status location.
- Preserve final-brief author and distributed bundle inputs except for the validated company owner read.
- Keep source counts registry-derived. Do not add a literal expected count.
- Keep remote acknowledgment distinct from successful local commit and Pages deployment.

### Change Boundary

**Allowed file families:**

- Shared launcher, worker, launchd template, and on-demand prompt.
- Prior publication modules, scheduler tests, atomicity tests, and Scope 04 tests.

**Excluded surfaces:**

- Public registration, Company and Market Action UI, Pages catalogue, and production snapshots.
- Feature 025 artifacts, unrelated tools, brief decision semantics, framework files, and the concurrent primary checkout.

### Test Plan

| Test Type | Test ID | Category | File/Location | Scenario | Exact test title | Command | Live System | Regression | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Process E2E | TP-04-01 | functional | `tests/company-intelligence-publication.e2e.mjs` | SCN-028-003 | `Regression E2E: SCN-028-003 scheduled publication commits one MSFT version and its consuming brief` | `node --test tests/company-intelligence-publication.e2e.mjs` | Yes — shared launcher, real Git, and bare remote | Persistent | [TP-04-01](report.md#tp-04-01) |
| Process E2E | TP-04-02 | functional | `tests/company-intelligence-publication.e2e.mjs` | SCN-028-004 | `Regression E2E: SCN-028-004 on-demand and scheduled triggers execute the same phase and acknowledgment contract` | `node --test tests/company-intelligence-publication.e2e.mjs` | Yes — both trigger adapters, real Git, and bare remote | Persistent | [TP-04-02](report.md#tp-04-02) |
| Process E2E | TP-04-03 | functional | `tests/company-intelligence-publication.e2e.mjs` | SCN-028-012 | `Regression E2E: SCN-028-012 identical retry resumes one remote generation and refuses divergent content` | `node --test tests/company-intelligence-publication.e2e.mjs` | Yes — shared launcher, journal, real Git, and bare remote | Persistent | [TP-04-03](report.md#tp-04-03) |
| Functional mutation | TP-04-04 | functional | `tests/company-intelligence-publication.functional.mjs` | SCN-028-019 | `Mutation: SCN-028-019 registry order fingerprint participant and dependency cycle drift each abort publication` | `node --test tests/company-intelligence-publication.functional.mjs` | No — production commands with isolated fixtures | Persistent | [TP-04-04](report.md#tp-04-04) |
| Scheduler canary matrix | TP-04-05 | functional | `tests/distributed-briefs.scheduler.unit.mjs`, `tests/distributed-briefs.scheduler.integration.mjs`, `tests/distributed-briefs.scheduler-failures.integration.mjs`, `tests/distributed-briefs.scheduler.e2e.mjs` | SCN-028-003 and SCN-028-004 | `Regression canary: existing due windows locks failures and scheduler process behavior remain intact` | `node --test tests/distributed-briefs.scheduler.unit.mjs tests/distributed-briefs.scheduler.integration.mjs tests/distributed-briefs.scheduler-failures.integration.mjs tests/distributed-briefs.scheduler.e2e.mjs` | Yes — scheduler process tests use isolated Git repositories | Existing plus additive | [TP-04-05](report.md#tp-04-05) |
| Transaction canary rerun | TP-04-06 | functional | `tests/brief-refresh-atomicity.test.mjs` | SCN-028-003 and SCN-028-004 | `Regression canary: brief atomicity remains intact after shared launcher and worker integration` | `node --test tests/brief-refresh-atomicity.test.mjs` | Yes — production worker in isolated temporary repositories | Rerun after trigger call-graph change | [TP-04-06](report.md#tp-04-06) |

### Definition of Done — Tiered Validation

#### Core Outcomes

- [ ] Scheduled and on-demand requests differ only in trigger identity fields and use one phase, validation, restoration, commit, and acknowledgment path.
- [ ] Exact checkpoint and commit resume never reacquire frozen evidence, reinvoke a validated author, or fork one generation.
- [ ] Registry and dependency drift refuse before authority changes and name the changed boundary.
- [ ] The Shared Infrastructure Impact Sweep, canaries, restore paths, Consumer Impact Sweep, and Change Boundary are satisfied.

#### Test Evidence Items — 6 rows, exact Test Plan parity

- [ ] TP-04-01 proves SCN-028-003 through the shared launcher, complete transaction, and real bare remote. → Evidence: [TP-04-01](report.md#tp-04-01)
- [ ] TP-04-02 proves SCN-028-004 with matching scheduled and on-demand phase, manifest, restoration, and acknowledgment contracts. → Evidence: [TP-04-02](report.md#tp-04-02)
- [ ] TP-04-03 proves SCN-028-012 with one exact retry identity, one remote generation, and divergent-content refusal. → Evidence: [TP-04-03](report.md#tp-04-03)
- [ ] TP-04-04 proves SCN-028-019 by mutating participant, order, count, fingerprint, self-source, and final-brief dependency. → Evidence: [TP-04-04](report.md#tp-04-04)
- [ ] TP-04-05 proves existing scheduler windows, locks, failures, cleanup, and process behavior remain intact. → Evidence: [TP-04-05](report.md#tp-04-05)
- [ ] TP-04-06 proves brief atomicity after the launcher and worker call graph changes. → Evidence: [TP-04-06](report.md#tp-04-06).

#### Build Quality Gate

- [ ] The changed scripts parse, focused trigger suites pass, process cleanup is complete, atomicity remains green, and no weaker on-demand write path remains.

## Scope 05: Public registration, authority-aware UI, and Pages delivery

**Status:** Not Started  
**Depends On:** Scope 04.  
**Scope-Kind:** runtime-behavior

### Goal Contribution

Goal Contract revision 3 requires a reachable source tool whose public company read and final brief prove one acknowledged generation. This scope activates registration only after the real owner read and coupled transaction pass their gates.

### Requirements Covered

FR-028-001 through FR-028-005 establish public reachability and fail-closed packaging. FR-028-036 through FR-028-038 establish honest stale state, cross-page identity, privacy, and educational authority.

### Gherkin Scenarios

#### SCN-028-001 — The public reader can reach Company Intelligence

```gherkin
Scenario: Registration and navigation agree on the live company tool
Given a coupled publication has been acknowledged
When a reader uses the landing catalogue or shared navigation
Then Company Intelligence appears exactly once on each surface
And both entries open the same registered route
And the route's notes target is reachable
```

#### SCN-028-002 — A stale exclusion blocks public delivery

```gherkin
Scenario: Registration cannot coexist with an exclusion
Given the company route is registered as live
And any company production artifact remains excluded
When public packaging is evaluated
Then publication is refused
And the refusal names the stale exclusion
```

#### SCN-028-018 — The prior company read cannot masquerade as fresh

```gherkin
Scenario: A failed refresh leaves an honestly dated prior read
Given the current company pointer names an older acknowledged version
And the new recreation cannot produce a valid candidate
When the recreation ends
Then it refuses publication
And the prior version remains visibly dated
And no current or fresh label is assigned to that prior version
```

#### SCN-028-020 — The route remains independent and safe

```gherkin
Scenario: Public delivery needs no private state or infrastructure
Given a reader has no key, account, proxy, or server
When the reader opens the packaged company route from a local file
Then the route paints from committed data
And missing live inputs remain named as unavailable
And no committed artifact contains holdings, cost basis, profit, loss, or credentials
```

### UI Scenario Matrix

| Scenario | Preconditions | User steps | Visible or accessible result | Primary test |
| --- | --- | --- | --- | --- |
| SCN-028-001 | One acknowledged coupled publication and coherent registry | Search or browse catalogue, open navigation, open tool, open notes | One card, one nav item, one route, one notes target, and `aria-current` on the route | TP-05-01 |
| SCN-028-002 | Live registration plus one mutated exclusion | Run the public package evaluator | Named refusal appears and no incomplete package is accepted | TP-05-02 |
| SCN-028-018 | A failed attempt follows an older acknowledged pair | Open Company Intelligence and inspect both status bands | The failure band names the attempt while the dated pair retains stale authority | TP-05-03 |
| SCN-028-020 | No key, account, proxy, or server is available | Open the packaged route from `file://` and navigate its read | Committed pair and four horizons paint before reconciliation, with an unavailable live layer and no private fields | TP-05-04 |
| Cross-page identity | Current brief contains the exact company owner read | Open Market Action Power, open the company row, then return | Both routes retain one generation and version identity without recomputing company math | TP-05-06 |
| Responsive and accessible reading | Current pair, failure state, long identities, and missing dimensions exist | Use keyboard, reduced motion, 320 CSS px, and 200 percent zoom | State words, reasons, clocks, focus order, disclosures, and provenance remain available without body-level horizontal scroll | TP-05-06 |

### Implementation Plan

1. Produce one validated acknowledged company-and-brief generation from the shared transaction before registering the source.
2. Add the exact Company Intelligence entry to `tools.json`, `index.html`, and `rlnav.js` in the designed order.
3. Add the shared Simple model, two read-only journeys, adapter allowlist row, and one brief mount.
4. Add `rlexperience-adapters/company-intelligence.js` as a projection of the acknowledged read with no company math.
5. Remove exactly the route, composer, and config exclusions from `site-exclusions.json`.
6. Replace Feature 025 no-registration assertions with positive successor guards in `scripts/selftest.mjs`.
7. Generate `data/company-intelligence/publication-current.js` through double JSON encoding and deep freezing.
8. Make `company-intelligence-lab.html` separate acknowledged pair, latest attempt, and transient local composition states.
9. Preserve four peer horizons in Simple and move lineage, fingerprints, coverage, plan, and sources to Power.
10. Add the generation-specific company row to the existing Market Action Power evidence drawer through `rlbrief.js`.
11. Validate query values before generating reciprocal company and brief deep links.
12. Add the committed-first-paint capability marker. Preserve the stricter HTTP notice for unmarked pages.
13. Update `README.md`, `notes/README.md`, and `notes/company-intelligence-lab.md` to match delivered registration and validation commands.
14. Build `_site` and verify every selector-referenced version, manifest, owner read, brief object, adapter, note, config, and route exists.
15. Scan the complete public inventory and safe diagnostics for credential, account, portfolio, operator, private-path, and action-authority fields.

### Shared Infrastructure Impact Sweep

| Protected surface | Downstream contracts | Independent canary | Restore path |
| --- | --- | --- | --- |
| `tools.json`, `index.html`, and `rlnav.js` | Registry order, discovery, search, navigation, source freeze, and Pages inventory | TP-05-01 and TP-05-07 assert mirror parity and real source wiring | Revert all three registration mirrors and restore all three exclusions in one code rollback |
| `rlbrief.js` and `market-brief.html` | Existing scorecard, attention, recommendation, evidence drawer, and deep links | TP-05-06 reruns current route and discovery browser suites with exact company-row assertions | Remove only the company detail renderer and row while preserving existing brief semantics |
| Pages build and exclusions | Root package, adapters, notes, data, brief graph, and local-file links | TP-05-02 and TP-05-05 mutate exclusions and inspect the built `_site` tree | Revert registration and package inputs through Git. Keep acknowledged immutable data objects |
| Company route controller | Existing Feature 025 Simple, Power, subject control, horizons, sources, and browser composition | TP-05-06 reruns the existing route suite and authority-separation regression | Remove pair and attempt projection rendering while preserving existing Feature 025 route behavior |

### Consumer Impact Sweep

| Consumer | Required result |
| --- | --- |
| Registry mirrors | ID, title, file, notes, group, order, label, icon, data, status, and update date agree |
| Shared experience registries | One Simple model, two journeys, one allowed adapter, and one brief mount agree |
| Market Brief registry freeze | Source count grows from registry membership without a literal count change |
| Tool bundle | Company outcome is `newly-authored`, real, valid, and exactly once |
| Market Action evidence drawer | Company row renders version, generation, cutoff, fingerprint, coverage, horizons, limitations, and exact link |
| Company route | Pair, attempt, transient composition, reciprocal brief link, lineage, and four horizons retain distinct authority |
| Documentation indexes | Root and notes indexes expose the same live route and notes target |
| Site exclusions | All three old company exclusions are absent |
| Pages package | Every registered dependency and selector-referenced object is present |
| Feature 025 tests | Old exclusion assertions are replaced by positive successor guards while v1 behavior remains green |
| Prompt and scheduler | Both already call the shared transaction from Scope 04 |
| Existing brief semantics | Scorecard, attention, recommendation, and narrative policy remain unchanged |

### Change Boundary

**Allowed file families:**

- Public registry mirrors, shared experience registries, Company and Market Action route files, and the new adapter.
- Site exclusions, Pages inputs, Feature 028 publication artifacts, notes, domain model, selftest, and Scope 05 tests.

**Excluded surfaces:**

- Feature 025 artifacts, unrelated tools, notes, and Market Action decision semantics.
- Unapproved companies, providers, accounts, services, deployment topology, framework files, and the concurrent primary checkout.

### Test Plan

| Test Type | Test ID | Category | File/Location | Scenario | Exact test title | Command | Live System | Regression | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| E2E UI | TP-05-01 | e2e-ui | `tests/company-intelligence-publication.spec.mjs` | SCN-028-001 | `Regression: SCN-028-001 Company Intelligence is reachable once from catalogue navigation and notes` | `npx --no-install playwright test tests/company-intelligence-publication.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-028-001 Company Intelligence is reachable once from catalogue navigation and notes" --reporter=list` | Yes — real browser and route | Persistent | [TP-05-01](report.md#tp-05-01) |
| Functional mutation | TP-05-02 | functional | `tests/company-intelligence-publication.functional.mjs` | SCN-028-002 | `Mutation: SCN-028-002 a registered company artifact with one stale exclusion is refused` | `node --test tests/company-intelligence-publication.functional.mjs` | No — production package evaluator and isolated mutations | Persistent | [TP-05-02](report.md#tp-05-02) |
| E2E UI | TP-05-03 | e2e-ui | `tests/company-intelligence-publication.spec.mjs` | SCN-028-018 | `Regression: SCN-028-018 failed refresh keeps the dated acknowledged pair visibly authoritative` | `npx --no-install playwright test tests/company-intelligence-publication.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-028-018 failed refresh keeps the dated acknowledged pair visibly authoritative" --reporter=list` | Yes — real browser and route | Persistent | [TP-05-03](report.md#tp-05-03) |
| E2E UI | TP-05-04 | e2e-ui | `tests/company-intelligence-publication.spec.mjs` | SCN-028-020 | `Regression: SCN-028-020 file origin paints the committed pair before reconciliation and exposes no private state` | `npx --no-install playwright test tests/company-intelligence-publication.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-028-020 file origin paints the committed pair before reconciliation and exposes no private state" --reporter=list` | Yes — real browser at `file://` | Persistent | [TP-05-04](report.md#tp-05-04) |
| Pages E2E | TP-05-05 | e2e-ui | `tests/company-intelligence-publication.spec.mjs` | SCN-028-001, SCN-028-002, SCN-028-020 | `Regression: Company Intelligence and every acknowledged pair dependency exist in the built Pages artifact` | `node scripts/build-pages-site.mjs && npx --no-install playwright test tests/company-intelligence-publication.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: Company Intelligence and every acknowledged pair dependency exist in the built Pages artifact" --reporter=list` | Yes — built `_site` and real browser | Persistent | [TP-05-05](report.md#tp-05-05) |
| UI and consumer canary | TP-05-06 | e2e-ui | `tests/company-intelligence-publication.spec.mjs`, `tests/company-intelligence-lab.spec.mjs`, `tests/tool-discovery.spec.mjs`, `tests/deployed-site-parity.spec.mjs` | SCN-028-001, SCN-028-018, SCN-028-020 | `Regression: acknowledged pair attempt state deep links accessibility and responsive behavior preserve existing route semantics` | `npx --no-install playwright test tests/company-intelligence-publication.spec.mjs tests/company-intelligence-lab.spec.mjs tests/tool-discovery.spec.mjs tests/deployed-site-parity.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes — real browser and current routes | Existing plus additive | [TP-05-06](report.md#tp-05-06) |
| Contract and parity validators | TP-05-07 | functional | `scripts/validate-tool-experience.mjs`, `scripts/validate-brief-payload.mjs`, `scripts/selftest.mjs` | SCN-028-001, SCN-028-002, SCN-028-018 | `Repository parity: company registration exclusions experience bundle and brief identity agree` | `node scripts/validate-tool-experience.mjs && node scripts/validate-brief-payload.mjs && node scripts/selftest.mjs` | No | Persistent | [TP-05-07](report.md#tp-05-07) |
| Broader regression | TP-05-08 | functional and e2e-ui | `tests/*.unit.mjs`, `tests/*.integration.mjs`, `tests/*.functional.mjs`, `tests/*.test.mjs`, `tests/company-intelligence-publication.spec.mjs`, `tests/company-intelligence-lab.spec.mjs`, `tests/tool-discovery.spec.mjs`, `tests/deployed-site-parity.spec.mjs` | SCN-028-001 through SCN-028-022 | `Final regression: all Node categories and the complete Company Intelligence publication browser set pass on one unchanged tree` | `node --test tests/*.unit.mjs && node --test tests/*.integration.mjs && node --test tests/*.functional.mjs && node --test tests/*.test.mjs && npx --no-install playwright test tests/company-intelligence-publication.spec.mjs tests/company-intelligence-lab.spec.mjs tests/tool-discovery.spec.mjs tests/deployed-site-parity.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes — process and browser closure | Broad persistent closure | [TP-05-08](report.md#tp-05-08) |

### Definition of Done — Tiered Validation

#### Core Outcomes

- [ ] Registration occurs only with one real company owner read, one coherent coupled selector, and one acknowledged generation.
- [ ] Registry, catalogue, navigation, experience, notes, exclusions, package, Company route, and Market Action consumer agree.
- [ ] Pair, attempt, transient composition, stale, unavailable, failed, dry-run, changed, and unchanged states retain honest authority and clocks.
- [ ] Public artifacts remain ticker-only, credential-free, portfolio-free, action-free, escaped, no-key, no-account, no-server, and local-file readable.
- [ ] The Shared Infrastructure Impact Sweep, independent canaries, restore paths, Consumer Impact Sweep, UI Scenario Matrix, and Change Boundary are satisfied.

#### Test Evidence Items — 8 rows, exact Test Plan parity

- [ ] TP-05-01 proves SCN-028-001 through one catalogue card, one nav item, one route, one notes target, and current-page semantics. → Evidence: [TP-05-01](report.md#tp-05-01)
- [ ] TP-05-02 proves SCN-028-002 by mutating each old exclusion and one required package dependency into a named refusal. → Evidence: [TP-05-02](report.md#tp-05-02)
- [ ] TP-05-03 proves SCN-028-018 with separate failed-attempt and dated-authority bands. → Evidence: [TP-05-03](report.md#tp-05-03)
- [ ] TP-05-04 proves SCN-028-020 with committed `file://` first paint, unavailable live reconciliation, and zero private data or off-origin request. → Evidence: [TP-05-04](report.md#tp-05-04)
- [ ] TP-05-05 proves the built Pages artifact contains every registered and selector-referenced dependency. → Evidence: [TP-05-05](report.md#tp-05-05).
- [ ] TP-05-06 proves route semantics, deep links, keyboard flow, state words, reduced motion, 320 CSS px, and 200 percent zoom. → Evidence: [TP-05-06](report.md#tp-05-06).
- [ ] TP-05-07 proves shared experience, brief payload, registration, exclusion, package, and consumer parity. → Evidence: [TP-05-07](report.md#tp-05-07)
- [ ] TP-05-08 proves the broader Node and browser regression closure on one unchanged tree. → Evidence: [TP-05-08](report.md#tp-05-08).

#### Build Quality Gate

- [ ] The final Pages, validation, privacy, compatibility, and reference checks pass on one unchanged tree.

## Whole-Plan Requirement Coverage

| Requirement | Owning scope | Primary scenario proof |
| --- | --- | --- |
| FR-028-001 | Scope 05 | SCN-028-001 |
| FR-028-002 | Scope 05 | SCN-028-001 |
| FR-028-003 | Scope 05 | SCN-028-001, SCN-028-002 |
| FR-028-004 | Scope 05 | SCN-028-001, SCN-028-020 |
| FR-028-005 | Scope 05 | SCN-028-002 |
| FR-028-006 | Scope 01, integrated in Scope 04 | SCN-028-005, SCN-028-019 |
| FR-028-007 | Scope 01 | SCN-028-005 |
| FR-028-008 | Scope 01 | SCN-028-005 |
| FR-028-009 | Scope 01, integrated in Scope 04 | SCN-028-003, SCN-028-004, SCN-028-005 |
| FR-028-010 | Scope 04 | SCN-028-019 |
| FR-028-011 | Scope 01 | SCN-028-006, SCN-028-007 |
| FR-028-012 | Scope 01 | SCN-028-006 |
| FR-028-013 | Scope 01 | SCN-028-007, SCN-028-008 |
| FR-028-014 | Scope 01, integrated in Scope 04 | SCN-028-007, SCN-028-019 |
| FR-028-015 | Scope 01, integrated in Scope 04 | SCN-028-003, SCN-028-004, SCN-028-017 |
| FR-028-016 | Scope 01 | SCN-028-009 |
| FR-028-017 | Scope 01 | SCN-028-009, SCN-028-010 |
| FR-028-018 | Scope 01 | SCN-028-009 |
| FR-028-019 | Scope 01 | SCN-028-008, SCN-028-009 |
| FR-028-020 | Scope 01 | SCN-028-009, SCN-028-010 |
| FR-028-021 | Scope 01 | SCN-028-010 |
| FR-028-022 | Scope 02, exercised in Scope 04 | SCN-028-011, SCN-028-012, SCN-028-021 |
| FR-028-023 | Scope 02 | SCN-028-011 |
| FR-028-024 | Scope 02 | SCN-028-013, SCN-028-014 |
| FR-028-025 | Scope 02 | SCN-028-011, SCN-028-021 |
| FR-028-026 | Scope 02, fault-proven in Scope 03 | SCN-028-014, SCN-028-015, SCN-028-016 |
| FR-028-027 | Scope 02, fault-proven in Scope 03 | SCN-028-013, SCN-028-014, SCN-028-016 |
| FR-028-028 | Scope 02, restored in Scope 03, integrated in Scope 04 | SCN-028-003, SCN-028-004, SCN-028-015, SCN-028-016, SCN-028-017 |
| FR-028-029 | Scope 02, integrated in Scope 04 | SCN-028-003, SCN-028-004, SCN-028-005, SCN-028-014 |
| FR-028-030 | Scope 03 | SCN-028-015 |
| FR-028-031 | Scope 03 | SCN-028-016 |
| FR-028-032 | Scope 03 | SCN-028-017 |
| FR-028-033 | Scope 03, integrated in Scope 04 | SCN-028-012, SCN-028-013 |
| FR-028-034 | Scope 03 | SCN-028-015, SCN-028-016, SCN-028-022 |
| FR-028-035 | Scope 04 | SCN-028-003, SCN-028-004 |
| FR-028-036 | Scope 03, rendered in Scope 05 | SCN-028-018 |
| FR-028-037 | Scope 02, rendered in Scope 05 | SCN-028-003, SCN-028-009, SCN-028-014 |
| FR-028-038 | Scope 05 | SCN-028-020 |

All 38 functional requirements have an owning scope and at least one stable scenario. Requirements exercised across scope boundaries retain one implementation owner and one final consumer proof.

## Required Negative and Mutation Controls

| Control | Owning row | Required detector outcome |
| --- | --- | --- |
| Registration and exclusion mismatch | TP-05-02 | `C028-PACKAGING` names the exact stale exclusion or missing dependency |
| Missing, stale, and late evidence | TP-01-03, TP-01-04 | Missing and stale remain explicit. Post-cutoff evidence is refused |
| Subject mismatch | TP-01-06 | `C028-PLAN-SCHEMA` or `C028-COMPANY-CANDIDATE` names the mismatched subject |
| Source cycle | TP-04-04 | `C028-SOURCE-CYCLE` rejects self and final-brief dependencies |
| Malformed, unsigned, and over-budget plan | TP-01-06 | Closed plan codes reject each independent mutation, including six attempted branches |
| Same-day identity | TP-02-01 | Four windows create four identities in one predecessor chain |
| Generation collision | TP-04-03 | Same bytes resume. Changed bytes at one identity refuse |
| Predecessor drift | TP-02-02 | `C028-PREDECESSOR-DRIFT` preserves both authoritative sides |
| Immutable mutation | TP-02-01, TP-02-04 | A predecessor byte change refuses and every prior object hash remains stable |
| Pointer order | TP-02-03 | The recorder proves the coupled selector is the final write |
| Company success and brief failure | TP-03-01 | Both baselines restore and unpublished company material leaves the checkout |
| Brief success and company failure | TP-03-02 | No brief or company pointer becomes authoritative |
| Covered-set abort | TP-03-03 | A failing isolated second subject advances zero pointers |
| Commit failure | TP-03-05 | Full pre-commit checkout and index restoration succeeds |
| Push failure and acknowledgment ambiguity | TP-03-05 | Exact commit persists and remote ancestry determines authority |
| Dry-run byte identity | TP-03-04 | Worktree, index, pointers, artifacts, and remote refs remain byte-identical |
| Trigger parity | TP-04-02 | Scheduled and on-demand phase histories and manifests differ only in trigger identity |
| Pages package | TP-05-02, TP-05-05 | Missing or excluded dependencies refuse. Complete `_site` contains the exact graph |
| `file://` first paint | TP-05-04 | Committed pair paints while every fetch remains held and no private field appears |

## Privacy and Authority Boundary

- The public subject SST contains only `company:msft`.
- Test-only additional subjects exist only inside isolated test repositories.
- The plan author receives frozen public evidence and has no shell, Git, repository-write, pointer, commit, or acknowledgment authority.
- Company and brief text render through text-only sinks. Model text never controls links, markup, numeric values, clocks, or authority.
- Public and private records exclude credentials, account identity, holdings, positions, quantities, size, basis, profit, loss, proceeds, private paths, and operator identity.
- The company owner read remains ineligible for recommendations, orders, sizing, approvals, execution, routing, and alerts.

## Final Sequence Gate

1. Scope 01 must produce and validate the real owner read before any trigger or registration work begins.
2. Scope 02 must prove immutable promotion and pointer order before failure restoration expands the transaction.
3. Scope 03 must prove whole-transaction restoration before any scheduled or on-demand trigger uses the path.
4. Scope 04 must prove trigger parity, exact resume, and frozen-registry integrity before the tool becomes visible.
5. Scope 05 must register every consumer and remove every exclusion in the same coherent change.
6. Final validation must run on one unchanged candidate tree. A product test result from another tree cannot satisfy any DoD item.
