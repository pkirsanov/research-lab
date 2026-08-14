# Scope 4: Governed Generation And Atomic Publication

**Scope ID:** `04-dossier-and-outcome-states`
**Scope Dir:** `scopes/04-dossier-and-outcome-states`
**Status:** Done
**Depends On:** `01-agenda-registry-contract` (foundation), `03-per-generation-review-policy`
**Scope-Kind:** runtime-behavior

Related artifacts: [spec.md](../../spec.md), [design.md](../../design.md),
[scope index](../_index.md).

## Replan Evidence Boundary

The existing `report.md` records historical evidence for the superseded
implementation contract. It cannot satisfy any DoD item below. Implementation
must execute every current `TP-04-*` row and append fresh evidence under a
`replanned-contract-tp-04-*` anchor before checking the matching item.

## Outcome

Integrate the offline plan and deterministic model engine into each real market
brief generation. Reuse current committed observations, bars, frozen evidence,
and source-ledger entries. Send only missing or stale requirements through the
existing governed acquisition boundary. Run one separately bounded,
networkless, write-disjoint research side lane that authors situation evidence
and interpretation but no analytical number.

Compose one exact candidate containing every declared topic and section. A
successful topic produces a complete current review and, only when substantive
state changed, a new immutable dossier. Quiet, stale, and unavailable outcomes
remain explicit. Validate the complete agenda/payload transaction, write
immutable assets create-only, replace the append-only ledger candidate, and
move `current.json` last. Research acquisition, authoring, validation, and
timeout failures remain isolated from the four critical lanes.

## Requirement Coverage

FR-019-010, FR-019-017 through FR-019-019, FR-019-024 through FR-019-031,
FR-019-037 through FR-019-038, NFR-019-002 through NFR-019-004.

## Gherkin Scenarios

```gherkin
Scenario: SCN-019-004 A newly declared topic enters the review cycle
  Given the operator commits a new topic with a declared question and an explicit review mode
  When the next generation runs
  Then an every-generation topic is selected as mandatory
  And a cadence topic is treated as due because it has never been reviewed
  And a first dossier is produced or a named outcome is recorded

Scenario: SCN-019-012 A dossier carries provenance
  Given a due topic researched successfully this generation
  When the dossier is written
  Then every finding carries an observation date, source, confidence and evidence role
  And the dossier carries the generation instant, topic identifier and change assessment
  And it carries every declared analytical section with sustained model and chart state
  And the outcome state is updated

Scenario: SCN-019-013 No new evidence is a real answer
  Given a due topic whose research surfaced no new evidence since its last dossier
  When the review completes
  Then the outcome state is unchanged
  And no new finding is invented to justify the review
  And the prior dossier remains the current one

Scenario: SCN-019-014 Old evidence is labelled, never presented as current
  Given a due topic whose newest available evidence predates its declared freshness window
  When the review completes
  Then the outcome state is stale
  And the published record names the age of the newest evidence
  And the findings are not presented as a current read

Scenario: SCN-019-015 A failed lane is a named absence
  Given a due topic whose research lane failed or returned nothing usable
  When the review completes
  Then the outcome state is unavailable with a named reason
  And no partial, inferred or placeholder finding is published for it
  And the remaining topics are unaffected
```

## Planned Production Paths

