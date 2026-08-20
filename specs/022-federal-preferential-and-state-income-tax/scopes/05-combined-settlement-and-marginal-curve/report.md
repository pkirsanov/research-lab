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

### Scenario SCN-022-014

`Regression: SCN-022-014 the combined curve attributes every step to a named jurisdiction`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-014 the combined curve attributes every step to a named jurisdiction" --reporter=list`

### Scenario SCN-022-015

`Regression: SCN-022-015 a pack year mismatch refuses and shows no combined figure`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-015 a pack year mismatch refuses and shows no combined figure" --reporter=list`

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

`Regression: SCN-022-013 the request ledger stays empty across the full combined workflow`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-013 the request ledger stays empty across the full combined workflow" --reporter=list`

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

### TP-05-21

`Regression: SCN-022-013 the tool is absent from every registry and the market brief`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-013 the tool is absent from every registry and the market brief" --reporter=list`

**Partial. This row is not closed, and the DoD item it anchors is left open.** The
row passes, and the equivalent selftest assertion passes, but neither has been
shown able to fail, and the reason is a genuine conflict rather than an omission.

The only mutation that drives the registration clause RED is to register the tool
— adding a `lifetime-tax` entry to `tools.json`, `index.html`, `rlnav.js`,
`README.md`, `notes/README.md` or `market-brief.config.json`. All six are on this
scope's must-remain-byte-identical list *and* under an explicit standing
instruction not to register this tool, so applying that mutation even transiently
is not available here. Asserting an absence that has never been observed to become
a presence is the same shape of weak evidence recorded under TP-05-11: it would
pass unchanged against a build in which the check had been deleted.

The second clause of the same DoD item — that no new root HTML exists — *is*
separately drivable without touching a protected file, by creating an extra
`lifetime-tax-*.html` at the repository root and deleting it. That probe was not
carried out in this session. The row is therefore left open rather than narrowed
to the half that is already green, and it is recorded here so the next session
does not have to rediscover why.

The deploy-gate half of the item is closed independently under TP-05-25 above.

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

This row is recorded but the DoD item it belongs to — every Test Plan row carrying
intended-RED and same-command GREEN evidence — remains open, because TP-05-11,
TP-05-16, TP-05-17, TP-05-18 and TP-05-21 do not yet carry RED evidence.

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

Filled at execution. This scope supersedes nothing, so this section holds the
closing check only: the nine `SUP-022-NN` markers present in the repository, each
mapped to its delivered ledger entry, and the evidence that every pre-existing
assertion outside those nine still passes unchanged.
Command: `node scripts/selftest.mjs`

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

Filled at execution. Holds the text scan proving no probability, lifetime figure,
break-even year, ranking, recommendation, track record, accuracy claim or error
rate appears in this scope's allowed paths, and that no result is labelled a
complete combined tax.

## Completion Statement

Filled at execution.
