# Scope 07: Simple view and shared shell

**Status:** Not Started
**Depends On:** 05
**Tags:** `overlay:true`
**Design section:** `design.md` → `## D7 — UI Component Design`
**Business Scenarios owned:** BS-006, BS-012
**UI rows owned:** UI-01 … UI-18, UI-27, UI-28, UI-29, UI-30, UI-31, UI-32, UI-33 (**25 rows**)
**Refusal codes owned:** — (none of its own; it applies scope 06's `RTR-RATE-BARE` at the DOM level, and it builds the exhaustive-`title` mechanism that makes scope 09's `RTR-ACTION-EMITTED` scan checkable)

**Primary Outcome:**
`recommendation-track-record-lab.html` exists as a single self-contained, build-free, GitHub-Pages-deployable page
carrying the shared shell and the **default** Simple view: a decision-first cockpit with one verdict and five
steerable levers that re-slice the same resolved ledger live, in memory, with no fetch. A **single**
`compute(MODEL, state)` produces **one deep-frozen `scorecard`**; `renderSimple`, `buildOwnerRead` and
`buildMetrics` are three renderings of that one object and none of them recomputes anything. HC-8 is enforced at the
DOM level rather than by copy review: exactly one rate-emitting helper exists, and it writes a `[data-rate]` element
only as a sibling of a `[data-range]` and a `[data-n]` in the same block — there is no second code path that can
print a percentage. FR-016 and HC-9 are delivered by **one** mechanism: exhaustive contextual `title` coverage over
every element matching `rlg.js`'s `GLOSSARY_SELECTOR`, because `decorate()` returns early on an element that
already carries a `title`, so full FR-016 compliance makes the shared glossary's trading vocabulary structurally
unable to land on this surface.

**Boundary with the surrounding scopes.** Scope 05 owns the model — the levers' semantics, the primitives, the
denominator, the sufficiency rule, the bounds, the derived legacy count. This scope owns the **page**: the scaffold,
the load order, `compute()`, the frozen scorecard, `renderSimple`, the mode mechanism, the persisted UI state, and
the honesty furniture (`#coverageLine`, `#noAdviceNotice`) that sits **outside** both view containers so it cannot
be per-state duplicated or per-state dropped. Scope 08 owns every Power panel and every canvas; this scope renders
**zero** `<canvas>` and establishes the shell those panels reuse.

---

## Business Scenarios owned

### BS-006: A hit rate is never shown without its interval

```gherkin
Scenario: A hit rate is never shown without its interval (SCN-015-006)
  Given a cohort with at least one resolved outcome
  When a hit rate is rendered
  Then its Wilson interval and its sample count are rendered with it
  And a cohort below the declared minimum size renders an explicit insufficient-sample state
```

### BS-012: The tool emits no action

```gherkin
Scenario: The tool emits no action (SCN-015-012)
  Given any state of the track record
  When the tool renders
  Then it emits no order, no position size, no allocation, and no recommendation to act
  And it states that it is a measurement surface, educational only
```

---

## Implementation Plan

1. **Create `recommendation-track-record-lab.html`** as one self-contained HTML file with an inline model and no
   build step (NFR Portability). It joins the repo's existing single-file tool family and introduces no bundler, no
   framework, and no new runtime.
2. **Set the shared-shell load order, with `rlcontext.js` first.** Per the F-015-D7-02 resolution the D6 list is
   amended: `rlcontext.js`, `rlg.js`, `rldata.js`, `rlvalidation.js`, `rlticker.js`, `rlchart.js`, `rlapp.js`,
   `rlnav.js` — all `defer`, so execution order is document order. **FR-014's constraint binds the
   `rldata.js` → `rlapp.js` → `rlnav.js` trio**, which this order satisfies; `rlcontext.js` is an addition ahead of
   it, not a contradiction. `rlcontext.js` is not optional: `validateStructuredAdapter` returns
   `fail("RLCTX validator unavailable", "$.contextFor")` when `root.RLCTX.validateContext` is absent
   (`rlchart.js#L98`) and is called **synchronously** inside `attachStructured` (`#L317`); `rlg.js`'s lazy load of
   `rlcontext.js` (`#L229`) is asynchronous and demand-driven and cannot be relied on. Precedent verified this
   planning run: `market-heatmap-lab.html` loads `rlcontext.js` at `#L412`, two lines ahead of `rldata.js` at
   `#L414`. `rlvalidation.js` sits after `rldata.js` and before the inline model because it is dependency-free but
   the model depends on it.
3. **Implement `compute(MODEL, state)` as the single computation.** It is **pure and synchronous**, performs no
   I/O, and returns one **deep-frozen** `scorecard` carrying `cohortLabel`, `sufficiency`, `resolvedDirectional`,
   `wins`, `losses`, `summary`, `interval`, `distribution`, `closureMix`, `withdrawnBounds`, `coverage`,
   `calibration` and `multiplicity` — every field either a count 015 owns or a value returned verbatim by a named
   `RLVALID` primitive via the scope-05 model. Because it is pure, a lever change costs one function call over data
   already in memory, which is what makes UI-06's *"no new network request is recorded"* structurally true rather
   than merely observed, and puts the < 2 s full-recompute NFR comfortably in reach.