| Path | Disposition | Purpose |
| --- | --- | --- |
| `market-brief.config.json` | existing, planned modification | explicit agenda acquisition and research-authoring policy |
| `scripts/web-evidence-policy.mjs` | planned new | one extracted allowlist policy shared by existing and agenda lanes |
| `scripts/web-evidence-acquire.mjs` | existing, reused without second fetcher | frozen missing/stale evidence bundles |
| `scripts/brief-narrative-parallel.mjs` | existing, planned modification | side-pool research author and candidate collection |
| `scripts/research-agenda-generation.mjs` | planned new | pure agenda candidate, read, and transaction composition |
| `scripts/research-agenda-refresh.mjs` | planned new | runtime binding and exact pointer-last publication orchestration |
| `scripts/validate-brief-payload.mjs` | existing, planned modification | agenda/payload validation |
| `scripts/brief-refresh-and-push.sh` | existing, planned modification | candidate transaction, owned paths, scoped commit, rollback |
| `research/agenda/generations/`, `reviews/`, `dossiers/` | existing after Scope 2, planned writes | immutable transaction outputs |
| `research/agenda/history.jsonl`, `current.json` | existing after Scope 2, planned writes | append candidate and pointer-last publication |
| `market-brief.payload.json` | existing generated artifact, planned additive key | compact `researchAgenda` read |
| `tests/web-evidence.functional.mjs` | existing, planned modification | real acquisition behavior |
| `tests/web-evidence.security.mjs` | existing, planned modification | allowlist/private/instruction/budget refusals |
| `tests/distributed-briefs.authorship.integration.mjs` | existing, planned modification | side-pool and critical-lane isolation |
| `tests/brief-refresh-atomicity.test.mjs` | existing, planned modification | transaction, rollback, pointer-last |
| `tests/distributed-briefs.final.e2e.mjs` | existing, planned modification | real generation end to end |

## Implementation Plan

1. Run `planGeneration` before any acquisition or authoring. Bind one
   `generationId` to all retries with registry, definition, calibration, bars,
   history, cutoff, and snapshot digests. Keep pure candidate, read, and
   transaction composition in `scripts/research-agenda-generation.mjs`; bind
   repository I/O and pointer-last promotion in `scripts/research-agenda-refresh.mjs`.
2. Compare selected-topic source requirements with current owner observations,
   bars, frozen bundles, and prior source-ledger records. Reuse only records
   whose identity, digest, times, freshness, and claim coverage remain valid.
   Query only missing or stale requirements.
3. Extract the current 15-host allowlist into one policy module and keep all
   four existing lane arguments byte-equivalent. Add the explicit
   `research-agenda` query/URL/origin/excerpt/response/bundle/time/concurrency
   limits from design section 11.3. Reject every limit at capacity plus one.
4. Invoke `scripts/web-evidence-acquire.mjs` as the only query-plan-to-bundle
   transform. Preserve HTTPS, no redirect, robots, private-field,
   instruction-shape, freshness, corroboration, byte, and raw-body-discard
   behavior. Add no host, credential, or licensed endpoint.
5. Run a separate optional side pool with `concurrency: 1`, `attempts: 1`, and
   `timeoutSeconds: 900`. The `research` lane has no web and no shell, owns only
   `.brief-work/research.json`, consumes frozen inputs, and outputs exact
   `research-situation/v1` records without probabilities, ranges, chart points,
   or change labels.
6. Recompute every deterministic output through `rlagenda.js`. Validate every
   declared section as changed, unchanged, stale, or unavailable. Require one
   generation classification per registry row and one current review or named
   unavailable record for every active mandatory topic.
7. Compose `updated` only with complete provenance and sustained state.
   Compose `unchanged` as a new complete review with the prior dossier ref and
   no invented finding. Compose `stale` with newest-evidence age and zero stale
   impact. Compose `unavailable` with a specific reason and no partial finding.
8. Add the compact `researchAgenda` read to the payload candidate. Scope 5 adds
   the registered tool-read identity and visible page projection; this scope
   does not register or render a tool.
9. Validate canonical model equality, complete topic/section accounting,
   artifact budgets, immutable refs, and payload shape before tracked writes.
   Create immutable files, replace the ledger candidate, move `current.json`
   last, and stage only the enumerated owned paths with the brief graph.
10. On pre-stage failure, restore mutable pointer and ledger bytes and remove
    unreachable new immutable files. On push failure, preserve the complete
    local commit. Never publish a partial current state.
11. Prove a timed-out or malformed research lane yields named unavailable
    reviews while the four critical lane outputs remain byte-identical. Execute
    authoring once per generation id and reuse the validated candidate on outer
    narrative retry.

## Shared Infrastructure Impact Sweep

