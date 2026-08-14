# Scope 1: Agenda Foundation And Topic Definitions

**Scope ID:** `01-agenda-registry-contract`
**Scope Dir:** `scopes/01-agenda-registry-contract`
**Status:** Done
**Depends On:** none
**Scope-Kind:** runtime-behavior
**Tags:** foundation:true

Related artifacts: [spec.md](../../spec.md), [design.md](../../design.md),
[scope index](../_index.md).

## Replan Evidence Boundary

The existing `report.md` records historical evidence for the superseded
implementation contract. It cannot satisfy any DoD item below. Implementation
must execute every current `TP-01-*` row and append fresh evidence under a
`replanned-contract-tp-01-*` anchor before checking the matching item.

## Outcome

Commit the topic-neutral agenda foundation without running research. The root
`research-agenda.json` declares explicit review modes, freshness, two topic
capacities, acquisition capacity, and authoring limits. The UMD `rlagenda.js`
owns all closed vocabularies, exact-shape validation, refusal families, and
deterministic function signatures. Three initial topic definitions use that
foundation: `geopolitical-supply-shock` in `every-generation` mode, and
`defense-earnings-acceleration` plus `food-inputs-outlook` in `cadence` mode.

The geopolitical definition carries all eight required analytical sections,
stable actor/scenario/flow/transmission/proxy/chart definitions, explicit
quality weights and impact caps, and a versioned calibration contract. Shared
foundation fields never hard-code Iran or geopolitical sections into the two
cadence topics.

## Requirement Coverage

FR-019-001 through FR-019-009, FR-019-011, FR-019-015, FR-019-020, and
NFR-019-003 through NFR-019-004.

## Gherkin Scenarios

```gherkin
Scenario: SCN-019-001 A disposable clone sees every declared topic
  Given the agenda registry is a committed repository file
  And the scheduler has cloned origin/main into a disposable checkout
  When the generation reads the agenda
  Then it sees every topic the operator declared on the branch
  And it reads no browser state and no uncommitted local file

Scenario: SCN-019-002 An absent agenda is a named absence
  Given no agenda registry exists in the checkout
  When the generation reads the agenda
  Then it records a named absence with a reason
  And it does not synthesise a default topic set
  And the rest of the brief still generates

Scenario: SCN-019-003 One invalid topic does not disable the others
  Given the agenda declares three topics and one is missing its review mode
  When the agenda is validated
  Then the invalid topic is refused with a named reason
  And the remaining two topics are still reviewed

Scenario: SCN-019-007 The operator's actual research history is expressible
  Given the operator declares the primary geopolitical supply-shock topic in every-generation mode
  And its current scope covers U.S.-Iran reaction functions, Hormuz, the Red Sea and Bab el-Mandeb
  And it covers oil, refined products, LNG, fertilizer, aluminum, shipping and U.S.-listed proxy sensitivity
  And the operator declares defense-acceleration and food-input topics in cadence mode
  When the agenda is validated
  Then all three are accepted as instances of the same agenda foundation
  And each retains its own question, boundary, analytical sections and review mode
```

## Planned Production Paths

| Path | Disposition | Purpose |
| --- | --- | --- |
| `research-agenda.json` | planned new | committed operator registry and all required capacities |
| `rlagenda.js` | planned new | single UMD owner of contracts, validation, models, charts, and reader vocabulary |
| `research/agenda/topics/geopolitical-supply-shock.definition.json` | planned new | eight-section primary topic definition |
| `research/agenda/topics/geopolitical-supply-shock.calibration.json` | planned new | immutable historical-event calibration contract |
| `research/agenda/topics/defense-earnings-acceleration.definition.json` | planned new | cadence topic definition |
| `research/agenda/topics/food-inputs-outlook.definition.json` | planned new | cadence topic definition |
| `tests/fixtures/research-agenda/` | planned new | contract, refusal, mode, capacity, definition, and calibration fixtures |
| `scripts/selftest.mjs` | existing, planned modification | pure production-helper and contract assertions |
| `scripts/build-pages-site.mjs` | existing, planned modification | publish `research/**` in the public site projection |

## Implementation Plan

1. Implement `rlagenda.js` as a root UMD module loaded by Node through
   `createRequire` and by browsers through a normal script tag. Export top-level
   `function name(...)` declarations so the current selftest extractor executes
   the real production functions.