4. **Build the component tree exactly as `design.md` → `## D7` pins it**, because the DOM ids *are* the contract the
   UI Scenario Matrix asserts against: `#noAdviceNotice`, `#modeSeg`; `#levers` with `select#leverCohort` /
   `#leverBucket` / `#leverHorizon` / `#leverFamily` / `#leverWindow`; `#blockRight` with `#verdictState`,
   `#verdictBody`, `#rangeBand` (containing `#rangeLow`, `#rangeHigh` and `#pointEstimate` **inside** it, never
   beside it), `#sampleCount`, `#precisionRead`, `#precisionToGo`; `#blockSep`; `#blockPaid` with `#avgWin`,
   `#avgLoss`, `#expectedValue`; `#closureMix` with `#denominatorNote` and `#withdrawnBound`; `#openClaims`; and
   `#coverageLine` with `#legacyWhy`. `#coverageLine` and `#noAdviceNotice` sit **outside** both view containers,
   which is how UI-12 (*present in all of empty, insufficient, sufficient, Power*) and UI-33 hold without per-state
   duplication.
5. **Render the three verdict states as one branch, taken before any primitive runs.** `empty` →
   `No resolved calls yet`, **zero** `[data-rate]` elements, no range, no primitive called. `insufficient` →
   `Not enough data yet`, zero `[data-rate]`, **the range is still drawn**, wider and visibly so, with a countdown
   to the minimum. `sufficient` → the rate, with the range as the dominant element and the point estimate marked
   inside it. Suppressing the range in the `insufficient` state would teach a reader that a missing range means
   "not applicable" rather than "very uncertain" — the exact misreading BP-015-003 exists to prevent.
6. **Enforce HC-8 at the DOM level through a single rate-emitting helper.** One helper writes a `[data-rate]`
   element **only** as a sibling of a `[data-range]` and a `[data-n]` in the same block; there is no second code
   path that can print a percentage. This is scope 06's `RTR-RATE-BARE` applied to the DOM instead of to the `read`
   string, and it is the mechanism UI-03 asserts. Per the Honest-State Vocabulary, headline copy says **range**,
   never *confidence interval*: *confidence* is reserved for a claim's stated number.
7. **Implement the mode mechanism on the repo's established pattern.** `#modeSeg` carries `role="tablist"` and
   `button[data-mode]` children (precedent verified: `sector-research-lab.html#L1196`); `applyMode()` calls
   `document.body.classList.toggle('power', state.mode === 'power')` and sets `aria-selected` per button
   (`#L3123`–`#L3128`); the click handler sets state, saves, and re-renders (`#L3373`). **Simple is the default**,
   and `applyMode()` runs **before first paint** so the reader never sees a flash of the wrong view. Power-only
   panels carry `class="panel pw"` and are hidden by `body:not(.power) .pw { display:none }`.
8. **Persist UI state under its own key, outside `rlData`.** `localStorage.rlTrackRecordLab` holds
   `{ mode, cohort, bucket, horizon, family, window }` — the same shape and mechanism the reference tools use
   (precedent verified: `intraday-tape-lab.html#L1379` persists a `mode`-bearing object). Keeping it outside
   `rlData` is what makes FR-021 hold. **No derived statistic is ever persisted**, so a stale cache can never
   surface a number the current ledger does not support.
9. **Wire the five levers to re-render only.** A lever change calls `render()` against the in-memory `MODEL`; it
   never fetches. `leverFamily` binds to `claim.actionFamily` per the F-015-D5-01 resolution. Changing a lever
   updates, in the same frame: the verdict state and copy, the range and point marker, the sample count and range
   width, the precision read, the payoff block, the closure mix, the withdrawal bounds, and the cohort-scoped
   portion of the coverage line. The pre-contract unscoreable count and the record start date do **not** change,
   because no cohort selection can alter them. The rejected levers stay rejected: no withdrawn-counts-as-losses
   toggle, no legacy-at-estimated-rate option, no hide-not-evaluable control, no confidence-level selector, no
   size/allocation/target control, and no dismiss on the coverage line.
10. **Auto-hydrate, cache-first and delta-only (FR-013).** No fetch, load, or run control exists anywhere on the
    surface — UI-29 asserts zero `button[data-action="fetch"]`. Boot order: restore `state` and apply `body.power`
    **before** first paint; read committed artifacts and the shared cache and paint immediately from whatever is
    present — **including the honest `empty` state, which is a correct first paint, not a loading placeholder**;
    then refresh only the delta (bars for subjects in the currently rendered cohort that are missing or stale) and
    re-render.
11. **Report every resource through the shared status control (FR-014).** `RLAPP.report(resource, state, detail)`
    (`rlapp.js#L73`, exported `#L606`, verified) is called for `ledger:recommendations`, `claims`, `resolutions`
    and `bars:<SYM>`, using the shell's existing vocabulary. **A cached read reports `stale`, never `fresh`**
    (UI-30), and a `putToolRead` returning `null` reports `error` (scope 06).
12. **Link every ticker (FR-015).** Explicit values go through `RLTKR.tag(ticker, opts)` (`rlticker.js#L112`,
    exported `#L122`); containers that emit symbols inside prose carry `data-tkr-auto` and are bounded-auto-scanned
    (`#L194`, `#L218`) and re-scanned on DOM mutation by the module's `MutationObserver` (`#L252`) — all verified
    this planning run. **No bare ticker may survive either path**, and because the levers re-render the page the
    mutation re-scan is load-bearing rather than incidental.
