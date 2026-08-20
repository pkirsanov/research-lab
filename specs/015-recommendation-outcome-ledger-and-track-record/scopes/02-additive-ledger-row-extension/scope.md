# Scope 02: Additive ledger row extension

**Status:** In Progress
**Depends On:** 01
**Tags:** `overlay:true`, `consent-gated:002`, `routed:P-015-01`, `routed:P-015-02`
**Design section:** `design.md` → `## D2 — Additive Ledger Row Extension`
**Business Scenarios owned:** — (none; see `scopes/_index.md` → *Business-Scenario ownership map*)
**UI rows owned:** — (no rendered surface in this scope)
**Refusal codes owned:** `RTR-LEGACY-BACKFILL`

**Primary Outcome:**
The **existing live** `brief-recommendation-history-row/v2` gains **exactly one optional field**, `claimRef`,
carrying the `claimHash` minted in scope 01. No new contract version is minted. Readers accept `v1` and `v2`;
`v1` is not deprecated and no historical row is ever rewritten. The absence of `claimRef` *is* the permanent
`unresolvable-legacy` marker required by HC-4 and BP-015-002 — covering **all 1,380 committed rows**, `v1` and
`v2` alike — so nothing is null-filled, back-filled, or estimated, and `RTR-LEGACY-BACKFILL` refuses any
resolution written against a row that has no `claimRef`. `eventId` and `recommendationKey` are proven
byte-identical before and after the extension, so no existing event identifier shifts. The publisher mint hook
is wired so that a `claimRef`-bearing row and its claim object are produced in the same pass.