| Surface | Risk | Canary | Restore boundary |
| --- | --- | --- | --- |
| four critical narrative lanes | side lane failure could weaken the brief | baseline run and forced research timeout produce byte-identical critical keys | remove side-pool integration only |
| shared web policy | extracted allowlist could change existing acquisition | existing lane argument vectors and host set are byte-identical | restore prior inline list and remove new policy module |
| brief refresh transaction | partial writes can expose mismatched current state | forced failure at every publication step retains prior pointer/ledger and unreachable new files | restore mutable bytes and delete new unreachable files |
| payload contract | additive agenda key could invalidate old payloads | payload without `researchAgenda` retains existing accepted behavior until complete registration lands | remove only the additive validation branch |

## Change Boundary

Allowed families are the production and test paths listed above plus
`rlagenda.js`, `tests/fixtures/research-agenda/**`, and `scripts/selftest.mjs`.
Excluded are tool/page registration, visible UI, experience/journey registries,
shared ticker/chart rendering, action/attention/anomaly/candidate/alert writes,
and Feature 020 eligibility or routing behavior.

## Test Plan

| ID | Category | Scenario | Existing test surface | Exact planned test title | Command | Live system |
| --- | --- | --- | --- | --- | --- | --- |
| TP-04-03 | functional | SCN-019-004, SCN-019-012, SCN-019-013, SCN-019-014, SCN-019-015 | `scripts/selftest.mjs` | `Feature 019 candidate contract accounts for new sourced unchanged stale and unavailable reviews before publication` | `node scripts/selftest.mjs` | No |
| TP-04-01 | integration | SCN-019-004 | `tests/distributed-briefs.final.e2e.mjs` | `SCN-019-004 newly committed topic receives its first current review or named outcome` | `node --test tests/distributed-briefs.final.e2e.mjs` | Yes |
| TP-04-02 | functional | SCN-019-012 | `tests/web-evidence.functional.mjs` | `SCN-019-012 generation reuses current evidence and acquires only missing or stale requirements` | `node --test tests/web-evidence.functional.mjs` | No |
| TP-04-04 | integration | SCN-019-013 | `tests/distributed-briefs.authorship.integration.mjs` | `SCN-019-013 quiet complete pass writes an unchanged review and reuses the substantive dossier` | `node --test tests/distributed-briefs.authorship.integration.mjs` | Yes |
| TP-04-05 | adversarial | SCN-019-014 | `scripts/selftest.mjs` | `SCN-019-014 stale evidence publishes its age has zero model impact and never masquerades as current` | `node scripts/selftest.mjs` | No |
| TP-04-06 | integration | SCN-019-015 | `tests/distributed-briefs.authorship.integration.mjs` | `SCN-019-015 failed research lane publishes named unavailable without a partial finding` | `node --test tests/distributed-briefs.authorship.integration.mjs` | Yes |
| TP-04-07 | adversarial | SCN-019-015 | `tests/distributed-briefs.authorship.integration.mjs` | `Regression: research lane timeout leaves every critical lane output byte-identical` | `node --test tests/distributed-briefs.authorship.integration.mjs` | Yes |
| TP-04-08 | security | SCN-019-012 | `tests/web-evidence.security.mjs` | `Regression: agenda acquisition rejects query URL byte time and concurrency limits at capacity plus one` | `node --test tests/web-evidence.security.mjs` | No |
| TP-04-09 | functional | SCN-019-012 | `tests/web-evidence.functional.mjs` | `Regression: shared web policy preserves all existing lane allowlist arguments byte for byte` | `node --test tests/web-evidence.functional.mjs` | No |
| TP-04-10 | adversarial | SCN-019-012, SCN-019-015 | `tests/brief-refresh-atomicity.test.mjs` | `Regression: agenda publication writes immutable files before ledger and moves current pointer last` | `node --test tests/brief-refresh-atomicity.test.mjs` | Yes |
| TP-04-11 | integration | SCN-019-009, SCN-019-012 | `scripts/validate-brief-payload.mjs` | `Every declared topic and section is accounted and every mandatory review belongs to the current generation` | `node scripts/validate-brief-payload.mjs` | Yes |
| TP-04-12 | stress | SCN-019-011, SCN-019-015 | `tests/distributed-briefs.final-budget.stress.mjs` | `Agenda acquisition and authoring remain within explicit topic byte concurrency and timeout budgets` | `node --test tests/distributed-briefs.final-budget.stress.mjs` | Yes |
| TP-04-13 | e2e-api | SCN-019-004, SCN-019-012, SCN-019-013, SCN-019-014, SCN-019-015 | `tests/distributed-briefs.final.e2e.mjs` | `SCN-019-012 real generation publishes one atomic agenda and brief payload transaction` | `node --test tests/distributed-briefs.final.e2e.mjs` | Yes |

