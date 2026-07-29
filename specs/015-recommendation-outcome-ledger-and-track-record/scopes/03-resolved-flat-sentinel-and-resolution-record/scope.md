# Scope 03: Resolved-flat sentinel and resolution record

**Status:** Not Started
**Depends On:** 01
**Tags:** `overlay:true`
**Design section:** `design.md` → `## D3 — Resolved-Flat Sentinel (HC-7)`
**Business Scenarios owned:** BS-004
**UI rows owned:** — (no rendered surface in this scope)
**Refusal codes owned:** `RTR-FLAT-ZERO`

**Primary Outcome:**
`brief-recommendation-resolution/v1` exists as the 015-owned record of what a claim resolved to, carrying an
`outcomeClass` from a closed six-member vocabulary, the exact unrounded `outcomeValue`, the closure event that
produced it, and a machine-readable reason code. The **zero-free array convention** is implemented: only `win` and
`loss` outcomes are fed to `rlvSummarizeOutcomes`, every element finite and strictly non-zero by construction, so
the primitive runs **unmodified** on legal input and its internally-derived `unresolved` field is structurally `0`
and is consumed-and-discarded rather than displayed. A resolved-flat outcome keeps its exact value in the resolution
object and contributes a **count**, never a number, to the primitive — so it is distinguishable from unresolved in
both the record and the summary, which is HC-7. `RTR-FLAT-ZERO` refuses any bare `0` reaching the scoring array. The
class partition is asserted, not asserted-to: the six classes plus the open count sum to the total proposed count, so
a claim cannot fall out of the accounting.

---

## Business Scenarios owned

### BS-004: A resolved-flat outcome is not reported as unresolved

```gherkin
Scenario: A resolved-flat outcome is not reported as unresolved (SCN-015-004)
  Given a claim that resolved with exactly zero magnitude
  When the outcome is recorded and summarised
  Then it is distinguishable from an unresolved claim
  And it is not silently absorbed into the unresolved count by rlvSummarizeOutcomes
```

---

## Implementation Plan

1. **Declare the closed `outcomeClass` vocabulary** as a frozen module constant:
   `win`, `loss`, `resolved-flat`, `unresolved`, `not-evaluable`, `unresolvable-legacy`. An unrecognised value
   refuses; it never passes through and is never coerced.
2. **Declare the class → contribution routing table** exactly as `design.md` → `## D3` specifies. `win` and `loss`
   contribute a **number** to the array handed to `rlvSummarizeOutcomes`; `resolved-flat`, `unresolved`,
   `not-evaluable` and `unresolvable-legacy` each contribute a **count** to the surrounding report and are withheld
   from the array. Selecting and ordering elements is **routing**, not estimation — no number is computed here.
3. **Implement the `resolved-flat` classification** against `magnitude.flatBand`, which scope 01 froze into the claim
   at proposal (`|outcomeValue| ≤ flatBand ⇒ resolved-flat`). Freezing the band at proposal is what keeps HC-6 intact:
   the boundary between "resolved flat" and "small win" cannot be tuned once the outcome is visible. On real price
   data an exactly-zero return has measure zero, so without a proposal-time band the class would never fire and HC-7
   would be vacuous.
4. **Preserve the exact value.** A flat outcome's true numeric value is stored unrounded in the resolution object.
   No sign is fabricated: nudging a flat outcome to `+ε` or `−ε` to make it land in `wins` or `losses` would
   manufacture a directional result the data does not support and would silently bias `averageWin`. Only the
   *routing* differs, never the value.
5. **Implement `RTR-FLAT-ZERO`.** A bare `0` reaching the array passed to `rlvSummarizeOutcomes` refuses with the
   exact code. This is HC-7 enforced at the source rather than downstream, because
   `rlvSummarizeOutcomes` filters wins with `value > 0` (`rlvalidation.js#L136`) and losses with `value < 0`
   (`#L137`) and then derives `unresolved` by subtraction (`#L138`) — so an exact zero is silently reported as a
   claim that was never resolved at all.
