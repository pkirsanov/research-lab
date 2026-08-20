# Scope 5 Execution Report — Combined Settlement And Combined Marginal Curve

This file is the evidence surface for scope 5. It was created during planning as
a structural template and is filled from execution only. Nothing here may be
written from expectation, inference or summary. Every anchor below holds raw,
unfiltered terminal output with its exit code.

## Summary

Bounded session against the first six Definition of Done items. Five closed with
intended-RED and same-command GREEN evidence; the sixth is left open with the
failing clause named.

| DoD item | Anchors | Outcome |
| --- | --- | --- |
| FR-022-028 independence and computed `orderIndependence` | TP-05-03 | Closed |
| Guard proven able to fail in both directions | TP-05-04, TP-05-05 | Closed, after strengthening |
| FR-022-029 sum, refusal inheritance, sourced-zero addend | TP-05-02, TP-05-06 | Closed |
| FR-022-030 coupling record | TP-05-07 | Closed |
| FR-022-031 and FR-022-032 rates, no average, sample-set union | TP-05-08, TP-05-09, TP-05-10, TP-05-14 | Closed |
| FR-022-033 attribution, unattributable refusal, no-tax series | TP-05-11, TP-05-12 | **Open** — the refusal clause has no demonstration |

Ten mutation probes were run in total, every one value-free by construction — a
boolean literal, a `null` literal, an identifier rename, or the removal of a
single term of a local sum. No probe carried a household figure. Every probe was
guarded on both sides and reverted explicitly inside the shell invocation that
applied it. One probe was aborted by its own before-guard when the anchor text
proved to occur twice rather than once, and no half-mutated run was banked.

Two weaknesses were found in the test suite itself, not in the module, and both
were fixed rather than absorbed:

1. The pre-existing TP-05-04/TP-05-05 assertion never read `orderIndependence`
   and survived a mutation that replaced the guard with a constant. Two
   assertions were appended so the published guard is what fails, in both
   coupling directions, and one more for the `L7` reconciliation clause.
2. The curve group read `.points` off a refusing curve and threw, aborting nine
   later assertions and masking them behind one reported failure. Three reads
   that execute before their assert are now guarded against the refusal shape.

No assertion was weakened, deleted or skipped, and no timeout was raised. Pass
count rose 3101 → 3103 through appended assertions only.

**`rltaxcombined.js` is not wired into the page.** `lifetime-tax-strategy-lab.html`
loads twelve `rltax*` modules and `rltaxcombined.js` is not among them, so the
combined surface is unwired exactly as the state surface was before commit
`7e7b9550d`. None of the six items examined here depends on that wiring — every
one is a `node scripts/selftest.mjs` row — but the browser rows TP-05-16 through
TP-05-21 cannot be satisfied until the page loads the module and renders
`CombinedTotalLine`, `StateStatusChip`, `CombinedCurveChart`, `CombinedCurveTable`,
`CouplingPanel` and `PackYearPanel`.

### Session gates

```text
Research-Lab self-test: 3103 passed, 0 failed
[spec-test-paths] scanned=678 references=14941 distinctPaths=245 missingPaths=67 baseline=67 new=0 stale=0
[spec-test-paths] OK — no new missing test path(s)
```

```text
# TP-05-22 cumulative browser suite for features 021-024 after the scope-05 session
$ npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep SCN-02[1-4] --reporter=list
exit: 0
lines: 74
sha256: c667f95ac2bb352dec94f796f4d99a0f658c991c72276f2a679d46ccc3221a39
--- last 5 ---
  69 passed (4.1m)
```

`artifact-lint.sh` on `specs/022-federal-preferential-and-state-income-tax` exits
`0`. No shipped module is dirty; the only files this session modified are
`scripts/selftest.mjs` and this scope's `report.md` and `scope.md`.

## Sourcing

Filled at execution. This scope introduces no figure of its own; every value it
handles was sourced in Scopes 01 through 04. This section records that fact
explicitly and holds the verification that `rltaxcombined.js` introduced no
tax-domain constant and cited no authority, so that a reader can tell a scope with
no sourcing obligation from a scope that skipped one.