### Definition of Done - Tiered Validation

#### Tier 1 - Behavior

- [x] SCN-019-004 and SCN-019-012 through SCN-019-015 satisfy the exact Given/When/Then contracts above.

   ```text
   # Scope 4 focused matrix
   exit: 0
   tests: 35
   pass: 35
   fail: 0

   # Scope 4 full project selftest
   $ node scripts/selftest.mjs
   exit: 0
   lines: 1991
   sha256: b34fae9c0d408726874f2672ef28b11d742597dccb710cb529e8273f2ab388b8
   Research-Lab self-test: 1696 passed, 0 failed
   ```

- [x] Every active mandatory topic has a current-generation review or named unavailable record, and every registry row and declared section is accounted exactly once.

   ```text
   # replanned-contract-tp-04-03
   $ node scripts/selftest.mjs
   exit: 0
   lines: 1991
   sha256: a5db1f0293d59c7828d9fe8370830587c72e4f335e85b0e4ab873ebe4c50e77c
   Feature 019 candidate contract accounts for new sourced unchanged stale and unavailable reviews before publication
   TP-04-03: new sourced evidence creates one complete updated review and one sustained dossier
   TP-04-03: a quiet complete pass writes an unchanged review reusing the prior dossier without inventing a finding
   TP-04-03: stale evidence records its age and publishes no current model output or dossier
   TP-04-03: a failed lane creates a named unavailable review with no partial finding or dossier
   Research-Lab self-test: 1696 passed, 0 failed

   # replanned-contract-tp-04-11
   $ node scripts/validate-brief-payload.mjs
   exit: 0
   lines: 2
   sha256: 5633a06b8d73d88c69105a844e0949c1ba8ee31d362aeeeb697916d04c599479
   [brief-contract] Every declared topic and section is accounted and every mandatory review belongs to the current generation: PASS
   [brief-contract] PASS: all visible sections, registry coverage, model-specific real assets, and next-session actions are valid
   ```

- [x] Acquisition is governed, missing/stale-only, bounded, and source-allowlisted; authoring is networkless, shell-free, write-disjoint, and separately bounded.

   ```text
   # replanned-contract-tp-04-02
   $ node --test --test-name-pattern='SCN-019-012 generation reuses current evidence and acquires only missing or stale requirements' tests/web-evidence.functional.mjs
   exit: 0
   lines: 9
   sha256: a07c74920d81695fe7a5d2a5f0e8d07391c2321f9c7bfd678192d050b1974502
   SCN-019-012 generation reuses current evidence and acquires only missing or stale requirements
   tests: 1
   pass: 1
   fail: 0

   # replanned-contract-tp-04-08
   $ node --test --test-name-pattern='Regression: agenda acquisition rejects query URL byte time and concurrency limits at capacity plus one' tests/web-evidence.security.mjs
   exit: 0
   lines: 9
   sha256: 77ee4b69123d26ce99db886b75585e62b201aed8085fb89e741fb0593db3f7aa
   Regression: agenda acquisition rejects query URL byte time and concurrency limits at capacity plus one
   tests: 1
   pass: 1
   fail: 0

   # replanned-contract-tp-04-09
   $ node --test --test-name-pattern='Regression: shared web policy preserves all existing lane allowlist arguments byte for byte' tests/web-evidence.functional.mjs
   exit: 0
   lines: 9
   sha256: 1b4e2048c15dfd96acd1f358220b0a5e2acedb3573186fef2b6402cd128bf8eb
   Regression: shared web policy preserves all existing lane allowlist arguments byte for byte
   tests: 1
   pass: 1
   fail: 0

   # replanned-contract-tp-04-12
   $ node --test --test-name-pattern='Agenda acquisition and authoring remain within explicit topic byte concurrency and timeout budgets' tests/distributed-briefs.final-budget.stress.mjs
   exit: 0
   lines: 9
   sha256: 1db84abe24485db857f00a900d6da1bbd1cd23b7d71a42f233d1b5af494db65c
   Agenda acquisition and authoring remain within explicit topic byte concurrency and timeout budgets
   tests: 1
   pass: 1
   fail: 0
   ```