6. **Consume-and-discard the primitive's `unresolved` field.** Under this convention `summary.unresolved`
   (`rlvalidation.js#L146`) is always `0` by construction, so surfacing it would read as *"0 unresolved"* while
   genuinely unresolved claims exist — a lie. 015 renders its **own** resolver-side counts for `resolved-flat`,
   `unresolved`, `not-evaluable` and `unresolvable-legacy`. This is the one field of the primitive's result the
   scorer must read and throw away, and it is asserted rather than commented.
7. **Declare the denominator contract.** `winRate` divides by the fed array's length (`rlvalidation.js#L147`), so
   the fed array's composition **is** the published denominator:
   `resolvedDirectional = wins + losses`, and the displayed rate is `wins / resolvedDirectional`. The rate is
   labelled **"directional hit rate"**, never a bare "hit rate". Scope 05 owns the rendering of that label; this
   scope owns the array whose length defines it.
8. **Author the `brief-recommendation-resolution/v1` contract**: `contractVersion`, `claimHash`, `eventId`,
   `resolutionDate`, `closureEventType` (a `CLOSE_EVENT_TYPES` member, `rlcontracts.js#L720`), `outcomeClass`,
   `outcomeValue` (unrounded IEEE-754 double, or `null` for classes that carry no magnitude), `reasonCode`,
   `provenance`, `lifecycleBinding`, and `resolutionHash`.
9. **Implement `resolutionHash`** over exactly
   `{ contractVersion, claimHash, resolutionDate, closureEventType, outcomeClass, outcomeValue, reasonCode, provenance }`,
   **excluding** `runId` and wall-clock timestamps — identity is content, provenance is metadata, mirroring the same
   rule scope 01 applied to `claimHash`. The record is written to `briefs/objects/resolutions/<resolutionHash-hex>.json`,
   mirroring the content-addressed layout already on disk at `briefs/objects/evidence/bundles/<hex>.json`.
10. **Implement the empty-cohort guard shape.** `rlvSummarizeOutcomes` **fails on an empty array** — the same guard
    at `rlvalidation.js#L135` that rejects non-finite values also rejects `!outcomes.length`, returning
    `RLV-OUTCOME-VALUES`. This scope exposes `resolvedDirectional` so the scorer can branch **before** calling; the
    branch itself is scope 05's. A cohort in which every claim resolved flat, unresolved, or not-evaluable produces a
    zero-length directional array and must not reach the primitive at all.
11. **Implement the partition assertion.**
    `resolvedDirectional + flat + unresolved + notEvaluable + withdrawn + open + unresolvableLegacy === totalProposed`
    is a committed assertion, not a comment. A failure means a claim fell out of the accounting, which is precisely
    how a denominator gets quietly flattered.
12. **Extend the fixture substrate** at `tests/fixtures/recommendation-track-record/resolutions/**` with one fixture
    per `outcomeClass`, boundary fixtures at exactly `±flatBand` and just inside/outside it, and the adversarial
    bare-zero fixture. One rule violated per negative fixture.
13. **Extend `tests/recommendation-track-record.unit.mjs` and `.functional.mjs`** with this scope's named cases.
    Existing files are extended, never rewritten.

---

## Test Plan

Every negative row asserts the **exact** refusal string plus its companion field. The boundary rows use values a
naive `=== 0` check would let through, so an implementation that only tested exact zero fails them.

