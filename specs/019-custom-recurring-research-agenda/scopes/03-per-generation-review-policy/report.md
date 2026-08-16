# Scope 3 Execution Report - Offline Plan And Deterministic Models

## Summary

Scope 3 implements the offline all-topic generation plan and the deterministic
evidence, scenario, flow, commodity, proxy, comparison, and chart models. The
models consume committed inputs only. Predecessor output enters comparison only.

## Test Evidence

### replanned-contract-tp-03-01

```text
# TP-03-01 explicit cadence offline
$ node scripts/selftest.mjs
exit: 0
lines: 1981
sha256: f59d3a5fee87731a3e7065904b60fff145cac59d8be3415c1a6cd77a9396eafb
SCN-019-008 explicit cadence separates not-due and elapsed topics offline
TP-03-01: explicit review clocks separate inside-cadence and elapsed topics with no network input
TP-03-01: active every-generation work remains first and separate from cadence capacity
Research-Lab self-test: 1690 passed, 0 failed
Result: PASS
```

### replanned-contract-tp-03-02

```text
# TP-03-02 mandatory complete section plan
$ node --test tests/distributed-briefs.final.unit.mjs
exit: 0
lines: 11
sha256: 299724d544c9b27efb0a33d245d3df5971660177d09100e4377d8e65b644f5e0
SCN-002-025 final compaction retained required fields
SCN-002-027 low-noise gate retained its owner contract
SCN-019-009 every-generation topic is mandatory and every analytical section is planned
tests: 3
pass: 3
fail: 0
```

### replanned-contract-tp-03-03

```text
# TP-03-03 committed trigger rearm
$ node scripts/selftest.mjs
exit: 0
lines: 1981
sha256: e07d85714b68b5d468719759c3a0f98b5183a148642eb45571f725735d9713ea
SCN-019-010 committed-evidence trigger rearms cadence and names itself
TP-03-03: a matching committed observation rearms only its cadence topic and names the trigger
TP-03-03: an observation after the generation cutoff cannot fire the trigger
TP-03-03: an observation already absorbed by the last review cannot rearm cadence forever
Research-Lab self-test: 1690 passed, 0 failed
```

### historical-replanned-contract-tp-03-04

```text
# TP-03-04 separate capacity boundaries
$ node scripts/selftest.mjs
exit: 0
lines: 1981
sha256: a9d43ac286239242d839ddea27d24bdb59810a2ebca970f465cb0b688a60aa4d
Regression: mandatory capacity plus one refuses and cadence budget plus one preserves mandatory work
TP-03-04: mandatory capacity plus one refuses the generation rather than converting or deferring work
TP-03-04: cadence budget plus one preserves mandatory work and accounts for the deferred cadence topic
Research-Lab self-test: 1690 passed, 0 failed
mandatory-capacity: PASS
cadence-budget: PASS
```

### replanned-contract-tp-03-05

```text
# TP-03-05 deterministic all-topic accounting
$ node scripts/selftest.mjs
exit: 0
lines: 1981
sha256: e6b36ed165d77f87633c020d4c71a8d1b12ff13131387a0f0b0bf64722a25f05
SCN-019-011 deterministic cadence ordering and all-topic accounting preserve every unselected topic
TP-03-05: declaration order deterministically selects defense first and records food as deferred
TP-03-05: every registry row has exactly one classification and every selected row remains visible
TP-03-05: one invalid topic is refused by name while valid mandatory and cadence topics remain executable
Research-Lab self-test: 1690 passed, 0 failed
```

### replanned-contract-tp-03-06

```text
# TP-03-06 predecessor exclusion and reversal
$ node scripts/selftest.mjs
exit: 0
lines: 1981
sha256: 81fdaa9c203c765cca53184125b3a42348bb0b8f4c65db736fc5ab4fe6cc7e6a
Regression: predecessor probabilities cannot smooth or seed current scenario probabilities
TP-03-06: opposite predecessor output creates a reversal label but leaves current probabilities byte-identical
TP-03-06: current probability math has no predecessor input and prior score lives only in comparison
TP-03-06: question-byte drift refuses before classification while low valid coverage remains insufficient evidence
Research-Lab self-test: 1690 passed, 0 failed
```

### replanned-contract-tp-03-07

