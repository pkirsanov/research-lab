# Scope 2: Immutable Lifecycle And Historical Seed

**Scope ID:** `02-topic-lifecycle`
**Scope Dir:** `scopes/02-topic-lifecycle`
**Status:** Done
**Depends On:** `01-agenda-registry-contract` (foundation)
**Scope-Kind:** runtime-behavior

Related artifacts: [spec.md](../../spec.md), [design.md](../../design.md),
[scope index](../_index.md).

## Replan Evidence Boundary

The existing `report.md` records historical evidence for the superseded
implementation contract. It cannot satisfy any DoD item below. Implementation
must execute every current `TP-02-*` row and append fresh evidence under a
`replanned-contract-tp-02-*` anchor before checking the matching item.

## Outcome

Introduce immutable generation, review, dossier, source, lifecycle-event, and
ledger identities before any live research is wired. A paused or retired topic
is classified without deleting history. A new lifecycle state is a dated event,
never an edit. Existing immutable paths reject overwrite attempts. The current
pointer contract moves last and may point only to validated immutable records.

Seed the primary topic's history from
`notes/us-iran-oil-market-intervention-patterns.md` as a dated historical
dossier and source/calibration record. Its claims retain their 2026-08-10
observation context and never become a current-generation review merely because
they are the first available history.

## Requirement Coverage

FR-019-010, FR-019-012 through FR-019-014, FR-019-030 through FR-019-031,
FR-019-035, and NFR-019-003 through NFR-019-004.

## Gherkin Scenarios

```gherkin
Scenario: SCN-019-005 Pausing suspends review and preserves history
  Given a topic whose lifecycle state is paused
  When the generation reviews the agenda
  Then the topic is not researched
  And its existing dossier history remains readable
  And the published record states that it is paused rather than unavailable

Scenario: SCN-019-006 Retirement is append-only
  Given the operator retires a topic
  When the generation runs
  Then the topic is not researched
  And no prior dossier version is deleted or rewritten
  And the retirement is recorded as a new lifecycle event referencing the topic

Scenario: SCN-019-016 History is append-only
  Given a topic with an existing dossier
  When a new review produces an updated dossier
  Then the new version references the version it supersedes
  And the superseded version is still readable
  And no prior finding, model state, chart series or scenario weight is edited in place
```

## Planned Production Paths

| Path | Disposition | Purpose |
| --- | --- | --- |
| `research/agenda/generations/` | planned new | create-only generation manifests |
| `research/agenda/reviews/<topicId>/` | planned new | create-only current-generation attempts |
| `research/agenda/dossiers/<topicId>/` | planned new | create-only substantive versions |
| `research/agenda/history.jsonl` | planned new | append-only lifecycle/review/correction ledger |
| `research/agenda/current.json` | planned new | validated current pointers, moved last by Scope 4 |
| `research/agenda/dossiers/geopolitical-supply-shock/historical-2026-08-10-v1.json` | planned new | dated historical seed, never current by implication |
| `rlagenda.js` | existing after Scope 1, planned modification | identities, append/correction validation, pointer validation |
| `scripts/selftest.mjs` | existing, planned modification | identity, lifecycle, seed, and overwrite tests |

## Implementation Plan

1. Derive `generationId` from the canonical snapshot digest, registry digest,
   brief window, and generation cutoff. Derive `reviewId` from generation,
   topic, definition, calibration, and evidence-bundle digests. Derive
   `dossierId` from the canonical substantive dossier body. Repeated inputs must
   produce the same id; changed inputs must not collide.
2. Validate create-only paths for generation, review, dossier, source, and
   calibration artifacts. An existing target refuses before write. A new
   dossier must name its predecessor when one exists.
3. Define append-only generation, review, lifecycle, correction, and historical
   seed rows in `history.jsonl`. A correction carries `correctsEventId`; no row
   can shorten, reorder, replace, or delete prior bytes.
4. Classify `paused` and `retired` before review selection. Paused produces an
   explicit non-researched state and preserves history. Retired produces a new
   lifecycle event and no review attempt. Neither is `unavailable`.
5. Validate `current.json` as pointers only. It cannot point to missing,
   mismatched, unvalidated, or historical-only records. This scope defines and
   tests pointer-last semantics; Scope 4 performs the transaction.