| Test ID | Type | Category | Scenarios | File/Location | Description | Command | Live System | Evidence anchor |
|---|---|---|---|---|---|---|---|---|
| T-03-U1 | Unit | `unit` | BS-004 | `tests/recommendation-track-record.unit.mjs` | `outcomeClass` assignment against `magnitude.flatBand` is correct at the boundary: a value **exactly** at `+flatBand` and at `−flatBand` classifies `resolved-flat`, and values one ulp outside classify `win` and `loss`. A `=== 0` implementation fails this row because the fixtures are non-zero. | `node --test tests/recommendation-track-record.unit.mjs` | No | `report.md#t-03-u1` |
| T-03-U2 | Unit | `unit` | BS-004 | `tests/recommendation-track-record.unit.mjs` | `RTR-FLAT-ZERO` fires with its exact code when a literal `0` is placed in the array passed to `rlvSummarizeOutcomes`, and separately when a `resolved-flat` record's `outcomeValue` is routed into the array instead of counted. | `node --test tests/recommendation-track-record.unit.mjs` | No | `report.md#t-03-u2` |
| T-03-U3 | Unit | `unit` | BS-004 | `tests/recommendation-track-record.unit.mjs` | The array handed to the primitive contains **only** `win` and `loss` outcomes, every element finite and strictly non-zero, and `rlvSummarizeOutcomes` returns `ok: true` on it — proving the primitive runs unmodified on legal input rather than being shimmed. | `node --test tests/recommendation-track-record.unit.mjs` | No | `report.md#t-03-u3` |
| T-03-U4 | Unit | `unit` | BS-004 | `tests/recommendation-track-record.unit.mjs` | `summary.unresolved` is asserted `=== 0` on a cohort that genuinely contains resolved-flat, unresolved and not-evaluable claims, and the 015-owned counts for those three are asserted **non-zero and distinct** — proving the primitive's field is consumed and discarded rather than surfaced. | `node --test tests/recommendation-track-record.unit.mjs` | No | `report.md#t-03-u4` |
| T-03-U5 | Unit | `unit` | BS-004 | `tests/recommendation-track-record.unit.mjs` | A `resolved-flat` record preserves its **exact** unrounded `outcomeValue` in the resolution object, and no `±ε` nudge, rounding, or sign is applied anywhere on the path from resolution to storage. | `node --test tests/recommendation-track-record.unit.mjs` | No | `report.md#t-03-u5` |
| T-03-U6 | Unit | `unit` | BS-004 | `tests/recommendation-track-record.unit.mjs` | The `outcomeClass` vocabulary refuses a value one character off a legal member, so a prefix or `startsWith` check fails the row; and `closureEventType` outside `CLOSE_EVENT_TYPES` (`rlcontracts.js#L720`) refuses without a local extension being created. | `node --test tests/recommendation-track-record.unit.mjs` | No | `report.md#t-03-u6` |
| T-03-F1 | Functional | `functional` | BS-004 | `tests/recommendation-track-record.functional.mjs` | `resolutionHash` is content-only: two resolutions with identical content but different `runId` and wall-clock timestamps produce the **same** hash, and changing any hashed field produces a different one. The content-addressed write to `briefs/objects/resolutions/<hex>.json` is a byte-identical no-op on repeat. | `node --test tests/recommendation-track-record.functional.mjs` | No | `report.md#t-03-f1` |
| T-03-F2 | Functional | `functional` | BS-004 | `tests/recommendation-track-record.functional.mjs` | The partition identity holds: across a mixed fixture cohort, `resolvedDirectional + flat + unresolved + notEvaluable + withdrawn + open + unresolvableLegacy === totalProposed`, and deliberately dropping one class from the accounting makes the assertion fail — so the identity is load-bearing, not decorative. | `node --test tests/recommendation-track-record.functional.mjs` | No | `report.md#t-03-f2` |
| T-03-F3 | Functional | `functional` | BS-004 | `tests/recommendation-track-record.functional.mjs` | `resolvedDirectional === 0` is reachable and correctly reported for a cohort in which every claim resolved flat, unresolved, or not-evaluable, and the primitive is **not called** in that case — asserted by proving `rlvSummarizeOutcomes` would have returned `RLV-OUTCOME-VALUES` on that empty array. | `node --test tests/recommendation-track-record.functional.mjs` | No | `report.md#t-03-f3` |
| T-03-R1 | Regression E2E | `e2e` | BS-004 (SCN-015-004) | `tests/recommendation-track-record.e2e.mjs` | **Persistent scenario regression for SCN-015-004.** A full classify-and-store pass over a mixed cohort re-asserts end to end that a resolved-flat outcome is counted as its own class and never reported as unresolved: `summary.unresolved === 0` while the 015-owned resolved-flat, unresolved and not-evaluable counts are non-zero and distinct, the exact unrounded flat value survives the content-addressed write with no nudge or rounding, `RTR-FLAT-ZERO` still fires on a bare `0` reaching the primitive's array, and the class partition identity holds over the whole result. The row is permanent, so a later scope that merges resolved-flat back into unresolved fails here. | `node --test tests/recommendation-track-record.e2e.mjs` | No | `report.md#t-03-r1` |
| T-03-R2 | Regression E2E | `e2e` | BS-004 | `tests/*.e2e.mjs`, `tests/*.spec.mjs` (committed suites, unfiltered) | **Broader E2E regression suite.** The repo's committed Node E2E files and the whole committed Playwright spec suite both run green after the outcome-class module, the resolution record and the new `briefs/objects/resolutions/` tree land, with no pre-existing test dropped, skipped, or newly failing — the proof that consuming `rlvSummarizeOutcomes` unmodified left every other `rlvalidation.js` consumer in the repo untouched. | `node --test tests/*.e2e.mjs && npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome` | Yes | `report.md#t-03-r2` |
| T-03-S1 | Project check | project check | — | `scripts/selftest.mjs` (unmodified) | The repo self-test is green after the outcome-class module, the resolution contract, the fixtures and the test cases land, at `952 + N passed, 0 failed`, with no pre-existing assertion count decreasing. | `node scripts/selftest.mjs` | No | `report.md#t-03-s1` |

