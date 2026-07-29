# Scope 08: Power view and charts

**Status:** Not Started
**Depends On:** 07
**Tags:** `overlay:true`, `routed:P-015-05`, `routed:P-015-06`, `routed:P-015-10`
**Design section:** `design.md` → `## D7 — UI Component Design`
**Business Scenarios owned:** BS-011
**UI rows owned:** UI-19, UI-20, UI-21, UI-22, UI-23, UI-24, UI-25, UI-26, UI-34 (**9 rows**)
**Refusal codes owned:** — (none of its own; it re-runs scope 07's page-wide assertions with every Power panel
rendered, and it supplies the Power-side surface that scope 09's `RTR-ACTION-EMITTED` scan asserts over)

**Primary Outcome:**
`renderPower` adds four drill-in panels — `#calibTable`, `#distChart`, `#multiplicity` (with `#cohortsViewed`) and
`#ledgerTable` — to the shell scope 07 established, reusing its scaffold, its mode mechanism, its levers, and its
**single** `compute()`. No panel recomputes anything: Power is a fourth rendering of the same deep-frozen
`scorecard`, so a Power figure and a Simple figure cannot disagree. The distribution canvas attaches through the
**structured** `RLCHART` adapter — the exact five-key object at `rlchart.js#L101` — which is what turns three
separate obligations into one enforced contract: `hitTest` discharges FR-017, `contextFor` discharges FR-016
because a context without a real interpretation does not validate, and the
`links.sameDataTable === "#" + tableTargetFor(pointId)` equality at `rlchart.js#L120` makes the chart-to-table
binding a contract rather than a convention. A chart point with no same-data table row **cannot attach**.

**Boundary with the surrounding scopes.** Scope 05 owns every number — `calibration`, `distribution`,
`multiplicity`, `closureMix` and the deflated-Sharpe guard all arrive on the scorecard already computed by a named
`RLVALID` primitive or an 015-owned count. Scope 07 owns the page, the load order, `compute()`, the frozen
scorecard, the mode mechanism, the persisted UI state and the honesty furniture. This scope owns **only** the four
Power panels, the canvas adapter, and the `#cohortsViewed` session counter. It writes no statistic, adds no lever,
and creates no HTML file.

**Scope boundary — three routed advisories.** `RTR-ACTION-EMITTED`'s precondition is asserted against the
**verified fifteen-member** `GLOSSARY_SELECTOR`, not the design's illustrative eight (**P-015-10**). FR-017's
wording names the deprecated `attach(canvas, hitFn)` closure form (**P-015-05**) and UI-25 asserts
`table[data-chart-fallback]`, an attribute with zero repo precedent (**P-015-06**). This scope carries **both** the
enforced `tableTargetFor` binding and the asserted attribute rather than choosing between them; `spec.md` is
analyst-owned and is not edited here.

---

## Business Scenarios owned

### BS-011: An apparent edge is discounted for multiplicity

```gherkin
Scenario: An apparent edge is discounted for multiplicity (SCN-015-011)
  Given a cohort spanning many distinct claim families over the evaluation period
  When a performance statistic is displayed
  Then the family count and trial count are displayed with it
  And the multiple-testing-discounted statistic is shown alongside the raw one
```

---

## Implementation Plan

1. **Add `renderPower(scorecard)` beside `renderSimple`, reading the same frozen object.** Power panels carry
   `class="panel pw"` and are hidden by scope 07's `body:not(.power) .pw { display:none }` rule. There is **no
   second `compute()` call site**: a Power-only recomputation is exactly how a drill-in panel comes to contradict
   the headline it is supposed to explain.
2. **Render `#calibTable` with one row per *declared* stated-confidence bucket, including zero-count buckets.**
   The scorecard's `calibration` array already carries a row per declared bucket (`design.md` → `## D7`, frozen
   scorecard table). A zero-count bucket renders `—` for realised rate and range and `n = 0`, and the row is
   **never dropped** (UI-21). Dropping empty buckets is silent survivorship inside the calibration panel itself:
   the buckets a forecaster never earned are the most informative rows on the table. Each row shows stated
   confidence, realised rate, range, count and an in-band / out-of-band / too-few verdict (UI-20), and every rate
   goes through scope 07's **single** rate-emitting helper, so HC-8 holds here by reuse rather than by a second
   implementation.
3. **Attach `#distChart` through the structured adapter, never the legacy closure.**
   `RLCHART.attach(canvas, adapterOrHitFn)` (`rlchart.js#L365`) dispatches on argument type: a **function** routes
   to `attachLegacy` (`#L351`), which sets `data-rlchart-mode="legacy"` (`#L359`) and stamps
   `data-rlchart-migration-required="true"` (`#L360`); an **object** routes to `attachStructured` (`#L317`). 015
   passes the object, so a brand-new tool never ships pre-flagged migration debt (**P-015-05**).
4. **Satisfy the exact five-key adapter contract.** `validateStructuredAdapter` (`rlchart.js#L98`) compares the
   adapter's key list against `["contextFor", "hitTest", "orderedPointIds", "seriesOrder", "tableTargetFor"]`
   (`#L101`, verified this planning run) and additionally requires `tableTargetFor` to be a function (`#L106`),
   `orderedPointIds` to be a non-empty array (`#L107`) and `seriesOrder` to be an array (`#L108`).
