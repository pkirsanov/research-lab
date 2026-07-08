# Market Heatmap Lab — notes

> **Status: LIVE (v1.0, 2026-07-08).** Single-file tool:
> [`../market-heatmap-lab.html`](../market-heatmap-lab.html). Registered in
> [`../index.html`](../index.html) `TOOLS`, [`../tools.json`](../tools.json), and
> [`../rlnav.js`](../rlnav.js); pure math covered by `scripts/selftest.mjs`
> (squarified-treemap area-conservation / non-overlap, heat-color monotonicity,
> breadth). **Educational only — not investment advice.** Every number is a
> delayed / EOD read computed in-browser from public data you fetch yourself.
>
> **As built (v1):** tiles are sized by **index weight** (a market-cap proxy from
> `sector-universe.json` sectorMap) by default, or **dollar-volume** (price ×
> volume from cached bars) or **equal**; colored by 1d / 1w / 1m return; grouped by
> sector (constituents) or the 11 sector ETFs. Cache-first auto-hydrate via
> `RLDATA.ensureBars` (delta-only), canvas hover via `RLCHART.attach`, tickers via
> `RLTKR`, terms via `RLG`. The req-8 per-tool `toolReads` emission (so the brief
> auto-covers this tool) lands with the brief auto-discovery refactor — done
> uniformly across tools, not one-off here.
>
> **Discovery source.** Mined from TradingView's Heatmaps (stock / ETF / crypto)
> during the 2026-07-08 QuantitativeFinance competitor review
> (TradingView + Unusual Whales). The heatmap is the single cheapest,
> highest-signal "whole-market-at-a-glance" view we do not yet have, and it feeds
> the Market Brief's regime/rotation cards.

Proposed single-file tool: `../market-heatmap-lab.html` (not yet built)
Proposed editable universe: `../market-heatmap-universe.json` (not yet built) —
may instead reuse [`../sector-universe.json`](../sector-universe.json).

---

## Purpose

Answer one question at a glance: **where is the money today — which sectors and
which names are green vs red, and how big is each?** A squarified treemap where
each tile is a stock (or ETF/crypto), **grouped by sector**, **sized by market
cap** (or an equal-weight / dollar-volume alternative), and **colored by return**
(default: 1-day % change; togglable to 1-week / 1-month / RS-vs-benchmark).

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
- **Success signal.** After one fetch, for a default universe (S&P sectors +
  their large-cap constituents), the tool renders a squarified treemap grouped by
  sector, sized by market cap, colored by 1-day % change, with a hover/tap tile
  detail (name, %chg, mkt cap, RS-vs-SPY) and a color-scale legend — and a user
  can name the strongest and weakest sector and the biggest single-name outlier
  **without leaving the page**.
- **Hard constraints.** (1) All sizing/coloring is recomputed in-browser from the
  fetched quotes — no stored/blackbox numbers. (2) Every choice (size metric,
  color window, grouping, benchmark for RS) is a documented, user-toggleable
  lever. (3) Reuse the shared `rlData` cache and the existing proxy chain — never
  re-fetch a series a sibling tool already cached; provider-tag every series. (4)
  Canvas is drawn **synchronously** in `render()` (never inside
  `requestAnimationFrame` — it does not fire in hidden/background tabs), debounced
  only on resize. (5) Every `<canvas>` carries an `aria-label` + a text fallback
  table (WebKit a11y).
- **Failure condition.** The tool fails if it implies real-time data it does not
  have (label freshness honestly), if tile **area** does not faithfully encode the
  size metric (a broken treemap is worse than a table), or if the color scale is
  ambiguous about direction/magnitude.

---

## Data & feasibility (free-source, same mechanism as the sibling tools)

Fully feasible with the existing data layer — **no new provider, no key beyond
the shared path**:

| Field | Source | Mechanism |
|---|---|---|
| Constituent price + % change (1d/1w/1m) | Yahoo `v8/finance/chart` (adjusted) → `direct → allorigins → codetabs` proxies; Twelve Data fallback | reuse `rldata.js` `putBars`/`putQuotes`; the Sector Lab already fetches sector-member bars — **reuse the cache, no refetch** |
| Market cap (tile size) | Yahoo `v10/finance/quoteSummary/<SYM>?modules=price` (`marketCap`) via the same public proxy chain | same `fetchTextViaProxy` path the Options/Smart-Money labs already use for `quoteSummary` |
| Sector grouping | curated in the universe JSON (reuse `sector-universe.json` group membership) | static, low-churn; verify each run |
| Benchmark (RS color mode) | Yahoo `SPY` (or a chosen ETF) | reuse cache |