6. Convert the existing Iran note into the initial historical dossier/source
   seed without editing the note. Preserve source links, observed/as-of dates,
   limitations, and the historical label. Do not assign a current generation
   id or current pointer to this seed.
7. Add focused real-function tests to `scripts/selftest.mjs` and history-path
   tests to the existing history E2E surface. Include attempted overwrite of
   each immutable family and verify predecessor bytes remain identical.

## Shared Infrastructure Impact Sweep

| Surface | Risk | Canary | Restore boundary |
| --- | --- | --- | --- |
| immutable research tree | overwrite destroys the audit trail | second create at every identity path refuses and original digest remains equal | remove only newly created records before Scope 3 consumes them |
| `history.jsonl` | reordering or correction-in-place destroys chronology | append result retains the exact original byte prefix | restore the pre-scope file bytes |
| `current.json` | an early pointer exposes partial state | missing referenced record and pointer-before-record cases refuse | restore the prior pointer bytes |
| historical Iran seed | dated analysis could masquerade as current | no current pointer resolves to `historical-2026-08-10-v1` | delete the derived seed, never alter the source note |

## Change Boundary

Allowed families are `rlagenda.js`, `research/agenda/**`,
`tests/fixtures/research-agenda/**`, `scripts/selftest.mjs`, and the existing
`tests/distributed-briefs.history.e2e.mjs`. The source note is read-only.
Excluded are acquisition, authoring lanes, deterministic model changes,
payload/page publication, UI/registration, and all Feature 020 destinations.

## Test Plan

| ID | Category | Scenario | Existing test surface | Exact planned test title | Command | Live system |
| --- | --- | --- | --- | --- | --- | --- |
| TP-02-01 | functional | SCN-019-005 | `scripts/selftest.mjs` | `SCN-019-005 paused topic skips review and preserves every historical reference` | `node scripts/selftest.mjs` | No |
| TP-02-02 | functional | SCN-019-006 | `scripts/selftest.mjs` | `SCN-019-006 retirement appends one lifecycle event without deleting history` | `node scripts/selftest.mjs` | No |
| TP-02-03 | unit | SCN-019-016 | `scripts/selftest.mjs` | `SCN-019-016 generation review dossier and event identities are deterministic and immutable` | `node scripts/selftest.mjs` | No |
| TP-02-04 | adversarial | SCN-019-016 | `scripts/selftest.mjs` | `Regression: overwrite attempts refuse before mutation and preserve predecessor bytes` | `node scripts/selftest.mjs` | No |
| TP-02-05 | unit | SCN-019-016 | `scripts/selftest.mjs` | `Regression: correction appends a new event and current pointer accepts only validated immutable refs` | `node scripts/selftest.mjs` | No |
| TP-02-06 | functional | SCN-019-016 | `scripts/selftest.mjs` | `Historical Iran seed retains its dated source context and is never inferred current` | `node scripts/selftest.mjs` | No |
| TP-02-07 | e2e-api | SCN-019-005, SCN-019-006, SCN-019-016 | `tests/distributed-briefs.history.e2e.mjs` | `SCN-019-016 real history resolves current and predecessor records without rewriting either` | `node --test tests/distributed-briefs.history.e2e.mjs` | Yes |

### Definition of Done - Tiered Validation

#### Tier 1 - Behavior

- [x] SCN-019-005, SCN-019-006, and SCN-019-016 satisfy the exact Given/When/Then contracts above.

   Evidence:

   ```text
   # Scope 2 Tier 1 Gherkin behavior validation
   $ node scripts/selftest.mjs
   exit: 0
   lines: 1932
   sha256: a658cee67354353a94d04e7558088d6407295192b5a86e2c46783096d264a10d
   SCN-019-005 paused topic skips review and preserves every historical reference
   TP-02-01: paused is an explicit non-researched outcome and preserves every historical ref
   SCN-019-006 retirement appends one lifecycle event without deleting history
   TP-02-02: retirement adds exactly one dated lifecycle row after the unchanged prior ledger
   SCN-019-016 generation review dossier and event identities are deterministic and immutable
   Research-Lab self-test: 1663 passed, 0 failed
   ```

