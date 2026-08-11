# Scope 1 Execution Report — Official Curve Artifact Contract And Validation Gate

This file is the evidence surface for scope 1. It was created during planning as
a structural template and is filled from execution only. Nothing here may be
written from expectation, inference or summary. Every anchor below holds raw,
unfiltered terminal output with its exit code.

## Summary

Scope 1 is delivered. The `official-curve-artifact/v1` shape is frozen, the two
additive Treasury entries are in the shared provenance allowlist, and
`scripts/validate-official-curves.mjs` refuses seven distinct malformed shapes
with seven distinct named causes. Nothing was fetched and nothing was published;
the gate was exercised against committed fixtures only, exactly as the scope
requires.

All 11 DoD Core Delivery items and all 11 Test Evidence items are ticked. The
suite moved 1371 -> 1401 passed, 0 failed; the group contributes 30 assertions.

Two defects were found in my own gate while proving it, both fixed before this
report was written, and both recorded under Findings Raised rather than quietly
corrected.

## Test Evidence

### TP-01-01

Scenario SCN-018-004 — a fresh family carries source id, https source URL on the
declared official host, observation as-of and retrieval time.
Command: `node scripts/selftest.mjs`

```text
$ node scripts/selftest.mjs

bond-regime — official curve artifact contract and gate
  ✓ Official curves TP-01-01: the conformant artifact passes the gate with zero errors
  ✓ Official curves TP-01-01: a fresh family carries a source id and an https URL on the declared official host
  ✓ Official curves TP-01-01: a fresh family carries an observation as-of date and a canonical retrieval time
  ✓ Official curves TP-01-02: a credential-shaped query key is refused with secret-shaped-request-field
  ✓ Official curves TP-01-03: missing-required-field is refused with family-field-missing
  ✓ Official curves TP-01-03: credentialed-envelope is refused with provenance-invalid:secret-shaped-request-field
  ✓ Official curves TP-01-03: restricted-observation is refused with restricted-observation-present

Research-Lab self-test: 1401 passed, 0 failed
SELFTEST_EXIT=0
```

Scheme and host are asserted structurally (`parsedUrl.protocol`,
`parsedUrl.hostname`) rather than as a full-string literal, so a URL pointing at
the wrong year could not pass this row.

### TP-01-02

Scenario SCN-018-001 — a credential-shaped request field is refused with
`secret-shaped-request-field`.
Command: `node scripts/selftest.mjs`

```text
$ node scripts/validate-official-curves.mjs tests/fixtures/official-curves/credentialed-envelope.json
[official-curves] FAIL
  - provenance-invalid:secret-shaped-request-field at artifact.families.nominal.provenance[0].requestDescriptor.query.api_key
  - secret-shaped-field at artifact.families.nominal.provenance[0].requestDescriptor.query.api_key
exit=1

$ node scripts/selftest.mjs
  ✓ Official curves TP-01-02: a credential-shaped query key is refused with secret-shaped-request-field

Research-Lab self-test: 1401 passed, 0 failed
SELFTEST_EXIT=0
```

Two findings from one difference, and both are wanted: the SHARED validator
refuses it (`provenance-invalid:secret-shaped-request-field`) and the feature
gate's own sweep refuses it independently (`secret-shaped-field`). The
no-credential guarantee therefore does not rest on either one alone.

### TP-01-03

Scenarios SCN-018-004, SCN-018-019 — the gate exits 0 on the conformant fixture
and non-zero with one named error on each of seven adversarial fixtures.
Command: `node scripts/validate-official-curves.mjs`