Rendering: a **squarified treemap** on `<canvas>` — group rectangles per sector,
sub-divide each by tile size (market cap), fill by a diverging color scale
(red↔green) keyed to the color metric. Pure-function layout (area-conserving) so
it is unit-testable in `selftest.mjs`.

Honest limits: delayed/EOD quotes (label the age); crypto/ETF modes are optional
follow-ons; market cap for some tickers may be missing → fall back to
equal-weight tiles for those, flagged.

---

## Simple vs Power (reuse the established pattern)

Follow the `body.power` toggle + `localStorage` persistence + steerable-levers
pattern proven in `sector-research-lab.html` / `intraday-tape-lab.html`:

- **Simple.** One treemap + a one-line read ("Risk-on: 9/11 sectors green, Tech
  leads +1.8%, Energy the lone red −0.9%") + three levers: **color window**
  (1d/1w/1m/RS), **size metric** (mkt cap / equal / $-volume), **grouping**
  (sector / none). Changing a lever re-runs one `render()` — no refetch.
- **Power.** Adds a per-sector breadth strip (adv/dec, % of members green), a
  sortable constituent table (the canvas's text-fallback, doubling as a11y),
  a sector-vs-benchmark RS bar, and an outlier list (largest |z| move vs its
  sector).

One compute → both views (guard the canvas draw with `if(state.mode==='power'||
state.mode==='simple')` — the treemap shows in both; the Power-only panels are
`class="panel pw"`).

---

## Brief integration (why this tool exists for the cockpit)

The [Market Brief](market-brief.md) gains a deep-link target for its
regime/rotation attention cards. On ship:

1. Add a deep-link entry in [`../market-brief.config.json`](../market-brief.config.json)
   so the brief's "breadth NARROWED / rotation" and "regime" cards can link
   `→ market-heatmap-lab.html`.
2. Add the row to the brief's no-duplication deep-link map in
   [market-brief.md](market-brief.md) §4 (Brief signal "market breadth / sector
   green-red map" → owning tool `market-heatmap-lab.html`).
3. The brief keeps owning only the one-line breadth delta; the heatmap owns the
   full map (no duplication).

---

## Build checklist (when promoting PROPOSED → LIVE)

1. Author `market-heatmap-lab.html` (single self-contained file; ES5 style;
   `var`/`function`/string-concat).
2. Wire the shared libs: `rlnav.js` (drawer), `rlg.js` (glossary + regime),
   `rldata.js` (shared cache), `rlchart.js` (canvas helpers). Avoid the word
   "call" in headings (shared `rlg.js` auto-tooltips it as an options-call).
3. Declare the treemap math as **top-level `function` declarations** (not arrow
   consts) so `selftest.mjs` `extractFn` can pull them; add a `selftest.mjs`
   group asserting: (a) squarified layout conserves total area, (b) tile area ∝
   size metric, (c) color mapping is monotonic + symmetric around 0, (d) grouping
   partitions the universe with no overlap/gap.
4. `<canvas>` gets `aria-label` + a text-fallback constituent table.
5. Register in **three** places only now: `index.html` `TOOLS`, `rlnav.js`
   `TOOLS`, `tools.json`; add the footer notes link → `notes/market-heatmap-lab.md`.
6. Do the brief integration above.
7. `node scripts/selftest.mjs` (full output) must pass; parse-check the inline
   script (`new Function(...)`) and `JSON.parse` the universe.

---

## Version history

| Date | Change |
|---|---|
| 2026-07-08 | PROPOSED brief authored from the QF competitor review (TradingView heatmaps). |
| 2026-07-08 | **v1.0 built, registered (3-place), and selftest-validated** (19 assertions in the `market-heatmap-lab` group; 145/0 total). Simple/Power, cache-first auto-hydrate, canvas hover, ticker/term tooltips per the cross-tool contract. |