## Test Evidence

### TP-05-01

Scenario SCN-022-015 — `assertPackYearAgreement` refuses naming both pack ids and
both year arrays, and accepts a pair that both cover the declared year.
Command: `node scripts/selftest.mjs`

### TP-05-02

Scenario SCN-022-013 — the combined total equals the sum of the two jurisdiction
totals for every fixture pair and is the refusal of the refusing side when either
refuses.
Command: `node scripts/selftest.mjs`

### TP-05-06

Scenario SCN-022-013 — a sourced-zero state total is included as a real addend
through a contract-version branch rather than a value comparison, and the combined
result is not labelled federal-only.
Command: `node scripts/selftest.mjs`

The DoD item these two anchor carries three separate clauses — the sum, the
refusal inheritance, and the sourced-zero addend. Each was probed on its own, so
none of them rides on another's failure. Every mutation is value-free by
construction: one is the removal of a single term of a local sum, the other two
are boolean literals. Each was guarded on both sides and reverted explicitly
inside the same shell invocation that applied it.

**RED-A — the state term dropped from the combined sum**
(`A_GUARD_BEFORE=1`, `A_GUARD_AFTER_ORIGINAL_GONE=0`).

```text
# TP-05-02 RED-A: the state term dropped from the combined sum
$ node scripts/selftest.mjs
exit: 1
lines: 3506
sha256: de7f4b299fde8d543a996105dbbab7e97a4b41e014ee327329b2d18bb89dd8b7
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: TP-05-02 and TP-05-06: the combined total equals the sum of the two jurisdiction totals, includes a sourced zero as a real addend rather than skipping it, and inherits the refusal of the refusing side
--- omitted 3500 line(s); sha256 above covers the full output ---
--- last 3 ---
================================================
Research-Lab self-test: 3102 passed, 1 failed
================================================
```

```text
A_POST_REVERT_BEGIN
A_POST_REVERT_END
```

**RED-B — the sourced-zero contract branch disabled** (`B_GUARD_BEFORE=1`,
`B_GUARD_AFTER=1`). With the contract-version branch short-circuited, the Florida
total stops being classified as a sourced zero and falls through to the valued
shape. Two assertions catch it, which is the point: the classification is load
bearing in the settlement and again in the curve.

```text
# TP-05-06 RED-B: the sourced-zero contract branch disabled
$ node scripts/selftest.mjs
exit: 1
lines: 3506
sha256: 136169046f44a5d13121eff6b0b6e3fac70342e4e7c3d1bf04c593c6b9727121
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: TP-05-02 and TP-05-06: the combined total equals the sum of the two jurisdiction totals, includes a sourced zero as a real addend rather than skipping it, and inherits the refusal of the refusing side
  ✗ FAIL: TP-05-12: a jurisdiction that imposes no individual income tax contributes a state series that is present and flat at zero across the whole domain, every point of which is a sourced zero whose authority resolves to a retrieved record in that pack, and the curve still declares itself incomp
--- omitted 3500 line(s); sha256 above covers the full output ---
--- last 3 ---
================================================
Research-Lab self-test: 3101 passed, 2 failed
================================================
```

```text
B_POST_REVERT_BEGIN
B_POST_REVERT_END
```

**RED-C — the state refusal-inheritance branch disabled** (`C_GUARD_BEFORE=1`,
`C_GUARD_AFTER=1`). This is the clause a California household exercises: the
state total is an `AbsentFigure`, and the combined total must inherit that refusal
rather than present a numeral built from a missing addend.

```text
# TP-05-02 RED-C: the state refusal-inheritance branch disabled
$ node scripts/selftest.mjs
exit: 1
lines: 3506
sha256: dedac90d66f6ec1660a31329e1f8ec92ea50865fe2afebe40de817d05ed14243
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: TP-05-02 and TP-05-06: the combined total equals the sum of the two jurisdiction totals, includes a sourced zero as a real addend rather than skipping it, and inherits the refusal of the refusing side
--- omitted 3500 line(s); sha256 above covers the full output ---
--- last 3 ---
================================================
Research-Lab self-test: 3102 passed, 1 failed
================================================
```