- [x] Publication is one validated pointer-last transaction and never exposes prior history as the current mandatory review.

   ```text
   # replanned-contract-tp-04-10
   $ node --test --test-name-pattern='Regression: agenda publication writes immutable files before ledger and moves current pointer last' tests/brief-refresh-atomicity.test.mjs
   exit: 0
   lines: 9
   sha256: 2bd10c2e510cddf7c7d95676fb183df9e4f7cf93ef8bfec41d647d98d45eaaa2
   Regression: agenda publication writes immutable files before ledger and moves current pointer last
   tests: 1
   pass: 1
   fail: 0

   # replanned-contract-tp-04-13
   $ node --test --test-name-pattern='SCN-019-012 real generation publishes one atomic agenda and brief payload transaction' tests/distributed-briefs.final.e2e.mjs
   exit: 0
   lines: 32
   sha256: 4b08a5368d71f7d04cefabce0ca28358db901867b9d34bd442aa26f8627b5275
   SCN-019-012 real generation publishes one atomic agenda and brief payload transaction
   tests: 1
   pass: 1
   fail: 0

   # Scope 4 full atomic wrapper suite
   $ node --test tests/brief-refresh-atomicity.test.mjs
   exit: 0
   lines: 697
   sha256: 34d00ca9ba3b18ade6df758d2b28aa83718da5a2ea29f519740b28185dd8e851
   tests: 30
   pass: 30
   fail: 0
   ```

#### Tier 2 - Test Evidence (13 rows)

The thirteen items below are the complete test-related DoD inventory for this
scope. Each item maps one-to-one to the same ID in the Markdown Test Plan and
`test-plan.json`.

- [x] TP-04-01: `tests/distributed-briefs.final.e2e.mjs` executes `SCN-019-004 newly committed topic receives its first current review or named outcome` with fresh evidence.

   ```text
   # replanned-contract-tp-04-01
   $ node --test --test-name-pattern='SCN-019-004 newly committed topic receives its first current review or named outcome' tests/distributed-briefs.final.e2e.mjs
   exit: 0
   lines: 9
   sha256: eaf1ae8da7d503908582dd0ec456daa0e0600150047967ce2d46e2d7f661257c
   SCN-019-004 newly committed topic receives its first current review or named outcome
   tests: 1
   pass: 1
   fail: 0
   ```

- [x] TP-04-02: `tests/web-evidence.functional.mjs` executes `SCN-019-012 generation reuses current evidence and acquires only missing or stale requirements` with fresh evidence.

   ```text
   # replanned-contract-tp-04-02
   $ node --test --test-name-pattern='SCN-019-012 generation reuses current evidence and acquires only missing or stale requirements' tests/web-evidence.functional.mjs
   exit: 0
   lines: 9
   sha256: a07c74920d81695fe7a5d2a5f0e8d07391c2321f9c7bfd678192d050b1974502
   SCN-019-012 generation reuses current evidence and acquires only missing or stale requirements
   tests: 1
   pass: 1
   fail: 0
   ```

- [x] TP-04-03: `scripts/selftest.mjs` executes `Feature 019 candidate contract accounts for new sourced unchanged stale and unavailable reviews before publication` with fresh evidence.

   ```text
   # replanned-contract-tp-04-03
   $ node scripts/selftest.mjs
   exit: 0
   lines: 1991
   sha256: a5db1f0293d59c7828d9fe8370830587c72e4f335e85b0e4ab873ebe4c50e77c
   Feature 019 candidate contract accounts for new sourced unchanged stale and unavailable reviews before publication
   TP-04-03: new sourced evidence creates one complete updated review and one sustained dossier
   TP-04-03: a quiet complete pass writes an unchanged review reusing the prior dossier without inventing a finding
   TP-04-03: stale evidence records its age and publishes no current model output or dossier
   TP-04-03: a failed lane creates a named unavailable review with no partial finding or dossier
   Research-Lab self-test: 1696 passed, 0 failed
   ```