```text
# TP-03-07 indirect evidence contract
$ node scripts/selftest.mjs
exit: 0
lines: 1981
sha256: 0d94529a749ea0008225cab6820f5be79c22920ed3031abcc7bb15846ff6ce01
Regression: indirect evidence without a causal path or refuter is refused before model impact
TP-03-07: indirect evidence needs a causal path refuter and at least one affected actor channel or claim
TP-03-07: model inference cannot cite itself as an input record
Research-Lab self-test: 1690 passed, 0 failed
indirect-contract: PASS
self-reference: REFUSED
```

### replanned-contract-tp-03-08

```text
# TP-03-08 stale and fired-refuter zero impact
$ node scripts/selftest.mjs
exit: 0
lines: 1981
sha256: 025ae4d3a430d853c9509ee75be03d9f36b546ab00321caa991a9ceac633b131
Regression: stale evidence and fired refuters have zero impact while conflicts remain visible
TP-03-08: stale evidence has zero impact while its unresolved conflict remains visible
TP-03-08: a fired declared refuter zeros impact and preserves the refuter and conflict record
Research-Lab self-test: 1690 passed, 0 failed
stale-impact: 0
fired-refuter-impact: 0
```

### replanned-contract-tp-03-09

```text
# TP-03-09 stable-prior softmax invariants
$ node scripts/selftest.mjs
exit: 0
lines: 1981
sha256: 90c908665989cf2aae929b666d5733f359e4bdec5e317c5660e80ef07bdf7025
Scenario probabilities use stable priors current evidence and sum to one at every sibling set
TP-03-09: zero current impacts reproduce the stable definition priors exactly
TP-03-09: current weighted impacts move the softmax while every sibling set and child branch remain normalized
Research-Lab self-test: 1690 passed, 0 failed
root-normalization: PASS
child-normalization: PASS
```

### replanned-contract-tp-03-10

```text
# TP-03-10 non-additive unique flow
$ node scripts/selftest.mjs
exit: 0
lines: 1981
sha256: dbcb289a2b3a87ef64ad8125cb506e2fa98f16cf44050c27944e2f86509c2e68
Regression: one flow crossing Hormuz and Bab el-Mandeb counts physical loss once and reroute ton-miles separately
TP-03-10: two half-open route edges produce one 75 percent impairment rather than two additive losses
TP-03-10: reroute ton-miles and insured throughput remain separate and scenario filtering excludes unrelated flows
Research-Lab self-test: 1690 passed, 0 failed
physical-impairment: 0.75
additive-double-count: REFUSED
```

### historical-replanned-contract-tp-03-11

```text
# TP-03-11 attributed commodity and proxy intervals
$ node scripts/selftest.mjs
exit: 0
lines: 1981
sha256: 5fa5db63b9239d5a9b55ced7e7011d2627812fd184684e53ee8369a5a200d56a
Commodity and proxy ranges preserve low base high order attribution and insufficient-evidence states
TP-03-11: scenario probability is load-bearing and attributed commodity intervals preserve low base high order
TP-03-11: a missing required current bar yields unavailable rather than a zero range
TP-03-11: proxy range exposes ordered channel calibration and operating components
TP-03-11: a proxy below its explicit calibration minimum publishes insufficient evidence
Research-Lab self-test: 1690 passed, 0 failed
```

### replanned-contract-tp-03-12

```text
# TP-03-12 chart and table single row source
$ node scripts/selftest.mjs
exit: 0
lines: 1981
sha256: 66c64e293cb969ad6f237a21f40a31f5bcaacb5b77823c4ae551656053947e75
Chart series and adjacent table rows share values units order and immutable review identities
TP-03-12: chart and table consume the same ordered immutable review rows and units
TP-03-12: the projection is frozen and preserves annotation identity and canonical values without second math
Research-Lab self-test: 1690 passed, 0 failed
chart-table-parity: PASS
projection-frozen: PASS
```

### historical-replanned-contract-tp-03-13

```text
# TP-03-13 real offline committed-artifact model run
$ node --test tests/distributed-briefs.final.e2e.mjs
exit: 0
lines: 11
sha256: a7f383a61514a0fcf420351d7b994dc0470ed95db6a6d283a9e96b8f882ee7ad
SCN-002-025 retained cutoff-relevant owner evidence
SCN-002-027 retained zero action-slot impact
SCN-019-009 real committed agenda produces an offline mandatory plan and deterministic current-only models
tests: 3
pass: 3
fail: 0
network calls: 0
```

