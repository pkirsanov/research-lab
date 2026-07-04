# Research Lab

A small static site of **interactive, single-file research tools** for the
AI-datacenter capex cycle, market-structure analysis, and quant strategy
modeling. Each tool is one self-contained `.html` file (no build step, no
dependencies); most make no network calls at all, and the few that can pull
live market prices do so only on demand from public APIs.
[`index.html`](index.html) is the landing page that links to them all.

> **Educational only — not investment advice.** Every figure is a hypothetical
> output from editable assumptions. Most tools use no live data; where a tool
> can fetch live prices (e.g. the ETF Momentum Research Lab) it is optional,
> on demand, and clearly labeled — verify every number yourself.

## Live site

Published via GitHub Pages (GitHub Actions). After the first deploy, the site is at:

```
https://pkirsanov.github.io/research-lab/
```

## Live tools

| Tool | Purpose | Notes |
|---|---|---|
| [`Intraday Tape & Volume-Profile Lab`](intraday-tape-lab.html) | Read who controls today's tape — trend-following algos pinned to **VWAP** or emotional retail flow — and where the session's support/resistance is: session **VWAP with ±σ bands**, a session **volume profile with a buy/sell delta** (an up/down-volume proxy, not real order flow), the **opening range** vs the prior day's value area, an **algo-vs-retail** control read, recent-session analogs, and the **0DTE gamma walls** reused from the Options Structure Lab via a shared browser cache — distilled to one Simple verdict with a Power view. Add/remove names via [`intraday-tape-universe.json`](intraday-tape-universe.json). | [`notes/intraday-tape-lab.md`](notes/intraday-tape-lab.md) |
| [`Swing Structure & Market-Regime Lab`](swing-structure-lab.html) | Read market structure and regime over days-to-weeks: the **20/50/200-day MA** stack, a **composite volume profile** (durable HVN/LVN shelves), the active **pattern** with analog odds, an **accumulation/distribution** read, an in-browser **Fear & Greed + VIX** regime engine, and the monthly **option magnets** reused from the Options Structure Lab — distilled to one positioning verdict with a Power view. Add/remove names via [`swing-structure-universe.json`](swing-structure-universe.json). | [`notes/swing-structure-lab.md`](notes/swing-structure-lab.md) |
| [`Options Structure & Momentum Research Lab`](options-structure-lab.html) | Map option-implied support/resistance: call/put **walls**, the **gamma-flip** regime (net GEX) that says whether dealers **pin** price or let it **trend**, **max pain**, the cash volume-profile POC, per-expiry **expected-move** cones, IV smile/term/skew/VRP, short interest and a bounded squeeze read. Black-Scholes greeks (Δ Γ ν Θ + vanna/charm) are computed **in-browser** from the fetched Yahoo option chain; the dealer-gamma sign is a documented **toggle**; day-over-day OI/wall migration accrues in `localStorage`. Add/remove underlyings via [`options-structure-universe.json`](options-structure-universe.json). | [`notes/options-structure-lab.md`](notes/options-structure-lab.md) |
| [`Gamma Trading & Dealer-Flow Playbook Lab`](gamma-trading-lab.html) | Turn the dealer-gamma regime into a **playbook** — the trading sibling of the Options Structure Lab. Read whether dealers are **long gamma (pinning)** or **short gamma (trending)**, then run the three classic plays: the **JEX / gamma-flip waterfall** (the first negative-gamma close after an extended rally → opening-drive short + afternoon roll), an in-browser **Option Volume Imbalance (OVI)** model that weights option **volume** by gamma and ranks it as a percentile against your own rolling snapshots (open interest is a day old; only volume is real-time), and the **gamma-vs-time expiration cycle** (OPEX pin, 14/30-day windows, Thu/Fri overextension). One interactive **Simple** model steered by stance/aggressiveness/horizon levers, plus a full **Power** dashboard (net-GEX-by-strike, OVI percentile history, OPEX ladder, dealer-sign toggle). Reuses the Options Lab's cached snapshot and the shared keys — nothing is re-fetched. Add/remove names via [`gamma-trading-universe.json`](gamma-trading-universe.json). | [`notes/gamma-trading-lab.md`](notes/gamma-trading-lab.md) |
| [`Sector Rotation & Momentum Research Lab`](sector-research-lab.html) | Momentum, relative strength, volume/money-flow, and breadth across the 11 GICS sectors, major indexes, custom stock groups (Mag 7, semis, memory…) and cross-assets (BTC, GLD, TLT…). A Relative Rotation Graph maps what is rotating in vs out; a momentum-acceleration read flags Basing/Peaking turns earlier than price; a correlation matrix + rolling pair-correlation divergence monitor confirms when two areas start decoupling; OBV/breadth divergences raise risk flags. Add/remove entries via [`sector-universe.json`](sector-universe.json). | [`notes/sector-research-lab.md`](notes/sector-research-lab.md) |
| [`AI Capex Strategy Lab`](ai-capex-strategy-lab.html) | Multi-horizon AI-infrastructure strategy playground with editable assumptions, 63 assets, 10 themes, 11 presets, five optimizer objectives, theme-aware correlation, crowding friction, and per-horizon playbooks. | [`notes/ai-capex-strategy-lab.md`](notes/ai-capex-strategy-lab.md) |
| [`MSFT July-Print Margin & EPS Model`](msft-july-print-model.html) | Microsoft FY26 Q4 / FY27E margin bridge with verified Q1-Q3 actuals, Q4 reconciliation anchors, depreciation / price-mix / FX levers, heatmaps, and a memory-shortage cost-cycle overlay. | [`notes/msft-july-print-model.md`](notes/msft-july-print-model.md) |
| [`ETF Momentum Research Lab`](etf-momentum-lab.html) | Live-capable ETF research over the etfdb High-Momentum universe (plus QQQ & VGT): pull Yahoo / Twelve Data price history, then compute performance, risk, drawdowns, correlation, CAPM β/α, regime-conditional return estimates and Monte-Carlo projections. Add/remove funds via [`etf-universe.json`](etf-universe.json). | [`notes/etf-momentum-lab.md`](notes/etf-momentum-lab.md) |