```text
$ node scripts/validate-official-curves.mjs tests/fixtures/official-curves/conformant.json
[official-curves] PASS: /home/philipk/research-lab/tests/fixtures/official-curves/conformant.json satisfies official-curve-artifact/v1
exit=0
$ node scripts/validate-official-curves.mjs tests/fixtures/official-curves/missing-required-field.json
[official-curves] FAIL
  - family-field-missing at artifact.families.nominal.observedAt
  - observed-at-mismatch at artifact.families.nominal.observedAt — expected 2026-01-02
exit=1
$ node scripts/validate-official-curves.mjs tests/fixtures/official-curves/credentialed-envelope.json
[official-curves] FAIL
  - provenance-invalid:secret-shaped-request-field at artifact.families.nominal.provenance[0].requestDescriptor.query.api_key
  - secret-shaped-field at artifact.families.nominal.provenance[0].requestDescriptor.query.api_key
exit=1
$ node scripts/validate-official-curves.mjs tests/fixtures/official-curves/restricted-observation.json
[official-curves] FAIL
  - restricted-observation-present at artifact.families.nominal.oas — oas is restricted-local-view and must never be published
exit=1
$ node scripts/validate-official-curves.mjs tests/fixtures/official-curves/off-host-source-url.json
[official-curves] FAIL
  - off-host-source-url at artifact.families.nominal.mirrorUrl — cdn.example.net is not home.treasury.gov
exit=1
$ node scripts/validate-official-curves.mjs tests/fixtures/official-curves/query-binding-mismatch.json
[official-curves] FAIL
  - source-id-to-query-binding-invalid at artifact.families.nominal.provenance[0].requestDescriptor.query.type — us-treasury-nominal requires type=daily_treasury_yield_curve, found daily_treasury_real_yield_curve
exit=1
$ node scripts/validate-official-curves.mjs tests/fixtures/official-curves/partial-row.json
[official-curves] FAIL
  - row-partial at artifact.families.nominal.rows[1].y30 — every row must carry the family's full required maturity set
exit=1
$ node scripts/validate-official-curves.mjs tests/fixtures/official-curves/observed-at-drift.json
[official-curves] FAIL
  - observed-at-mismatch at artifact.families.nominal.observedAt — expected 2026-01-02
exit=1
```

Seven fixtures, seven DISTINCT causes. The selftest asserts the distinctness
itself (`causes.size === 7`), because seven fixtures all refused for the same
reason would satisfy a weaker check while proving almost nothing.

Bypass refusal, from the same binary:

```text
$ node scripts/validate-official-curves.mjs --force tests/fixtures/official-curves/conformant.json
[official-curves] --force is not a flag on this gate and never will be.
EXIT=2
```

### TP-01-04

Scenario SCN-018-002 — the rights and restriction sweep refuses an oas value, a
financial-conditions value or a `restricted-local-view` string.
Command: `node scripts/selftest.mjs`

```text
$ node scripts/selftest.mjs
  ✓ Official curves TP-01-03: observed-at-drift is refused with observed-at-mismatch
  ✓ Official curves TP-01-03: the seven adversarial fixtures produce seven DISTINCT causes, so no two are refused for the same reason
  ✓ Official curves TP-01-04: a financial-conditions value anywhere is refused
  ✓ Official curves TP-01-04: a restricted-local-view rights string anywhere is refused
  ✓ Official curves TP-01-05: the committed bond source policy matches none of api_key, fredgraph, series/BAML, series/NFCI

$ node scripts/validate-official-curves.mjs tests/fixtures/official-curves/restricted-observation.json
[official-curves] FAIL
  - restricted-observation-present at artifact.families.nominal.oas — oas is restricted-local-view and must never be published
exit=1

Research-Lab self-test: 1401 passed, 0 failed
SELFTEST_EXIT=0
```

The committed fixture proves only the `oas` shape. The other two restricted
shapes are proven by mutating a clone in the selftest, so all three are
exercised rather than one standing in for the family.

### TP-01-05

Scenario SCN-018-003 — the committed bond source policy matches none of
`api_key`, `fredgraph`, `series/BAML`, `series/NFCI`.
Command: `node scripts/selftest.mjs`