- [x] Every generation, review, dossier, source, lifecycle, and correction identity is deterministic and create-only.

   Evidence:

   ```text
   # Scope 2 Tier 1 immutable identity validation
   $ node scripts/selftest.mjs
   exit: 0
   lines: 1932
   sha256: f82d7136ce136fba901f811ee781dfa6b9675b4de503872d2155231083608237
   SCN-019-016 generation review dossier and event identities are deterministic and immutable
   TP-02-03: generation review and substantive dossier identities repeat exactly and change with inputs
   TP-02-03: source and ledger event identities are deterministic without clock or filesystem input
   TP-02-04: generation review dossier source and calibration paths all reject a second create before mutation
   TP-02-04: mismatched identity paths and missing predecessors refuse while predecessor bytes remain identical
   Research-Lab self-test: 1663 passed, 0 failed
   ```

- [x] The historical Iran seed is traceable to the existing note, visibly dated, and absent from current pointers until a real current review exists.

   Evidence:

   ```text
   # Scope 2 committed artifact contract validation
   $ node -e '<committed artifact contract validation>'
   exit: 0
   dossier-contract=PASS
   historical-only=PASS
   no-generation=PASS
   no-review=PASS
   note-digest=PASS
   single-ledger-row=PASS
   event-identity=PASS
   artifact-ref=PASS
   current-valid=PASS
   current-empty=PASS
   SCOPE2_ARTIFACT_CONTRACT=PASS
   ```

- [x] Paused and retired states preserve all prior records and remain distinct from a failed attempted review.

   Evidence:

   ```text
   # Scope 2 Tier 1 paused and retired distinction validation
   $ node scripts/selftest.mjs
   exit: 0
   lines: 1932
   sha256: 623c40cb32331a109fd35679f337932ffb9ab692f216b73354449276780796b1
   SCN-019-005 paused topic skips review and preserves every historical reference
   TP-02-01: classification mutates no history and never reports a failed review
   SCN-019-006 retirement appends one lifecycle event without deleting history
   TP-02-02: retirement leaves the historical dossier and its reference byte-identical
   Research-Lab self-test: 1663 passed, 0 failed
   verify: bash .github/bubbles/scripts/evidence-capture.sh --verify 623c40cb32331a109fd35679f337932ffb9ab692f216b73354449276780796b1 -- node scripts/selftest.mjs
   ```

#### Tier 2 - Test Evidence (7 rows)

The seven items below are the complete test-related DoD inventory for this
scope. Each item maps one-to-one to the same ID in the Markdown Test Plan and
`test-plan.json`.

- [x] TP-02-01: `scripts/selftest.mjs` executes `SCN-019-005 paused topic skips review and preserves every historical reference` with fresh evidence.

   Evidence:

   ```text
   # TP-02-01 paused lifecycle and history preservation
   $ node scripts/selftest.mjs
   exit: 0
   lines: 1932
   sha256: 2adf56592ed38389d5301b6c66f8c8ae2befc3971dc5f6a6806666fc1c916a30
   SCN-019-005 paused topic skips review and preserves every historical reference
   TP-02-01: paused is an explicit non-researched outcome and preserves every historical ref
   TP-02-01: classification mutates no history and never reports a failed review
   Research-Lab self-test: 1663 passed, 0 failed
   verify: bash .github/bubbles/scripts/evidence-capture.sh --verify 2adf56592ed38389d5301b6c66f8c8ae2befc3971dc5f6a6806666fc1c916a30 -- node scripts/selftest.mjs
   ```

- [x] TP-02-02: `scripts/selftest.mjs` executes `SCN-019-006 retirement appends one lifecycle event without deleting history` with fresh evidence.

   Evidence:

   ```text
   # TP-02-02 retirement append-only lifecycle event
   $ node scripts/selftest.mjs
   exit: 0
   lines: 1932
   sha256: 22c6b9df7617b70891c101bb9c5a18c56e2229dd2405fbb97cc66903e6aecb85
   SCN-019-006 retirement appends one lifecycle event without deleting history
   TP-02-02: retirement adds exactly one dated lifecycle row after the unchanged prior ledger
   TP-02-02: retirement leaves the historical dossier and its reference byte-identical
   Research-Lab self-test: 1663 passed, 0 failed
   verify: bash .github/bubbles/scripts/evidence-capture.sh --verify 22c6b9df7617b70891c101bb9c5a18c56e2229dd2405fbb97cc66903e6aecb85 -- node scripts/selftest.mjs
   ```

