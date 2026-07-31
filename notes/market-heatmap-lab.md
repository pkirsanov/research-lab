# Market Heatmap Lab — notes

> **Status: LIVE (repository implementation, 2026-07-30).** The single-file tool
> is [`../market-heatmap-lab.html`](../market-heatmap-lab.html), registered in
> [`../index.html`](../index.html), [`../tools.json`](../tools.json), and
> [`../rlnav.js`](../rlnav.js). `LIVE` describes the current repository
> implementation and its persistent source/test contract. It does not assert a
> GitHub Pages deployment or remote-bundle verification.
>
> **Educational only — not investment advice.** Every market reading is a
> delayed/EOD, in-browser computation over provider-attributed data acquired
> through the shared data layer.
>
> **Discovery source.** Mined from TradingView's Heatmaps (stock / ETF / crypto)
> during the 2026-07-08 QuantitativeFinance competitor review
> (TradingView + Unusual Whales). The heatmap is the single cheapest,
> highest-signal whole-market-at-a-glance view in the lab and a focused drill-in
> surface for breadth and rotation research.

---

## Purpose

Answer one question at a glance: **where is the money today — which sectors and
which names are green vs red, and how big is each?** A squarified treemap where
each tile is a stock or sector basket, **grouped by the selected view**, **sized
by index weight, dollar volume, or equal weight**, and **colored by return**
(1-day, 1-week, or 1-month).

It is the "market map" sibling to the
[Sector Rotation & Momentum Lab](sector-research-lab.md) (which answers *which
sector to rotate into*) — the heatmap answers *what is happening right now across
the whole surface* and lets the eye find the outliers (a single red tile in a
green sector, a whole sector rolling over) before any table would.

---

## Outcome Contract

- **Intent.** Give a researcher a fast, honest, in-browser **whole-market
  treemap** that makes sector strength/weakness and single-name outliers obvious
  at a glance, computed from data they fetch themselves — no paywalled vendor.
- **Success signal.** After terminal owner hydration, the tool renders a
   squarified treemap, breadth diagnostics, and constituent evidence from one
   owner state. Simple exposes five registry controls; Power exposes three native
   treemap controls. Every lever changes its owned interpretation locally.
- **Hard constraints.** (1) All sizing/coloring is recomputed in-browser from the
   hydrated owner evidence — no stored/blackbox result. (2) Simple and Power use
   the same owner evidence and formulas; no page-specific Simple model exists.
   (3) Reuse the shared `rlData` cache and acquire the missing boot delta once;
   lever changes never acquire data. (4) Canvas is drawn **synchronously** in
   `render()` (never inside
  `requestAnimationFrame` — it does not fire in hidden/background tabs), debounced
  only on resize. (5) Every `<canvas>` carries an `aria-label` + a text fallback
  table (WebKit a11y).
- **Failure condition.** The tool fails if it implies real-time data it does not
  have (label freshness honestly), if tile **area** does not faithfully encode the
  size metric (a broken treemap is worse than a table), or if the color scale is
  ambiguous about direction/magnitude.

---

## Data, model, and provenance

The current implementation uses the established shared data path:

| Field | Source | Mechanism |
|---|---|---|
| Constituent bars and 1d/1w/1m returns | Shared `RLDATA` cache plus its configured provider path | Cache-first paint, then `RLDATA.ensureBars` for only the missing boot delta |
| Index-weight sizing | Curated weights in [`../sector-universe.json`](../sector-universe.json) | A market-cap proxy, not a live market-cap quote |
| Dollar-volume sizing | Price × volume from hydrated bars | Recomputed in-browser |
| Equal sizing | One unit per rendered cell | Recomputed in-browser |
| Group membership | Curated entries and `sectorMap` constituents in [`../sector-universe.json`](../sector-universe.json) | One deduplicated boot union supports both groupings |
| Simple projection | Page owner provider → `simple-adapter/market-breadth/v1` | Production adapter recomputation over the hydrated owner snapshot |