2. Define exact closed contracts for `research-agenda/v1`,
   `research-topic-definition/v1`, and `research-evidence-record/v1`. Reject
   unknown members and missing values. Supply no mode, cadence, freshness,
   capacity, timeout, weight, cap, or model fallback.
3. Validate `every-generation` and `cadence` as discriminated shapes.
   `every-generation` requires `freshnessWindowHours` and rejects cadence
   members. `cadence` requires positive `cadenceDays` and
   `freshnessWindowDays`.
4. Require positive `maxActiveEveryGenerationTopics`,
   `cadenceTopicReviewBudget`, `maxConcurrentTopicAcquisitions`, and every
   `researchAuthoring` member shown in design section 6.1. Reject the active
   mandatory count at capacity plus one.
5. Commit exactly the three initial topics. Validate stable ids, byte-stable
   questions, explicit boundaries, lifecycle state, review policy, and
   definition references. Do not add a speculative fourth topic.
6. Encode the primary topic's stable actors, scenario priors, unique-flow
   network, channel-specific transmission models, U.S.-listed proxies, chart
   definitions, evidence-quality policy, triggers, invalidations, and
   calibration reference. Keep the defense and food definitions independent.
7. Make absent/unreadable registry state and per-topic refusal first-class.
   Assert `accepted + refusals === declared` without disabling valid topics.
8. Add contract fixtures and focused assertions to `scripts/selftest.mjs`.
   Add a real-static-server regression to the existing deployed-site parity
   spec. No research lane, generation record, dossier, payload key, page, or
   registration surface is implemented in this scope.

## Shared Infrastructure Impact Sweep

| Surface | Risk | Canary | Restore boundary |
| --- | --- | --- | --- |
| `rlagenda.js` | every later producer and reader consumes one owner | repository scan finds one owner for each vocabulary and formula | remove the new module before downstream scopes start |
| root registry and public definitions | committed public files can leak private fields | recursive private-field fixture fails validation | remove only the new registry/definition tree |
| `scripts/selftest.mjs` | shared project gate | existing groups retain their prior pass count and the new group executes | remove only the Feature 019 group |

## Change Boundary

Allowed families are the six planned production paths above,
`tests/fixtures/research-agenda/**`, `scripts/selftest.mjs`,
`scripts/build-pages-site.mjs` only to publish `research/**`, and the existing
`tests/deployed-site-parity.spec.mjs` canary. Excluded are brief generation,
payload/page publication, tool registration, UI, action, attention, anomaly,
candidate, and alert surfaces.

## Test Plan

| ID | Category | Scenario | Existing test surface | Exact planned test title | Command | Live system |
| --- | --- | --- | --- | --- | --- | --- |
| TP-01-01 | unit | SCN-019-001 | `scripts/selftest.mjs` | `SCN-019-001 committed agenda loads from repository state without browser or network input` | `node scripts/selftest.mjs` | No |
| TP-01-02 | functional | SCN-019-002 | `scripts/selftest.mjs` | `SCN-019-002 absent agenda is named and never replaced with default topics` | `node scripts/selftest.mjs` | No |
| TP-01-03 | unit | SCN-019-003 | `scripts/selftest.mjs` | `SCN-019-003 missing review mode refuses only the invalid topic` | `node scripts/selftest.mjs` | No |
| TP-01-04 | unit | SCN-019-007 | `scripts/selftest.mjs` | `SCN-019-007 three initial topics validate through one topic-neutral foundation` | `node scripts/selftest.mjs` | No |
| TP-01-05 | adversarial | SCN-019-001, SCN-019-003 | `scripts/selftest.mjs` | `Regression: agenda modes capacities vocabularies and formulas fail closed and have one owner` | `node scripts/selftest.mjs` | No |
| TP-01-06 | integration | SCN-019-001 | `scripts/validate-spec-test-paths.mjs` | `Regression: Feature 019 planning names only existing test files under the spec path ratchet` | `node scripts/validate-spec-test-paths.mjs` | No |
| TP-01-07 | e2e-api | SCN-019-001, SCN-019-007 | `tests/deployed-site-parity.spec.mjs` | `SCN-019-001 foundation artifacts are served from committed files by the real static server` | `npx --no-install playwright test tests/deployed-site-parity.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "SCN-019-001 foundation artifacts are served from committed files by the real static server" --reporter=list` | Yes |