5. **Use the eight outcome buckets as `orderedPointIds`.** `le-3`, `neg-2`, `neg-1`, `flat`, `pos-1`, `pos-2`,
   `pos-3`, `gt-3` — stable strings satisfying the `^[A-Za-z0-9:._-]+$` point-id rule (`rlchart.js#L113`) and
   unique per the duplicate check at `#L114`. `tableTargetFor("flat")` returns the id of the **resolved-flat row**
   in `#distTable`. This is where HC-7 becomes visible to a human: scope 03's sentinel exists so that column, and
   its table row, can exist at all.
6. **Make every `contextFor(pointId)` a real `contextual-tooltip/v1` object.** `RLCTX.validateContext`
   (`rlcontext.js#L202` onwards) requires `definition`, `limitation`, `triggerCondition`, `invalidationCondition`
   (`#L205`), an `interpretation` block with an accepted `direction` (`#L228`) and a `thresholdsOrBounds` string
   array (`#L231`), and an `uncertainty` block (`#L241`). Critically, `isLabelOnly(context)` **rejects** an
   interpretation that repeats only the label and value (`#L232`) — so a tooltip that merely restates *"flat: 4"*
   does not validate. That is FR-016's *"what the current reading means"* half made structural rather than
   aspirational, and it is the reason the adapter contract is worth adopting instead of a bare hit-test closure.
7. **Bind chart to table contractually, and carry the asserted attribute too.**
   `contextFor(pointId).links.sameDataTable` must equal `"#" + tableTargetFor(pointId)` (`rlchart.js#L120`) and the
   bare target must match `^[A-Za-z][A-Za-z0-9:._-]*$` (`#L119`). `#distTable` therefore carries the
   `tableTargetFor` ids **and** the `data-chart-fallback` attribute UI-25 asserts (**P-015-06**) — both, because
   the id binding is what the validator enforces and the attribute is what the spec row reads.
8. **Take the keyboard path for free, and assert it rather than assume it.** `attachStructured` sets
   `canvas.tabIndex = 0` (`rlchart.js#L337`), `data-rlchart-mode="structured"` (`#L339`) and an
   `aria-activedescendant` point rail (`#L343`, `#L199`). These are properties of the structured path and are
   absent from the legacy one, which is the accessibility half of the same choice.
9. **Guard the draw.** A hidden canvas does not render. Draws are gated on the active mode, redrawn on `resize`,
   and `attach()` is called at the **end** of each draw so the adapter closes over the scales and data just
   committed to the bitmap.
10. **Render `#multiplicity` from the scorecard's `multiplicity` block only.** `familyCount` and `trialCount` are
    displayed **separately** and both labelled, so the choice `trialCount === familyCount` (the selection surface,
    scope 05) is inspectable rather than buried. The discounted figure is `rlvDeflatedSharpe`'s return read
    verbatim; when scope 05's guards rendered `—` with a stated reason, this panel renders that `—` and its reason
    and the primitive is **not** called here either. Per RL-007 both figures are labelled **directional evidence of
    overfitting, not a significance test**, with the stated reason that recommendation outcomes are not an equity
    curve.
11. **Count cohort-shopping in `#cohortsViewed`, and count it honestly.** A `Set` over the serialized lever tuple
    yields the number of **distinct** cohorts viewed this session. It is deliberately **not persisted** — it is a
    within-session reading aid that puts the cost of cohort-shopping in front of the reader while they read
    (UI-23) — and it **blocks nothing**. Copy states that keeping the best of many looks is how a false edge is
    manufactured. A persisted counter would become a scold; an informational one is the only honest form.
12. **Render `#ledgerTable` as the raw audit surface.** One row per closure: claim reference, subject, closure
    event, resolution date, signed outcome, and the cohort tags it contributed to (UI-26). `resolved-flat` appears
    as its **own labelled outcome**, never merged into unresolved and never displayed as a bare `0` (UI-19) — the
    rendered proof that scope 03's sentinel survived the whole pipeline. The Subject column carries
    `data-tkr-auto` so `rlticker.js` links every symbol (FR-015).
13. **Deep-link out without losing state (UI-34).** Each row carries `a[data-owner-tool][href$=".html"]` derived
    from the claim's `lifecycleTerms.originToolId` (scope 01). Because scope 07 persists
    `localStorage.rlTrackRecordLab` and applies it before first paint, back-navigation restores mode and levers
    with no extra machinery in this scope.
14. **Carry the page-wide re-run obligation as a named item, not an assumption.** UI-27, UI-28 and UI-33 are scope
    07's assertions. This scope re-runs all three with **every Power panel rendered**, because a Power-only element
    lacking a `title` re-opens the `rlg.js` hole scope 07 closed. The obligation is asserted over the **committed
    fifteen-member** `GLOSSARY_SELECTOR` — `UNDERLINE_SELECTORS` at `rlg.js#L249` (`th`, `.kpi .k`, `.k`, `.badge`,
    `.flag`, `.legend span`, `.ctl label`, `.panel label`, `label`, `.g-title`, `.gt`, `.pill`) concatenated with
    `PLAIN_SELECTORS` at `#L250` (`.chart .ct`, `.chart .cc`, `.panel h2`) at `#L251`, all verified this planning
    run. Power introduces `th`, `.chart .ct` and `.chart .cc` elements that Simple never rendered, so this is where
    the design's illustrative eight-selector list would have failed late (**P-015-10**).
