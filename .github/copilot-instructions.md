# Research Lab — Copilot instructions

Single-file, build-free, GitHub-Pages research tools. Everything is computed in-browser from data you
fetch on demand. **Educational only — not investment advice.**

## Market Brief updates

When updating the **Actionable Market Brief** (`market-brief` cockpit) — including the 4×/day runs
(07:30 / 11:00 / 15:00 / 17:00 ET) — **FOLLOW THE RUNBOOK: [`notes/market-brief.md`](../notes/market-brief.md).**
It is the source of truth for what to compute, what to fetch/append, what to deep-link (never duplicate),
how to author probabilities + the psychology read, the redeploy decision rule, and the output contract
(`market-brief.payload.json`). The `/market-brief-update` prompt runs one window end-to-end.

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
- **Load order** in every tool: `rlg.js`, `rldata.js` (if it fetches), `rlticker.js`, `rlnav.js`. Adding
  `rlticker.js` is a one-line include; it auto-decorates on load and on DOM mutation, so retrofitting an existing
  tool is a single `<script src="rlticker.js" defer></script>` line.

## House rules (all tools)

- **Reuse, never refetch.** Share API keys via `rlApiKeys` and market data via the `rlData` / `RLDATA`
  cache; **APPEND** missing/stale data — never refetch a series a sibling tool already cached
  (see [`notes/shared-data-layer.md`](../notes/shared-data-layer.md)).
- **No blackbox numbers.** One self-contained HTML per tool, no build step; every analytic is recomputed
  in-browser from fetched data. Label estimates as estimates and proxies as proxies.
- **Adding a tool** = drop `<id>.html` at the repo root, then sync `tools.json` + the `TOOLS` array in
  `index.html` + the `TOOLS` array in `rlnav.js`, and add a `notes/<id>.md` handoff doc.
- **Validate before commit:** `node scripts/selftest.mjs` and the per-tool Section-9 check
  (parse the inline script + confirm every `getElementById` has a matching `id`). Commit → GitHub Pages
  auto-deploys.
- **Privacy:** the watchlist is **tickers only** (public repo). Never commit position sizes, cost basis,
  or P&L; those stay in `localStorage` / a gitignored local file.
