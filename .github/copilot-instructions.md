# Research Lab — Copilot instructions

Single-file, build-free, GitHub-Pages research tools. Everything is computed in-browser from data you
fetch on demand. **Educational only — not investment advice.**

## Market Brief updates

When updating the **Actionable Market Brief** (`market-brief` cockpit) — including the 4×/day runs
(07:30 / 11:00 / 15:00 / 17:00 ET) — **FOLLOW THE RUNBOOK: [`notes/market-brief.md`](../notes/market-brief.md).**
It is the source of truth for what to compute, what to fetch/append, what to deep-link (never duplicate),
how to author probabilities + the psychology read, the redeploy decision rule, and the output contract
(`market-brief.payload.json`). The `/market-brief-update` prompt runs one window end-to-end.

**The brief covers every tool — automatically.** The brief MUST analyze EVERY registered tool, and a
newly-added tool MUST be picked up **without hand-editing the brief**. Contract: (1) brief tool coverage
is derived from the `tools.json` registry, never a hardcoded subset; (2) every tool writes its Simple-view
read to the shared cache on each render — an `rlData` `toolReads[<id>]` slot
`{ id, asOf, read (one line), metrics{}, deepLink }` — so the brief's live (Tier-A) layer can include it
without re-implementing the tool's math; (3) the Tier-B agent runbook ([`notes/market-brief.md`](../notes/market-brief.md))
analyzes each registered tool's read as part of its research, on top of its existing regime / rotation /
gamma / events work. Registering a tool in `tools.json` is what makes the brief cover it.

## Universal tooltips & ticker links (NON-NEGOTIABLE — every tool, new and existing)

- **Every ticker is a link to Yahoo Finance with a rich tooltip** (company name + kind) — EVERYWHERE: cards,
  tables, prose, and chart labels / legends / axes. Use the shared [`rlticker.js`](../rlticker.js): call
  `RLTKR.tag(ticker)` in renderers, mark static tickers with `class="tkr"` or `data-tkr="TICKER"`, and add
  `data-tkr-auto` to any container (including chart wrappers) whose known tickers should auto-link. Never print a
  bare ticker.
- **Every term, section, KPI, badge, chart, axis and value carries a rich tooltip** that says BOTH *what it is*
  AND *what the current value means in this context* — for EVERYTHING. The shared [`rlg.js`](../rlg.js) glossary
  auto-covers "what it is" for known terms; the renderer MUST additionally set a contextual `title` / `data-tip`
  on each dynamic value element explaining what the CURRENT reading implies (e.g. `VIX 18.4 — low; positive-gamma /
  calm regime`). A value with no contextual tooltip is a defect.
- **Canvas charts carry hover tooltips too** (a `<canvas>` can't DOM-link its pixels). Each chart registers a
  hit-test closure via the shared [`rlchart.js`](../rlchart.js): at the END of every draw function call
  `RLCHART.attach(canvas, function (mx, my) { …return RLCHART.tip(title, [[label, value], …], 'what it means') OR null… })`
  where `mx,my` are CSS px inside the canvas. The helper owns the floating tooltip, positioning and mouse/touch
  wiring; the chart only maps a cursor position to content, capturing its scale fns + data in the closure. Patterns:
  time-series → nearest point by x; bars/rows → index by x or y; heatmap/matrix → cell (i,j); scatter → nearest dot.
  A chart with no hover tooltip is a defect. (`rlchart.js` also provides `RLCHART.logTicks` for log-scale axes and
  is Node-safe so its pure helpers are covered by `scripts/selftest.mjs`.)
- **Load order** in every tool: `rlg.js`, `rldata.js` (if it fetches), `rlbrief.js` (if used), `rlchart.js` (if it
  has any `<canvas>`), `rlticker.js`, `rlnav.js`. Adding `rlticker.js` / `rlchart.js` is a one-line include each;
  `rlticker.js` auto-decorates on load and on DOM mutation, so retrofitting an existing tool is a single
  `<script src="rlticker.js" defer></script>` line.

## Simple / Power (default paradigm for every tool)

Every tool ships **two views** toggled by a `#modeSeg` segmented control that sets a `body.power`
class, persisted in `localStorage` (see `sector-research-lab.html` / `intraday-tape-lab.html` for the
reference implementation):

- **Simple is the DEFAULT.** A high-level, decision-first cockpit: one clear verdict / read plus a few
  **steerable parameter levers** (dropdowns / sliders / segmented toggles) the user can play with to
  watch the verdict update **live** — recompute through one `render()` call, no refetch.
- **Power is drill-into-details.** All panels, raw signals, matrices, tables, parameter sweeps, and the
  a11y fallback tables.
- **One compute → both views.** Compute once from state; both modes read the same result. Power-only
  panels are `class="panel pw"`; guard `<canvas>` draws by the active mode and redraw on resize (a
  hidden canvas doesn't render). Persist the mode + lever values.

A new tool that opens straight into a dense dashboard with no Simple cockpit is a defect.

## House rules (all tools)

- **Reuse, never refetch.** Share API keys via `rlApiKeys` and market data via the `rlData` / `RLDATA`
  cache; **APPEND** missing/stale data — never refetch a series a sibling tool already cached
  (see [`notes/shared-data-layer.md`](../notes/shared-data-layer.md)).
- **Auto-hydrate on open.** A tool MUST paint a meaningful first view **automatically on page load** —
  never behind a manual "fetch" click. On boot: read the `rlData` cache FIRST (instant paint from cached
  bars / quotes / options / macro), THEN fetch only the **delta** (missing symbols / intervals stale past
  their freshness TTL) and re-render. Cache-first, delta-only, automatic. A tool that shows an empty shell
  until the user clicks fetch is a defect.
- **No blackbox numbers.** One self-contained HTML per tool, no build step; every analytic is recomputed
  in-browser from fetched data. Label estimates as estimates and proxies as proxies.
- **Null-safe numerics + crash-proof first paint.** Use `Number.isFinite(x)` — NOT the global `isFinite(x)` —
  before any `.toFixed()` / arithmetic on a value that can be `null`/absent (a not-yet-fetched price, a `null`
  `impliedMovePct`, an empty option-chain field). The global `isFinite(null) === true`, so a null slips past the
  guard and `null.toFixed()` **throws**; because the auto-hydrate first paint runs with a half-empty cache, that
  single throw halts `render()` and freezes the tool on "loading…" with a blank panel. Guard the whole first paint
  so missing data renders `—`, never crashes. (This exact bug has bitten `rlbrief.js`, `market-heatmap-lab`, and the
  brief's `renderEvents` — do not reintroduce it.)
- **Data source that works on GitHub Pages.** Free CORS proxies (`corsproxy.io`, `allorigins`) are unreliable and
  frequently blocked on Pages. For option chains, read the same-origin cached snapshot `data/options/<SYM>.json`
  FIRST (no CORS, no proxy — the Gamma / Options-Structure / heatmap labs all do this), then fall back to the live
  Yahoo-via-proxy path for local use. A tool whose only data path is a public proxy will silently show empty on Pages.
- **Adding a tool** = drop `<id>.html` at the repo root, then sync `tools.json` + the `TOOLS` array in
  `index.html` + the `TOOLS` array in `rlnav.js`, and add a `notes/<id>.md` handoff doc.
- **Validate before commit:** `node scripts/selftest.mjs` and the per-tool Section-9 check
  (parse the inline script + confirm every `getElementById` has a matching `id`). Commit → GitHub Pages
  auto-deploys.
- **Privacy:** the watchlist is **tickers only** (public repo). Never commit position sizes, cost basis,
  or P&L; those stay in `localStorage` / a gitignored local file.
