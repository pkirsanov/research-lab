# Scope 5: Brief Read And Provenance Render

## 05-brief-read-and-provenance-render

**Status:** Not started
**Scope-Kind:** ui-behavior
**Tags:** render, partial-resolution, provenance, accessibility
Depends On: Scope 4 — a published payload carrying the resolved families and `curveAdmission`

**Primary Outcome:** The `.toolread` bond card renders the three publication
states — fresh, stale and absent — in one card geometry, with the credit and
duration axes always as two separate labelled rows and never fused into one
verdict line, and with the machine value `unavailable` never painted. The
*Source, freshness and rights* table in `bond-regime-lab.html` gains an
*Observed as of* and a *Retrieved* column on the two official rows, so a reviewer
reads source id, source URL, publisher date and retrieval time in one order.
Freshness is carried by shape glyph plus word, never by colour alone.

## Requirement Coverage

- FR-018-009, FR-018-010, FR-018-011, FR-018-012 — the provenance row renders the
  state, the error code as words, the source id, the source URL, the observation
  as-of, the retrieval time and the rights class for every family.
- FR-018-015 — no restricted value and no credential reaches any rendered cell.
- FR-018-016, FR-018-020, FR-018-021 — the stale card names its reason, its
  expected date and its last good as-of, and the underivable-freshness case
  renders `○ Unavailable` with its observation-count basis.
- FR-018-025, FR-018-026, FR-018-028 — curve level and curve impulse are two rows
  with two labels and two state tokens, and real yield and derived breakeven
  never share a row, a token or an as-of.
- FR-018-029, FR-018-030, FR-018-031, FR-018-034 — the absent card is the form
  the brief publishes today, and no state renders a zero, a bare dash or a
  neutral filler value.
- FR-018-035 — the partial-resolution card states that one axis resolved and one
  did not, and names the credit gap alone.
- Routed item **R-2** — the underivable-freshness wording states the observation
  count, which is the basis the observed-cadence rule actually uses.

## Gherkin Scenarios

```gherkin
Scenario: SCN-018-032 The partial-resolution card renders both axes separately
  Given a published bond read whose duration axis resolved and whose credit axis did not
  When the bond card renders
  Then the credit axis and the duration axis appear as two labelled rows in that order
  And neither is hidden, merged into the other, or reduced to a single status word
  And the machine value unavailable is not painted anywhere in the card
  And the card states in words that one axis resolved, one did not, and no sleeve is ranked

Scenario: SCN-018-033 The stale card names its reason and its last good observation
  Given a published bond read whose curve families were withheld as stale
  When the bond card renders
  Then each family row carries the stale shape glyph and the word Stale
  And the reason names the expected publication basis and the derived window
  And the last good observation date is shown and explicitly labelled as not current
  And no classification is shown beside a stale family

Scenario: SCN-018-034 The absent card is the form published today
  Given no published official curve artifact exists
  When the bond card renders
  Then the three family rows carry the unavailable shape glyph and the word Unavailable
  And the reason states that nothing was substituted — no zero, no neutral filler, no carried value
  And the read paragraph is the published string rendered verbatim

Scenario: SCN-018-004 The provenance row is complete and traceable
  Given the Source freshness and rights table with a fresh nominal family
  When a reviewer reads the nominal row
  Then it carries the source id, the host, the observation as-of and the retrieval time labelled UTC
  And the source URL is an https URL on the declared official host reachable from the row
  And no cell is an empty string or a bare dash

Scenario: SCN-018-018 No restricted value is rendered anywhere
  Given a published bond read of any state
  When the card and the source table are inspected
  Then no oas value, no financial-conditions value and no restricted source URL appears
  And each restricted family row names its rights class and renders no link and no value

Scenario: SCN-018-035 Underivable freshness states its observation count
  Given the admission verdict for a family is undetermined
  When the bond card renders
  Then the family carries the unavailable shape glyph rather than the stale one
  And the reason states how many observed gaps were available against the number required
  And the card asserts neither that the family is current nor that it is stale
```

## Implementation Files

### Modified

- `market-brief.html`
- `rlbrief.js`
- `bond-regime-lab.html`
- `tests/bond-regime-lab.spec.mjs`
- `notes/bond-regime-lab.md`
- `notes/market-brief.md`

## Implementation Plan

1. Extend the `.toolread` bond card in `rlbrief.js` `renderToolReads` with two
   axis rows as a `<dl>`, credit first then duration, always both present, each
   carrying its state and its basis.
2. Map every machine value to reader-visible words at the render boundary:
   `state: "unavailable"` with one axis resolved becomes the one-axis-resolved
   sentence, `Indeterminate` becomes *Not resolved*, `preferredSleeveId: null`
   becomes the no-sleeve-ranked clause. No unmapped slug is painted.
