# Scope 07 Report: Bounded History and Legacy Migration

**Status:** Done

Links: [scope.md](scope.md) | [spec.md](../../spec.md) | [scope index](../_index.md)

## Summary

Scope 07 delivers the bounded static-history layer and the read-only legacy migration for the
distributed briefs. Three new Node modules were added: `scripts/brief-publication.mjs`
(`buildPublishSet`, `validatePublishSet`, `selectHistory`, `rollbackPublication`, plus the shared
`regenerateIndexes`/`canonicalMonthFromEtRunDate`/`pointerBytes` helpers) implements the designed
`briefs/` layout — content-addressed evidence/read/tool-brief/final objects, immutable per-run
manifests, monthly append-only JSONL streams (`history/{tools,final,runs,recommendations,evidence}`),
compact content-addressed indexes, and the two mutable pointer selectors `briefs/current.json` and
`briefs/history-current.json`; `scripts/migrate-brief-history.mjs` (`inventoryLegacyHistory`,
`mapLegacyRows`, `validateMigrationParity`, CLI default `--check`) inventories the ACTUAL
`brief-history.jsonl` and proves strict one-to-one parity with the row count DERIVED from the live file
(never a literal); and `scripts/validate-distributed-briefs.mjs` (`validateCurrentGraph`,
`validateHistoryGraph`, `validateCompatibilityProjection`, CLI `--root`) is the independent whole-graph
validator. Publish sets are byte-deterministic and idempotent, append-only prefixes and sealed months
are enforced (fail-closed `B002-HISTORY`), focused history reads resolve to the smallest partition set,
rollback is a pure pointer-swap that deletes nothing, and the legacy file is proven byte-identical.
All work is additive and within the declared Change Boundary; the atomic cutover that publishes
`briefs/current.json` into the repository root and disables the legacy writer is later-scope work
(Scope 09), so the layout and migration are exercised against isolated temporary directories and the
read-only actual corpus.

## Decision Record

- **In-memory staging, isolated-FS tests.** `buildPublishSet`/`validatePublishSet` operate on an
  in-memory staged publish set (path → `{bytes, sha256}`); the integration/load tests materialize it
  into an OS temp directory and validate it on disk. The repository's authoritative history is never
  written by any test (scope.md line 76).
- **Derived legacy row count.** `inventoryLegacyHistory` counts the raw non-empty lines actually
  present in the bytes it is given; the count is never a literal. Against the live corpus the CLI and
  tests observe 55 rows today; the tests assert equality with an independent dynamic line count, so
  they keep passing as the scheduler appends.
- **Content-addressed dedup excludes the occurrence timestamp.** A migrated read content object is the
  canonical row minus its `ts` occurrence field, so exact duplicate content collapses to one object
  while every occurrence (with its distinct raw-line fingerprint) is retained. The live corpus
  naturally exercises this: 52 distinct content objects + 3 duplicate occurrences = 55 rows.
- **No invented legacy narrative.** No historical `ToolBrief`, recommendation lifecycle, or final
  narrative is reconstructed; every occurrence records explicit `legacy-tool-brief-unavailable`,
  `legacy-recommendation-unavailable`, and `legacy-final-unavailable` (a final link would require a Git
  proof, which is absent for these rows).
- **Rollback swaps only the publication pointer.** `rollbackPublication` restores `briefs/current.json`
  to a prior validated manifest and regenerates the compatibility projections; the append-only history
  pointer is not rolled back, and no immutable object or partition is deleted or rewritten.

## Completion Statement

Complete. Every Scope 07 DoD item is met with reproduced current-session evidence recorded below. The
production surface is left uncommitted in the working tree for the parent to stage and commit;
certification remains owned by bubbles.validate.

## Code Diff Evidence

Working-tree changes (all within the declared Change Boundary; `git status --porcelain`):

```
 M scripts/selftest.mjs
?? scripts/brief-publication.mjs
?? scripts/migrate-brief-history.mjs
?? scripts/validate-distributed-briefs.mjs
?? tests/distributed-briefs.history.e2e.mjs
?? tests/distributed-briefs.history.functional.mjs
?? tests/distributed-briefs.history.integration.mjs
?? tests/distributed-briefs.history.load.mjs
?? tests/distributed-briefs.history.unit.mjs
?? tests/distributed-briefs.migration.e2e.mjs
?? tests/distributed-briefs.migration.integration.mjs
?? tests/fixtures/feature-002/history/
```

- `scripts/brief-publication.mjs` — new bounded-history staging module (objects, monthly JSONL,
  indexes, manifest, pointers, compatibility projections, focused selection, pointer-swap rollback).
