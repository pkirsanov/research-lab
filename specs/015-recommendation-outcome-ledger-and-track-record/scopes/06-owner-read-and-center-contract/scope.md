# Scope 06: Owner read and Center contract

**Status:** Not Started
**Depends On:** 05
**Tags:** `overlay:true`
**Design section:** `design.md` → `## D6 — Owner Read And Center Consumption`
**Business Scenarios owned:** — (none; BS-006's `When` is *"a hit rate is rendered"*, which is scope 07's DOM surface)
**UI rows owned:** — (UI-35 is owned by scope 10 per the F-015-D6-01 resolution, because registration is what makes the read visible at all)
**Refusal codes owned:** `RTR-RATE-BARE`

**Primary Outcome:**
`buildOwnerRead(scorecard)` and `buildMetrics(scorecard)` turn the frozen scorecard into a valid `rl-tool-read/v1`
object that `RLDATA.putToolRead` accepts, published into the **existing** `d.toolReads[id]` slot so the Market
Action Center's existing Brief view can render the track record **without a fifth view** (HC-3, FR-021). The owner
read is a **third rendering of the same frozen object**, never a second traversal of the ledger — which is what
makes it structurally impossible for the Center to quote a rate the tool no longer shows. Because the Center's
renderer consumes only `read`, `asOf` and `deepLink` and **never renders `metrics`**, HC-8 on the Center surface can
only be met inside the `read` string itself; `RTR-RATE-BARE` refuses a `read` carrying a percentage without its
range and its sample count in that same string. Every failing branch of the validator returns `null` silently, so
the return value is **checked** and a `null` reports `error` rather than being mistaken for a successful publish.

**Boundary with the surrounding scopes.** Scope 05 owns the model and every number in it; this scope **renders**
those numbers into two shapes and publishes one of them. Scope 07 owns the DOM and applies the same HC-8 rule
through a single rate-emitting helper. Scope 10 owns registration — until it runs, this scope's read is
contract-valid and published but is not looked up by the Center, which is a known and deliberate ordering
(F-015-D6-01), not a gap.

---

## Business Scenarios owned

None. This scope owns no `BS-*` row. Its obligations are `FR-014` / `FR-018` / `FR-019` / `FR-021`, `HC-3` / `HC-8`,
and `AC-011` / `AC-012` / `AC-016`, all of which are asserted by the Test Plan below rather than by a Gherkin
scenario. The ownership map in `scopes/_index.md` records this scope as owning zero Business Scenarios and zero UI
rows; that is deliberate and is not an authoring omission.

---

## Implementation Plan

1. **Derive `buildOwnerRead(scorecard)` from the same frozen object the page renders.** The scorecard is deep-frozen
   and produced once by scope 07's `compute()`; this function reads it and returns a plain object. It performs no
   ledger traversal, no filtering, and no arithmetic beyond formatting. If the `read` string were assembled from a
   second traversal it could drift from the page, and the Center would quote a rate the tool no longer shows —
   deriving both from one frozen object makes that class of disagreement unrepresentable.
2. **Emit the exact nine-key set and nothing else.** `RLDATA.putToolRead` (`rldata.js#L433`, exported at `#L624`,
   both verified this planning run) selects the `rl-tool-read/v1` branch on `contractVersion` (`#L436`) and then
   compares the sorted key list against
   `["asOf", "availability", "computedAt", "contractVersion", "deepLink", "freshUntil", "id", "metrics", "read"]`
   (`#L437`). A tenth key **or** a missing key returns `null`. `src.id !== id` also returns `null` at the same
   line, so the object's `id` and the call's `id` argument must both be `"recommendation-track-record-lab"`.
3. **Set `availability` from the closed enum, and resolve UXQ-4 in favour of `current`.** The validator accepts only
   `current` / `stale` / `unavailable` (`#L439`). **Zero resolved outcomes maps to `current`**: a track record with
   no closures is *computed and correct* — it is early, not broken. Reporting it `unavailable` would tell the
   Center the tool has failed while it is working exactly as designed, and would additionally force `asOf` and
   `freshUntil` to `null` (`#L444`, verified: `availability === "unavailable"` with a non-`null` `asOf` or
   `freshUntil` returns `null`), discarding the *"first resolves on …"* date the honest empty state needs.
   `unavailable` is reserved for the one case that earns it: the committed ledger could not be read at all.
