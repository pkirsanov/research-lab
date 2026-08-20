# Scope 03: Resolved-flat sentinel and resolution record

**Status:** In Progress
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
3. **Implement the `resolved-flat` classification** against `magnitude.flatBand`, which scope 01 mints into the claim
   at proposal (`|outcomeValue| ≤ flatBand ⇒ resolved-flat`). Freezing the band at proposal is what keeps HC-6 intact:
   the boundary between "resolved flat" and "small win" cannot be tuned once the outcome is visible. On real price
   data an exactly-zero return has measure zero, so without a proposal-time band the class would never fire and HC-7
   would be vacuous.

   **Corrected 2026-08-20 — the band is minted but NOT validated.** `magnitude.flatBand` is written by
   `rlclaims.js#L678` as `Number.isFinite(claimInput.flatBand) ? claimInput.flatBand : null`, and
   `evaluateMintReason` never inspects it, so a claim can be **evaluable** (`notEvaluable === null`) while its band
   is `null`. This scope therefore **asserts the band as a precondition and refuses**; it does **not** classify
   against a degenerate band and it does **not** supply one. Supplying a default here would be the HC-6 violation
   this scope exists to prevent: `magnitude` is a hashed term (`rlclaims.js#L73-76`), so a scoring-time band sits
   outside the content address and the same `claimHash` could yield a different `outcomeClass` on a later run. The
   mint-side fix is routed to scope 01 as **F-015-03-01**; see `report.md` → the 2026-08-20 ruling.
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
   `resolutionDate`, `closureEventType` (a `CLOSE_EVENT_TYPES` member, `rlcontracts.js#L726`), `outcomeClass`,
   `outcomeValue` (unrounded IEEE-754 double, or `null` for classes that carry no magnitude), `reasonCode`,
   `provenance`, `lifecycleBinding`, and `resolutionHash`.

   **Corrected 2026-08-20 — `CLOSE_EVENT_TYPES` is private and cannot be imported.** It is a module-internal
   `var` at `rlcontracts.js#L726` (not `#L720`, which is `ACTION_DIRECTION`) and is absent from that module's
   20-member export surface. The vocabulary is obtained by the pattern scope 01 already established and proved for
   the equally-private `MARKET_ACTIONS`/`ACTION_DIRECTION` (`rlclaims.js#L290-336`): read the frozen literal out of
   `rlcontracts.js`'s own **source text** so exactly one definition exists in the repository, and **throw** if it
   moves or changes shape rather than scoring against a stale vocabulary. A second local copy is the shadowing this
   scope's DoD forbids, and is what the plan would otherwise have produced.
9. **Implement `resolutionHash`** over exactly
   `{ contractVersion, claimHash, resolutionDate, closureEventType, outcomeClass, outcomeValue, reasonCode, provenance }`,
   **excluding** `runId` and wall-clock timestamps — identity is content, provenance is metadata, mirroring the same
   rule scope 01 applied to `claimHash`. The record is written to `briefs/objects/resolutions/<resolutionHash-hex>.json`,
   at the same single-level depth as scope 01's `CLAIM_STORE_DIR` (`briefs/objects/claims`, `rlclaims.js#L163`) and
   under the same bare-lowercase-hex filename convention already on disk at `briefs/objects/evidence/bundles/<hex>.json`
   (136 committed objects). **Corrected 2026-08-20:** the evidence store is two levels deep, so it is the naming
   precedent, not the depth precedent; the claim store is the depth precedent.

   **Corrected 2026-08-20 — every resolution write passes scope 02's gate first.** `authorizeResolutionWrite(row,
   resolution)` (`rlclaims.js#L551`) is the `RTR-LEGACY-BACKFILL` seam scope 02 landed, and its own comment names
   this scope: *"Scope 03 owns the resolution OBJECT; this owns the single question of whether the target row may be
   resolved at all."* Its rule order is load-bearing — the legacy check runs **before** the resolution is inspected,
   so no property of a well-formed resolution can rescue a claimless row. This scope calls it and never re-implements
   or bypasses it.
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

    **Corrected 2026-08-20 — degenerate-band fixtures are also required.** All 23 committed claim input fixtures
    carry `flatBand: 0.25`; **none** carries a null, absent, negative, zero, or non-numeric band. A substrate in
    which every band is well-formed cannot detect the degradation named in step 3, so this scope adds fixtures for
    band `null`/absent, band negative, band `0`, and band non-numeric (a string). Without them T-03-U1 passes
    against a classifier that silently coerces, which is the exact vacuity T-03-U1 exists to defeat.
