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

Green, and probed in both directions. The row makes two separable claims — that a
disagreeing pair refuses at all, and that the refusal names **both** sides — so a
single mutation would have left one of them unproven. Each was driven separately.

RED-A dropped the state term from the agreement conjunction, so a pair the state
pack does not cover was treated as agreeing. The mutation is one term of a local
boolean and carries no figure:

```text
# TP-05-01 RED-A: the state term dropped from the pack-year agreement conjunction
$ node scripts/selftest.mjs
exit: 1
lines: 3506
sha256: da9e4bc729bb1013e799b829486f0c2eea53de4d12890a716a6d65ee7cc216a8
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: TP-05-01: two packs that do not both declare the requested year effective refuse RLTAX-PACK-YEAR-MISMATCH naming both pack ids and both year sets, no combined numeral is produced, and an agreeing pair is accepted
================================================
Research-Lab self-test: 3102 passed, 1 failed
================================================
```

RED-B left the refusal firing and removed only the state pack id and its year
array from the reason string, which is the shape of a refusal that sends the
operator to the wrong pack. It fails the same row, which is the evidence that the
naming clause is asserted rather than assumed:

```text
# TP-05-01 RED-B: the state pack id and its year set dropped from the refusal reason
$ node scripts/selftest.mjs
exit: 1
lines: 3506
sha256: babfcfb5e6c25d1669410c8375732ccf7436338ca536a406ce6ae810b437b60e
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: TP-05-01: two packs that do not both declare the requested year effective refuse RLTAX-PACK-YEAR-MISMATCH naming both pack ids and both year sets, no combined numeral is produced, and an agreeing pair is accepted
================================================
Research-Lab self-test: 3102 passed, 1 failed
================================================
```

Both mutations were reverted explicitly inside the shell invocation that applied
them, the pre-mutation anchor was re-counted at 1 after each revert, and
`git status --short` over `rltaxcombined.js`, both engine modules, the page, the
selftest, this scope's spec and `tax-rules/` was empty. GREEN is the identical
command after the revert:

```text
# TP-05-01 GREEN: identical command after explicit revert
$ node scripts/selftest.mjs
exit: 0
lines: 3506
sha256: c8683c93c8b4f97caf0f4753c7c0ec13d7a2541e2e390dd3ee0c1562d08eb4d2
================================================
Research-Lab self-test: 3103 passed, 0 failed
================================================
```

The refusal carries no `value` member, so no combined numeral survives the
mismatch, and the accepted pair returns the two year arrays unaltered.

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

**Re-confirmed by a domain census, not by re-reading the note.** A later session
checked whether the gap had since been filled somewhere else in the suite, and
established it by refusal *domain* rather than by refusal code, because the code
alone is ambiguous — `RLTAX-THRESHOLD-UNAVAILABLE` is raised by the
single-jurisdiction engine as well. The combined module raises the unattributable
segment refusal at exactly one site, under its own domain:

```text
=== the refusal branch in the module ===
rltaxcombined.js:641:  return rules.unavailable("RLTAX-THRESHOLD-UNAVAILABLE", "combined-curve:" + kind + ":segment",
=== does any test observe the COMBINED-curve segment domain refusal? ===
COMBINED_SEGMENT_DOMAIN_OBS_END
```

Nothing in `scripts/selftest.mjs` or `tests/` names that domain. Two near-matches
were checked and rejected as substitutes:

- `TP-03-04` in the selftest *does* observe a real unattributable-rate refusal, and
  drives it through a legitimate input rather than a mutation — a pack whose
  reconciliation tolerance is zero makes float noise inside one band register as a
  move. But its domain is `curve:ordinary:segment`: that is `rltax.js`, the
  single-jurisdiction engine, not the combined composition this row is about.
- `tests/lifetime-tax-combined.spec.mjs` L443 and L465 do assert
  `RLTAX-THRESHOLD-UNAVAILABLE` on the combined surface, but their domains are
  `state-deduction:single` and `combined-curve:ordinary:state` — both *inherited*
  absent-figure refusals, which the combined total passes through. Neither is the
  segment guard.

So the shape of the gap is now pinned precisely: the combined module's segment
guard is the one refusal path in this scope that no test has ever caused to fire.

#### TP-05-11 completion (2026-08-20) — the segment guard is now observed firing

**Claim Source:** executed. The gap recorded above is closed. The clause needed a
curve whose rate genuinely moves where no threshold is declared, and the earlier
note proposed reaching it by binding the combined module to a wrapped state
engine. That turned out to be unnecessary: the real modules already admit such a
curve, through a seam that is itself worth naming.

`declaredEdges` in `rltaxcombined.js` reads `standardDeductions`,
`ordinaryRateTables`, `preferentialRateTables` and `thresholdSets`. It does not
read `reliefMechanisms` — which `rltaxstate.js` nonetheless prices, as a credit
applied after rate application and capped by the leg it offsets. A credit is
therefore a rate-moving figure that the edge derivation cannot see. Where the
credit exhausts, the state marginal cost steps from nothing to the statutory
rate, and no pack declares a threshold at that level.

The fixture state pack carries such a credit at `250`. At that size it exhausts
close enough to a declared band edge that the move is attributed, which is why
the shipped fixture produces a curve and why this gap stayed invisible. Raising
the credit to `7000` moves the exhaustion deep inside the top band, between two
grid points and away from every declared edge. The new assertion drives the real
`computeCombinedMarginalCurve` with that pack and observes the refusal directly:

```text
code=RLTAX-THRESHOLD-UNAVAILABLE
domain=combined-curve:ordinary:segment
reason=the combined marginal cost changed between two sampled levels with no threshold in either pack to attribute the move to
remediation=declare the threshold that moved the rate in the pack that owns it; an unattributable move is refused rather than displayed
hasPoints=false
control refused=no, curve with segments=164
```

The control on the last line is the same call on the shipped fixture, unmodified.
It still produces a curve, so the refusal is caused by the credit's size and not
by the construction — the assertion cannot pass by breaking the engine.

Green, in the suite:

```text
  ✓ TP-05-11: a combined rate change no pack declares a threshold for is refused RLTAX-THRESHOLD-UNAVAILABLE at combined-curve:ordinary:segment with no partial curve, while the same call on the shipped fixture still produces one
```

Intended RED, through the harness. The mutation neutralises the guard's own
condition so an unattributed move is drawn rather than refused — which is exactly
the build the earlier note said the old negative assertion would have passed
against:

```
=== RED/GREEN PROBE EVIDENCE ===
label:            TP-05-11 an unattributable combined rate move is drawn instead of refused
file:             rltaxcombined.js
mutation:         if (crossed.length === 0) {  ->  if (false && crossed.length === 0) {   (1 occurrence(s))
command:          node scripts/selftest.mjs
red-exit:         1
red-summary:        ✗ FAIL: TP-05-11: a combined rate change no pack declares a threshold for is refused RLTAX-THRESHOLD-UNAVAILABLE at combined-curve:ordinary:segment with no partial curve, while the same call on th
green-exit:       1
green-summary:      ✓ TP-05-11: a combined rate change no pack declares a threshold for is refused RLTAX-THRESHOLD-UNAVAILABLE at combined-curve:ordinary:segment with no partial curve, while the same call on the ship
revert-verified:  yes (committed=a24991f8cab5c54964c4efbe74d99fd7d1788954 restored=a24991f8cab5c54964c4efbe74d99fd7d1788954)
discriminating:   yes (summary differs)
=== END RED/GREEN PROBE EVIDENCE ===
```

**Note on the verdict channel.** Both runs exit `1`, so the exit code could not
discriminate here. That is not a defect in the probe: a concurrent session's
Feature 027 report names a planted probe filename that no longer exists, so the
repository's spec-test-path assertion fails on every run regardless of this
scope. The verdict therefore rides the summary channel, pointed at this
assertion's own name, which moves `✗ FAIL` → `✓`. An exit-code-only probe would
have returned exit 7 and reported no discrimination that in fact occurred.

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

Green, and probed with the exact defect the row exists to forbid. The RED did not
weaken the assertion; it replaced the refusal with the tempting implementation — a
budget that silently truncates the sample set to fit rather than saying it could
not be honoured. The mutation is a code literal and a slice, and carries no
household figure:

```text
# TP-05-13 RED: the budget drops sampled levels to fit instead of refusing
$ node scripts/selftest.mjs
exit: 1
lines: 3506
sha256: d9fd5e70e5667323f7799bd5c0f9730b8431c6af91bae87c069f07efdd389489
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: TP-05-13: a sweep whose union of both jurisdictions crossings exceeds the declared budget refuses RLTAX-CONFIG-INVALID and produces no partial curve
================================================
Research-Lab self-test: 3102 passed, 1 failed
================================================
```

Under that mutation the curve returns successfully with a truncated point set,
which is precisely the failure mode the requirement names: a curve that looks
complete and says nothing about what it lost. The assertion catches it because it
pins the refusal shape rather than a point count — the record carries no `points`
member at all.

The jurisdiction-specific half of the clause is pinned by a different row rather
than restated here. TP-05-10's `RED-A: the state crossings dropped from the
sample-set union` already drives the build in which a jurisdiction's edges are
removed from the union, and it fails. Composed, the two rows close both readings:
edges may not be dropped to fit, and if the union will not fit, the answer is a
refusal.

The mutation was reverted explicitly inside the same shell invocation, the
mutated marker was re-counted at 0 afterwards, and `git status --short` over
`rltaxcombined.js`, both engine modules, the page, the selftest, this scope's
spec and `tax-rules/` was empty. GREEN is the identical command after the revert:

```text
# TP-05-13 GREEN: identical command after explicit revert
$ node scripts/selftest.mjs
exit: 0
lines: 3506
sha256: 9b86670538d59b05e97c6da5814f112bfcd8bce13dec7194913509c32d4ca429
================================================
Research-Lab self-test: 3103 passed, 0 failed
================================================
```

### TP-05-15

Scenario SCN-022-013 — `rltaxcombined.js` holds no tax-domain numeric constant, no
jurisdiction name and no second definition of either settlement, and calls each
settlement exactly once per sample.
Command: `node scripts/selftest.mjs`

Green, and probed. The detector is not self-reported: one planted comment carrying
a four-digit literal, a jurisdiction name and a settlement-internal symbol was
enough to fail three separate assertions, two of which are the repository-wide
engine sweeps that were written before this module existed. The mutation is a
comment and carries no household figure:

```text
# TP-05-15 RED: a four-digit literal, a jurisdiction name and a settlement-internal symbol planted in the combined module
$ node scripts/selftest.mjs
exit: 1
lines: 3506
sha256: b16081f40b4b69cbee79a501bb397149f720fda28dbfc9d849651650e98fb191
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: TP-03-16: no engine module holds a state name, a postal code or an authority name, and the detector is proven to fire on a string that does (rltaxcombined.js:California)
  ✗ FAIL: TP-04-13 and TP-04-15: no engine module holds a California bracket, rate, threshold, statutory section number, state name or postal code, so the Scope 03 contract carried California without an engine edit (rltaxcombined.js:California)
  ✗ FAIL: TP-05-15: rltaxcombined.js holds no four-digit tax-domain constant, no jurisdiction name, and no re-derivation of either settlement, and is a UMD dual module with no ESM syntax and no bare isFinite