4. **Populate the three temporal fields as strict ISO-8601 strings or `null`.** `asOf` is the latest resolution date
   and is `null` when zero resolved (`#L440`); `computedAt` is the ISO instant of the scorer run and is **required**
   and non-`null` (`#L441`); `freshUntil` is the next due resolution date, `null` when none (`#L442`). The validator
   accepts anything `Date.parse` can read, which is permissive; 015 emits strict ISO regardless so the string is
   unambiguous to a human reading the cache.
5. **Generate the `read` string from a fixed template keyed by sufficiency state**, exactly as `design.md` → `## D6`
   specifies — one template for `sufficient`, one for `insufficient`, one for `empty`. Each carries the derived
   unresolvable-legacy count (never a literal, HC-4) and the measurement-only disclaimer (HC-9). The `empty`
   template carries the open count, the first-resolves date and the record start; the `insufficient` template
   states plainly that **no rate is claimed** while still carrying the range and the count.
6. **Implement `RTR-RATE-BARE` against the generated string.** The `read` string is the **only** place HC-8 can be
   satisfied on the Center surface. `RLBRIEF.renderToolReads` (`rlbrief.js#L683`) consumes exactly three fields,
   verified line by line this planning run: it skips `tool.id === "market-brief"` (`#L688`), prefers the browser
   read over the snapshot (`#L689`), treats a read as available **only if `read.read` is truthy** (`#L690`), takes
   `href = value.deepLink || tool.file` (`#L694`), renders `value.asOf` as a relative age or `"as-of unknown"`
   (`#L695`), and emits `esc(value.read)` inside a `data-tkr-auto` row (`#L696`). **`metrics` is never rendered.**
   Publishing a bare rate in `read` with the range in `metrics` would satisfy the contract validator and violate the
   Outcome Contract — the Center reader would see a naked percentage. `RTR-RATE-BARE` therefore refuses a `read`
   containing a percentage without **both** an adjacent range and an adjacent count in the same string.
7. **Take two properties for free from the renderer, and record why they are free.** `esc()` at `rlbrief.js#L696`
   means the `read` string is plain text with no markup surface, so no escaping obligation lands on 015. The row
   carries `data-tkr-auto`, so `rlticker.js`'s bounded auto-scan links any ticker inside it — satisfying **FR-015**
   on the Center surface with **no change to Center code**. Neither property may be relied on silently: both are
   asserted.
8. **Build `metrics` as the machine-readable mirror, never as the sole carrier of an obligation.** It carries
   `resolvedDirectional`, `wins`, `losses`, `pointEstimate`, `rangeLow`, `rangeHigh`, `zScore`, `sufficiency`,
   `minCohortResolved`, the excluded-class counts, `openCount`, `unresolvableLegacyCount`, `recordStartDate`,
   `familyCount`, `trialCount` and `statedConfidenceBuckets`. Per **UXQ-6** the word `confidence` is reserved for a
   claim's *stated* number and is **never** used for the interval — the interval is a *range* in every key name and
   every user-facing string. The validator requires `metrics` to be a non-array object (`rldata.js#L443`).
9. **Check the return value of `putToolRead`.** Every failing branch returns `null` — a wrong key set, a bad enum, a
   non-object `metrics`, an `id` mismatch, an unparseable date. The tool must test the return and, on `null`, report
   `error` to the shared status control via `RLAPP.report` (`rlapp.js#L73`, exported `#L606`, verified) rather than
   assuming publication succeeded. A silent `null` that nobody checks is how a tool comes to believe it is
   publishing when it is not.
10. **Publish the compact contract, never the richer one.** `putToolRead` carries a **second** branch for
    `tool-model-read/v1` (`rldata.js#L449`, verified), validated by `validateToolModelRead` (`#L378`), which carries
    `recommendationEligibility` (`#L422`). A track record is a **measurement**, and a measurement surface that could
    declare itself an eligible recommendation source would be emitting exactly the advice HC-9 forbids. 015 sets
    `contractVersion: "rl-tool-read/v1"` so the first branch is taken, constructs no `recommendationEligibility`
    field on any path, and stays out of the Tier-A eligibility stream entirely.