- [x] TP-04-04: `tests/distributed-briefs.authorship.integration.mjs` executes `SCN-019-013 quiet complete pass writes an unchanged review and reuses the substantive dossier` with fresh evidence.

   ```text
   # replanned-contract-tp-04-04
   $ node --test --test-name-pattern='SCN-019-013 quiet complete pass writes an unchanged review and reuses the substantive dossier' tests/distributed-briefs.authorship.integration.mjs
   exit: 0
   lines: 9
   sha256: 88983765c9a81829949f94c481ec4146ade5b605216e34c3f734165e042a596d
   SCN-019-013 quiet complete pass writes an unchanged review and reuses the substantive dossier
   tests: 1
   pass: 1
   fail: 0
   ```

- [x] TP-04-05: `scripts/selftest.mjs` executes `SCN-019-014 stale evidence publishes its age has zero model impact and never masquerades as current` with fresh evidence.

   ```text
   # replanned-contract-tp-04-05
   $ node scripts/selftest.mjs
   exit: 0
   lines: 1991
   sha256: 478d09f2cdf735fe5a66a14d3c5fb82898271457592b42cf816408f00d017626
   SCN-019-014 stale evidence publishes its age has zero model impact and never masquerades as current
   TP-04-05: stale evidence has zero impact and the compact read labels stale with its age
   TP-04-05: stale current review never points at or masquerades as the prior dossier
   Research-Lab self-test: 1696 passed, 0 failed
   ```

- [x] TP-04-06: `tests/distributed-briefs.authorship.integration.mjs` executes `SCN-019-015 failed research lane publishes named unavailable without a partial finding` with fresh evidence.

   ```text
   # replanned-contract-tp-04-06
   $ node --test --test-name-pattern='SCN-019-015 failed research lane publishes named unavailable without a partial finding' tests/distributed-briefs.authorship.integration.mjs
   exit: 0
   lines: 9
   sha256: 7d5ac28dfe84947510c51e4279444e5618fe74a0b8c9e17bc67979d1865f538c
   SCN-019-015 failed research lane publishes named unavailable without a partial finding
   tests: 1
   pass: 1
   fail: 0
   ```

- [x] TP-04-07: `tests/distributed-briefs.authorship.integration.mjs` executes `Regression: research lane timeout leaves every critical lane output byte-identical` with fresh evidence.

   ```text
   # replanned-contract-tp-04-07
   $ node --test --test-name-pattern='Regression: research lane timeout leaves every critical lane output byte-identical' tests/distributed-briefs.authorship.integration.mjs
   exit: 0
   lines: 9
   sha256: 7ac42cb843334e6df9022611c5d9b99b475ea0fa11664e801956a7eae8fd6174
   Regression: research lane timeout leaves every critical lane output byte-identical
   tests: 1
   pass: 1
   fail: 0
   ```

- [x] TP-04-08: `tests/web-evidence.security.mjs` executes `Regression: agenda acquisition rejects query URL byte time and concurrency limits at capacity plus one` with fresh evidence.

   ```text
   # replanned-contract-tp-04-08
   $ node --test --test-name-pattern='Regression: agenda acquisition rejects query URL byte time and concurrency limits at capacity plus one' tests/web-evidence.security.mjs
   exit: 0
   lines: 9
   sha256: 77ee4b69123d26ce99db886b75585e62b201aed8085fb89e741fb0593db3f7aa
   Regression: agenda acquisition rejects query URL byte time and concurrency limits at capacity plus one
   tests: 1
   pass: 1
   fail: 0
   ```