================================================
Research-Lab self-test: 3100 passed, 3 failed
================================================
```

That the two older sweeps fire on this module is the stronger half of the result:
`rltaxcombined.js` is inside the repository's existing no-shadow perimeter rather
than guarded only by an assertion this scope wrote for itself. The mutation was
reverted explicitly inside the same shell invocation, the planted marker was
re-counted at 0 afterwards, and `git status --short` over the module, all five
engine modules, the page, the selftest, this scope's spec and `tax-rules/` was
empty. GREEN is the identical command after the revert:

```text
# TP-05-15 GREEN: identical command after explicit revert
$ node scripts/selftest.mjs
exit: 0
lines: 3506
sha256: e70209a2038de1df15cf84ef5361ab8019572f114773dd201bc0f5414c612e50
================================================
Research-Lab self-test: 3103 passed, 0 failed
================================================
```

The settlement-call clause is carried by the TP-05-08 assertion above, which pins
`settlementCalls.federal` and `settlementCalls.state` to exactly twice the point
count — the two settlements each forward difference needs, and no more.

### Scenario SCN-022-013

`Regression: SCN-022-013 the combined total is the sum of two independent settlements`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-013 the combined total is the sum of two independent settlements" --reporter=list`

**Claim Source:** executed. Intended RED through `scripts/red-green-probe.sh` (2026-08-20).
The row's hardest clause is the sourced zero: Florida contributes a real zero, so a
numeral alone cannot tell a reader whether the state leg was priced at nothing or
never retrieved. The row therefore pins the *shape* the addition branched on, and
the mutation attacks exactly that — the combined module reclassifies a sourced zero
as an ordinary computed amount, so the page describes it as "a computed amount"
instead of "a zero that carries the authority establishing it". The figures on the
page are unchanged by the mutation, which is what makes it the realistic
regression rather than an obvious break. The mutation is two code literals and
carries no household figure:

```
=== RED/GREEN PROBE EVIDENCE ===
label:            TP-05-16 a sourced zero is reclassified as an ordinary computed amount
file:             rltaxcombined.js
mutation:         kind: "sourced-zero"  ->  kind: "valued"   (1 occurrence(s))
command:          npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep Regression:\ SCN-022-013\ the\ combined\ total\ is\ the\ sum\ of\ two\ independent\ settlements --reporter=list
red-exit:         1
red-summary:        1 failed
green-exit:       0
green-summary:      1 passed (1.8s)
revert-verified:  yes (committed=a24991f8cab5c54964c4efbe74d99fd7d1788954 restored=a24991f8cab5c54964c4efbe74d99fd7d1788954)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

GREEN is the identical command after the harness reverted and re-verified the file
against its committed blob hash.

### Scenario SCN-022-014

`Regression: SCN-022-014 the combined curve attributes every step to a named jurisdiction`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-014 the combined curve attributes every step to a named jurisdiction" --reporter=list`

**Claim Source:** executed. Intended RED through `scripts/red-green-probe.sh` (2026-08-20).
The row's title is attribution, so the mutation removes attribution at its source:
every edge `declaredEdges` derives from either pack keeps its level, its measure and
its source reference and loses only the jurisdiction that owns it. That is the
defect the row exists to forbid — a curve that still steps in the right places while
no longer saying which government moved it. The mutation is one assignment of an
empty string and carries no household figure:

```
=== RED/GREEN PROBE EVIDENCE ===
label:            TP-05-17 every declared edge loses its owning jurisdiction
file:             rltaxcombined.js
mutation:         function declaredEdges(pack, filingStatus, jurisdiction) {  ->  function declaredEdges(pack, filingStatus, jurisdiction) { jurisdiction = "";   (1 occurrence(s))
command:          npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep Regression:\ SCN-022-014\ the\ combined\ curve\ attributes\ every\ step\ to\ a\ named\ jurisdiction --reporter=list
red-exit:         1
red-summary:        1 failed
green-exit:       0
green-summary:      1 passed (2.8s)
revert-verified:  yes (committed=a24991f8cab5c54964c4efbe74d99fd7d1788954 restored=a24991f8cab5c54964c4efbe74d99fd7d1788954)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

GREEN is the identical command after the harness reverted and re-verified the file
against its committed blob hash.

### Scenario SCN-022-015

`Regression: SCN-022-015 a pack year mismatch refuses and shows no combined figure`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-015 a pack year mismatch refuses and shows no combined figure" --reporter=list`

**Claim Source:** executed. Intended RED through `scripts/red-green-probe.sh` (2026-08-20).
The section header above records why the module's own `RLTAX-PACK-YEAR-MISMATCH` is
not reachable from the route: the pack that does not cover the declared year refuses
to resolve first. The mutation therefore attacks the guard the household actually
meets — pack resolution stops checking the declared year against the pack's own
`effectiveTaxYears`, so a pack is silently extended into a year it never declared.
That is the defect the refusal's own remediation text names, and under it the page
produces a combined figure for a year no pack covers instead of refusing. The
mutation is a short-circuit on an existing condition and carries no household
figure:

```
=== RED/GREEN PROBE EVIDENCE ===
label:            TP-05-18 a pack is extended into a year it does not declare instead of refusing
file:             rltaxrules.js
mutation:         if (pack.effectiveTaxYears.indexOf(ask.declaredTaxYear) < 0) {  ->  if (false && pack.effectiveTaxYears.indexOf(ask.declaredTaxYear) < 0) {   (1 occurrence(s))
command:          npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep Regression:\ SCN-022-015\ a\ pack\ year\ mismatch\ refuses\ and\ shows\ no\ combined\ figure --reporter=list
red-exit:         1
red-summary:        1 failed
green-exit:       0
green-summary:      1 passed (2.1s)
revert-verified:  yes (committed=206d8d81d7be511e4aead22b4c25d7099083369a restored=206d8d81d7be511e4aead22b4c25d7099083369a)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

GREEN is the identical command after the harness reverted and re-verified
`rltaxrules.js` against its committed blob hash. The mutated file is the shared
rules engine rather than this scope's module, which is the point: the year guard
the combined card depends on is not one this scope wrote for itself.

### TP-05-19

`Regression: SCN-022-014 the combined curve is reachable by keyboard and has a text equivalent table`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-014 the combined curve is reachable by keyboard and has a text equivalent table" --reporter=list`

Green, and probed on both of the clauses the DoD item names separately —
reachability and explanation — because a single mutation would have proven only
one. Both were driven through `valueNode`, the one constructor every displayed
value on this route passes through, so each probe covers the whole surface rather
than one field.

RED-A removed the focus stop from every displayed value while leaving the value,
its tooltip and its `aria-describedby` link intact. That is the realistic
regression: the figure is still there, still explained, and simply cannot be
reached without a pointer. The mutation swaps one attribute call for another and
carries no figure:

```text
# TP-05-19 RED-A: every displayed value made unreachable by keyboard
$ npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep Regression: SCN-022-014 the combined curve is reachable by keyboard and has a text equivalent table --reporter=list
exit: 1
lines: 31
sha256: 49df402163fc116bc1be15a2c880de270e46fe3cbacd793ed6780b9280c46ce1
  ✘  1 [system-chrome] › tests/lifetime-tax-combined.spec.mjs:275:1 › Regression: SCN-022-014 the combined curve is reachable by keyboard and has a text equivalent table (943ms)
  1 failed
```

RED-B is the complementary defect and the more interesting one: the tooltip
element is still constructed, still carries `role="tooltip"`, and is still
correctly wired to its figure — it is simply empty. An assertion that only checked
for the presence of a tooltip node would have passed this build. It fails, because
the row pins tooltip substance rather than tooltip existence:

```text
# TP-05-19 RED-B: every tooltip emptied while its role attribute stays
$ npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep Regression: SCN-022-014 the combined curve is reachable by keyboard and has a text equivalent table --reporter=list
exit: 1
lines: 31
sha256: 89d2695265fb4e5b148fe473d345928e86d643df21225989788e2eb03c782085
  ✘  1 [system-chrome] › tests/lifetime-tax-combined.spec.mjs:275:1 › Regression: SCN-022-014 the combined curve is reachable by keyboard and has a text equivalent table (840ms)
  1 failed
```

Each mutation was reverted explicitly inside the shell invocation that applied it,
before the next was applied; the mutated marker was re-counted at 0 after each
revert, and `git status --short` over the page, the combined module, both engine
modules, the selftest, this scope's spec and `tax-rules/` was empty. GREEN is the
identical command after both reverts:

```text
# TP-05-19 GREEN: identical command after both explicit reverts
$ npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep Regression: SCN-022-014 the combined curve is reachable by keyboard and has a text equivalent table --reporter=list
exit: 0
lines: 6
sha256: a0491decb473ab53752b910b321cb3b23157c401b853dddd6c55b5aee7a3b0f2
  ✓  1 [system-chrome] › tests/lifetime-tax-combined.spec.mjs:275:1 › Regression: SCN-022-014 the combined curve is reachable by keyboard and has a text equivalent table (781ms)
  1 passed (1.8s)
```

The row's remaining clauses pass unprobed but are asserted rather than assumed:
the chart is an `img` with a focus stop whose accessible name points the reader at
the text equivalent by name; the text-equivalent table carries its own accessible
name mentioning the jurisdiction column and more than fifty rows; every deferred
contributor is focusable and states its code, its jurisdiction and why it could
not be priced; and no unavailable state renders bare — every refusal in the
section carries both `Unavailable because` and `What would make it available:`,
and a deferred contributor is explicitly barred from being counted as a refusal
because it legitimately has no remediation to offer.

### TP-05-20

`Regression: SCN-022-013 the request ledger does not grow after first paint and every entry is a declared same-origin read across the full combined workflow`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-013 the request ledger does not grow after first paint and every entry is a declared same-origin read across the full combined workflow" --reporter=list`

**Renamed 2026-08-22 (F-REG-02).** The persistent title above was
`Regression: SCN-022-013 the request ledger stays empty across the full combined workflow`
until this date. That wording was false — the row's own first assertion is
`expect(afterFirstPaint).toBeGreaterThan(0)`, so the ledger is never empty. Every
captured block below was recorded under the superseded title and is left byte-for-byte
as it was executed; the `sha256` lines pin that text, so editing them to match the new
title would destroy the evidence rather than update it. A fresh capture under the new
title is recorded at the end of this row.

Green, and probed. The row asserts a negative — that nothing was sent — which is
the class of assertion most likely to be vacuously true, so it was driven by
actually making the page send something.

The probe was constructed to be incapable of disclosing a household value even if
the revert had failed: a single same-origin `GET` of a fixed, undeclared path with
no query string, no hash and no body. No income, residency or deduction figure is
reachable from it by construction. It was inserted at the top of the combined
render, so it fires after first paint, which is exactly the window the row
guards:

```text
4811:                window.fetch("/rl-nonce-undeclared.json");
```

```text
# TP-05-20 RED: one value-free same-origin request issued after first paint
$ npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep Regression: SCN-022-013 the request ledger stays empty across the full combined workflow --reporter=list
exit: 1
lines: 28
sha256: e0a5fe83e0f85d9a4a468e32f52fee837a163b9776d82803df4382d0ff305fcd
  ✘  1 [system-chrome] › tests/lifetime-tax-combined.spec.mjs:350:1 › Regression: SCN-022-013 the request ledger stays empty across the full combined workflow (956ms)
  1 failed
```