11. **Hold FR-021 by writing only through the existing slot.** `putToolRead` deep-copies via
    `JSON.parse(JSON.stringify(src))` into `d.toolReads[id]` (`#L445`), so 015 cannot hold a live reference into
    the cache. No new top-level cache key is created; no field is added to an existing record — the nine-key set is
    closed, so adding one would be *rejected by the validator*, not merely discouraged. Claims, resolutions and
    `record-start.json` are committed repository artifacts under `briefs/`, never `localStorage`.
12. **Hold HC-3 by non-participation.** `CENTER_VIEW_IDS` is frozen at `rlmarketaction.js#L77` as
    `["brief", "portfolio", "red-alert", "journey"]`, and `RLMKT-VIEW` (`#L97`) refuses a fifth at five separate
    checkpoints. 015 writes **no** Center state, declares **no** view id, and touches **none** of `viewOrder` /
    `views` / `viewState`. It publishes a tool read like every other source tool and the Brief view renders it, so
    `RLMKT-VIEW` is never reached because 015 never approaches it.
13. **Record the deliberate ordering with respect to registration.** `renderToolReads` iterates the `tools` argument
    and looks the read up **by tool id** (`rlbrief.js#L689`), so a read whose tool is absent from `tools.json` lands
    in neither the `available` nor the `missing` bucket and is invisible. Per the F-015-D6-01 resolution, this scope
    proves FR-018 **contract compliance standalone** — `putToolRead` writes and returns regardless of registration
    — and registration is deferred to scope 10 because it mutates five counted registries with hard count
    assertions. **UI-35 is therefore scope 10's row, not this scope's**, and this scope claims no Center-visible
    evidence.
14. **Extend the fixture substrate** at `tests/fixtures/recommendation-track-record/reads/**` with one scorecard
    fixture per sufficiency state, plus adversarial read objects: a tenth key, a missing key, an `id` mismatch, an
    out-of-enum `availability`, `unavailable` with a non-`null` `asOf`, an array `metrics`, an unparseable
    `computedAt`, a `read` string with a rate and a range but no count, and a `read` string with a rate and a count
    but no range. One rule violated per negative fixture.
15. **Extend `tests/recommendation-track-record.unit.mjs`, `.functional.mjs` and `.integration.mjs`** with this
    scope's named cases. Existing files are extended, never rewritten.

---

## Test Plan

Every negative row asserts the **exact** refusal string or the exact `null` return plus its trigger. `T-06-U5` is
deliberately split into two single-omission cases, because an implementation that carries the range but drops the
count would pass a combined assertion.