```text
C_POST_REVERT_BEGIN
C_POST_REVERT_END
```

**GREEN, identical command, after every revert.**

```text
# TP-05-02 GREEN-C: identical command after explicit revert
$ node scripts/selftest.mjs
exit: 0
lines: 3506
sha256: 7ce243bab712257a2a4d41a13d41102ebbc75ab6134336a05cd4e418b0f4e960
--- last 3 ---
================================================
Research-Lab self-test: 3103 passed, 0 failed
================================================
```

The asserting rows, from the same run:

```text
  ✓ TP-05-02 and TP-05-06: the combined total equals the sum of the two jurisdiction totals, includes a sourced zero as a real addend rather than skipping it, and inherits the refusal of the refusing side
  ✓ TP-05-06: the one place a jurisdiction total becomes an addend branches on the contract version, and the module carries no comparison of a total value against zero outside its prose
```

Two behaviours worth naming plainly, because both look like defects and are not.
Florida's state total is a sourced zero citing the state constitutional provision
that forbids an individual income tax; it is a real addend that happens to be
zero, and the combined total is not therefore federal-only —
`completeCombinedTax` stays `false` either way. California's state total is an
`AbsentFigure` because its authority pages were unreachable, so the combined total
is a refusal carrying the same code rather than a federal figure wearing a
combined label.

### TP-05-03

Scenario SCN-022-013 — `orderIndependence.asserted` is produced by settling both
orders and comparing serialized results, and is not a constant.
Command: `node scripts/selftest.mjs`

**Intended RED.** `rltaxcombined.js` was mutated in place so the published flag
became a bare boolean literal instead of the computed comparison: the member
`asserted: orderIndependent` was replaced by `asserted: true`. The mutation is
value-free by construction — a boolean literal carries no household figure. The
substitution was guarded on both sides (`GUARD_BEFORE=1`, `GUARD_AFTER=1`) so a
run that landed on the wrong text would abort rather than be banked.

```text
# TP-05-03 RED: orderIndependence.asserted replaced by a constant literal
$ node scripts/selftest.mjs
exit: 1
lines: 3504
sha256: 5f4d5871452961c7eb5bb80eb725d31a95a17913f5e352109b60e3d7b1f5cfcf
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: TP-05-03: orderIndependence is produced by settling both orders and comparing the serialised results rather than by a constant, and the comparison is proven able to distinguish two results
--- omitted 3488 line(s); sha256 above covers the full output ---
--- last 8 ---
================================================
Research-Lab self-test: 3100 passed, 1 failed
================================================
```

The mutation was reverted explicitly inside the same shell invocation that
applied it, and the revert was verified before the GREEN run:

```text
POST_REVERT_STATUS_BEGIN
POST_REVERT_STATUS_END
```

`git status --short rltaxcombined.js` printed nothing between the two markers, so
no source file was left dirty.

**GREEN, identical command.**

```text
# TP-05-03 GREEN: identical command after explicit revert
$ node scripts/selftest.mjs
exit: 0
lines: 3504
sha256: d9bea9cb6d7c08bbe58861f6fdcc3ef570a3f74be89c99af1191d0809d71c99f
--- last 8 ---
  ✓ TP-02-14: no rltax module on disk holds a surtax rate, a surtax threshold, a declared jurisdiction name or an authority id, and the detector is proven to fire on all four when one of each is planted in a different module (14 module(s), 5 rule literal(s), 10 name token(s); shipped findings: none)

================================================
Research-Lab self-test: 3101 passed, 0 failed
================================================
```

The asserting row reads, from the same run:

```text
  ✓ TP-05-03: orderIndependence is produced by settling both orders and comparing the serialised results rather than by a constant, and the comparison is proven able to distinguish two results
```

The no-reachable-parameter half of the claim is structural rather than probed:
`combineSettlements` calls `engine.computeAnnualFederalTax(workspace, federalPack)`
and `stateEngine.computeAnnualStateTax(workspace, statePack)` with the workspace
and each jurisdiction's own pack only. Neither call has a parameter through which
a figure produced by the other could enter, and the assertion above pins the
computed flag rather than the absence.

