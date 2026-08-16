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

### historical-replanned-contract-tp-02-02

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

## Gaps Reconciliation 2026-08-15 (Historical Plan)

**Phase:** plan
**Claim Source:** interpreted
**Interpretation:** GAP-08 requires exactly-once lifecycle emission across replayed paused/retired generations and one linked reactivation event. The historical evidence above does not prove that discriminator. Scope 2 is `Not Started` and remains dependency-blocked by Scope 1.

### reconciliation-plan-tp-02-08

**Phase:** plan
**Claim Source:** interpreted
**Interpretation:** This anchor records an unexecuted GAP-08 validation contract. It is not test evidence and cannot satisfy the unchecked DoD item.
**Planned command:** `node --test tests/distributed-briefs.history.e2e.mjs`
**Result:** PLANNED, NOT EXECUTED

### replanned-contract-tp-02-02

**Phase:** test
**Claim Source:** executed

```text
# Feature 019 Scope 2 TP-02-02 and adjacent immutable history checks
$ node scripts/selftest.mjs
exit: 0
lines: 2032
sha256: d9dfabcff6e21e38744ba043595173d9d931c1bde6762db21f5a862e05453a1f
SCN-019-005 paused topic skips review and preserves every historical reference
  ✓ TP-02-01: paused is an explicit non-researched outcome and preserves every historical ref
  ✓ TP-02-01: classification mutates no history and never reports a failed review
SCN-019-006 retirement appends one lifecycle event without deleting history
  ✓ TP-02-02: retirement adds exactly one dated lifecycle row after the unchanged prior ledger
  ✓ TP-02-02: retirement leaves the historical dossier and its reference byte-identical
SCN-019-016 generation review dossier and event identities are deterministic and immutable
  ✓ TP-02-03: generation review and substantive dossier identities repeat exactly and change with inputs
  ✓ TP-02-03: source and ledger event identities are deterministic without clock or filesystem input
Regression: overwrite attempts refuse before mutation and preserve predecessor bytes
  ✓ TP-02-04: generation review dossier source and calibration paths all reject a second create before mutation
  ✓ TP-02-04: mismatched identity paths and missing predecessors refuse while predecessor bytes remain identical
Regression: correction appends a new event and current pointer accepts only validated immutable refs
  ✓ TP-02-05: a correction is a new deterministic row and cannot target an absent event
  ✓ TP-02-05: current accepts complete refs and refuses missing historical unvalidated incomplete or path-mismatched targets
Research-Lab self-test: 1735 passed, 0 failed
verify: bash .github/bubbles/scripts/evidence-capture.sh --verify d9dfabcff6e21e38744ba043595173d9d931c1bde6762db21f5a862e05453a1f -- node scripts/selftest.mjs
```

### replanned-contract-tp-02-08

**Phase:** test
**Claim Source:** executed

```text
# Feature 019 Scope 2 TP-02-08 exact title
$ node --test --test-name-pattern=Regression: repeated paused and retired generations emit one lifecycle event and reactivation appends one linked event tests/distributed-briefs.history.e2e.mjs
exit: 0
lines: 9
sha256: 93be158207445a9117e243befae620264ede6edef46d0883d977b5c1e7212d61
--- output ---
✔ Regression: repeated paused and retired generations emit one lifecycle event and reactivation appends one linked event (250.035875ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 338.026709
```

## Scope 2 Reconciliation Closure 2026-08-15

**Phase:** test
**Claim Source:** executed

The current source uses the exact `supersedesEventId` lifecycle field. The
production planner reads the latest lifecycle event per topic, emits no event
when the state repeats, and links a later state transition to the prior event.
The exact-title GAP-08 test, full history file, adjacent transaction checks,
selftest, focused quality guard, and planning validators all passed in this
session.

### Adjacent Regression Evidence