13. **Deliver FR-016 and HC-9 with one mechanism: exhaustive contextual `title` coverage.** `rlg.js` `scan()`
    (`#L252`) auto-decorates every element matching `GLOSSARY_SELECTOR` (`#L251`), and `decorate()` (`#L234`)
    writes the glossary definition into `aria-label` (`#L243`) — importing trading vocabulary onto a
    measurement-only surface. The escape hatch is already in the code and is exactly FR-016: `decorate()` returns
    early at `rlg.js#L241` on `if (elm.getAttribute("title")) return;`. So an element that carries a contextual
    `title` can never be claimed, and full FR-016 compliance *is* the HC-9 delivery mechanism.
    **Planning-verified selector list (see routed finding P-015-10).** `design.md` → `## D7` illustrates the
    selector set with eight entries. The committed value is **fifteen**, read directly this planning run from
    `rlg.js#L251`–`#L253`: `UNDERLINE_SELECTORS` = `th`, `.kpi .k`, `.k`, `.badge`, `.flag`, `.legend span`,
    `.ctl label`, `.panel label`, `label`, `.g-title`, `.gt`, `.pill`; `PLAIN_SELECTORS` = `.chart .ct`,
    `.chart .cc`, `.panel h2`. This scope's exhaustive-`title` obligation is written against the **committed
    fifteen**, not against the design's illustrative eight, because scope 09's `RTR-ACTION-EMITTED` scan asserts the
    precondition over the real selector and a shortfall would surface there as a late failure.
    Each `title` must state **both** what the item is and **what the current reading means** — a definition alone
    does not satisfy FR-016.
14. **Widen the UI-33 assertion to `title` and `aria-label` (F-015-D7-04).** `decorate()` writes `aria-label`, not
    visible text, so a text-only scan would miss a leak a screen-reader user would hear. The assertion scans page
    text **plus** every `title` **plus** every `aria-label`. This is an assertion amendment inside the scope, not a
    spec change.
15. **Make null-safety a first-paint requirement, not a polish item.** `rlvSummarizeOutcomes` returns
    `averageWin: null` for a cohort with no wins and `averageLoss: null` for one with no losses
    (`rlvalidation.js#L148`, `#L149`, verified). Every such value is guarded with **`Number.isFinite`** — never the
    global `isFinite`, which passes `null` and throws on `.toFixed()`. One unguarded `null` would halt `render()`
    and freeze the tool on a half-painted screen, which is why UI-11 asserts both that `#avgLoss` renders `—`
    **and** that `#blockRight` still paints with a clean console.
16. **Name every absence.** Every `—` carries a tooltip stating what is missing and why. A bare dash invites the
    reader to supply their own explanation, and `—` is explicitly forbidden as a substitute for a rate in the
    `empty` state.
17. **Make the legacy disclosure permanent and unforgettable.** `#coverageLine` carries the **derived**
    unresolvable-legacy count (never a literal, HC-4 — the count is read from the scope-05 scorecard) and the record
    start date in **every** state including `empty` and `insufficient`, in both Simple and Power. It carries **no**
    close, hide, dismiss or snooze control, and no lever removes it. `#legacyWhy` expands in place — never
    navigating away — and explains one-way hashing of `{subject, family}`, that the preimage was never persisted,
    and that scoring them was impossible then and is impossible now. Copy never says "not yet scored", "pending",
    "unavailable", or anything else implying future recovery.
18. **Separate forecast quality from economic value, and never combine them.** `#blockRight` (*Were we right?*) and
    `#blockPaid` (*Did it pay?*) are distinct elements with an explicit `#blockSep` between them whose tooltip
    states that neither follows from the other (RL-003). **No composite score exists anywhere** — zero elements
    match `[data-composite-score]`.
19. **State the no-advice guarantee structurally.** `#noAdviceNotice` is present in every state and every mode.
    There is no order, size, allocation, target, stop, or imperative sentence anywhere on the surface; HC-9 is
    enforced at the level of grammar and control inventory, not only of copy review.
20. **Keep the honesty furniture at narrow width.** At ≤ 520 px the levers stack, `#rangeBand` keeps its full
    0–100 % axis so width stays honest at small size, and `#rangeBand`, `#sampleCount`, `#coverageLine` and
    `#noAdviceNotice` never collapse behind a "show more".
21. **Render zero `<canvas>` in this scope, and encode the rule anyway.** Every chart on this surface is a Power
    panel and belongs to scope 08. The repo convention this scope commits to is that any canvas registers its
    hit-test through `RLCHART.attach` at the **end** of its draw function, passing the **structured adapter object**
    (which routes to `attachStructured`, `rlchart.js#L317`) and never a bare function (which routes to
    `attachLegacy`, `#L351`, and stamps `data-rlchart-migration-required="true"` at `#L360` — verified). This scope
    therefore asserts that it introduces **no unattached canvas**: any `<canvas>` present carries
    `data-rlchart-mode="structured"` and none carries the migration stamp.
22. **Create `tests/recommendation-track-record-lab.spec.mjs`** as the feature's `e2e-ui` surface, and extend
    `tests/recommendation-track-record.unit.mjs`, `.functional.mjs` and `.stress.mjs` with this scope's named cases.
    Fixture ledgers and resolution sets under `tests/fixtures/recommendation-track-record/**` drive the page into
    each of the `empty`, `insufficient` and `sufficient` states deterministically, with no test reading a clock.

---

## Test Plan

Every `e2e-ui` row runs against the real page with **no request interception** — no `page.route`, no
`context.route`, no `intercept`, no `msw` — so these are live-surface assertions, not mocked ones. Every required
scenario asserts its selector directly with `expect(locator)`; there is **no** early-return bailout in any row, so a
missing control fails rather than silently passing.