3. Render the published `read` string verbatim in its own paragraph. Do not
   re-derive, re-order or paraphrase it, and do not duplicate it into an
   `aria-label`.
4. Render the three family rows — curve level, curve impulse, inflation — each
   with a state token composed of a shape glyph and the state word, so removing
   all colour leaves the state fully readable.
5. Render the stale variant from `curveAdmission`: the reason from the admission
   basis, the last good observation from `lastGoodObservedAt` with its
   not-current qualifier in the same accessible name, and a restore sentence
   stated as a condition rather than offered as a control.
6. Render the undetermined variant with the unavailable glyph and an
   observation-count reason, settling routed item **R-2**. The rendered basis is
   the count the rule actually used, taken from the admission block, not a
   calendar coverage range.
7. Leave the absent variant's published string untouched. Its geometry is the
   same as the other two so a reader who has learned one has learned all three.
8. Add *Observed as of* and *Retrieved* columns to the existing
   `<table id="sourceStatusTable">` in `bond-regime-lab.html`, keeping the column
   order identical for every family and rendering the kind of absence in any cell
   that has no value. Use `Number.isFinite` rather than the global `isFinite` and
   keep the file single-file with no build step.
9. Render each restricted family row with its rights class, no link, no copy
   affordance and no expandable value.
10. Give every rendered term and every dynamic value a two-part contextual
    tooltip — what the field is, then what this reading of it means — reachable
    by keyboard focus and by an explicit information target, with identical
    content across focus, activation and hover.
11. Add the browser rows to `tests/bond-regime-lab.spec.mjs`, driving each state
    from a committed payload fixture rather than from a live acquisition, so the
    rows are deterministic.
12. Record the rendering rules in `notes/bond-regime-lab.md` and the bond-card
    changes in `notes/market-brief.md`.

## Shared Infrastructure Impact Sweep

| Shared surface | Change in this scope | Downstream consumers | Blast radius | Canary | Rollback proof |
| --- | --- | --- | --- | --- | --- |
| `rlbrief.js` `renderToolReads` | Bond card branch extended | Every tool-read card on the brief | High — a throw in one card's branch can empty the whole drawer | Render the committed payload with every other tool read present and assert each still paints before adding the bond branch's new rows | Restore the prior bond branch; the shared renderer is otherwise untouched |
| `market-brief.html` | Bond card markup and styles | The Brief view and its first-load budget | Medium — added markup counts against the measured budget headroom | Run the first-load budget assertion before and after | Revert the markup |
| `bond-regime-lab.html` `sourceStatusTable` | Two columns added | The tool's own source table | Medium — a changed column order makes an existing row unreadable | Assert the pre-existing four columns keep their order and their content | Remove the two added columns |
| `tests/bond-regime-lab.spec.mjs` | Rows appended | The browser gate for the bond tool | Medium — a live-data row would flake | Every appended row drives a committed payload fixture; assert no network call is required | Remove the appended rows |

## Change Boundary And Protected Paths

**Allowed:** `market-brief.html` · `rlbrief.js` · `bond-regime-lab.html` (the
`sourceStatusTable` markup and its rendering only) · `tests/bond-regime-lab.spec.mjs` ·
`notes/bond-regime-lab.md` · `notes/market-brief.md`.

**Excluded (must remain byte-identical in this scope):** every classifier in
`bond-regime-lab.html` — `parseTreasuryCurveCsv`, `classifyCurveState`,
`classifyCurveImpulse`, `deriveBreakevenRows`, `classifyInflationState`,
`classifyDurationPosture`, `selectResearchExpression`, `computeBondLabViewModel` —
plus `bond-regime-universe.json` · `rlcontracts.js` ·
`scripts/owner-state.mjs` · `scripts/brief-refresh.mjs` ·
`scripts/acquire-official-curves.mjs` · `scripts/validate-official-curves.mjs` ·
`scripts/selftest.mjs` — plus every file a concurrent session holds:
`market-brief.config.json` · `market-brief.config.page.json` ·
`market-brief.page.json` · `market-brief.payload.json` ·
`market-brief.experimental.json` · `scripts/build-attention-items.mjs` ·
`tests/attention-payload-contract.test.mjs` · `notes/README.md`.

This scope touches `bond-regime-lab.html` for its source table only. The
classifier functions in the same file are on the excluded list, because a render
scope that reaches into a classifier to make a card look resolved is the exact
failure the one-model constraint exists to prevent.

**Allowed file families.**