| Surface | Exit | Result | SHA-256 |
| --- | ---: | --- | --- |
| `node scripts/selftest.mjs` | 0 | 1,735 passed; TP-02-02 plus identity, overwrite, correction, pointer, and seed checks passed | `d9dfabcff6e21e38744ba043595173d9d931c1bde6762db21f5a862e05453a1f` |
| exact TP-02-08 title | 0 | 1 passed, 0 failed | `93be158207445a9117e243befae620264ede6edef46d0883d977b5c1e7212d61` |
| full history E2E | 0 | 4 passed, 0 failed | `c22b03fd1a6b738304df96fe227ad9cab3b9c50ed1686755bdb1828bf310ca96` |
| two agenda transaction/atomicity checks | 0 | 2 passed, 0 failed | `d5ed1638b2150f3909d13e85c9b8c38bb01921817b4872a83ad3baabbce82ed3` |
| focused history regression-quality guard | 0 | 0 violations, 0 warnings | `bffd02239f84080aba7f0eb5f2b490085c9406f1cc8c0c8efb870d910ea83a21` |

### Broad Selftest Guard Classification

The broad guard is not the Scope 2 quality surface. It reports six
`PRODUCTION_PATH_SUBSTITUTION` findings in `scripts/selftest.mjs`, while the
focused guard over the changed GAP-08 E2E file is clean. Each broad finding was
inspected against `HEAD`:

| Line | Classification | GAP-08 disposition |
| ---: | --- | --- |
| 114 | adversarial unescaped-sink detector canary | pre-existing; not production substitution |
| 2419 | explanatory comment quoting the removed unsafe pattern | pre-existing static text |
| 2426 | detector regex scanning the real production page | pre-existing detector implementation |
| 2527 | assertion over an in-memory rendered brief host | pre-existing test assertion |
| 5974 | static source assertion for hidden legacy controls | pre-existing test assertion |
| 7750 | adversarial markup-sink detector canary | pre-existing; proves the detector can fail |

```text
# Feature 019 Scope 2 broad selftest guard classification
$ bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix scripts/selftest.mjs
exit: 1
lines: 21
sha256: bdbf7710e5f13ef8f5de4d71eee5d7faa226b814ecb30930590939d0f9cc4c55
VIOLATION [PRODUCTION_PATH_SUBSTITUTION] scripts/selftest.mjs:114
VIOLATION [PRODUCTION_PATH_SUBSTITUTION] scripts/selftest.mjs:2419
VIOLATION [PRODUCTION_PATH_SUBSTITUTION] scripts/selftest.mjs:2426
VIOLATION [PRODUCTION_PATH_SUBSTITUTION] scripts/selftest.mjs:2527
VIOLATION [PRODUCTION_PATH_SUBSTITUTION] scripts/selftest.mjs:7750
VIOLATION [PRODUCTION_PATH_SUBSTITUTION] scripts/selftest.mjs:5974
Adversarial signal detected in scripts/selftest.mjs
REGRESSION QUALITY RESULT: 6 violation(s), 0 warning(s)
Files scanned: 1
Files with adversarial signals: 1
HEAD_MATCH_EXIT=0
WORKING_MATCH_EXIT=0
SELFTEST_RQG_FINDINGS_PREEXISTING=PASS
```

### Planning And Policy Validation

```text
# Scope 2 reconciliation validation ledger
artifact-lint exit=0 lines=94 sha256=77ffa3be9ba48135bd7c8efac09e7991ca278f52d24f70238e49814182b5961c
traceability exit=0 lines=159 sha256=69e25fa7d4426d176eade40a00b33798456c3c2b38176df6813086c7447a0f16 scenarios=20 warnings=0
artifact-freshness exit=0 lines=24 sha256=9e2f3a69b4231e9ae6ac5263a8f94bf4bdd82cb9dd1f9e944a836f816d1f8297 failures=0 warnings=0
spec-test-paths exit=0 lines=2 sha256=b7c7b500b3ba3b03200ce3989d292946e27d611b78d33dfa00dac48b6a46bc69 new=0 stale=0
reference-existence exit=0 lines=1 sha256=25085caa8385a79d310472d6a305b34eb7f549f54032b969db5fb203ee46aa12 unresolved=0
claim-source-lint exit=0 lines=1 sha256=6210f5e85489b86b19520504105d7179d5a7ea0713dc6e42187cd3d35c5d4653 findings=0
row-parity exit=0 rows=68 anchors=68 missing=0 duplicates=0
JSON_PARSE_EXIT=0 files=3
MARKDOWN_FENCE_EXIT=0 files=14
DIFF_CHECK_EXIT=0
CERTIFICATION_DIGEST_SHA256=a9011f07ea470adc55bbb0fd9f1e76358d3230bec1bd4bc6073bc69312872b80
```