- [x] TP-02-03: `scripts/selftest.mjs` executes `SCN-019-016 generation review dossier and event identities are deterministic and immutable` with fresh evidence.

   Evidence:

   ```text
   # TP-02-03 deterministic immutable identities
   $ node scripts/selftest.mjs
   exit: 0
   lines: 1932
   sha256: 54c0f37423f66288244dc79fe8c941a045d74420ce4750bbe0d31776f4d807e0
   SCN-019-016 generation review dossier and event identities are deterministic and immutable
   TP-02-03: generation review and substantive dossier identities repeat exactly and change with inputs
   TP-02-03: source and ledger event identities are deterministic without clock or filesystem input
   Research-Lab self-test: 1663 passed, 0 failed
   verify: bash .github/bubbles/scripts/evidence-capture.sh --verify 54c0f37423f66288244dc79fe8c941a045d74420ce4750bbe0d31776f4d807e0 -- node scripts/selftest.mjs
   ```

- [x] TP-02-04: `scripts/selftest.mjs` executes `Regression: overwrite attempts refuse before mutation and preserve predecessor bytes` with fresh evidence.

   Evidence:

   ```text
   # TP-02-04 immutable overwrite refusal and byte preservation
   $ node scripts/selftest.mjs
   exit: 0
   lines: 1932
   sha256: 6f08a066c97b9a9f5e8feb9d0d78e4c2ee3acc909a0b3c18d5bd727e6623df3a
   Regression: overwrite attempts refuse before mutation and preserve predecessor bytes
   TP-02-04: generation review dossier source and calibration paths all reject a second create before mutation
   TP-02-04: mismatched identity paths and missing predecessors refuse while predecessor bytes remain identical
   Research-Lab self-test: 1663 passed, 0 failed
   verify: bash .github/bubbles/scripts/evidence-capture.sh --verify 6f08a066c97b9a9f5e8feb9d0d78e4c2ee3acc909a0b3c18d5bd727e6623df3a -- node scripts/selftest.mjs
   ```

- [x] TP-02-05: `scripts/selftest.mjs` executes `Regression: correction appends a new event and current pointer accepts only validated immutable refs` with fresh evidence.

   Evidence:

   ```text
   # TP-02-05 correction append and current pointer integrity
   $ node scripts/selftest.mjs
   exit: 0
   lines: 1932
   sha256: 176c2d1f1cef3033599ab2120a1291e81f196882870b8f2975c4998ca457510d
   Regression: correction appends a new event and current pointer accepts only validated immutable refs
   TP-02-05: a correction is a new deterministic row and cannot target an absent event
   TP-02-05: current accepts complete refs and refuses missing historical unvalidated incomplete or path-mismatched targets
   Research-Lab self-test: 1663 passed, 0 failed
   verify: bash .github/bubbles/scripts/evidence-capture.sh --verify 176c2d1f1cef3033599ab2120a1291e81f196882870b8f2975c4998ca457510d -- node scripts/selftest.mjs
   ```

- [x] TP-02-06: `scripts/selftest.mjs` executes `Historical Iran seed retains its dated source context and is never inferred current` with fresh evidence.

   Evidence:

   ```text
   # TP-02-06 dated historical seed is never current
   $ node scripts/selftest.mjs
   exit: 0
   lines: 1932
   sha256: e75eff78cf0f59382471e4549b467be2a465d93a655a5e454ececf37c31a7ba0
   Historical Iran seed retains its dated source context and is never inferred current
   TP-02-06: the seed is visibly historical and byte-traceable to the unchanged August 10 source note
   TP-02-06: every dated finding carries provenance and the eight historical sections retain public source links
   TP-02-06: the ledger records the dated seed while the initial pointer infers no current generation or review
   Research-Lab self-test: 1663 passed, 0 failed
   verify: bash .github/bubbles/scripts/evidence-capture.sh --verify e75eff78cf0f59382471e4549b467be2a465d93a655a5e454ececf37c31a7ba0 -- node scripts/selftest.mjs
   ```