| Family | Members | Why this scope may touch it |
| -------- | --------- | ----------------------------- |
| Brief renderer | `rlbrief.js`, `market-brief.html` | Where the three publication states are painted. |
| Tool source table | the `sourceStatusTable` markup in `bond-regime-lab.html` | Where the two provenance columns belong. |
| Bond browser spec | `tests/bond-regime-lab.spec.mjs` | The existing browser gate for this tool. |
| Tool and brief notes | `notes/bond-regime-lab.md`, `notes/market-brief.md` | Where the rendering rules belong. |

**Excluded surfaces.**

| Surface | Members | Owner |
| --------- | --------- | ------- |
| The model | every classifier in `bond-regime-lab.html` | Unchanged by this feature |
| Contract, gate, acquisition, admission, consumption | `rlcontracts.js`, `scripts/validate-official-curves.mjs`, `scripts/acquire-official-curves.mjs`, `scripts/brief-refresh.mjs`, `scripts/owner-state.mjs` | Scopes 1-4 |
| Project test harness | `scripts/selftest.mjs` | Scopes 1-4 and 6 |
| Concurrently held brief artifacts | `market-brief.config.json`, `market-brief.config.page.json`, `market-brief.page.json`, `market-brief.payload.json`, `market-brief.experimental.json`, `scripts/build-attention-items.mjs`, `tests/attention-payload-contract.test.mjs`, `notes/README.md` | A concurrent session |

## Rollback

Restore the prior bond branch in `rlbrief.js`, revert the bond card markup in
`market-brief.html`, remove the two added columns from the `sourceStatusTable` in
`bond-regime-lab.html`, and remove the appended rows from
`tests/bond-regime-lab.spec.mjs`. Prove the restore by running
`npx --no-install playwright test tests/bond-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome`
and recording a green run against the restored markup, and by running
`node scripts/selftest.mjs` and recording exit 0.

## Scenario-First RED/GREEN Contract

RED: author the six scenarios first against committed payload fixtures for the
fresh, stale, absent and undetermined states. Record the partial-resolution
fixture painting the raw `unavailable` slug, and record the stale fixture showing
a classification beside a withheld family — both are the reader-facing defects
this scope removes.

GREEN: the partial-resolution card renders two axis rows with no slug painted and
no fusion at either width; the stale card names its reason, its window and its
last good as-of with the not-current qualifier inside the accessible name; the
absent card renders the published string verbatim; the undetermined card carries
the unavailable glyph and an observation-count reason; the provenance row carries
six populated cells with no empty string and no bare dash; and no restricted
value appears in any rendered cell.

## Test Plan

| ID | Type | Category | Scenario | File | Exact Behavior / Persistent Title | Command | Live System | Evidence Anchor |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TP-05-01 | Render | e2e-ui | SCN-018-032 | `tests/bond-regime-lab.spec.mjs` | BS-018-017 render: the bond card shows credit and duration as two labelled rows in that order, paints no `unavailable` slug, and states in words that one axis resolved, one did not, and no sleeve is ranked | `npx --no-install playwright test tests/bond-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome` | Yes | `report.md#tp-05-01` |
| TP-05-02 | Render | e2e-ui | SCN-018-033 | `tests/bond-regime-lab.spec.mjs` | BS-018-009 render: a stale read paints the stale glyph and the word Stale on each family row, names the derived window as its reason, shows the last good observation with its not-current qualifier in the accessible name, and shows no classification beside a withheld family | `npx --no-install playwright test tests/bond-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome` | Yes | `report.md#tp-05-02` |
| TP-05-03 | Render | e2e-ui | SCN-018-034 | `tests/bond-regime-lab.spec.mjs` | BS-018-015 render: with no artifact the three family rows carry the unavailable glyph and word, the reason states that nothing was substituted, and the published read paragraph matches the payload string verbatim | `npx --no-install playwright test tests/bond-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome` | Yes | `report.md#tp-05-03` |
| TP-05-04 | Provenance | e2e-ui | SCN-018-004 | `tests/bond-regime-lab.spec.mjs` | the Source freshness and rights table renders source id, host, observation as-of and retrieval time labelled UTC for each official family, the source URL is `https` on `home.treasury.gov`, and no cell is an empty string or a bare dash | `npx --no-install playwright test tests/bond-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome` | Yes | `report.md#tp-05-04` |
| TP-05-05 | Security sweep | e2e-ui | SCN-018-018 | `tests/bond-regime-lab.spec.mjs` | no oas value, financial-conditions value or restricted source URL appears in the rendered card, the source table or any persisted browser store, and each restricted row names its rights class with no link and no value | `npx --no-install playwright test tests/bond-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome` | Yes | `report.md#tp-05-05` |
| TP-05-06 | Render | e2e-ui | SCN-018-035 | `tests/bond-regime-lab.spec.mjs` | BS-018-010 render: an undetermined admission paints the unavailable glyph rather than the stale one and states the available observed-gap count against the required count, asserting neither current nor stale — routed item R-2 settled in the rendered basis | `npx --no-install playwright test tests/bond-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome` | Yes | `report.md#tp-05-06` |
| TP-05-07 | Separation | e2e-ui | SCN-018-032 | `tests/bond-regime-lab.spec.mjs` | curve level and curve impulse render as two rows with two labels and two state tokens at both widths, real yield and derived breakeven never share a row or an as-of, and the breakeven row names its common-date count against the nominal count | `npx --no-install playwright test tests/bond-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome` | Yes | `report.md#tp-05-07` |
| TP-05-08 | Regression E2E | e2e-ui | SCN-018-032 · SCN-018-034 | `tests/bond-regime-lab.spec.mjs` | Regression: every state is readable with all colour removed and at 200% zoom, the two axes never fuse into adjacent tiles at any width, and every existing bond-tool row in this spec still passes — a card that gained a partial-resolution state must not take the tool's committed browser coverage with it | `npx --no-install playwright test tests/bond-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome` | Yes | `report.md#tp-05-08` |

