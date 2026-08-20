# Scope 03 Report: Resolved-flat sentinel and resolution record

Evidence contract: [scope.md](scope.md), [spec.md](../../spec.md), [scope index](../_index.md), and [uservalidation.md](../../uservalidation.md).

**Evidence status:** In Progress. Three increments have landed and are recorded below with executed evidence.
The 2026-08-20 planning-correction sections that follow the increments are **not** implementation evidence and
satisfy no Definition of Done item; they are preserved as the analysis that produced the `F-015-03-01` ruling.

## Summary

Three increments have landed. Increment 3 declared the denominator contract and authored the four Test Plan rows
that had been named but never written; this pass re-executed every command against `HEAD` = `d7aa39d1d` and
closed the five Definition of Done items those changes genuinely satisfy: **27 of 30 ticked, 3 left open.**

The three remaining are open for real reasons, not for want of a measurement. One (`T-03-R2`) has a red conjunct
whose cause lies outside this scope and a second conjunct that was not measured at all. One (`T-03-S1`) needs a
scope-start baseline that was never captured and can no longer be taken. One (the Build Quality Gate) is a
grouped gate that inherits both and additionally names a revert this evidence pass did not perform. Each is named
with its blocking conjunct in [Items left open, and the real reason for each](#items-left-open).

Before the increments, a reality check found **six stale premises and one blocking defect** in `scope.md`. All
seven are recorded below, the blocking defect was ruled on, and the falsified plan text was corrected. That
correction moved the count from 27 unticked / 0 ticked to **30 unticked / 0 ticked** because it added
obligations rather than removing them; increment 2's pass moved it to 22 ticked / 8 unticked, and this pass to
**27 ticked / 3 unticked**.

---

<a id="increments-landed"></a>

## Increments landed

| Increment | Commit reachable from `main` | Files | Test rows added |
|---|---|---|---|
| 1 — outcome vocabulary, routing table, flat-band guard | `2fb48abcc` | `rlclaims.js`, `scripts/selftest.mjs`, `scripts/validate-spec-test-paths.mjs`, `tests/recommendation-track-record.unit.mjs` | T-03-U1, U2, U3, U6 (increment-1 half), U7 |
| 2 — `brief-recommendation-resolution/v1` | `1bb5a2ebc` | `rlclaims.js`, `tests/recommendation-track-record.unit.mjs` | T-03-U4, U5, U6 (increment-2 half), plus unit precursors for T-03-F1 and T-03-F2 |
| 3 — the denominator contract, and the F and R rows | `d7aa39d1d` | `rlclaims.js`, `tests/recommendation-track-record.functional.mjs`, `tests/recommendation-track-record.e2e.mjs` | T-03-F1, F2, F3, R1 |

Increment 3 is the current `HEAD`. **The hash `2083159bb` in circulation for it is a pre-rebase orphan and is
unreachable**, exactly like the three recorded in [the correction below](#commit-hash-correction). Measured this
session:

```text
2083159bb ancestor-of-HEAD=NO   feat(015): declare the denominator contract and author scope 03 F and R rows
d7aa39d1d ancestor-of-HEAD=yes  feat(015): declare the denominator contract and author scope 03 F and R rows
```

`d7aa39d1d` is the reachable hash and is what this report cites. Its diffstat is three files — `rlclaims.js`
(+61), `tests/recommendation-track-record.e2e.mjs` (+235), `tests/recommendation-track-record.functional.mjs`
(+347, −1) — so `rlvalidation.js`, `spec.md` and `design.md` are untouched by it on the record.
| 3 — the denominator contract, and the F and R rows | `d7aa39d1d` | `rlclaims.js`, `tests/recommendation-track-record.functional.mjs`, `tests/recommendation-track-record.e2e.mjs` | T-03-F1, F2, F3, R1 |

Also load-bearing for this scope but **owned by scope 01**: `3c0aa1036`, which added the eighth `MINT_REFUSALS`
member `no-authored-flat-band`. Verified this session that neither scope-03 increment touched `MINT_REFUSALS`
or `evaluateMintReason`, so the `F-015-03-01` routing held:

```text
$ git show 2fb48abcc 1bb5a2ebc -- rlclaims.js | grep -E '^[+-].*(MINT_REFUSALS|evaluateMintReason|no-authored-flat-band)'
402:+    /* Derived from `MINT_REFUSALS`, never restated: every mint reason is a legal not-evaluable
405:+    var NOT_EVALUABLE_REASONS = unionSorted([MINT_REFUSALS, RESOLVER_NOT_EVALUABLE_REASONS]);
```

Both hits are **reads** of the scope-01 constant, not edits to it. The refusal itself was added by `3c0aa1036`:

```text
$ git show 3c0aa1036 -- rlclaims.js
-        "neutral-direction-no-magnitude"
+        "neutral-direction-no-magnitude",
+        "no-authored-flat-band"
+        if (!Number.isFinite(claim.magnitude.flatBand) || claim.magnitude.flatBand <= 0) {
+            return { reason: "no-authored-flat-band", field: "magnitude.flatBand" };
```

<a id="commit-hash-correction"></a>

### Correction — the increment hashes in circulation are unreachable

The hashes `841442da3` (increment 1), `4e0802218` (increment 2) and `3596477c4` (the scope-01 mint fix) are
**pre-rebase orphans**. Measured this session, none is an ancestor of `HEAD`:

```text
841442da3 ancestor-of-HEAD=NO   feat(015): scope 03 increment 1 -- outcome vocabulary, routing table, flat-band guard
4e0802218 ancestor-of-HEAD=NO   feat(015): scope 03 increment 2 -- brief-recommendation-resolution/v1
3596477c4 ancestor-of-HEAD=NO   fix(015): refuse a degenerate flatBand at mint (F-015-03-01)
2fb48abcc ancestor-of-HEAD=yes  feat(015): scope 03 increment 1 -- outcome vocabulary, routing table, flat-band guard
1bb5a2ebc ancestor-of-HEAD=yes  feat(015): scope 03 increment 2 -- brief-recommendation-resolution/v1
3c0aa1036 ancestor-of-HEAD=yes  fix(015): refuse a degenerate flatBand at mint (F-015-03-01)
```

Every citation in this report uses the reachable hash. A citation to an unreachable object would not be
re-derivable by a later reader, which is the whole point of citing one.

<a id="divergence-rlclaims-must-not-touch"></a>

### Divergence found this pass — the must-not-touch table forbids the file both increments were written in

`scope.md` → *Files and surfaces this scope must not touch* says of `rlclaims.js`: *"This scope **consumes**
`rlclaims.js` … and modifies no byte of it."* Both increments modified it — 199 lines in increment 1 and 457 in
increment 2 — as did scope 02 before them (`authorizeResolutionWrite` at `#L551` is scope 02's). `rlclaims.js`
is the shared Feature 015 module, and every 015 scope so far has added to it.

The row was added on 2026-08-20 to fence off the **mint-side** surface, and that narrower reading held exactly:
`MINT_REFUSALS` and `evaluateMintReason` were left to scope 01, evidenced above. The generalisation to *"modifies
no byte of it"* is what is falsified. **No Definition of Done item asserts `rlclaims.js` is untouched**, so
nothing ticked in this pass depends on the falsified sentence; the Build Quality Gate names `rlvalidation.js`,
which is genuinely byte-unmodified. The row is left as authored — narrowing it is a plan correction, not
evidence — and is routed for the owner.

---

## Test Evidence

All three commands below were executed in this session against `HEAD` = `1bb5a2ebc`, on a working tree that
also carries 63 uncommitted files belonging to a concurrent session. Their effect on each figure is stated
where it matters.

<a id="run-unit"></a>

### The unit run every T-03-U row is read from

```text
$ node --test tests/recommendation-track-record.unit.mjs
✔ T-01-U1: claimHash is content-only across exactly the five unhashed fields (14.668383ms)
✔ T-01-U2: every hashed term is load-bearing (12.852986ms)
✔ T-01-U3: RTR-PREDICATE-AMEND refuses a byte-changing write and never overwrites (12.363285ms)
✔ T-01-U4: non-semantic-subject refuses both publisher positional fallbacks (18.563579ms)
✔ T-01-U5: no-committed-series refuses an empty seriesRefs and a partially-absent basket (17.50688ms)
✔ T-01-U6: every closed vocabulary refuses a one-character-off value (30.248465ms)
✔ T-01-U7: direction is bound to ACTION_DIRECTION and hold has no signed outcome (6.777693ms)
✔ T-02-U1: claimRef is optional on the live v2 at every committed shape, and v1 needs it never (75.588213ms)
✔ T-02-U2: v1 stays closed against claimRef, and v2 stays closed against everything else (26.719069ms)
✔ T-02-U3: eventId and recommendationKey are byte-identical with and without the mint hook (38.508356ms)
✔ T-02-U4: RTR-LEGACY-BACKFILL refuses a resolution written against a claimless row (31.024064ms)
✔ T-03-U1: outcomeClass at the flatBand boundary, where an `=== 0` classifier fails (2.492698ms)
✔ T-03-U2: RTR-FLAT-ZERO refuses a bare zero reaching the directional array (2.364397ms)
✔ T-03-U3 (increment 1): the routing table feeds only win and loss to the directional array (0.961199ms)
✔ T-03-U6 (increment 1): the outcomeClass vocabulary refuses a one-character-off value (0.442899ms)
✔ T-03-U7: a degenerate flatBand refuses before any outcomeClass is assigned (20.737076ms)
✔ T-03-U5: the exact unrounded outcomeValue survives into the record, the bytes, and the store (755.521337ms)
✔ T-03-U4 (increment 2): summary.unresolved is consumed and discarded while the 015 counts stay distinct (1.621698ms)
✔ T-03-U6 (increment 2): the closure vocabulary is read from rlcontracts.js and RTR-CLOSURE-VOCAB refuses (1243.645585ms)
✔ T-03-F1 (unit precursor): resolutionHash covers exactly the hashed terms, and the write is a no-op or a refusal (371.100279ms)
✔ T-03-F2 (unit precursor): the partition accounts for every proposed call, and no claim can fall out (1.561798ms)
ℹ tests 21
ℹ suites 0
ℹ pass 21
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2812.794095
exit 0
```

Ten of the 21 rows are scope 01 and scope 02 rows, still green, so the increments broke nothing upstream of
themselves. **Zero warnings, zero skipped, zero todo.**

<a id="run-selftest"></a>

### The repo self-test

```text
$ node scripts/selftest.mjs
exit: 0
lines: 3613
sha256: 4198b7214373f1337bd2a48045ffabf2534c8dbfc2b46a1ce4fd8061e329be7c
--- last 3 ---
================================================
Research-Lab self-test: 3182 passed, 0 failed
================================================
```

Captured with `.github/bubbles/scripts/evidence-capture.sh`; the digest covers every one of the 3,613 lines and
is re-derivable with `--verify`. **`3182 passed, 0 failed`, exit 0.** This is a *green* reading and is offered
as such — it is **not** offered against `T-03-S1`, which needs a delta against a scope-start baseline that was
never captured. See [Items left open](#items-left-open).

<a id="run-artifact-lint"></a>

### Artifact lint

```text
$ bash .github/bubbles/scripts/artifact-lint.sh specs/015-recommendation-outcome-ledger-and-track-record
exit: 0
lines: 159
sha256: b52a9c8740aa3a10a01d3ff9b95788c268d18ffd6965f9caad0beabf5ee271c0
--- last 2 ---
=== End Anti-Fabrication Checks ===
Artifact lint PASSED.
```

---

<a id="increment-3-runs"></a>

## Increment 3 evidence — re-measured at `HEAD` = `d7aa39d1d`

Increment 3 landed the denominator contract in `rlclaims.js` and authored the four rows the Test Plan had named
but never written. Every figure below was **re-executed this session** at `HEAD` = `d7aa39d1d`; nothing is
carried forward from the increment-2 pass. The working tree still carries a concurrent session's 63 uncommitted
files, and the two places that changes a figure are named where they occur.

<a id="run-unit-inc3"></a>

### The unit run, unchanged by increment 3

```text
$ node --test tests/recommendation-track-record.unit.mjs
✔ T-03-U1: outcomeClass at the flatBand boundary, where an `=== 0` classifier fails (2.872899ms)
✔ T-03-U2: RTR-FLAT-ZERO refuses a bare zero reaching the directional array (2.8996ms)
✔ T-03-U3 (increment 1): the routing table feeds only win and loss to the directional array (0.665399ms)
✔ T-03-U6 (increment 1): the outcomeClass vocabulary refuses a one-character-off value (0.4477ms)
✔ T-03-U7: a degenerate flatBand refuses before any outcomeClass is assigned (14.487696ms)
✔ T-03-U5: the exact unrounded outcomeValue survives into the record, the bytes, and the store (858.144773ms)
✔ T-03-U4 (increment 2): summary.unresolved is consumed and discarded while the 015 counts stay distinct (2.100299ms)
✔ T-03-U6 (increment 2): the closure vocabulary is read from rlcontracts.js and RTR-CLOSURE-VOCAB refuses (1241.406075ms)
✔ T-03-F1 (unit precursor): resolutionHash covers exactly the hashed terms, and the write is a no-op or a refusal (308.06012ms)
✔ T-03-F2 (unit precursor): the partition accounts for every proposed call, and no claim can fall out (1.4771ms)
ℹ tests 21
ℹ suites 0
ℹ pass 21
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2868.495444
EXIT=0
```

`21 pass, 0 fail`, exit `0`, zero warnings, zero skipped, zero todo. Eleven scope-01/02 rows are elided from the
listing above for length only; all 21 are counted in the totals and all are green.

<a id="run-functional-inc3"></a>

### The scope-03 functional file, where the three F rows now live

```text
$ node --test tests/recommendation-track-record.functional.mjs
✔ T-01-F1: the content-addressed write round-trips as a byte-identical no-op (30.310993ms)
✔ T-01-F2: citedToolId is a citation — neither identity nor the producer (38.05189ms)
✔ T-01-F3: recommendationKey is one-to-many with claimHash across horizon kinds (7.770598ms)
✔ T-03-F1: resolutionHash is content-only and the content-addressed write is a byte-identical no-op (153.715762ms)
✔ T-03-F2: the class partition holds over a classified cohort and fails when a whole class is dropped (5.767198ms)
✔ T-03-F3: resolvedDirectional === 0 is reachable and the primitive is never called (10.686198ms)
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 368.992308
EXIT=0
```

All three rows are at `tests/recommendation-track-record.functional.mjs`, the file the Test Plan names. The
`(unit precursor)` rows in `.unit.mjs` remain and are additive, not a substitute.

The whole committed functional suite was also run, and is **not** clean:

```text
$ node --test tests/*.functional.mjs
exit: 1
lines: 1270
sha256: 2139d2819467fa7cc809922a4ba3dd86b59230357cad83522705af7613a71d96
--- failure-shaped lines from the omitted region ---
not ok 9 - SCN-012-003 exact TP-03-01 through TP-03-05 commands replay RED then GREEN in isolated rollback baseline
--- last ---
# tests 182
# suites 0
# pass 181
# fail 1
```

The single failure is `SCN-012-003`, which belongs to `tests/contextual-tooltip.functional.mjs` and to spec 012 —
not to this scope, and not to any file increment 3 touched. It is recorded here because a suite-level figure that
omitted it would be a lie; no Definition of Done item in this scope is ticked on the suite-level figure.

<a id="run-e2e-inc3"></a>

### The scope-03 e2e file, and the committed Node E2E suite

```text
$ node --test tests/recommendation-track-record.e2e.mjs
✔ T-01-R1: the whole fixture claim set holds the frozen contract against the real store layout (166.963631ms)
✖ T-01-R2: the committed suites are intact, and the committed Node E2E suite runs green (50.296983ms)
✔ T-03-R1: a resolved-flat outcome survives a full classify-route-summarise-store pass as its own class (215.957825ms)
ℹ tests 3
ℹ pass 2
ℹ fail 1
ℹ duration_ms 532.108377

✖ T-01-R2 …
  AssertionError [ERR_ASSERTION]: no committed test file may be modified, renamed or removed by this scope; git reported:
   M tests/portfolio-survival-allocation.spec.mjs
   M tests/portfolio-survival-brief.spec.mjs
   M tests/portfolio-survival-diversification.spec.mjs
   M tests/portfolio-survival-foundation.spec.mjs
   M tests/portfolio-survival-mobile.spec.mjs
   M tests/portfolio-survival-paths.spec.mjs
   M tests/portfolio-survival-risk.spec.mjs
EXIT=1
```

`T-03-R1` is green. `T-01-R2` fails, and its own assertion message names the cause: seven **uncommitted**
`tests/portfolio-survival-*.spec.mjs` files belonging to a concurrent session. That is a property of the working
tree, not of this scope's change — increment 3 modified three files and none is among them.

The whole committed Node E2E suite carries that one failure and nothing else:

```text
$ node --test tests/*.e2e.mjs
exit: 1
lines: 266
sha256: 81264321dd9642cc12b19fa308b99cc239dcf483447773a848c61bd8ed6c73e3
--- failure-shaped lines from the omitted region ---
not ok 31 - T-01-R2: the committed suites are intact, and the committed Node E2E suite runs green
--- last ---
# tests 35
# suites 0
# pass 34
# fail 1
```

<a id="run-selftest-inc3"></a>

### The repo self-test at `HEAD` = `d7aa39d1d`

```text
$ node scripts/selftest.mjs
exit: 0
lines: 3615
sha256: 357bb15c8b5ca0e2aec16025ee6e5eeb75120e5fcbb720a8b1a53d79d01820ef
--- last 3 ---
================================================
Research-Lab self-test: 3184 passed, 0 failed
================================================
```

`3184 passed, 0 failed`, exit `0`, up from `3182` at increment 2 — no assertion count decreased. Captured with
`.github/bubbles/scripts/evidence-capture.sh`; the digest covers all 3,615 lines and is re-derivable with
`--verify`. This remains a **green reading only**. It is still **not** offered against `T-03-S1`, which needs a
delta against a scope-start baseline that was never captured; see [Items left open](#items-left-open).

<a id="t-03-f1"></a>

### T-03-F1 — `resolutionHash` is content-only and the write is a byte-identical no-op

`✔ T-03-F1 … (153.715762ms)` in [the functional run above](#run-functional-inc3); command
`node --test tests/recommendation-track-record.functional.mjs`, exit `0`.

The row is adversarial by construction rather than by an external mutate-and-revert claim. It iterates **every**
hashed term, asserts the mutation genuinely differs (`assert.notDeepEqual`) before asserting the hash moves, and
refuses to pass if a hashed term has no mutation authored for it — `'a hashed term with no mutation authored
here would go uncovered'`. It then iterates every unhashed field and asserts the hash does **not** move, with the
same coverage guard. An implementation that hashed the whole object, or that hashed only a subset, fails a named
term rather than passing quietly.

<a id="t-03-f2"></a>

### T-03-F2 — the partition holds, and fails when a whole class is dropped

`✔ T-03-F2 … (5.767198ms)` in [the functional run above](#run-functional-inc3); same command, exit `0`.

The load-bearing half is the drop loop: for each `outcomeClass` present in the cohort it removes every member of
that class, asserts `droppedCount > 0` first so the drop is real, then asserts the partition **refuses** with
`partition-does-not-sum-to-proposed` on `totalProposed` and that the refusal names the exact shortfall
(`refused.error.unaccounted === droppedCount`) and the sum it reached. The same is done for each lifecycle
bucket. A partition assertion that only ever saw a correct cohort would be decoration; this one is proven to
fire, per class, on the exact failure mode that quietly flatters a denominator.

<a id="t-03-f3"></a>

### T-03-F3 — `resolvedDirectional === 0` is reachable and the primitive is never called

`✔ T-03-F3 … (10.686198ms)` in [the functional run above](#run-functional-inc3); same command, exit `0`.

The row is at the file the Test Plan names, and it drives the branch through `directionalDenominator(routed,
null)`: an all-withheld cohort yields `resolvedDirectional === 0` and the contract refuses
`no-directional-denominator-to-publish` on `resolvedDirectional` **before** `summary` is inspected at all —
asserted at `tests/recommendation-track-record.functional.mjs#L717`. Passing `null` for the summary is the proof
that no primitive was called: a `null` summary is exactly what the caller holds when it has correctly branched
before calling, and the refusal arrives without it ever being read.

<a id="t-03-r1"></a>

### T-03-R1 — the persistent SCN-015-004 regression

`✔ T-03-R1: a resolved-flat outcome survives a full classify-route-summarise-store pass as its own class
(215.957825ms)` in [the e2e run above](#run-e2e-inc3); command
`node --test tests/recommendation-track-record.e2e.mjs`, exit `1` **for `T-01-R2` only** — `T-03-R1` itself
passed, and the failing row is the concurrent session's uncommitted tree, evidenced above.

This is the permanent row for BS-004 / SCN-015-004: a later scope that merges `resolved-flat` back into
`unresolved` fails here rather than shipping. It also carries the published-denominator assertion at
`tests/recommendation-track-record.e2e.mjs#L750-753`, so the end-to-end pass proves the label travels with the
rate and not merely that the rate is right.

---

<a id="t-03-u1"></a>

### T-03-U1 — boundary classification at exactly `±flatBand`, where an `=== 0` classifier fails

`✔ T-03-U1 … (2.492698ms)` in [the run above](#run-unit); command `node --test tests/recommendation-track-record.unit.mjs`, exit `0`.

The row is non-vacuous on three counts:

- **The band is read from a real minted claim**, `mintEvaluable('evaluable-instrument-add')`, so the row is
  written against the frozen term the classifier must read rather than against a value the test chose. It then
  asserts `Number.isFinite(band) && band > 0` and `band !== 0` — without that second assertion the boundary
  values below could collapse onto zero and the row would stop biting.
- **The four discriminating inputs differ by one ulp.** `+band` and `−band` must classify `resolved-flat`;
  `band + Number.EPSILON * band` and its negation must classify `win` and `loss`. An `=== 0` classifier calls
  `+band` a win and `−band` a loss and fails both edges.
- **The exact zero is asserted last and never alone** — it is the one value an `=== 0` classifier gets right.

The row additionally asserts `Object.is(classified.outcomeValue, value)` and
`Math.sign(classified.outcomeValue) === Math.sign(value)` over six values including `0.1234567890123456`, a
value `toFixed`, `Math.round`, and a `±ε` nudge would each visibly change.

<a id="t-03-u2"></a>

### T-03-U2 — `RTR-FLAT-ZERO` fires for a literal `0` and for a mis-routed `resolved-flat` value

`✔ T-03-U2 … (2.364397ms)` in [the run above](#run-unit); same command, exit `0`.

Both halves the Test Plan row names are present. `assertZeroFreeOutcomes` refuses a bare `0` with
`code: "RTR-FLAT-ZERO"`, `reason: "bare-zero-in-directional-array"` and the offending index, and `routeOutcomes`
applies the same gate where the array is **built**, so a `resolved-flat` value pushed onto the number side
refuses rather than being summarised as a claim that never resolved. `-0 === 0` is true in JavaScript, so a
negative zero — which the primitive would also drop into `unresolved` — refuses on the same branch. A non-number
is not read as a zero: it falls through to the finite check and refuses for what it actually is.

<a id="t-03-u3"></a>

### T-03-U3 — the fed array is finite and strictly non-zero, and the primitive returns `ok: true` unmodified

`✔ T-03-U3 (increment 1) … (0.961199ms)` in [the run above](#run-unit); same command, exit `0`.

<a id="t-03-u4"></a>

### T-03-U4 — `summary.unresolved === 0` while the 015-owned counts stay non-zero and distinct

`✔ T-03-U4 (increment 2) … (1.621698ms)` in [the run above](#run-unit); same command, exit `0`. **Proves SCN-015-004.**

The cohort genuinely contains all three withheld classes at **deliberately different multiplicities** —
`resolved-flat` 3, `unresolved` 2, `not-evaluable` 1 — so a scorer that collapsed them into one bucket could not
agree with this row. The primitive is then called, unmodified, on the fed array: `summary.ok === true`,
`summary.unresolved === 0`, `summary.count === routed.resolvedDirectional`, `wins + losses` exhausts it, and
`winRate === wins / resolvedDirectional`.

The discard is **asserted, not commented**: `summary.unresolved` is asserted `!==` the 015 unresolved count and
`!==` the total withheld (7), so a scorer that surfaced the primitive's field fails here.

The adversarial half is the counterfactual. Feeding one `resolved-flat` value to the primitive instead of
counting it makes `misfed.unresolved === 1` — the exact HC-7 failure — and moves `winRate` with it, which is
precisely why the gate refuses that array before it can be built.

<a id="t-03-u5"></a>

### T-03-U5 — the exact unrounded `outcomeValue` survives into the record, the bytes, and the store

`✔ T-03-U5 … (755.521337ms)` in [the run above](#run-unit); same command, exit `0`.

<a id="t-03-u6"></a>

### T-03-U6 — both vocabularies refuse a one-character-off value, and the closure vocabulary is read from source

`✔ T-03-U6 (increment 1) … (0.442899ms)` and `✔ T-03-U6 (increment 2) … (1243.645585ms)` in
[the run above](#run-unit); same command, exit `0`. The row's two halves landed in two increments and both are green.

The increment-2 half is the one that closes the correction `R7`: `readClosureEventVocabulary` extracts the frozen
`CLOSE_EVENT_TYPES` literal from `rlcontracts.js`'s **own source text** and throws if it moves, is empty, or
changes member shape, so there is exactly one definition in the repository and no shadow copy of the six members
in 015-authored code. `RTR-CLOSURE-VOCAB` refuses a closure event outside that vocabulary.

<a id="t-03-u7"></a>

### T-03-U7 — a degenerate `flatBand` refuses before any `outcomeClass` is assigned

`✔ T-03-U7 … (20.737076ms)` in [the run above](#run-unit); same command, exit `0`.

This is the row added by correction `R8` for `F-015-03-01`, and it is the one that makes the whole boundary
argument non-vacuous. `flatBandFor` refuses `flat-band-not-finite-positive` on `magnitude.flatBand` for a band
that is `null`, absent, negative, `0`, or non-numeric, and `classifyOutcome` returns that refusal **before** any
class is assigned — never a classification against a degenerate band, and never a supplied default, which would
put the boundary outside `claimHash` and break HC-6.

---

<a id="core-outcome-vocabulary"></a>

### Core — the closed `outcomeClass` vocabulary refuses rather than coercing

`OUTCOME_CLASSES` is an `Object.freeze`d six-member array. `outcomeContributionFor` tests membership with
`inSet(OUTCOME_CLASSES, …)` — against the **frozen array**, not the routing table's keys — so an inherited
property name such as `constructor` refuses like any other stranger instead of resolving through the prototype.
An unrecognised value returns `violation("outcome-class-not-allowed", "outcomeClass")`; nothing is coerced and
nothing passes through. Asserted by [T-03-U6](#t-03-u6) (increment-1 half).

<a id="core-routing-table"></a>

### Core — the class → contribution routing table

`OUTCOME_CONTRIBUTIONS` is frozen and maps `win`/`loss` → `"number"` and the other four → `"count"`.
`DIRECTIONAL_OUTCOME_CLASSES` and `COUNTED_OUTCOME_CLASSES` are **derived** from that table by
`outcomeClassesContributing(…)` rather than hand-typed a second time, so a class re-routed in the table cannot
leave a consuming set holding the old answer. `routeOutcomes` seeds every counted class at `0` rather than adding
on first sight, so a class that never fired reads as an explicit `0` instead of a missing key — a missing key is
how a bucket quietly leaves a partition. Asserted by [T-03-U3](#t-03-u3) and [T-03-U4](#t-03-u4).

<a id="core-flat-band-frozen"></a>

### Core — `resolved-flat` is classified against the band frozen into the claim at proposal

`classifyOutcome(outcomeValue, claim)` reads `claim.magnitude.flatBand` and takes no band parameter of its own,
so there is no seam through which a scoring-time band could be supplied. The comparison is inclusive at both
edges and evaluated **first**, before `win`/`loss` are considered, so every value inside the authored band — an
exact `0` among them — is `resolved-flat` and a bare `0` cannot reach the directional array by classification at
all. [T-03-U1](#t-03-u1) reads the band from a real minted claim rather than from a literal, which is what makes
"frozen at proposal" a tested property rather than a described one.

<a id="core-flat-band-precondition"></a>

### Core — the band is asserted as a precondition, never supplied

```js
function flatBandFor(claim) {
    if (!isPlainObject(claim) || !isPlainObject(claim.magnitude)) {
        return violation("claim-magnitude-invalid", "magnitude");
    }
    var band = claim.magnitude.flatBand;
    if (!Number.isFinite(band) || band <= 0) {
        return violation("flat-band-not-finite-positive", "magnitude.flatBand");
    }
    return { ok: true, flatBand: band };
}
```

There is no `else` branch and no default: the function either returns the authored band or refuses. Asserted by
[T-03-U7](#t-03-u7). The mint-side half was implemented **by scope 01** in `3c0aa1036`, evidenced under
[Increments landed](#increments-landed); neither scope-03 increment touched `MINT_REFUSALS` or
`evaluateMintReason`, so the `F-015-03-01` routing held in fact and not only on paper.

<a id="core-write-gate"></a>

### Core — scope 02's write gate runs first, and is called rather than re-implemented

`writeResolutionObject` calls `authorizeResolutionWrite(row, resolution)` as its **first statement**, before the
ports are checked and before any property of the resolution is inspected, and returns the refusal unchanged.
The gate is imported, never duplicated — no second legacy check exists in the resolution path.

The wiring is asserted from the scope-03 write path inside the T-03-F1 unit precursor: a well-formed, correctly
addressed record written against a committed claimless row is refused with `LEGACY_BACKFILL_CODE` /
`claimless-row-unscoreable`, and `existsSync(RESOLUTION_STORE_DIR) === false` proves nothing was written. That
last assertion is what makes the ordering claim real rather than incidental — no property of a valid record can
buy a back-fill.

<a id="core-exact-value"></a>

### Core — the exact unrounded value is preserved end to end

`classifyOutcome` carries `outcomeValue` through verbatim; the routing differs between a flat outcome and a small
win, never the value. Asserted at classification time by [T-03-U1](#t-03-u1) with
`Object.is(classified.outcomeValue, value)` and a `Math.sign` equality, and asserted through the record, the
serialized bytes and the content-addressed store by [T-03-U5](#t-03-u5). Every value used is one that `toFixed`,
`Math.round`, or a `±ε` nudge would visibly change — a fixture of `0.5` would survive all three and prove nothing.

<a id="core-flat-zero"></a>

### Core — `RTR-FLAT-ZERO`

`FLAT_ZERO_CODE = "RTR-FLAT-ZERO"`, raised by `assertZeroFreeOutcomes` on any element `=== 0` with the offending
index named, and applied by `routeOutcomes` where the array is built. Asserted by [T-03-U2](#t-03-u2), and its
consequence — that the primitive would otherwise report the claim as never resolved — is demonstrated by the
counterfactual in [T-03-U4](#t-03-u4).

<a id="core-primitive-unmodified"></a>

### Core — the primitive runs unmodified on a finite, strictly non-zero array

`rlvalidation.js` has not been touched since before this scope began:

```text
$ git log --oneline 2fb48abcc^..HEAD -- rlvalidation.js
(no output)
```

`rlclaims.js` does not import `rlvalidation.js` at all — the only occurrences of `rlvSummarizeOutcomes` in it are
three comments. The primitive is reached exclusively from the test, through a lazy `createRequire` that opens
nothing on import, and its result is read verbatim: no shim, no wrapper re-deriving counts, no monkey-patch.
[T-03-U3](#t-03-u3) and [T-03-U4](#t-03-u4) assert `ok: true` on the fed array.

<a id="core-unresolved-discarded"></a>

### Core — `summary.unresolved` is consumed and discarded, and 015 owns its own counts

`routeOutcomes` produces `counts` for exactly the four counted classes, seeded at `0`. This scope declares
**no rendered surface** (`scope.md` → *UI rows owned: —*), so "renders its own counts" is satisfied here as
*produces and owns* them; the rendering is scope 05 and scope 07. The discard is asserted rather than commented
by [T-03-U4](#t-03-u4), which pins `summary.unresolved` to `0`, then asserts it is neither the 015 unresolved
count nor the total withheld — the two ways a scorer could surface the field and still look plausible.

<a id="core-resolution-contract"></a>

### Core — `brief-recommendation-resolution/v1`

Eleven fields, partitioned exhaustively and **derived**, never hand-listed twice:

```js
var RESOLUTION_HASHED_TERMS = Object.freeze([
    "contractVersion", "claimHash", "resolutionDate", "closureEventType",
    "outcomeClass", "outcomeValue", "reasonCode", "provenance"
]);
var RESOLUTION_UNHASHED_FIELDS = Object.freeze(["eventId", "lifecycleBinding"]);
var RESOLUTION_FIELDS = unionSorted([RESOLUTION_HASHED_TERMS, RESOLUTION_UNHASHED_FIELDS, ["resolutionHash"]]);
```

That is every field the Implementation Plan step 8 names. `closureEventType` is validated against
`CLOSE_EVENT_TYPES` read from `rlcontracts.js`'s own source text — asserted by [T-03-U6](#t-03-u6). The
`OUTCOME_CLOSURE_EVENTS` table is keyed by the **015-owned** vocabulary rather than the 002-owned one, so
restating the upstream members was never necessary: `withdrawn` falls out as the residue of the source vocabulary
that no class admits, derived rather than declared. The T-03-F1 precursor asserts the three lists partition the
record with no overlap and nothing outside it.

<a id="core-resolution-hash"></a>

### Core — `resolutionHash` is content-only and the store is content-addressed

`resolutionHash` digests exactly `RESOLUTION_HASHED_TERMS`. `eventId` and `lifecycleBinding` sit outside it for
the same reason `claimHash` excludes `proposalRunId`: `lifecycleEventId` hashes `runId`, so the same closure
re-emitted tomorrow would otherwise give one outcome two content addresses and two entries in an accounting meant
to count each call once. `RUN_SCOPED_KEYS` additionally bars `runId`, `resolvedAt`, `computedAt`, `generatedAt`
and `observedAt` from appearing inside the hashed `provenance` block. `resolutionObjectPath` enforces
`/^[a-f0-9]{64}$/` and writes to `briefs/objects/resolutions/<hex>.json` — the claim store's depth, the evidence
store's bare-lowercase-hex name. The T-03-F1 precursor mutates each hashed term and each excluded field in turn,
driven by the module's own two lists, so a field moved between them fails there rather than silently leaving the
address; it also asserts the repeat write is a byte-identical no-op and that a byte-changing write refuses with
`RTR-RESOLUTION-CONFLICT` without overwriting.

<a id="core-partition"></a>

### Core — the class partition is a committed assertion

`assertClassPartition` refuses `partition-does-not-sum-to-proposed`, `partition-bucket-absent`,
`partition-bucket-not-a-count`, `unknown-partition-bucket` and `partition-bucket-undeclared-for-class`.
`PARTITION_BUCKETS` is **derived** from `PARTITION_BUCKET_FOR_CLASS` in vocabulary order plus the two
non-class buckets, so a seventh class cannot appear without a bucket and a renamed bucket cannot appear without a
class. The T-03-F2 precursor declares its expected mapping by hand rather than reading the module's table —
iterating the module's own table would let a seventh class cover itself.

<a id="core-denominator-contract"></a>

### Core — the denominator contract is declared, not left as a convention

Increment 3 (`d7aa39d1d`) closes the conjunct this item was open on. Both halves are now in 015-authored code.

**`resolvedDirectional` IS the fed array's length, and IS the published denominator.** `directionalDenominator`
(`rlclaims.js#L901`) binds the two at one place so they cannot drift, and refuses each way they could:

| Refusal | What it catches |
|---|---|
| `resolved-directional-is-not-the-fed-array-length` | `routed.resolvedDirectional !== routed.directional.length` — a re-derived count |
| `summary-count-is-not-the-fed-array-length` | a summary produced from a **different** array than routing built — a filtered or padded feed |
| `wins-plus-losses-is-not-the-fed-array-length` | `wins + losses !== resolvedDirectional` — under the zero-free convention, a zero absorbed into the primitive's `unresolved` |
| `no-directional-denominator-to-publish` | a rate published with no denominator to publish beside it (`resolvedDirectional === 0`) |

The item's wording demands the identity, not agreement, and that is what is enforced: a quantity that merely
*happened* to equal the denominator would pass the first check and still fail the second and third. `rate` is
`summary.winRate` passed through verbatim — never recomputed here, because a second division is a second answer.

**The rate is labelled *directional hit rate*.** `DIRECTIONAL_RATE_LABEL = "directional hit rate"`
(`rlclaims.js#L155`) is exported (`#L1504`) and returned as `label` on every published result, so a rate cannot
leave this contract without it. This is the conjunct the increment-2 pass recorded as *"absent from 015-authored
code"*; it is now present, and asserted at `tests/recommendation-track-record.functional.mjs#L742` and
`tests/recommendation-track-record.e2e.mjs#L753`.

The plan/DoD ownership disagreement noted in the increment-2 pass is resolved rather than routed: the label is
**declared** here, beside the array whose length defines it, and **rendered** by scope 05 — one definition, so no
surface can render a bare "hit rate" over a directional-only denominator. Implementation Plan step 7 assigns only
the rendering to scope 05, which is consistent with declaring it here.

<a id="core-resolved-directional"></a>

### Core — `resolvedDirectional` is exposed so the branch can happen before the call

`routeOutcomes` returns `resolvedDirectional` as the fed array's length and it is on the module's export surface.
[T-03-U4](#t-03-u4) proves the branch is needed and reachable: an all-withheld cohort yields
`resolvedDirectional === 0`, and the primitive called on that empty array returns `ok: false` with the 007-owned
code `RLV-OUTCOME-VALUES`. This scope itself calls no primitive at all — `rlclaims.js` does not import
`rlvalidation.js` — so it cannot call one on an empty array.

<a id="core-hygiene"></a>

### Core — numeric and statistical hygiene

The global `isFinite` appears nowhere in 015-authored code:

```text
$ grep -nE '(^|[^.A-Za-z_])isFinite\s*\(' rlclaims.js tests/recommendation-track-record.unit.mjs | grep -v 'Number.isFinite'
(no output; grep exit 1)
```

No statistic, estimator, interval, or discount is written in this scope. `rlclaims.js` does not import
`rlvalidation.js`; the only `RLVALID` interaction anywhere in the scope is the test handing a legal array to
`rlvSummarizeOutcomes` and reading its result verbatim, evidenced under
[core — the primitive runs unmodified](#core-primitive-unmodified).

---

<a id="items-left-open"></a>

## Items left open, and the real reason for each

Eight of thirty. Each names the conjunct that is not met.

| Item | Blocking conjunct |
|---|---|
| Core — the denominator contract | The first half **is** declared: `resolvedDirectional` is the fed array's length and is exported, and [T-03-U4](#t-03-u4) asserts `winRate === wins / resolvedDirectional`. The second conjunct — *"the rate it produces is labelled **directional hit rate**"* — is **absent from 015-authored code**; measured this session, the phrase occurs only in `design.md` and this scope's `scope.md`. Implementation Plan step 7 assigns the rendering of that label to scope 05, so the DoD item and the plan disagree about who owns the conjunct. Reconciling them is a plan correction, not a measurement, and is routed to the owner. |
| T-03-F1 | The Test Plan row's file is `tests/recommendation-track-record.functional.mjs`, which contains **zero** `T-03-` rows. What exists is a `(unit precursor)` in `.unit.mjs` covering the function-level half; the cohort-level half is outstanding, as the test file's own header comment states. |
| T-03-F2 | Same: a `(unit precursor)` in `.unit.mjs`, no row at the named `.functional.mjs`. |
| T-03-F3 | No test exists anywhere. Its substance is partly reached inside [T-03-U4](#t-03-u4), which proves `resolvedDirectional === 0` is reachable and that the primitive refuses that empty array — but the row is not written at its named file and is not claimed. |
| T-03-R1 | `tests/recommendation-track-record.e2e.mjs` contains **zero** `T-03-` rows. The persistent SCN-015-004 regression does not exist yet. Creating it is implementation, not an evidence pass. |
| T-03-R2 | Two conjuncts, neither satisfiable this pass. The Playwright half was **not run** — running it was out of scope for this pass. The Node E2E half cannot be measured truthfully in this working tree: `tests/*.e2e.mjs` currently fails `T-01-R2`, and the failure is caused by seven **uncommitted** `tests/portfolio-survival-*.spec.mjs` files belonging to a concurrent session. A stashed re-measurement would be measuring a tree that is not the tree, so none is offered. |
| T-03-S1 | The row requires `baseline + N passed` against a baseline *"captured immediately before this scope's first change"* on a **clean worktree**. It was never captured — this report's own pre-increment pass recorded it as *"Not captured"* — and it cannot be taken retroactively, because the first change has landed. Today's `3182 passed, 0 failed` is recorded under [the self-test run](#run-selftest) as a green reading, but a green total is not a delta and is not offered against this row. |
| Build Quality Gate | Four conjuncts hold and are evidenced: zero warnings across both runs, `rlvalidation.js` byte-unmodified, `spec.md` and `design.md` unmodified by this scope, no other spec's artifacts touched. Two do not. *"Every negative test verified to fail when the behaviour it guards is reverted"* was **not performed** — revert verification requires editing `rlclaims.js`, which this evidence pass did not do. And the gate inherits the `T-03-R2` and `T-03-S1` gaps above. Grouped gates tick as a block, so it stays open. |

---



## BLOCKER (RESOLVED 2026-08-20) — `magnitude.flatBand` is minted but never validated, so HC-7 is vacuous for any claim without a band

*Preserved as the analysis that produced the ruling. See* ***RULING*** *below for the disposition.*

`scope.md` Implementation Plan step 3 and its matching DoD item both read as though the band were guaranteed:
*"`resolved-flat` is classified against `magnitude.flatBand` frozen into the claim at proposal"*. Scope 01 is `Done`,
so the plan treated the frozen band as an established input.

The band is **minted, not validated**. `rlclaims.js#L678`:

```js
flatBand: claimInput && Number.isFinite(claimInput.flatBand) ? claimInput.flatBand : null
```

That is the whole of it. `evaluateMintReason` (`rlclaims.js#L709-749`) inspects `actionFamily`, `subject.prose`,
`subject.resolvesTo`, `subject.seriesRefs`, `thesisFamily`, `horizon.kind`, `horizon.sessions`, `horizon.eventRef`,
`horizon.resolutionDate`, `predicate` and `direction`. It never inspects `magnitude.flatBand`. A claim can therefore
be **evaluable** — `notEvaluable === null`, the field whose entire purpose is to record honest non-scoreability at
proposal — while carrying no band at all.

### Measured, this session

Minted through the live path (`loadMintContext('.')` → `claims.mintClaim`) from the committed evaluable fixture
`tests/fixtures/recommendation-track-record/claims/evaluable-instrument-add.json`, varying only `claim.flatBand`:

| Probe | Input `flatBand` | `mintClaim` result | `notEvaluable` | Minted `magnitude.flatBand` |
|---|---|---|---|---|
| Control | `0.25` | `ok: true` | `null` | `0.25` |
| **A** | key deleted | `ok: true` — **no refusal** | **`null` — evaluable** | **`null`** |
| **B** | `-0.25` | `ok: true` — **no refusal** | `null` | **`-0.25`, verbatim** |
| **C** | `"0.25"` (string) | `ok: true` — **no refusal** | `null` | **`null`, silently** |

Probe A is the defect as diagnosed. Probes B and C are two further modes that were **not** in the diagnosis and are
strictly worse in one respect each: a negative band is preserved rather than nulled, and a typed-as-string band is
silently discarded so a *typo* becomes *no band* with nothing raised.

### Why this halts the increment rather than merely complicating it

`scope.md` step 3 classifies `|outcomeValue| ≤ flatBand ⇒ resolved-flat`. Measured JS semantics for a degenerate
band:

```text
Math.abs(0)      <= null    -> true
Math.abs(1e-320) <= null    -> false
Math.abs(0.0001) <= null    -> false
Math.abs(0)      <= 0       -> true
Math.abs(1e-320) <= 0       -> false
Math.abs(0)      <= -0.25   -> false      # negative band: resolved-flat NEVER fires, for any value
```

`null` coerces to `0` in a relational comparison, so `|v| ≤ null` **is** `v === 0` — the exact implementation
`T-03-U1` exists to defeat, reached without anyone writing `=== 0`. The design's own argument at
[design.md#L671](../../design.md) is that *"on real price data an exactly-zero return has measure zero, so without a
proposal-time band the resolved-flat class would never fire and HC-7 would be vacuous."* A null band is *precisely*
"without a proposal-time band". A negative band is worse still: `resolved-flat` cannot fire even on an exact zero,
so the class is dead and HC-7 is not merely vacuous but unreachable.

`T-03-U1` would not catch any of it. It is written against fixtures with a finite band, where
`Math.abs(v) <= 0.25` is correct and `=== 0` fails — so it passes green against an implementation that degrades
silently on every claim the fixtures do not represent. The headline row proves the boundary arithmetic is right
*when a band exists*; **nothing in the scope proved a band always exists.**

### Fixture census — the reason no existing row catches this

Every `.json` under `tests/fixtures/recommendation-track-record/claims/` (46 files: 23 input + 23 `.expected.json`),
reading `action.claim.flatBand` on the inputs:

```text
input fixtures            = 23
expected fixtures         = 23
flatBand ABSENT/no-claim  = 0
flatBand explicit null    = 0
flatBand finite           = 23  (negative=0, zero=0)
NULL_OR_ABSENT at INPUT   = 0
```

**Zero committed claim fixtures carry a null or absent `flatBand`; all 23 carry `0.25`.** The degenerate path has no
fixture, no row, and no assertion anywhere in the repository. That is why a defect this direct survived scope 01's
certification: the substrate never expressed it.

For contrast, the live `market-brief.payload.json` carries 5 authored actions and **none** carries a `claim` object
at all, so all 5 would mint with `flatBand: null`. They are independently `not-evaluable` today for other reasons
(no authored subject; `hold` is neutral-direction), so no live claim is currently mis-scored. The exposure is
latent, not yet realised — which is the cheapest possible moment to close it.

### Where the premise went stale

It did not go stale; it was **never established**. `flatBand` appears **0 times in `spec.md`** and **3 times in
scope 01's `scope.md`** — twice in a field *list* and once as a `claimHash` mutation target in `T-01-U2`. Scope 01
proved the band is **hashed**; it never undertook to prove the band is **present or well-formed**. The obligation
fell in the gap between a foundation scope that enumerated the field and a consumer scope that assumed the
enumeration implied validation.

`design.md` had already assigned it, and the assignment was not carried into either scope. [design.md#L295](../../design.md),
the Variation Axes ownership table:

> | Flat band | `magnitude.flatBand`, frozen at proposal — D1, D3 | Split — the value is authored per claim; that
> it must be frozen *before* the outcome is visible is **foundation-owned**, **or HC-7 becomes vacuous** |

The design named both the owner (foundation) and the exact failure mode (HC-7 vacuous). Neither scope implemented it.

### Options, for the decision this requires

1. **Scope 03 obligation — the consumer supplies a default band.** Cheapest. **Rejected outright:** it is a direct
   HC-6 violation. `magnitude` is a hashed term (`rlclaims.js#L73-76`; empirically, deleting `flatBand` changes
   `claimHash` from `sha256:ed109685…` to `sha256:f59ee951…`). A band chosen at scoring time sits **outside** the
   content address, so the same `claimHash` could yield a different `outcomeClass` on a later run and the record
   would no longer be reproducible from its own identity. This is the precise failure the claim object exists to
   prevent.
2. **Scope 03 obligation — the consumer refuses on a degenerate band.** Sound as far as it goes, and cheap. But it
   leaves the claim **minted and stored as evaluable** with `notEvaluable: null`. Scope 01's contract says that
   field means *scoreable*. A claim that cannot be classified is not scoreable, so the stored record stays wrong;
   the defect is merely detected later and further from its cause.
3. **Scope 01 defect — the mint validates the band.** Reopens a `Done` scope, which has a real cost.

---

## RULING — recorded 2026-08-20: the fix is a **scope 01 defect** (`F-015-03-01`); scope 03 additionally asserts it as a **precondition**

**Option 3, with option 2 retained as defence in depth.** Not option 1 under any circumstances.

### Rationale

1. **The design already assigned it to the foundation.** [design.md#L295](../../design.md) says the freeze
   obligation is foundation-owned *"or HC-7 becomes vacuous"*, and [design.md#L671](../../design.md) says the band
   is *"frozen **here**, not chosen at scoring time"* — "here" being D1, the claim contract, which is scope 01.
   Placing the fix in scope 03 would contradict a design decision that was already made and already recorded.
2. **`flatBand` is the lone unvalidated member of `magnitude`.** Its siblings refuse at mint —
   `magnitude-unit-not-allowed` (`#L633`), `magnitude-sign-convention-not-allowed` (`#L635`) — and the closest
   analogue outside the object, `predicate.value`, refuses with `predicate-value-not-finite` (`#L624`). A validated
   `unit`, a validated `signConvention` and an unvalidated `flatBand` in the same frozen object is an **omission**,
   not a design position.
3. **Only the mint can satisfy HC-6.** HC-6 requires the band be frozen *before the outcome is visible*. Mint time
   is the only moment that qualifies. A consumer-side fix can refuse but can never restore the invariant, because by
   then the outcome is visible.
4. **Only the mint keeps `notEvaluable` honest.** A claim with no band is not scoreable. Recording that at proposal
   is exactly what `notEvaluable` is for, and it keeps this scope's partition identity intact — the claim is still
   minted, still stored, still counted, in the `notEvaluable` bucket rather than falling out of the accounting.
5. **The existing test infrastructure makes the scope-01 fix safe and forces its coverage.**
   `tests/recommendation-track-record.e2e.mjs#L363` asserts `[...observed.keys()].sort()` deep-equals
   `[...claims.MINT_REFUSALS].sort()`, with the comment: *"A later scope that drops a refusal, **adds one without
   coverage**, or lets a reason fire for a trigger that is not its own fails here rather than silently."* An eighth
   `MINT_REFUSALS` member therefore **cannot** land without a fixture that triggers it. The guard for this class of
   change already exists and already works.
6. **Doing it from scope 03 would break that guard.** Adding the eighth member from here fails `#L363` until scope
   01's fixture set is extended — which is scope 01's surface. The boundary is not bureaucratic; it is where the
   test coverage lives.

### Consequence for HC-6

**Preserved, and preserved by the only mechanism that can preserve it.** The band stays inside `claimHash`, so the
boundary between `resolved-flat` and `small win` is fixed by the claim's own content address at proposal and cannot
be tuned once the outcome is visible. Scope 03 supplying a default would have voided this: two runs with different
scoring-time defaults would produce different `outcomeClass` values for one `claimHash`, and the content address
would stop determining the outcome. Under this ruling scope 03 **never writes a band**; it reads one or refuses.

### Consequence for HC-7

**Made reachable rather than assumed.** HC-7 requires resolved-flat to be distinguishable from unresolved. With a
null band it collapses to exact-zero, which has measure zero on real price data, so the class never fires and the
distinction is real in the record and absent in practice — a green `T-03-U1` over a dead invariant. With a negative
band it cannot fire at all. Once the mint refuses a degenerate band, every claim reaching the classifier carries a
finite positive band, `resolved-flat` fires on a set of positive measure, and HC-7 has something to be true about.

### Shape of the scope 01 fix (routed, NOT implemented here)

Following the precedent already set in the same module, the two failure kinds are distinct:

| Input | Kind | Precedent |
|---|---|---|
| `flatBand` absent | **mint refusal** → `notEvaluable = { reason, field }`; claim still minted, still counted | `no-authored-predicate` (`#L742`) |
| `flatBand` non-finite, negative, or non-numeric | **contract violation** → `{ ok: false }`; never coerced | `predicate-value-not-finite` (`#L624`), `magnitude-unit-not-allowed` (`#L633`) |

Whether a band of exactly `0` is legal is **an open question for the design owner, not for this scope.**
[design.md#L380](../../design.md) shows `"flatBand": 0.0` in the canonical P5 example while
[design.md#L549](../../design.md) shows `0.25` in the claim-input example. By the design's own measure-zero argument
at `#L671`, a band of `0.0` makes HC-7 vacuous, so the two examples are in tension. `design.md` is outside this
scope's mandate and is unmodified; the tension is recorded here and routed, not resolved.

### Second staleness found while correcting the first — `CLOSE_EVENT_TYPES` is unreachable

`scope.md` cited `CLOSE_EVENT_TYPES` at `rlcontracts.js#L720` in three places (step 8, `T-03-U6`, and the matching
DoD item), and the DoD item required validating against it *"with no local extension created"*. Both halves are
false:

- **The line is wrong.** `CLOSE_EVENT_TYPES` is at **`#L726`**. `#L720` is `ACTION_DIRECTION`, an unrelated constant.
- **The constant is private.** Measured export surface of `rlcontracts.js`: **20 keys**, none matching
  `/clos|EVENT_TYPE/i`. `CLOSE_EVENT_TYPES` is a module-internal `var`. As written the DoD item was
  **unsatisfiable** — the only ways to obtain the vocabulary were the local copy the item forbids, or a routed ask
  to Feature 002 to widen its exports.

There is an established, `Done`, working answer already in the repository. `rlclaims.js#L290-295`:

> *"MARKET_ACTIONS and ACTION_DIRECTION are private to rlcontracts.js — they are NOT on its exported api
> (measured). Rather than shadow them with a second copy that would silently go stale, the two frozen literals are
> read out of rlcontracts.js's own source text. There is therefore exactly one definition in the repository, and if
> either literal moves or changes shape this throws instead of scoring against a stale vocabulary."*

Scope 01 hit this exact problem and solved it with `extractFrozenLiteral` + `readFoundationActionVocabulary`. Scope
03 adopts the same pattern. No Feature 002 ask is needed and no local copy is created.

### Third staleness — scope 02 built a write gate this scope must pass, and the plan never mentions it

`authorizeResolutionWrite(row, resolution)` (`rlclaims.js#L551`) is exported and its own comment names this scope:
*"Scope 03 owns the resolution OBJECT; this owns the single question of whether the target row may be resolved at
all."* Its rule order is load-bearing — the `RTR-LEGACY-BACKFILL` legacy check runs **before** the resolution is
inspected, so no property of a well-formed resolution can rescue a claimless row. `scope.md` mentioned it **0
times** while specifying the write in step 9.

### Premises re-verified this session and found SOUND

Recorded so the correction is not mistaken for a general finding of decay.

| Premise | Verdict |
|---|---|
| `rlvalidation.js#L135` — empty-array **and** non-finite guard → `RLV-OUTCOME-VALUES` | Holds exactly |
| `#L136` wins `value > 0` · `#L137` losses `value < 0` · `#L138` `unresolved` by subtraction | Hold exactly |
| `#L146` `summary.unresolved` · `#L147` `winRate` divides by `outcomes.length` | Hold exactly |
| `rlvalidation.js` deep-freezes results, no monkey-patch seam | Holds — `freezeResult` recurses (`#L9-12`) |
| `briefs/objects/evidence/bundles/<hex>.json` bare-lowercase-hex layout exists | Holds — 136 committed objects |
| All three 015 test files exist and are *extended*, never created | Holds — 968 / 399 / 635 lines |
| `playwright.config.mjs` with a `system-chrome` project; Playwright installed for `--no-install` | Holds |
| `recommendation-track-record-lab.html` does not exist until scope 07 | Holds — absent |
| Scope 01 is `Done`; scope 03 depends on 01 | Holds |

### Plan corrections applied to `scope.md`

No Definition of Done item was ticked. **Test Plan rows 12 → 13. DoD 27 unticked → 30 unticked, 0 ticked.** The
scope became larger, not smaller; no row was deleted or weakened.

| # | Location | Was | Now |
|---|---|---|---|
| R1 | Impl step 3 | the band is *"frozen into the claim at proposal"*, stated as an established input | records that the band is minted **unvalidated**; this scope **asserts it as a precondition and refuses**, never supplies one; mint fix routed as `F-015-03-01` |
| R2 | Impl step 8 | `CLOSE_EVENT_TYPES` at `rlcontracts.js#L720` | `#L726`, plus the source-text extraction pattern, because the constant is private and unexported |
| R3 | Impl step 9 | write *"mirroring … `evidence/bundles/<hex>.json`"* | evidence store is the **naming** precedent (two levels deep); `CLAIM_STORE_DIR` (`#L163`) is the **depth** precedent |
| R4 | Impl step 9 | no mention of the write gate | every write passes `authorizeResolutionWrite` (`#L551`); called, never re-implemented or bypassed |
| R5 | Impl step 12 | boundary fixtures only | adds degenerate-band fixtures — `null`/absent, negative, `0`, non-numeric — because 0 of 23 committed fixtures exercise that path |
| R6 | Impl step 13 | extend `.unit.mjs` and `.functional.mjs` | adds `.e2e.mjs`, which `T-03-R1` already targeted |
| R7 | `T-03-U6` | `#L720`; *"without a local extension being created"* | `#L726`; asserts the vocabulary was read from source, and fails if the six members are shadowed |
| R8 | Test Plan | — | **`T-03-U7` added**: a degenerate band refuses on a claim the mint calls evaluable, and no `outcomeClass` is assigned |
| R9 | `T-03-S1` | *"baseline … captured immediately before this scope's first change"* | adds the clean-worktree-with-dependencies precondition; scope 02 measured `3074 passed, 0 failed` clean versus `1 failed` on a tree carrying another session's uncommitted edits |
| R10 | Test Plan footer | *"Test Plan rows: 12."* | *"Test Plan rows: 13."* |
| R11 | DoD core | — | **two items added**: the band precondition/refusal with no scope-03-supplied default; and the `authorizeResolutionWrite` gate |
| R12 | DoD core | `CLOSE_EVENT_TYPES` … `#L720` *"with no local extension created"* | `#L726`, read from source text, no local copy of the six members |
| R13 | DoD test | — | **`T-03-U7` item added** |
| R14 | DoD footer | *"Test-related DoD items: 12. Test Plan rows: 12."* | *"13. … 13. Parity confirmed."* |
| R15 | Must-not-touch table | `rlclaims.js` absent | added — scope 01-owned and `Done`; `F-015-03-01` is fixed there, and an eighth `MINT_REFUSALS` member added from here would fail the existing assertion at `tests/recommendation-track-record.e2e.mjs#L363` |

<a id="what-is-unblocked"></a>

### What is unblocked, and what is not

| | State |
|---|---|
| `flatBand` ownership decision | **Resolved.** Scope 01 defect `F-015-03-01`; scope 03 asserts the precondition. |
| `CLOSE_EVENT_TYPES` access | **Resolved.** Source-text extraction, the pattern scope 01 already proved. No Feature 002 ask. |
| Scope 03 implementation | **Schedulable.** Every corrected row is satisfiable as written; `T-03-U7` is testable entirely inside scope 03 and does not depend on the scope-01 fix landing first. |
| `F-015-03-01` (mint-side validation) | **Open, routed to scope 01.** Until it lands, a degenerate-band claim is still minted as evaluable; scope 03 will refuse it rather than mis-classify it, so no wrong number is ever published — but the stored claim stays wrong at its source. |
| Band-of-exactly-`0` legality | **Open, routed to the design owner.** `design.md#L380` shows `0.0`, `#L549` shows `0.25`, and `#L671`'s measure-zero argument implies `0.0` is vacuous. `design.md` unmodified by this pass. |
| `T-03-S1` baseline | **Not captured.** Requires a clean worktree; the tree currently carries 59 uncommitted files from a concurrent session. |

## Planning-pass measurements — not test evidence

The measurements recorded in the two 2026-08-20 sections above are repository observations taken to verify
planning premises. They are **not** test evidence and are not offered against any Test Plan row. The executed
evidence for this scope is under [Test Evidence](#run-unit), earlier in this report.

## Completion Statement

Scope 03 is `In Progress`. Three increments have landed, and **27 of 30 Definition of Done items are ticked**
with executed evidence recorded above. **No scope completion is claimed and no certification is requested**:
three items remain open, and each is named with its blocking conjunct in
[Items left open, and the real reason for each](#items-left-open).

None of the three is open for want of a test. `T-03-R2` has a **red** Node conjunct — one failure, `T-01-R2`,
caused by a concurrent session's seven uncommitted `tests/portfolio-survival-*.spec.mjs` files — and a Playwright
conjunct that was **not run** and is therefore unmeasured rather than green. `T-03-S1` names a scope-start
baseline that was never captured, so there is no number to subtract from; today's `3184 passed, 0 failed` is
recorded as a green reading only. The Build Quality Gate ticks as a block, inherits both, and additionally names
a revert-verification this evidence pass did not perform.

This pass wrote evidence only. No source file, no test file, no fixture, no `state.json`, no `uservalidation.md`,
`spec.md`, or `design.md` was modified, and no committed ledger byte was touched. The artifacts changed are this
report and `scope.md` (five Definition of Done ticks). One finding remains routed to the owner rather than
resolved here: the falsified `rlclaims.js` row in the must-not-touch table
([divergence](#divergence-rlclaims-must-not-touch)). The *directional hit rate* ownership disagreement recorded
by the increment-2 pass is **resolved**, not routed — the label is declared in `rlclaims.js` and rendered by
scope 05, which is what Implementation Plan step 7 assigns.