13. **Extend `tests/recommendation-track-record.unit.mjs`, `.functional.mjs` and `.e2e.mjs`** with this scope's named
    cases. All three exist already (968 / 399 / 635 lines) and are extended, never rewritten. **Corrected
    2026-08-20:** the `.e2e.mjs` file was omitted from this step although T-03-R1 targets it.

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
| T-03-U6 | Unit | `unit` | BS-004 | `tests/recommendation-track-record.unit.mjs` | The `outcomeClass` vocabulary refuses a value one character off a legal member, so a prefix or `startsWith` check fails the row; and `closureEventType` outside `CLOSE_EVENT_TYPES` (`rlcontracts.js#L726`) refuses. The vocabulary is asserted to have been read from `rlcontracts.js`'s own source text, not from a local copy: the row fails if the six members are shadowed anywhere in 015-authored code. | `node --test tests/recommendation-track-record.unit.mjs` | No | `report.md#t-03-u6` |
| T-03-U7 | Unit | `unit` | BS-004 | `tests/recommendation-track-record.unit.mjs` | **Added 2026-08-20 (F-015-03-01).** A degenerate `magnitude.flatBand` is refused, never classified against. For each of band `null`, band absent, band negative, band `0`, and band non-numeric, the classifier refuses with its exact code and **no** `outcomeClass` is assigned. The row is written against a claim whose `notEvaluable` is `null` — i.e. one the mint currently calls evaluable — so it fails against an implementation that evaluates `Math.abs(outcomeValue) <= flatBand` directly: `Math.abs(0) <= null` is `true` and `Math.abs(1e-320) <= null` is `false`, which is the `=== 0` behaviour T-03-U1 exists to defeat, reached without any `=== 0` being written. | `node --test tests/recommendation-track-record.unit.mjs` | No | `report.md#t-03-u7` |
| T-03-F1 | Functional | `functional` | BS-004 | `tests/recommendation-track-record.functional.mjs` | `resolutionHash` is content-only: two resolutions with identical content but different `runId` and wall-clock timestamps produce the **same** hash, and changing any hashed field produces a different one. The content-addressed write to `briefs/objects/resolutions/<hex>.json` is a byte-identical no-op on repeat. | `node --test tests/recommendation-track-record.functional.mjs` | No | `report.md#t-03-f1` |
| T-03-F2 | Functional | `functional` | BS-004 | `tests/recommendation-track-record.functional.mjs` | The partition identity holds: across a mixed fixture cohort, `resolvedDirectional + flat + unresolved + notEvaluable + withdrawn + open + unresolvableLegacy === totalProposed`, and deliberately dropping one class from the accounting makes the assertion fail — so the identity is load-bearing, not decorative. | `node --test tests/recommendation-track-record.functional.mjs` | No | `report.md#t-03-f2` |
| T-03-F3 | Functional | `functional` | BS-004 | `tests/recommendation-track-record.functional.mjs` | `resolvedDirectional === 0` is reachable and correctly reported for a cohort in which every claim resolved flat, unresolved, or not-evaluable, and the primitive is **not called** in that case — asserted by proving `rlvSummarizeOutcomes` would have returned `RLV-OUTCOME-VALUES` on that empty array. | `node --test tests/recommendation-track-record.functional.mjs` | No | `report.md#t-03-f3` |
| T-03-R1 | Regression E2E | `e2e` | BS-004 (SCN-015-004) | `tests/recommendation-track-record.e2e.mjs` | **Persistent scenario regression for SCN-015-004.** A full classify-and-store pass over a mixed cohort re-asserts end to end that a resolved-flat outcome is counted as its own class and never reported as unresolved: `summary.unresolved === 0` while the 015-owned resolved-flat, unresolved and not-evaluable counts are non-zero and distinct, the exact unrounded flat value survives the content-addressed write with no nudge or rounding, `RTR-FLAT-ZERO` still fires on a bare `0` reaching the primitive's array, and the class partition identity holds over the whole result. The row is permanent, so a later scope that merges resolved-flat back into unresolved fails here. | `node --test tests/recommendation-track-record.e2e.mjs` | No | `report.md#t-03-r1` |
| T-03-R2 | Regression E2E | `e2e` | BS-004 | `tests/*.e2e.mjs`, `tests/*.spec.mjs` (committed suites, unfiltered) | **Broader E2E regression suite.** The repo's committed Node E2E files and the whole committed Playwright spec suite both run green after the outcome-class module, the resolution record and the new `briefs/objects/resolutions/` tree land, with no pre-existing test dropped, skipped, or newly failing — the proof that consuming `rlvSummarizeOutcomes` unmodified left every other `rlvalidation.js` consumer in the repo untouched. | `node --test tests/*.e2e.mjs && npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome` | Yes | `report.md#t-03-r2` |
| T-03-S1 | Project check | project check | — | `scripts/selftest.mjs` (unmodified) | The repo self-test is green after the outcome-class module, the resolution contract, the fixtures and the test cases land, at `baseline + N passed, 0 failed`, where `baseline` is the total captured immediately before this scope's first change and recorded in `report.md`. **Corrected 2026-08-20:** the baseline MUST be captured on a **clean worktree with dependencies installed**. Scope 02's report records `3074 passed, 0 failed` clean versus `1 failed` on a tree carrying a concurrent session's uncommitted `specs/007-*` / `specs/008-*` edits; capturing on a dirty tree bakes another session's failure into this scope's baseline. No pre-existing assertion count may decrease. | `node scripts/selftest.mjs` | No | `report.md#t-03-s1` |