| Test ID | Type | Category | Scenarios | File/Location | Description | Command | Live System | Evidence anchor |
|---|---|---|---|---|---|---|---|---|
| T-07-U1 | Unit | `unit` | BS-006 | `tests/recommendation-track-record.unit.mjs` | `compute(MODEL, state)` is pure and synchronous: it returns a **deep-frozen** scorecard (mutation of any nested field throws in strict mode), performs no I/O, and two calls with the same `(MODEL, state)` return structurally identical objects. A source scan finds no `fetch`, `await`, or timer inside it. | `node --test tests/recommendation-track-record.unit.mjs` | No | `report.md#t-07-u1` |
| T-07-U2 | Unit | `unit` | BS-006 | `tests/recommendation-track-record.unit.mjs` | The three verdict states map exactly at the boundaries `n = 0`, `1`, `MIN_COHORT_RESOLVED − 1` and `MIN_COHORT_RESOLVED`, producing `#verdictState` text `No resolved calls yet` / `Not enough data yet` / the rate respectively — and the `insufficient` scorecard carries a **non-`null`** interval, so the range is available to be drawn. | `node --test tests/recommendation-track-record.unit.mjs` | No | `report.md#t-07-u2` |
| T-07-U3 | Unit | `unit` | BS-006 | `tests/recommendation-track-record.unit.mjs` | Exactly **one** rate-emitting helper exists: it refuses to emit a `[data-rate]` without a sibling `[data-range]` and `[data-n]` in the same block (both single-omission cases asserted separately), and a source scan finds **zero** other code paths that write a percent sign into the DOM. | `node --test tests/recommendation-track-record.unit.mjs` | No | `report.md#t-07-u3` |
| T-07-U4 | Unit | `unit` | BS-006 | `tests/recommendation-track-record.unit.mjs` | Null-safety: `averageWin: null` and `averageLoss: null` both render `—` with a non-empty explanatory tooltip and **do not throw**; a source scan finds **zero** occurrences of the global `isFinite` in 015-authored source and confirms every numeric guard uses `Number.isFinite`. | `node --test tests/recommendation-track-record.unit.mjs` | No | `report.md#t-07-u4` |
| T-07-F1 | Functional | `functional` | BS-006 | `tests/recommendation-track-record.functional.mjs` | `localStorage.rlTrackRecordLab` round-trips exactly `{ mode, cohort, bucket, horizon, family, window }` — no seventh key, no derived statistic — and the key is asserted **separate from** `rlData`, so FR-021 holds. A persisted rate, range, or count fails the row. | `node --test tests/recommendation-track-record.functional.mjs` | No | `report.md#t-07-f1` |
| T-07-F2 | Functional | `functional` | BS-012 | `tests/recommendation-track-record.functional.mjs` | Shell structure: the script order places `rlcontext.js` before `rldata.js` and preserves FR-014's `rldata.js` → `rlapp.js` → `rlnav.js` relative order; and the page contains **zero unattached canvas** — every `<canvas>`, if any, carries `data-rlchart-mode="structured"` and none carries `data-rlchart-migration-required`. | `node --test tests/recommendation-track-record.functional.mjs` | No | `report.md#t-07-f2` |
| T-07-F3 | Functional | `functional` | BS-012 | `tests/recommendation-track-record.functional.mjs` | The exhaustive-`title` precondition holds over the **committed fifteen-member** `GLOSSARY_SELECTOR` (`rlg.js#L251`–`#L253`), not the design's illustrative eight: every matching element in the authored markup and in each rendered fixture state carries a non-empty `title`. The adversarial half removes one `title` from a `.flag` element — a selector the design's list omits — and asserts the scan fails. | `node --test tests/recommendation-track-record.functional.mjs` | No | `report.md#t-07-f3` |
| T-07-E1 | E2E UI | `e2e-ui` | BS-005, BS-006 · UI-01 | `tests/recommendation-track-record-lab.spec.mjs` | **UI-01 honest empty state:** `#verdictState` has text `No resolved calls yet`; the page contains **zero** elements matching `[data-rate]`; the open-claim count, record start date and next due resolution date are shown; `#coverageLine` contains the pre-contract count. No range and no expected value appear anywhere. | `npx --no-install playwright test tests/recommendation-track-record-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome` | Yes | `report.md#t-07-e1` |
| T-07-E2 | E2E UI | `e2e-ui` | BS-006 · UI-02, UI-03 | `tests/recommendation-track-record-lab.spec.mjs` | **UI-02 + UI-03:** `#rangeLow`, `#rangeHigh`, `#pointEstimate` and `#sampleCount` are all non-empty; the computed font-size of the `#rangeBand` label is **≥** that of `#pointEstimate`, so the range is the dominant element; and for **each** `[data-rate]` a sibling `[data-range]` and `[data-n]` exist and are non-empty. | `npx --no-install playwright test tests/recommendation-track-record-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome` | Yes | `report.md#t-07-e2` |
| T-07-E3 | E2E UI | `e2e-ui` | BS-006 · UI-04, UI-05 | `tests/recommendation-track-record-lab.spec.mjs` | **UI-04 + UI-05:** `#precisionRead` matches `/rules out/` **and** `/cannot yet/`; `#precisionToGo` is non-empty; and its tooltip matches `/arithmetic/` and `/not a (forecast\|prediction)/`, so the distance-to-precision figure is labelled arithmetic rather than a schedule. | `npx --no-install playwright test tests/recommendation-track-record-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome` | Yes | `report.md#t-07-e3` |
| T-07-E4 | E2E UI | `e2e-ui` | BS-006 · UI-06, UI-07 | `tests/recommendation-track-record-lab.spec.mjs` | **UI-06 + UI-07:** changing `select#leverBucket` changes `#sampleCount` text in the same frame with **no new network request recorded**; steering into a sparse cohort switches `#verdictState` to `Not enough data yet`, `[data-rate]` becomes absent, and `#rangeLow`/`#rangeHigh` **remain present** — the load-bearing half, since suppressing the range there is the failure BP-015-003 names. | `npx --no-install playwright test tests/recommendation-track-record-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome` | Yes | `report.md#t-07-e4` |
| T-07-E5 | E2E UI | `e2e-ui` | BS-006 · UI-08 | `tests/recommendation-track-record-lab.spec.mjs` | **UI-08:** in the insufficient state `#verdictBody` matches `/useless/` **and** `/excellent/`, naming both extremes the range is consistent with, rather than implying the cohort is merely "early". | `npx --no-install playwright test tests/recommendation-track-record-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome` | Yes | `report.md#t-07-e5` |
| T-07-E6 | E2E UI | `e2e-ui` | BS-006, BS-012 · UI-09, UI-10, UI-11 | `tests/recommendation-track-record-lab.spec.mjs` | **UI-09 + UI-10 + UI-11:** `#blockRight` and `#blockPaid` are separate elements with `#blockSep` between them and **zero** `[data-composite-score]` anywhere; `#blockSep`'s tooltip matches `/not the same/` and `/does not follow/`; and in a wins-only cohort `#avgLoss` renders `—` with an explanatory tooltip while `#blockRight` **still paints** and the console stays clean. | `npx --no-install playwright test tests/recommendation-track-record-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome` | Yes | `report.md#t-07-e6` |
| T-07-E7 | E2E UI | `e2e-ui` | BS-005 · UI-12, UI-13, UI-14 | `tests/recommendation-track-record-lab.spec.mjs` | **UI-12 + UI-13 + UI-14:** `#coverageLine` is present and contains the pre-contract count in **all** of empty, insufficient, sufficient and Power; it contains no `button[data-dismiss]` and no `[aria-label*="close" i]`, no lever removes it, and it survives reload identically; expanded `#legacyWhy` matches `/one-way/` and `/never (stored\|persisted)/` and **does not** match `/(will\|can) be (back-?filled\|recovered)/`. | `npx --no-install playwright test tests/recommendation-track-record-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome` | Yes | `report.md#t-07-e7` |
| T-07-E8 | E2E UI | `e2e-ui` | BS-005, BS-006 · UI-15, UI-16, UI-17, UI-18 | `tests/recommendation-track-record-lab.spec.mjs` | **UI-15 + UI-16 + UI-17 + UI-18:** `#denominatorNote` is non-empty and names each closure type present in `#closureMix`; `#withdrawnBound` contains two distinct percentages and matches `/bounds?, not (an )?estimates?/`; **no** `input`/`select` within `#closureMix` mutates `#pointEstimate`; and `#coverageLine` contains the not-evaluable count with a tooltip matching `/excluded from the rate/`. | `npx --no-install playwright test tests/recommendation-track-record-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome` | Yes | `report.md#t-07-e8` |
| T-07-E9 | E2E UI | `e2e-ui` | BS-012 · UI-27 | `tests/recommendation-track-record-lab.spec.mjs` | **UI-27 (page-wide):** every text node matching a known symbol sits inside `a.tkr[href]` with a non-empty `title`; asserted **after a lever change** as well as on first paint, so `rlticker.js`'s `MutationObserver` re-scan (`#L252`) is proven to cover re-rendered content and not just the initial DOM. | `npx --no-install playwright test tests/recommendation-track-record-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome` | Yes | `report.md#t-07-e9` |
| T-07-E10 | E2E UI | `e2e-ui` | BS-012 · UI-28 | `tests/recommendation-track-record-lab.spec.mjs` | **UI-28 (page-wide):** every `[data-kpi]` has a non-empty `title`/`data-tip` whose text **exceeds the label text**, so a tooltip that merely repeats the label fails; asserted across all three sufficiency states, including the `—` placeholders whose tooltips must name what is missing and why. | `npx --no-install playwright test tests/recommendation-track-record-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome` | Yes | `report.md#t-07-e10` |
| T-07-E11 | E2E UI | `e2e-ui` | BS-006 · UI-29, UI-30 | `tests/recommendation-track-record-lab.spec.mjs` | **UI-29 + UI-30:** within first paint `#verdictState` is non-empty **with no user action**, and the page contains **zero** `button[data-action="fetch"]`; the shared status panel lists the ledger resource with one of `fresh`/`stale`/`refreshing`/`missing`/`error`, and a **cache-populated** load is asserted to report `stale` and never `fresh`. | `npx --no-install playwright test tests/recommendation-track-record-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome` | Yes | `report.md#t-07-e11` |
| T-07-E12 | E2E UI | `e2e-ui` | BS-006 · UI-31 | `tests/recommendation-track-record-lab.spec.mjs` | **UI-31:** Simple is the state on a first-ever load; switching to Power sets `document.body.classList.contains('power')`; after reload Power is **still** active and every lever value is restored; and the restored mode is applied **before first paint**, asserted by checking that no frame renders the Simple layout with `state.mode === 'power'`. | `npx --no-install playwright test tests/recommendation-track-record-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome` | Yes | `report.md#t-07-e12` |
| T-07-E13 | E2E UI | `e2e-ui` | BS-006 · UI-32 | `tests/recommendation-track-record-lab.spec.mjs` | **UI-32:** at 520 px width `#rangeBand`, `#sampleCount`, `#coverageLine` and `#noAdviceNotice` are all `toBeVisible()`, the levers stack, `#rangeBand` retains its full 0–100 % axis, and nothing is truncated behind an ellipsis or a "show more". | `npx --no-install playwright test tests/recommendation-track-record-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome` | Yes | `report.md#t-07-e13` |
| T-07-E14 | E2E UI | `e2e-ui` | BS-012 · UI-33 | `tests/recommendation-track-record-lab.spec.mjs` | **UI-33 (page-wide, widened per F-015-D7-04):** page **text**, every `title` **and** every `aria-label` all fail to match `/\b(buy\|sell\|allocate\|position size\|target price\|stop loss)\b/i`, and `#noAdviceNotice` is visible. The `aria-label` half is the one that catches an `rlg.js` decoration a text-only scan would miss but a screen-reader user would hear. | `npx --no-install playwright test tests/recommendation-track-record-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome` | Yes | `report.md#t-07-e14` |
| T-07-P1 | Stress | `stress` | BS-006 | `tests/recommendation-track-record.stress.mjs` | **NFR Performance:** first paint from cache completes under 1 s and a **full recompute across the entire five-lever cross-product** completes under 2 s on a fixture ledger sized well beyond the committed one; every recompute is asserted to issue **zero** network requests, proving the bound comes from `compute()`'s purity rather than from a warm cache. | `node --test tests/recommendation-track-record.stress.mjs` | No | `report.md#t-07-p1` |
| T-07-R1 | Regression E2E | `e2e-ui` | BS-006, BS-012 (SCN-015-006, SCN-015-012) | `tests/recommendation-track-record-lab.spec.mjs` | **Persistent scenario regression for SCN-015-006 and SCN-015-012.** A standing browser pass re-asserts, across all three sufficiency states and after a lever change, that no rendered rate ever appears without its range **and** its sample count in the same string, that `#rangeBand` and `#sampleCount` stay visible, that `#noAdviceNotice` and `#coverageLine` remain present and undismissable, and that page text plus every `title` plus every `aria-label` still fail to match the action vocabulary. It re-runs on every later scope's pass, so a scope 08 or scope 10 change that introduces a second rate-emitting path or an action-shaped tooltip fails here rather than in review. | `npx --no-install playwright test tests/recommendation-track-record-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome` | Yes | `report.md#t-07-r1` |
| T-07-R2 | Regression E2E | `e2e-ui` | BS-006, BS-012 | `tests/*.e2e.mjs`, `tests/*.spec.mjs` (committed suites, unfiltered) | **Broader E2E regression suite.** The repo's committed Node E2E files and the whole committed Playwright spec suite both run green after the new page and its shared-shell wiring land, with no pre-existing test removed, skipped, or newly failing. Because this scope loads `rldata.js`, `rlapp.js`, `rlnav.js`, `rlg.js`, `rlticker.js` and `rlcontext.js` unmodified, this row is the proof that consuming the shared shell did not perturb any other tool page that loads the same modules. | `node --test tests/*.e2e.mjs && npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome` | Yes | `report.md#t-07-r2` |
| T-07-S1 | Project check | project check | — | `scripts/selftest.mjs` (unmodified) | The repo self-test is green after the page, the shell wiring, the fixtures and the test cases land, at `952 + N passed, 0 failed`, with no pre-existing assertion count decreasing. | `node scripts/selftest.mjs` | No | `report.md#t-07-s1` |