### TP-05-04

Scenario SCN-022-013 — a state settlement mutated to subtract the federal total
from its taxable income is proven to break the order-independence assertion and
reconciliation leg `L7`.
Command: `node scripts/selftest.mjs`

### TP-05-05

Scenario SCN-022-013 — a federal settlement mutated to add the state total to its
itemized deduction is proven to break the order-independence assertion.
Command: `node scripts/selftest.mjs`

**The first-draft assertion was too weak, and the miss is recorded rather than
absorbed.** The pre-existing `TP-05-04 and TP-05-05` assertion compared a coupled
state settlement against an uncoupled one and checked that `JSON.stringify` told
them apart. That proves the comparator can distinguish two records; it never reads
`orderIndependence` at all, and it exercises one direction. The TP-05-03 RED run
above is the proof of the weakness: with the guard replaced by a constant literal,
that assertion still passed, and the run reported exactly one failure. An
assertion that survives a mutation which destroys the behaviour it names is not
evidence for the behaviour.

**Strengthening.** Two assertions were appended. `requireModule` inside
`rltaxcombined.js` resolves the global before the relative path, so a second
instance of the module is bound to a deliberately coupled engine and the published
guard itself becomes what fails. Direction one publishes the federal total and has
the state settlement consume the one settled immediately before it; direction two
publishes the state total and has the federal settlement fold it into its itemised
deduction. Both couplings are test-side injections — no shipped module was edited
to produce them. The unmutated implementation is asserted to hold in both
deduction modes, so the assertion pins a contrast rather than a single outcome.

**Intended RED, same value-free constant mutation, guarded on both sides
(`GUARD_BEFORE=1`, `GUARD_AFTER=1`).**

```text
# TP-05-04/TP-05-05 RED: same constant-guard mutation now also fails the strengthened assertion
$ node scripts/selftest.mjs
exit: 1
lines: 3506
sha256: 5df3f5d7ee65aec27d4bf555e521a7658ffce1ab259829b14d14666aca8988a5
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: TP-05-03: orderIndependence is produced by settling both orders and comparing the serialised results rather than by a constant, and the comparison is proven able to distinguish two results
  ✗ FAIL: TP-05-04 and TP-05-05: the published order-independence guard itself goes false under both couplings — a state settlement consuming the federal total settled before it, and a federal settlement folding the state total into its itemised deduction — while the unmutated implementation asserts
--- omitted 3498 line(s); sha256 above covers the full output ---
--- last 4 ---
================================================
Research-Lab self-test: 3101 passed, 2 failed
================================================
```

The count moved from one failure to two under the identical mutation. That
difference is the whole value of the strengthening.

Reverted explicitly inside the same shell invocation that applied it:

```text
POST_REVERT_STATUS_BEGIN
POST_REVERT_STATUS_END
```

**GREEN, identical command.**

```text
# TP-05-04/TP-05-05 GREEN: identical command after explicit revert
$ node scripts/selftest.mjs
exit: 0
lines: 3506
sha256: 2a870c031d11994a8720cf1bffde7e7c7c887cb5632fa35d4b3f46c2b799e527
--- last 4 ---
================================================
Research-Lab self-test: 3103 passed, 0 failed
================================================
```

Pass count rose from 3101 to 3103 — the two appended assertions — with no
pre-existing assertion edited and no fall in the count.

**The `L7` clause.** TP-05-04 also names reconciliation leg `L7`, which pins state
taxable income to the state pack's own deduction. A second appended assertion
calls `reconcileAnnualStateTax` twice on the same settled result: once with the
basis the pack produced, and once with the taxable measure reduced by the federal
total while the gross and the deduction are left intact — the shape a coupled
implementation actually produces. The honest basis holds `L7` and balances; the
coupled basis breaks `L7`, fails to balance, and yields an `AbsentFigure` refusal.
The assertion carries its own control and its own perturbation, so it cannot pass
without the contrast. From the GREEN run:

```text
  ✓ TP-05-04 and TP-05-05: the published order-independence guard itself goes false under both couplings — a state settlement consuming the federal total settled before it, and a federal settlement folding the state total into its itemised deduction — while the unmutated implementation asserts it in both deduction modes
  ✓ TP-05-04: reducing state taxable income by the federal total, with the pack-supplied gross and deduction left intact, breaks reconciliation leg L7 and refuses the settlement, while the untouched basis holds it
```

No tax figure appears anywhere in either mutation: the couplings move one term of
a local sum and the mutation applied to the shipped module is a boolean literal.

### TP-05-07

Scenario SCN-022-013 — the coupling record carries an empty `modeled` list as a
required member, names the unmodeled state-tax deduction, and populates the
itemized notice exactly when the deduction mode is itemized.
Command: `node scripts/selftest.mjs`

The word **exactly** is what makes this row worth a probe. An assertion that only
checked the itemized case would pass against a build that shows the notice to
everybody, which is the failure a household would actually meet. Both halves were
probed. Both mutations are value-free — a boolean literal and an identifier
rename — and both were guarded on each side and reverted explicitly inside the
invocation that applied them.

**RED-A — the itemised notice published unconditionally** (`A_GUARD_BEFORE=1`,
`A_GUARD_AFTER=1`). The standard-deduction household now receives a notice about
an itemised deduction it did not declare.

```text
# TP-05-07 RED-A: the itemised notice published unconditionally
$ node scripts/selftest.mjs
exit: 1
lines: 3506
sha256: 644f5f9fe797ba6d9890c7b1e18aff50e9bcaac61f6b849e48a9714cbdb75fcb
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: TP-05-07: the coupling record carries an empty modeled list as a required member, names the unmodelled federal itemised state-tax deduction with a deferral code, and populates the itemised notice exactly when the deduction mode is itemised
--- omitted 3500 line(s); sha256 above covers the full output ---
--- last 3 ---
================================================
Research-Lab self-test: 3102 passed, 1 failed
================================================
```

```text
A_POST_REVERT_BEGIN
A_POST_REVERT_END
```

**RED-B — the required empty `modeled` member renamed away** (`B_GUARD_BEFORE=1`,
`B_GUARD_AFTER=1`). An empty list is easy to treat as an optional member and drop;
the point of requiring it is that a later feature which models a coupling adds to
a list the reader is already looking at, instead of introducing one nobody expects.

```text
# TP-05-07 RED-B: the required empty modeled member renamed away
$ node scripts/selftest.mjs
exit: 1
lines: 3506
sha256: fd46c6fb469dab86ee6fa83a108e3548cd64656b19ededd432284613db97788c
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: TP-05-07: the coupling record carries an empty modeled list as a required member, names the unmodelled federal itemised state-tax deduction with a deferral code, and populates the itemised notice exactly when the deduction mode is itemised
--- omitted 3500 line(s); sha256 above covers the full output ---
--- last 3 ---
================================================
Research-Lab self-test: 3102 passed, 1 failed
================================================
```

```text
B_POST_REVERT_BEGIN
B_POST_REVERT_END
```

**GREEN, identical command, after both reverts.**

```text
# TP-05-07 GREEN: identical command after both reverts
$ node scripts/selftest.mjs
exit: 0
lines: 3506
sha256: 009ff632595b54079472937230e37d8ef610cca9f0017898643af29d056acd41
--- last 3 ---
================================================
Research-Lab self-test: 3103 passed, 0 failed
================================================
```

The asserting row, from the same run:

```text
  ✓ TP-05-07: the coupling record carries an empty modeled list as a required member, names the unmodelled federal itemised state-tax deduction with a deferral code, and populates the itemised notice exactly when the deduction mode is itemised
```

The `notModeled` entry names `federal-itemized-salt-deduction` and carries a
deferral code drawn from the declared code set rather than an ad-hoc string. The
coupling is real in law and is not modelled here on purpose: resolving it would
mean iterating to a fixed point, and a fixed-point figure has no retrieved source
behind it, so it would be a derived number wearing the appearance of a sourced
one.

