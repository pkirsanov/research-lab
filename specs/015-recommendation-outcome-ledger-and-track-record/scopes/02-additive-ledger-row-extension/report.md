# Scope 02 Report: Additive ledger row extension

Evidence contract: [scope.md](scope.md), [spec.md](../../spec.md), [scope index](../_index.md), and [uservalidation.md](../../uservalidation.md).

**Evidence status:** Baseline captured; implementation halted before its first code change on a blocking
premise failure recorded below. That premise failure is **resolved** by the 2026-08-19 ruling further below,
and the plan has been corrected to match measured reality. No Definition of Done item is claimed.

## Summary

The scope-start baseline required by T-02-S1 is captured. No contract, reader, fixture, or test case was
written, because the identifier this scope was built on is already taken by a live, different contract. The
blocker analysis is preserved verbatim below as history; the ruling that resolves it, its measured evidence,
and the consent record follow it.

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
| `T-02-S1` arithmetic | **Still dependent** on the pre-existing unrelated selftest failure recorded above being resolved by its owner. |

## Test Evidence

No Test Plan row has been executed. `T-02-U1`, `T-02-U2`, `T-02-F1` and `T-02-I1` are **not** claimed: their
descriptions were corrected in this session but no implementation exists to assert against, so any result
recorded now would be fabricated.

## Completion Statement

Scope 02 remains `Not Started`. No Definition of Done item is satisfied, no scope completion is claimed, and
no certification is requested. The contract-identifier blocker recorded above is **resolved** by the
2026-08-19 ruling and the plan has been corrected to match measured repository reality; the live-publisher
binding remains blocked on P-015-01 / P-015-02. The selftest baseline required by T-02-S1 is captured and
recorded.