One request was enough. The row catches it twice over — the post-first-paint
ledger length moves, and the requested path is not in the set the page's own
script tags declare — so neither a request to a *declared* asset nor a request to
an undeclared one can slip through.

The mutation was reverted explicitly inside the same shell invocation that applied
it, the planted marker was re-counted at 0 afterwards, and `git status --short`
over the page, the combined module, both engine modules, the selftest, this
scope's spec and `tax-rules/` was empty. GREEN is the identical command:

```text
# TP-05-20 GREEN: identical command after explicit revert
$ npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep Regression: SCN-022-013 the request ledger stays empty across the full combined workflow --reporter=list
exit: 0
lines: 6
sha256: 06bb4a758fe73e8752a082a16958dddc946719a6a9e7122f2ce7e10a71c5858a
  ✓  1 [system-chrome] › tests/lifetime-tax-combined.spec.mjs:350:1 › Regression: SCN-022-013 the request ledger stays empty across the full combined workflow (871ms)
  1 passed (2.0s)
```

The row also covers the surfaces a request ledger alone would miss: the URL search
string is empty, the hash carries only the view mode, and no console message
carries the sentinel income, the residency jurisdiction or the word `residency`.

Fresh capture under the new persistent title, recorded 2026-08-22 after the
rename, proving the row's `--grep` still selects its own test and that the test
still passes — selected 1, passed 1:

```text
# TP-05-20 GREEN: renamed persistent title, selector moved with it
$ npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-013 the request ledger does not grow after first paint and every entry is a declared same-origin read across the full combined workflow" --reporter=line
exit: 0
lines: 5
sha256: 329c30b93ccdfb166fd82a0d4d1356ed690f3073ffe6efb92e358c6c5de08407

Running 1 test using 1 worker

[1/1] [system-chrome] › tests/lifetime-tax-combined.spec.mjs:407:1 › Regression: SCN-022-013 the request ledger does not grow after first paint and every entry is a declared same-origin read across the full combined workflow
  1 passed (2.6s)
```

### TP-05-21

`Regression: SCN-022-013 the tool is absent from every registry and the market brief`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-013 the tool is absent from every registry and the market brief" --reporter=list`

**The row now carries a RED, driven through the clause that is available (2026-08-20).**

**Claim Source:** executed. The row asserts absence on two different surfaces, and
they are not equally drivable.

The *registration* clause — no `lifetime-tax` or `rltaxcombined` string in
`tools.json`, `index.html`, `rlnav.js`, `README.md`, `notes/README.md` or
`market-brief.config.json` — can only be driven RED by registering the tool. All
six are on this scope's must-remain-byte-identical list *and* under an explicit
standing instruction not to register this tool, so that mutation is not available
here even transiently. That clause stays unprobed, and is recorded as such rather
than quietly counted.

The *deploy-projection* clause of the same row is drivable without touching any
registration surface, and it is the clause with real consequence: the packaged
site is what a reader would actually receive. The row asserts that
`site-exclusions.json` names both `rltaxcombined.js` and
`lifetime-tax-strategy-lab.html`, so the shipped site carries the decision
explicitly rather than by omission. The mutation drops the combined module out of
that list, which is precisely how an unregistered tool leaks into a deploy — the
registries stay clean, and the module ships anyway. The mutation is one path
string and carries no household figure:

```
=== RED/GREEN PROBE EVIDENCE ===
label:            TP-05-21 the combined module drops out of the deploy exclusion list, so the packaged site would ship the unregistered tool module
file:             site-exclusions.json
mutation:         "path": "rltaxcombined.js",  ->  "path": "rltaxcombined-not-excluded.js",   (1 occurrence(s))
command:          npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep Regression:\ SCN-022-013\ the\ tool\ is\ absent\ from\ every\ registry\ and\ the\ market\ brief --reporter=list
red-exit:         1
red-summary:        1 failed
green-exit:       0
green-summary:      1 passed (1.7s)
revert-verified:  yes (committed=29c6fe08a58d97c1f119abdd38706cf02f675d60 restored=29c6fe08a58d97c1f119abdd38706cf02f675d60)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

GREEN is the identical command after the harness reverted and re-verified
`site-exclusions.json` against its committed blob hash.

**What this does and does not establish.** It establishes that the row is a live
assertion rather than a vacuous one: the test was observed failing on a build that
differs from the shipped tree only in this file, so a build with the check deleted
would not pass it. It does **not** establish that the six-surface registration scan
can fail, because that mutation is unavailable under a standing instruction. That
residual is named again in the Test Plan evidence DoD item rather than being
absorbed into this one.

#### The registration-absence DoD item, closed by derivation

The DoD row this section anchors asks a different question from the Test Plan row:
it asks whether the tool *is* absent from the six surfaces and whether a new root
HTML *exists*, not whether the guard is proven able to fail. That is a state of the
tree, and it is decidable without a mutation. Every clause was derived rather than
asserted.

The detector was proven live before the scan was trusted, on the one file that does
carry the token:

```text
=== detector liveness: the same pattern on a file that DOES carry the token ===
lifetime-tax-strategy-lab.html hits=5
```

The six named surfaces were read twice — once in the working tree and once from the
`HEAD` blob, so a concurrent session's unrelated dirt on `notes/README.md` cannot
flatter the result:

```text
=== worktree: lifetime-tax mentions in the six registration surfaces ===
tools.json               hits=0
index.html               hits=0
rlnav.js                 hits=0
README.md                hits=0
notes/README.md          hits=0
market-brief.config.json hits=0
=== HEAD blob: same six (worktree-dirt-proof) ===
tools.json               hits=0
index.html               hits=0
rlnav.js                 hits=0
README.md                hits=0
notes/README.md          hits=0
market-brief.config.json hits=0
```

"Market-brief coverage" is wider than the one config file, so all thirteen
`market-brief.*` surfaces were scanned, not the one the row happens to name:

```text
market-brief.attention-outcomes.jsonl    hits=0
market-brief.attention-scorecard.json    hits=0
market-brief.config.json                 hits=0
market-brief.config.page.json            hits=0
market-brief.experimental.json           hits=0
market-brief.html                        hits=0
market-brief.owner-reads.json            hits=0
market-brief.page.json                   hits=0
market-brief.payload.json                hits=0
market-brief.scorecard.json              hits=0
market-brief.snapshot.json               hits=0
market-brief.snapshot.page.json          hits=0
market-brief.tools.page.json             hits=0
```

The root-HTML clause is scoped to this scope's own three commits rather than to
the whole history, because a root page added by a sibling feature is not this
scope's to answer for:

```text
=== root HTML added by scope 05 own commits (2df769eaa a4887f91e c58719fb4) ===
SCOPE05_ADDED_ROOT_HTML_END
=== every lifetime-tax root HTML that exists ===
lifetime-tax-strategy-lab.html
```

No scope-05 commit adds a root HTML at all, and exactly one `lifetime-tax` root
page exists — the route itself, which is on the allowed-modified list and predates
this scope. Recorded rather than omitted: `company-intelligence-lab.html` *was*
added at the repository root after the feature-family creation commit, by Feature
025's concurrent work. It belongs to none of scope 05's three commits and carries
no lifetime-tax reference.

Both commands the DoD row names were then run in this session:

```text
$ npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-013 the tool is absent from every registry and the market brief" --reporter=list
Running 1 test using 1 worker
  ✓  1 [system-chrome] › tests/lifetime-tax-combined.spec.mjs:402:1 › Regression: SCN-022-013 the tool is absent from every registry and the market brief (572ms)
  1 passed (2.4s)
TP0521_EXIT=0

$ node scripts/build-pages-site.mjs --dry-run
{"contractVersion":"pages-site-build-result/v1","dryRun":true,"registeredPages":28,"excludedPaths":12,"rootFiles":128,"directories":["briefs","data","docs","notes","research","rlexperience-adapters","tests/fixtures"],"historyIndexDirectory":"briefs/indexes/004902309400a815a8ac1da2877422310e381d5c20748f711cbd0233e959a67a","omittedOrphanIndexes":144}
PAGES_EXIT=0
=== site-exclusions.json dirt ===
EXCLUSIONS_DIRT_END
```

`registeredPages` is 28, unchanged, and `site-exclusions.json` is clean. No
mutation was applied to reach any of this.

### TP-05-22

The full cumulative Feature 021 and Feature 022 browser suites over the real
route.
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "SCN-02[1-4]" --reporter=list`

Green at the close of this session, zero failed and zero skipped:

```text
# TP-05-22 cumulative browser suite for features 021-024 after the scope-05 session
$ npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep SCN-02[1-4] --reporter=list
exit: 0
lines: 81
sha256: e37b00edf47119f3a5961f0e95ccf195d999f24b9d50cd1d924eeabda0be9f84
  76 passed (2.9m)
```

The selector is the four-way alternation pinned to the owning spec numbers, not a
bare `SCN-02`, so a scenario owned by any other feature can neither satisfy nor
break the row.

**Intended RED through `scripts/red-green-probe.sh` (2026-08-20). Claim Source:
executed.** The cumulative row had never been shown able to fail. It is driven by
the same sourced-zero reclassification used for TP-05-16 — chosen deliberately,
because a mutation that broke the suite loudly would prove less than one that
leaves every figure on the page unchanged and moves only the shape a single
scenario reads:

```
=== RED/GREEN PROBE EVIDENCE ===
label:            TP-05-22 a sourced zero is reclassified as an ordinary computed amount, across the whole cumulative 021-024 browser suite
file:             rltaxcombined.js
mutation:         kind: "sourced-zero"  ->  kind: "valued"   (1 occurrence(s))
command:          npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep SCN-02\[1-4\] --reporter=list
red-exit:         1
red-summary:        76 passed (57.2s)
green-exit:       1
green-summary:      77 passed (5.4m)
revert-verified:  yes (committed=a24991f8cab5c54964c4efbe74d99fd7d1788954 restored=a24991f8cab5c54964c4efbe74d99fd7d1788954)
discriminating:   yes (summary differs: "  76 passed (57.2s)" vs "  77 passed (5.4m)")
=== END RED/GREEN PROBE EVIDENCE ===
```

**Finding — the exit code cannot discriminate on this row, and that is a property
of the command rather than of the probe.** Both runs exit `1`. The GREEN run
reports `77 passed` with zero failed and zero skipped and still exits non-zero,
because the suite's teardown force-kills a worker after every test has passed. An
exit-code-only probe would therefore have returned exit 7 and reported no
discrimination on a run that plainly discriminated. The verdict rides the summary
channel instead: `76 passed` under the mutation against `77 passed` after the
revert — one scenario lost, which is the scenario TP-05-16 owns. This is the case
`--summary-match` exists for, and it is recorded here so a later reader does not
mistake the non-zero GREEN exit for a failing suite.

The scenario count also moved from the 76 recorded above to 77, because sibling
features have since added a scenario to the pinned alternation. The row asserts
zero failed and zero skipped rather than a fixed total, so a growing suite
strengthens it rather than staling it.