### TP-05-08

Scenario SCN-022-014 — each point's combined rate equals the sum of its two
component rates, and that sum equals a single finite difference over the combined
total.
Command: `node scripts/selftest.mjs`

### TP-05-09

Scenario SCN-022-014 — the sample set is the union of the grid and both
jurisdictions' crossings, each crossing emits its exact bracketing pair, and no
point is synthesized between a pair.
Command: `node scripts/selftest.mjs`

### TP-05-10

Scenario SCN-022-014 — an implementation that drops the state's crossings is
proven to fail the exact-crossing assertion at a state bracket edge.
Command: `node scripts/selftest.mjs`

### TP-05-14

Scenario SCN-022-014 — the curve record carries no scalar average and no summary
rate, and the chart and the text-equivalent table read the identical record.
Command: `node scripts/selftest.mjs`

Three clauses, three separate probes. Every mutation is value-free: two are the
removal of one term of a local sum and one is a `null` literal.

**A guard caught a bad probe before it ran, which is worth recording.** The first
attempt at the sample-set mutation matched on the text
`.concat(declaredEdges(statePack`, which occurs **twice** — once building the
sample set and once building segment attribution. The before-guard reported
`A_GUARD_BEFORE=2` against an expected `1` and aborted with `ABORT_A_BEFORE`
before any edit was made. No half-mutated run was banked. The probe was reissued
pinned to the sample-set site by line number, with both a total count and a
per-line check on each side.

**RED-A — the state crossings dropped from the sample-set union**
(`A_GUARD_BEFORE_TOTAL=2`, `A_GUARD_BEFORE_LINE408=1`, `A_GUARD_AFTER_TOTAL=1`,
`A_GUARD_AFTER_LINE408=0`). This is the named adversarial mutation the DoD item
requires: a curve that silently became federal-only would look entirely correct
and say nothing about what it lost.

```text
# TP-05-10 RED-A: the state crossings dropped from the sample-set union
$ node scripts/selftest.mjs
exit: 1
lines: 3506
sha256: 9ecefc9146034ea1c5ecaee1387795da85c1a2079ba95cc0953d749f5deeca14
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: TP-05-09 and TP-05-10: the sample set carries the grid, both jurisdictions edge sets, and the exact bracketing pair at a state bracket edge with no point synthesised between the pair, so an implementation that dropped the state crossings is proven to fail
--- omitted 3500 line(s); sha256 above covers the full output ---
--- last 3 ---
================================================
Research-Lab self-test: 3102 passed, 1 failed
================================================
```

```text
A_POST_REVERT_BEGIN
A_POST_REVERT_END
```

**RED-B — the state term dropped from the combined marginal rate. The first run
found a defect in the test, not in the module.** With the state term removed the
module behaved correctly: its own identity check saw that the component sum no
longer equalled a single finite difference over the combined total and refused
`RLTAX-RECONCILE`. The selftest then read `.points` off that refusal and **threw**:

```text
  ✗ FAIL (Feature 022 Scope 05 combined group threw): Cannot read properties of undefined (reading 'every')
  Research-Lab self-test: 3094 passed, 1 failed
```

A throw aborts the whole group, so nine later assertions never ran — the pass
count fell by nine and reported a single failure. A group that hides failures
when it meets a refusal is not a reliable gate, and the repository convention is
that every read is guarded against the refusal shape because a refusing stage
publishes `null` members. Three reads that execute before their assert were
guarded (`points`, the text rows, and `segments`). No assertion was weakened, no
clause dropped and no timeout touched; the conjunctions are unchanged.

Re-running the identical mutation after the fix:

```text
# TP-05-08 RED-B rerun: same mutation now fails cleanly instead of throwing
$ node scripts/selftest.mjs
exit: 1
lines: 3506
sha256: cbbf839b38e95a79b23623755a491c376980a0aaeefa5a035dae0fbe1a5b3b8e
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: TP-05-08 and TP-05-14: every curve point carries a federal, a state and a combined rate whose sum identity holds, the record carries no scalar average, the text rows read the identical record, and each settlement is called exactly twice per point for the forward difference
  ✗ FAIL: TP-05-09 and TP-05-10: the sample set carries the grid, both jurisdictions edge sets, and the exact bracketing pair at a state bracket edge with no point synthesised between the pair, so an implementation that dropped the state crossings is proven to fail
  ✗ FAIL: TP-05-11: every contributing threshold carries a non-empty jurisdiction, pack id and source reference, both jurisdictions appear among the attributions, and no non-flat segment is rendered without one
  ✗ FAIL: TP-05-11: a state pack reduced to a single band still attributes every move it makes, so the refusal path is reserved for a rate change no pack explains
--- omitted 3500 line(s); sha256 above covers the full output ---
--- last 3 ---
================================================
Research-Lab self-test: 3099 passed, 4 failed
================================================
```

Four named failures and no aborted group: 3099 + 4 = 3103, the full assertion
count. Before the fix the same mutation reported 3094 + 1.

```text
B_POST_REVERT_BEGIN
B_POST_REVERT_END
```

**RED-C — a scalar average member added to the curve record**
(`C_GUARD_BEFORE=1`, `C_GUARD_AFTER=1`). The no-average clause is an absence, so
it is probed by adding rather than removing: a `null`-valued `averageRate` member,
which carries no figure and is exactly the member a view would later read an
average off.

```text
# TP-05-14 RED-C: a scalar average member added to the curve record
$ node scripts/selftest.mjs
exit: 1
lines: 3506
sha256: 13d805192a453f2adf36e8f64b0e360e415f4e3df2403133beceac48eb7eb4b6
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: TP-05-08 and TP-05-14: every curve point carries a federal, a state and a combined rate whose sum identity holds, the record carries no scalar average, the text rows read the identical record, and each settlement is called exactly twice per point for the forward difference
--- omitted 3500 line(s); sha256 above covers the full output ---
--- last 3 ---
================================================
Research-Lab self-test: 3102 passed, 1 failed
================================================
```

```text
C_POST_REVERT_BEGIN
C_POST_REVERT_END
```

**GREEN, identical command, after every revert.**

```text
# TP-05-08/09/10/14 GREEN: identical command after revert
$ node scripts/selftest.mjs
exit: 0
lines: 3506
sha256: 28ee52f2f8ad7ab908e627d971f5c513db9819686613a35ba5ed608b46ee1f3b
--- last 3 ---
================================================
Research-Lab self-test: 3103 passed, 0 failed
================================================
```

### TP-05-11

Scenario SCN-022-014 — every contributing threshold carries a non-empty
jurisdiction and pack id, and an unattributable rate change is refused rather than
rendered.
Command: `node scripts/selftest.mjs`

**Partial. This row is not closed, and the DoD item it anchors is left open.** The
attribution clause is asserted and green: every entry in every
`contributingThresholds[]` carries a non-empty jurisdiction, pack id and source
reference, both jurisdictions appear among the attributions, and no non-flat
segment is rendered without one.

The **refusal** clause has no demonstration. `rltaxcombined.js` does carry the
path — a segment whose combined marginal cost moves between two sampled levels
with no crossed edge in either pack returns `RLTAX-THRESHOLD-UNAVAILABLE` — but
nothing in this suite has ever caused it to fire. The second TP-05-11 assertion
reads:

```text
  ✓ TP-05-11: a state pack reduced to a single band still attributes every move it makes, so the refusal path is reserved for a rate change no pack explains
```

That asserts the **negative**: it shows a reduced pack still attributes its moves.
It never observes the refusal being produced, so it would pass unchanged against a
build in which the refusal branch had been deleted outright. Asserting that a
guard does not fire when it should not is not evidence that it fires when it
should.

Closing this clause needs a curve whose rate genuinely moves at a level no
threshold in either pack declares. The injection technique used for TP-05-04 and
TP-05-05 — binding a fresh instance of the combined module to a wrapped state
engine — is the way to construct one, by giving the wrapped engine an undeclared
rate step inside the sweep domain. That work was not carried out in this session,
so the row stays open rather than being narrowed to the part that is provable.