### Definition of Done - Tiered Validation

#### Tier 1 - Behavior

- [x] SCN-019-001 through SCN-019-003 and SCN-019-007 satisfy the exact Given/When/Then contracts above.

   Evidence:

   ```text
   # Scope 1 Gherkin behavior validation
   $ node scripts/selftest.mjs
   exit: 0
   lines: 1907
   sha256: 5a9d5a1846f85288cccb52bf8eb89a8311ccb20806be8b8e1883da4fb870246b
   SCN-019-002 absent agenda is named and never replaced with default topics
   TP-01-02: absence is explicit and carries no synthesized topic
   SCN-019-003 missing review mode refuses only the invalid topic
   TP-01-03: one missing mode yields one named refusal while two topics remain accepted
   SCN-019-007 three initial topics validate through one topic-neutral foundation
   Research-Lab self-test: 1650 passed, 0 failed
   ```

- [x] The committed registry carries explicit modes, freshness, both topic capacities, acquisition capacity, and every authoring limit with no fallback.

   Evidence:

   ```text
   # Scope 1 explicit registry policy validation
   $ node scripts/selftest.mjs
   exit: 0
   lines: 1907
   sha256: 372084cf53020f10f2ba196d1da613b11c5191e5a3efae0f952bcceda84bcadc
   Regression: agenda modes capacities vocabularies and formulas fail closed and have one owner
   TP-01-05: unknown members, mandatory capacity plus one, and unknown evidence vocabulary are refused
   TP-01-05: evidence weighting uses only explicit policy values and exposes every factor
   TP-01-05: one UMD module owns the closed vocabulary and every deterministic function declaration
   Research-Lab self-test: 1650 passed, 0 failed
   ```

- [x] The three initial topics retain independent definitions; the primary topic contains all eight required sections and the shared foundation contains no Iran-only field.

   Evidence:

   ```text
   # Scope 1 topic independence validation
   $ node scripts/selftest.mjs
   exit: 0
   lines: 1907
   sha256: 7fc29df8f22f5e2c076836b3400201184f1012d3a80aa6a0b725ff431d76aebb
   SCN-019-007 three initial topics validate through one topic-neutral foundation
   TP-01-04: all definitions and the versioned primary calibration satisfy the shared contracts
   TP-01-04: cadence topics remain independent and the shared contract has no Iran-only field
   Research-Lab self-test: 1650 passed, 0 failed
   SCOPE1_BEHAVIOR_TOPIC_INDEPENDENCE_EXIT=0
   ```

- [x] Scope 1 performs no runtime research and publishes no review, dossier, payload read, page artifact, action, attention item, candidate, anomaly seed, or alert.

   Evidence:

   ```text
   SCOPE1_NO_RUNTIME_RESEARCH_BEGIN
   scope=01-agenda-registry-contract
   files=6
   network-fetch=0
   xhr=0
   runtime-dossier-path=0
   runtime-generation-path=0
   brief-payload-write=0
   feature020-action-write=0
   attention-write=0
   alert-write=0
   findings=0
   SCOPE1_NO_RUNTIME_RESEARCH_EXIT=0
   ```

#### Tier 2 - Test Evidence (7 rows)

The seven items below are the complete test-related DoD inventory for this
scope. Each item maps one-to-one to the same ID in the Markdown Test Plan and
`test-plan.json`.

- [x] TP-01-01: `scripts/selftest.mjs` executes `SCN-019-001 committed agenda loads from repository state without browser or network input` with fresh evidence.

   Evidence:

   ```text
   # TP-01-01 committed agenda validation
   $ node scripts/selftest.mjs
   exit: 0
   lines: 1907
   sha256: 8eb8825336bc932e57b72a3cdfb67439e336d5603e83d5d61ec930fe0fc76a77
   TP-01-01: the committed agenda validates all three topics from repository bytes
   TP-01-01: the agenda foundation reads no browser state and embeds no network input
   Research-Lab self-test: 1650 passed, 0 failed
   TP-01-01_EXECUTION_EXIT=0
   ```

