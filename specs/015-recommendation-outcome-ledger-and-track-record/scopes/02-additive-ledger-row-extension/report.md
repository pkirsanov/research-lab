# Scope 02 Report: Additive ledger row extension

Evidence contract: [scope.md](scope.md), [spec.md](../../spec.md), [scope index](../_index.md), and [uservalidation.md](../../uservalidation.md).

**Evidence status:** Baseline captured; the blocking premise failure recorded below is **resolved** by the
2026-08-19 ruling further below, and the plan has been corrected to match measured reality. **Two**
increments of the fixture-proven surface are delivered: the `claimRef` field on the live `…/v2` with the
dual-version reader and its negatives (increment 1, revert-verified), and the publisher mint hook plus
`RTR-LEGACY-BACKFILL` (increment 2). **Fifteen** of the 28 Definition of Done items are claimed — the
two from increment 1 plus thirteen recorded below. Every other item remains unclaimed.

The E2E regression this scope introduced at increment 2 is **fixed and committed** (`3123e9fd0`). Its
figures here were re-measured on 2026-08-20 and the superseded ones corrected in place rather than left
standing — see [Evidence refresh — 2026-08-20](#evidence-refresh-2026-08-20). The refresh **ticked no
additional item**: the count is unchanged at **15 of 28**, and each of the 13 open items now carries the
reason that is true at HEAD rather than the reason that was true before the fix.

## Summary

The scope-start baseline required by T-02-S1 is captured. Implementation was initially halted because the
identifier this scope was built on is already taken by a live, different contract. The blocker analysis is
preserved verbatim below as history; the ruling that resolves it, its measured evidence, and the consent
record follow it. On that corrected basis two increments of the fixture-proven surface are delivered:

- **Increment 1** — `claimRef` as one optional field on the live `…/v2`, the dual-version reader, the ledger
  fixtures, and the two unit rows `T-02-U1` and `T-02-U2`, each revert-verified against the shipped module.
- **Increment 2** (`a715e92a4`) — `scripts/recommendation-claim-mint.mjs`, the publisher mint hook threaded
  through `scripts/brief-distributed-publish.mjs` and `scripts/brief-publication.mjs`, `RTR-LEGACY-BACKFILL`
  in `rlclaims.js`, and the two unit rows `T-02-U3` and `T-02-U4`.

Increment 2 also introduced a regression in the committed Node E2E suite. It is recorded in full at
[Regression introduced by increment 2](#regression-e2e-module-closure) rather than absorbed. It has since
been **fixed at `3123e9fd0`** and the suite re-measured green; the corrected figures and what the fix does
and does not unblock are at [Evidence refresh — 2026-08-20](#evidence-refresh-2026-08-20).

## Scope-start selftest baseline (required by T-02-S1)

Captured immediately before the first intended change, against a clean tree.

```text
$ node scripts/selftest.mjs
================================================
Research-Lab self-test: 3066 passed, 1 failed
================================================
exit=1
```

The single failure is pre-existing, unrelated to Feature 015, and present before any 015 scope-02 work:

```text
2124:  ✗ FAIL: the committed dependency-gate projection matches its source specs — a stale projection misreports delivery
```

**Baseline for T-02-S1 arithmetic: `3066 passed, 1 failed`.** T-02-S1 as written requires `baseline + N passed,
0 failed`. That target is unreachable while this pre-existing failure stands, so T-02-S1 additionally depends on
that failure being resolved by its own owner. This is recorded rather than absorbed.

Scope 01's rows are green and unaffected:

```text
$ node --test tests/recommendation-track-record.unit.mjs
# tests 7
# pass 7
# fail 0
```

<a id="t-02-s1"></a>

### T-02-S1 — clean re-measurement, 2026-08-19

The `1 failed` above is **not** a repository defect. It is produced by another session's *uncommitted*
working-tree edits to `specs/007-*` and `specs/008-*` `state.json` / `uservalidation.md`, which the
dependency-gate projection reads. Those four files — and only those four — were stashed
(`git stash push -- specs/007-…/state.json specs/007-…/uservalidation.md specs/008-…/state.json
specs/008-…/uservalidation.md`), the self-test re-run, and the stash popped, restoring all four. No
`specs/007-*` or `specs/008-*` byte was modified.

```text
$ git status --porcelain -- 'specs/007-*' 'specs/008-*'      # after stash — empty
$ node scripts/selftest.mjs
Research-Lab self-test: 3074 passed, 0 failed
exit=0
$ git stash pop                                              # all four files restored
```

**T-02-S1 baseline is therefore `3074 passed, 0 failed`, not `3066 passed, 1 failed`.** The `+8` over the
recorded scope-start figure is other sessions' committed work, not 015's — this scope's own delta is not
isolated here, so `baseline + N` is **not** yet claimed. T-02-S1 remains **unticked**: it requires the
post-implementation total against this baseline, which the remaining increments have not produced.
The dependency-gate concern recorded above is withdrawn as a T-02-S1 blocker: with a clean tree the
self-test is green.

## BLOCKER (RESOLVED 2026-08-19) — `brief-recommendation-history-row/v2` is already taken by a different live contract

*Preserved verbatim as the analysis that produced the ruling. See* ***RULING*** *below for the disposition.*

`scope.md` Implementation Plan step 1 and [design.md](../../design.md) `## D2` both specified
`brief-recommendation-history-row/v2` as a **strict superset of v1**: the same seven fields plus exactly one
optional `claimRef`, with a **closed** field list that rejects an eighth field.

That identifier is already in production use in this repository with an incompatible meaning. It is minted as
`ROW_CONTRACT_V2` in [`scripts/recommendation-body.mjs`](../../../../scripts/recommendation-body.mjs) and written by
[`scripts/evaluate-recommendations.mjs`](../../../../scripts/evaluate-recommendations.mjs), carrying a full
recommendation **body** (direction, confidence, evaluability, deepLink, outcome fields), not a pointer.

Observed contract-version and key-count census of the committed ledger:

```text
$ ls briefs/history/recommendations/
2026-07.jsonl  2026-08.jsonl

--- briefs/history/recommendations/2026-07.jsonl
   brief-recommendation-history-row/v1 215
   brief-recommendation-history-row/v2 534
   keycount ('brief-recommendation-history-row/v1', 7) 215
   keycount ('brief-recommendation-history-row/v2', 17) 150
   keycount ('brief-recommendation-history-row/v2', 27) 384
--- briefs/history/recommendations/2026-08.jsonl
   brief-recommendation-history-row/v1 25
   brief-recommendation-history-row/v2 606
   keycount ('brief-recommendation-history-row/v1', 7) 25
   keycount ('brief-recommendation-history-row/v2', 17) 206
   keycount ('brief-recommendation-history-row/v2', 25) 375
   keycount ('brief-recommendation-history-row/v2', 27) 25
```

**1,140 committed `v2` rows carry 17, 25, or 27 keys.** None carries eight.

### Why this halts the increment rather than merely complicating it

A closed eight-field `v2` list, written as specified, rejects all 1,140 committed `v2` rows on the
`unknown-field` rule. That directly contradicts two requirements of this same scope:

- **Primary Outcome / DoD:** "the dual-version reader accepts both `v1` and `v2`" — it would accept neither the
  live `v2` rows nor anything the current publisher emits.
- **T-02-I1:** "Every row in the committed `briefs/history/recommendations/2026-07.jsonl` partition validates
  unchanged under the dual-version reader" — 534 of the 749 rows in that partition would be refused.

The two cannot both hold. Implementing step 1 literally would produce a contract module that is false about the
repository on the day it lands, and a T-02-U2 negative that passes only because it is asserted against a shape
the repository does not use. That is a fabricated pass, so it was not written.

### Where the premise went stale

[spec.md](../../spec.md) states "Every one of those rows has this exact shape
(`brief-recommendation-history-row/v1`)", and `design.md` `## D2` describes "the 160 pre-existing rows" and
concludes "There is no slot for a claim, an outcome, or a resolution." Both were accurate when written. The
`v2` body contract has landed since, and `scripts/recommendation-body.mjs` now records the same additive
reasoning this scope re-derives: *"Contracts are ADDITIVE: v1 rows stay readable; v2 rows carry the same keys
plus the body."* The planning premise is stale, not wrong-headed.

### Options, for the owner decision this requires

None of these is taken unilaterally, because each changes a contract identifier or another feature's surface.

1. **015 takes `…/v3`** — declare the claim-referencing row as the next free version, leaving the live `v2` body
   contract untouched. Smallest change to reality; requires editing `spec.md`, `design.md` `## D2`, and this
   `scope.md`, all of which are outside this increment's mandate.
2. **`claimRef` is added to the existing live `v2`** — one optional field on the contract that is already the
   publisher's output. This is closest to the design's stated intent ("the correct ask is the smallest one that
   works"), and it collapses the version question entirely, but it widens the Feature 002 consent ask from a new
   version to a live contract.
3. **The recorded `design.md` `## D2` fallback** — a fully 015-owned side-index keyed by `eventId`, leaving the
   row contract untouched at the cost of a second lookup. Already documented as the no-consent path, and it
   needs no version identifier at all.

Option 2 is the one that best matches the design's own stated principle. The choice belonged to the Feature 002
owner under the `## D2` ⚠️ Ownership gate. **It has since been made — see the ruling below.**

---

## RULING — recorded 2026-08-19: `claimRef` is an OPTIONAL field on the EXISTING `…/v2`

**Option 2 is taken.** No `v3`. No side-index. The authoritative record, including the superseded-statement
list and the routed plan corrections, is `design.md` →
`## Ledger-Row Contract-Version Reconciliation — Recorded 2026-08-19`. This section records the same ruling
at the scope where it is implemented.

### Census re-measured this session (2026-08-19)

Reproduced independently of the census above by parsing every line of both committed partitions:

```text
briefs/history/recommendations/2026-07.jsonl   (total rows: 749)
    brief-recommendation-history-row/v1 keys=7  -> 215
    brief-recommendation-history-row/v2 keys=17 -> 150
    brief-recommendation-history-row/v2 keys=27 -> 384
briefs/history/recommendations/2026-08.jsonl   (total rows: 631)
    brief-recommendation-history-row/v1 keys=7  -> 25
    brief-recommendation-history-row/v2 keys=17 -> 206
    brief-recommendation-history-row/v2 keys=25 -> 375
    brief-recommendation-history-row/v2 keys=27 -> 25
```

Derived from the same parse:

| Measure | Value |
|---|---|
| Total committed rows | **1,380** |
| `…/v1` rows | **240** |
| `…/v2` rows | **1,140** |
| `…/v2` key union | **32** |
| `…/v2` keys present in **every** `v2` row | **12** — `canonicalMonth`, `confidence`, `contractVersion`, `deepLink`, `direction`, `eventId`, `eventType`, `horizon`, `instrument`, `occurredAt`, `recommendationKey`, `runId` |
| `…/v2` optional keys | **20** |
| Rows carrying `claimRef` | **0** |

The variable key count is the decisive fact: `v2` is **already an optional-field contract**, not a closed
list. A closed eight-field `v2` was never a description of it.

### Rationale

1. **It is D2's own stated principle** — *"the correct ask is the smallest one that works."* One optional
   field on an already-optional contract is smaller than minting a version.
2. **`v2` already grows by optional field groups** (17 → 25 → 27 keys), so one more optional field is how
   this contract is designed to evolve.
3. **A `v3` would fragment the ledger into three versions** and make the dual-version reader tri-version,
   for no compatibility benefit.
4. **The scope's core intent is preserved exactly** — the row gains a **pointer**, not a payload; no
   migration; no rewrite; no re-hash. The resolution object (scope 03) still owns outcome value, outcome
   class, and closure reason.
5. **HC-4 / BP-015-002 get *stronger*.** Absence of `claimRef` remains the permanent `unresolvable-legacy`
   marker, and it now covers pre-existing `v2` rows as well as `v1` — **1,380 rows unscoreable by
   construction, not 240**. Under the superseded plan a `v2` row was claim-bearing by definition, so the
   marker only ever had to discriminate on the version stamp. Under this ruling it keys on **key absence**,
   which is exactly what `T-02-F2` was already written to assert.
6. **The version stamp keeps its meaning.** A `v1` row carrying `claimRef` is still rejected as an unknown
   field. That negative is unchanged.

### Consent record

**Provenance.** The operator granted a **standing blanket authorisation** on **2026-08-19**, verbatim:

> *"authorized, approved"* · *"user accepts all"* · *"unblock all blocks, implement/fix/plan whatever needed
> to unblock"* · *"ALWAY PICK OPTION BEST FOR LONG TERM, NO SHORTCUTS"*

**Classification — this is a standing blanket grant, NOT a Feature 002 design review of the `v2` contract.**
Recording it as a 002 design review would be exactly the fabrication this packet exists to prevent.

| It authorises | It does **not** authorise |
|---|---|
| 015 proceeding across the Feature 002 owner boundary without a further round-trip | A Feature 002 review of the `v2` field set. **None has occurred.** |
| Selecting the long-term-best option (here, option 2) over the option that merely avoids the boundary (option 3) | A finding that `claimRef` is the *correct shape* for `v2`. That remains a 002 judgement. |
| Removing the procedural block that held this scope at `Not Started` | Any change to an existing `v2` field, to `v1`, or to any committed byte. |
| Landing the plan-side correction recorded here | Reporting a fixture-backed result as live-publisher evidence. The P-015-01 / P-015-02 live-binding gate is **untouched**. |

**Why proceeding under a blanket grant is defensible here.** The ask is *narrower* than the one D2 originally
routed: one **optional** field, on a contract that already carries twenty optional fields, touching no
existing field and minting no version. A wider ask — changing a `v2` field, or narrowing `v2` to a closed
list — would still require a real 002 review, and this grant would not cover it.

### Second staleness found while correcting the first

`claimRef` was asserted to canonicalise *"between `canonicalMonth` and `contractVersion`"* in `scope.md`
step 8, `T-02-F1`, the matching DoD item, and `design.md` D2. Sorted-key canonicalisation puts `claimRef`
immediately after `canonicalMonth`, but its **successor on every live `v2` shape is `confidence`**, not
`contractVersion` — `v2` carries keys `v1` does not. Verified against one real row of each of the three live
shapes. As written the assertion holds only for the `v1`-shaped row this scope rejects, so `T-02-F1` would
have failed on all 1,140 live `v2` rows. Corrected in all four places.

### Plan corrections applied

`scope.md`: Primary Outcome (R25), Implementation Plan steps 1 (R26), 2 (R27), 3 (R28), 5, 8, 9 (R29) and 10;
Test Plan rows `T-02-U1` (R30), `T-02-U2` (R31), `T-02-F1`, `T-02-F2`, `T-02-I1` (R32), `T-02-I2`; scenarios
SCN-015-013 and SCN-015-014; and the DoD item **text** falsified by the ruling (R33). `spec.md`: the
row-shape claim (R24). `design.md`: `## D2` throughout, the `## Architecture Overview` row-count reference,
and the `## D5` bucket literal.

**No Definition of Done item was ticked. The count is unchanged at 28 unticked, 0 ticked.** No `state.json`,
no `uservalidation.md`, no source file, no test file, and no committed ledger byte was modified.

### What is unblocked, and what is not

| | State |
|---|---|
| Contract-identifier decision | **Resolved.** Option 2. |
| Fixture-proven surface (contract shape, dual-version reader, compatibility proofs, `RTR-LEGACY-BACKFILL`) | **Schedulable.** |
| Live-publisher binding | **Still blocked** on routed findings P-015-01 and P-015-02. Unchanged by this ruling. A fixture-backed pass reported as live-publisher evidence remains fabricated evidence. |
| `T-02-S1` arithmetic | **Unblocked as to the baseline.** The `1 failed` was another session's uncommitted `specs/007-*` / `specs/008-*` edits, not a repository defect; on a clean tree the self-test is `3074 passed, 0 failed`. The row itself still awaits the post-implementation total. |

## Test Evidence

Four Test Plan rows are executed and claimed: **T-02-U1**, **T-02-U2**, **T-02-U3** and **T-02-U4**.
`T-02-F1`–`F3`, `T-02-I1`–`I2`, `T-02-R1` and `T-02-S1` are **not** claimed — their test files or rows do not
exist, so any result recorded for them now would be fabricated. `T-02-R2` is not claimed because only one of
its two conjuncts has been measured: its Node half is now green (`34 tests, 34 pass, 0 fail`, exit `0`, re-run
2026-08-20) but the Playwright half of its command has never been executed. **Superseded 2026-08-20** — this
read *"`T-02-R2` is not claimed for the opposite reason: it was executed and it **fails**."* That was true of
the Node half before `3123e9fd0`; it is not true now. See
[Evidence refresh — 2026-08-20](#evidence-refresh-2026-08-20).

Suite run, 2026-08-19. The same command backs both increment-1 rows; it is reproduced once and referenced by
both anchors.

```text
$ node --test tests/recommendation-track-record.unit.mjs
✔ T-01-U1: claimHash is content-only across exactly the five unhashed fields (18.703292ms)
✔ T-01-U2: every hashed term is load-bearing (16.083094ms)
✔ T-01-U3: RTR-PREDICATE-AMEND refuses a byte-changing write and never overwrites (12.412178ms)
✔ T-01-U4: non-semantic-subject refuses both publisher positional fallbacks (16.278708ms)
✔ T-01-U5: no-committed-series refuses an empty seriesRefs and a partially-absent basket (12.965337ms)
✔ T-01-U6: every closed vocabulary refuses a one-character-off value (28.774997ms)
✔ T-01-U7: direction is bound to ACTION_DIRECTION and hold has no signed outcome (7.943588ms)
✔ T-02-U1: claimRef is optional on the live v2 at every committed shape, and v1 needs it never (67.117343ms)
✔ T-02-U2: v1 stays closed against claimRef, and v2 stays closed against everything else (26.947302ms)
ℹ tests 9
ℹ suites 0
ℹ pass 9
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 301.7434
exit=0
```

`# tests 9 / # pass 9 / # fail 0`, up from the scope-01 figure of `7 / 7 / 0` recorded in the baseline
section above: **+2**, exactly `T-02-U1` and `T-02-U2`.

### Revert verification — the load-bearing evidence

A negative that cannot fail guards nothing, so each shipped rule was **removed from `rlclaims.js`**, the suite
re-run, and the observed failure recorded. This is a real source revert, not the in-test
`validateWithUnknownFieldRuleReverted` shim — the shim proves the *fixture* discriminates; only removing the
rule proves the *shipped module* is what makes it pass.

| # | Rule removed from `rlclaims.js` | Guards | Observed failure | Suite |
|---|---|---|---|---|
| A | `rowFieldsFor` returns `ROW_V1_FIELDS.concat([CLAIM_REF_FIELD])` for `v1` — i.e. `claimRef` allowed on `v1` | T-02-U2, `v1` negative | `v1-carrying-claim-ref: expected a row refusal, got an accepted row` / `true !== false` at `assertRowRefusal` | `pass 8 / fail 1`, exit 1 |
| B | `validateLedgerRow` skips `hasOnlyFields` when `contractVersion === ROW_CONTRACT_V2` — i.e. the `v2` unknown-field closure dropped | T-02-U2, `v2` negative | `v2-unknown-field: expected a row refusal, got an accepted row` / `true !== false` | `fail 1`, exit 1 |
| C | `rowRequiredFieldsFor` returns `ROW_V2_REQUIRED_FIELDS.concat([CLAIM_REF_FIELD])` — i.e. `claimRef` made **required** on `v2` | T-02-U1, optionality | `v2 shape 17: must validate as committed` / `false !== true` | `fail 1`, exit 1 |

Each revert failed the *intended* row and no other: A and B fail only `T-02-U2`, C fails only `T-02-U1`.
Failure A names the offence at `assertRowRefusal`, not at a downstream repair assertion, so the negative
refuses at the rule under test rather than incidentally.

Raw failure block for revert A, verbatim (absolute paths written as `<repo-root>`):

```text
not ok 9 - T-02-U2: v1 stays closed against claimRef, and v2 stays closed against everything else
  ---
  location: '<repo-root>/tests/recommendation-track-record.unit.mjs:631:1'
  failureType: 'testCodeFailure'
  error: |-
    v1-carrying-claim-ref: expected a row refusal, got an accepted row
    true !== false
  code: 'ERR_ASSERTION'
  expected: false
  actual: true
  operator: 'strictEqual'
  stack: |-
    assertRowRefusal (file://<repo-root>/tests/recommendation-track-record.unit.mjs:537:12)
    TestContext.<anonymous> (file://<repo-root>/tests/recommendation-track-record.unit.mjs:638:9)
  ...
# tests 9
# pass 8
# fail 1
```

**Restoration proved, not asserted.** `rlclaims.js` was hashed before the experiment and after it:

```text
before  13de14a4684ddd3d92b11284006475e6f034a24db9bfdeddf6687d22c90e184d  rlclaims.js
after   13de14a4684ddd3d92b11284006475e6f034a24db9bfdeddf6687d22c90e184d  rlclaims.js

$ git --no-pager diff --stat -- rlclaims.js
 rlclaims.js | 185 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 1 file changed, 185 insertions(+)      # identical to the pre-experiment diffstat
```

Byte-identical, and the suite is back to `9 / 9 / 0` (the run reproduced above **is** the post-restoration
run). The experiment left no residue.

<a id="t-02-u1"></a>

### T-02-U1 — `claimRef` is optional on the live `v2` at every committed shape

`✔ T-02-U1 … (67.117343ms)` in the run above; command `node --test tests/recommendation-track-record.unit.mjs`,
exit `0`.

What the row actually asserts, and why each assertion is not vacuous:

- The three live shapes are **read from the committed ledger** (`assert.deepEqual([...byShape.keys()].sort(…),
  [17, 25, 27])`), not asserted as a literal, so a reader that silently skipped a shape cannot pass by the
  test agreeing with it.
- `deriveRowFieldUnion` **re-derives** both halves of the `v2` field set from those rows and asserts they equal
  the declared `ROW_V2_REQUIRED_FIELDS` / `ROW_V2_MEASURED_OPTIONAL_FIELDS` and that the union is 32 keys — so
  the constants are re-checked against what is on disk rather than trusted as a hand-maintained list.
- For each of shapes 17, 25 and 27: the row validates **as committed** (no `claimRef`), validates **again**
  with `claimRef` added, exactly one key was added, and the committed row was not mutated.
- `assert.equal(derived.union.includes(CLAIM_REF_FIELD), false)` and the per-shape
  `hasOwnProperty(committed, CLAIM_REF_FIELD) === false` are the **anti-vacuity** pair: they establish that no
  committed row already carries the field, so the with/without pair is a real contrast.
- A committed `v1` row validates without `claimRef`, and `ROW_V1_FIELDS` does not contain it.
- Every fixture line in `v1-only`, `v2-shape-17`, `v2-shape-25`, `v2-shape-27` is asserted **byte-present in
  the committed ledger**, so the shapes under test are what is on disk rather than what a test author typed.

**Revert-verified** by experiment C above: making `claimRef` required on `v2` fails this row at
`v2 shape 17: must validate as committed` — the optionality claim is therefore falsifiable.

<a id="t-02-u2"></a>

### T-02-U2 — `v1` stays closed against `claimRef`, `v2` stays closed against everything else

`✔ T-02-U2 … (26.947302ms)` in the run above; same command, exit `0`.

Both negatives assert the **exact** refusal triple from their committed `.expected.json`
(`code` / `reason` / `field`), not merely that validation failed:

| Negative | Expected refusal | Point |
|---|---|---|
| `v1-carrying-claim-ref` | `RTR-ROW-CONTRACT` / `unknown-field` / `claimRef` | `v1`'s seven-field list stays closed |
| `v2-unknown-field` | `RTR-ROW-CONTRACT` / `unknown-field` / `resolutionRef` | `v2` did not become an accept-anything escape hatch |

Three properties make these discriminate rather than merely refuse:

- **The `v1` refusal is about the version stamp, not a malformed value.** The negative's `claimRef` satisfies
  `CLAIM_REF_PATTERN`, and the row asserts the *identical* pointer value is **accepted** on `v2`.
- **One rule violated per negative.** Deleting the single declared offending key makes each row valid, and
  whether the repair lands back on a real committed row is itself a declared property
  (`true` for the `v1` case, `false` for the `v2` case). The repaired `v2` row still carries `claimRef`,
  proving the refusal was about `resolutionRef` and not about the field this scope added.
- **`resolutionRef` is a plausible neighbour, not a nonsense key** — the resolution object is real, it is just
  reached via `claimRef` + `eventId`. Three further strangers (`outcomeValue`, `claimref`, `claimRefs` — the
  last two being case and plural near-misses of the added field) are each refused **by name**.

**Revert-verified** by experiments A and B above. Each negative was shown to be *accepted* once its rule was
removed from `rlclaims.js`, with the observed failure recorded in the table.


## Increment 2 — the publisher mint hook and the legacy refusal

Commit `a715e92a4`, *"feat(015): thread claimRef onto the live v2 row and refuse a claimless resolution"*.
Five files, `494` insertions, `9` deletions:

```text
$ git --no-pager show --stat --oneline a715e92a4
a715e92a4 feat(015): thread claimRef onto the live v2 row and refuse a claimless resolution
 rlclaims.js                                |  40 +++++
 scripts/brief-distributed-publish.mjs      |  21 ++-
 scripts/brief-publication.mjs              |   8 +-
 scripts/recommendation-claim-mint.mjs      | 157 ++++++++++++++++
 tests/recommendation-track-record.unit.mjs | 277 +++++++++++++++++++++++++++++
 5 files changed, 494 insertions(+), 9 deletions(-)
exit=0
```

The suite is `11 / 11 / 0`, up from the increment-1 figure of `9 / 9 / 0` recorded above: **+2**, exactly
`T-02-U3` and `T-02-U4`.

```text
$ node --test tests/recommendation-track-record.unit.mjs
✔ T-01-U1: claimHash is content-only across exactly the five unhashed fields (19.751624ms)
✔ T-01-U2: every hashed term is load-bearing (15.808825ms)
✔ T-01-U3: RTR-PREDICATE-AMEND refuses a byte-changing write and never overwrites (12.523804ms)
✔ T-01-U4: non-semantic-subject refuses both publisher positional fallbacks (21.123773ms)
✔ T-01-U5: no-committed-series refuses an empty seriesRefs and a partially-absent basket (21.289569ms)
✔ T-01-U6: every closed vocabulary refuses a one-character-off value (33.82877ms)
✔ T-01-U7: direction is bound to ACTION_DIRECTION and hold has no signed outcome (10.017697ms)
✔ T-02-U1: claimRef is optional on the live v2 at every committed shape, and v1 needs it never (67.609208ms)
✔ T-02-U2: v1 stays closed against claimRef, and v2 stays closed against everything else (33.693666ms)
✔ T-02-U3: eventId and recommendationKey are byte-identical with and without the mint hook (37.39909ms)
✔ T-02-U4: RTR-LEGACY-BACKFILL refuses a resolution written against a claimless row (33.568248ms)
ℹ tests 11
ℹ suites 0
ℹ pass 11
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 425.363335
exit=0
```

<a id="t-02-u3"></a>

### T-02-U3 — `eventId` and `recommendationKey` are byte-identical with and without the mint hook

`✔ T-02-U3 … (37.39909ms)` in the run above; command `node --test tests/recommendation-track-record.unit.mjs`,
exit `0`.

The row is a genuine before/after, not the same array inspected twice: `buildEventsWithoutHook(...)` is called
**twice independently**, and only the second result is passed through `attachClaimRefs(...)`. The run
fingerprint, run id and `occurredAt` are held fixed across the pair, so any drift in an identifier would be
attributable to the hook and to nothing else. The comparison is made on `JSON.stringify([eventId,
recommendationKey])` — byte-level text, which is what the ledger and every downstream join actually consume,
rather than a `===` that would pass on a coerced value.

Four properties keep it from being vacuous:

- **Something is actually attached.** Exactly one of the two authored actions is evaluable, and the row asserts
  exactly one event gains `claimRef`, that the pointer matches `CLAIM_REF_PATTERN`, and that it equals
  `records[0].claim.claimHash`. Without this, "identical with and without the hook" would hold under a hook
  that did nothing at all.
- **The pre-hook events are asserted to carry no `claimRef`**, so the contrast is real on both sides.
- **A row-derived digest is shown to move.** `assert.notEqual(stableSha(rowWith), stableSha(rowWithout))`
  establishes that adding the field *would* shift an identifier hashed from the row — and `eventId` is then
  asserted unmoved by that same change. The stability is therefore demonstrated to be a consequence of
  `eventId` not being row-derived, not a coincidence.
- **The real writer is exercised.** The rows come from `buildPublishSet(...)`, the production row builder, and
  every emitted row is asserted to validate and to be stamped `…/v2`.

This row also carries the **BS-001 cross-reference** and the **refused-mint** and **canonical-ordering**
assertions; those are anchored separately below.

<a id="t-02-u4"></a>

### T-02-U4 — `RTR-LEGACY-BACKFILL` refuses a resolution written against a claimless row

`✔ T-02-U4 … (33.568248ms)` in the run above; same command, exit `0`.

The refusal triple is asserted as literals — `code: 'RTR-LEGACY-BACKFILL'`, `reason:
'claimless-row-unscoreable'`, `field: 'claimRef'` — and the code itself is additionally pinned
(`assert.equal(claims.LEGACY_BACKFILL_CODE, 'RTR-LEGACY-BACKFILL')`), so a renamed constant fails here rather
than silently renaming the contract.

The **adversarial input** is the point of the row. The resolution offered against the claimless row is
complete and entirely plausible: a real comparator from the claim vocabulary, a finite level, a real horizon
kind, a signed outcome, a real `eventId` and `recommendationKey` lifted from the committed row it targets.
This is precisely the imputation a permissive implementation wants through — every field looks authored, and
none of it was.

What makes the refusal a property of the **row** rather than of the resolution:

| Probe | Result | What it rules out |
|---|---|---|
| Plausible resolution vs. legacy `v2` and legacy `v1` committed rows | refused, identical triple | The refusal does not key on the version stamp |
| Empty `{}` resolution | refused, identical triple | The resolution is never consulted to reach the answer |
| `null` resolution | refused, identical triple | Same, at the other extreme |
| Identical plausible resolution vs. the **same row plus a `claimRef`** | **accepted**, returns the pointer and `eventId` | An implementation that refused *everything* would guard nothing |
| `claimRef: null` on that row | refused `RTR-ROW-CONTRACT` / `claim-ref-not-opaque-sha256` | A null is not a claim reference wearing the marker's clothes |
| Row carrying an unknown `resolutionRef` | refused `RTR-ROW-CONTRACT` / `unknown-field` | A malformed row outranks legacy, so a different defect is not hidden as legacy |
| Malformed resolution on a claim-bearing row | refused `RTR-ROW-CONTRACT` / `resolution-not-an-object` | A valid row does not silently accept rubbish |

The rows under test are **read from the committed ledger**, and each is first asserted to genuinely carry no
`claimRef` — so the negatives cannot pass against a fixture that merely happens to lack the field. The refusal
also names the `eventId` it refused, so an operator can find the row.

Finally the row proves the marker is about **construction, not age**: a freshly published claimless row —
produced in this same test by running the real writer over a payload whose second action the minter refuses —
is refused identically, while its claim-bearing sibling from the same pass is accepted.

<a id="core-contract-shape"></a>

### Core — `claimRef` is one optional field on the live `…/v2`, typed as an opaque `sha256:…`

`CLAIM_REF_FIELD = "claimRef"` and `CLAIM_REF_PATTERN = /^sha256:[a-f0-9]{64}$/` in `rlclaims.js`. No `v3`
identifier exists anywhere in the repository; `ROW_CONTRACT_V2` still resolves to the live
`brief-recommendation-history-row/v2` minted at `scripts/recommendation-body.mjs#L22`, unchanged.

Three independent facts establish the shape rather than assert it:

- **Optional at every committed shape** — `T-02-U1` validates a real committed row of each of the three live
  `v2` shapes (17, 25, 27 keys) both without and with `claimRef`, and revert experiment C above proved the
  optionality claim falsifiable: making the field required fails that row at `v2 shape 17: must validate as
  committed`.
- **Opaque string, not a nested object** — `T-02-U3` asserts `CLAIM_REF_PATTERN.test(attached[0].claimRef)`
  on the pointer the real writer emits, and `T-02-U4` shows a `null` is refused as
  `claim-ref-not-opaque-sha256`.
- **`v1` untouched** — `T-02-U2` keeps `v1`'s seven-field list closed against the field, and
  `ROW_V1_FIELDS.includes(CLAIM_REF_FIELD)` is asserted `false`.

No existing `v2` field changed: the increment-2 diff to `scripts/brief-publication.mjs` is an eight-line
addition that renames the returned object literal to `v2` and conditionally adds one key; every pre-existing
field assignment is byte-identical.

<a id="core-dual-version-reader"></a>

### Core — the dual-version reader accepts both versions, and no history was rewritten

Measured this session against the whole committed ledger, not sampled:

```text
$ node --input-type=module -e '<enumerate briefs/history/recommendations/*.jsonl, validateLedgerRow each row>'
files              2026-07.jsonl 2026-08.jsonl
v1 rows            240
v2 rows            1140
other contract     0
total rows         1380
validated ok       1380
refused            0
rows with claimRef 0
exit=0
```

`1,380 / 1,380` validate under `validateLedgerRow`, matching the `240` `v1` / `1,140` `v2` census recorded in
the ruling above exactly. `rows with claimRef 0` is the anti-vacuity companion: no committed row already
carries the field, so the acceptance is genuinely of the pre-existing corpus.

The `v2` acceptance set is not a hand-maintained list taken on trust — `T-02-U1` calls `deriveRowFieldUnion`
to **re-derive** the required and optional halves from the committed rows and asserts they equal the declared
`ROW_V2_REQUIRED_FIELDS` / `ROW_V2_MEASURED_OPTIONAL_FIELDS` and that the union is `32` keys.

`v1` is not deprecated: it validates, and `T-02-U1` asserts a committed `v1` row passes without the field.
No historical row was rewritten, and no migration exists — both increments together touch zero ledger bytes:

```text
$ git --no-pager diff --stat eb716c2f1~1 a715e92a4 -- briefs/
(no output — no committed ledger byte was modified)
exit=0
```

<a id="core-refused-mint"></a>

### Core — a refused mint yields no pointer and carries its reason, never a fabricated claim

`mintClaimRecords` returns `{ claimRef: null, claim: null, notEvaluable: … }` on every refusal path — mint
context unavailable, no authored action at the index, `mintClaim` threw, `mintClaim` refused — and
`attachClaimRefs` then writes `claimNotEvaluable` onto the event **instead of** `claimRef`. There is no branch
that synthesises a subject, predicate or horizon.

`T-02-U3` asserts this on the refused half of its pair: the second authored action is the publisher's
positional `note` fallback, and the row asserts the resulting event carries no `claimRef` and carries the
**exact** refusal `non-semantic-subject` / `actionFamily` — the real refusal `mintClaim` produces, not a
guess. A wrong-event binding is refused too: `mintClaimRecords` checks the minted claim's
`recommendationKey` against the event's and yields no pointer on a mismatch, because binding a claim to the
wrong event is strictly worse than binding none.

The reason never leaks into the ledger. `T-02-U3` asserts the emitted claimless row has **no**
`claimNotEvaluable` key — the refusal travels on the event only, so `v2` gains exactly one field.

<a id="core-legacy-marker"></a>

### Core — absence is the legacy marker, for both versions, keyed on key-absence

`authorizeResolutionWrite` tests `Object.prototype.hasOwnProperty.call(row, CLAIM_REF_FIELD)` — key presence,
never a value comparison and never the version stamp. The `T-02-U4` table above is the proof: a legacy `v1`
row and a legacy `v2` row refuse with the **identical** triple, a `null` pointer refuses on the *contract*
rather than resolving, and a freshly published claimless row refuses exactly as a 2026-07 row does.

The corpus this covers is the whole ledger, not the `v1` subset: the measurement above shows `0` of `1,380`
committed rows carry `claimRef`, so all `1,380` are unscoreable by construction. Nothing was null-filled,
back-filled, estimated or migrated — the zero-byte ledger diff recorded above is the mechanical form of that.

<a id="core-consent-honoured"></a>

### Core — Feature 002 consent was recorded before the emitting code merged

The standing blanket authorisation of 2026-08-19, its verbatim wording, and its explicit
authorises / does-not-authorise limits are recorded above under *Consent record* — written **before**
`a715e92a4`, which is the first commit that emits a `claimRef`-bearing row.

The increment stayed inside the recorded limits, verified rather than asserted:

| Limit | Observed |
|---|---|
| No change to an existing `v2` field | The `brief-publication.mjs` diff adds one conditional key; every prior assignment is unchanged |
| No change to `v1` | `v1` is not touched in any of the five changed files |
| No committed byte changed | `git diff --stat … -- briefs/` is empty |
| The 002-owned validator's field list is updated by 002, not by 015 | `rlcontracts.js` is **not** among the five changed files. Its `RECOMMENDATION_FIELDS` closed list (`#L733`, applied at `#L1071`) governs the brief payload's recommendation objects, not the history row; `grep -rn "brief-recommendation-history-row"` finds no closed-field validator in 002-owned code, so there was no 002 field list for 015 to edit |

<a id="core-hygiene"></a>

### Core — numeric and statistical hygiene

```text
$ grep -nE '(^|[^.[:alnum:]_$])isFinite[[:space:]]*\(' rlclaims.js scripts/recommendation-claim-mint.mjs \
    tests/recommendation-track-record.unit.mjs tests/recommendation-track-record.e2e.mjs
exit=1        # no match — no bare global isFinite in 015-authored code

$ grep -c 'Number\.isFinite' rlclaims.js scripts/recommendation-claim-mint.mjs
rlclaims.js:4
scripts/recommendation-claim-mint.mjs:0

$ grep -n 'rlvalidation' rlclaims.js scripts/recommendation-claim-mint.mjs \
    tests/recommendation-track-record.unit.mjs tests/recommendation-track-record.e2e.mjs
exit=1        # no match — rlvalidation.js is not imported by 015-authored code
```

`Number.isFinite` is the only finiteness predicate used, and `rlvalidation.js` is neither imported nor
referenced. This scope computes hashes, field-set comparisons and refusals; it computes no statistic.

<a id="regression-e2e-module-closure"></a>

### Regression introduced by increment 2 — the committed Node E2E suite was red — FIXED 2026-08-20 (`3123e9fd0`)

Recorded rather than absorbed, and **not** attributed elsewhere: this was 015's regression. The diagnosis is
preserved verbatim below because it is what produced the fix. **Every measurement in this section is
superseded**; the replacement figures, taken at `3123e9fd0`, are in
[Evidence refresh — 2026-08-20](#evidence-refresh-2026-08-20).

**SUPERSEDED 2026-08-20** — re-run at HEAD the same command reports `34 tests, 34 pass, 0 fail`, exit `0`:

```text
$ node --test tests/*.e2e.mjs
✖ SCN-019-012 real generation publishes one atomic agenda and brief payload transaction (7128.093668ms)
✖ T-01-R2: the committed suites are intact, and the committed Node E2E suite runs green (38607.292398ms)
ℹ tests 34
ℹ pass 32
ℹ fail 2
exit=1
```

```text
test at tests/distributed-briefs.final.e2e.mjs:697:1
✖ SCN-019-012 real generation publishes one atomic agenda and brief payload transaction
  AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
      at TestContext.<anonymous> (file://<repo-root>/tests/distributed-briefs.final.e2e.mjs:706:10)
    actual: '2026-07-15',
    expected: '2026-07-16',
    operator: 'strictEqual'
```

**Root cause, established by direct probe rather than inferred.** The E2E fixture reconstructs the
publication path by copying each entry in `FIXTURE_PUBLICATION_SCRIPTS` together with its transitive
**relative-import** closure, derived by `copyModuleClosure` from static `import` / `export … from` and
side-effect `import '…'` statements. `scripts/recommendation-claim-mint.mjs` reaches `rlclaims.js` through
`createRequire(import.meta.url)` + `require('../rlclaims.js')`, which is not a static import specifier, so the
closure derivation cannot see it. `rlcontracts.js` and `rlagenda.js` are copied by explicit lines; `rlclaims.js`
is not.

**Both probes below are SUPERSEDED 2026-08-20.** Re-run verbatim at `3123e9fd0` the first now reports
`PRESENT rlclaims.js` and the second `IMPORT OK status=0`; the re-runs are recorded in
[Evidence refresh — 2026-08-20](#evidence-refresh-2026-08-20).

```text
$ node --input-type=module -e '<createBriefRefreshFixture, then existsSync each module in the fixture repo>'
ABSENT  rlclaims.js
PRESENT rlcontracts.js
PRESENT rlagenda.js
PRESENT scripts/recommendation-claim-mint.mjs
PRESENT scripts/brief-distributed-publish.mjs
exit=0
```

```text
$ node --input-type=module -e '<build the fixture, then import ./scripts/brief-distributed-publish.mjs inside it>'
Error: Cannot find module '../rlclaims.js'
Require stack:
- /tmp/research-lab-bug002-ii5m5f/repo/scripts/recommendation-claim-mint.mjs
    at file:///tmp/research-lab-bug002-ii5m5f/repo/scripts/recommendation-claim-mint.mjs:31:16
  code: 'MODULE_NOT_FOUND'
IMPORT FAILED status=1
exit=0
```

So inside the fixture repo the publisher module fails to load, the publication step never runs, and the
wrapper still exits `0` while the payload silently retains the baseline session date — which is exactly the
observed `'2026-07-15'` (the fixture's `baselineDate`) against the expected `'2026-07-16'` (its
`candidateDate`). `T-01-R2` fails as a **cascade**: it spawns the committed Node E2E suite as a child and
asserts exit `0`.

Production is unaffected — `rlclaims.js` sits at the repository root, so `../rlclaims.js` resolves from
`scripts/` — but the repository's own end-to-end reconstruction of the publication path is red, and that is
the surface `T-02-R2` is written against.

**FIXED 2026-08-20 at `3123e9fd0`**, *"fix(tests): follow createRequire dependencies in the fixture module
closure"* — two files, both tests, `102` insertions / `16` deletions:

```text
$ git --no-pager show --stat --oneline 3123e9fd0
3123e9fd0 fix(tests): follow createRequire dependencies in the fixture module closure
 tests/brief-refresh-atomicity.support.mjs | 41 ++++++++++------
 tests/brief-refresh-atomicity.test.mjs    | 77 ++++++++++++++++++++++++++++++-
 2 files changed, 102 insertions(+), 16 deletions(-)
```

The remedy taken is neither of the two candidates recorded above. Both were patches to a *list*; the fix makes
the closure **derivation** follow `createRequire` edges, so the next `createRequire` consumer cannot reopen the
hole. Two literal spellings had to be followed, because following only the first moved the failure rather than
removing it — referrer-relative `require('../rlclaims.js')` and root-anchored
`createRequire(url)(resolve(ROOT, 'rlattentiongate.js'))`. No source file changed; the defect was in the test
fixture's reconstruction, never in production.

**Consequences for the Definition of Done, re-assessed 2026-08-20 rather than carried forward.** The E2E
falsification of `T-02-R2` is withdrawn and its Node conjunct is green; the Build Quality Gate loses this
conjunct but still fails two others; and the two Core items that assert the publisher wiring functions as a
pass remain open **for changed reasons** — the mint-hook item because the reconstruction now runs but produces
neither a claim object nor a `claimRef`-bearing row, and the live-binding item because of the unchanged
P-015-01 / P-015-02 tension, which this fix does not touch. Each is set out in
[Evidence refresh — 2026-08-20](#evidence-refresh-2026-08-20).

### Project checks re-run this session

```text
$ node scripts/selftest.mjs
Research-Lab self-test: 3098 passed, 1 failed
exit=1
```

The single failure is line `2124`, *"the committed dependency-gate projection matches its source specs — a
stale projection misreports delivery"* — the same pre-existing, non-015 failure diagnosed under
[T-02-S1](#t-02-s1) above as another session's *uncommitted* `specs/007-*` / `specs/008-*` /
`docs/releases/improvement-plan/actions.md` working-tree edits, which the projection reads. It is not 015's,
and those files were **not** stashed, modified or touched this session.

```text
$ bash .github/bubbles/scripts/artifact-lint.sh specs/015-recommendation-outcome-ledger-and-track-record
exit=0
```

**Re-verified 2026-08-20 at `3123e9fd0`: both figures above are unchanged and are NOT superseded.** The
self-test still reports `3098 passed, 1 failed`, exit `1`, with the same single failure at line `2124`, and
artifact lint still exits `0`. Raw re-runs are in [Evidence refresh — 2026-08-20](#evidence-refresh-2026-08-20).

<a id="evidence-refresh-2026-08-20"></a>

## Evidence refresh — 2026-08-20, at `3123e9fd0`

Every command this report cites as evidence was re-executed at HEAD. This pass exists because superseded
evidence left standing is itself the defect: an item whose recorded reason is no longer true *reads* as
assessed when it is only stale. Figures that changed are marked **SUPERSEDED** in place above with the old
value retained, and are listed here as old → new with the cause. Figures that did **not** change are named
too, so "unchanged" is a measurement rather than an omission.

**This refresh ticked nothing. The count is unchanged at 15 of 28.** The fix removed one *reason* from three
open items without satisfying any of them — which is the whole finding of this pass.

### Figures corrected

| Evidence | Recorded | Re-measured 2026-08-20 | Why it changed |
|---|---|---|---|
| `node --test tests/*.e2e.mjs` | `34 tests, 32 pass, 2 fail`, exit `1` | `34 tests, 34 pass, 0 fail`, exit `0` | `3123e9fd0` makes the fixture closure resolver follow `createRequire` edges, so `rlclaims.js` reaches the fixture repo and the publisher module loads |
| `✖ SCN-019-012` — `actual '2026-07-15'` vs `expected '2026-07-16'` | failing | `✔ SCN-019-012 … (11241.471463ms)` | the publication step now runs instead of silently no-op-ing behind a wrapper that still exited `0` |
| `✖ T-01-R2` | failing as a cascade on the child suite's exit code | `✔ T-01-R2 … (67339.065447ms)` | its cascade source is gone |
| fixture closure probe | `ABSENT  rlclaims.js` | `PRESENT rlclaims.js` | same fix |
| fixture import probe | `Cannot find module '../rlclaims.js'` / `MODULE_NOT_FOUND` / `IMPORT FAILED status=1` | `IMPORT OK status=0` | same fix |
| `T-02-R2` disposition | *"executed and it **fails**"* | Node conjunct green; Playwright conjunct **never executed**, so the item is unmeasured rather than falsified | the Node half was fixed; the Playwright half was not run then and was not run now |

### Figures re-measured and unchanged — not superseded

| Evidence | Value, both times |
|---|---|
| `node --test tests/recommendation-track-record.unit.mjs` | `11 tests, 11 pass, 0 fail`, exit `0` |
| `node scripts/selftest.mjs` | `3098 passed, 1 failed`, exit `1`; sole failure line `2124` |
| `bash .github/bubbles/scripts/artifact-lint.sh specs/015-…` | exit `0` |
| `git --no-pager diff --stat … -- briefs/` | empty — no committed ledger byte changed |

The fix commit touches **two test files and no source file**, so every source-level claim recorded above —
the contract shape, the dual-version reader, the refused-mint path, `RTR-LEGACY-BACKFILL`, the hygiene
scans — is unaffected by it and was not re-derived.

### Verification 1 — `node --test tests/*.e2e.mjs`

```text
$ node --test tests/*.e2e.mjs
✔ SCN-019-012 real generation publishes one atomic agenda and brief payload transaction (11241.471463ms)
✔ T-01-R1: the whole fixture claim set holds the frozen contract against the real store layout (315.345306ms)
✔ T-01-R2: the committed suites are intact, and the committed Node E2E suite runs green (67339.065447ms)
ℹ tests 34
ℹ suites 0
ℹ pass 34
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 72390.830828
exit=0
```

`tests 34` both before and after, with `skipped 0` and `todo 0`, so **no pre-existing test was removed or
skipped** — the two previously-failing rows are named green above rather than absent.

### Verification 2 — `node --test tests/*.test.mjs`

```text
$ node --test tests/*.test.mjs
# tests 147
# suites 0
# pass 146
# fail 1
# cancelled 0
# skipped 0
# todo 0
# duration_ms 165092.957146
exit=1
```

The complete `not ok` list is one entry:

```text
not ok 21 - SCN-017-044 The project selftest passes with the new module registered
  ---
  location: '<repo-root>/tests/attention-payload-contract.test.mjs:1815:1'
  failureType: 'testCodeFailure'
  error: |-
    the project selftest must report zero failures, reported 1

    1 !== 0
  code: 'ERR_ASSERTION'
  expected: 0
  actual: 1
  operator: 'strictEqual'
  ...
```

This row spawns `scripts/selftest.mjs` and asserts zero failures, so it is a **wrapper around the same single
non-015 dependency-gate failure** diagnosed under [T-02-S1](#t-02-s1) — another session's uncommitted
`specs/007-*` / `specs/008-*` / `docs/releases/improvement-plan/actions.md` working-tree edits, which the
projection reads. It is not this scope's, and no `specs/007-*`, `specs/008-*` or `actions.md` byte was
stashed, modified or read for mutation by this pass.

### Verification 3 — `node --test tests/recommendation-track-record.unit.mjs`

```text
✔ T-02-U1: claimRef is optional on the live v2 at every committed shape, and v1 needs it never (64.811067ms)
✔ T-02-U2: v1 stays closed against claimRef, and v2 stays closed against everything else (30.251014ms)
✔ T-02-U3: eventId and recommendationKey are byte-identical with and without the mint hook (42.297721ms)
✔ T-02-U4: RTR-LEGACY-BACKFILL refuses a resolution written against a claimless row (35.79655ms)
ℹ tests 11
ℹ suites 0
ℹ pass 11
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 396.385166
exit=0
```

### Verifications 4–6 — lint, path hygiene, working tree

```text
$ bash .github/bubbles/scripts/artifact-lint.sh specs/015-recommendation-outcome-ledger-and-track-record
Artifact lint PASSED.
exit=0

$ grep -rnE '/home/[a-z]+' specs/015-…/scopes/02-additive-ledger-row-extension/
exit=1        # no match — no absolute path is committed in this scope's artifacts

$ git status --porcelain
 M specs/015-…/scopes/02-additive-ledger-row-extension/report.md
 M specs/015-…/scopes/02-additive-ledger-row-extension/scope.md
```

`git status` additionally lists `docs/releases/improvement-plan/actions.md`, `specs/007-*` and `specs/008-*`
modifications. Those are **another session's** concurrent work; this pass neither wrote nor stashed them.

### Root-cause probes re-run

```text
$ node --input-type=module -e '<createBriefRefreshFixture, then existsSync each module in the fixture repo>'
PRESENT rlclaims.js
PRESENT rlcontracts.js
PRESENT rlagenda.js
PRESENT rlattentiongate.js
PRESENT scripts/recommendation-claim-mint.mjs
PRESENT scripts/brief-distributed-publish.mjs
exit=0
```

```text
$ node --input-type=module -e '<build the fixture, then import ./scripts/brief-distributed-publish.mjs inside it>'
IMPORT OK status=0
exit=0
```

`rlattentiongate.js` is probed alongside `rlclaims.js` because it is the **second** spelling the fix had to
follow — root-anchored `createRequire(url)(resolve(ROOT, …))` rather than referrer-relative
`require('../…')`. Following only the first moved the failure to the second; both are present now.

<a id="refresh-same-pass-probe"></a>

### New measurement — what the end-to-end reconstruction actually produces

The mint-hook Core item turns on whether *"the claim object and the `claimRef`-bearing row are produced in the
same pass"*. Its recorded reason for being open was that the reconstruction produced **neither**, because the
publisher module failed to load. That module now loads, so the reconstruction was re-run under the same
options the passing E2E row uses (`{ narrativeMode: 'success', agendaAssets: true }`) and its output
inspected directly:

```text
$ node --input-type=module -e '<createBriefRefreshFixture({narrativeMode:"success",agendaAssets:true}), run it, inspect output>'
wrapper status=0
payloadDate=2026-07-16  candidateDate=2026-07-16  baselineDate=2026-07-15
recommendations dir exists=true
2026-07.jsonl: rows=4 withClaimRef=0
claims dir exists=false
exit=0
```

**The pass now runs — and still produces neither.** `payloadDate` reaches the candidate date, so the
publication step genuinely executes rather than silently no-op-ing; it writes `4` recommendation rows; and
`0` of them carry `claimRef`, with no claim object written at all. That is the honest-degradation path
behaving exactly as designed — these fixture actions are the prose-subject case P-015-01 describes, the
minter refuses them, and a refused mint yields a claimless row rather than a fabricated claim.

The consequence for the Definition of Done is narrow and must not be overstated in either direction: the
regression is genuinely gone, **and** the same-pass conjunct is still demonstrated only at unit level, by
`T-02-U3` through the production row builder `buildPublishSet(…)`. It is not demonstrated end to end,
because the only end-to-end reconstruction available exercises actions the minter correctly refuses. The
item therefore stays open on a **different and narrower** reason than before.

### Wiring re-verified at the lines the item names

```text
$ sed -n '177p' scripts/brief-publication.mjs
  const recRows = (run.recommendationEvents || []).map((event) => {

$ grep -n 'attachClaimRefs' scripts/brief-distributed-publish.mjs scripts/recommendation-claim-mint.mjs
scripts/brief-distributed-publish.mjs:46:import { attachClaimRefs } from './recommendation-claim-mint.mjs';
scripts/brief-distributed-publish.mjs:409:  const recommendationEvents = attachClaimRefs(
scripts/recommendation-claim-mint.mjs:149:export function attachClaimRefs(events, payload, options) {
```

The hook is present, and `claimRef` is attached inside that same `map` at `scripts/brief-publication.mjs#L213`
— written only when the mint produced an evaluable claim, and then **absent** rather than `null`. One
discrepancy is recorded rather than smoothed: the item cites the build site as
`scripts/brief-distributed-publish.mjs#L403`–`#L408`, but the measured statement is at **`#L409`**; lines
`402`–`408` are the explanatory comment immediately above it. The mechanism is where the item says it is; the
line range is off by one and should be re-anchored when the item is next revised.

### Re-assessment of all 13 open items

Assessed against the corrected measurements, one conjunct at a time. **None became tickable.**

| Open item | Verdict | Reason at HEAD |
|---|---|---|
| Core — `v1` rejects `claimRef`, `v2` **still** rejects an outside name | stays open | Unchanged by the fix. *"still"* is a before/after claim and no pre-extension measurement was ever executed; this pass did not take one either. |
| Core — mint hook wired **so that** claim and row are produced in the same pass | stays open, **reason corrected** | Was: the publication path fails to load. Now: it loads and runs, and produces `4` rows with `0` `claimRef` and no claim object — see [the probe](#refresh-same-pass-probe). The final conjunct is demonstrated by `T-02-U3` through `buildPublishSet(…)` but not end to end. |
| Core — canonical ordering **and** a seven-field projector returns exactly the seven `v1` names | stays open | Unchanged by the fix. The ordering half holds; the projector half is asserted nowhere — it belongs to `T-02-F1`, which is not written. |
| Core — routed findings block the live binding, **and the live binding is not scheduled** | stays open — **live owner decision, preserved** | Unchanged by the fix, and deliberately not resolved here. Increment 2 wired `attachClaimRefs` into the **production** `scripts/brief-distributed-publish.mjs` path while P-015-01 and P-015-02 remain open. The probe above is the first evidence of how that wiring behaves on real authored actions — it degrades to claimless rather than fabricating — but that is *one* fixture, not a measurement of production authored actions. The tension is surfaced for an owner decision, not closed. |
| `T-02-F1`, `T-02-F2`, `T-02-F3` | stay open | Not written. `tests/recommendation-track-record.functional.mjs` carries `T-01-F1`–`F3` only. Not created in this pass. |
| `T-02-I1`, `T-02-I2` | stay open | Not written. `tests/recommendation-track-record.integration.mjs` does not exist. Not created in this pass. |
| `T-02-R1` | stays open | Not written. `tests/recommendation-track-record.e2e.mjs` carries `T-01-R1` and `T-01-R2` only. Not created in this pass. |
| `T-02-R2` | stays open, **reason corrected** | Was: *executed and failed*. Now: its **Node** conjunct is green (`34 / 34 / 0`, exit `0`, `tests 34` unchanged, `skipped 0`). Its second conjunct — *"the whole committed Playwright spec suite"* green, `68` spec files — has **never been executed**, here or previously. A two-conjunct row with one conjunct unmeasured is unproven, not proven. |
| `T-02-S1` | stays open | Figure unchanged: `3098 passed, 1 failed`, exit `1`. The row requires `0 failed`. |
| Build Quality Gate | stays open, **reason narrowed** | Three conjuncts failed; one is now clean. Remaining: **(a)** `node scripts/selftest.mjs` is not at zero failures, and **(b)** the `T-02-U3` / `T-02-U4` negatives have still not been revert-verified against the shipped module the way the increment-1 negatives were. |

**On the self-test conjunct specifically, since it is the tempting one to wave through.** The sole remaining
failure is not this scope's — it is another session's uncommitted tree, and a clean-tree run was already
measured at `3074 passed, 0 failed` under [T-02-S1](#t-02-s1). It is still not tickable, for two reasons.
First, the conjunct is written against the command's observed output, and the observed output is `1 failed`;
substituting a stash-and-rerun result for the real one is exactly the kind of convenient re-measurement this
report has refused elsewhere. Second, and decisively, **conjunct (b) fails independently of any other
session** — no revert verification exists for `T-02-U3` or `T-02-U4`. The gate would remain unticked even if
the working tree were spotless.

### Artifact bookkeeping done by this pass

`scope.md` read `**Status:** Not Started` while 15 of its 28 DoD items were ticked, which is self-contradictory.
It is corrected to `**Status:** In Progress`. That value is an existing convention in this repository
(`specs/013-*/scopes/01`, `02`, `03` and `specs/_bugs/BUG-010-*` all use it), so this is conforming, not
invented. It is **not** marked `Done`; no completion is claimed.

One divergence is left deliberately: `scopes/_index.md` still lists scope 02 as `Not Started` in both its
overview table and its scope table. That file is outside this pass's target and editing it would put a
non-scope-02 file in this session's diff, so it is recorded here as a follow-up rather than silently changed.


## Completion Statement

Scope 02 is **not** complete and no scope completion or certification is claimed. **Fifteen of the 28**
Definition of Done items are claimed — the two increment-1 Test items for `T-02-U1` and `T-02-U2`, plus
eleven Core items and the two Test items for `T-02-U3` and `T-02-U4` recorded above. Every other item is
deliberately left open, each for a stated reason rather than by omission.

The 2026-08-20 evidence refresh re-executed every cited command at `3123e9fd0` and **ticked nothing**; the
count is unchanged at 15 of 28. Three of the reasons below were corrected because the regression they rested
on is fixed, but in each case a different conjunct still fails. The reasons marked *corrected* or *narrowed*
are the ones true at HEAD; the superseded wording is quoted inside them rather than deleted.

### Items left open, and the real reason for each

Following the near-miss convention established at increment 1: an item fails as a whole if it fails one
conjunct, and the failing conjunct is named.

| Item | Why it is not ticked |
|---|---|
| Core — `v1` rejects `claimRef`, and `v2` **still** rejects a name outside its live union | Unchanged from increment 1. Both refusals are proven by `T-02-U2`, but *"still"* is a before/after claim and no pre-extension measurement was executed. The revert experiments prove falsifiability, not a prior baseline. |
| Core — the publisher mint hook is wired **so that the claim object and the row are produced in the same pass** | The wiring is present at the named lines (line range off by one — measured at `#L409`) and `T-02-U3` proves same-pass production through the real writer `buildPublishSet(…)`. **Reason corrected 2026-08-20.** It previously read that the repository's end-to-end reconstruction produced neither, because `scripts/brief-distributed-publish.mjs` failed to load. That load failure is fixed. The reconstruction now runs — and still produces neither: `4` rows, `0` with `claimRef`, no claim object, because the minter correctly refuses these prose-subject actions. The final conjunct is therefore still not demonstrated where the full pass runs. See [the probe](#refresh-same-pass-probe). |
| Core — `claimRef` canonicalises after `canonicalMonth` **and** a seven-field projector returns exactly the seven `v1` key names | The ordering half is proven by `T-02-U3` against a real committed row of **every** live `v2` shape — predecessor `canonicalMonth`, successor `confidence`, explicitly not `contractVersion`. The projector half is asserted **nowhere**; it belongs to `T-02-F1`, which is not written. `ROW_V1_FIELDS` appears in the suite only as an acceptance list and in the `claimRef`-not-included negative. |
| Core — routed findings block the live-publisher binding, and **the live binding is not scheduled** | The first conjunct holds and is recorded above. The second no longer plainly holds: increment 2 wired `attachClaimRefs` into the **production** `scripts/brief-distributed-publish.mjs` path while P-015-01 and P-015-02 are still open. **Unchanged 2026-08-20**, and deliberately not resolved. The [same-pass probe](#refresh-same-pass-probe) is the first evidence of how that wiring behaves on authored actions — it degrades to a claimless row rather than fabricating a claim — but that is one fixture, not a measurement of real authored actions through the wired path. This tension remains surfaced for an owner decision rather than absorbed. |
| `T-02-F1`, `T-02-F2`, `T-02-F3` | Not written. `tests/recommendation-track-record.functional.mjs` contains `T-01-F1`, `T-01-F2` and `T-01-F3` only. |
| `T-02-I1`, `T-02-I2` | Not written. `tests/recommendation-track-record.integration.mjs` does not exist. The full-partition measurement recorded under [the dual-version reader](#core-dual-version-reader) is a session measurement, **not** `T-02-I1`: it does not assert the partition bytes unmodified after the read, and it is not a committed regression. |
| `T-02-R1` | Not written. `tests/recommendation-track-record.e2e.mjs` carries `T-01-R1` and `T-01-R2` only; no `T-02-` row exists in it. |
| `T-02-R2` | **Reason corrected 2026-08-20.** It previously read *"Executed and failed"* — no longer true. The Node conjunct is green: `34 tests, 34 pass, 0 fail`, exit `0`, with `tests 34` unchanged and `skipped 0`, so no pre-existing test was removed, skipped, or is newly failing. The row's **second** conjunct — *"the whole committed Playwright spec suite"* green, `68` spec files — has never been executed, previously or in this pass. One measured conjunct out of two is unproven, not proven. |
| `T-02-S1` | The self-test is `3098 passed, 1 failed`, exit `1`. The row requires `baseline + N passed, 0 failed`. The `1 failed` is the non-015 dependency-gate projection failure diagnosed above, and the `+24` over the clean-tree baseline of `3074` is not isolatable to this scope, so neither conjunct is satisfiable yet. |
| Build Quality Gate | **Narrowed 2026-08-20 from three failing conjuncts to two.** The newly-failing-E2E conjunct is now clean. Still failing: the self-test is not at `0 failed`; and the `T-02-U3` / `T-02-U4` negatives have **not** been revert-verified against the shipped module the way the increment-1 negatives were. The second fails independently of any other session's tree, so the gate stays unticked regardless of how the self-test conjunct is read. |

### Ledger and ownership boundaries held

No committed ledger byte was modified (`git diff --stat … -- briefs/` empty across both increments). No
`state.json`, no `uservalidation.md`, no `spec.md`, no `design.md`, and no source or test file was modified by
this evidence-recording pass — its entire diff is this file and `scope.md`. The concurrently-edited
`specs/007-*`, `specs/008-*` and `docs/releases/improvement-plan/actions.md` working-tree changes belong to
another session and were neither read for mutation, stashed, nor written.

The contract-identifier blocker recorded above remains **resolved**. The live-publisher binding remains
blocked on P-015-01 / P-015-02; no fixture-backed result in this report is offered as live-publisher evidence.