**Test Plan rows: 25.** UI rows covered: UI-01 … UI-18 and UI-27 … UI-33 — **25 of 25 owned rows**, none deferred.

---

### Definition of Done

#### Core items

- [ ] `recommendation-track-record-lab.html` exists as a single self-contained, build-free, GitHub-Pages-deployable file with an inline model and no bundler.
- [ ] The script order loads `rlcontext.js` first and preserves FR-014's `rldata.js` → `rlapp.js` → `rlnav.js` relative order, with `rlvalidation.js` ahead of the inline model.
- [ ] `compute(MODEL, state)` is pure, synchronous, performs no I/O, and returns **one deep-frozen `scorecard`**; `renderSimple`, `buildOwnerRead` and `buildMetrics` all read that one object and none recomputes anything.
- [ ] Every DOM id named in `design.md` → `## D7`'s component tree exists, and `#coverageLine` and `#noAdviceNotice` sit **outside** both view containers.
- [ ] The three verdict states are one branch taken before any primitive runs; the `insufficient` state claims **no rate** and **still draws the range**.
- [ ] HC-8 is enforced at the DOM level by exactly one rate-emitting helper; no second code path can print a percentage; headline copy says *range*, never *confidence interval*.
- [ ] **Simple is the default view.** `#modeSeg` carries `role="tablist"` with `button[data-mode]` children, toggles `body.power`, and `applyMode()` runs **before first paint** so no flash of the wrong view occurs.
- [ ] UI state persists to `localStorage.rlTrackRecordLab` as `{ mode, cohort, bucket, horizon, family, window }`, outside `rlData`, and **no derived statistic is persisted anywhere**.
- [ ] All five levers re-render against the in-memory `MODEL` only and never fetch; `leverFamily` binds to `claim.actionFamily`; every rejected lever stays absent.
- [ ] **Auto-hydrate on load:** cache-first paint then delta-only refresh, with **zero** fetch/load/run controls anywhere; the `empty` state is a correct first paint, not a loading placeholder.
- [ ] `RLAPP.report` is called for `ledger:recommendations`, `claims`, `resolutions` and `bars:<SYM>`; a cached read reports `stale`, never `fresh`; a `null` `putToolRead` reports `error`.
- [ ] Every ticker is linked through `RLTKR.tag` or a `data-tkr-auto` container, including in content re-rendered after a lever change; no bare ticker is printed.
- [ ] Every element matching the **committed fifteen-member** `GLOSSARY_SELECTOR` carries a contextual `title` stating both what the item is and what the current reading means — the single mechanism delivering FR-016 and HC-9.
- [ ] The UI-33 assertion is widened to scan page text **plus** `title` **plus** `aria-label` (F-015-D7-04).
- [ ] `Number.isFinite` is used exclusively; the global `isFinite` appears nowhere in 015-authored code; a `null` `averageWin`/`averageLoss` renders `—` without halting the paint.
- [ ] Every `—` carries a tooltip naming what is missing and why; `—` is never used as a substitute for a rate.
- [ ] `#coverageLine` carries the **derived** legacy count (no literal, HC-4) and the record start date in every state and both modes, with no dismiss control and no lever that removes it; `#legacyWhy` expands in place and implies no future back-fill.
- [ ] `#blockRight` and `#blockPaid` are separate with `#blockSep` between them; **no composite score exists anywhere**.
- [ ] `#noAdviceNotice` is present in every state and mode; there is no order, size, allocation, target, stop, or imperative sentence anywhere on the surface (HC-9).
- [ ] At ≤ 520 px the levers stack, `#rangeBand` keeps its full 0–100 % axis, and the honesty furniture never collapses behind a "show more".
- [ ] This scope renders **zero `<canvas>`**; any canvas present would carry `data-rlchart-mode="structured"` and none carries `data-rlchart-migration-required`. All chart panels are scope 08.
- [ ] No statistic is computed in this scope: every number rendered arrives from the scope-05 scorecard, and `rlvalidation.js` is neither re-implemented nor modified.
- [ ] No `e2e-ui` test in this scope uses `page.route`, `context.route`, `intercept`, `msw` or `nock`, and no required scenario contains an early-return bailout.