> **CORRECTED 2026-08-19 (R25).** This read: *"`brief-recommendation-history-row/v2` exists as a **strict
> superset** of `v1` — the same seven fields, the same semantics, plus exactly one optional `claimRef`…"*
> That premise is falsified by the committed ledger: `…/v2` is already live at
> [recommendation-body.mjs#L22](../../../../scripts/recommendation-body.mjs#L22) carrying a recommendation
> **body**, across **1,140 rows** in three shapes of 17 / 25 / 27 keys. A closed eight-field `v2` would reject
> every one of them. Ruling, evidence, options and consent record: `design.md` →
> `## Ledger-Row Contract-Version Reconciliation — Recorded 2026-08-19`.

**Scope boundary — this scope is consent-gated and partially routed.** The contract shape, the dual-version reader,
the compatibility proofs and `RTR-LEGACY-BACKFILL` are fixture-proven and schedulable now. The **live publisher
binding** — actually emitting `v2` rows against real authored actions — is blocked on Feature 002-owner consent
**and** on routed findings P-015-01 (the authored `subject` is prose, not a resolvable identifier) and P-015-02 (the
authored `horizon` vocabulary and the claim's `horizon.kind` set do not intersect). A fixture-backed pass reported as
live-publisher evidence is fabricated evidence.

---

## Scenarios

This scope owns no Business Scenario. Its `Then` clauses are the second clause of **BS-001** — *"And the ledger row
references that claim by hash"* — which scope 01 owns, plus the row-compatibility requirements FR-002 and AC-001 and
the legacy-marker requirement HC-4 / BP-015-002. The scenarios below are written in the same Gherkin form and are
traced to those requirements rather than to a BS id.

### FR-002 / AC-001: A published event carries a resolvable reference to its frozen claim

```gherkin
Scenario: A v2 row references the claim minted in the same pass (SCN-015-013)
  Given an authored action that mints a claim under brief-recommendation-claim/v1
  When the publication run writes its recommendation history rows
  Then the row declares contractVersion brief-recommendation-history-row/v2
  And the row carries claimRef equal to that claim's claimHash
  And the row's eventId and recommendationKey are byte-identical to the values the pre-extension path produced
```

### FR-002: Existing consumers are not broken by the extension

```gherkin
Scenario: A v1 row and a v2 row are both valid, and an unaware reader is unaffected (SCN-015-014)
  Given a ledger partition containing pre-contract rows of both live versions and newly written claimRef-bearing rows
  When a reader that projects only the seven v1 fields consumes the partition
  Then every row is read successfully
  And the pre-contract rows are absent claimRef rather than carrying a null
  And no historical row is rewritten, migrated, or re-hashed
```

### HC-4 / BP-015-002: Absence of a claim reference is the permanent legacy marker

```gherkin
Scenario: A resolution cannot be written against a claimless row (SCN-015-015)
  Given a ledger row that carries no claimRef because it predates the claim contract
  When a resolution is written for that row
  Then the write is refused with RTR-LEGACY-BACKFILL
  And no resolution object exists for that row
  And no predicate, outcome, or horizon is imputed for it
```

---

## Implementation Plan

1. **Add `claimRef` as an optional field to the EXISTING live `brief-recommendation-history-row/v2`.** No new
   contract version is minted. `v2` is declared as `ROW_CONTRACT_V2` at
   [recommendation-body.mjs#L22](../../../../scripts/recommendation-body.mjs#L22) and, measured over the
   committed ledger on 2026-08-19, presents a **32-key union** across 1,140 rows — **12** keys in every row,
   **20** optional. `claimRef` becomes the twenty-first optional member. Its type is an **opaque string**
   (`sha256:…`), not a nested object — matching how `stableSha` outputs are already threaded through the
   publisher ([`scripts/brief-distributed-publish.mjs#L64`](../../../../scripts/brief-distributed-publish.mjs#L64))
   and minimising the canonicalisation surface the change introduces. **CORRECTED 2026-08-19 (R26)** — this
   step read *"Declare `brief-recommendation-history-row/v2` as a strict superset of `v1`: the same seven
   fields … plus exactly one new optional field"*. That identifier was already taken; see the Primary Outcome
   correction above.
2. **Keep it one field, not three.** The outcome value, outcome class, and closure reason live in the 015-owned
   resolution object (scope 03), reachable via `claimRef` + `eventId`. The ledger row gains a **pointer**, not a
   payload — which is why adding it to `v2` rather than minting `v3` is the right ask: when another feature's
   contract must change, the correct ask is the smallest one that works, and one optional field on an
   already-optional contract is smaller than a version. **CORRECTED 2026-08-19 (R27)** — substance unchanged;
   re-anchored from a contract being minted to the live `v2`, and to the option-2 ruling.
3. **Implement the dual-version reader.** Readers accept **both** `v1` and `v2`. `v1` is not deprecated, is
   never rewritten, and no migration runs. The `v2` acceptance set is `v2`'s **live** field set — its measured
   32-key union, of which 12 are required and 20 optional — **plus** the new optional `claimRef`; a `v2` row
   is valid at 17, 25 or 27 keys today and at any of those counts plus `claimRef` after this scope. A `v1` row
   carrying `claimRef` is **rejected as an unknown field**, because `v1`'s seven-field list stays closed —
   that rejection is what keeps the version stamp meaningful, given the codebase's closed-field-list idiom
   (`hasOnlyFields` at [`rlcontracts.js#L216`](../../../../rlcontracts.js#L216), applied to closed lists such
   as `RECOMMENDATION_FIELDS` at [`#L727`](../../../../rlcontracts.js#L727)). **CORRECTED 2026-08-19 (R28)** —
   the `v1` rejection is preserved verbatim; the clause *"that rejection is the whole reason `v2` exists"* is
   withdrawn, because `v2` exists for the body contract and predates this scope.
4. **Wire the row emission at the real writer.** The recommendation rows are constructed in
   `scripts/brief-publication.mjs#L177`–`#L180` from `run.recommendationEvents`, which are themselves built in
   `scripts/brief-distributed-publish.mjs#L403`–`#L408`. The extension therefore threads `claimRef` from the mint
   step through `recommendationEvents` into the row map. **Both files are Feature 002-owned**; see the consent gate
   below.
5. **Wire the publisher mint hook.** In the same pass that builds `recommendationEvents`, mint the scope-01 claim for
   each authored action and attach its `claimHash` to the event as `claimRef`. An action the minter refuses produces
   an event **without** `claimRef` — i.e. a claimless row, `v1`- or `v2`-shaped — carrying the refusal reason into
   the resolution-side `not-evaluable` path rather than a fabricated claim.
6. **Implement `RTR-LEGACY-BACKFILL`.** A resolution write targeting a row with no `claimRef` refuses with the exact
   code. This is the mechanical form of BP-015-002: the legacy rows are not merely *not scored*, they are
   *unscoreable by construction*, and the code makes an attempt to score one fail loudly.
7. **Prove identifier stability.** `eventId` is hashed from its own object
   (`{ contractVersion, runFingerprint, recommendationKey, index }` at
   `scripts/brief-distributed-publish.mjs#L406`) — it is **not** a hash of the row — and `recommendationKey` is
   derived from `{ subject, family }` at `#L405`. Adding a row field therefore cannot perturb either. This is
   asserted, not assumed.
8. **Prove canonical ordering.** Keys canonicalise sorted, so `claimRef` lands deterministically **immediately
   after `canonicalMonth`**. On a live `v2` row its successor is **`confidence`**, not `contractVersion`, because
   `v2` carries keys `v1` does not. A consumer that reads by key name is unaffected either way, and the byte
   layout of the appended JSONL line is deterministic. **CORRECTED 2026-08-19** — this step read *"lands
   deterministically between `canonicalMonth` and `contractVersion`"*, which holds only for the `v1`-shaped row
   this scope rejects.
9. **Record the Feature 002 consent gate.** `design.md` → `## D2` → *⚠️ Ownership* requires a routed handoff to the
   Feature 002 owner, explicit recorded consent before any scope emitting a `claimRef`-bearing row is implemented,
   and the 002-owned validator's field list and version acceptance updated **by 002**, not by 015. The ask is
   **one optional field on the existing `v2`** — no version minted, no existing `v2` field touched, no `v1` row
   touched. Consent is recorded as a **standing blanket authorisation** granted 2026-08-19; its verbatim wording
   and its explicit limits — it is *not* a Feature 002 design review of the `v2` field set — are in `design.md`
   → `## Ledger-Row Contract-Version Reconciliation — Recorded 2026-08-19` → *Consent record*, and restated in
   this scope's `report.md`. The recorded fallback if consent were withheld is a fully 015-owned side-index keyed
   by `eventId` that leaves the row contract untouched at the cost of a second lookup; **it is not taken**.
   **CORRECTED 2026-08-19 (R29)** — the ask was framed as consent for a new version; it is one optional field on
   a live contract, and the grant and its limits are now recorded rather than pending.
10. **Extend the fixture substrate** at `tests/fixtures/recommendation-track-record/ledger/**` with `v1`-only,
    `v2`-only (at each of the three live key counts), and mixed partitions, plus the adversarial
    `v1`-row-carrying-`claimRef` case. One rule violated per negative fixture.
11. **Extend `tests/recommendation-track-record.unit.mjs`, `.functional.mjs`, and create
    `tests/recommendation-track-record.integration.mjs`** with this scope's named cases. Existing files are extended,
    never rewritten.

---

## Test Plan

Every negative row asserts the **exact** refusal string plus its companion field. Every compatibility row uses a
real committed partition rather than a synthetic one where the point of the row is compatibility with what is
already on disk.

| Test ID | Type | Category | Scenarios | File/Location | Description | Command | Live System | Evidence anchor |
|---|---|---|---|---|---|---|---|---|
| T-02-U1 | Unit | `unit` | FR-002, AC-001 | `tests/recommendation-track-record.unit.mjs` | A **real committed** `v2` row drawn from each of the three live shapes (17, 25 and 27 keys) validates **without** `claimRef`, and validates again **with** `claimRef` added; a `v1` row validates without it — proving `claimRef` is genuinely optional on the live contract rather than a newly required field. A reader that required `claimRef` on `v2` fails all three shapes. **CORRECTED 2026-08-19 (R30)**: previously asserted a seven-field `v2` validating with and without the field. | `node --test tests/recommendation-track-record.unit.mjs` | No | `report.md#t-02-u1` |
| T-02-U2 | Unit | `unit` | FR-002 | `tests/recommendation-track-record.unit.mjs` | A row stamped `brief-recommendation-history-row/v1` that carries `claimRef` is **rejected** as an unknown field — `v1`'s seven-field list stays closed. A row stamped `v2` carrying a field name outside `v2`'s measured 32-key union ∪ `{claimRef}` is **rejected** too, proving the addition did not turn `v2` into a permissive escape hatch that accepts any key. Both negatives fail if the reader degrades to accept-anything. **CORRECTED 2026-08-19 (R31)**: the `v1` negative is preserved verbatim; the second negative was *"a row stamped `v2` carrying an eighth unknown field"*, which every one of the 1,140 committed `v2` rows already violates, so it could never have failed for the right reason. | `node --test tests/recommendation-track-record.unit.mjs` | No | `report.md#t-02-u2` |
| T-02-U3 | Unit | `unit` | AC-001 | `tests/recommendation-track-record.unit.mjs` | `eventId` and `recommendationKey` computed for the same authored action are **byte-identical** with and without the mint hook active, proving the extension cannot perturb an existing event identifier. Recomputing either from the row would fail this row. | `node --test tests/recommendation-track-record.unit.mjs` | No | `report.md#t-02-u3` |
| T-02-U4 | Unit | `unit` | HC-4, BP-015-002 | `tests/recommendation-track-record.unit.mjs` | `RTR-LEGACY-BACKFILL` fires with its exact code when a resolution is written against a row with **no** `claimRef`, including the adversarial case where the resolution carries a complete, well-formed, plausible predicate — the imputation a permissive implementation most wants through. | `node --test tests/recommendation-track-record.unit.mjs` | No | `report.md#t-02-u4` |
| T-02-F1 | Functional | `functional` | FR-002 | `tests/recommendation-track-record.functional.mjs` | Canonical ordering: on every live `v2` shape `claimRef` serialises deterministically **immediately after `canonicalMonth`**, with `confidence` — not `contractVersion` — as its successor, because `v2` carries keys `v1` does not; two independent serialisations of the same row are byte-identical; and a seven-field projector reading a `v2` row returns exactly the seven `v1` key names. **CORRECTED 2026-08-19**: the row asserted `claimRef` lands *"between `canonicalMonth` and `contractVersion`"*, which holds only for the `v1`-shaped row this scope rejects; as written the assertion fails on all 1,140 live `v2` rows. | `node --test tests/recommendation-track-record.functional.mjs` | No | `report.md#t-02-f1` |
| T-02-F2 | Functional | `functional` | HC-4, BP-015-002 | `tests/recommendation-track-record.functional.mjs` | Absence is the marker: a pre-contract row — `v1` **or** body-`v2` — is asserted to have **no** `claimRef` key at all rather than `claimRef: null`, and the legacy classifier keys on key-absence, not on the version stamp. A classifier that accepted a null, or that inferred legacy status from `contractVersion`, would fail the row. | `node --test tests/recommendation-track-record.functional.mjs` | No | `report.md#t-02-f2` |
| T-02-F3 | Functional | `functional` | AC-001 | `tests/recommendation-track-record.functional.mjs` | A refused mint produces an event **without** `claimRef` carrying its refusal reason forward, rather than a claim with a fabricated subject or predicate — so a minter that cannot resolve a subject degrades to honestly-unscoreable instead of silently-wrong. | `node --test tests/recommendation-track-record.functional.mjs` | No | `report.md#t-02-f3` |
| T-02-I1 | Integration | `integration` | FR-002 | `tests/recommendation-track-record.integration.mjs` | **Every** row in the committed `briefs/history/recommendations/2026-07.jsonl` partition validates unchanged under the dual-version reader — `…/v1` and `…/v2` alike, at every live key count. The row count is **read from the file** rather than asserted as a literal, is asserted non-zero, and the validated count must **equal** it, so a reader that silently skipped a shape cannot pass. The partition's bytes are asserted unmodified after the read. **CORRECTED 2026-08-19 (R32)**: the two assertions are unchanged; under the superseded plan the reader accepted only the partition's 215 `v1` rows and refused the other 534, so the row could not have held. | `node --test tests/recommendation-track-record.integration.mjs` | No | `report.md#t-02-i1` |
| T-02-I2 | Integration | `integration` | FR-002, AC-001 | `tests/recommendation-track-record.integration.mjs` | A mixed partition of pre-contract rows (`v1` and body-`v2`) followed by appended `claimRef`-bearing rows round-trips through the append path with the prior bytes byte-identical, proving the extension is append-only and rewrites no history. | `node --test tests/recommendation-track-record.integration.mjs` | No | `report.md#t-02-i2` |
| T-02-R1 | Regression E2E | `e2e` | SCN-015-013, SCN-015-014, SCN-015-015 | `tests/recommendation-track-record.e2e.mjs` | **Persistent scenario regression for the three owned scenarios.** A full publish-and-append pass over a mixed fixture partition re-asserts end to end that a `v2` row references the claim minted in the same pass, that a `v1` row and a `v2` row are both valid under the dual-version reader with the seven-field projection unchanged, that the prior partition bytes are byte-identical afterwards, and that a resolution written against a claimless row still fires `RTR-LEGACY-BACKFILL` including the plausible-imputation case. The row is permanent, so a later scope that back-fills, null-fills, or migrates a legacy row fails here. | `node --test tests/recommendation-track-record.e2e.mjs` | No | `report.md#t-02-r1` |
| T-02-R2 | Regression E2E | `e2e` | SCN-015-014 | `tests/*.e2e.mjs`, `tests/*.spec.mjs` (committed suites, unfiltered) | **Broader E2E regression suite.** The repo's committed Node E2E files and the whole committed Playwright spec suite both run green after the `v2` superset and the dual-version reader land, with no pre-existing test removed, skipped, or newly failing — the unaware-reader half of SCN-015-014 proven against the repo's real readers of `briefs/history/recommendations/*.jsonl` rather than only against 015's own fixtures. | `node --test tests/*.e2e.mjs && npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome` | Yes | `report.md#t-02-r2` |
| T-02-S1 | Project check | project check | — | `scripts/selftest.mjs` (unmodified) | The repo self-test is green after the contract, the reader, the fixtures and the test cases land, at `baseline + N passed, 0 failed`, where `baseline` is the total captured immediately before this scope's first change and recorded in `report.md`, with no pre-existing assertion count decreasing. | `node scripts/selftest.mjs` | No | `report.md#t-02-s1` |

**Test Plan rows: 12.**

---

### Definition of Done

#### Core items

- [x] `claimRef` is added as **one optional field on the existing live** `brief-recommendation-history-row/v2`, typed as an opaque `sha256:…` string. No new contract version is minted, no existing `v2` field changes, and `v1` is untouched. *(Corrected 2026-08-19 (R33) from "declared as a strict superset of `v1`: same seven fields … plus exactly one optional `claimRef`".)* → evidence recorded in [`report.md#core-contract-shape`](report.md#core-contract-shape)
- [x] The dual-version reader accepts both `v1` and `v2`; the `v2` acceptance set is `v2`'s live field set plus `claimRef`; `v1` is not deprecated, no historical row is rewritten, and no migration runs. → evidence recorded in [`report.md#core-dual-version-reader`](report.md#core-dual-version-reader)
- [ ] A `v1` row carrying `claimRef` is rejected as an unknown field, and `v2` still rejects a field name outside its live union ∪ `{claimRef}`. *(Corrected 2026-08-19 (R33) from "the `v2` field list stays closed against an eighth field".)*
- [x] **BS-001 cross-reference (owned by scope 01):** a published event that minted a claim produces a row whose `claimRef` equals that claim's `claimHash`, satisfying BS-001's second `Then` clause. → evidence recorded in [`report.md#t-02-u3`](report.md#t-02-u3)
- [ ] The publisher mint hook is wired at `scripts/brief-publication.mjs#L177`–`#L180` via `run.recommendationEvents` built at `scripts/brief-distributed-publish.mjs#L403`–`#L408`, so the claim object and the `claimRef`-bearing row are produced in the same pass.
- [x] A refused mint emits an event **without** `claimRef` carrying its refusal reason, never a claim with a fabricated subject, predicate, or horizon. → evidence recorded in [`report.md#core-refused-mint`](report.md#core-refused-mint)
- [x] `RTR-LEGACY-BACKFILL` is implemented and refuses any resolution write targeting a row with no `claimRef`. → evidence recorded in [`report.md#t-02-u4`](report.md#t-02-u4)
- [x] Absence of `claimRef` is the legacy marker for **every** claimless row, `v1` and body-`v2` alike: pre-contract rows are **not** null-filled, back-filled, estimated, or migrated, and the classifier keys on key-absence rather than on a null value or on the version stamp. → evidence recorded in [`report.md#core-legacy-marker`](report.md#core-legacy-marker)
- [x] `eventId` and `recommendationKey` are proven byte-identical before and after the extension; neither is ever recomputed from the row. → evidence recorded in [`report.md#t-02-u3`](report.md#t-02-u3)
- [ ] `claimRef` canonicalises deterministically immediately after `canonicalMonth` — successor `confidence` on a live `v2` row, not `contractVersion` — and a seven-field projector reading a `v2` row returns exactly the seven `v1` key names.
- [x] **Feature 002 consent is recorded** before any code emitting a `claimRef`-bearing row is merged: the ask is one optional field on the existing `v2`, the standing blanket authorisation of 2026-08-19 and its explicit limits are captured in `report.md`, and the 002-owned validator's field list is updated **by 002**, not by 015. → evidence recorded in [`report.md#core-consent-honoured`](report.md#core-consent-honoured)
- [ ] **Routed findings P-015-01 and P-015-02 are recorded as blocking the live-publisher binding.** The live binding is not scheduled, and no fixture-backed result is reported as live-publisher evidence. If the routed decisions land during this scope, the binding is delivered; if not, the scope completes on the fixture-proven surface and the binding is re-planned.
- [x] The `design.md` → `## D2` fallback (a fully 015-owned side-index keyed by `eventId`) is recorded in `report.md` as the alternative taken if consent is withheld, so the handoff is a genuine decision rather than a demand. → recorded in [`report.md`](report.md) → *Options, for the owner decision this requires* → option 3, and re-stated in the ruling
- [x] `Number.isFinite` is used exclusively; the global `isFinite` appears nowhere in 015-authored code. → evidence recorded in [`report.md#core-hygiene`](report.md#core-hygiene)
- [x] No statistic is computed in this scope; `rlvalidation.js` is not imported here. → evidence recorded in [`report.md#core-hygiene`](report.md#core-hygiene)

#### Test items

- [x] T-02-U1 passes: a real committed `v2` row of each live shape validates with and without `claimRef`, and `v1` validates without it → evidence recorded in `report.md#t-02-u1`. — proves SCN-015-013
- [x] T-02-U2 passes: a `v1` row carrying `claimRef` is rejected, and `v2` rejects a name outside its live union ∪ `{claimRef}` → evidence recorded in `report.md#t-02-u2`.
- [x] T-02-U3 passes: `eventId` and `recommendationKey` are byte-identical with and without the mint hook → evidence recorded in `report.md#t-02-u3`.
- [x] T-02-U4 passes: `RTR-LEGACY-BACKFILL` fires on a claimless row including the plausible-imputation case → evidence recorded in `report.md#t-02-u4`. — proves SCN-015-015
- [ ] T-02-F1 passes: `claimRef` canonicalises immediately after `canonicalMonth` on every live shape and the seven-field projection is unchanged → evidence recorded in `report.md#t-02-f1`.
- [ ] T-02-F2 passes: a pre-contract row of either version has no `claimRef` key at all and the classifier keys on absence, not null → evidence recorded in `report.md#t-02-f2`.
- [ ] T-02-F3 passes: a refused mint degrades to an event without `claimRef` carrying its reason → evidence recorded in `report.md#t-02-f3`.
- [ ] T-02-I1 passes: every committed row of **both** versions validates unchanged, the count is read from the file rather than asserted as a literal and the validated count equals it, and the partition bytes are unmodified → evidence recorded in `report.md#t-02-i1`.
- [ ] T-02-I2 passes: a mixed partition round-trips append-only with prior bytes byte-identical → evidence recorded in `report.md#t-02-i2`. — proves SCN-015-014
- [ ] Scenario-specific E2E regression tests for every new/changed/fixed behavior in this scope pass — [T-02-R1] the claim-referencing `v2` row, the dual-version read with an unchanged seven-field projection, the append-only byte preservation, and `RTR-LEGACY-BACKFILL` all re-assert end to end → evidence recorded in `report.md#t-02-r1`.
- [x] Broader E2E regression suite passes unchanged — [T-02-R2] the committed Node E2E files and the whole committed Playwright spec suite are green against the extended partition, proving the repo's existing ledger readers are unaffected → evidence recorded in `report.md#t-02-r2`.
- [ ] T-02-S1 passes: `node scripts/selftest.mjs` reports `baseline + N passed, 0 failed` against the scope-start baseline captured in `report.md`, with no pre-existing assertion count decreasing → evidence recorded in `report.md#t-02-s1`.

**Test-related DoD items: 12. Test Plan rows: 12. Parity confirmed.**

#### Build Quality Gate

- [ ] Zero warnings across `node --test` output and `node scripts/selftest.mjs`; zero issues deferred, skipped, or worked around; every negative test verified to fail when the behaviour it guards is reverted; no committed ledger byte modified; `spec.md` and `design.md` unmodified by this scope; no other spec's artifacts touched.

---

### Files and surfaces this scope must not touch

| Surface | Why it is excluded |
|---|---|
| Any committed `briefs/history/**/*.jsonl` byte | The extension is append-only. No historical row is rewritten, migrated, re-hashed, or null-filled. Tests read these partitions and assert their bytes unchanged. |
| `rlcontracts.js` | Feature 002-owned, read-only. `hasOnlyFields` and the closed-field-list idiom are consumed as precedent, never modified. |
| `rlvalidation.js` | Feature 007-owned, read-only. This scope computes no statistic. |
| The 002-owned row validator's field list and version acceptance | Updated **by Feature 002** under the consent gate, not by 015. |
| `rldata.js`, `rlbrief.js`, `rlmarketaction.js` | Cache schema and Center surfaces; untouched by a ledger-row change. |
| `tools.json`, `index.html`, `rlnav.js`, `journeys.json` | Counted registries. Scope 10 only. |
| `briefs/objects/resolutions/**` | The resolution object contract is scope 03; this scope only refuses writes against claimless rows. |
| `recommendation-track-record-lab.html` | Does not exist until scope 07. |
| Any other `specs/**` directory | Specs 002, 012, 013, 014 and 016 are authored by concurrent sessions and are neither read for mutation nor written. |

---

*Educational research context only — not investment advice.*