- [x] TP-01-02: `scripts/selftest.mjs` executes `SCN-019-002 absent agenda is named and never replaced with default topics` with fresh evidence.

   Evidence:

   ```text
   # TP-01-02 absent agenda validation
   $ node scripts/selftest.mjs
   exit: 0
   lines: 1907
   sha256: 066bc22389e30d449dec5c1242b360c357db29349dde6c1cf97de7a97fcc83c3
   SCN-019-002 absent agenda is named and never replaced with default topics
   TP-01-02: absence is explicit and carries no synthesized topic
   Research-Lab self-test: 1650 passed, 0 failed
   TP-01-02_EXECUTION_EXIT=0
   ```

- [x] TP-01-03: `scripts/selftest.mjs` executes `SCN-019-003 missing review mode refuses only the invalid topic` with fresh evidence.

   Evidence:

   ```text
   # TP-01-03 per-topic refusal validation
   $ node scripts/selftest.mjs
   exit: 0
   lines: 1907
   sha256: 527d163d75681af0b453cf5e6d4cbbf6cb5aad9bd2ba83dccac38dfeed3d12ed
   SCN-019-003 missing review mode refuses only the invalid topic
   TP-01-03: one missing mode yields one named refusal while two topics remain accepted
   TP-01-03: accepted plus refused accounts for every declared topic without disabling valid peers
   Research-Lab self-test: 1650 passed, 0 failed
   ```

- [x] TP-01-04: `scripts/selftest.mjs` executes `SCN-019-007 three initial topics validate through one topic-neutral foundation` with fresh evidence.

   Evidence:

   ```text
   # TP-01-04 topic-neutral foundation validation
   $ node scripts/selftest.mjs
   exit: 0
   lines: 1907
   sha256: 7095765baedce413489435ddc27224897a848c956dc3bfe241a1f405fdb46666
   SCN-019-007 three initial topics validate through one topic-neutral foundation
   TP-01-04: all definitions and the versioned primary calibration satisfy the shared contracts
   TP-01-04: cadence topics remain independent and the shared contract has no Iran-only field
   Research-Lab self-test: 1650 passed, 0 failed
   ```

- [x] TP-01-05: `scripts/selftest.mjs` executes `Regression: agenda modes capacities vocabularies and formulas fail closed and have one owner` with fresh evidence.

   Evidence:

   ```text
   # TP-01-05 fail-closed ownership validation
   $ node scripts/selftest.mjs
   exit: 0
   lines: 1907
   sha256: ec2ccc4b6d112b32efeba78582b3770cc95f1069d752fa8e33dabc63a60306d8
   TP-01-05: unknown members, mandatory capacity plus one, and unknown evidence vocabulary are refused
   TP-01-05: evidence weighting uses only explicit policy values and exposes every factor
   TP-01-05: one UMD module owns the closed vocabulary and every deterministic function declaration
   Research-Lab self-test: 1650 passed, 0 failed
   ```

- [x] TP-01-06: `scripts/validate-spec-test-paths.mjs` executes `Regression: Feature 019 planning names only existing test files under the spec path ratchet` with fresh evidence.

   Evidence:

   ```text
   # TP-01-06 spec test path ratchet
   $ node scripts/validate-spec-test-paths.mjs
   exit: 0
   lines: 6
   sha256: b113b5367037bc92819035c35f0f41a956d1c58056b79bb5eae65700c5dfceee
   [spec-test-paths] scanned=553 references=12502 distinctPaths=218 missingPaths=81 baseline=84 new=0 stale=3
   STALE-BASELINE: tests/portfolio-analytics.unit.mjs
   STALE-BASELINE: tests/portfolio-survival-paths.spec.mjs
   STALE-BASELINE: tests/portfolio-survival-risk.spec.mjs
   [spec-test-paths] OK — no new missing test path(s) (3 stale baseline entries to remove)
   TP-01-06_CAPTURE_EXIT=0
   ```