### Definition of Done - Tiered Validation

#### Core Delivery Items

- [ ] The credit and duration axes render as two labelled rows in that order, always both present and never merged, proven by TP-05-01 and TP-05-07.
- [ ] The machine value `unavailable` is not painted anywhere in the card, and every internal slug is mapped to reader-visible words at the render boundary, proven by TP-05-01.
- [ ] The published `read` string renders verbatim in its own paragraph and is not re-derived, paraphrased or duplicated into an `aria-label`, proven by TP-05-03.
- [ ] Every state token is a shape glyph plus the state word, so all three states remain distinguishable with colour removed and at 200% zoom, proven by TP-05-08.
- [ ] The stale variant names its reason and its derived window, shows the last good observation with the not-current qualifier inside the accessible name, and shows no classification beside a withheld family, proven by TP-05-02.
- [ ] **R-2 settled:** the underivable-freshness variant carries the unavailable glyph and states the observed-gap count against the required count, asserting neither current nor stale, proven by TP-05-06.
- [ ] The absent variant is the form the brief publishes today, with an explicit statement that nothing was substituted, proven by TP-05-03.
- [ ] The `sourceStatusTable` carries *Observed as of* and *Retrieved* as separate columns in a fixed order for every family, with no empty string and no bare dash in any cell, proven by TP-05-04.
- [ ] Each restricted family row names its rights class and renders no source URL, no link and no value, proven by TP-05-05.
- [ ] Curve level and curve impulse never share a row or a token, and real yield and derived breakeven never share a row or an as-of, proven by TP-05-07.
- [ ] Every rendered term and dynamic value carries a two-part contextual tooltip reachable by keyboard focus and by an explicit information target, with identical content across focus, activation and hover, proven by TP-05-01 and TP-05-04.
- [ ] `bond-regime-lab.html` browser code introduced here is single-file with no build step and uses `Number.isFinite` rather than the global `isFinite`, verified by reading the committed diff.
- [ ] Every classifier in `bond-regime-lab.html` is byte-identical, verified by `git diff` on that file showing changes confined to the source-table markup and its rendering.

#### Test Evidence Items - Exact Parity With 8 Test Plan Rows

- [ ] TP-05-01 executed with raw output recorded at `report.md#tp-05-01`.
- [ ] TP-05-02 executed with raw output recorded at `report.md#tp-05-02`.
- [ ] TP-05-03 executed with raw output recorded at `report.md#tp-05-03`.
- [ ] TP-05-04 executed with raw output recorded at `report.md#tp-05-04`.
- [ ] TP-05-05 executed with raw output recorded at `report.md#tp-05-05`.
- [ ] TP-05-06 executed with raw output recorded at `report.md#tp-05-06`.
- [ ] TP-05-07 executed with raw output recorded at `report.md#tp-05-07`.
- [ ] TP-05-08 executed with raw output recorded at `report.md#tp-05-08`.

#### Build Quality Gate

- [ ] `npx --no-install playwright test tests/bond-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome` exits 0 with zero skipped tests.
- [ ] `node scripts/selftest.mjs` exits 0 on the working tree, including the legibility and first-load budget assertions.
- [ ] `node scripts/validate-brief-payload.mjs` exits 0 against the committed payload.
- [ ] `node scripts/validate-spec-test-paths.mjs` exits 0.
- [ ] No path excluded from this scope was modified BY this scope; `git diff --name-only` output is recorded verbatim and names only files in the Allowed table.
- [ ] Zero warnings emitted by any command run for this scope, evidenced by unfiltered output of every command above.