- `scripts/migrate-brief-history.mjs` — new read-only legacy migration; default `--check`.
- `scripts/validate-distributed-briefs.mjs` — new independent whole-graph validator; CLI `--root`.
- `scripts/selftest.mjs` — additive Scope 07 selftest group (baseline row TP-07-13).
- `tests/…` — the seven declared Scope 07 test files plus `tests/fixtures/feature-002/history/`
  (`history-fixture-builder.mjs`: publish-set builder + isolated-FS helpers + in-memory legacy synthesis).

Out-of-scope surfaces were NOT modified: `brief-history.jsonl` (read-only, byte-identical), `tools.json`,
`rldata.js`, `index.html`, `rlnav.js`, `rlapp.js`, `rlbrief.js`, `market-brief.payload.json`,
`market-brief.snapshot.json`, other specs. Verified via `git status --porcelain <paths>` returning empty.

## Test Evidence

All commands executed in the current session with full unfiltered output; exit codes recorded. RED
stages use a controlled mutation of the uncommitted module, then a byte-exact restore verified by
SHA-256 (`brief-publication.mjs` b74a19e8…, `migrate-brief-history.mjs` 73e57b5a…,
`validate-distributed-briefs.mjs` ec84c96f… — all re-hashed equal after every restore).

### [TP-07-01] Unit — smallest-partition history selection (RED before GREEN)

RED: `selectHistory` tool-key filter disabled. `node --test tests/distributed-briefs.history.unit.mjs`
produced 1 fail, exit 1, exact discriminator:

```
✖ SCN-002-007: history selection returns the smallest tool month and recommendation partition set
  AssertionError: Expected values to be strictly deep-equal:
  + actual   [ 'briefs/history/tools/etf-momentum-lab/2026-07.jsonl', 'briefs/history/tools/sector-research-lab/2026-07.jsonl' ]
  - expected [ 'briefs/history/tools/sector-research-lab/2026-07.jsonl' ]
```

GREEN (filter restored byte-exact): a single tool+month resolves exactly one partition (never the other
month, other tool, final, or global stream); a recommendation key+month resolves exactly the one
recommendation partition; an absent selector is a closed refusal. `✔ SCN-002-007 …` (pass 2 / fail 0).

**Claim Source:** executed.

### [TP-07-02] Unit — byte-deterministic idempotent projection/index (RED before GREEN)

RED: a `process.hrtime.bigint()` nonce injected into the run manifest body.
`node --test tests/distributed-briefs.history.unit.mjs` produced 1 fail, exit 1:

```
✖ SCN-002-008: history projection and index regeneration are byte deterministic and idempotent
  AssertionError: deterministic bytes for briefs/runs/2026-07/run-det/manifest.json
  actual 'sha256:2d5a6a19…' expected 'sha256:d5a6a193…'
```

GREEN (nonce removed byte-exact): identical run input yields byte-identical objects, index fingerprint,
and pointers across two builds; `regenerateIndexes` over the authoritative merged rows reproduces the
same fingerprint and partition metadata; re-projection does not churn row counts. `✔ SCN-002-008 …`.

**Claim Source:** executed.

### [TP-07-03] Functional — append-only/index corruption fails closed (RED before GREEN)

RED: `validatePublishSet` duplicate-event detection disabled.
`node --test tests/distributed-briefs.history.functional.mjs` produced 1 fail, exit 1 — the duplicate
case then surfaces the tampered hash as `B002-PUBLISH-SET` instead of the expected duplicate error:

```
✖ Duplicate event changed prefix sealed edit malformed row and index mismatch fail closed
  AssertionError: expected 'B002-HISTORY' actual 'B002-PUBLISH-SET'
```

GREEN (check restored byte-exact): each mutation fails closed with `B002-HISTORY` and no pointer
candidate — duplicate recommendation event (`duplicate-event`), changed JSONL prefix
(`prefix-mutation`), sealed-month edit (`sealed-partition-edit`), malformed row (`malformed-row`), and
index disagreement (`index-mismatch`). `✔ Duplicate event … fail closed`.

**Claim Source:** executed.

### [TP-07-04] Integration — isolated filesystem publish/validate/rollback (GREEN)

`node --test tests/distributed-briefs.history.integration.mjs` — a run-1 publish set is materialized
into an OS temp dir; the whole-graph validator confirms coherent current/history/compat pointers on
disk; a chained run-2 append preserves the exact byte prefix on disk; sealing `2026-07` makes a further
append a fail-closed `sealed-partition-edit` that never reaches disk; a pointer-swap rollback restores
`briefs/current.json` to run-1 while run-2 objects remain and history stays coherent.
`✔ real isolated filesystem publish set preserves prefixes sealed months and coherent pointers`
(pass 1 / fail 0).

**Claim Source:** executed.

### [TP-07-05] Integration — actual-corpus migration parity (RED before GREEN)

RED: `mapLegacyRows` set to drop duplicate occurrences.
`node --test tests/distributed-briefs.migration.integration.mjs` produced 1 fail, exit 1:

```
✖ actual legacy corpus maps all actual rows (derived count) with exact hashes times windows and explicit gaps
  AssertionError: one occurrence per actual row  52 !== 55
```

GREEN (mapping restored byte-exact): the derived row count (independent dynamic line count) equals the
mapped occurrence count one-to-one; every raw-row fingerprint is preserved; window/time coverage and
min/max are unchanged; duplicate content preserves every occurrence; tool-brief/recommendation/final
are explicitly unavailable; the file is byte-identical before/after.
`✔ actual legacy corpus maps all actual rows (derived count) …`.

**Claim Source:** executed.

### [TP-07-06] Load — 31-day four-window history within budgets (GREEN)

`node tests/distributed-briefs.history.load.mjs`, exit 0:

```
Load: 31-day four-window history stays bounded to 124 authoritative references
  ✓ drove 124 runs (31 days x 4 windows == 124)
  ✓ runs partition holds exactly 124 authoritative references (got 124)
  ✓ every partition stays in the single canonical month 2026-07
  ✓ largest JSONL row 355B within the 64 KiB row budget
  ✓ largest monthly partition 43927B within the 4 MiB partition budget
  ✓ history index 33237B within the 1 MiB index budget
  ✓ index regeneration is idempotent under load
  ✓ final run validates append-only (ok)
history load: 8 passed, 0 failed
```

**Claim Source:** executed.

### [TP-07-07] Regression E2E — SCN-002-007 focused resolution (RED before GREEN)

Covered by RED #1 (`selectHistory` filter disabled): `node --test tests/distributed-briefs.history.e2e.mjs`
produced the failure `exactly one monthly partition answers recent history  3 !== 1`, exit 1. GREEN
(restored): a single-tool agent resolves current + focused history through the pointer, one read object,
and one monthly partition, reading no unrelated tool object, no final narrative, no evidence bundle, and
no global-history stream. `✔ Regression: SCN-002-007 one tool current and monthly history resolve
without unrelated narrative reads`.

**Claim Source:** executed.

### [TP-07-08] Regression E2E — SCN-002-008 append-only authority (RED before GREEN)

RED: `buildPublishSet` merged-partition set to `appended` only (prior prefix dropped).
`node --test tests/distributed-briefs.history.e2e.mjs` produced 1 fail, exit 1 — `validatePublishSet`
rejects the broken append (`prefix-mutation`) so the regression's `ok === true` assertion fails:

```
✖ Regression: SCN-002-008 duplicate projection index rebuild and rollback preserve append-only authority
  AssertionError: false !== true   (tests/distributed-briefs.history.e2e.mjs:66)
```

GREEN (concat restored byte-exact): duplicate projection is byte-identical, the on-disk index rebuild
proves both runs' rows are present, and pointer-swap rollback keeps run-2 objects and both append-only
rows. `✔ Regression: SCN-002-008 … preserve append-only authority`.

**Claim Source:** executed.

### [TP-07-09] Regression E2E — SCN-002-009 immutable-byte migration (RED before GREEN)

Covered by RED #4 (dropped duplicate occurrences): `node --test tests/distributed-briefs.migration.e2e.mjs`
produced parity failure `{"code":"B002-MIGRATION","reason":"occurrence-count-mismatch","detail":"rows=55
occurrences=52"}`, exit 1. GREEN (restored): every actual row (derived count) migrates into externally
inspectable partitions/index in an isolated root, each row carries a deterministic legacy key + exact
source-row fingerprint + explicit unavailable gaps and no narrative body, and the real legacy file is
byte-identical. `✔ Regression: SCN-002-009 all actual legacy rows (derived count) migrate with immutable
bytes and no invented narratives`.

**Claim Source:** executed.

### [TP-07-10] Integration — actual-corpus no-write migration command (GREEN)

`node scripts/migrate-brief-history.mjs --check`, exit 0 — the row count is derived from the live file
and the bytes are unchanged before/after:

```
{
  "ok": true,
  "action": "check",
  "file": "brief-history.jsonl",
  "derivedRowCount": 55,
  "byteLength": 876625,
  "fileSha256Before": "sha256:df8376c704de3f257b40626ec66ff2b74c0b286ad25091399773a3a1ecfc9a8f",
  "fileSha256After":  "sha256:df8376c704de3f257b40626ec66ff2b74c0b286ad25091399773a3a1ecfc9a8f",
  "bytesUnchanged": true,
  "parity": { "occurrenceCount": 55, "distinctContentObjects": 52, "duplicateOccurrences": 3,
              "explicitUnavailable": { "toolBriefs": 55, "recommendations": 55, "finals": 55 } }
}
```

`git status --porcelain brief-history.jsonl` returned empty (file untouched).

**Claim Source:** executed.

### [TP-07-11] Integration — whole-graph current/history validation (GREEN)