All twenty-two rows TP-05-01 … TP-05-22 now carry intended-RED and same-command
GREEN evidence, which closes the Test Plan evidence DoD item. The one residual is
recorded rather than absorbed: TP-05-21's *registration* clause remains unprobed,
because the only mutation that drives it is to register the tool, and that is
barred. Its *deploy-projection* clause carries the row's RED.

### TP-05-23

The whole-repository suite, with the pre-existing pass count recorded before and
after the appended group.
Command: `node scripts/selftest.mjs`

Green at 3103 passed, 0 failed:

```text
# TP-05-23 GREEN
$ node scripts/selftest.mjs
exit: 0
lines: 3506
sha256: e70209a2038de1df15cf84ef5361ab8019572f114773dd201bc0f5414c612e50
================================================
Research-Lab self-test: 3103 passed, 0 failed
================================================
```

The "no fall in pass count" clause is not self-reported. Every mutation this
session applied drove the count down and back — 3102 under each of the four
single-row probes and 3100 under the no-shadow probe — and each revert restored
3103 exactly. A count that moves under mutation and returns is a count that is
actually being measured.

The "no existing assertion edited" clause is proven against this scope's only
commit that touches the selftest:

```text
a4887f91e test(022): close 5 scope-05 rows; guard curve reads against refusal shape
 scripts/selftest.mjs | 132 +++++++++++++++++++++++++++++++++++++++++++++++----
 1 file changed, 122 insertions(+), 10 deletions(-)
=== assertion labels REMOVED by that commit (a count of 0 == append-only) ===
0
=== the removed lines that are assertion labels, verbatim ===
REMOVED_LABELS_END
```

No assertion label was removed or rewritten. The ten deleted lines are inside this
scope's own appended group and are the refusal-shape guards described under
TP-05-08, not edits to anything that existed before this scope.

### TP-05-24

Zero new missing spec-referenced test paths, with the baseline file unmodified.
Command: `node scripts/validate-spec-test-paths.mjs`

Green, with `new=0`:

```text
# TP-05-24: spec-referenced test paths
$ node scripts/validate-spec-test-paths.mjs
exit: 0
lines: 2
sha256: 4a06849d0462f1084917c26341581a2ee1a2ef2d80452080a1031e80dba7b207
--- output ---
[spec-test-paths] scanned=678 references=14960 distinctPaths=246 missingPaths=67 baseline=67 new=0 stale=0
[spec-test-paths] OK — no new missing test path(s)
```

`missingPaths` equals `baseline` exactly, so the sixty-seven pre-existing
absences are unchanged and this scope added none. `stale=0` means the baseline was
not padded to absorb anything either, and `git status --short` over
`scripts/validate-spec-test-paths.baseline` was empty, so the gate was not
satisfied by moving its own goalposts.

### TP-05-25

The Pages plan succeeds, `site-exclusions.json` is unchanged, no new root HTML
exists, and `tax-rules/` remains outside the public directories.
Command: `node scripts/build-pages-site.mjs --dry-run`

Green:

```text
# TP-05-25: Pages plan dry run
$ node scripts/build-pages-site.mjs --dry-run
exit: 0
lines: 1
sha256: 2d50da71bf5ec2c0afceb3497342686d05a70a34e7c8f2d5452690e84ebd06fd
--- output ---
{"contractVersion":"pages-site-build-result/v1","dryRun":true,"registeredPages":28,"excludedPaths":12,"rootFiles":128,"directories":["briefs","data","docs","notes","research","rlexperience-adapters","tests/fixtures"],"historyIndexDirectory":"briefs/indexes/004902309400a815a8ac1da2877422310e381d5c20748f711cbd0233e959a67a","omittedOrphanIndexes":144}
```

`tax-rules` is absent from the published `directories` list, so the packs stay
outside the public tree. `git status --short` over `site-exclusions.json` was
empty. The remaining clauses of the DoD item this row also anchors — that the tool
is still absent from the six registration surfaces — are **not** closed by this
row; see the note under TP-05-21.

## Supersession Ledger

This scope supersedes nothing, so this section holds the closing check only: the
delivered `SUP-022-NN` marker set against the ledger the feature spec declares.

**The ledger is not closed, and the DoD item it anchors is left open.** The census
was run rather than asserted, and it disagrees with the DoD row in two independent
ways.

Command: a marker census over the tracked tree with the spec artifacts excluded,
so a marker that exists only in prose cannot be counted as delivered.

```text
=== declared in spec.md ledger ===
22
=== delivered markers (tracked files, specs excluded) ===
SUP-022-01 SUP-022-02 SUP-022-03 SUP-022-04 SUP-022-05 SUP-022-06 SUP-022-07 SUP-022-08 SUP-022-09 SUP-022-10 SUP-022-11 SUP-022-12 SUP-022-13 SUP-022-14 SUP-022-15 SUP-022-16 SUP-022-17 SUP-022-20 SUP-022-21 SUP-022-22
=== declared minus delivered ===
SUP-022-18
SUP-022-19
=== end ===
EXIT=0
```

