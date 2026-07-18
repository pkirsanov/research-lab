# Research Lab

A small static site of **interactive, single-file research tools** for the
AI-datacenter capex cycle, market-structure analysis, and quant strategy
modeling. Each tool is one self-contained `.html` file (no build step, no
dependencies). Data-driven tools paint from a shared browser cache immediately,
then refresh only missing or stale resources from public APIs.
[`index.html`](index.html) is the landing page that links to them all.

> **Educational only — not investment advice.** Every figure is a hypothetical
> output from editable assumptions. Most tools use no live data; where a tool
> use market data, source and freshness are shown in the shared status control.
> Provider credentials are configured once on the landing page and remain local
> to that browser. Verify every number yourself.

## Live site

Published via GitHub Pages (GitHub Actions). After the first deploy, the site is at:

```text
https://pkirsanov.github.io/research-lab/
```

## Live tools

| Tool | Purpose | Notes |
| --- | --- | --- |
| [`Actionable Market Brief`](market-brief.html) | One clean, low-noise cockpit: what changed that you should act on, and what's coming. Regime, sector rotation (leading→lagging flips), momentum changes, gamma flip and call/put walls, events with option-implied moves and scenario probabilities, and a watchlist roll-up — each deep-linking the tool that owns the detail. A live layer computed in-browser from the shared rlData cache (no refetch) plus an **agent layer refreshed 4×/day** (fresh same-origin snapshots + a Copilot-regenerated narrative). Estimates, not facts — educational only, not investment advice. Configure via [`market-brief.config.json`](market-brief.config.json). | [`notes/market-brief.md`](notes/market-brief.md) |
| [`Market Heatmap Lab`](market-heatmap-lab.html) | Whole-market treemap — where the money is, at a glance. Constituents grouped by sector (or the 11 sector ETFs), sized by index weight, dollar-volume or equal, colored by return over 1 day / 1 week / 1 month. A Simple cockpit (one breadth verdict + leaders/laggards; steer the color window / size metric / grouping) with a Power drill-down (per-sector breadth, a sortable constituent table, and σ-vs-sector outliers). Cache-first from the shared rlData store — reused across tools, never refetched. Add/remove names via [`sector-universe.json`](sector-universe.json). | [`notes/market-heatmap-lab.md`](notes/market-heatmap-lab.md) |
| [`Unusual Options Activity Lab`](options-flow-feed-lab.html) | Which option strikes lit up today, relative to their own normal — an honest EOD positioning proxy, **not** a real-time trade tape (there is no free live options feed). Scans liquid names' chains for anomalous volume, vol/OI, premium notional and IV, ranks the standouts, and reads the net call-vs-put premium lean. Simple feed + Power table. Chains served from same-origin EOD snapshots (refreshed a few times per trading day), cached and reused on reload. Never infers buy/sell side. Educational only — not investment advice. Add/remove names via [`options-structure-universe.json`](options-structure-universe.json). | [`notes/options-flow-feed-lab.md`](notes/options-flow-feed-lab.md) |
| [`Intraday Tape & Volume-Profile Lab`](intraday-tape-lab.html) | Read who controls today's tape — trend-following algos pinned to **VWAP** or emotional retail flow — and where the session's support/resistance is: session **VWAP with ±σ bands**, a session **volume profile with a buy/sell delta** (an up/down-volume proxy, not real order flow), the **Market-Profile shape** (D/P/B/thin) and the **first-test POC-pullback** playbook (value-area-edge entry, stop beyond the low-volume area, reversal on failure, with a trend-vs-rotation gate), the **opening range** vs the prior day's value area, an **algo-vs-retail** control read, recent-session analogs, and the **0DTE gamma walls** reused from the Options Structure Lab via a shared browser cache — distilled to one Simple verdict with a Power view. Add/remove names via [`intraday-tape-universe.json`](intraday-tape-universe.json). | [`notes/intraday-tape-lab.md`](notes/intraday-tape-lab.md) |
| [`Swing Structure & Market-Regime Lab`](swing-structure-lab.html) | Read market structure and regime over days-to-weeks: the **20/50/200-day MA** stack, a **composite volume profile** (durable HVN/LVN shelves), the **Market-Profile shape** (D/P/B/thin) and the **naked-POC / HVN-shelf pullback** with 20/50/200-day MA confluence (stop beyond the low-volume gap, target the next shelf), the active **pattern** with analog odds, an **accumulation/distribution** read, an in-browser **Fear & Greed + VIX** regime engine, and the monthly **option magnets** reused from the Options Structure Lab — distilled to one positioning verdict with a Power view. Add/remove names via [`swing-structure-universe.json`](swing-structure-universe.json). | [`notes/swing-structure-lab.md`](notes/swing-structure-lab.md) |
| [`Options Structure & Momentum Research Lab`](options-structure-lab.html) | Map option-implied support/resistance: call/put **walls**, the **gamma-flip** regime (net GEX) that says whether dealers **pin** price or let it **trend**, **max pain**, the cash volume-profile POC, per-expiry **expected-move** cones, IV smile/term/skew/VRP, short interest and a bounded squeeze read. Black-Scholes greeks (Δ Γ ν Θ + vanna/charm) are computed **in-browser** from the fetched Yahoo option chain; the dealer-gamma sign is a documented **toggle**; day-over-day OI/wall migration accrues in `localStorage`. Add/remove underlyings via [`options-structure-universe.json`](options-structure-universe.json). | [`notes/options-structure-lab.md`](notes/options-structure-lab.md) |
| [`Gamma Trading & Dealer-Flow Playbook Lab`](gamma-trading-lab.html) | Turn the dealer-gamma regime into a **playbook** — the trading sibling of the Options Structure Lab. Read whether dealers are **long gamma (pinning)** or **short gamma (trending)**, then run the three classic plays: the **JEX / gamma-flip waterfall** (the first negative-gamma close after an extended rally → opening-drive short + afternoon roll), an in-browser **Option Volume Imbalance (OVI)** model that weights option **volume** by gamma and ranks it as a percentile against your own rolling snapshots (open interest is a day old; only volume is real-time), and the **gamma-vs-time expiration cycle** (OPEX pin, 14/30-day windows, Thu/Fri overextension). One interactive **Simple** model steered by stance/aggressiveness/horizon levers, plus a full **Power** dashboard (net-GEX-by-strike, OVI percentile history, OPEX ladder, dealer-sign toggle). Reuses the Options Lab's cached snapshot and the shared keys — nothing is re-fetched. Add/remove names via [`gamma-trading-universe.json`](gamma-trading-universe.json). | [`notes/gamma-trading-lab.md`](notes/gamma-trading-lab.md) |
| [`Sector Rotation & Momentum Research Lab`](sector-research-lab.html) | Momentum, relative strength, volume/money-flow, and breadth across the 11 GICS sectors, major indexes, country ETFs, custom stock groups (Mag 7, semis, memory…) and cross-assets (BTC, GLD, TLT…). The Simple sleeve control activates and hydrates either US sectors or global markets; the country sleeve uses ACWI as its relative benchmark and links to the dedicated FX/session-aware Global Rotation model. A Relative Rotation Graph maps what is rotating in vs out; a momentum-acceleration read flags Basing/Peaking turns earlier than price; a correlation matrix + rolling pair-correlation divergence monitor confirms when two areas start decoupling; OBV/breadth divergences raise risk flags. Drill into any sector with a **company-by-sector momentum heatmap** (which constituents are driving it, with new-high ▲ and RSI overbought/oversold badges) and a **sector-ETF selector** that ranks the sector's prominent ETFs on **ten** parameters — size (AUM), liquidity (dollar ADV), cost, coverage, concentration (top-10 weight), sector-tracking (correlation to the SPDR), tracking-error, drawdown, yield and Sharpe-like risk-adjusted momentum — into one **reweightable Fit score** (with adjustable weight sliders + presets, a 3M/6M/12M momentum lookback, β / information-ratio reads and a CSV export), so you can pick the best vehicle when you rotate. Add/remove entries — and curate the per-sector constituents/ETFs (`sectorMap`) — via [`sector-universe.json`](sector-universe.json). | [`notes/sector-research-lab.md`](notes/sector-research-lab.md) |
| [`Global Rotation Lab`](global-rotation-lab.html) | Country and region ETF leadership across South Korea, Singapore, Philippines, Germany, Japan, Taiwan, India, China, the UK, Australia, Canada, Brazil and Mexico. Simple mode is a steerable allocation queue; Power exposes benchmark-relative 21/63/126-day momentum, 20/50/200 trend, realized risk, FX confirmation, local-close timing and diversification. Uses [`global-rotation-universe.json`](global-rotation-universe.json), shared cache first, and automatically appends only stale/missing bars. | [`notes/global-rotation-lab.md`](notes/global-rotation-lab.md) |
| [`Real Assets Lab`](real-assets-lab.html) | Gold, silver, bitcoin/crypto, oil, broad commodities, copper, agriculture and platinum through **distinct** driver models: gold uses USD/rate proxies, bitcoin uses risk appetite and stronger volatility/drawdown penalties, silver combines gold/silver-ratio and industrial confirmation, and futures-linked commodities expose roll/proxy caveats. Steerable Simple verdict plus full Power inputs. | [`notes/real-assets-lab.md`](notes/real-assets-lab.md) |
| [`Bond Regime & Fixed-Income Scenario Lab`](bond-regime-lab.html) | Separate aligned JNK/LQD and HYG/LQD credit pulses from duration confounds and independent confirmation; keep curve level, curve impulse, real yield, breakeven, and duration posture distinct; then compare seven generic sleeves with transparent carry, rate, spread, convexity, break-even, stale, and reliability contracts. Simple and Power share one model. Configure via [`bond-regime-universe.json`](bond-regime-universe.json). | [`notes/bond-regime-lab.md`](notes/bond-regime-lab.md) |
| [`AI Capex Strategy Lab`](ai-capex-strategy-lab.html) | Multi-horizon AI-infrastructure strategy playground with editable assumptions, 63 assets, 10 themes, 11 presets, five optimizer objectives, theme-aware correlation, crowding friction, and per-horizon playbooks. | [`notes/ai-capex-strategy-lab.md`](notes/ai-capex-strategy-lab.md) |
| [`MSFT July-Print Margin & EPS Model`](msft-july-print-model.html) | Microsoft FY26 Q4 / FY27E margin bridge with verified Q1-Q3 actuals, Q4 reconciliation anchors, depreciation / price-mix / FX levers, heatmaps, and a memory-shortage cost-cycle overlay. | [`notes/msft-july-print-model.md`](notes/msft-july-print-model.md) |
| [`ETF Momentum Research Lab`](etf-momentum-lab.html) | Live-capable ETF research over the etfdb High-Momentum universe (plus QQQ & VGT): pull Yahoo / Twelve Data price history, then compute performance, risk, drawdowns, correlation, CAPM β/α, regime-conditional return estimates and Monte-Carlo projections. Its international section covers the country-ETF universe and routes allocation work to the dedicated FX- and local-session-aware [`Global Rotation Lab`](global-rotation-lab.html). Add/remove funds via [`etf-universe.json`](etf-universe.json). | [`notes/etf-momentum-lab.md`](notes/etf-momentum-lab.md) |
| [`Strategy Self-Improvement & Walk-Forward Lab`](strategy-self-improvement-lab.html) | The viral "self-improving trading agent" loop **done honestly**: an explicit numeric **goal scorecard** (target CAGR, Sharpe floor, max-DD ceiling, time-in-market), a transparent trend/momentum rule with vol-targeted exposure + trailing stop, and a **scientific-method search that changes one variable at a time** — keeping only the changes that survive **out-of-sample walk-forward** scoring, with an **overfitting / multiple-testing discount** so you trust the OOS column, not the in-sample fit. Fully in-browser on **deterministic, seed-reproducible synthetic** paths (no live data); accepted improvements accrue in a per-scenario localStorage ledger. Edit scenarios/goal/lever ranges via [`strategy-self-improvement-universe.json`](strategy-self-improvement-universe.json). | [`notes/strategy-self-improvement-lab.md`](notes/strategy-self-improvement-lab.md) |
| [`Strategy Validation & Real-Data Walk-Forward Lab`](strategy-validation-lab.html) | The **real-data sibling** of the Self-Improvement Lab: validate a mechanical rule on **live** Yahoo / Twelve Data history the honest way — **out-of-sample walk-forward** with **embargoed folds** (no leakage), **cross-instrument robustness** (held **k/N** tickers — an edge that works on only one ticker is luck), and a **Deflated Sharpe Ratio** that discounts for how many variants you tried. Answers what the signal tools can't: *is this edge real, or curve-fit?* In-browser; a clearly-labelled **synthetic-demo** path when live data is blocked. Edit the default basket / goal / lever ranges via [`strategy-validation-universe.json`](strategy-validation-universe.json). | [`notes/strategy-validation-lab.md`](notes/strategy-validation-lab.md) |
| [`Smart-Money & Congressional-Flow Lab`](smart-money-flow-lab.html) | The viral "copy what insiders and politicians buy" idea **done honestly**: read disclosed **insider (Form 4)**, **congressional (STOCK Act)** and **institutional (13F)** buying, score **cluster-consensus** conviction, then apply the **disclosure lag** the hype clips skip — showing how much edge actually **survives** by the time you can legally copy the trade, with a blunt **copy-trade reality check**. 100% in-browser on **editable, illustrative (synthetic)** filing data; no live feed, no execution, no scraping. | [`notes/smart-money-flow-lab.md`](notes/smart-money-flow-lab.md) |
| [`🤽 Florida Waterfront × Masters Water-Polo Screener`](waterfront-polo-lab.html) | A personal, **off-theme** screener: filter Florida **waterfront** markets (lake / river / intracoastal / canal) to a **$1–2M · 2,500–3,000 sqft · land/privacy** brief, **gated by whether they sit within a ~40-minute drive of a Masters (adult) water-polo practice** you pin on a Florida map. Each market is annotated with **insurance / flood / storm-surge** risk. Drive-time is an approximate straight-line estimate (not a routed isochrone) and the Masters-club layer is a **seed to verify**. Edit markets & clubs via [`waterfront-polo-universe.json`](waterfront-polo-universe.json). | [`notes/waterfront-polo-lab.md`](notes/waterfront-polo-lab.md) |
| [`🌪️ Volatility Regime & Vol-Targeting Sizing Lab`](volatility-sizing-lab.html) | Forecast an asset's **conditional volatility** (EWMA / RiskMetrics default + an optional **lightweight** GARCH(1,1) in-browser optimizer — never institutional MLE), read the volatility **regime** as a window-visible **percentile storm gauge** ("rougher than X% of the past N observations"), decompose **persistence / half-life**, and turn the forecast into a **capped, conditional vol-targeting sizing multiplier** (`min(cap, targetVol / max(floor, forecastVol))`) with a worked cash example. **Magnitude only** — no direction, target, or top/bottom; managed/pegged low volatility is a **first-class limitation**, never automatic full size. The "does vol-targeting make money" question **deep-links** to the [`Strategy Validation Lab`](strategy-validation-lab.html) — there is no in-tool backtest. Simple and Power share one computation. Configure via [`volatility-sizing-universe.json`](volatility-sizing-universe.json). | [`notes/volatility-sizing-lab.md`](notes/volatility-sizing-lab.md) |