## Layout

```
.
├── index.html                  # landing page (renders from the TOOLS array inside it)
├── intraday-tape-lab.html      # tool #6 — intraday tape (VWAP, session profile+delta, algo-vs-retail, 0DTE)
├── intraday-tape-universe.json # editable intraday watchlist for tool #6
├── swing-structure-lab.html    # tool #7 — swing structure (20/50/200 MA, composite profile, regime, patterns)
├── swing-structure-universe.json # editable swing watchlist for tool #7
├── options-structure-lab.html  # tool #5 — options structure (walls, GEX, greeks, expiries, short interest)
├── options-structure-universe.json # editable optionable-underlyings watchlist for tool #5
├── gamma-trading-lab.html      # tool #8 — gamma trading (JEX-flip waterfall, OVI, expiration cycle) on the shared options snapshot
├── gamma-trading-universe.json # editable optionable watchlist for tool #8
├── sector-research-lab.html    # tool #4 — sector rotation & momentum
├── sector-universe.json        # editable sectors / indexes / stock groups for tool #4
├── ai-capex-strategy-lab.html  # tool #1
├── msft-july-print-model.html  # tool #2
├── etf-momentum-lab.html       # tool #3
├── etf-universe.json           # editable ETF universe for tool #3 (add/remove funds here)
├── notes/                      # per-tool notes — notes/<tool-id>.md (methodology, data, handoff)
│   ├── README.md               # notes convention
│   ├── intraday-tape-lab.md
│   ├── swing-structure-lab.md
│   ├── shared-data-layer.md    # cross-tool rlData cache contract (consumed by the two TA labs)
│   ├── options-structure-lab.md
│   ├── gamma-trading-lab.md
│   ├── sector-research-lab.md
│   ├── ai-capex-strategy-lab.md
│   ├── msft-july-print-model.md
│   └── etf-momentum-lab.md
├── tools.json                  # machine-readable mirror of the tool registry (incl. notes path)
├── .nojekyll                   # serve files as-is (no Jekyll)
└── .github/workflows/pages.yml # GitHub Actions → Pages deploy (publishes repo root)
```

## Add a new tool

1. Drop a new single-file HTML at the repo root (e.g. `my-tool.html`).
2. Add one entry to the `TOOLS` array near the bottom of `index.html`.
3. Mirror it in `tools.json` for machine-readable consumers.
4. Add per-tool notes at `notes/<tool-id>.md` (methodology, data, sources, assumptions, next-run checklist) and link them from a small footer in the tool's HTML plus a `notes` field in both registries. See [`notes/README.md`](notes/README.md).
5. Commit & push — the `pages` workflow redeploys automatically.

The landing page renders straight from the inline `TOOLS` array, so it works
both offline (`file://`) and on GitHub Pages with no fetch/CORS dependency.

## Deploy mechanism

`.github/workflows/pages.yml` uploads the repo root as the Pages artifact and
deploys it on every push to `main`. Pages source must be set to **GitHub
Actions** (Settings → Pages → Build and deployment → Source).