## Build Quality Evidence

```text
artifact lint: exit 0, lines 94, sha256 77ffa3be9ba48135bd7c8efac09e7991ca278f52d24f70238e49814182b5961c
traceability guard: exit 0, lines 159, sha256 f98aa036bfb517c5bce0259d57addb4969222ffe6cfac4328600f5898090e526
artifact freshness: exit 0, lines 24, sha256 c417eb538ad185e322a04ff35d1e4566a7bc1ac1a28d257a4ed66f2c1f453205
capability foundation: exit 0, lines 6, sha256 d2b244e1749f54de2414b79c9220ccde7bce2e649bb2d4e3b07a47cee7a2501b
reference existence: exit 0, 14 markdown files, every relative target resolves
test-path ratchet: exit 0, new missing paths 0, three unrelated stale baseline entries
PII scan: exit 0, files 6342, messages 1246, findings 0
change boundary: exit 0, Scope 3 paths 8, unknown paths 0, destination writes 0
pure owner: exit 0, nine exports, one owner, no fetch, storage, clock, or randomness
incomplete markers: exit 0, 2931 added or new lines, findings 0
Markdown and JSON: exit 0
diff check: exit 0
```

## Gaps Reconciliation 2026-08-15

**Phase:** plan
**Claim Source:** interpreted
**Interpretation:** GAP-02, GAP-03, and the change-assessment part of GAP-09 require exact model-input shape, an exact five-lever contract with no hidden proxy adjustment, and integrated post-freeze change assessment. The historical evidence above does not prove those discriminators. Scope 3 is `Not Started` and remains dependency-blocked by Scopes 1 and 2.

### planning-replanned-contract-tp-03-14

**Phase:** plan
**Claim Source:** interpreted
**Interpretation:** This anchor records the unexecuted GAP-02 exact model-input contract. It is not test evidence.
**Planned command:** `node scripts/selftest.mjs`
**Result:** PLANNED, NOT EXECUTED

### planning-replanned-contract-tp-03-15

**Phase:** plan
**Claim Source:** interpreted
**Interpretation:** This anchor records the unexecuted GAP-03 exact five-lever contract. It is not test evidence.
**Planned command:** `node scripts/selftest.mjs`
**Result:** PLANNED, NOT EXECUTED

### planning-replanned-contract-tp-03-16

**Phase:** plan
**Claim Source:** interpreted
**Interpretation:** This anchor records the unexecuted GAP-09 integrated change-assessment contract. It is not test evidence.
**Planned command:** `node --test tests/distributed-briefs.final.e2e.mjs`
**Result:** PLANNED, NOT EXECUTED

## Fresh Independent Scope 3 Acceptance Evidence

The raw blocks below were executed by the independent test owner. This
reconciliation independently inspected the cited assertion paths and reran both
commands against the current tree. The corroborating full captures passed with
hashes `6059649b09d20d125f9c0c64fee48137d677af1346ca42f8b5b80cf0102c10bd`
for the 2,091-check selftest and
`3c55fc0e7476bc34ca23e52fa0df83f2c089aff081b15446e4ebd74fdc06f5fb`
for the six-test E2E. Those rerun hashes remain separate because full output
contains run-specific lines and timing.

### replanned-contract-tp-03-04

**Phase:** test
**Claim Source:** executed

```text
# Feature 019 Scope 3 exact model contract acceptance
$ node scripts/selftest.mjs
exit: 0
sha256: bfd557fb2582bc815a2e1f28c20e0ab81e2884d573f4f22150330161c0f11606
TP-03-04: mandatory capacity plus one refuses; cadence budget preserves mandatory work
TP-03-11: ordered commodity/proxy ranges; missing bar unavailable; thin calibration insufficient
TP-03-14: complete exact input validates and freezes before arithmetic
TP-03-14: deleting levers.demandOffset refuses before arithmetic
TP-03-14: unknown levers.proxyAdjustment refuses before arithmetic
TP-03-14: missing demandOffset is not substituted with 0; non-finite and pass-mismatch inputs refuse
TP-03-15: published input exposes exactly five visible levers
TP-03-15: proxyAdjustment is an unknown-member refusal
TP-03-15: each lever change reports exactly that one changedLeverId
TP-03-15: proxy ranges contain no hidden proxy-adjustment term
Research-Lab self-test: 2091 passed, 0 failed
```