#### Test items

- [ ] [T-07-U1] `compute()` is pure, synchronous and returns a deep-frozen scorecard → evidence recorded in `report.md#t-07-u1`.
- [ ] [T-07-U2] The three verdict states map exactly at all four boundaries and `insufficient` carries a non-`null` interval → evidence recorded in `report.md#t-07-u2`.
- [ ] [T-07-U3] Exactly one rate-emitting helper exists and both single-omission cases refuse → evidence recorded in `report.md#t-07-u3`.
- [ ] [T-07-U4] Null payoffs render `—` without throwing and the global `isFinite` is absent → evidence recorded in `report.md#t-07-u4`.
- [ ] [T-07-F1] The persisted state round-trips the six keys with no derived statistic and outside `rlData` → evidence recorded in `report.md#t-07-f1`.
- [ ] [T-07-F2] Load order is correct and the page contains no unattached canvas → evidence recorded in `report.md#t-07-f2`.
- [ ] [T-07-F3] The exhaustive-`title` scan passes over the committed fifteen-member selector and fails when one `title` is removed → evidence recorded in `report.md#t-07-f3`.
- [ ] [T-07-E1] UI-01 honest empty state with zero `[data-rate]` → evidence recorded in `report.md#t-07-e1`.
- [ ] [T-07-E2] UI-02 + UI-03 range dominance and the bare-rate prohibition → evidence recorded in `report.md#t-07-e2`. — proves SCN-015-006
- [ ] [T-07-E3] UI-04 + UI-05 precision read and arithmetic-not-forecast tooltip → evidence recorded in `report.md#t-07-e3`.
- [ ] [T-07-E4] UI-06 + UI-07 live steering with no new request, and the range survives the sparse cohort → evidence recorded in `report.md#t-07-e4`.
- [ ] [T-07-E5] UI-08 insufficient copy names both extremes → evidence recorded in `report.md#t-07-e5`.
- [ ] [T-07-E6] UI-09 + UI-10 + UI-11 separation, non-implication and the em dash with a clean console → evidence recorded in `report.md#t-07-e6`.
- [ ] [T-07-E7] UI-12 + UI-13 + UI-14 permanent, undismissable, honestly-explained legacy disclosure → evidence recorded in `report.md#t-07-e7`.
- [ ] [T-07-E8] UI-15 + UI-16 + UI-17 + UI-18 denominator note, withdrawn bounds, no promoting control, not-evaluable counted → evidence recorded in `report.md#t-07-e8`.
- [ ] [T-07-E9] UI-27 every ticker linked, including after a lever re-render → evidence recorded in `report.md#t-07-e9`.
- [ ] [T-07-E10] UI-28 every `[data-kpi]` tooltip exceeds its label across all three states → evidence recorded in `report.md#t-07-e10`.
- [ ] [T-07-E11] UI-29 + UI-30 auto-hydrate with no fetch control and honest cached-read status → evidence recorded in `report.md#t-07-e11`.
- [ ] [T-07-E12] UI-31 mode toggle, reload persistence, and pre-first-paint application → evidence recorded in `report.md#t-07-e12`.
- [ ] [T-07-E13] UI-32 narrow reflow keeps the honesty furniture visible → evidence recorded in `report.md#t-07-e13`.
- [ ] [T-07-E14] UI-33 no action emitted in text, `title` **or** `aria-label` → evidence recorded in `report.md#t-07-e14`. — proves SCN-015-012
- [ ] [T-07-P1] First paint under 1 s, full lever cross-product recompute under 2 s, zero network requests → evidence recorded in `report.md#t-07-p1`.
- [ ] Scenario-specific E2E regression tests for every new/changed/fixed behavior in this scope pass — [T-07-R1] the never-bare-rate rule, the visible range and sample count, the permanent honesty furniture, and the widened no-action scan all re-assert across all three states and after a lever change → evidence recorded in `report.md#t-07-r1`.
- [ ] Broader E2E regression suite passes unchanged — [T-07-R2] the committed Node E2E files and the whole committed Playwright spec suite are green, proving the shared shell this page consumes is unperturbed for every other tool page that loads the same modules → evidence recorded in `report.md#t-07-r2`.
- [ ] [T-07-S1] `node scripts/selftest.mjs` reports `952 + N passed, 0 failed` with no pre-existing assertion count decreasing → evidence recorded in `report.md#t-07-s1`.

