# Scope 07: Bounded History and Legacy Migration

**Status:** Not Started
**Depends On:** 06
**Scope-Kind:** runtime-behavior
**Requirements:** FR-037 through FR-054, FR-059; NFR-001 through NFR-005, NFR-008, NFR-013 through NFR-015

Links: [spec.md](../../spec.md) | [design.md](../../design.md) | [scope index](../_index.md) | [user validation](../../uservalidation.md)

## Outcome

Make current and historical brief data directly selectable: immutable complete objects, monthly bounded append-only streams, compact reproducible indexes, and two coherent pointer contracts. Migrate the actual 26-row legacy corpus by exact bytes/hashes/timestamps/windows while preserving every occurrence and every historical absence, with no reconstructed per-tool or final narrative.

### Gherkin Scenarios

#### SCN-002-007: Resolve current and focused history through bounded reads

```gherkin
Scenario: SCN-002-007 reads one tool current record and one relevant monthly partition
  Given a validated current pointer history pointer immutable objects and compact indexes exist
  When an agent selects one tool and canonical month
  Then one small current pointer and one complete tool brief answer current state
  And the compact index plus at most one per-tool monthly partition answer recent history
  And no unrelated source final narrative legacy global history or unselected partition is required
```

#### SCN-002-008: Append authoritative history and rebuild indexes without mutation

```gherkin
Scenario: SCN-002-008 appends tool final run recommendation and evidence history atomically
  Given prior monthly streams and indexes pass byte and prefix integrity validation
  When an accepted run projects content objects rows indexes and pointers
  Then unchanged narrative content is referenced rather than copied
  And duplicate event IDs changed prefixes sealed edits malformed rows index disagreement or mixed-run refs refuse the publish set
  And rebuilding indexes from authoritative rows produces the same canonical metadata without changing history
```

#### SCN-002-009: Migrate every legacy row without inventing absent content

```gherkin
Scenario: SCN-002-009 migrates the immutable 26-row brief-history corpus
  Given the exact source bytes full hash row hashes timestamps windows and Git evidence are read-only inputs
  When the production migration maps canonical run occurrences objects partitions and indexes
  Then all 26 source rows and every timestamp and window are accounted for exactly once
  And exact duplicate content is stored once with every occurrence retained
  And unproven per-tool briefs recommendations and final narratives are explicitly unavailable rather than reconstructed
  And the legacy file remains byte-identical
```

### Implementation Plan

1. Add the designed `briefs/` layout with content-addressed evidence/read/tool-brief/final objects, immutable run manifests, monthly evidence/tool/final/run/recommendation JSONL streams, content-addressed indexes, and only `briefs/current.json` plus `briefs/history-current.json` as mutable selectors.
2. Implement storage/history functions in `scripts/brief-publication.mjs::{buildPublishSet,validatePublishSet,selectHistory,rollbackPublication}` for canonical month selection from intended ET run date, row/event IDs, exact prefix append, sealed-month immutability, correction links, closed inventory, and pointer/hash/run coherence.
3. Implement compact index fields only: contract version, path, month/range, count, bytes, SHA-256, keys/state counts, and current refs. Narrative bodies are forbidden. Rebuild scans authoritative rows/object headers and writes a new content-addressed index; no last-write-wins repair exists.
4. Implement `loadCurrent`/`selectHistory` validators for declared paths, byte caps, contract versions, manifest/run/cutoff/hash agreement, smallest partition selection, and fail-closed malformed/mixed data.
5. Add `scripts/migrate-brief-history.mjs::{inventoryLegacyHistory,mapLegacyRows,validateMigrationParity}` with default `--check`: exact file and 26 raw-line hashes, deterministic legacy keys, normalized data actually present, duplicate-content refs, Git-proven final association only, and explicit unavailable fields.
6. Keep `brief-history.jsonl` read-only and byte-identical. Stop its writer only in the later atomic cutover after migration parity. Preserve complete generated `market-brief.payload.json` and `market-brief.snapshot.json` compatibility projections tied to the same selected run.
7. Prove manifest pointer rollback and index regeneration without model/source/author execution or history mutation. Corrupt objects/partitions restore from Git history; the renderer never guesses around them.

### Change Boundary