### replanned-contract-tp-03-11

**Phase:** test
**Claim Source:** executed

```text
# Feature 019 Scope 3 exact model contract acceptance
$ node scripts/selftest.mjs
exit: 0
sha256: bfd557fb2582bc815a2e1f28c20e0ab81e2884d573f4f22150330161c0f11606
TP-03-04: mandatory capacity plus one refuses; cadence budget preserves mandatory work
TP-03-11: ordered commodity/proxy ranges; missing bar unavailable; thin calibration insufficient
TP-03-14: complete exact input validates and freezes before arithmetic
TP-03-14: deleting levers.demandOffset refuses before arithmetic
TP-03-14: unknown levers.proxyAdjustment refuses before arithmetic
TP-03-14: missing demandOffset is not substituted with 0; non-finite and pass-mismatch inputs refuse
TP-03-15: published input exposes exactly five visible levers
TP-03-15: proxyAdjustment is an unknown-member refusal
TP-03-15: each lever change reports exactly that one changedLeverId
TP-03-15: proxy ranges contain no hidden proxy-adjustment term
Research-Lab self-test: 2091 passed, 0 failed
```

### replanned-contract-tp-03-13

**Phase:** test
**Claim Source:** executed

```text
# Feature 019 Scope 3 committed model and integrated assessment acceptance
$ node --test tests/distributed-briefs.final.e2e.mjs
exit: 0
sha256: 406b31c3b13b403ae52d473d84a26b22ba880613f5b2a6199c6668388f636543
SCN-019-009 real committed agenda produces an offline mandatory plan and deterministic current-only models
Regression: current deterministic outputs feed one integrated change assessment after exact model input validation
tests 6
pass 6
fail 0
skipped 0
todo 0
```

### replanned-contract-tp-03-14

**Phase:** test
**Claim Source:** interpreted
**Interpretation:** The passing selftest executes the required-member deletion
matrix, the unknown-member matrix, non-finite and range probes, and the
published-pass mismatch probe against `validateResearchModelInput` and
`recomputeAgendaModelOutputs`. Every refusal occurs before a value is returned;
the selected raw lines below are representative outputs from that complete
matrix.

```text
# Feature 019 Scope 3 exact model contract acceptance
$ node scripts/selftest.mjs
exit: 0
sha256: bfd557fb2582bc815a2e1f28c20e0ab81e2884d573f4f22150330161c0f11606
TP-03-04: mandatory capacity plus one refuses; cadence budget preserves mandatory work
TP-03-11: ordered commodity/proxy ranges; missing bar unavailable; thin calibration insufficient
TP-03-14: complete exact input validates and freezes before arithmetic
TP-03-14: deleting levers.demandOffset refuses before arithmetic
TP-03-14: unknown levers.proxyAdjustment refuses before arithmetic
TP-03-14: missing demandOffset is not substituted with 0; non-finite and pass-mismatch inputs refuse
TP-03-15: published input exposes exactly five visible levers
TP-03-15: proxyAdjustment is an unknown-member refusal
TP-03-15: each lever change reports exactly that one changedLeverId
TP-03-15: proxy ranges contain no hidden proxy-adjustment term
Research-Lab self-test: 2091 passed, 0 failed
```

### replanned-contract-tp-03-15

**Phase:** test
**Claim Source:** executed

```text
# Feature 019 Scope 3 exact model contract acceptance
$ node scripts/selftest.mjs
exit: 0
sha256: bfd557fb2582bc815a2e1f28c20e0ab81e2884d573f4f22150330161c0f11606
TP-03-04: mandatory capacity plus one refuses; cadence budget preserves mandatory work
TP-03-11: ordered commodity/proxy ranges; missing bar unavailable; thin calibration insufficient
TP-03-14: complete exact input validates and freezes before arithmetic
TP-03-14: deleting levers.demandOffset refuses before arithmetic
TP-03-14: unknown levers.proxyAdjustment refuses before arithmetic
TP-03-14: missing demandOffset is not substituted with 0; non-finite and pass-mismatch inputs refuse
TP-03-15: published input exposes exactly five visible levers
TP-03-15: proxyAdjustment is an unknown-member refusal
TP-03-15: each lever change reports exactly that one changedLeverId
TP-03-15: proxy ranges contain no hidden proxy-adjustment term
Research-Lab self-test: 2091 passed, 0 failed
```