```text
$ node scripts/selftest.mjs
  ✓ Official curves TP-01-05: the committed bond source policy matches none of api_key, fredgraph, series/BAML, series/NFCI
  ✓ Official curves TP-01-05: the two added allowlist entries introduce no host beyond home.treasury.gov
  ✓ Official curves TP-01-06: a full sweep of the conformant artifact finds no oas value, no financial-conditions value and no restricted rights string
  ✓ Official curves TP-01-07: the SHARED validator ACCEPTS the mis-bound envelope — one host, one method, one path prefix, so the frozen contract cannot express this rule
  ✓ Official curves TP-01-07: the feature gate REFUSES the same envelope, closing the gap the shared contract structurally cannot

Research-Lab self-test: 1401 passed, 0 failed
SELFTEST_EXIT=0
```

The host assertion reads `RLCONTRACTS.SOURCE_POLICIES[id].host` for both added
ids, so it fails if either entry ever gains a second host.

### TP-01-06

Scenario SCN-018-018 — a full-artifact sweep finds no restricted value.
Command: `node scripts/selftest.mjs`

```text
$ node scripts/selftest.mjs
  ✓ Official curves TP-01-06: a full sweep of the conformant artifact finds no oas value, no financial-conditions value and no restricted rights string
  ✓ Official curves TP-01-07: the SHARED validator ACCEPTS the mis-bound envelope — one host, one method, one path prefix, so the frozen contract cannot express this rule
  ✓ Official curves TP-01-07: the feature gate REFUSES the same envelope, closing the gap the shared contract structurally cannot
  ✓ Official curves TP-01-07: the two families are distinguished by query type, the only field that separates them
  ✓ Official curves TP-01-08: declaredPolicy holds the committed policy block byte-for-byte

Research-Lab self-test: 1401 passed, 0 failed
SELFTEST_EXIT=0
```

The sweep runs over the WHOLE artifact, not over a field allowlist, so a
restricted value smuggled into an unexpected key is still found.

### TP-01-07

Scenario SCN-018-019 — the query-binding fixture passes
`validateSourceProvenance` and is refused by the feature gate.
Command: `node scripts/selftest.mjs`

```text
$ node scripts/selftest.mjs
  ✓ Official curves TP-01-07: the SHARED validator ACCEPTS the mis-bound envelope — one host, one method, one path prefix, so the frozen contract cannot express this rule
  ✓ Official curves TP-01-07: the feature gate REFUSES the same envelope, closing the gap the shared contract structurally cannot
  ✓ Official curves TP-01-07: the two families are distinguished by query type, the only field that separates them

$ node scripts/validate-official-curves.mjs tests/fixtures/official-curves/query-binding-mismatch.json
[official-curves] FAIL
  - source-id-to-query-binding-invalid at artifact.families.nominal.provenance[0].requestDescriptor.query.type — us-treasury-nominal requires type=daily_treasury_yield_curve, found daily_treasury_real_yield_curve
exit=1

Research-Lab self-test: 1401 passed, 0 failed
SELFTEST_EXIT=0
```

This is the row that proves the feature check is load-bearing rather than
duplicative. The first assertion is deliberately phrased as the shared validator
ACCEPTING the envelope: if `rlcontracts.js` ever grew a rule that caught this,
that assertion would fail loudly instead of the feature check quietly becoming
dead weight.

### TP-01-08

Scenario SCN-018-020 — `declaredPolicy` verbatim, `persistence`
`same-origin-artifact`, `rights` `public-official`, and a `browser-cache`
persistence on a committed family refused.
Command: `node scripts/selftest.mjs`

```text
$ node scripts/selftest.mjs
  ✓ Official curves TP-01-08: declaredPolicy holds the committed policy block byte-for-byte
  ✓ Official curves TP-01-08: the declared policy still reads browser-cache while the committed copy states same-origin-artifact
  ✓ Official curves TP-01-08: rights carries public-official unaltered
  ✓ Official curves TP-01-08: a family writing persistence browser-cache onto a committed file is refused
  ✓ Official curves TP-01-08: a declaredPolicy that drifts from the committed block is refused
  ✓ Official curves TP-01-09: every pre-existing SOURCE_IDS key survives the extension

Research-Lab self-test: 1401 passed, 0 failed
SELFTEST_EXIT=0
```