- [x] TP-04-09: `tests/web-evidence.functional.mjs` executes `Regression: shared web policy preserves all existing lane allowlist arguments byte for byte` with fresh evidence.

   ```text
   # replanned-contract-tp-04-09
   $ node --test --test-name-pattern='Regression: shared web policy preserves all existing lane allowlist arguments byte for byte' tests/web-evidence.functional.mjs
   exit: 0
   lines: 9
   sha256: 1b4e2048c15dfd96acd1f358220b0a5e2acedb3573186fef2b6402cd128bf8eb
   Regression: shared web policy preserves all existing lane allowlist arguments byte for byte
   tests: 1
   pass: 1
   fail: 0
   ```

- [x] TP-04-10: `tests/brief-refresh-atomicity.test.mjs` executes `Regression: agenda publication writes immutable files before ledger and moves current pointer last` with fresh evidence.

   ```text
   # replanned-contract-tp-04-10
   $ node --test --test-name-pattern='Regression: agenda publication writes immutable files before ledger and moves current pointer last' tests/brief-refresh-atomicity.test.mjs
   exit: 0
   lines: 9
   sha256: 2bd10c2e510cddf7c7d95676fb183df9e4f7cf93ef8bfec41d647d98d45eaaa2
   Regression: agenda publication writes immutable files before ledger and moves current pointer last
   tests: 1
   pass: 1
   fail: 0
   ```

- [x] TP-04-11: `scripts/validate-brief-payload.mjs` executes `Every declared topic and section is accounted and every mandatory review belongs to the current generation` with fresh evidence.

   ```text
   # replanned-contract-tp-04-11
   $ node scripts/validate-brief-payload.mjs
   exit: 0
   lines: 2
   sha256: 5633a06b8d73d88c69105a844e0949c1ba8ee31d362aeeeb697916d04c599479
   [brief-contract] Every declared topic and section is accounted and every mandatory review belongs to the current generation: PASS
   [brief-contract] PASS: all visible sections, registry coverage, model-specific real assets, and next-session actions are valid
   ```

- [x] TP-04-12: `tests/distributed-briefs.final-budget.stress.mjs` executes `Agenda acquisition and authoring remain within explicit topic byte concurrency and timeout budgets` with fresh evidence.

   ```text
   # replanned-contract-tp-04-12
   $ node --test --test-name-pattern='Agenda acquisition and authoring remain within explicit topic byte concurrency and timeout budgets' tests/distributed-briefs.final-budget.stress.mjs
   exit: 0
   lines: 9
   sha256: 1db84abe24485db857f00a900d6da1bbd1cd23b7d71a42f233d1b5af494db65c
   Agenda acquisition and authoring remain within explicit topic byte concurrency and timeout budgets
   tests: 1
   pass: 1
   fail: 0
   ```

- [x] TP-04-13: `tests/distributed-briefs.final.e2e.mjs` executes `SCN-019-012 real generation publishes one atomic agenda and brief payload transaction` with fresh evidence.

   ```text
   # replanned-contract-tp-04-13
   $ node --test --test-name-pattern='SCN-019-012 real generation publishes one atomic agenda and brief payload transaction' tests/distributed-briefs.final.e2e.mjs
   exit: 0
   lines: 32
   sha256: 4b08a5368d71f7d04cefabce0ca28358db901867b9d34bd442aa26f8627b5275
   SCN-019-012 real generation publishes one atomic agenda and brief payload transaction
   tests: 1
   pass: 1
   fail: 0
   ```

#### Tier 3 - Parity And Policy

- [x] Markdown Test Plan rows, `test-plan.json`, and `scenario-manifest.json` contain the same row and scenario mappings.

   ```text
   # Scope 4 focused matrix
   exit: 0
   tests: 35
   pass: 35
   fail: 0

   artifact lint: exit 0, lines 94, sha256 77ffa3be9ba48135bd7c8efac09e7991ca278f52d24f70238e49814182b5961c
   traceability all scopes: exit 0, lines 159, sha256 806f8d21722564cf7072d4ef6bebbacf7421ee80c192f3a466dda6224b3b6816
   artifact freshness: RESULT PASS, 0 failures, 0 warnings
   capability foundation: PASS Gate G094
   node source lock: actual PASS, adversarial 16, unexpected acceptances 0
   PII scan: files 6342, messages 1246, findings 0
   test-path ratchet: new missing paths 0; three unrelated stale baseline entries retained
   Markdown and JSON: 17 artifact files, reference/fence findings 0
   change boundary: changed paths 53, forbidden paths 0, UI/registration/Feature 020 writes 0
   git diff --check: exit 0
   ```