**First disagreement — the count in the DoD row is stale.** The row asks for
"all twenty-one" markers. The
[ledger](../../spec.md#supersession-ledger) declares **twenty-two**, and states
the split as twelve owned by Scope 01, nine by Scope 02 and one by Scope 03.
Twelve plus nine is the twenty-one this scope's prose repeatedly names, so the
row was written before Scope 03's implementation dispatch admitted SUP-022-22 and
was never updated. Ticking a row that asks for twenty-one when twenty-two are owed
would record a closure the ledger does not support, so the wording is routed to
`bubbles.plan` rather than satisfied. The same stale count appears in this scope's
own **Assertion Supersession Owned By This Scope** section and in the previous
text of this heading, which said "nine".

**Second disagreement — two markers were never delivered, so the count is not the
only problem.** `SUP-022-18` and `SUP-022-19` appear in `spec.md`, `design.md`,
`scopes/_index.md`, Scope 02's `scope.md` and three scope reports, and in no
delivered file at all. Their ledger rows name where each replacement was to land:

- `SUP-022-18` → `scripts/selftest.mjs` (TP-05-01), replacing the
  `simpleFields.length === 7`, `powerLinkDetails.length === 9` and
  `powerLinkSections.length === 9` literals with cross-artifact identity between
  the closed Simple list and the rendered Simple markup.
- `SUP-022-19` → `tests/lifetime-tax-route.spec.mjs` L54-62 (SCN-021-013),
  replacing the withheld-detail `toHaveCount(9)` and the positional
  `links.nth(3)` focus expectation with two-directional link/section identity and
  a selection by declared target rather than by ordinal.

Neither file carries either marker. `scripts/selftest.mjs` carries twelve distinct
markers and `tests/lifetime-tax-route.spec.mjs` carries two, and `18` and `19` are
in neither set. This is exactly the drift ASC-6 exists to surface: a ledger entry
admitted in planning with no delivered replacement behind it. It is recorded here
rather than absorbed, and it is a finding for the owning scope — Scope 02 owns
both entries — not something this scope may close by lowering the number.

No mutation was applied to reach either conclusion; both are derivations over the
tracked tree.

### Step 1 — the routed derived form is now in `scripts/selftest.mjs` (2026-08-20)

**Claim Source:** executed. The replacement specified verbatim by `bubbles.plan`
under "Planning correction — 2026-08-20" in
`scopes/02-net-investment-income-and-additional-medicare-tax/report.md` was applied
to `scripts/selftest.mjs` exactly as recorded — no paraphrase, no added clause, no
dropped clause. The pinned `KNOWN_UNMARKED_LEDGER_ROWS` pair and its
`JSON.stringify` equality comparison are gone; the tolerance is now read out of the
ledger's `Disposition` column at run time.

The edit landed **before** `SUP-022-19` was delivered, which is the mandatory order:
delivering the marker first, against the pinned form, reproduces F-02-D exactly.

Measured, in one shell invocation, immediately before and immediately after the edit:

```
before: Research-Lab self-test: 3155 passed, 0 failed
after:  Research-Lab self-test: 3155 passed, 0 failed
```

`VERDICT_TODAY` is therefore confirmed against the real suite rather than against a
standalone reader: the restatement is not a regression. The ledger row shape the
derived form depends on was verified first — a row splits to `cells[1]` for the id
and `cells[5]` for the disposition, and the file carries exactly `22` such rows.

**The concurrent session's work in the same file was not touched.** That file is
shared, and before the edit its only divergence from `HEAD` was a single 113-line
insertion low in the file. After the edit the diff carries that insertion unchanged
plus this scope's hunks, all of which sit above line 20000:

```
@@ -15737 +15737,8 @@        <- this scope
@@ -15743,0 +15751 @@        <- this scope
@@ -15745,2 +15753,8 @@       <- this scope
@@ -15748,8 +15762,11 @@      <- this scope
@@ -15757,0 +15775,3 @@       <- this scope
@@ -15758,0 +15779,2 @@       <- this scope
@@ -15760 +15782,3 @@         <- this scope
@@ -15765 +15789 @@           <- this scope
@@ -25504,0 +25529,113 @@     <- concurrent session, unmodified
```

Only the hunks above line 20000 were staged for the commit that carries this step;
the concurrent insertion was left in the working tree untouched and unstaged.

This step does not by itself close the ledger-closure item above. That item stays
`[ ]` until `SUP-022-19` is delivered and the census re-runs against the derived
form with the marker present.

### Step 3 — the ledger census re-run against the derived form (2026-08-20)

**Claim Source:** executed. `SUP-022-19` is now delivered in the route spec, in the
mandated order, and the census was re-run against the derived assertion with the
marker present. `node scripts/selftest.mjs` reports **`3155 passed, 0 failed`** —
the same count as before either change, with no assertion edited outside this
feature's ledger entries and none disabled or skipped.

Every limb of the restated item was checked individually rather than inferred from
the single green line:

| Limb | Verified how | Result |
| --- | --- | --- |
| Every delivered marker maps to a ledger row | `markersWithoutLedgerRow` in the derived check | empty |
| Every `marker required` row is delivered | `unexplainedUnmarked` | empty |
| Every `marker forbidden` row carries no marker anywhere | `forbiddenButMarked` | empty |
| Only ledger-dispositioned rows may go unmarked, read at run time | tolerance derived from the `Disposition` column, no literal id pair remains in the file | holds |
| Every row carries a recognised disposition, tolerated ones with a reason | `undispositionedRows` and `toleratedWithoutReason` | both empty |
| Tolerated set never covers the whole ledger | `toleratedUnmarked.length < ledgerList.length` | 1 of 22 tolerated-and-unmarked |
| Ids inside the declared range | range regex over every row | 22 of 22 |
| Ledger total agrees three ways | opening paragraph says twenty-two; `Owning scope` tallies 12 + 9 + 1; `design.md` step 4 states the same arithmetic | all three agree at 22 |
| This scope superseded nothing itself | owning-scope tally carries only `01`, `02` and `03` | no Scope 05 row |
| Combined curve chart and text-equivalent table render in Power, not Simple | both `#combinedCurveChart` and `#combinedCurveTextEquivalent` sit inside `#power-combined`, itself inside `<section id="power">`; Simple asserts `#power` hidden and zero canvases | holds |
| Every pre-existing assertion outside the ledger still passes unchanged | pass count did not fall from 3155 at any point | holds |

The disposition tally read straight out of the ledger is `20 marker required`,
`1 marker forbidden`, `1 marker pending` — twenty-two rows, and with the delivery
landed the pending row is now delivered too, so exactly one row is both tolerated
and unmarked.

**Four adversarial mutations, each applied and reverted inside the invocation that
applied it, each run against the real suite rather than a standalone reader.** None
of these is a green-only claim; each is a measured failure of the derived assertion:

| Mutation (value-free) | Expected to trip | Measured |
| --- | --- | --- |
| Rename one `marker required` row's marker token in its owning spec | `unexplainedUnmarked` | `3152 passed, 3 failed` — TP-05-22 among them |
| Attach a `marker forbidden` id in a marker file | `forbiddenButMarked` | `3154 passed, 1 failed` — TP-05-22 alone |
| Blank one row's `Disposition` cell | `undispositionedRows` | `3154 passed, 1 failed` — TP-05-22 alone |
| Disposition every row away (all 20 required rows rewritten to a tolerated token) | `toleratedUnmarked.length < ledgerList.length` | `3154 passed, 1 failed` — TP-05-22 alone |

The second and third are protections the pinned form never had: it compared
unmarked-set equality, so a marker attached to a displaced row and an unreadable
disposition column would both have passed silently. The fourth proves the check
cannot be made vacuous by dispositioning the whole ledger away.

After each probe `git status --porcelain` on the mutated path returned zero lines,
and the post-probe tree reports `3155 passed, 0 failed` with
`node scripts/validate-spec-test-paths.mjs` at `new=0 stale=0`.

**One presentational change is disclosed rather than left implicit.** The restated
requirement ran to seventeen lines, and `artifact-lint` requires a `[x]` item's
evidence block to begin within fifteen lines of the checkbox, so ticking it failed
the lint with *"DoD item marked [x] has no evidence block"*. The requirement was
re-wrapped to fourteen lines at a wider column. **No word was added, removed or
altered.** That was verified mechanically rather than by eye: both versions were
extracted from `HEAD` and from the working tree, the checkbox marker stripped, all
whitespace collapsed, and the two strings compared — `old_lines=17 new_lines=14`,
`words_identical=true`. `artifact-lint` then exits 0.

## Change Boundary

Scope 05 owns exactly three commits of its own — `2df769eaa`, `a4887f91e` and
`c58719fb4` — on top of the feature-family creation commit `b9d92a3f1` that
introduced `rltaxcombined.js` alongside the rest of the route. Their entire
non-spec footprint is three files, every one of them on this scope's
allowed-modified list:

```text
=== 2df769eaa fix(022,023,024): narrow ambiguous SCN-02 test selectors to SCN-02[1-4] ===
  (no non-spec file)
=== a4887f91e test(022): close 5 scope-05 rows; guard curve reads against refusal shape ===
scripts/selftest.mjs
=== c58719fb4 feat(022): wire combined federal+state settlement and curve into the route ===
lifetime-tax-strategy-lab.html
tests/lifetime-tax-combined.spec.mjs
```

The engine clause is proven by absence rather than by inspection. No commit at all
since the creation commit has touched any engine module or any pack:

```text
=== commits after b9d92a3f1 touching the ENGINE modules or the packs ===
ENGINE_COMMITS_END
```

The query covered `rltaxrules.js`, `rltax.js`, `rltaxstate.js`,
`rltaxworkspace.js`, `rltaxstrategy.js` and all of `tax-rules/`, and returned no
commit. The two settlement modules this scope composes are therefore byte-identical
to what Scopes 01 through 04 delivered, which is what makes the composition a
composition. The working tree agrees:

```text
=== working-tree dirt on excluded paths ===
EXCLUDED_DIRT_END
=== scope 05 allowed-modified surface, dirty check ===
ALLOWED_DIRT_END
```

Both queries returned nothing, and no stray probe artefact survives any of this
session's mutations (`zsh: no matches found: rl-*probe*`).

**Recorded honestly, not claimed as clean.** Two excluded paths *were* edited after
the creation commit, by commits that are not scope 05's:
`scripts/validate-spec-test-paths.baseline` in `874b24271`, `3872df354` and
`2229da3c0`, and `site-exclusions.json` in `e903749c0`. The first two of those
belong to Feature 026 and the third to Feature 024, all concurrent sibling work;
`e903749c0` is the feature-family registration commit that added the lifetime-tax
modules to the site-exclusion list. None of the four is one of scope 05's three
commits, so this scope's boundary holds, but the edits are named here rather than
omitted, and the `site-exclusions.json` question is carried into TP-05-25 rather
than settled here.

## Claim Boundary

The text scan over this scope's two output paths — `rltaxcombined.js` and the page
that renders its surfaces — plus the completeness-label check.
Command: `node scripts/selftest.mjs` plus a text scan over this scope's allowed paths

**A recorded miss, caught before it was trusted.** The first run of this scan
reported zero hits for every detector and was wrong. The path list was held in a
plain scalar and interpolated unquoted, and zsh does not word-split an unquoted
parameter, so `grep` was handed one filename made of both paths joined by a space,
failed with `No such file or directory`, and returned zero for a reason that had
nothing to do with the text. A scan that cannot read its own inputs reports clean.
The rerun holds the paths in an array and carries a sanity token that must be
present, so a repeat of that failure is visible rather than silent:

```text
=== scanned paths ===
lifetime-tax-strategy-lab.html
rltaxcombined.js
=== sanity: a token that MUST be present in these very paths ===
26,78
```

Each detector is proven live on a control string before its result is trusted, and
the run flags any detector that fails to match its own control:

```text
probability            detector_live_on_control=1  hits_in_scope_paths=0
lifetime-figure        detector_live_on_control=1  hits_in_scope_paths=3
break-even-year        detector_live_on_control=1  hits_in_scope_paths=0
ranking                detector_live_on_control=1  hits_in_scope_paths=4
recommendation         detector_live_on_control=1  hits_in_scope_paths=0
track-record           detector_live_on_control=1  hits_in_scope_paths=0
error-rate             detector_live_on_control=1  hits_in_scope_paths=0
SCAN_END
```

Probability, break-even year, recommendation, track record and error rate return
zero. The two non-zero detectors were read rather than dismissed.

**The three `lifetime-figure` hits are the tool's own name**, not a stated lifetime
figure — the module banner, the `<title>` and the `<h1>`, all reading
`Lifetime Tax Strategy Lab`. The detector is deliberately wide enough to catch the
title so that a real lifetime total could not hide behind it; each hit was checked
individually.

**All four `ranking` hits are disclaimers**, and every one of them denies the claim
rather than making it:

```text
  write them and nothing here is sorted, ranked or picked for you. The comparison multiplies the
  <caption>Two policies, one workspace, one resolved pack. No ranking and no preferred
  reports a single-year federal tax difference in dollars. It is not a ranking, not a preferred policy and not a statement about any later
  + ". It is not a ranking and this tool states no preferred policy: isRecommendation
```

**No result is labelled a complete combined tax**, and this is decided on the value
the record actually carries rather than on prose. `completeCombinedTax` has exactly
one assignment in the whole tracked tree, and it is a literal `false`:

```text
=== every completeCombinedTax occurrence in the tracked tree ===
lifetime-tax-strategy-lab.html:4861: + String(settled.completeCombinedTax) + " is what the record carries, because both packs name features they do not
rltaxcombined.js:172:      completeCombinedTax: false
scripts/selftest.mjs:15407:    && floridaCombination.completeCombinedTax === false
=== is it ever assigned anything but false? ===
   1 completeCombinedTax: false
```

The page prints that value through `String(...)` rather than a hand-written word,
so the surface cannot disagree with the record. One near-miss is named rather than
omitted: the page does render the word `complete` at line 4660, in
`measure.complete ? "complete" : "incomplete"`. That is the **pack's own
modified-adjusted-gross measure**, reporting whether the pack models every
adjustment for that measure — a different member on a different record. It is not
a statement that the combined tax is complete, and the combined record's own
completeness member remains the literal `false` above.

The gate command ran green in the same session:

```text
$ node scripts/selftest.mjs
Research-Lab self-test: 3106 passed, 0 failed
SELFTEST_EXIT=0
```

No mutation was applied to reach any of this; every clause is a derivation over
the tracked tree.

## Completion Statement

Filled at execution.

## SCN-022-013 request-ledger row, verifying pass (2026-08-22)

The restated DoD row was assessed against its own cited evidence,
`report.md#tp-05-20`, whose command is the `SCN-022-013` browser row in
`tests/lifetime-tax-combined.spec.mjs`. The command passes:

```
$ npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-013 the request ledger stays empty across the full combined workflow" --reporter=list

Running 1 test using 1 worker

  ✓  1 [system-chrome] › tests/lifetime-tax-combined.spec.mjs:407:1 › Regression: SCN-022-013 the request ledger stays empty across the full combined workflow (896ms)

  1 passed (2.4s)
```

The row states three propositions. Two of them the run does establish. The third
it establishes on three of the four surfaces it names, and not on the fourth.

| the row's proposition | what the cited test asserts | established |
| --- | --- | --- |
| the ledger does not grow after first paint across the full combined workflow | `expect(ledger.length).toBe(afterFirstPaint)`, taken after the household declaration, the residency declaration, the Power switch with the combined curve drawn, and the return to Simple | yes |
| every entry is a same-origin read of a document the page's own declarations name | the cross-origin filter over the whole ledger, plus `expect(permitted).toContain(pathname)` for every entry against a set derived from the page's own script tags and configuration, plus the two vacuity pins that the set contains `/rltaxcombined.js` and does not contain an undeclared path | yes |
| no household value reaches any URL, request, referrer or console message | URL: the page URL, its search and its hash. Request: each entry's URL against the sentinel, the residency token and its encoded form, plus an empty `postData`. Console: each message against the sentinel and the residency token. Referrer: nothing | no — three of four surfaces |

### The referrer surface is not asserted

`tests/lifetime-tax-combined.spec.mjs` contains zero occurrences of `referrer`.
The gap is structural rather than an omitted line: the ledger those assertions
filter is built by `collectRequests` in `tests/lifetime-tax.support.mjs`, which
records exactly three fields per request —

```
export function collectRequests(page) {
  const ledger = [];
  page.on('request', (request) => ledger.push({
    url: request.url(),
    method: request.method(),
    postData: request.postData() || ''
  }));
  return ledger;
}
```

— so no referrer value is captured for any assertion to read, and none is read
from the document either. A referrer is a request header; neither `page.url()`
nor `postData` is a substitute for it.

This is a genuine gap in the row rather than a repo-wide convention. The sibling
canary in `tests/lifetime-tax-foundation.spec.mjs` reads `document.referrer` off
the page and asserts against it directly, so the surface is one this family
already knows how to cover.

The row therefore stays open. Its first two propositions are earned and its third
is three-quarters earned, and a tick would assert the referrer surface on evidence
that does not exist. Closing it needs a referrer assertion in the cited browser
row, which is a change to a test file rather than a re-reading of one, and is left
to a pass that owns that change.

**Claim Source:** executed for the command output and for both quoted source
excerpts, which are read verbatim from the tracked tree. No mutation was applied.

## SCN-022-013 referrer surface, closed (2026-08-22)

The gap recorded immediately above is closed by asserting the surface rather than
by narrowing the row. `tests/lifetime-tax-combined.spec.mjs` went from `0` to `14`
occurrences of `referrer`, measured on the tracked file before and after:

```
$ for f in tests/lifetime-tax-*.mjs; do printf '%s: %s\n' "$f" "$(grep -c 'referrer' "$f")"; done
tests/lifetime-tax-benefit.spec.mjs: 2
tests/lifetime-tax-california.spec.mjs: 0
tests/lifetime-tax-claim-age.spec.mjs: 0
tests/lifetime-tax-combined.spec.mjs: 0
tests/lifetime-tax-conversion.spec.mjs: 0
tests/lifetime-tax-deduction.spec.mjs: 0
tests/lifetime-tax-disposition.spec.mjs: 3
tests/lifetime-tax-federal.spec.mjs: 0
tests/lifetime-tax-foundation.spec.mjs: 2
tests/lifetime-tax-inclusion.spec.mjs: 0
tests/lifetime-tax-marginal.spec.mjs: 0
tests/lifetime-tax-medicare.spec.mjs: 0
tests/lifetime-tax-preferential.spec.mjs: 1
tests/lifetime-tax-property.spec.mjs: 0
tests/lifetime-tax-rental.spec.mjs: 0
tests/lifetime-tax-retirement-route.spec.mjs: 0
tests/lifetime-tax-route.spec.mjs: 4
tests/lifetime-tax-state.spec.mjs: 1
tests/lifetime-tax-surtax.spec.mjs: 7
tests/lifetime-tax-use.spec.mjs: 0
OTHERS_TOTAL=20
```

The concept was asserted `20` times across the family and `0` times in the
workflow this row cites — the row named a surface its own evidence never read.

### What the row now reads

Three carriers feed one verdict, `expect(carriers).toEqual([])`:

- `document.referrer`, read off the page.
- Every header of every request the route issued, resolved through `allHeaders()`
  rather than the synchronous view.
- The page URL, because it is the referrer's *source*: a value smuggled into it
  becomes the `Referer` of every subsequent request.

Every header is scanned rather than the `Referer` name alone. That is not a
widening for its own sake — the sibling row `Regression: SCN-022-005 neither
declared surtax basis reaches a URL, a request, a referrer or a console message`
in `tests/lifetime-tax-surtax.spec.mjs` records that no request this route issues
presents a `Referer` at all, even through `allHeaders()`. A referrer-only clause
would therefore have reported a clean channel it had never read. The whole header
set subsumes the referrer clause and gives the scan a corpus that is provably
non-empty, which the row now pins with `expect(headerLedger.length)` and
`expect(headerValues)` both `toBeGreaterThan(0)`.

The detector is separately proven live by a control string built and scanned
inside the test process only — nothing is navigated, fetched, logged or rendered
— so a clean verdict cannot be a detector that never worked.

### Intended RED, same-command GREEN

The mutation plants exactly the defect the clause names: the view-mode write, the
only writer this route has for the page URL, appends the declared ordinary amount.
`--summary-match` is pinned to `page-url:` — the carrier label this row's own scan
emits — so the recorded RED proves the *referrer verdict* failed, not merely that
some assertion somewhere in the row failed.

```
=== RED/GREEN PROBE EVIDENCE ===
label:            TP-05-20 referrer channel: the view-mode write smuggles a declared amount into the page URL, which is the referrer source every subsequent request would carry as Referer
file:             lifetime-tax-strategy-lab.html
mutation:         var wanted = power ? "#power" : "#simple";  ->  var wanted = (power ? "#power" : "#simple") + "-" + byId("inputOrdinary").value;   (1 occurrence(s))
command:          npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep Regression:\ SCN-022-013\ the\ request\ ledger\ stays\ empty\ across\ the\ full\ combined\ workflow --reporter=line
red-exit:         1
red-summary:          +   "page-url:123457",
green-exit:       0
green-summary:      1 passed (1.9s)
summary-compared:     +   "page-url:123457",  vs    1 passed (<elapsed>)   (elapsed time normalised out)
revert-verified:  yes (committed=8ffe663489cb6307801d738f8850207de6b09d84 restored=8ffe663489cb6307801d738f8850207de6b09d84)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
PROBE_EXIT=0
```

`123457` is `SENTINEL_ORDINARY`, the declared ordinary income. The RED names it in
the referrer carrier array; the GREEN over the identical command finds nothing.

### The one thing this does not claim

No probe plants a household value directly into a request header or into
`document.referrer`. Neither is reachable: every request this route issues is made
during first paint, before any declaration exists, and `document.referrer` is set
by navigation rather than by page code. Planting one would require making the page
transmit a declaration, which is the exact act the harness's exfiltration rail
refuses and which this scope's privacy posture forbids. The page URL is therefore
the carrier through which the clause is falsifiable at all, and it is the carrier
the probe uses — the same reasoning the surtax row records.

**Claim Source:** executed. The referrer counts, the probe block and its exit code
are verbatim tool output from this session.

## Regression, Boundary And Sweep Evidence — 2026-08-24 Pass

This pass closes the four rows this scope carried open. Every command below was
executed in this session and its exit code captured immediately.

**Declared deviation from the Test Plan command string.** The Test Plan cells
name `--project=system-chrome`. Every run recorded here used `--project=chromium`
— the bundled Playwright browser declared in `playwright.config.mjs`, which
differs only by not requiring a system Chrome install. The rows constrain the
persistent **titles**, not the project, so the substitution does not weaken them.

### DoD — scenario-specific E2E regression for SCN-022-013, -014 and -015

This scope's three scenarios are carried by **six** persistent titles, not three:
`TP-05-16` through `TP-05-21` each name a distinct behaviour. All six are proven,
not the three headline ones alone.

Limb one, each title is present in the spec file rather than merely selected. The
literal searched includes the `test(` declaration, so a title that existed only
inside a comment or a `--grep` string could not satisfy it.

```text
$ grep -c -F "test('Regression: SCN-022-013 the combined total is the sum of two independent settlements'" tests/lifetime-tax-combined.spec.mjs
1
exit code: 0
$ grep -c -F "test('Regression: SCN-022-014 the combined curve attributes every step to a named jurisdiction'" tests/lifetime-tax-combined.spec.mjs
1
exit code: 0
$ grep -c -F "test('Regression: SCN-022-015 a pack year mismatch refuses and shows no combined figure'" tests/lifetime-tax-combined.spec.mjs
1
exit code: 0
$ grep -c -F "test('Regression: SCN-022-014 the combined curve is reachable by keyboard and has a text equivalent table'" tests/lifetime-tax-combined.spec.mjs
1
exit code: 0
$ grep -c -F "test('Regression: SCN-022-013 the request ledger does not grow after first paint and every entry is a declared same-origin read across the full combined workflow'" tests/lifetime-tax-combined.spec.mjs
1
exit code: 0
$ grep -c -F "test('Regression: SCN-022-013 the tool is absent from every registry and the market brief'" tests/lifetime-tax-combined.spec.mjs
1
exit code: 0
```

Limb two, each Test Plan command selects exactly one test.

```text
==== $ npx --no-install playwright test … --grep "Regression: SCN-022-013 the combined total is the sum of two independent settlements" --list
  [chromium] › tests/lifetime-tax-combined.spec.mjs:113:1 › Regression: SCN-022-013 the combined total is the sum of two independent settlements
Total: 1 test in 1 file
exit code: 0
==== $ npx --no-install playwright test … --grep "Regression: SCN-022-014 the combined curve attributes every step to a named jurisdiction" --list
  [chromium] › tests/lifetime-tax-combined.spec.mjs:188:1 › Regression: SCN-022-014 the combined curve attributes every step to a named jurisdiction
Total: 1 test in 1 file
exit code: 0
==== $ npx --no-install playwright test … --grep "Regression: SCN-022-015 a pack year mismatch refuses and shows no combined figure" --list
  [chromium] › tests/lifetime-tax-combined.spec.mjs:269:1 › Regression: SCN-022-015 a pack year mismatch refuses and shows no combined figure
Total: 1 test in 1 file
exit code: 0
==== $ npx --no-install playwright test … --grep "Regression: SCN-022-014 the combined curve is reachable by keyboard and has a text equivalent table" --list
  [chromium] › tests/lifetime-tax-combined.spec.mjs:333:1 › Regression: SCN-022-014 the combined curve is reachable by keyboard and has a text equivalent table
Total: 1 test in 1 file
exit code: 0
==== $ npx --no-install playwright test … --grep "Regression: SCN-022-013 the request ledger does not grow after first paint and every entry is a declared same-origin read across the full combined workflow" --list
  [chromium] › tests/lifetime-tax-combined.spec.mjs:408:1 › Regression: SCN-022-013 the request ledger does not grow after first paint and every entry is a declared same-origin read across the full combined workflow
Total: 1 test in 1 file
exit code: 0
==== $ npx --no-install playwright test … --grep "Regression: SCN-022-013 the tool is absent from every registry and the market brief" --list
  [chromium] › tests/lifetime-tax-combined.spec.mjs:517:1 › Regression: SCN-022-013 the tool is absent from every registry and the market brief
Total: 1 test in 1 file
exit code: 0
```

Limb three, each of those six selections runs and passes.

```text
==== $ npx --no-install playwright test --config=playwright.config.mjs --project=chromium --grep "Regression: SCN-022-013 the combined total is the sum of two independent settlements" --reporter=list
  ✓  1 …013 the combined total is the sum of two independent settlements (637ms)
  1 passed (2.2s)
exit code: 0
==== $ npx --no-install playwright test --config=playwright.config.mjs --project=chromium --grep "Regression: SCN-022-014 the combined curve attributes every step to a named jurisdiction" --reporter=list
  ✓  1 … the combined curve attributes every step to a named jurisdiction (1.3s)
  1 passed (2.3s)
exit code: 0
==== $ npx --no-install playwright test --config=playwright.config.mjs --project=chromium --grep "Regression: SCN-022-015 a pack year mismatch refuses and shows no combined figure" --reporter=list
  ✓  1 …22-015 a pack year mismatch refuses and shows no combined figure (576ms)
  1 passed (1.6s)
exit code: 0
==== $ npx --no-install playwright test --config=playwright.config.mjs --project=chromium --grep "Regression: SCN-022-014 the combined curve is reachable by keyboard and has a text equivalent table" --reporter=list
  ✓  1 …d curve is reachable by keyboard and has a text equivalent table (448ms)
  1 passed (2.2s)
exit code: 0
==== $ npx --no-install playwright test --config=playwright.config.mjs --project=chromium --grep "Regression: SCN-022-013 the request ledger does not grow after first paint and every entry is a declared same-origin read across the full combined workflow" --reporter=list
  ✓  1 …is a declared same-origin read across the full combined workflow (433ms)
  1 passed (1.5s)
exit code: 0
==== $ npx --no-install playwright test --config=playwright.config.mjs --project=chromium --grep "Regression: SCN-022-013 the tool is absent from every registry and the market brief" --reporter=list
  ✓  1 …-013 the tool is absent from every registry and the market brief (157ms)
  1 passed (1.2s)
exit code: 0
```

**The adversarial case.** The row requires that renaming or deleting one of those
persistent titles fails it, so an empty grep selection can never be read as a
pass. This scope's Test Plan commands grep the **whole** title including the
scenario token, so a token rename and a clause rename are the same mutation here.

```text
=== RED/GREEN PROBE EVIDENCE ===
label:            sc05 renaming a persistent title makes the Test Plan command fail
file:             tests/lifetime-tax-combined.spec.mjs
mutation:         test('Regression: SCN-022-015 a pack year mismatch refuses and shows no combined figure'  ->  test('RENAMED-BY-PROBE sc05 zzz'   (1 occurrence(s))
command:          npx --no-install playwright test --config=playwright.config.mjs --project=chromium --grep Regression:\ SCN-022-015\ a\ pack\ year\ mismatch\ refuses\ and\ shows\ no\ combined\ figure --reporter=list
red-exit:         1
red-summary:      Error: No tests found
green-exit:       0
green-summary:      1 passed (2.2s)
revert-verified:  yes (committed=311a9c6020a7a9418b267337246b940039ff8a73 restored=311a9c6020a7a9418b267337246b940039ff8a73)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
probe exit code: 0
```

**Verdict: closed.** Six titles present exactly once each as `test()`
declarations, six Test Plan commands each selecting exactly one test and exiting
0, and the rename proven to fail the command with `Error: No tests found`.

### DoD — broader E2E regression across the lifetime-tax browser family

**The selection floor is asserted before the run.** The listing must name a title
carrying each of this scope's three scenario tokens, and the listed total is
recorded so later shrinkage would be visible.

```text
$ npx --no-install playwright test --config=playwright.config.mjs --project=chromium --grep "SCN-02[1-4]" --list
LIST_EXIT=0
$ grep -c SCN-022-013 <list output>
4
$ grep -c SCN-022-014 <list output>
2
$ grep -c SCN-022-015 <list output>
1
$ grep 'Total:' <list output>
Total: 88 tests in 20 files
```

Two runs follow. The first is `TP-05-22`'s own command. The second selects the
family by **path** with no grep at all, which is strictly wider — 94 tests rather
than 88 — and is what the row's "not this scope's own spec file alone" clause
actually asks for. Both exceed forty lines, so each is a hash-verifiable bounded
capture whose sha256 covers every line produced.

```
# sc05 TP-05-22 broader regression, grep-selected SCN-02[1-4]
$ npx --no-install playwright test --config=playwright.config.mjs --project=chromium --grep SCN-02[1-4] --reporter=list
exit: 0
lines: 93
sha256: b0fb742b0bd5db68e396ded46632b86fc9b134ec170243a4dbfbc8097630616a
--- last 8 ---
  ✓  88 [chromium] › tests/lifetime-tax-use.spec.mjs:354:1 › Regression: SCN-023-010 the request ledger does not grow after the day-count declarations and every entry is a declared same-origin read (534ms)

  88 passed (24.0s)
```

```
# sc05 broader regression, whole lifetime-tax family selected by path
$ npx --no-install playwright test --config=playwright.config.mjs --project=chromium tests/lifetime-tax-.*\.spec\.mjs --reporter=list
exit: 0
lines: 99
sha256: cea6b5f41ae6cd5d3bd6a01579fd36c06b786120f12b0f119f8fad728189fd5d
--- last 8 ---
  ✓  94 [chromium] › tests/lifetime-tax-use.spec.mjs:354:1 › Regression: SCN-023-010 the request ledger does not grow after the day-count declarations and every entry is a declared same-origin read (569ms)

  94 passed (15.0s)
```

**A carried finding about this family, recorded because it was observed rather
than because this scope caused it.** During the sibling Scope 04 pass a
path-selected run of this same family failed once at `93 passed, 1 failed`. The
failing title is `Regression: SCN-023-010 the request ledger does not grow after
the day-count declarations and every entry is a declared same-origin read`, which
asserts `expect(entry.url).not.toContain('43')` where `43` is `personalUseSentinel`
at `tests/lifetime-tax-use.spec.mjs:366`. The static fixture binds an **ephemeral**
port, so the sentinel is a substring of the port number whenever the operating
system hands out a colliding one; 3.47 percent of the macOS ephemeral range
collides. The file is on this scope's byte-identical list and the scenario belongs
to `specs/023-property-tax-and-rental-income`, so the defect is carried out as a
finding rather than repaired here. It is named in this row because a reader who
reruns this family may meet it.

**The adversarial case, proven in two halves.** The row requires that a change
made inside this scope which reddens a **sibling** scope's persistent title fails
this row, *even while this scope's own rows stay green*. Both halves use the
identical mutation. It renames `stateSettlementCard`, a page anchor on this
scope's *Allowed modified* file that `tests/lifetime-tax-california.spec.mjs`
reads and `tests/lifetime-tax-combined.spec.mjs` never mentions — the exact
mirror of the probe Scope 04 ran in the other direction.

```text
$ grep -n "stateSettlementCard" tests/lifetime-tax-california.spec.mjs lifetime-tax-strategy-lab.html
tests/lifetime-tax-california.spec.mjs:129:  const gainRefusal = page.locator('#stateSettlementCard [data-rl-unavailable]');
tests/lifetime-tax-california.spec.mjs:132:  const gainCardText = await page.locator('#stateSettlementCard').innerText();
tests/lifetime-tax-california.spec.mjs:156:  const ordinaryRefusal = page.locator('#stateSettlementCard [data-rl-unavailable]');
tests/lifetime-tax-california.spec.mjs:159:  expect(await page.locator('#stateSettlementCard').innerText()).toBe(gainCardText);
tests/lifetime-tax-california.spec.mjs:223:  expect(await page.locator('#stateSettlementCard').innerText()).not.toMatch(/\$\s?\d/);
lifetime-tax-strategy-lab.html:764:                <div id="stateSettlementCard"></div>
lifetime-tax-strategy-lab.html:2882:                var stateHost = byId("stateSettlementCard");
$ grep -c stateSettlementCard tests/lifetime-tax-combined.spec.mjs
0
```

Half one — the broader row fails under the mutation.

```text
=== RED/GREEN PROBE EVIDENCE ===
label:            sc05 a scope-owned page edit that reddens a sibling scope title makes the broader family row fail
file:             lifetime-tax-strategy-lab.html
mutation:         stateSettlementCard  ->  stateSettlementCardPROBE   (2 occurrence(s))
command:          npx --no-install playwright test --config=playwright.config.mjs --project=chromium tests/lifetime-tax-.\*\\.spec\\.mjs --reporter=list
red-exit:         1
red-summary:        87 passed (1.1m)
green-exit:       0
green-summary:      94 passed (16.9s)
summary-compared:   87 passed (<elapsed>)  vs    94 passed (<elapsed>)   (elapsed time normalised out)
revert-verified:  yes (committed=8ffe663489cb6307801d738f8850207de6b09d84 restored=8ffe663489cb6307801d738f8850207de6b09d84)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
probe exit code: 0
```

Half two — the same mutation leaves this scope's own rows green. A probe exit of
`7` is the **intended** reading here and is what the clause requires: the harness
refuses because RED and GREEN agree, and RED and GREEN agreeing at `7 passed` is
exactly the statement that the sibling-reddening edit never touched this scope's
own rows.

```text
=== RED/GREEN PROBE EVIDENCE ===
label:            sc05 the same sibling-reddening edit leaves this scope's own rows green
file:             lifetime-tax-strategy-lab.html
mutation:         stateSettlementCard  ->  stateSettlementCardPROBE   (2 occurrence(s))
command:          npx --no-install playwright test --config=playwright.config.mjs --project=chromium --grep SCN-022-01\[345\] --reporter=list
red-exit:         0
red-summary:        7 passed (4.7s)
green-exit:       0
green-summary:      7 passed (4.6s)
summary-compared:   7 passed (<elapsed>)  vs    7 passed (<elapsed>)   (elapsed time normalised out)
revert-verified:  yes (committed=8ffe663489cb6307801d738f8850207de6b09d84 restored=8ffe663489cb6307801d738f8850207de6b09d84)
discriminating:   NO (both channels agree: exit 0 == 0, summary "  7 passed (<elapsed>)" identical once elapsed time is normalised)
=== END RED/GREEN PROBE EVIDENCE ===
red-green-probe: REFUSED — RED and GREEN produced the same outcome on both channels (both exited 0, and the --summary-match line was "  7 passed (<elapsed>)" in each once elapsed time was normalised out). The mutation did not change what the command reported, so the assertion under test cannot fail and this is not RED/GREEN evidence.
probe exit code: 7
```

Read as a pair, the two probes are the row's adversarial clause executed rather
than argued: `94 → 87 passed` on the family, `7 → 7 passed` on this scope's own
selection, from one mutation.

**Verdict: closed.** The selection floor is met before the runs, the grep-selected
run is green at 88, the strictly wider path-selected family run is green at 94,
the sibling-blast-radius clause is proven able to fail, and the one family defect
observed in this session is attributed and carried rather than absorbed.

### DoD — Change Boundary respected, zero excluded file families changed

This scope's excluded list is wider than Scope 04's: it excludes the **whole** of
`tax-rules/**` rather than only the federal and Florida subtrees, and the whole
`tests/lifetime-tax-*.spec.mjs` family, of which this scope's own
`tests/lifetime-tax-combined.spec.mjs` is the single *Allowed modified* member. The
scan therefore uses a negative pathspec, and the negative pathspec is proven to be
doing real work rather than silently matching nothing.

```text
pathspec_count=28
$ git status --porcelain -- <scope 05 excluded surfaces: 27 positive pathspecs + 1 negative>
exit code: 0
(no output above the exit line means zero rows)
$ git ls-files --others --exclude-standard -- <same pathspecs> | wc -l
       0
$ git ls-files -- 'tests/lifetime-tax-*.spec.mjs' ':(exclude)tests/lifetime-tax-combined.spec.mjs' | wc -l
      19
$ git ls-files -- 'tests/lifetime-tax-*.spec.mjs' | wc -l
      20
$ git ls-files -- 'tax-rules' | wc -l
      14
$ git ls-files -- <all excluded pathspecs> | wc -l
    7909
```

Twenty family specs, nineteen after the negative pathspec removes this scope's
own — so the exclusion is real and the remaining nineteen are genuinely scanned.
All fourteen `tax-rules/` files are inside the scanned set, which is the widening
this scope's list carries over Scope 04's. The excluded set resolves to **7,909**
tracked files and produced **zero** porcelain rows.

**The mtime limb has an empty domain, and that is measured rather than assumed.**
`git ls-files --others --exclude-standard` over the same pathspec set returns
zero, so every excluded surface this scope names is fully tracked and there is no
untracked excluded path for an mtime comparison to cover.

**Why `git diff --quiet` is not accepted, demonstrated rather than asserted.**

```text
$ git diff --quiet -- out.log ; echo "exit $?"
exit 0
$ git status --porcelain -- out.log
?? out.log
exit code: 0
```

**The adversarial case.** Touching one excluded path must produce a row and fail
the item. `scripts/validate-spec-test-paths.baseline` is on this scope's excluded
list and is chosen deliberately: it is not loaded by the page and not executed by
any browser run, so the transient mutation cannot perturb a concurrent test run,
and the probe command is a bare `git status` test that completes in milliseconds.

```text
=== RED/GREEN PROBE EVIDENCE ===
label:            sc05 touching one excluded path makes the path-scoped porcelain check fail
file:             scripts/validate-spec-test-paths.baseline
mutation:         # validate-spec-test-paths baseline — Research Lab  ->  # validate-spec-test-paths baseline — Research Lab.   (1 occurrence(s))
command:          sh -c test\ -z\ \"\$\(git\ status\ --porcelain\ --\ scripts/validate-spec-test-paths.baseline\)\"
red-exit:         1
red-summary:      (no output)
green-exit:       0
green-summary:    (no output)
revert-verified:  yes (committed=c9f7a2ffbdfaa84cbfb46e8f078325c9194762b5 restored=c9f7a2ffbdfaa84cbfb46e8f078325c9194762b5)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
probe exit code: 0
```

**Disclosure — files were transiently mutated by this session's probes.** The
`scripts/validate-spec-test-paths.baseline` probe above deliberately touched an
excluded file to prove the check can fail, and the regression and sweep probes
touched `lifetime-tax-strategy-lab.html` and `tests/lifetime-tax-combined.spec.mjs`,
both on this scope's *Allowed* lists. In every case the harness verified the
restored blob hash against the committed blob hash, so each file is byte-identical
to its committed content and no commit carries any of those mutations.

**Verdict: closed.** Zero porcelain rows across 7,909 tracked excluded files, zero
untracked files anywhere in the excluded set, the negative pathspec proven
non-vacuous, the porcelain-versus-`git diff` asymmetry demonstrated, and the check
proven able to fail.

### DoD — Consumer Impact Sweep complete, zero stale first-party references

**The sweep's domain is derived, and it is narrower than the row's wording
suggests.** This scope's Assertion Supersession section states it owns no ledger
entry and appends only. It *creates* `rltaxcombined.js` and the combined panel
anchors; it renames no route, moves no path and removes no identifier. The five
surfaces its own sweep table names are therefore checked for **unresolved** and
**orphan** references rather than for a stale old name, because there is no old
name to leave behind. Each limb is executed rather than argued.

**Limb one — the page's module `src` list, read as an API client would read it.**

```text
$ <every <script src> the route declares, resolved on disk>
  rltax.js                     EXISTS
  rltaxclaimage.js             EXISTS
  rltaxcombined.js             EXISTS
  rltaxdisposition.js          EXISTS
  rltaxinclusion.js            EXISTS
  rltaxmedicare.js             EXISTS
  rltaxproperty.js             EXISTS
  rltaxrental.js               EXISTS
  rltaxrules.js                EXISTS
  rltaxsocialsecurity.js       EXISTS
  rltaxstate.js                EXISTS
  rltaxstrategy.js             EXISTS
  rltaxuse.js                  EXISTS
  rltaxworkspace.js            EXISTS
declared_module_srcs= 14  unresolved= 0
```

**Limb two — the repository-wide module-reference scan.** Every first-party
reference to any `rltax*.js` identifier, across every tracked file outside
`specs/`, must resolve.

```text
$ <repository-wide scan for every rltax*.js module reference outside specs/>
  rltax.js                   EXISTS  referenced by 6 file(s)
  rltaxclaimage.js           EXISTS  referenced by 4 file(s)
  rltaxcombined.js           EXISTS  referenced by 4 file(s)
  rltaxdisposition.js        EXISTS  referenced by 3 file(s)
  rltaxinclusion.js          EXISTS  referenced by 3 file(s)
  rltaxmedicare.js           EXISTS  referenced by 3 file(s)
  rltaxproperty.js           EXISTS  referenced by 5 file(s)
  rltaxrental.js             EXISTS  referenced by 3 file(s)
  rltaxrules.js              EXISTS  referenced by 10 file(s)
  rltaxsocialsecurity.js     EXISTS  referenced by 3 file(s)
  rltaxstate.js              EXISTS  referenced by 4 file(s)
  rltaxstrategy.js           EXISTS  referenced by 12 file(s)
  rltaxuse.js                EXISTS  referenced by 3 file(s)
  rltaxworkspace.js          EXISTS  referenced by 5 file(s)
distinct_module_refs= 14  unresolved_refs= 0

$ <the module this scope creates, and who reads it>
   rltaxcombined.js <- lifetime-tax-strategy-lab.html
   rltaxcombined.js <- scripts/selftest.mjs
   rltaxcombined.js <- site-exclusions.json
   rltaxcombined.js <- tests/lifetime-tax-combined.spec.mjs
```

**Limb three — the combined panel anchor ids, and the one apparent orphan read
rather than dismissed.** Every anchor the spec selects is resolved against the ids
the page emits, in both directions.

```text
$ <every anchor id the combined spec selects, resolved against the ids the page emits>
  #combinedCurveChart                 RESOLVED
  #combinedCurveIncompleteLabel       RESOLVED
  #combinedCurveTextEquivalent        RESOLVED
  #combinedCurveTextEquivalentBody    RESOLVED
  #combinedIndependenceLine           RESOLVED
  #combinedItemizedNotice             RESOLVED
  #combinedLegBreakdownBody           RESOLVED
  #combinedPackYearsBody              RESOLVED
  #combinedRefusal                    RESOLVED
  #combinedSettlementCard             RESOLVED
  #inputResidencyJurisdiction         RESOLVED
  #inputResidencyPattern              RESOLVED
  #modeSimple                         RESOLVED
  #power                              RESOLVED
  #power-combined                     RESOLVED
  #simple                             RESOLVED
  #tip-combinedTotalTax               UNRESOLVED
selected_anchor_ids= 17  unresolved= 1
```

**One apparent orphan was found, and it was read rather than assumed benign.**
`#tip-combinedTotalTax` is not a stale reference: it is **constructed at runtime**
from the field id, so no static scan of the HTML can see it.

```text
$ grep -n "tip-" lifetime-tax-strategy-lab.html
lifetime-tax-strategy-lab.html:1793:                figure.setAttribute("aria-describedby", "tip-" + fieldId);
lifetime-tax-strategy-lab.html:1797:                tip.id = "tip-" + fieldId;
$ grep -c 'combinedTotalTax' lifetime-tax-strategy-lab.html
10
$ grep -n "tip-combinedTotalTax" tests/lifetime-tax-combined.spec.mjs
146:  expect(describedBy).toBe('tip-combinedTotalTax');
147:  await expect(page.locator('#tip-combinedTotalTax')).toContainText('addition');
```

The derived id resolves only in a live browser, and it *is* resolved there: the
row `Regression: SCN-022-013 the combined total is the sum of two independent
settlements` asserts `#tip-combinedTotalTax` contains `addition` and passed above.
The static limb's single unresolved entry is therefore a false positive **of the
static method**, closed by the browser limb rather than by argument. The count of
real unresolved anchors is **zero**. In the other direction the page emits sixteen
`combined*` anchors, twelve of which the spec selects; the four it does not
(`#combinedCoupling`, `#combinedCouplingBody`, `#combinedCurveChartFallback`,
`#combinedUnavailableContributorList`) are emitted-but-unselected, which is the
opposite of a stale reference.

**Limb four — the registries, which this route is deliberately absent from.** A
rename here must leave all three byte-identical rather than update them.

```text
$ git status --porcelain -- rlnav.js index.html tools.json
exit code: 0
(no output above the exit line means all three are byte-identical)
$ grep -c 'lifetime-tax-strategy-lab' rlnav.js index.html tools.json
rlnav.js:0
index.html:0
tools.json:0
$ grep -c 'combinedSettlementCard\|rltaxcombined' rlnav.js index.html tools.json
rlnav.js:0
index.html:0
tools.json:0
```

Zero rows and zero references in all three, which is the registration-absence
posture the browser row `Regression: SCN-022-013 the tool is absent from every
registry and the market brief` also asserts live.

**The adversarial case, and a measured defect in the first attempt.** The row
requires that one stale reference left anywhere fails it, and that the proof be a
repository-wide scan rather than a spot check. The first probe planted
`rltaxcombinedZZ.js` and the scan did **not** notice, so the harness refused at
exit 7 rather than letting an unfalsifiable scan pass as evidence.

The cause was in the scan, not the plant: its pattern was `\brltax[a-z]*\.js\b`,
whose lowercase-only alphabet cannot match a name carrying `ZZ`. A scan that is
blind to any renamed identifier containing a capital letter is not a
repository-wide stale-reference scan. The pattern was widened to
`\brltax[A-Za-z]*\.js\b`, re-derived on the clean tree, and re-probed.

```text
$ python3 -c "<the widened scan>"
distinct= 14 unresolved= 0 []
SCAN_EXIT=0
```

```text
=== RED/GREEN PROBE EVIDENCE ===
label:            sc05 one stale module reference makes the repository-wide sweep scan fail
file:             tests/lifetime-tax-combined.spec.mjs
mutation:         rltaxcombined.js  ->  rltaxcombinedZZ.js   (2 occurrence(s))
red-exit:         1
red-summary:      distinct= 15 unresolved= 1 ['rltaxcombinedZZ.js']
green-exit:       0
green-summary:    distinct= 14 unresolved= 0 []
summary-compared: distinct= 15 unresolved= 1 ['rltaxcombinedZZ.js']  vs  distinct= 14 unresolved= 0 []   (elapsed time normalised out)
revert-verified:  yes (committed=311a9c6020a7a9418b267337246b940039ff8a73 restored=311a9c6020a7a9418b267337246b940039ff8a73)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
probe exit code: 0
```

The refused first attempt is recorded rather than deleted, because it is the
reason the scan that closes this row is trustworthy: the scan was proven able to
fail only after it was proven, once, unable to.

**Verdict: closed.** The sweep domain is derived from this scope's own
supersession position rather than assumed, all four limbs return zero real stale
references, the single apparent orphan is read and classified individually rather
than dismissed by count, and the scan is proven able to fail on one planted
reference — after its first form was measured unable to and repaired.

### Repository gates re-run in this pass

```text
$ node scripts/selftest.mjs
================================================
Research-Lab self-test: 3404 passed, 0 failed
================================================
SELFTEST_EXIT=0
$ node scripts/validate-spec-test-paths.mjs
[spec-test-paths] scanned=741 references=17058 distinctPaths=265 missingPaths=73 plannedMissing=3 baseline=70 new=0 stale=0
[spec-test-paths] OK — no new missing test path(s)
VALIDATE_EXIT=0
$ node scripts/build-pages-site.mjs --dry-run
{"contractVersion":"pages-site-build-result/v1","dryRun":true,"registeredPages":29,"excludedPaths":12,"rootFiles":130,"directories":["briefs","data","docs","notes","research","rlexperience-adapters","tests/fixtures"],"historyIndexDirectory":"briefs/indexes/1ec47979ab79341790c0b261483040e0ddb452db8800d9c45f6cb21378feafb3","omittedOrphanIndexes":171}
PAGES_EXIT=0
$ bash .github/bubbles/scripts/artifact-lint.sh specs/022-federal-preferential-and-state-income-tax
Artifact lint PASSED.
ARTIFACT_LINT_EXIT=0
```

**Claim Source:** executed. Every command string, exit code, probe block and
capture hash in this section is verbatim tool output from this session.