**Test Plan rows: 12.**

---

### Definition of Done

#### Core items

- [ ] The closed `outcomeClass` vocabulary (`win`, `loss`, `resolved-flat`, `unresolved`, `not-evaluable`, `unresolvable-legacy`) is a frozen module constant and an unrecognised value refuses rather than passing through.
- [ ] The class → contribution routing table is implemented: `win` and `loss` contribute a number to the scoring array; the other four contribute a count and are withheld from it.
- [ ] `resolved-flat` is classified against `magnitude.flatBand` frozen into the claim at proposal, never against a band chosen at scoring time.
- [ ] A flat outcome's exact unrounded value is preserved in the resolution object; no `±ε` nudge, rounding, or fabricated sign appears anywhere on the path from resolution to storage.
- [ ] `RTR-FLAT-ZERO` is implemented and refuses a bare `0` reaching the array passed to `rlvSummarizeOutcomes`.
- [ ] The array handed to the primitive contains only finite, strictly non-zero elements, so `rlvalidation.js` runs **unmodified** — it is not shimmed, wrapped for count re-derivation, or monkey-patched, and it is not modified in any way.
- [ ] `summary.unresolved` is consumed and **discarded**; 015 renders its own counts for `resolved-flat`, `unresolved`, `not-evaluable` and `unresolvable-legacy`, and the discard is asserted rather than commented.
- [ ] The denominator contract is declared: `resolvedDirectional = wins + losses` is the fed array's length and therefore the published denominator, and the rate it produces is labelled *directional hit rate*.
- [ ] `brief-recommendation-resolution/v1` is implemented with every field named in the Implementation Plan, and `closureEventType` is validated against `CLOSE_EVENT_TYPES` (`rlcontracts.js#L720`) with no local extension created.
- [ ] `resolutionHash` covers content only and excludes `runId` and wall-clock timestamps; resolutions are written content-addressed to `briefs/objects/resolutions/<hex>.json` with a bare lowercase hex filename.
- [ ] The class partition identity is a committed assertion, not a comment, and covers every proposed call exactly once.
- [ ] `resolvedDirectional` is exposed so scope 05 can branch **before** any primitive call; this scope never calls a primitive on an empty array.
- [ ] `Number.isFinite` is used exclusively; the global `isFinite` appears nowhere in 015-authored code.
- [ ] No new statistic, estimator, interval, or discount is written in this scope; the only `RLVALID` interaction is passing a legal array to `rlvSummarizeOutcomes` and reading its result verbatim.

#### Test items