- [x] Existing critical lane behavior and allowlist arguments remain byte-identical when agenda research succeeds, fails, or is absent.

   ```text
   # replanned-contract-tp-04-07
   $ node --test --test-name-pattern='Regression: research lane timeout leaves every critical lane output byte-identical' tests/distributed-briefs.authorship.integration.mjs
   exit: 0
   lines: 9
   sha256: 7ac42cb843334e6df9022611c5d9b99b475ea0fa11664e801956a7eae8fd6174
   Regression: research lane timeout leaves every critical lane output byte-identical
   tests: 1
   pass: 1
   fail: 0

   # replanned-contract-tp-04-09
   $ node --test --test-name-pattern='Regression: shared web policy preserves all existing lane allowlist arguments byte for byte' tests/web-evidence.functional.mjs
   exit: 0
   lines: 9
   sha256: 1b4e2048c15dfd96acd1f358220b0a5e2acedb3573186fef2b6402cd128bf8eb
   Regression: shared web policy preserves all existing lane allowlist arguments byte for byte
   tests: 1
   pass: 1
   fail: 0
   ```

- [x] Scope 4 adds no tool registration, visible UI, destination eligibility, action, attention item, anomaly seed, candidate, or alert write.

   ```text
   artifact lint: exit 0, lines 94, sha256 77ffa3be9ba48135bd7c8efac09e7991ca278f52d24f70238e49814182b5961c
   traceability all scopes: exit 0, lines 159, sha256 806f8d21722564cf7072d4ef6bebbacf7421ee80c192f3a466dda6224b3b6816
   artifact freshness: RESULT PASS, 0 failures, 0 warnings
   capability foundation: PASS Gate G094
   node source lock: actual PASS, adversarial 16, unexpected acceptances 0
   PII scan: files 6342, messages 1246, findings 0
   test-path ratchet: new missing paths 0; three unrelated stale baseline entries retained
   Markdown and JSON: 17 artifact files, reference/fence findings 0
   change boundary: changed paths 53, forbidden paths 0, UI/registration/Feature 020 writes 0
   git diff --check: exit 0
   ```

- [x] Artifact lint, traceability, capability foundation, artifact freshness, payload, test-path, reference-existence, fence-parity, and diff checks pass.

   ```text
   # Scope 4 full project selftest
   $ node scripts/selftest.mjs
   exit: 0
   lines: 1991
   sha256: b34fae9c0d408726874f2672ef28b11d742597dccb710cb529e8273f2ab388b8
   Research-Lab self-test: 1696 passed, 0 failed

   # Scope 4 full atomic wrapper suite
   $ node --test tests/brief-refresh-atomicity.test.mjs
   exit: 0
   lines: 697
   sha256: 34d00ca9ba3b18ade6df758d2b28aa83718da5a2ea29f519740b28185dd8e851
   tests: 30
   pass: 30
   fail: 0

   artifact lint: exit 0, lines 94, sha256 77ffa3be9ba48135bd7c8efac09e7991ca278f52d24f70238e49814182b5961c
   traceability all scopes: exit 0, lines 159, sha256 806f8d21722564cf7072d4ef6bebbacf7421ee80c192f3a466dda6224b3b6816
   artifact freshness: RESULT PASS, 0 failures, 0 warnings
   capability foundation: PASS Gate G094
   node source lock: actual PASS, adversarial 16, unexpected acceptances 0
   PII scan: files 6342, messages 1246, findings 0
   test-path ratchet: new missing paths 0; three unrelated stale baseline entries retained
   Markdown and JSON: 17 artifact files, reference/fence findings 0
   change boundary: changed paths 53, forbidden paths 0, UI/registration/Feature 020 writes 0
   git diff --check: exit 0
   ```

---

*Educational models only - not investment advice.*