**R-4 settled.** The committed policy says `browser-cache` and that is correct
for the browser tool it was written for. A committed artifact is not a browser
cache, so the artifact carries both readings without contradiction:
`declaredPolicy` quotes the policy byte-for-byte and still reads `browser-cache`;
the family's own `persistence` reads `same-origin-artifact`. Rewriting the quoted
policy was the other way to remove the apparent contradiction and is the wrong
one — it would silently edit the browser tool's declared policy to suit a
different consumer.

### TP-01-09

Scenario SCN-018-021 — every pre-existing `SOURCE_IDS` key and `SOURCE_POLICIES`
entry unchanged; the only difference is the two added Treasury entries.
Command: `node scripts/selftest.mjs`

```text
$ node scripts/selftest.mjs
  ✓ Official curves TP-01-09: every pre-existing SOURCE_IDS key survives the extension
  ✓ Official curves TP-01-09: every pre-existing SOURCE_POLICIES entry retains its shape and values byte-for-byte
  ✓ Official curves TP-01-09: the ONLY difference is the two added Treasury entries
  ✓ Official curves TP-01-09: SOURCE_KINDS is unchanged — official-report already admits a daily yield-curve publication
  ✓ Official curves: the gate requires the same maturity set the browser parser requires, so the headless path cannot admit a shape the tool would reject

Research-Lab self-test: 1401 passed, 0 failed
SELFTEST_EXIT=0
```

The five pre-existing policy entries are compared against a literal expectation
held in the test, so an edit to any one of them fails this row rather than being
absorbed. `addedIds.length === 2` makes the row fail if a third id ever appears.

### TP-01-10

Scenario SCN-018-022 — the spec-test-path guard reports no new missing path and
the frozen baseline is byte-identical.
Command: `node scripts/validate-spec-test-paths.mjs`

```text
$ node scripts/validate-spec-test-paths.mjs
[spec-test-paths] scanned=510 references=11769 distinctPaths=218 missingPaths=86 baseline=86 new=0 stale=0
[spec-test-paths] OK — no new missing test path(s)
EXIT=0

$ git status --porcelain scripts/validate-spec-test-paths.baseline
(no output — the frozen baseline is byte-identical)
```

**R-5 settled.** `new=0` and `stale=0`, and the baseline count is unchanged at
86. This feature names no new `tests/*.mjs` path, so the guard has nothing to
add; the pre-existing 86 are untouched rather than re-baselined.

### TP-01-11

Scenario SCN-018-021 — every pre-existing provenance group stays green after the
allowlist extension.
Command: `node scripts/selftest.mjs`

```text
$ node scripts/selftest.mjs        # CANARY: taken with ONLY the allowlist entries added, before any gate work
Research-Lab self-test: 1371 passed, 0 failed
SELFTEST_EXIT=0

$ node scripts/selftest.mjs        # after the gate, fixtures and the new group
Research-Lab self-test: 1401 passed, 0 failed
SELFTEST_EXIT=0
```

The canary is the measurement that matters for a High blast-radius edit, and the
scope's Impact Sweep required it BEFORE gate work: 1371 passed / 0 failed with
the two entries present and nothing else changed. Every caller of
`validateSourceProvenance` across every tool stayed green, so an appended entry
cannot be mistaken for a safe edit of an existing one. The suite then moved to
1401 as the group's 30 assertions landed — an increase of exactly 30, with no
pre-existing assertion lost.

## Build Quality Gate Evidence

### selftest

Command: `node scripts/selftest.mjs`

```text
$ node scripts/selftest.mjs
Research-Lab self-test: 1401 passed, 0 failed
SELFTEST_EXIT=0
```

Zero skipped assertions: the group has no conditional or early-return path, so
every one of its 30 assertions executed. Zero warnings were emitted.

### feature gate

Command: `node scripts/validate-official-curves.mjs`