| Test ID | Type | Category | Scenarios | File/Location | Description | Command | Live System | Evidence anchor |
|---|---|---|---|---|---|---|---|---|
| T-06-U1 | Unit | `unit` | — | `tests/recommendation-track-record.unit.mjs` | The emitted object carries the **exact** nine-key set (`rldata.js#L437`): a tenth key returns `null` and each of the nine removed in turn returns `null`, asserted per key rather than once. | `node --test tests/recommendation-track-record.unit.mjs` | No | `report.md#t-06-u1` |
| T-06-U2 | Unit | `unit` | — | `tests/recommendation-track-record.unit.mjs` | `id` equals `"recommendation-track-record-lab"` and equals the `id` argument; a mismatch returns `null` at `rldata.js#L437`, proving the two are not independently authored. | `node --test tests/recommendation-track-record.unit.mjs` | No | `report.md#t-06-u2` |
| T-06-U3 | Unit | `unit` | — | `tests/recommendation-track-record.unit.mjs` | **UXQ-4:** zero resolved outcomes emits `availability: "current"` with `asOf` and `freshUntil` preserved — **not** `"unavailable"`. The adversarial half asserts that `"unavailable"` with a non-`null` `asOf` or `freshUntil` returns `null` (`#L444`), which is why the wrong choice would silently discard the *"first resolves on …"* date. | `node --test tests/recommendation-track-record.unit.mjs` | No | `report.md#t-06-u3` |
| T-06-U4 | Unit | `unit` | — | `tests/recommendation-track-record.unit.mjs` | The three `read` templates render for their **own** sufficiency state and only their own; `computedAt` is always a non-`null` parseable ISO instant; `asOf`/`freshUntil` are `null` or parseable ISO; an unparseable `computedAt` returns `null` (`#L441`). | `node --test tests/recommendation-track-record.unit.mjs` | No | `report.md#t-06-u4` |
| T-06-U5 | Unit | `unit` | — | `tests/recommendation-track-record.unit.mjs` | `RTR-RATE-BARE` fires with its exact code on a `read` string carrying a percentage with a range but **no count**, and separately on one carrying a percentage with a count but **no range** — two single-omission cases, so an implementation satisfying only one half fails. A compliant `sufficient` string passes. | `node --test tests/recommendation-track-record.unit.mjs` | No | `report.md#t-06-u5` |
| T-06-U6 | Unit | `unit` | — | `tests/recommendation-track-record.unit.mjs` | **UXQ-6 vocabulary:** neither the `read` string nor any `metrics` key uses the word *confidence* for the interval; the interval is a *range* everywhere; `confidence` appears only where a claim's **stated** number is meant (`statedConfidenceBuckets`). | `node --test tests/recommendation-track-record.unit.mjs` | No | `report.md#t-06-u6` |
| T-06-U7 | Unit | `unit` | — | `tests/recommendation-track-record.unit.mjs` | `metrics` is a plain non-array object accepted at `rldata.js#L443`; an array `metrics` and a non-object `metrics` each return `null`; the derived `unresolvableLegacyCount` is carried through from the scorecard and **no numeric literal for it appears in this scope's source** (HC-4). | `node --test tests/recommendation-track-record.unit.mjs` | No | `report.md#t-06-u7` |
| T-06-F1 | Functional | `functional` | — | `tests/recommendation-track-record.functional.mjs` | `buildOwnerRead` and `buildMetrics` are **third renderings, not second computations**: every numeric value in both outputs equals the corresponding frozen scorecard field, asserted field-by-field, and neither function reads the ledger, the resolution store, or the claims store. A second traversal fails the row. | `node --test tests/recommendation-track-record.functional.mjs` | No | `report.md#t-06-f1` |
| T-06-F2 | Functional | `functional` | — | `tests/recommendation-track-record.functional.mjs` | **The `_index.md` checkpoint:** `putToolRead` returns a **non-`null`** object for all three sufficiency states, and each returned object's `read` carries a rate only when its range and sample count are in the same string. | `node --test tests/recommendation-track-record.functional.mjs` | No | `report.md#t-06-f2` |
| T-06-F3 | Functional | `functional` | — | `tests/recommendation-track-record.functional.mjs` | A `null` return is **detected and reported**: each of the seven adversarial read fixtures returns `null`, and for each the tool calls `RLAPP.report` with state `error` rather than proceeding as if publication succeeded. An implementation that ignores the return value fails every case. | `node --test tests/recommendation-track-record.functional.mjs` | No | `report.md#t-06-f3` |
| T-06-F4 | Functional | `functional` | — | `tests/recommendation-track-record.functional.mjs` | 015 publishes `rl-tool-read/v1` and **never** `tool-model-read/v1`: a source scan finds zero occurrences of `tool-model-read`, `recommendationEligibility`, and `toolId` as a published field, so the Tier-A eligibility branch at `rldata.js#L449` is never taken (HC-9). | `node --test tests/recommendation-track-record.functional.mjs` | No | `report.md#t-06-f4` |
| T-06-F5 | Functional | `functional` | — | `tests/recommendation-track-record.functional.mjs` | **FR-021 / AC-012:** after publishing, the persisted cache differs from its prior state in **exactly** `d.toolReads["recommendation-track-record-lab"]` — no new top-level key, no other record touched — and `rldata.js` is asserted byte-unmodified. Mutating the source object afterwards is asserted **not** to change the cache, proving the `#L445` deep copy is relied on rather than a live reference held. | `node --test tests/recommendation-track-record.functional.mjs` | No | `report.md#t-06-f5` |
| T-06-F6 | Functional | `functional` | — | `tests/recommendation-track-record.functional.mjs` | **HC-3 / AC-011:** a source scan of this scope finds zero writes to Center `viewOrder`, `views` or `viewState` and zero view-id declarations; `rlmarketaction.js` is byte-unmodified and `CENTER_VIEW_IDS` still has exactly four members (`#L77`); no `RLMKT-VIEW` refusal is reachable from any 015 path. | `node --test tests/recommendation-track-record.functional.mjs` | No | `report.md#t-06-f6` |
| T-06-I1 | Integration | `integration` | — | `tests/recommendation-track-record.integration.mjs` | Driving the **real** `RLBRIEF.renderToolReads` over the published read proves the Center-surface contract end to end: the row renders, it carries `esc`-ed plain text with no markup surface, it carries `data-tkr-auto`, the rendered text contains the rate **with** its range and count, and `metrics` appears **nowhere** in the output — the assertion that makes finding F-015-D6-01 load-bearing. | `node --test tests/recommendation-track-record.integration.mjs` | No | `report.md#t-06-i1` |
| T-06-I2 | Integration | `integration` | — | `tests/recommendation-track-record.integration.mjs` | The **unregistered-tool** case is asserted honestly: with the tool absent from the `tools` argument, `renderToolReads` places the read in neither the `available` nor the `missing` bucket and the read is invisible — proving registration (scope 10) is what gates UI-35, and that this scope's green evidence is contract evidence and **not** Center-visible evidence. | `node --test tests/recommendation-track-record.integration.mjs` | No | `report.md#t-06-i2` |
| T-06-P1 | Stress | `stress` | — | `tests/recommendation-track-record.stress.mjs` | **NFR Performance for the owner-read path the Center consumes.** Over a scorecard derived from a synthetic ledger an order of magnitude beyond the committed partition, `buildOwnerRead` plus `buildMetrics` plus `putToolRead` plus a real `RLBRIEF.renderToolReads` of the resulting row complete inside the spec's **full-recompute-under-2 s** budget, and the builders' cost is asserted **flat in ledger size** — the same scorecard shape built from the committed-size ledger and from the oversized one does the same work. That flatness is `T-06-F1`'s third-rendering property proven under load: a builder that re-traversed the ledger, the resolution store, or the claims store would grow with the input and fail the row. Every run is asserted to issue **zero** network requests. | `node --test tests/recommendation-track-record.stress.mjs` | No | `report.md#t-06-p1` |
| T-06-R1 | Regression E2E | `e2e` | — | `tests/recommendation-track-record.e2e.mjs` | **Persistent scenario regression for the owner-read contract.** A full publish-and-render pass re-asserts end to end that the emitted object carries the exact nine-key `rl-tool-read/v1` set, that zero resolved outcomes still maps to `availability: "current"` with its dates preserved, that `RTR-RATE-BARE` still fires on each single-omission case, that a `null` return is reported as `error` rather than mistaken for a publish, and that the real `RLBRIEF.renderToolReads` shows the rate with its range and count in one string while `metrics` appears nowhere in the output. The row is permanent, so a later scope that renders a bare rate or leaks `metrics` to the Center fails here. | `node --test tests/recommendation-track-record.e2e.mjs` | No | `report.md#t-06-r1` |
| T-06-R2 | Regression E2E | `e2e-ui` | — | `tests/*.e2e.mjs`, `tests/*.spec.mjs` (committed suites, unfiltered) | **Broader E2E regression suite.** The repo's committed Node E2E files and the whole committed Playwright spec suite both run green after the read builders land, with no pre-existing test removed, skipped, or newly failing. This is the row that proves writing through the existing `d.toolReads[id]` slot did not disturb any other tool's read, the Center's four-view composition, or the Brief view every other source tool renders into — the FR-021 / AC-012 and HC-3 guarantees asserted against the repo's real surfaces rather than only against 015's fixtures. | `node --test tests/*.e2e.mjs && npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome` | Yes | `report.md#t-06-r2` |
| T-06-S1 | Project check | project check | — | `scripts/selftest.mjs` (unmodified) | The repo self-test is green after the read builders, the fixtures and the test cases land, at `952 + N passed, 0 failed`, with no pre-existing assertion count decreasing. | `node scripts/selftest.mjs` | No | `report.md#t-06-s1` |