### TP-05-12

Scenario SCN-022-014 — for the no-tax state the state series is present, flat at
zero across the domain, and attributed to the no-tax authority.
Command: `node scripts/selftest.mjs`

Green, and probed. RED-B under TP-05-06 above — disabling the sourced-zero
contract branch — fails this row as well as the settlement row, which is the
evidence that the classification is load bearing in the curve and not only in the
settlement:

```text
  ✗ FAIL: TP-05-12: a jurisdiction that imposes no individual income tax contributes a state series that is present and flat at zero across the whole domain, every point of which is a sourced zero whose authority resolves to a retrieved record in that pack, and the curve still declares itself incomp
```

Florida's flat-zero series is correct behaviour, not a missing series. The zero is
sourced to the state constitutional provision forbidding an individual income tax,
the authority resolves to a retrieved record inside that pack, and the curve still
declares itself incomplete. A no-tax state contributing an **absent** series would
be the defect; contributing a present, flat, attributed zero is the requirement.

### TP-05-13

Scenario SCN-022-014 — a sweep whose union of crossings would exceed the budget is
refused, and no implementation drops a jurisdiction's crossings to fit.
Command: `node scripts/selftest.mjs`

### TP-05-15

Scenario SCN-022-013 — `rltaxcombined.js` holds no tax-domain numeric constant, no
jurisdiction name and no second definition of either settlement, and calls each
settlement exactly once per sample.
Command: `node scripts/selftest.mjs`

### Scenario SCN-022-013

`Regression: SCN-022-013 the combined total is the sum of two independent settlements`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-013 the combined total is the sum of two independent settlements" --reporter=list`

### Scenario SCN-022-014

`Regression: SCN-022-014 the combined curve attributes every step to a named jurisdiction`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-014 the combined curve attributes every step to a named jurisdiction" --reporter=list`

### Scenario SCN-022-015

`Regression: SCN-022-015 a pack year mismatch refuses and shows no combined figure`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-015 a pack year mismatch refuses and shows no combined figure" --reporter=list`

### TP-05-19

`Regression: SCN-022-014 the combined curve is reachable by keyboard and has a text equivalent table`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-014 the combined curve is reachable by keyboard and has a text equivalent table" --reporter=list`

### TP-05-20

`Regression: SCN-022-013 the request ledger stays empty across the full combined workflow`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-013 the request ledger stays empty across the full combined workflow" --reporter=list`

### TP-05-21

`Regression: SCN-022-013 the tool is absent from every registry and the market brief`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-013 the tool is absent from every registry and the market brief" --reporter=list`

### TP-05-22

The full cumulative Feature 021 and Feature 022 browser suites over the real
route.
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "SCN-02" --reporter=list`

### TP-05-23

The whole-repository suite, with the pre-existing pass count recorded before and
after the appended group.
Command: `node scripts/selftest.mjs`

### TP-05-24

Zero new missing spec-referenced test paths, with the baseline file unmodified.
Command: `node scripts/validate-spec-test-paths.mjs`

### TP-05-25

The Pages plan succeeds, `site-exclusions.json` is unchanged, no new root HTML
exists, and `tax-rules/` remains outside the public directories.
Command: `node scripts/build-pages-site.mjs --dry-run`

## Supersession Ledger

Filled at execution. This scope supersedes nothing, so this section holds the
closing check only: the nine `SUP-022-NN` markers present in the repository, each
mapped to its delivered ledger entry, and the evidence that every pre-existing
assertion outside those nine still passes unchanged.
Command: `node scripts/selftest.mjs`

## Change Boundary

Filled at execution. Holds the path-scoped `git status` proving every excluded
path is byte-identical, including every engine module, every pack under
`tax-rules/`, `site-exclusions.json`, the registries and Feature 021's spec
directory.

## Claim Boundary

Filled at execution. Holds the text scan proving no probability, lifetime figure,
break-even year, ranking, recommendation, track record, accuracy claim or error
rate appears in this scope's allowed paths, and that no result is labelled a
complete combined tax.

## Completion Statement

Filled at execution.