15. **Extend the fixture substrate** at `tests/fixtures/recommendation-track-record/power/**` with scorecards
    covering a zero-count calibration bucket, a bucket spread across in-band / out-of-band / too-few verdicts, a
    distribution containing a non-empty `flat` bucket, a cohort whose deflated-Sharpe guard trips, and a ledger
    slice with claims from more than one owning tool. Every fixture carries explicit dates and no fixture reads a
    clock.
16. **Extend `tests/recommendation-track-record.unit.mjs`, `.functional.mjs` and
    `tests/recommendation-track-record-lab.spec.mjs`** with this scope's named cases. Existing files are extended,
    never rewritten.

---

## Consumer Impact Sweep

This scope renames and removes nothing on a surface it does not own. The five-key `RLCHART` adapter contract is
**consumed unchanged** — the *"each of the five removed in turn"* case in `T-08-U1` mutates a local adapter object
held inside the test and never touches `rlchart.js#L101`. What the sweep exists for is the other half: this scope
becomes a **new consumer** of three shared-shell contracts, and it **introduces** first-party ids that the committed
Playwright suite, scope 09's source scans and scope 10's registration all read. An id renamed during implementation
after those readers are written against it is how a suite stays green while asserting on an element that is no
longer there.

| Interface consumed or introduced | First-party consumers that must be traced | How the trace is re-verified |
|---|---|---|
| The `RLCHART` structured-adapter key set (`contextFor`, `hitTest`, `orderedPointIds`, `seriesOrder`, `tableTargetFor`, `rlchart.js#L101`) | **Consumed, never owned.** Every other committed tool page that calls `RLCHART.attach` is a co-consumer of the same dispatch at `#L365`; 015 adds a consumer and changes no key. | `T-08-R2` re-runs the whole committed Playwright suite unfiltered — the only assertion that proves no co-consumer regressed. A sixth key would be a routed packet to the shared-module owner, never a local edit; the co-consumer inventory is produced by a repo-wide scan for `RLCHART.attach` across `*.html` and `*.js` and recorded in `report.md`. |
| The eight `orderedPointIds` (`le-3` … `gt-3`) and the `tableTargetFor` row ids they map onto | `contextFor(pointId).links.sameDataTable`, the `#distTable` row ids in the rendered DOM, and scope 09's `RTR-ACTION-EMITTED` scan. | `T-08-U2` (exact id list, `flat` present), `T-08-U4` (the `#L120` equality per point), `T-08-F3` and `T-08-E6` (every point resolves to a row **present in the DOM**). Renaming a bucket id without carrying its `#distTable` row id along in the same change fails `T-08-F3` rather than passing quietly, because the equality is computed from both sides. |
| Panel ids `#calibTable`, `#distChart`, `#distTable`, `#multiplicity`, `#cohortsViewed`, `#ledgerTable` | `T-08-E1` … `T-08-E9` and `T-08-R1` in `tests/recommendation-track-record-lab.spec.mjs`; scope 09's `RTR-CENTER-VIEW` and `RTR-ACTION-EMITTED` scans; scope 10's registration checks. | A repo-wide stale-reference scan for each id runs at the end of the scope with its output recorded in `report.md`: zero hits outside the owning render function and its named readers. |
| Ledger **deep links** — `a[data-owner-tool][href$=".html"]` derived from `lifecycleTerms.originToolId` through the `tools.json` `file` → `id` map | This one crosses a registry boundary: `tools.json` is scope 10's, and every emitted `href` points at a committed `*.html` at the repo root. A tool file renamed, or a tool page dropped from that registry, turns a rendered row into a dead link while the row itself still renders perfectly. | Scope 01 refuses `unresolvable-owning-tool` at mint, so an unmappable `deepLink` never becomes a claim in the first place. `T-08-E8` follows a real link and asserts back-navigation restores mode and levers. The sweep additionally scans every emitted `href` against the committed root `*.html` set and the live `tools.json` entries, with `node scripts/validate-tool-experience.mjs` green throughout. |
| The persisted UI-state key `localStorage.rlTrackRecordLab` (scope 07's six-key shape) | Scope 07's restore-before-first-paint path, and `T-08-E8`'s back-navigation assertion. | `T-08-F4` asserts `#cohortsViewed` is **absent** from the persisted shape, so this scope adds no key and renames none. A renamed key silently discards every reader's saved state without failing anything else on the page. |
| `data-chart-fallback` on `#distTable` (UI-25, zero repo precedent — P-015-06) | `T-08-E6`, plus any future shared-shell scan that adopts the attribute. | Carried **alongside** the `tableTargetFor` id binding, and `T-08-F3` asserts dropping either one fails its own assertion — so neither mechanism is load-bearing alone and neither can be discarded as redundant. |
| Navigation, breadcrumb and redirect surfaces | **None — asserted, not assumed.** `rlnav.js` `TOOLS`, `index.html` and `journeys.json` are scope 10's; this page is unregistered and reachable by direct URL until then. | Recorded here so *"no navigation consumer"* is a checked fact rather than an omission. `node scripts/validate-tool-experience.mjs` stays green for the whole window in which the page is unregistered. |

---

## Test Plan

Every `e2e-ui` row runs against the real page with **no request interception** — no `page.route`, no
`context.route`, no `intercept`, no `msw`, no `nock`. Every required scenario asserts its selector directly with
`expect(locator)`; there is **no** early-return bailout in any row, so a missing panel fails rather than silently
passing.

| Test ID | Type | Category | Scenarios | File/Location | Description | Command | Live System | Evidence anchor |
|---|---|---|---|---|---|---|---|---|
| T-08-U1 | Unit | `unit` | BS-011 | `tests/recommendation-track-record.unit.mjs` | The adapter validates against the **exact** five-key set at `rlchart.js#L101`: a sixth key refuses, and each of the five removed in turn refuses, asserted **per key** rather than once. `tableTargetFor` non-function (`#L106`), empty `orderedPointIds` (`#L107`) and non-array `seriesOrder` (`#L108`) each refuse with their own path. | `node --test tests/recommendation-track-record.unit.mjs` | No | `report.md#t-08-u1` |
| T-08-U2 | Unit | `unit` | BS-011 | `tests/recommendation-track-record.unit.mjs` | `orderedPointIds` is exactly `le-3, neg-2, neg-1, flat, pos-1, pos-2, pos-3, gt-3`; every member matches `^[A-Za-z0-9:._-]+$` (`#L113`) and a duplicated id refuses at `#L114`. The `flat` id is asserted **present**, since its absence would erase HC-7 from the rendered surface. | `node --test tests/recommendation-track-record.unit.mjs` | No | `report.md#t-08-u2` |
| T-08-U3 | Unit | `unit` | BS-011 | `tests/recommendation-track-record.unit.mjs` | Every `contextFor(pointId)` passes `RLCTX.validateContext`. The adversarial half asserts that a context whose `interpretation.text` merely repeats the label and value is **rejected** by `isLabelOnly` (`rlcontext.js#L232`) — proving a definition-only tooltip does not satisfy FR-016 and cannot be smuggled past the adapter. | `node --test tests/recommendation-track-record.unit.mjs` | No | `report.md#t-08-u3` |
| T-08-U4 | Unit | `unit` | BS-011 | `tests/recommendation-track-record.unit.mjs` | For **every** point, `contextFor(pointId).links.sameDataTable === "#" + tableTargetFor(pointId)` (`rlchart.js#L120`) and the bare target matches `^[A-Za-z][A-Za-z0-9:._-]*$` (`#L119`); a deliberately mismatched pair refuses. This is the assertion that makes "every chart has a table" a contract rather than a convention. | `node --test tests/recommendation-track-record.unit.mjs` | No | `report.md#t-08-u4` |
| T-08-U5 | Unit | `unit` | BS-011 | `tests/recommendation-track-record.unit.mjs` | `#calibTable` renders one row per **declared** bucket including zero-count buckets; the zero row shows `—` for realised rate and range and `n = 0`. The adversarial half deletes an empty bucket from the render input and asserts the row count no longer equals the declared bucket count, so dropping an empty bucket fails. | `node --test tests/recommendation-track-record.unit.mjs` | No | `report.md#t-08-u5` |
| T-08-U6 | Unit | `unit` | BS-011 | `tests/recommendation-track-record.unit.mjs` | The multiplicity panel reads `familyCount`, `trialCount` and both statistics **verbatim** from the scorecard; a source scan finds zero local discount arithmetic and zero `rlvDeflatedSharpe` call in this scope. When scope 05's guard produced `—`, the panel renders `—` with its stated reason and the primitive is not called. | `node --test tests/recommendation-track-record.unit.mjs` | No | `report.md#t-08-u6` |
| T-08-F1 | Functional | `functional` | BS-011 | `tests/recommendation-track-record.functional.mjs` | `renderPower` is a **fourth rendering, not a second computation**: every numeric value it displays equals the corresponding frozen scorecard field, asserted field-by-field, and a source scan finds **exactly one** `compute(` call site on the whole page. A Power-path recomputation fails the row. | `node --test tests/recommendation-track-record.functional.mjs` | No | `report.md#t-08-f1` |
| T-08-F2 | Functional | `functional` | BS-011 | `tests/recommendation-track-record.functional.mjs` | `attach()` receives the **object** adapter, routing to `attachStructured` (`rlchart.js#L317`): the canvas carries `data-rlchart-mode="structured"` (`#L339`) and `tabIndex === 0` (`#L337`), and **zero** canvases carry `data-rlchart-migration-required` (`#L360`). The adversarial half passes a bare function and asserts the migration stamp **does** appear, proving the two paths are distinguishable and the structured one was chosen deliberately. | `node --test tests/recommendation-track-record.functional.mjs` | No | `report.md#t-08-f2` |
| T-08-F3 | Functional | `functional` | BS-011 | `tests/recommendation-track-record.functional.mjs` | Every chart point resolves to a same-data table row that **exists in the rendered DOM**, and `#distTable` carries **both** the `tableTargetFor` id binding and the `data-chart-fallback` attribute (P-015-06). Removing either one is asserted to fail its own assertion, so neither mechanism is load-bearing alone. | `node --test tests/recommendation-track-record.functional.mjs` | No | `report.md#t-08-f3` |
| T-08-F4 | Functional | `functional` | BS-011 | `tests/recommendation-track-record.functional.mjs` | `#cohortsViewed` counts **distinct** lever tuples via a `Set` over the serialized tuple — revisiting a previously-viewed cohort does **not** increment it — and it is asserted **absent** from `localStorage.rlTrackRecordLab`, so the six-key persisted shape scope 07 owns is unchanged. It gates nothing: no control is disabled at any count. | `node --test tests/recommendation-track-record.functional.mjs` | No | `report.md#t-08-f4` |
| T-08-E1 | E2E UI | `e2e-ui` | BS-011 · UI-19 | `tests/recommendation-track-record-lab.spec.mjs` | **UI-19:** a `#ledgerTable` row shows the label `Resolved flat`; `#closureMix` lists resolved-flat **separately** from unresolved; and no element on the surface renders a resolved-flat outcome as a bare `0`. Merging the two classes fails the row. | `npx --no-install playwright test tests/recommendation-track-record-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome` | Yes | `report.md#t-08-e1` |
| T-08-E2 | E2E UI | `e2e-ui` | BS-011 · UI-20, UI-21 | `tests/recommendation-track-record-lab.spec.mjs` | **UI-20 + UI-21:** every `#calibTable tbody tr` has non-empty range and count cells and an in-band / out-of-band / too-few verdict; the row count **equals the declared bucket count**; and the zero-count bucket row is present showing `—` and `n = 0`. | `npx --no-install playwright test tests/recommendation-track-record-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome` | Yes | `report.md#t-08-e2` |
| T-08-E3 | E2E UI | `e2e-ui` | BS-011 · UI-22 | `tests/recommendation-track-record-lab.spec.mjs` | **UI-22:** `#multiplicity` contains the family count, the trial count, **both** statistics, and matches `/directional/` and `/not a (significance )?test/`. Rendering only the discounted figure, or only the raw one, fails the row — BS-011 requires them side by side. | `npx --no-install playwright test tests/recommendation-track-record-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome` | Yes | `report.md#t-08-e3` |
| T-08-E4 | E2E UI | `e2e-ui` | BS-011 · UI-23 | `tests/recommendation-track-record-lab.spec.mjs` | **UI-23:** after steering into several distinct cohorts, `#cohortsViewed` reports the distinct count and its copy matches `/best of/`; re-selecting an already-viewed tuple leaves the count unchanged; and every control remains enabled at every count. | `npx --no-install playwright test tests/recommendation-track-record-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome` | Yes | `report.md#t-08-e4` |
| T-08-E5 | E2E UI | `e2e-ui` | BS-011 · UI-24 | `tests/recommendation-track-record-lab.spec.mjs` | **UI-24:** a `mousemove` over `#distChart` yields a **visible** `RLCHART` tooltip containing the bucket label, its count, and interpretation text that is not merely the label repeated; and the canvas is reachable by keyboard with `aria-activedescendant` tracking the selected point. | `npx --no-install playwright test tests/recommendation-track-record-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome` | Yes | `report.md#t-08-e5` |
| T-08-E6 | E2E UI | `e2e-ui` | BS-011 · UI-25 | `tests/recommendation-track-record-lab.spec.mjs` | **UI-25:** for **each** `canvas` a following `table[data-chart-fallback]` exists with ≥ 1 row, the table is keyboard reachable, and each rendered chart point's `tableTargetFor` id resolves to an actual row in it — the attribute and the binding asserted together. | `npx --no-install playwright test tests/recommendation-track-record-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome` | Yes | `report.md#t-08-e6` |
| T-08-E7 | E2E UI | `e2e-ui` | BS-011 · UI-26 | `tests/recommendation-track-record-lab.spec.mjs` | **UI-26:** each `#ledgerTable tbody tr` has non-empty claim-ref, closure-event, resolution-date and signed-outcome cells plus its contributing cohort tags, and every symbol in the Subject column is linked rather than bare. | `npx --no-install playwright test tests/recommendation-track-record-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome` | Yes | `report.md#t-08-e7` |
| T-08-E8 | E2E UI | `e2e-ui` | BS-011 · UI-34 | `tests/recommendation-track-record-lab.spec.mjs` | **UI-34:** `a[data-owner-tool][href$=".html"]` is present on ledger rows whose claim carries an owning tool; following it navigates to that tool; and back-navigation restores **both** the Power mode and every lever value from `localStorage.rlTrackRecordLab`. | `npx --no-install playwright test tests/recommendation-track-record-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome` | Yes | `report.md#t-08-e8` |
| T-08-E9 | E2E UI | `e2e-ui` | BS-011 · UI-27, UI-28, UI-33 (re-run) | `tests/recommendation-track-record-lab.spec.mjs` | **The page-wide re-run with every Power panel rendered.** UI-27: no bare ticker survives in any Power panel. UI-28: every `[data-kpi]` tooltip exceeds its label text. UI-33: page text **plus** every `title` **plus** every `aria-label` fail to match the action vocabulary. All asserted over the **committed fifteen-member** `GLOSSARY_SELECTOR` (`rlg.js#L249`–`#L251`), which is where the design's illustrative eight would have missed `th`, `.chart .ct` and `.chart .cc` — elements only Power renders (P-015-10). | `npx --no-install playwright test tests/recommendation-track-record-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome` | Yes | `report.md#t-08-e9` |
| T-08-P1 | Stress | `stress` | BS-011 | `tests/recommendation-track-record.stress.mjs` | **NFR Performance for the Power surface over a full-size ledger.** With every Power panel mounted over a scorecard derived from a synthetic ledger an order of magnitude beyond the committed partition, the **Simple first paint stays under 1 s** — the `pw` panels must not be built or drawn on first paint — and the **Power mount plus a full recompute across the five-lever cross-product completes under 2 s**, including the `#distChart` distribution-canvas redraw over the eight outcome buckets and the `#ledgerTable` row build over the whole cohort. Every redraw is asserted to issue **zero** network requests and to call `compute(` **exactly once**, so the bound comes from `T-08-F1`'s fourth-rendering property holding under load rather than from a warm cache; a Power path that recomputed per panel would exceed the budget and fail the row. | `node --test tests/recommendation-track-record.stress.mjs` | No | `report.md#t-08-p1` |
| T-08-R1 | Regression E2E | `e2e-ui` | BS-011 (SCN-015-011) | `tests/recommendation-track-record-lab.spec.mjs` | **Persistent scenario regression for SCN-015-011.** A standing browser pass re-asserts that an apparent edge is still discounted for multiplicity: `#multiplicity` carries the family count, the trial count and **both** statistics side by side with the RL-007 labelling, `#cohortsViewed` still counts distinct lever tuples and gates nothing, `#calibTable` still renders one row per declared bucket including the zero-count row, and every canvas still has its same-data fallback table. It re-runs on every later pass, so a scope 10 change that drops the raw statistic, hides the trial count, or removes a fallback table fails here. | `npx --no-install playwright test tests/recommendation-track-record-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome` | Yes | `report.md#t-08-r1` |
| T-08-R2 | Regression E2E | `e2e-ui` | BS-011 | `tests/*.e2e.mjs`, `tests/*.spec.mjs` (committed suites, unfiltered) | **Broader E2E regression suite.** The repo's committed Node E2E files and the whole committed Playwright spec suite both run green after the Power panels and the structured chart adapter land, with no pre-existing test removed, skipped, or newly failing. Because this scope drives `rlchart.js`, `rlcontext.js` and `rlg.js` unmodified, this row is the proof that mounting a structured adapter did not perturb any other tool page that attaches a chart through the same shared modules. | `node --test tests/*.e2e.mjs && npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome` | Yes | `report.md#t-08-r2` |
| T-08-S1 | Project check | project check | — | `scripts/selftest.mjs` (unmodified) | The repo self-test is green after the Power panels, the adapter, the fixtures and the test cases land, at `952 + N passed, 0 failed`, with no pre-existing assertion count decreasing. | `node scripts/selftest.mjs` | No | `report.md#t-08-s1` |

**Test Plan rows: 23.** UI rows covered: UI-19 … UI-26 and UI-34 — **9 of 9 owned rows**, none deferred, plus the
named re-run of scope 07's UI-27 / UI-28 / UI-33.

---

### Definition of Done

#### Core items

- [ ] `renderPower` renders `#calibTable`, `#distChart`, `#multiplicity`, `#cohortsViewed` and `#ledgerTable`, all carrying `class="panel pw"` and hidden by scope 07's existing `body:not(.power) .pw` rule.
- [ ] Power is a **fourth rendering** of scope 07's deep-frozen `scorecard`; exactly one `compute(` call site exists on the page and no Power panel recomputes anything.
- [ ] `#calibTable` renders one row per **declared** stated-confidence bucket including zero-count buckets, which show `—` and `n = 0` and are never dropped.
- [ ] Every rate rendered in a Power panel goes through scope 07's **single** rate-emitting helper; this scope adds no second code path that can print a percentage.
- [ ] `#distChart` attaches via `RLCHART.attach` with the **structured adapter object**, routing to `attachStructured`; no bare hit-test function is passed on any path (P-015-05).
- [ ] The adapter satisfies the exact five-key set `contextFor` / `hitTest` / `orderedPointIds` / `seriesOrder` / `tableTargetFor` (`rlchart.js#L101`) with no sixth key.
- [ ] `orderedPointIds` is the eight outcome buckets `le-3, neg-2, neg-1, flat, pos-1, pos-2, pos-3, gt-3`; all are unique and match the point-id rule, and `flat` is present so HC-7 is visible on the rendered surface.
- [ ] Every `contextFor(pointId)` returns a `contextual-tooltip/v1` object that passes `RLCTX.validateContext`, including a real interpretation that is **not** a repetition of the label and value (`rlcontext.js#L232`).
- [ ] `contextFor(pointId).links.sameDataTable === "#" + tableTargetFor(pointId)` holds for every point, and `#distTable` carries **both** the `tableTargetFor` id binding and the `data-chart-fallback` attribute (P-015-06).
- [ ] Every canvas carries `data-rlchart-mode="structured"` and `tabIndex = 0`; **no** canvas carries `data-rlchart-migration-required`.
- [ ] Chart draws are gated on the active mode, redrawn on `resize`, and `attach()` is called at the **end** of each draw.
- [ ] `#multiplicity` displays `familyCount` and `trialCount` separately and both labelled, with the discounted statistic beside the raw one, labelled **directional evidence of overfitting, not a significance test** (RL-007).
- [ ] No statistic is computed in this scope: no local discount, no local mean, no local interval; `rlvDeflatedSharpe` is not called here and `rlvalidation.js` is not imported.
- [ ] `#cohortsViewed` counts **distinct** lever tuples via a `Set`, is **not persisted**, does not appear in `localStorage.rlTrackRecordLab`, and blocks or disables nothing.
- [ ] `#ledgerTable` shows claim reference, subject, closure event, resolution date, signed outcome and contributing cohort tags per closure; `resolved-flat` is its own labelled outcome and is never merged into unresolved or shown as a bare `0`.
- [ ] Ledger deep links are `a[data-owner-tool][href$=".html"]` derived from the claim's `lifecycleTerms.originToolId`; back-navigation restores mode and levers via scope 07's persisted state.
- [ ] Every element matching the **committed fifteen-member** `GLOSSARY_SELECTOR` introduced by a Power panel carries a contextual `title` stating both what the item is and what the current reading means (P-015-10).
- [ ] `Number.isFinite` is used exclusively; the global `isFinite` appears nowhere in 015-authored code.
- [ ] Every `—` in a Power panel carries a tooltip naming what is missing and why.
- [ ] This scope creates no HTML file, adds no lever, writes no persisted UI key, and modifies no scope-07 surface other than mounting its panels into the existing Power container.
- [ ] The Consumer Impact Sweep above is executed at the end of the scope and zero stale first-party references remain: every panel id, every `orderedPointIds` member with its `#distTable` row id, every emitted `a[data-owner-tool]` href, and the persisted `rlTrackRecordLab` key are scanned repo-wide with the raw output recorded in `report.md`, every href resolves to a committed root `*.html` and a live `tools.json` entry, and `node scripts/validate-tool-experience.mjs` is green.

#### Test items

- [ ] T-08-U1 passes: the exact five-key adapter set is enforced per key with each structural refusal asserted → evidence recorded in `report.md#t-08-u1`.
- [ ] T-08-U2 passes: the eight bucket point-ids are exact, unique and rule-conformant, and `flat` is present → evidence recorded in `report.md#t-08-u2`.
- [ ] T-08-U3 passes: every context validates and a label-only interpretation is rejected at `rlcontext.js#L232` → evidence recorded in `report.md#t-08-u3`.
- [ ] T-08-U4 passes: the `links.sameDataTable` / `tableTargetFor` equality holds for every point and a mismatch refuses → evidence recorded in `report.md#t-08-u4`.
- [ ] T-08-U5 passes: zero-count calibration buckets render and dropping one fails the declared-count assertion → evidence recorded in `report.md#t-08-u5`.
- [ ] T-08-U6 passes: multiplicity figures are read verbatim with zero local discount arithmetic → evidence recorded in `report.md#t-08-u6`.
- [ ] T-08-F1 passes: Power is a fourth rendering with exactly one `compute(` call site → evidence recorded in `report.md#t-08-f1`.
- [ ] T-08-F2 passes: the structured path is taken, the a11y stamps are present, and the legacy path is proven distinguishable → evidence recorded in `report.md#t-08-f2`.
- [ ] T-08-F3 passes: every point resolves to a real table row and both binding mechanisms are carried → evidence recorded in `report.md#t-08-f3`.
- [ ] T-08-F4 passes: `#cohortsViewed` is distinct-counting, unpersisted and non-blocking → evidence recorded in `report.md#t-08-f4`.
- [ ] T-08-E1 passes: UI-19 resolved-flat is separately labelled and never a bare `0` → evidence recorded in `report.md#t-08-e1`.
- [ ] T-08-E2 passes: UI-20 + UI-21 calibration drill with the zero-count bucket rendered → evidence recorded in `report.md#t-08-e2`.
- [ ] T-08-E3 passes: UI-22 multiplicity panel shows both statistics with the RL-007 labelling → evidence recorded in `report.md#t-08-e3`. — proves SCN-015-011
- [ ] T-08-E4 passes: UI-23 distinct cohort-shopping count with `/best of/` copy and nothing blocked → evidence recorded in `report.md#t-08-e4`.
- [ ] T-08-E5 passes: UI-24 hover tooltip carries bucket, count and real interpretation, and keyboard access works → evidence recorded in `report.md#t-08-e5`.
- [ ] T-08-E6 passes: UI-25 every canvas has a same-data fallback table reachable by keyboard → evidence recorded in `report.md#t-08-e6`.
- [ ] T-08-E7 passes: UI-26 raw ledger audit rows are complete and every symbol is linked → evidence recorded in `report.md#t-08-e7`.
- [ ] T-08-E8 passes: UI-34 deep link navigates out and back-navigation restores mode and levers → evidence recorded in `report.md#t-08-e8`.
- [ ] T-08-E9 passes: UI-27 + UI-28 + UI-33 re-run green with every Power panel rendered, over the committed fifteen-member selector → evidence recorded in `report.md#t-08-e9`.
- [ ] T-08-P1 passes: Simple first paint stays under 1 s with the `pw` panels undrawn, the Power mount plus the full lever cross-product recompute stays under 2 s on an oversized ledger, and every redraw issues zero network requests with exactly one `compute(` call → evidence recorded in `report.md#t-08-p1`.
- [ ] Scenario-specific E2E regression tests for every new/changed/fixed behavior in this scope pass — [T-08-R1] the side-by-side multiplicity statistics with RL-007 labelling, the distinct non-gating cohort count, the declared-bucket calibration rows, and every canvas's same-data fallback table all re-assert as a standing guard → evidence recorded in `report.md#t-08-r1`.
- [ ] Broader E2E regression suite passes unchanged — [T-08-R2] the committed Node E2E files and the whole committed Playwright spec suite are green, proving the structured chart adapter perturbed no other tool page attaching through `rlchart.js` → evidence recorded in `report.md#t-08-r2`.
- [ ] T-08-S1 passes: `node scripts/selftest.mjs` reports `952 + N passed, 0 failed` with no pre-existing assertion count decreasing → evidence recorded in `report.md#t-08-s1`.

**Test-related DoD items: 23. Test Plan rows: 23. Parity confirmed.**

**The page-wide re-run (T-08-E9) is a named DoD item, not an implied one**, per the page-wide re-run obligation
recorded in `scopes/_index.md` → `## UI Scenario ownership map`. Re-running is not co-ownership: UI-27, UI-28 and
UI-33 remain scope 07's rows.

#### Build Quality Gate

- [ ] Zero warnings across `node --test`, the Playwright run and `node scripts/selftest.mjs`; zero console errors on any rendered Power panel; zero issues deferred, skipped, or worked around; every negative test verified to fail when the behaviour it guards is reverted; `rlchart.js`, `rlcontext.js`, `rlg.js`, `rlticker.js`, `rlvalidation.js`, `rlcontracts.js`, `rldata.js`, `rlbrief.js`, `rlmarketaction.js`, `rlapp.js` and `rlnav.js` all byte-unmodified; `spec.md`, `design.md` and `scopes/_index.md` unmodified by this scope; no other scope directory and no other spec's artifacts touched.

---

### Files and surfaces this scope must not touch

| Surface | Why it is excluded |
|---|---|
| `rlvalidation.js` | **Feature 007-owned, consume-only.** This scope computes no statistic. `familyCount`, `trialCount`, both multiplicity figures, every calibration rate and every range arrive on the scope-05 scorecard already produced by a named `RLVALID` primitive. A number this scope cannot find there is a scope-05 gap to route, never a locally-computed value. |
| `rlcontracts.js` reducer and `CLOSE_EVENT_TYPES` | **Feature 002-owned, consume-only.** `#ledgerTable` and `#closureMix` **render** closure labels drawn from the vocabulary; no closure is emitted, the reducer is never forked, and the vocabulary is never extended. |
| The persisted `rldata.js` cache schema | **Feature 013-protected (FR-021, AC-012).** This scope persists nothing at all — not even `#cohortsViewed`, which is session-only by design. No derived statistic is written to any cache. |
| The Market Action Center four-view composition | **Feature 012-owned (`RLMKT-VIEW`).** `CENTER_VIEW_IDS` is frozen at four (`rlmarketaction.js#L77`) and refused at five checkpoints. This scope writes no Center `viewOrder`, `views` or `viewState` and declares no view id. HC-3 holds by non-participation. |
| `rlchart.js`, `rlcontext.js`, `rlg.js`, `rlticker.js`, `rlapp.js`, `rlnav.js` | Shared-shell modules, consume-only. The adapter contract, the context validator and the glossary escape hatch are all **worked with** — never patched, shimmed, suppressed, or shadowed. `attachLegacy` is avoided by passing an object, not by editing the dispatch at `rlchart.js#L365`. |
| `recommendation-track-record-lab.html` scaffold, load order, `compute()`, `renderSimple`, `#modeSeg`, `#levers`, `#coverageLine`, `#noAdviceNotice` | Scope 07. This scope mounts panels into the existing Power container and changes no part of the shell, the mode mechanism, the lever set, or the honesty furniture. |
| The scope-05 cohort model, constants, denominator, bounds and derived counts | Scope 05. Including the deflated-Sharpe guard: when it produced `—`, this scope renders `—`, it does not retry the primitive with looser inputs. |
| `buildOwnerRead`, `buildMetrics`, `RLDATA.putToolRead` | Scope 06. Power adds no field to the owner read and publishes nothing. |
| `scripts/brief-resolve-outcomes.mjs`, `briefs/objects/**`, `briefs/history/**` | Scopes 01, 02 and 04. The ledger table **reads** committed artifacts; it never writes, amends, or deletes one. |
| `tools.json`, `index.html`, `rlnav.js` `TOOLS`, `journeys.json`, `simple-models.json` | **Counted registries — scope 10 only.** While scope 10 is unscheduled the page runs unregistered, reachable by direct URL, with `node scripts/validate-tool-experience.mjs` green throughout. |
| `scripts/validate-recommendation-track-record.mjs` | The consolidated validator is scope 09. This scope owns no `RTR-*` code of its own; its obligations are proven by `node --test` and Playwright. |
| Any other `scopes/NN-*/` directory in this feature | Each scope owns its own directory. This scope writes only `scopes/08-power-view-and-charts/`. |
| Any other `specs/**` directory | Specs 002, 012, 013, 014 and 016 are authored by concurrent sessions and are neither read for mutation nor written. |

---

*Educational research context only — not investment advice.*