**Test Plan rows: 19.**

---

### Definition of Done

#### Core items

- [ ] `buildOwnerRead(scorecard)` and `buildMetrics(scorecard)` read the frozen scorecard only; neither traverses the ledger, the resolution store, or the claims store.
- [ ] The published object carries the exact nine-key `rl-tool-read/v1` set; no tenth key and no missing key.
- [ ] `id` is `"recommendation-track-record-lab"` and equals the `id` argument passed to `putToolRead`.
- [ ] `availability` is drawn from the closed enum; **zero resolved outcomes maps to `current`** (UXQ-4), and `unavailable` is used only when the committed ledger could not be read at all.
- [ ] `computedAt` is a required non-`null` ISO instant; `asOf` and `freshUntil` are strict ISO strings or `null`, and the `unavailable`-forces-`null` coupling at `rldata.js#L444` is respected.
- [ ] The three `read` templates are fixed per sufficiency state and each carries the derived legacy count and the measurement-only disclaimer.
- [ ] `RTR-RATE-BARE` is implemented and refuses a `read` string carrying a percentage without **both** its range and its sample count in the same string.
- [ ] `metrics` is a plain non-array object and is never the sole carrier of an obligation; per UXQ-6 the word *confidence* is reserved for a claim's stated number and the interval is a *range* everywhere.
- [ ] No numeric literal for the unresolvable-legacy count appears in this scope's source; it is carried through from the scorecard (HC-4).
- [ ] The return value of `putToolRead` is checked; a `null` reports `error` through `RLAPP.report` and is never mistaken for a successful publish.
- [ ] 015 publishes `rl-tool-read/v1` only; no `tool-model-read/v1` object and no `recommendationEligibility` field is constructed on any path (HC-9).
- [ ] FR-021 / AC-012 hold: the only cache mutation is the existing `d.toolReads[id]` slot, no new top-level key or record field is created, and `rldata.js` is byte-unmodified.
- [ ] HC-3 / AC-011 hold by non-participation: no Center `viewOrder` / `views` / `viewState` write and no view-id declaration; `rlmarketaction.js` is byte-unmodified.
- [ ] The deferred-registration ordering is recorded: this scope proves FR-018 contract compliance standalone, claims no Center-visible evidence, and does not own UI-35.
- [ ] `Number.isFinite` is used exclusively; the global `isFinite` appears nowhere in 015-authored code.
- [ ] No statistic is computed in this scope; every number in both outputs originates in the scope-05 scorecard.