**Test-related DoD items: 25. Test Plan rows: 25. Parity confirmed.**

**UI-27, UI-28 and UI-33 are page-wide assertions owned here.** Scope 08 carries a named DoD item re-running all
three with every Power panel rendered, because a Power-only element lacking a `title` re-opens the `rlg.js` hole
this scope closes. Re-running is not co-ownership; the assertions remain this scope's.

#### Build Quality Gate

- [ ] Zero warnings across `node --test`, the Playwright run and `node scripts/selftest.mjs`; zero console errors on any rendered state; zero issues deferred, skipped, or worked around; every negative test verified to fail when the behaviour it guards is reverted; `rlvalidation.js`, `rlcontracts.js`, `rldata.js`, `rlbrief.js`, `rlmarketaction.js`, `rlg.js`, `rlticker.js`, `rlchart.js`, `rlcontext.js`, `rlapp.js` and `rlnav.js` all byte-unmodified; `spec.md`, `design.md` and `scopes/_index.md` unmodified by this scope; no other scope directory and no other spec's artifacts touched.

---

### Files and surfaces this scope must not touch

| Surface | Why it is excluded |
|---|---|
| `rlvalidation.js` | **Feature 007-owned, consume-only.** This scope computes no statistic; every number it renders arrives from the scope-05 scorecard. The module deep-freezes its results, so there is no shim seam even if one were wanted. |
| `rlcontracts.js` reducer and `CLOSE_EVENT_TYPES` | **Feature 002-owned, consume-only.** Closure labels are rendered from the scorecard's `closureMix`; no closure is emitted, the reducer is never forked, and the vocabulary is never extended. |
| The persisted `rldata.js` cache schema | **Feature 013-protected (FR-021, AC-012).** UI state lives under the separate `localStorage.rlTrackRecordLab` key; the only `rlData` write is scope 06's `putToolRead` into the existing `d.toolReads[id]` slot. No derived statistic is persisted anywhere. |
| The Market Action Center four-view composition | **Feature 012-owned (`RLMKT-VIEW`).** This page is its own tool. It writes no Center `viewOrder`, `views` or `viewState`, declares no view id, and reaches the Center only through scope 06's owner read. HC-3 holds by non-participation. |
| `rlg.js`, `rlticker.js`, `rlchart.js`, `rlcontext.js`, `rlapp.js`, `rlnav.js` | Shared-shell modules, consume-only. The `rlg.js` glossary hazard is **pre-empted** by exhaustive `title` coverage — the escape hatch already in the code at `#L241` — and never by editing the glossary, suppressing `scan()`, or shadowing the module. |
| Power panels, `renderPower`, `#calibTable`, `#distChart`, `#multiplicity`, `#cohortsViewed`, `#ledgerTable` | Scope 08. This scope establishes the shell, the mode mechanism and the single `compute()` those panels reuse, and renders none of them. |
| The scope-05 cohort model, constants, denominator, bounds and derived counts | Scope 05. A number this scope cannot find on the scorecard is a scope-05 gap to route, never a locally-computed value. |
| `buildOwnerRead`, `buildMetrics`, `RLDATA.putToolRead` | Scope 06. This scope produces the frozen scorecard those read; it does not author the read or its templates. |
| `scripts/brief-resolve-outcomes.mjs`, `briefs/objects/**`, `briefs/history/**` | Scopes 01, 02 and 04. This page **reads** committed artifacts; it never writes, amends, or deletes one, and it appends no ledger row. |
| `tools.json`, `index.html`, `rlnav.js` `TOOLS`, `journeys.json`, `simple-models.json` | **Counted registries — scope 10 only.** While scope 10 is unscheduled this page runs **unregistered**, reachable by direct URL, with `node scripts/validate-tool-experience.mjs` green throughout. Registering here would trip four hard count assertions. |
| `scripts/validate-recommendation-track-record.mjs` | The consolidated validator is scope 09; this scope owns no `RTR-*` code of its own and its obligations are proven by `node --test` and Playwright. |
| Any other `scopes/NN-*/` directory in this feature | Each scope owns its own directory. This scope writes only `scopes/07-simple-view-and-shared-shell/`. |
| Any other `specs/**` directory | Specs 002, 012, 013, 014 and 016 are authored by concurrent sessions and are neither read for mutation nor written. |

---

*Educational research context only — not investment advice.*
