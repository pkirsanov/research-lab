# Scope 02 Report: Additive ledger row extension

Evidence contract: [scope.md](scope.md), [spec.md](../../spec.md), [scope index](../_index.md), and [uservalidation.md](../../uservalidation.md).

**Evidence status:** Baseline captured; the blocking premise failure recorded below is **resolved** by the
2026-08-19 ruling further below, and the plan has been corrected to match measured reality. The first
increment of the fixture-proven surface — the `claimRef` field on the live `…/v2`, the dual-version reader,
and its negatives — is delivered and revert-verified. **Two** Definition of Done items are claimed:
`T-02-U1` and `T-02-U2`. Every other item, Core and Test, remains unclaimed.

## Summary

The scope-start baseline required by T-02-S1 is captured. Implementation was initially halted because the
identifier this scope was built on is already taken by a live, different contract. The blocker analysis is
preserved verbatim below as history; the ruling that resolves it, its measured evidence, and the consent
record follow it. On that corrected basis the first increment of the fixture-proven surface is delivered:
`claimRef` as one optional field on the live `…/v2`, the dual-version reader, the ledger fixtures, and the
two unit rows `T-02-U1` and `T-02-U2` — each revert-verified against the shipped module.

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

Two Test Plan rows are executed and claimed: **T-02-U1** and **T-02-U2**. `T-02-U3`, `T-02-U4`, `T-02-F1`–`F3`,
`T-02-I1`–`I2`, `T-02-R1`–`R2` and `T-02-S1` are **not** claimed — no implementation exists to assert against,
so any result recorded for them now would be fabricated.

Suite run, 2026-08-19. The same command backs both rows; it is reproduced once and referenced by both anchors.

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


## Completion Statement

Scope 02 is **not** complete and no scope completion or certification is claimed. **Two** Definition of Done
items are claimed — the Test items for `T-02-U1` and `T-02-U2` — each backed by the run and the revert
verification recorded above. Every other item, Core and Test, is deliberately left open.

Two near-misses are recorded rather than absorbed, because each fails one conjunct only:

- **Core item "`A v1 row carrying claimRef` is rejected as an unknown field, and `v2` **still** rejects a
  field name outside its live union ∪ `{claimRef}`"** — both refusals are proven by `T-02-U2`, but *"still"*
  is a before/after claim and no pre-extension measurement was executed. Left open.
- **T-02-S1** — a clean `3074 passed, 0 failed` baseline is now recorded, but the row requires
  `baseline + N` *after* this scope's implementation lands, and this increment delivers only part of it.
  Left open.

The contract-identifier blocker recorded above remains **resolved**. The live-publisher binding remains
blocked on P-015-01 / P-015-02; nothing in this increment touches it, and no fixture-backed result here is
reported as live-publisher evidence.