## Layout

```text
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
├── global-rotation-lab.html    # country ETF rotation with FX/session context
├── global-rotation-universe.json # editable country/control ETF + FX proxy universe
├── real-assets-lab.html        # distinct gold/silver/BTC/commodity models
├── real-assets-universe.json   # editable real-asset candidates + driver proxies
├── bond-regime-lab.html        # credit/duration regime + fixed-income scenario workspace
├── bond-regime-universe.json   # source policies, thresholds, presets, instruments and sleeves
├── ai-capex-strategy-lab.html  # tool #1
├── msft-july-print-model.html  # tool #2
├── etf-momentum-lab.html       # tool #3
├── etf-universe.json           # editable ETF universe for tool #3 (add/remove funds here)
├── strategy-self-improvement-lab.html      # tool #9 — self-improvement loop (goal scorecard, walk-forward OOS, one-variable search)
├── strategy-self-improvement-universe.json # editable synthetic scenarios / goal / lever ranges for tool #9
├── strategy-validation-lab.html            # tool #11 — real-data walk-forward validation (embargoed OOS, held k/N, Deflated Sharpe)
├── strategy-validation-universe.json       # editable default basket / goal / lever ranges for tool #11
├── smart-money-flow-lab.html   # tool #10 — smart-money / congressional copy-trade reality check (disclosure-lag edge decay)
├── rlnav.js                    # shared collapsible left-nav drawer (loaded by every page)
├── rlg.js                      # shared glossary tooltips (loaded by the trading tools)
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
│   ├── etf-momentum-lab.md
│   ├── strategy-self-improvement-lab.md
│   └── smart-money-flow-lab.md
├── tools.json                  # machine-readable mirror of the tool registry (incl. notes path)
├── .nojekyll                   # serve files as-is (no Jekyll)
└── .github/workflows/pages.yml # GitHub Actions → Pages deploy (publishes repo root)
```

## Add a new tool

1. Drop a new single-file HTML at the repo root (e.g. `my-tool.html`).
2. Add `<script src="rlnav.js" defer></script>` just before `</body>` so the shared collapsible left-nav appears on the page.
3. Add one entry to the `TOOLS` array near the bottom of `index.html`.
4. Add the same entry to the `TOOLS` array in [`rlnav.js`](rlnav.js) so the left-nav lists the new tool.
5. Mirror it in `tools.json` for machine-readable consumers.
6. Add per-tool notes at `notes/<tool-id>.md` (methodology, data, sources, assumptions, next-run checklist) and link them from a small footer in the tool's HTML plus a `notes` field in both registries. See [`notes/README.md`](notes/README.md).
7. Commit & push — the `pages` workflow redeploys automatically.

The landing page renders straight from the inline `TOOLS` array, so it works
both offline (`file://`) and on GitHub Pages with no fetch/CORS dependency.

## Deploy mechanism

`.github/workflows/pages.yml` uploads the repo root as the Pages artifact and
deploys it on every push to `main`. Pages source must be set to **GitHub
Actions** (Settings → Pages → Build and deployment → Source).