- [ ] T-03-U1 passes: boundary classification at exactly `±flatBand` and one ulp outside is correct, defeating a `=== 0` implementation → evidence recorded in `report.md#t-03-u1`.
- [ ] T-03-U2 passes: `RTR-FLAT-ZERO` fires for a literal `0` and for a mis-routed `resolved-flat` value → evidence recorded in `report.md#t-03-u2`.
- [ ] T-03-U3 passes: the fed array is finite and strictly non-zero and the primitive returns `ok: true` unmodified → evidence recorded in `report.md#t-03-u3`.
- [ ] T-03-U4 passes: `summary.unresolved === 0` while the 015-owned counts are non-zero and distinct → evidence recorded in `report.md#t-03-u4`. — proves SCN-015-004
- [ ] T-03-U5 passes: the exact unrounded flat value survives storage with no nudge, rounding, or sign applied → evidence recorded in `report.md#t-03-u5`.
- [ ] T-03-U6 passes: the `outcomeClass` and `closureEventType` vocabularies both refuse a one-character-off value → evidence recorded in `report.md#t-03-u6`.
- [ ] T-03-F1 passes: `resolutionHash` is content-only and the content-addressed write is a byte-identical no-op on repeat → evidence recorded in `report.md#t-03-f1`.
- [ ] T-03-F2 passes: the partition identity holds and fails when a class is dropped → evidence recorded in `report.md#t-03-f2`.
- [ ] T-03-F3 passes: `resolvedDirectional === 0` is reachable and the primitive is not called → evidence recorded in `report.md#t-03-f3`.
- [ ] Scenario-specific E2E regression tests for every new/changed/fixed behavior in this scope pass — [T-03-R1] the resolved-flat sentinel, the exact unrounded flat value, `RTR-FLAT-ZERO`, and the class partition identity all re-assert end to end over a mixed cohort → evidence recorded in `report.md#t-03-r1`.
- [ ] Broader E2E regression suite passes unchanged — [T-03-R2] the committed Node E2E files and the whole committed Playwright spec suite are green, proving every other `rlvalidation.js` consumer in the repo is untouched → evidence recorded in `report.md#t-03-r2`.
- [ ] T-03-S1 passes: `node scripts/selftest.mjs` reports `952 + N passed, 0 failed` with no pre-existing assertion count decreasing → evidence recorded in `report.md#t-03-s1`.

**Test-related DoD items: 12. Test Plan rows: 12. Parity confirmed.**

#### Build Quality Gate

- [ ] Zero warnings across `node --test` output and `node scripts/selftest.mjs`; zero issues deferred, skipped, or worked around; every negative test verified to fail when the behaviour it guards is reverted; `rlvalidation.js` byte-unmodified; `spec.md` and `design.md` unmodified by this scope; no other spec's artifacts touched.

---

### Files and surfaces this scope must not touch

| Surface | Why it is excluded |
|---|---|
| `rlvalidation.js` | **Feature 007-owned and MUST NOT be modified.** The module freezes its own export surface and deep-freezes every result, so there is no monkey-patch seam even if one were wanted. The HC-7 fix lives entirely on the 015 side and feeds the primitive unmodified. Any needed change is a routed packet to Feature 007, never a local patch. |
| `rlcontracts.js` | Feature 002-owned, read-only. `CLOSE_EVENT_TYPES` is consumed as a closed vocabulary; **no new closure event type such as `flat` is added** — `resolved-flat` is a classification of the *outcome*, carried in the 015-owned resolution object, while the closure event stays inside the existing vocabulary. |
| `scripts/brief-resolve-outcomes.mjs` | The resolver is scope 04. This scope defines the record it writes and the classes it assigns, not the evaluation that produces them. |
| Any committed `briefs/history/**/*.jsonl` byte | The ledger is append-only and is scope 02's surface. |
| `rldata.js`, `rlbrief.js`, `rlmarketaction.js` | Cache schema and Center surfaces; untouched by an outcome-classification change. |
| `tools.json`, `index.html`, `rlnav.js`, `journeys.json` | Counted registries. Scope 10 only. |
| `recommendation-track-record-lab.html` | Does not exist until scope 07. The sufficiency branch and every rendered label are scope 05 and scope 07. |
| Any other `specs/**` directory | Specs 002, 012, 013, 014 and 016 are authored by concurrent sessions and are neither read for mutation nor written. |

---

*Educational research context only — not investment advice.*