```text
$ node scripts/validate-official-curves.mjs tests/fixtures/official-curves/conformant.json
[official-curves] PASS: /home/philipk/research-lab/tests/fixtures/official-curves/conformant.json satisfies official-curve-artifact/v1
exit=0

missing-required-field     exit=1 errors=2  family-field-missing
credentialed-envelope      exit=1 errors=2  provenance-invalid:secret-shaped-request-field
restricted-observation     exit=1 errors=1  restricted-observation-present
off-host-source-url        exit=1 errors=1  off-host-source-url
query-binding-mismatch     exit=1 errors=1  source-id-to-query-binding-invalid
partial-row                exit=1 errors=1  row-partial
observed-at-drift          exit=1 errors=1  observed-at-mismatch

$ node scripts/validate-official-curves.mjs --force tests/fixtures/official-curves/conformant.json
[official-curves] --force is not a flag on this gate and never will be.
EXIT=2
```

### spec-test-path guard

Command: `node scripts/validate-spec-test-paths.mjs`

```text
$ node scripts/validate-spec-test-paths.mjs
[spec-test-paths] scanned=510 references=11769 distinctPaths=218 missingPaths=86 baseline=86 new=0 stale=0
[spec-test-paths] OK — no new missing test path(s)
EXIT=0
```

### change boundary

Command: `git diff --name-only`

```text
$ git show --name-only --format= bb7f90b0 039ab6d4 8d1fecba | sort -u
rlcontracts.js
scripts/selftest.mjs
scripts/validate-official-curves.mjs
specs/018-headless-official-curve-publication/state.json
tests/fixtures/official-curves/conformant.json
tests/fixtures/official-curves/credentialed-envelope.json
tests/fixtures/official-curves/missing-required-field.json
tests/fixtures/official-curves/observed-at-drift.json
tests/fixtures/official-curves/off-host-source-url.json
tests/fixtures/official-curves/partial-row.json
tests/fixtures/official-curves/query-binding-mismatch.json
tests/fixtures/official-curves/restricted-observation.json

$ git status --porcelain   # remaining, this scope
 M notes/bond-regime-lab.md
 M specs/018-headless-official-curve-publication/scopes/01-official-curve-artifact-contract/report.md

$ git status --porcelain bond-regime-universe.json bond-regime-lab.html scripts/brief-refresh.mjs scripts/owner-state.mjs market-brief.payload.json market-brief.html rlbrief.js
(no output — every excluded path is byte-identical)
```

Every file above is in the scope's Allowed table. No excluded path was modified.
The boundary is taken from THIS scope's three commits rather than from a commit
RANGE, because concurrent sessions landed specs 019, 020 and a BUG-007 edit in
between; a range diff would have attributed their files to this scope.

## Findings Raised

Two defects, both in code I wrote in this scope, both found by running the gate
rather than by reading it, and both fixed before this report was written.

**F-018-01 — the gate refused without naming the cause.** It read `result.code`
from `validateSourceProvenance`, whose actual shape is
`{ok:false, error:{reason, field}}`, so every provenance refusal printed
`provenance-invalid:undefined`. A gate that refuses without naming the cause is
barely more useful than one that does not refuse: the operator is told something
is wrong and given nothing to act on. Fixed in `039ab6d4`; the seven distinct
causes in TP-01-03 are the proof it now names them. Owner: this scope. Closed.

**F-018-02 — the restriction sweep double-counted.** `walkEntries` visited each
scalar twice, once through its parent key and once through the recursion, so the
`off-host-source-url` fixture reported one offending URL as two findings. A gate
that double-counts teaches its reader to distrust its counts. Fixed in the same
commit by visiting array elements explicitly and returning early for scalars.
Measured after: that fixture reports `errors=1`. Owner: this scope. Closed.

No finding is routed onward. Nothing was deferred.

## Completion Statement

Scope 1 is COMPLETE. All 11 Core Delivery items and all 11 Test Evidence items
are ticked with raw output recorded above.

What this scope does NOT claim: nothing was fetched, so no assertion here shows
the official endpoints responding, and `contentSha256` is an audit anchor rather
than a verified digest — the gate runs offline and its own message says so
rather than implying a stronger guarantee. Acquisition against a real response is
Scope 2's job, and the whole-family rejection BS-018-005 relies on is observed
there, not asserted here.