- [x] TP-02-07: `tests/distributed-briefs.history.e2e.mjs` executes `SCN-019-016 real history resolves current and predecessor records without rewriting either` with fresh evidence.

   Evidence:

   ```text
   # TP-02-07 real history current and predecessor round trip
   $ node --test tests/distributed-briefs.history.e2e.mjs
   exit: 0
   lines: 11
   sha256: 4550e54a58e5804c3d3fd892b764b00a9c0c84f904630867f7e8dbc1f9b695d3
   Regression: SCN-002-007 one tool current and monthly history resolve without unrelated narrative reads
   Regression: SCN-002-008 duplicate projection index rebuild and rollback preserve append-only authority
   SCN-019-016 real history resolves current and predecessor records without rewriting either
   tests 3
   pass 3
   fail 0
   cancelled 0
   skipped 0
   todo 0
   ```

#### Tier 3 - Parity And Policy

- [x] Markdown Test Plan rows, `test-plan.json`, and `scenario-manifest.json` contain the same row and scenario mappings.

   Evidence:

   ```text
   # Feature 019 traceability guard with Scope 2 active
   $ bash .github/bubbles/scripts/traceability-guard.sh specs/019-custom-recurring-research-agenda --all-scopes
   exit: 0
   lines: 159
   sha256: f79906af9811cc76c5b5fe293f70b0ddc8b83aa46bec207b8fb37171c86e3de4
   scenario-manifest.json covers 20 scenario contract(s)
   scenario-manifest.json records evidenceRefs
   All linked tests from scenario-manifest.json exist
   DoD fidelity: 20 scenarios checked, 20 mapped to DoD, 0 unmapped
   RESULT: PASSED (0 warnings)
   ```

- [x] Artifact and reference checks resolve every planned immutable family while treating the source note as read-only.

   Evidence:

   ```text
   # Feature 019 artifact freshness with Scope 2 active
   $ bash .github/bubbles/scripts/artifact-freshness-guard.sh specs/019-custom-recurring-research-agenda
   exit: 0
   lines: 24
   sha256: 8007101a590c6628d5b9fb68672979fbe2580174bb07014bd52c999f88429139
   spec.md has no superseded/suppressed sections
   design.md has no superseded/suppressed sections
   No superseded scope sections detected
   All per-scope directories are referenced by scopes/_index.md
   RESULT: PASS (0 failures, 0 warnings)
   verify: bash .github/bubbles/scripts/evidence-capture.sh --verify 8007101a590c6628d5b9fb68672979fbe2580174bb07014bd52c999f88429139 -- bash .github/bubbles/scripts/artifact-freshness-guard.sh specs/019-custom-recurring-research-agenda
   ```

- [x] The implementation diff stays inside the declared change boundary; the note and every excluded brief/destination surface remain byte-identical.

   Evidence:

   ```text
   # Scope 2 change-boundary classifier
   exit: 0
   lines: 13
   sha256: 63a2995edeb7361cc9f87f3652559c807b5d6bc6a18b4e1f748d28252d81df36
   changedPaths=31
   scope2Paths=9
   inheritedPaths=22
   unknownPaths=0
   feature020OrBriefDestinations=0
   sourceNoteDiffExit=0
   unknownList=none
   destinationList=none
   SCOPE2_BOUNDARY=PASS
   ```

- [x] Artifact lint, traceability, artifact freshness, test-path, reference-existence, fence-parity, and diff checks pass.

   Evidence:

   ```text
   # Scope 2 artifact lint before status transition
   $ bash .github/bubbles/scripts/artifact-lint.sh specs/019-custom-recurring-research-agenda
   exit: 0
   lines: 94
   sha256: 77ffa3be9ba48135bd7c8efac09e7991ca278f52d24f70238e49814182b5961c
   Per-scope layout contains 5 scope file(s)
   Every per-scope directory has a report.md file
   All DoD bullet items use checkbox syntax in scopes/02-topic-lifecycle/scope.md
   No unfilled evidence template placeholders in scopes/02-topic-lifecycle/report.md
   Artifact lint PASSED.
   verify: bash .github/bubbles/scripts/evidence-capture.sh --verify 77ffa3be9ba48135bd7c8efac09e7991ca278f52d24f70238e49814182b5961c -- bash .github/bubbles/scripts/artifact-lint.sh specs/019-custom-recurring-research-agenda
   ```

---

*Educational models only - not investment advice.*