**Allowed:** new storage/history/index/pointer/migration/whole-graph validator modules; generated `briefs/**` fixtures/artifacts; compatibility projection generation; Scope 07 tests; read-only access to actual `brief-history.jsonl` and Git evidence.

**Excluded:** direct edit or append to `brief-history.jsonl`, source acquisition, owner formulas/reads, author/reducer behavior, final narrative policy, scheduler commit/push integration, UI renderer/pages, dependency files, other specs, and unrelated dirty/untracked paths.

### Consumer Impact Sweep

Inventory all consumers of `brief-history.jsonl`, `market-brief.payload.json`, `market-brief.snapshot.json`, Market Brief eager `Promise.all`, change-memory logic, scheduler staged inventory, docs, and tests. Search navigation/deep links/static paths/config/docs/tests for mutable-root or global-history assumptions. Preserve complete root compatibility outputs until every first-party consumer uses or validates the pointer-selected run.

### Shared Infrastructure Impact Sweep

Storage, history, static server MIME/path handling, and migration source are protected. Independent canaries prove legacy bytes, current root projections, existing static JSON/JSONL service, and prior Market Brief reads before broad suites. Rollback selects a prior validated manifest and regenerates compatibility projections; it never deletes immutable objects/events or rewrites a partition.

### Test Plan

The actual legacy corpus is production input, not a fixture. Load coverage is required by the explicit monthly 124-reference and 4 MiB partition budgets. All filesystem categories use isolated temporary directories and remotes and never write the repository's authoritative history.

| Test Type | Category | Scenario | File / Exact Test Title | Command | Live System | Red -> Green Contract |
| --- | --- | --- | --- | --- | --- | --- |
| Unit | unit | SCN-002-007 | `tests/distributed-briefs.history.unit.mjs` - `SCN-002-007: history selection returns the smallest tool month and recommendation partition set` | `node --test tests/distributed-briefs.history.unit.mjs` | No | Red: query loads unrelated paths; Green: exact deterministic minimal selection passes. |
| Unit | unit | SCN-002-008 | `tests/distributed-briefs.history.unit.mjs` - `SCN-002-008: history projection and index regeneration are byte deterministic and idempotent` | `node --test tests/distributed-briefs.history.unit.mjs` | No | Red: repeated projection churns rows/index; Green: canonical bytes and IDs remain exact. |
| Functional | functional | SCN-002-008 | `tests/distributed-briefs.history.functional.mjs` - `Duplicate event changed prefix sealed edit malformed row and index mismatch fail closed` | `node --test tests/distributed-briefs.history.functional.mjs` | No | Red: corruption is accepted/repaired silently; Green: each mutation returns B002-HISTORY with no pointer candidate. |
| Integration | integration | SCN-002-008 | `tests/distributed-briefs.history.integration.mjs` - `real isolated filesystem publish set preserves prefixes sealed months and coherent pointers` | `node --test tests/distributed-briefs.history.integration.mjs` | Yes | Red: actual files expose mixed state; Green: production build/validate/rollback works atomically in isolation. |
| Integration | integration | SCN-002-009 | `tests/distributed-briefs.migration.integration.mjs` - `actual legacy corpus maps all 26 rows with exact hashes times windows and explicit gaps` | `node --test tests/distributed-briefs.migration.integration.mjs` | Yes | Red: a row/hash/gap is lost or invented; Green: actual-corpus parity and byte preservation pass. |
| Load | load | SCN-002-007, SCN-002-008 | `tests/distributed-briefs.history.load.mjs` - `Load: 31-day four-window history stays bounded to 124 authoritative references` | `node tests/distributed-briefs.history.load.mjs` | Yes | Red: partition/index/body/file caps or idempotency breach; Green: measured production projection remains within every declared budget. |
| Regression E2E | e2e-api | SCN-002-007 | `tests/distributed-briefs.history.e2e.mjs` - `Regression: SCN-002-007 one tool current and monthly history resolve without unrelated narrative reads` | `node --test tests/distributed-briefs.history.e2e.mjs` | Yes | Red: static consumer must scan global history; Green: real artifacts answer through pointer/index/one partition. |
| Regression E2E | e2e-api | SCN-002-008 | `tests/distributed-briefs.history.e2e.mjs` - `Regression: SCN-002-008 duplicate projection index rebuild and rollback preserve append-only authority` | `node --test tests/distributed-briefs.history.e2e.mjs` | Yes | Red: public graph mutates/duplicates; Green: hashes/rows/pointers prove idempotence. |
| Regression E2E | e2e-api | SCN-002-009 | `tests/distributed-briefs.migration.e2e.mjs` - `Regression: SCN-002-009 all 26 legacy rows migrate with immutable bytes and no invented narratives` | `node --test tests/distributed-briefs.migration.e2e.mjs` | Yes | Red: actual corpus parity fails; Green: every occurrence/gap/ref is externally inspectable. |
| Integration | integration | SCN-002-009 | `scripts/migrate-brief-history.mjs` - actual-corpus no-write parity check | `node scripts/migrate-brief-history.mjs --check` | Yes | Red: production migration differs or writes source; Green: exact parity returns clean with unchanged bytes. |
| Integration | integration | SCN-002-007, SCN-002-008 | `scripts/validate-distributed-briefs.mjs` - current and history whole-graph validation | `node scripts/validate-distributed-briefs.mjs --root .` | Yes | Red: committed graph has missing/mixed/hash-invalid refs; Green: every pointer/object/row/index/projection reconciles. |
| Full Regression | e2e-api | SCN-002-007, SCN-002-008, SCN-002-009 | Complete authorship and history E2E suite | `node --test tests/distributed-briefs.authorship.e2e.mjs tests/distributed-briefs.history.e2e.mjs tests/distributed-briefs.migration.e2e.mjs` | Yes | Red: upstream lifecycle/history behavior regresses; Green: all persistent scenarios pass together. |
| Baseline | functional | SCN-002-007, SCN-002-008, SCN-002-009 | Existing complete repository selftest | `node scripts/selftest.mjs` | Yes | Red: storage migration alters existing behavior; Green: unchanged baseline passes. |