`node scripts/validate-distributed-briefs.mjs --root .`, exit 0 — no `briefs/` graph is published in the
repository root yet (the atomic cutover is Scope 09), so the graph is legitimately absent and validation
is vacuously clean; the RED/inconsistency path is exercised on isolated corrupted graphs in TP-07-04:

```
{ "ok": true, "root": ".",
  "currentGraph": { "ok": true, "present": false, "reason": "no-current-pointer-published" },
  "historyGraph": { "ok": true, "present": false, "reason": "no-history-pointer-published" },
  "compatibilityProjection": { "ok": true, "present": false, "pointerBound": false } }
```

**Claim Source:** executed.

### [TP-07-12] Full Regression — authorship + history + migration E2E (GREEN)

`node --test tests/distributed-briefs.authorship.e2e.mjs tests/distributed-briefs.history.e2e.mjs
tests/distributed-briefs.migration.e2e.mjs` (run within the full distributed-briefs node:test surface)
— the complete persistent-scenario suite passes together: the full distributed-briefs node:test run
reported `ℹ tests 23  ℹ pass 23  ℹ fail 0` (Scope 01–07, no regression).

**Claim Source:** executed.

### [TP-07-13] Baseline — full repository selftest (GREEN)

`node scripts/selftest.mjs`, exit 0:

```
================================================
Research-Lab self-test: 624 passed, 0 failed
================================================
```

Baseline rose from 616 → 624 (the additive Scope 07 selftest group; storage/migration altered no
existing behavior).

**Claim Source:** executed.

## Uncertainty Declarations

- The compatibility projections (`market-brief.payload.json`/`market-brief.snapshot.json`) that
  `buildPublishSet` emits are staged/isolated artifacts tied to a run; the repository-root projection
  cutover (switching the live files to the pointer-selected run and disabling the legacy writer) is
  Scope 09 work and is intentionally not performed here. The whole-graph validator therefore reports the
  root projections as `pointerBound: false` today, which is the correct pre-cutover state.

## Scenario Contract Evidence

- **SCN-002-007** (resolve current + focused history through bounded reads): TP-07-01 (unit) + TP-07-07
  (e2e) — smallest tool/month + recommendation partition selection, single-tool agent reads pointer +
  one object + one partition with no unrelated narrative. RED-before-GREEN recorded.
- **SCN-002-008** (append authoritative history and rebuild indexes without mutation): TP-07-02 (unit)
  + TP-07-03 (functional) + TP-07-04 (integration) + TP-07-08 (e2e) — byte-deterministic idempotent
  projection, fail-closed corruption handling, isolated-FS append-only prefixes, and rollback preserving
  append-only authority. RED-before-GREEN recorded for 02/03/08.
- **SCN-002-009** (migrate every legacy row without inventing absent content): TP-07-05 (integration) +
  TP-07-09 (e2e) + TP-07-10 (command) — derived-count one-to-one parity, exact hashes/times/windows,
  duplicate occurrences preserved, explicit gaps, byte-identical legacy file. RED-before-GREEN recorded.

## Coverage Report

Coverage is expressed through the scenario-to-test matrix above: every SCN-002-007/008/009 behavior maps
to at least one unit/functional/integration/e2e test with the exact declared title, and the load test
measures the production projection against every declared artifact budget. The full distributed-briefs
node:test surface (23 tests) and the repository selftest (624 assertions) are green with zero failures.

## Lint and Quality

- `node scripts/validate-node-source-lock.mjs` — `[node-source-lock] OK adversarial=16
  unexpectedAcceptances=0`, exit 0.
- `bash .github/bubbles/scripts/artifact-lint.sh specs/002-distributed-tool-briefs-and-history` —
  `Artifact lint PASSED.`, exit 0 (only informational deprecated-field warnings on the pre-existing
  state.json v2 fields).
- Node source-lock manifest/npmrc/lockfile/graph all PASS; no dependency files were touched.

## Validation Summary

- Consumer sweep: `node scripts/validate-brief-payload.mjs market-brief.payload.json` — `[brief-contract]
  PASS`, exit 0, on the UNCHANGED root payload (legacy-bytes / root-projection / prior-read canaries hold).
- Static-service canary: the static test server, browser harness, and shared renderer/pages were not
  touched (`git status --porcelain` shows only in-scope paths).
- `node scripts/validate-brief-cache.mjs` — `[brief-cache] PASS: 354 JSON cache files`, exit 0.
- Legacy-bytes canary: `brief-history.jsonl` SHA-256 identical before/after every command and
  `git status --porcelain brief-history.jsonl` empty.

## Audit Verdict

Delivery evidence is complete and reproduced in-session; certification (`certification.*`) remains owned
by bubbles.validate and is not asserted here. Scope 07 execution is Done with `dodComplete: true`,
`certified: false`.