#### Test items

- [ ] [T-06-U1] The exact nine-key set is enforced, asserted per key → evidence recorded in `report.md#t-06-u1`.
- [ ] [T-06-U2] `id` equals the argument and a mismatch returns `null` → evidence recorded in `report.md#t-06-u2`.
- [ ] [T-06-U3] Zero resolved maps to `current`, and `unavailable` with a non-`null` date returns `null` → evidence recorded in `report.md#t-06-u3`.
- [ ] [T-06-U4] Each `read` template renders for its own state and the temporal fields validate → evidence recorded in `report.md#t-06-u4`.
- [ ] [T-06-U5] `RTR-RATE-BARE` fires for a missing count and, separately, for a missing range → evidence recorded in `report.md#t-06-u5`.
- [ ] [T-06-U6] The UXQ-6 vocabulary rule holds in both the `read` string and every `metrics` key → evidence recorded in `report.md#t-06-u6`.
- [ ] [T-06-U7] `metrics` is a plain non-array object and the legacy count carries no literal → evidence recorded in `report.md#t-06-u7`.
- [ ] [T-06-F1] Both builders are third renderings of the frozen scorecard, asserted field-by-field → evidence recorded in `report.md#t-06-f1`.
- [ ] [T-06-F2] `putToolRead` returns non-`null` for all three sufficiency states with HC-8 met inside each `read` → evidence recorded in `report.md#t-06-f2`.
- [ ] [T-06-F3] Every adversarial fixture returns `null` and each `null` is reported as `error` → evidence recorded in `report.md#t-06-f3`.
- [ ] [T-06-F4] The `tool-model-read/v1` branch is never taken and no eligibility field exists → evidence recorded in `report.md#t-06-f4`.
- [ ] [T-06-F5] The cache differs in exactly one slot and the deep copy is relied on → evidence recorded in `report.md#t-06-f5`.
- [ ] [T-06-F6] No Center state is written and `CENTER_VIEW_IDS` still has four members → evidence recorded in `report.md#t-06-f6`.
- [ ] [T-06-I1] The real `renderToolReads` renders the read with HC-8 met inside `read` and `metrics` absent from the output → evidence recorded in `report.md#t-06-i1`.
- [ ] [T-06-I2] The unregistered-tool case renders nothing, proving registration gates UI-35 → evidence recorded in `report.md#t-06-i2`.
- [ ] [T-06-P1] The owner-read build plus the real Center render complete inside the 2 s full-recompute budget on an oversized ledger, builder cost is flat in ledger size, and zero network requests are issued → evidence recorded in `report.md#t-06-p1`.
- [ ] Scenario-specific E2E regression tests for every new/changed/fixed behavior in this scope pass — [T-06-R1] the exact nine-key set, the zero-resolved `current` mapping, `RTR-RATE-BARE`, the reported-`null` path, and the rendered rate carrying its range and count with `metrics` absent all re-assert end to end → evidence recorded in `report.md#t-06-r1`.
- [ ] Broader E2E regression suite passes unchanged — [T-06-R2] the committed Node E2E files and the whole committed Playwright spec suite are green, proving the single-slot cache write disturbed no other tool read, the Center's four-view composition, or the shared Brief view → evidence recorded in `report.md#t-06-r2`.
- [ ] [T-06-S1] `node scripts/selftest.mjs` reports `952 + N passed, 0 failed` with no pre-existing assertion count decreasing → evidence recorded in `report.md#t-06-s1`.