### Definition of Done - Tiered Validation

Core outcomes:

- [ ] Current objects, monthly streams, compact indexes, pointers, whole-graph validation, smallest-partition selection, idempotent projection, sealed immutability, correction links, rollback, and index regeneration implement the designed static access contract.
- [ ] Actual-corpus migration accounts for exactly 26 source rows, exact bytes/hashes/times/windows, duplicate occurrences, proven final links, and explicit unavailable content without changing the legacy file.
- [ ] Compatibility payload/snapshot outputs select the same coherent run, and the legacy writer remains active until later cutover validation explicitly disables it.
- [ ] Consumer and Shared Infrastructure Impact Sweeps, independent storage/static/legacy canaries, rollback, and the declared Change Boundary are complete with unrelated dirty paths unchanged and unstaged.

Test evidence items, one per Test Plan row:

- [ ] [TP-07-01] Unit evidence passes for smallest-partition selection after its recorded red stage.
- [ ] [TP-07-02] Unit evidence passes for deterministic projection/index regeneration after its recorded red stage.
- [ ] [TP-07-03] Functional evidence passes for every append-only/index corruption mutation.
- [ ] [TP-07-04] Integration evidence passes for isolated filesystem publish validation and rollback.
- [ ] [TP-07-05] Integration evidence passes for exact actual-corpus 26-row migration parity.
- [ ] [TP-07-06] Load evidence passes for the declared 31-day/124-reference and artifact budgets.
- [ ] [TP-07-07] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior in SCN-002-007 pass with the exact title.
- [ ] [TP-07-08] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior in SCN-002-008 pass with the exact title.
- [ ] [TP-07-09] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior in SCN-002-009 pass with the exact title.
- [ ] [TP-07-10] Integration evidence passes for the actual-corpus no-write migration command.
- [ ] [TP-07-11] Integration evidence passes for whole-graph current/history validation.
- [ ] [TP-07-12] Broader E2E regression suite passes for authorship and history behavior.
- [ ] [TP-07-13] Baseline functional evidence passes for `node scripts/selftest.mjs` after focused checks are green.

Build quality gate:

- [ ] Exact Node checks, JSONL/path/hash/append-only/privacy and self-validation scans, legacy byte proof, artifact validation, diff isolation, and full output are recorded in this scope report with zero warning or undeclared mutation.