## Reopened Completion Statement (Superseded)

Scope 2 is dependency-blocked and incomplete under the reconciled gaps
contract. TP-02-08 and every invalidated DoD item remain unchecked. No current
completion claim is made.

## Completion Statement

Scope 2 is complete under the reconciled GAP-08 contract. All 16 DoD items are
checked with item-local provenance, all eight Test Plan rows have matching
evidence anchors, and the exact lifecycle replay/reactivation discriminator is
green. Scope 3 is the next eligible implementation target. The workflow remains
in active `gaps` / `in_progress`; this report changes no top-level or
certification-owned state and makes no whole-feature completion claim.

## Post-Transition Validation

**Phase:** plan
**Claim Source:** executed

```text
# Feature 019 Scope 2 final validator ledger
artifact-lint exit=0
traceability-guard --all-scopes exit=0 result=PASSED warnings=0
validate-spec-test-paths exit=0 new=0 stale=0
artifact-freshness-guard exit=0 failures=0 warnings=0
reference-existence-lint exit=0 files=14 unresolved=0
claim-source-lint exit=0 findings=0
68-row parity exit=0 markdown=68 dod=68 json=68 manifest=68 anchors=68
JSON_PARSE_EXIT=0 files=3
MARKDOWN_FENCE_EXIT=0 files=14
DIFF_CHECK_EXIT=0
EDITOR_DIAGNOSTICS_EXIT=0 files=6
exact TP-02-08 replay exit=0 tests=1 pass=1 fail=0
state-transition-guard exit=1 targetStatus=done blockingCode=DELIVERY_COMPLETION_FAILED
state-transition-guard failedGateIds=G022,G053,G040,G097
state-transition-guard failedChecks=Check-4-completion,Check-5-all-done
scope2 evidence check=PASS checkedDoD=16 uncheckedDoD=0
workflow phase=gaps phaseStatus=in_progress activeAgent=bubbles.gaps nextRequiredOwner=bubbles.gaps
currentScope=3 nextRequiredTarget=scopes/03-per-generation-review-policy
certificationDigestSha256=a9011f07ea470adc55bbb0fd9f1e76358d3230bec1bd4bc6073bc69312872b80
protectedAggregateSha256=e736e5ba2e2b23e22790bf2fee211fc765e1bff66ea00d5cf76a27c634abdb8e files=25
```

The transition guard targets whole-feature `done`, so its refusal is expected
while Scope 3 is in progress and Scopes 4-5 are not started. Its Scope 2
evidence checks passed. The remaining G043/G069/G040/G053 findings are
plan-wide or report-wide blockers for eventual feature promotion; they are not
reclassified as GAP-08 defects and are not suppressed here.

## Historical Completion Statement (Superseded)

Scope 2 implementation and all seven replanned Test Plan rows passed current-
session validation. The full selftest passed 1,663 checks. The isolated history
E2E passed all three scenarios. Artifact, traceability, freshness, foundation,
reference, privacy, contract, fence, incomplete-marker, and boundary checks
also passed.

Scope 3 is the next eligible implementation target. This report claims no
whole-feature completion and changes no certification-owned field.

## TP-02-07 And TP-02-08 Fixture Contract Remediation 2026-08-15

**Phase:** test
**Claim Source:** executed

This repair replaces both legacy partial findings with one exact published
finding builder. The builder derives public subjects and all references from
the current topic, definition, and evidence contracts. It validates each
finding through `RLAGENDA.validatePublishedFinding` before publication.

Each repaired fixture also deletes `publicSubjects` from a cloned situation.
It then calls the production `validateResearchSituation` helper before
candidate or history construction. Both probes require this exact refusal:

```text
code: RLAGENDA-CONTRACT-MISSING-MEMBER
reason: finding-shape-invalid
field: publicSubjects
topicId: geopolitical-supply-shock
```

The valid TP-02-07 path then asserts generation and history round-trip,
immutable current graph resolution, predecessor and superseding dossier
identities, overwrite refusal, and byte-prefix preservation.

The valid TP-02-08 path then asserts one pause or retirement event, repeated
suppression, one reactivation event, and the exact `supersedesEventId` link.
It also asserts that no duplicate lifecycle rows appear.

### Red To Green Record

| Test Plan row | Pre-edit result | Post-edit result |
| --- | --- | --- |
| TP-02-07 | Exit 1 before history assertions because no predecessor dossier was produced | Exact title passes after the named missing-member probe |
| TP-02-08 | Exit 1 before lifecycle assertions because no predecessor dossier was produced | Exact title passes across paused and retired branches after the named missing-member probes |

### TP-02-07 Exact Title Evidence

**Executed:** YES (current session)
**Command:** `bash .github/bubbles/scripts/evidence-capture.sh --label 'TP-02-07 exact title after publicSubjects fixture repair' -- node --test '--test-name-pattern=SCN-019-016 real history resolves current and predecessor records without rewriting either' tests/distributed-briefs.history.e2e.mjs`
**Exit Code:** 0
**Output:**

```text
# TP-02-07 exact title after publicSubjects fixture repair
$ node --test --test-name-pattern='SCN-019-016 real history resolves current and predecessor records without rewriting either' tests/distributed-briefs.history.e2e.mjs
exit: 0
lines: 9
sha256: d9551eb21b008aeb927e23305d3ad8c8cd627e47c942c6b4bc7b05ed6de9b5d6
--- output ---
✔ SCN-019-016 real history resolves current and predecessor records without rewriting either (173.301708ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 231.972334
```

**Result:** PASS

### TP-02-08 Exact Title Evidence

**Executed:** YES (current session)
**Command:** `bash .github/bubbles/scripts/evidence-capture.sh --label 'TP-02-08 exact title after publicSubjects fixture repair' -- node --test '--test-name-pattern=Regression: repeated paused and retired generations emit one lifecycle event and reactivation appends one linked event' tests/distributed-briefs.history.e2e.mjs`
**Exit Code:** 0
**Output:**

```text
# TP-02-08 exact title after publicSubjects fixture repair
$ node --test --test-name-pattern='Regression: repeated paused and retired generations emit one lifecycle event and reactivation appends one linked event' tests/distributed-briefs.history.e2e.mjs
exit: 0
lines: 9
sha256: 87ef0d4908507673f31fdc7d7c83ce809252455384ef0bb0eefe7e169881c686
--- output ---
✔ Regression: repeated paused and retired generations emit one lifecycle event and reactivation appends one linked event (454.431208ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 509.046375
```

**Result:** PASS

### Full History E2E Evidence

**Executed:** YES (current session)
**Command:** `bash .github/bubbles/scripts/evidence-capture.sh --label 'Feature 019 Scope 2 full history E2E after fixture repair' -- node --test tests/distributed-briefs.history.e2e.mjs`
**Exit Code:** 0
**Output:**

```text
# Feature 019 Scope 2 full history E2E after fixture repair
$ node --test tests/distributed-briefs.history.e2e.mjs
exit: 0
lines: 12
sha256: 6e02fd2e7c51cad7b240ee8aef38e382a531697846eea322af8321ef8fb6828f
--- output ---
✔ Regression: SCN-002-007 one tool current and monthly history resolve without unrelated narrative reads (10.216333ms)
✔ Regression: SCN-002-008 duplicate projection index rebuild and rollback preserve append-only authority (10.182959ms)
✔ SCN-019-016 real history resolves current and predecessor records without rewriting either (140.802666ms)
✔ Regression: repeated paused and retired generations emit one lifecycle event and reactivation appends one linked event (428.757084ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 644.252541
```

**Result:** PASS

### Adjacent Selftest Evidence

