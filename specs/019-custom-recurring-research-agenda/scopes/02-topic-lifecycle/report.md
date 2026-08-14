# Scope 2 Execution Report - Immutable Lifecycle And Historical Seed

## Summary

Scope 2 adds deterministic immutable identities, create-only path binding,
append-only lifecycle and correction events, and validated current pointers.
It also converts the August 10 Iran note into a dated historical-only dossier.
The initial ledger records that seed while the current pointer remains empty.

## Test Evidence

### replanned-contract-tp-02-01

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

### replanned-contract-tp-02-02

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

### replanned-contract-tp-02-03

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

### replanned-contract-tp-02-04

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

### replanned-contract-tp-02-05

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

### replanned-contract-tp-02-06

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

### replanned-contract-tp-02-07

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
verify: bash .github/bubbles/scripts/evidence-capture.sh --verify 4550e54a58e5804c3d3fd892b764b00a9c0c84f904630867f7e8dbc1f9b695d3 -- node --test tests/distributed-briefs.history.e2e.mjs
```

## Build Quality Evidence

```text
artifact lint: exit 0, lines 94, sha256 77ffa3be9ba48135bd7c8efac09e7991ca278f52d24f70238e49814182b5961c
traceability guard: exit 0, lines 159, sha256 f79906af9811cc76c5b5fe293f70b0ddc8b83aa46bec207b8fb37171c86e3de4
artifact freshness: exit 0, lines 24, sha256 8007101a590c6628d5b9fb68672979fbe2580174bb07014bd52c999f88429139
capability foundation: exit 0, lines 6, sha256 d2b244e1749f54de2414b79c9220ccde7bce2e649bb2d4e3b07a47cee7a2501b
reference existence: exit 0, 14 markdown files, every relative target resolves
test-path ratchet: exit 0, new missing paths 0, three unrelated stale baseline entries
PII scan: exit 0, files 6342, messages 1246, findings 0
committed artifact contract: exit 0, 13 checks passed
markdown fences: exit 0, 14 files, unbalanced files 0
incomplete markers: exit 0, 2263 added or new lines, findings 0
change boundary: exit 0, Scope 2 paths 9, unknown paths 0, destination writes 0
source note diff: exit 0, unchanged
```

## Completion Statement

Scope 2 implementation and all seven replanned Test Plan rows passed current-
session validation. The full selftest passed 1,663 checks. The isolated history
E2E passed all three scenarios. Artifact, traceability, freshness, foundation,
reference, privacy, contract, fence, incomplete-marker, and boundary checks
also passed.

Scope 3 is the next eligible implementation target. This report claims no
whole-feature completion and changes no certification-owned field.