- [x] TP-01-07: `tests/deployed-site-parity.spec.mjs` executes `SCN-019-001 foundation artifacts are served from committed files by the real static server` with fresh evidence.

   Evidence:

   ```text
   # TP-01-07 deployed foundation reachability
   $ npx --no-install playwright test tests/deployed-site-parity.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "SCN-019-001 foundation artifacts are served from committed files by the real static server" --reporter=list
   exit: 0
   lines: 6
   sha256: 6df162f5b046be15a560ce053d38984256047894bca58df3e3e7e25c47674597
   Running 1 test using 1 worker
   ✓ 1 [system-chrome] › tests/deployed-site-parity.spec.mjs:61:1 › SCN-019-001 foundation artifacts are served from committed files by the real static server
   1 passed (2.9s)
   TP-01-07_CAPTURE_EXIT=0
   ```

#### Tier 3 - Parity And Policy

- [x] Markdown Test Plan rows, `test-plan.json`, and `scenario-manifest.json` contain the same row and scenario mappings.

   Evidence:

   ```text
   SCOPE1_CROSS_ARTIFACT_PARITY_BEGIN
   scope=01-agenda-registry-contract
   markdownRows=7
   dodRows=7
   jsonRows=7
   declaredRowCount=7
   manifestRows=7
   markdownIds=TP-01-01,TP-01-02,TP-01-03,TP-01-04,TP-01-05,TP-01-06,TP-01-07
   dodIds=TP-01-01,TP-01-02,TP-01-03,TP-01-04,TP-01-05,TP-01-06,TP-01-07
   jsonIds=TP-01-01,TP-01-02,TP-01-03,TP-01-04,TP-01-05,TP-01-06,TP-01-07
   manifestIds=TP-01-01,TP-01-02,TP-01-03,TP-01-04,TP-01-05,TP-01-06,TP-01-07
   parity=PASS
   SCOPE1_CROSS_ARTIFACT_PARITY_EXIT=0
   ```

- [x] The capability-foundation guard recognizes this scope as `foundation:true`, and all downstream scope dependencies resolve to it.

   Evidence:

   ```text
   # Scope 1 capability foundation ordering
   $ bash .github/bubbles/scripts/capability-foundation-guard.sh specs/019-custom-recurring-research-agenda
   exit: 0
   lines: 6
   sha256: d2b244e1749f54de2414b79c9220ccde7bce2e649bb2d4e3b07a47cee7a2501b
   capability-foundation-guard: Gate G094 applies: triggerHits=44 concreteImplementationEntries=11
   capability-foundation-guard: spec.md contains Domain Capability Model
   capability-foundation-guard: design.md contains capability foundation split with sufficient variation axes
   capability-foundation-guard: scopes include foundation:true and overlay Depends On foundation ordering
   capability-foundation-guard: PASS Gate G094 - capability foundation requirements satisfied
   ```
- [x] Artifact lint, traceability, artifact freshness, test-path, reference-existence, fence-parity, and diff checks pass.

   Evidence:

   ```text
   # Scope 1 post-evidence quality gate
   artifact-lint exit=0 lines=85 sha256=94730cbebe047519718fb6242d3c5da7cb7320e68c057fa7f9bd14bac251da15
   traceability exit=0 lines=159 sha256=e642857ec9019ad784e5d1a26c921671e0918f4a0f74b3f877a5c252f1805d3f
   artifact-freshness exit=0 failures=0 warnings=0
   reference-existence exit=0 files=14 unresolved=0
   spec-test-paths exit=0 newMissing=0 staleBaseline=3
   JSON_PARSE_EXIT=0
   MARKDOWN_FENCE_EXIT=0
   PII_SCAN_EXIT=0 findings=0
   DIFF_CHECK_EXIT=0
   SCOPE1_POST_EVIDENCE_SAFETY_END
   ```
- [x] The implementation diff stays inside the declared change boundary and contains no Feature 020 destination write.

   Evidence:

   ```text
   SCOPE1_DIFF_BOUNDARY_ASSERT_V2_BEGIN
   changedPaths=25
   scope1Paths=14
   outsidePaths=0
   feature020DestinationWrites=0
   boundary=PASS
   scope1 scripts/build-pages-site.mjs
   scope1 scripts/selftest.mjs
   scope1 tests/deployed-site-parity.spec.mjs
   scope1 research-agenda.json
   scope1 rlagenda.js
   planning specs/019-custom-recurring-research-agenda/test-plan.json
   SCOPE1_DIFF_BOUNDARY_ASSERT_V2_EXIT=0
   ```

---

*Educational models only - not investment advice.*