**Test Plan rows: 13.** *(12 before the 2026-08-20 correction; T-03-U7 added.)*

---

### Definition of Done

#### Core items

- [x] The closed `outcomeClass` vocabulary (`win`, `loss`, `resolved-flat`, `unresolved`, `not-evaluable`, `unresolvable-legacy`) is a frozen module constant and an unrecognised value refuses rather than passing through. → evidence recorded in [`report.md#core-outcome-vocabulary`](report.md#core-outcome-vocabulary)
- [x] The class → contribution routing table is implemented: `win` and `loss` contribute a number to the scoring array; the other four contribute a count and are withheld from it. → evidence recorded in [`report.md#core-routing-table`](report.md#core-routing-table)
- [x] `resolved-flat` is classified against `magnitude.flatBand` frozen into the claim at proposal, never against a band chosen at scoring time. → evidence recorded in [`report.md#core-flat-band-frozen`](report.md#core-flat-band-frozen)
- [x] **(Corrected 2026-08-20, F-015-03-01)** A finite, strictly positive `magnitude.flatBand` is asserted as a **precondition** before any classification, and a degenerate band (`null`, absent, negative, `0`, non-numeric) **refuses**. This scope never supplies, defaults, substitutes, or coerces a band — doing so would put the boundary outside the `claimHash` and break HC-6. The mint-side validation is routed to scope 01 and is **not** implemented here. → evidence recorded in [`report.md#core-flat-band-precondition`](report.md#core-flat-band-precondition)
- [x] **(Corrected 2026-08-20)** Every resolution write passes `authorizeResolutionWrite` (`rlclaims.js#L551`) before the object is stored; the `RTR-LEGACY-BACKFILL` gate is called, never re-implemented and never bypassed. → evidence recorded in [`report.md#core-write-gate`](report.md#core-write-gate)
- [x] A flat outcome's exact unrounded value is preserved in the resolution object; no `±ε` nudge, rounding, or fabricated sign appears anywhere on the path from resolution to storage. → evidence recorded in [`report.md#core-exact-value`](report.md#core-exact-value)
- [x] `RTR-FLAT-ZERO` is implemented and refuses a bare `0` reaching the array passed to `rlvSummarizeOutcomes`. → evidence recorded in [`report.md#core-flat-zero`](report.md#core-flat-zero)
- [x] The array handed to the primitive contains only finite, strictly non-zero elements, so `rlvalidation.js` runs **unmodified** — it is not shimmed, wrapped for count re-derivation, or monkey-patched, and it is not modified in any way. → evidence recorded in [`report.md#core-primitive-unmodified`](report.md#core-primitive-unmodified)
- [x] `summary.unresolved` is consumed and **discarded**; 015 renders its own counts for `resolved-flat`, `unresolved`, `not-evaluable` and `unresolvable-legacy`, and the discard is asserted rather than commented. → evidence recorded in [`report.md#core-unresolved-discarded`](report.md#core-unresolved-discarded)
- [ ] The denominator contract is declared: `resolvedDirectional = wins + losses` is the fed array's length and therefore the published denominator, and the rate it produces is labelled *directional hit rate*.
- [x] `brief-recommendation-resolution/v1` is implemented with every field named in the Implementation Plan, and `closureEventType` is validated against `CLOSE_EVENT_TYPES` (`rlcontracts.js#L726`) read from that module's own source text — the constant is private and absent from its 20-member export surface, so no local copy of the six members exists anywhere in 015-authored code. → evidence recorded in [`report.md#core-resolution-contract`](report.md#core-resolution-contract)
- [x] `resolutionHash` covers content only and excludes `runId` and wall-clock timestamps; resolutions are written content-addressed to `briefs/objects/resolutions/<hex>.json` with a bare lowercase hex filename. → evidence recorded in [`report.md#core-resolution-hash`](report.md#core-resolution-hash)
- [x] The class partition identity is a committed assertion, not a comment, and covers every proposed call exactly once. → evidence recorded in [`report.md#core-partition`](report.md#core-partition)
- [x] `resolvedDirectional` is exposed so scope 05 can branch **before** any primitive call; this scope never calls a primitive on an empty array. → evidence recorded in [`report.md#core-resolved-directional`](report.md#core-resolved-directional)
- [x] `Number.isFinite` is used exclusively; the global `isFinite` appears nowhere in 015-authored code. → evidence recorded in [`report.md#core-hygiene`](report.md#core-hygiene)
- [x] No new statistic, estimator, interval, or discount is written in this scope; the only `RLVALID` interaction is passing a legal array to `rlvSummarizeOutcomes` and reading its result verbatim. → evidence recorded in [`report.md#core-hygiene`](report.md#core-hygiene)

#### Test items

- [x] T-03-U1 passes: boundary classification at exactly `±flatBand` and one ulp outside is correct, defeating a `=== 0` implementation → evidence recorded in `report.md#t-03-u1`.
- [x] T-03-U2 passes: `RTR-FLAT-ZERO` fires for a literal `0` and for a mis-routed `resolved-flat` value → evidence recorded in `report.md#t-03-u2`.
- [x] T-03-U3 passes: the fed array is finite and strictly non-zero and the primitive returns `ok: true` unmodified → evidence recorded in `report.md#t-03-u3`.
- [x] T-03-U4 passes: `summary.unresolved === 0` while the 015-owned counts are non-zero and distinct → evidence recorded in `report.md#t-03-u4`. — proves SCN-015-004
- [x] T-03-U5 passes: the exact unrounded flat value survives storage with no nudge, rounding, or sign applied → evidence recorded in `report.md#t-03-u5`.
- [x] T-03-U6 passes: the `outcomeClass` and `closureEventType` vocabularies both refuse a one-character-off value, and the closure vocabulary is proven to be read from `rlcontracts.js` source rather than shadowed → evidence recorded in `report.md#t-03-u6`.
- [x] T-03-U7 passes: a degenerate `flatBand` (`null`, absent, negative, `0`, non-numeric) refuses on a claim the mint calls evaluable, and no `outcomeClass` is assigned → evidence recorded in `report.md#t-03-u7`.
- [ ] T-03-F1 passes: `resolutionHash` is content-only and the content-addressed write is a byte-identical no-op on repeat → evidence recorded in `report.md#t-03-f1`.
- [ ] T-03-F2 passes: the partition identity holds and fails when a class is dropped → evidence recorded in `report.md#t-03-f2`.
- [ ] T-03-F3 passes: `resolvedDirectional === 0` is reachable and the primitive is not called → evidence recorded in `report.md#t-03-f3`.
- [ ] Scenario-specific E2E regression tests for every new/changed/fixed behavior in this scope pass — [T-03-R1] the resolved-flat sentinel, the exact unrounded flat value, `RTR-FLAT-ZERO`, and the class partition identity all re-assert end to end over a mixed cohort → evidence recorded in `report.md#t-03-r1`.
- [ ] Broader E2E regression suite passes unchanged — [T-03-R2] the committed Node E2E files and the whole committed Playwright spec suite are green, proving every other `rlvalidation.js` consumer in the repo is untouched → evidence recorded in `report.md#t-03-r2`.
- [ ] T-03-S1 passes: `node scripts/selftest.mjs` reports `baseline + N passed, 0 failed` against the scope-start baseline captured in `report.md`, with no pre-existing assertion count decreasing → evidence recorded in `report.md#t-03-s1`.

**Test-related DoD items: 13. Test Plan rows: 13. Parity confirmed.** *(12 / 12 before the 2026-08-20 correction.)*

#### Build Quality Gate

- [ ] Zero warnings across `node --test` output and `node scripts/selftest.mjs`; zero issues deferred, skipped, or worked around; every negative test verified to fail when the behaviour it guards is reverted; `rlvalidation.js` byte-unmodified; `spec.md` and `design.md` unmodified by this scope; no other spec's artifacts touched.

---

### Files and surfaces this scope must not touch

| Surface | Why it is excluded |
|---|---|
| `rlvalidation.js` | **Feature 007-owned and MUST NOT be modified.** The module freezes its own export surface and deep-freezes every result, so there is no monkey-patch seam even if one were wanted. The HC-7 fix lives entirely on the 015 side and feeds the primitive unmodified. Any needed change is a routed packet to Feature 007, never a local patch. |
| `rlclaims.js` | **Added 2026-08-20.** Scope 01-owned and **Done**. The `magnitude.flatBand` validation gap (F-015-03-01) is a defect in its minted output and MUST be fixed there under scope 01's own DoD and fixture coverage — not patched from this scope. Adding an eighth `MINT_REFUSALS` member from here would fail the existing scope-01 assertion at `tests/recommendation-track-record.e2e.mjs#L363`, which requires every closed reason to fire for exactly the fixtures that declare it. This scope **consumes** `rlclaims.js` (`authorizeResolutionWrite`, `CLAIM_STORE_DIR`, `HASHED_TERMS`) and modifies no byte of it. |
| `rlcontracts.js` | Feature 002-owned, read-only. `CLOSE_EVENT_TYPES` is consumed as a closed vocabulary; **no new closure event type such as `flat` is added** — `resolved-flat` is a classification of the *outcome*, carried in the 015-owned resolution object, while the closure event stays inside the existing vocabulary. |
| `scripts/brief-resolve-outcomes.mjs` | The resolver is scope 04. This scope defines the record it writes and the classes it assigns, not the evaluation that produces them. |
| Any committed `briefs/history/**/*.jsonl` byte | The ledger is append-only and is scope 02's surface. |
| `rldata.js`, `rlbrief.js`, `rlmarketaction.js` | Cache schema and Center surfaces; untouched by an outcome-classification change. |
| `tools.json`, `index.html`, `rlnav.js`, `journeys.json` | Counted registries. Scope 10 only. |
| `recommendation-track-record-lab.html` | Does not exist until scope 07. The sufficiency branch and every rendered label are scope 05 and scope 07. |
| Any other `specs/**` directory | Specs 002, 012, 013, 014 and 016 are authored by concurrent sessions and are neither read for mutation nor written. |

---

*Educational research context only — not investment advice.*