### replanned-contract-tp-03-16

**Phase:** test
**Claim Source:** interpreted
**Interpretation:** The named passing E2E contains 31 assertions. They accept a
null predecessor, prove byte-identical current outputs with opposite and extreme
predecessors, verify the exact assessment and causal shapes, and refuse changed
question bytes as `E019-AGENDA-CHANGE-ASSESSMENT` with reason
`RLAGENDA-MODEL-INVALID`, no published value, and a frozen refusal.

```text
# Feature 019 Scope 3 committed model and integrated assessment acceptance
$ node --test tests/distributed-briefs.final.e2e.mjs
exit: 0
sha256: 406b31c3b13b403ae52d473d84a26b22ba880613f5b2a6199c6668388f636543
SCN-019-009 real committed agenda produces an offline mandatory plan and deterministic current-only models
Regression: current deterministic outputs feed one integrated change assessment after exact model input validation
tests 6
pass 6
fail 0
skipped 0
todo 0
```

## Final Reconciliation Validation

**Phase:** test
**Claim Source:** executed

```text
# Feature 019 Scope 3 final reconciliation ledger
scope3 checked=24 unchecked=0 status=done
scope4 status=in_progress currentScope=4
execution phase=gaps phaseStatus=in_progress activeAgent=bubbles.gaps nextRequiredOwner=bubbles.gaps
artifact-lint exit=0 lines=94 sha256=77ffa3be9ba48135bd7c8efac09e7991ca278f52d24f70238e49814182b5961c
traceability exit=0 lines=159 sha256=08cfa6b046340d9860068976bb601c8e87b8de9188df81b5c027fe9400c2fb4b warnings=0
capability-foundation exit=0 lines=6 sha256=2a1af0b0e21edd1b532758bfdce68edc3fcb0d44f43a785c785ef3bde32356ff
spec-test-paths exit=0 lines=2 sha256=f9e0b27468a1c2e6cb7661d3ab55a0785e32697f1499dc7903171a66e8a91b0b new=0 stale=0
artifact-freshness exit=0 lines=24 sha256=9359bdd2559ef8b417bb5d03bdb6bea23f25dce56fa65b2144e9eaef0f2ef8c7 failures=0 warnings=0
reference-existence exit=0 lines=1 sha256=25085caa8385a79d310472d6a305b34eb7f549f54032b969db5fb203ee46aa12 unresolved=0
claim-source-provenance exit=0 lines=1 sha256=6210f5e85489b86b19520504105d7179d5a7ea0713dc6e42187cd3d35c5d4653 findings=0
JSON_PARSE_EXIT=0 files=3
MARKDOWN_FENCES files=14 unbalanced=0
FEATURE019_68_ROW_PARITY_EXIT=0 rows=68 duplicates=0
DIFF_CHECK_EXIT=0
EDITOR_DIAGNOSTICS_EXIT=0 files=6
CERTIFICATION_DIGEST_SHA256=a9011f07ea470adc55bbb0fd9f1e76358d3230bec1bd4bc6073bc69312872b80
```

## Completion Statement

Scope 3 is complete under the reconciled GAP-02, GAP-03, and GAP-09 contracts.
All 24 DoD items are checked with item-local provenance, all 16 Test Plan rows
have active evidence anchors, and the exact 68-row cross-artifact parity is
green. Scope 4 is now the active remediation target. The overall workflow
remains `gaps` / `in_progress` with `bubbles.gaps` as `activeAgent` and
`nextRequiredOwner`; the next implementation handoff is `bubbles.implement`
for Scope 4. No whole-feature or gaps-completion claim is made, and no
certification-owned field changes.

## Historical Completion Statement (Superseded)

Scope 3 implementation and all 13 replanned Test Plan rows passed current-
session validation. The full selftest passed 1,690 checks. The functional and
committed-artifact E2E surfaces each passed three tests. Structural,
traceability, freshness, foundation, reference, privacy, purity, completeness,
boundary, Markdown, JSON, and diff checks also passed.

Scope 4 is the next eligible implementation target. This report claims no
whole-feature completion and changes no certification-owned field.