**Executed:** YES (current session)
**Command:** `bash .github/bubbles/scripts/evidence-capture.sh --label 'Feature 019 Scope 2 fixture remediation selftest' -- node scripts/selftest.mjs`
**Exit Code:** 0
**Output:**

```text
# Feature 019 Scope 2 fixture remediation selftest
$ node scripts/selftest.mjs
exit: 0
lines: 2398
sha256: aa4b2cefb7bfb03f161ed2c7d88b8eaede3c59279b20ae8705ff938d62f3978d
--- first 20 ---

Step 1 security — escaped model sinks and CSP on every page
  ✓ every shipped HTML page carries a Content-Security-Policy meta
  ✓ all pages use one identical CSP instead of drifting per page
  ✓ CSP keeps the single-file inline-script design while defaulting to self
  ✓ CSP blocks object, base-tag, and form exfiltration paths
  ✓ CSP connect-src is an explicit origin allowlist, never wildcard https
  ✓ CSP preserves fixed providers, StockAnalysis, and custom-port tailnet proxy paths
  ✓ CSP allows no open URL-forwarding relay origin
  ✓ production pages and shared runtime contain no open URL-forwarding relay chain
  ✓ no model/config-authored field reaches innerHTML without esc()
  ✓ the sink detector catches an unescaped model-authored title

Feature 004 RLFX/RLDATA foundation
  ✓ RLFX CommonJS import preserves the existing global and explicit decisionTime is deterministic
  ✓ RLFX universe is bounded closed and asserts no live source authorization
  ✓ RLDATA source envelopes preserve approved rights and clocks and reject metadata-free rows
  ✓ RLDATA schema-one bars and legacy tool reads remain compatible beside versioned envelopes
  ✓ RLDATA Twelve Data mapping: interval/symbol translate, values sort newest-first → oldest-first with UTC epochs, empty volume → null, error/malformed → null
  ✓ RLFX broad dollar keeps Broad AFE EME and proxy states separate
--- omitted 2358 line(s); sha256 above covers the full output ---
--- last 20 ---
SCN-019-014 stale evidence publishes its age has zero model impact and never masquerades as current
  ✓ TP-04-05: stale evidence has zero impact and the compact read labels stale with its age
  ✓ TP-04-05: stale current review retains only a validated prior snapshot ref and never embeds current model state

SCN-019-018 out-of-boundary refinement is refused and question and boundary bytes remain equal
  ✓ TP-05-01: refinement preserves question and boundary bytes and refuses an out-of-boundary subject by name

SCN-019-019 recursive private fields and non-public subjects are refused at every artifact layer
  ✓ TP-05-02: recursive private fields and non-public subjects are refused while the read-only seam exposes no routing state

Regression: finding and Feature 020 seam refuse each missing or blank required field and never substitute dossier-wide references
  ✓ TP-05-15: the valid seam losslessly projects every exact required finding member and source identity
  ✓ TP-05-15: every missing and blank observation source confidence provenance role subject horizon and ref is refused by named field
  ✓ TP-05-15: unresolved evidence source trigger and invalidation refs refuse instead of borrowing dossier or definition refs
  ✓ TP-05-15: blank topic and dossier identities refuse by named field
  ✓ TP-05-04: the registered agenda tool read is canonical and the collector carries the transaction-composed read

================================================
Research-Lab self-test: 2095 passed, 0 failed
================================================
```

**Result:** PASS

### Quality And Routing Record

| Check | Current-session result |
| --- | --- |
| `regression-quality-guard.sh --bugfix tests/distributed-briefs.history.e2e.mjs` | Exit 0, zero violations, zero warnings, adversarial signal detected |
| anti-mock scan | Exit 0, zero forbidden mock or interception patterns |
| skip-marker scan | Exit 0, zero skip, only, todo, or pending markers |
| editor diagnostics for `tests/distributed-briefs.history.e2e.mjs` | No errors found |

GAP-08 is addressed by this test-owned fixture repair and current execution.
Scope 2 remains `In Progress` until `bubbles.plan` performs reclosure. GAP-07
and GAP-10 remain unresolved for later Scope 4 work. This section changes no
scope status, state, source production, design, spec, or certification field.