**Test-related DoD items: 19. Test Plan rows: 19. Parity confirmed.**

#### Build Quality Gate

- [ ] Zero warnings across `node --test` output and `node scripts/selftest.mjs`; zero issues deferred, skipped, or worked around; every negative test verified to fail when the behaviour it guards is reverted; `rldata.js`, `rlbrief.js`, `rlmarketaction.js` and `rlvalidation.js` byte-unmodified; `spec.md`, `design.md` and `scopes/_index.md` unmodified by this scope; no other scope directory and no other spec's artifacts touched.

---

### Files and surfaces this scope must not touch

| Surface | Why it is excluded |
|---|---|
| The persisted `rldata.js` cache schema | **Feature 013-protected (FR-021, AC-012).** This scope writes **only** through `putToolRead` into the existing `d.toolReads[id]` slot. `rldata.js` itself is consume-only and byte-unmodified: the nine-key set is closed, so extending the contract is not a local edit but a routed packet to Feature 013. |
| `rlbrief.js` `renderToolReads` | **Feature 012-owned, consume-only.** The Center renderer is driven in tests and read for its contract; it is never modified. The design consequence — that `metrics` is never rendered, so HC-8 must live inside `read` — is worked **with**, not patched around. |
| The Market Action Center four-view composition | **Feature 012-owned (`RLMKT-VIEW`).** `CENTER_VIEW_IDS` is frozen at four (`rlmarketaction.js#L77`) and refused at five checkpoints. This scope writes no `viewOrder`, `views` or `viewState`, and declares no view id. HC-3 holds by non-participation, never by negotiation. |
| `rlvalidation.js` | **Feature 007-owned, consume-only.** This scope computes no statistic and does not import it; every number it renders arrives from the scope-05 scorecard. |
| `rlcontracts.js` reducer and `CLOSE_EVENT_TYPES` | **Feature 002-owned, consume-only.** Closure counts are read from the scorecard for display; no closure is emitted and the reducer is never forked. |
| `tools.json`, `index.html`, `rlnav.js`, `journeys.json`, `simple-models.json` | **Counted registries — scope 10 only.** Registering here would leave a live nav entry pointing at an unfinished surface and would trip four hard count assertions in `scripts/validate-tool-experience.mjs`. This scope's read is contract-valid but deliberately not yet looked up. |
| `recommendation-track-record-lab.html`, `compute()`, `renderSimple`, `renderPower` | Scopes 07 and 08. This scope consumes the frozen scorecard and publishes it; it renders no DOM and creates no HTML file. |
| The scope-05 cohort model, constants, and denominator | Scope 05. This scope re-derives nothing; a number it cannot find on the scorecard is a scope-05 gap to route, never a local computation. |
| `scripts/brief-resolve-outcomes.mjs`, `briefs/objects/**`, `briefs/history/**` | Scopes 01, 02 and 04. This scope reads none of them directly — it reads the scorecard. |
| `scripts/validate-recommendation-track-record.mjs` | The consolidated validator is scope 09; this scope's single code is proven by `node --test`. |
| Any other `scopes/NN-*/` directory in this feature | Each scope owns its own directory. This scope writes only `scopes/06-owner-read-and-center-contract/`. |
| Any other `specs/**` directory | Specs 002, 012, 013, 014 and 016 are authored by concurrent sessions and are neither read for mutation nor written. |

---

*Educational research context only — not investment advice.*