Rendering: a **squarified treemap** on `<canvas>` — group rectangles per sector,
sub-divide each by the selected size metric, fill by a diverging color scale
(red↔green) keyed to the color metric. Pure-function layout (area-conserving) so
it is unit-testable in `selftest.mjs`.

Honest limits: readings are delayed/EOD; index weight is a market-cap proxy;
provider failures or incomplete bars can leave cells unpriced. The terminal
hydration marker means the acquisition attempt settled, not that sufficient
model evidence necessarily exists.

---

## Simple

Direct Simple can first render an honest `unavailable` projection while the
page's owner evidence is still incomplete. When boot hydration reaches its
terminal boundary, the page asks the shared production bridge to reread that
owner state. Sufficient evidence automatically requalifies the panel to
`ready` without a mode toggle, reload, manual refresh, synthetic event, request
interception, or service worker. Genuinely insufficient settled evidence remains
honestly `unavailable`.

Ready Simple renders the production `simple-adapter/market-breadth/v1`
projection and exactly five registry controls:

| Registry control | Domain | Effect |
|---|---|---|
| `window` | `1d`, `1w`, `1m` | Selects the return window used to classify leadership |
| `grouping` | `sector`, `industry` | Selects the breadth aggregation grouping |
| `size-metric` | `index-weight`, `dollar-volume`, `equal` | Selects constituent weighting |
| `breadth-threshold` | 0–100%, step 1 | Sets the threshold for broad leadership |
| `outlier-sigma` | 0.5–4σ, step 0.25 | Sets the within-group outlier threshold |

Every Simple control locally recomputes the production projection over the
already-hydrated owner state. A control change performs no provider read, fetch,
storage mutation, or other acquisition.

## Power

Power keeps the native controls beside the treemap and diagnostics:

| Native group | Options | Owned interpretation |
|---|---|---|
| `#winSeg` | 1 day, 1 week, 1 month | Treemap color window and constituent returns |
| `#sizeSeg` | Weight, dollar volume, Equal | Treemap tile area and constituent sizing |
| `#grpSeg` | Constituents, Sectors | Treemap grouping and breadth diagnostics |

Each segmented button carries explicit `aria-pressed="true|false"` state, with
exactly one selected button per group. Keyboard activation moves the semantic
selection and the existing visual selection together. Keyboard focus matches
`:focus-visible` and paints a non-transparent 3px outline. The selected lever
updates its owned diagnostics and repaints the treemap.

Power also exposes the sector breadth strip, sortable constituent fallback
table, sector-relative evidence, and outlier diagnostics. The table remains the
text alternative to the canvas.

---

## One owner state, one acquisition cycle

Boot paints from cache first, then hydrates one deduplicated symbol union built
from enabled universe entries and every `sectorMap` constituent. That one union
feeds both groupings and both views. The terminal boundary settles acquisition,
renders the owner state, marks hydration `ready`, and requests the Simple bridge
refresh in that order.

After hydration, all five Simple controls and all three Power groups are pure
local recomputations. They do not call `fetchDelta`, `RLDATA.ensureBars`,
`fetch`, or `providerFetch`. This preserves the established **one compute → both
views** contract: Simple and Power interpret the same owner evidence with the
same production formulas rather than maintaining a second cache, provider,
adapter, or page-specific Simple model.

## Research boundary

The heatmap owns the full breadth map and constituent drill-down. A brief or
other cockpit may summarize or deep-link to that analysis, but should not copy
the map's model. This ownership statement does not imply that a particular
remote bundle currently contains the implementation.

---

## Version history

| Date | Change |
|---|---|
| 2026-07-08 | Initial design note authored from the QF competitor review; v1.0 single-file implementation and registry entries added. |
| 2026-07-30 | BUG-004 source contract documented: automatic terminal-hydration requalification, five production Simple controls, accessible native Power controls, one boot-hydrated union, and zero post-hydration acquisition. No Pages or remote-bundle claim added. |
