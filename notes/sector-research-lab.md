# Sector Rotation &amp; Momentum Research Lab — notes

Single-file tool: [`../sector-research-lab.html`](../sector-research-lab.html)
Editable universe: [`../sector-universe.json`](../sector-universe.json)

## Purpose

Answer one question well: **where is momentum building, where is it rolling over,
and can I see the turn *before* the price chart makes it obvious?** — across the
**11 GICS sectors**, major **indexes**, and arbitrary **custom stock groups**
(Mag 7, semiconductors, memory, software, AI-infra, banks, homebuilders,
nuclear/power, or any basket you type in). It reads momentum *and the underlying
forces behind it*: relative strength, participation (volume / money-flow), and
breadth. Everything is computed **from live price history you fetch**, not from
any stored number.

### Who it's for / what it answers

- **Rotation trader** — *what is being rotated into vs out of right now?* → the
  Relative Rotation Graph (RRG) + the leaderboard `State` column.
- **Risk manager** — *is a leader quietly topping while price is still high?* →
  the `Peaking ⚠` state, OBV/breadth divergence, and the risk-flag column.
- **Macro / thematic researcher** — *treat "memory stocks" or "Mag 7" exactly
  like a sector* → group baskets with their own breadth read.
- **Cross-asset watcher** — *are two areas still moving together, or is a
  decoupling starting?* → the correlation matrix + rolling pair-correlation
  divergence monitor (sector-vs-sector, software-vs-BTC, GLD-vs-BTC, TLT-vs-SPY…).

The **main job** of the tool is to catch **when a rotation from one sector/group
to another needs to be made**: the trigger is one area flipping `Peaking` (trim /
exit) while another flips `Basing / Improving` (add / enter), *confirmed* by
momentum acceleration and by a **correlation decoupling** between them.

The design intent is **early detection**: RS-Momentum leads the RS-Ratio, so the
tool surfaces the in-between states (`Basing ↑`, `Peaking ⚠`) and a dedicated
**momentum-acceleration** ranking, rather than only the obvious `Leading` /
`Lagging` extremes.

## Data sources (on demand, your click)

Reuses the exact data layer of the sibling [ETF Momentum Lab](etf-momentum-lab.md):

| Source | How | Gives | Notes |
|---|---|---|---|
| **Twelve Data** `api.twelvedata.com/time_series?symbol=<tk>&interval=1day&outputsize=1300` | native CORS with a free key | OHLC + volume (**unadjusted** close on free tier) | Works from GitHub Pages. Free tier ≈ 8 req/min → the app throttles ~8 s per symbol. **Groups fetch every member**, so a broad first pull can take minutes. |
| **Yahoo** `query1.finance.yahoo.com/v8/finance/chart/<tk>?range=5y&interval=1d&includeAdjustedClose=true` | direct, then `api.allorigins.win`, then `api.codetabs.com` proxies | OHLC, **adjusted close**, volume | No key. Public proxies are frequently blocked on hosted origins (github.io) — best-effort. |

~5 years of daily bars are fetched once per **ticker** and cached in
`localStorage` (`sectorSeries`); the analysis window (3M…Max) then slices the
cache locally, so changing the window never refetches. A symbol is refetched
only when its cache is >6 h old, or on **force refresh**. State (source, window,
benchmark, RS params, focus, correlation pair, includes, custom tickers) persists
in `localStorage` (`sectorLab`). The **Twelve Data API key is shared** across all
research-lab tools via a common `rlApiKeys` store (and migrated from the sibling
tools' legacy keys on first load), so a key pasted in any tool is reused here and
vice versa.

## Entry types

- **`sector` / `index`** — a single ETF ticker (XLK, QQQ, RSP…). One price series.
- **`group`** — a synthetic **equal-weight, daily-rebalanced** index built from
  member tickers. The basket return each day = the average of the member daily
  returns *present that day* (dynamic membership, so a young name like OKLO or a
  recent spin-off doesn't truncate the whole basket's history); basket volume =
  the summed member volume. Groups also unlock the **breadth** panel. Optional
  per-member `weights` are honored if provided in the JSON; default is equal.

## Methodology

All from windowed / full daily adjusted series. Relative strength is always vs
the chosen **benchmark** (default SPY; RSP is a useful equal-weight benchmark).

### Relative Rotation Graph (RRG) — simplified JdK

For each entry, on the date-intersected daily series vs the benchmark:

- `rs = price_entry / price_bench`.
- **RS-Ratio** = `100 + z(rs)` over a rolling **lookback L** (default 63 d ≈ 3 mo).
  `z` = (rs − rolling-mean) / rolling-std, NaN-aware. Centres at 100 (= benchmark).
- `rom = RS-Ratio_t − RS-Ratio_{t−M}` — the **momentum** of the ratio over span
  **M** (default 10 d ≈ 2 wk).
- **RS-Momentum** = `100 + z(rom)` over L. Centres at 100 (= flat momentum).
- **Quadrant** from the signs of (RS-Ratio−100, RS-Momentum−100):
  **Leading** (TR, strong &amp; rising), **Weakening** (BR, strong but falling),
  **Lagging** (BL, weak &amp; falling), **Improving** (TL, weak but rising).
  Healthy rotation is **clockwise**: Improving → Leading → Weakening → Lagging.
- **Tail** = the last ~7 weekly points (every 5th bar) — the trajectory.

This is a *simplified* JdK RS-Ratio / RS-Momentum (real JdK uses proprietary
smoothing). It is a normalized, benchmark-relative read — **not** a forecast.

### The "catch it earlier" signals

- **Momentum acceleration** = 2-week change in RS-Momentum (`accel`). Ranked as
  diverging bars. Positive while still Lagging = the earliest bottoming tell;
  negative while still Leading = the earliest topping tell.
- **State label** blends quadrant + accel: `Basing ↑` (Lagging but accelerating),
  `Peaking ⚠` (Leading but decelerating) are the two **early-flip** states the
  Rotation-snapshot KPI counts.

### Underlying forces

- **Money-flow (OBV)** on the focus entry: `OBV_t = OBV_{t−1} + sign(Δprice)·volume`.
  Rising price with a falling OBV = **distribution** (a risk flag). Also
  **rel-vol** = mean(vol, 21 d) / mean(vol, 63 d) (participation) and
  **up/down-vol** = up-day vol ÷ down-day vol over 21 d.
- **Breadth** (groups only): share of members above their own **50-** and
  **200-day** averages (time series for the 50-d), plus % up over 1 M and % at a
  3-month high. Breadth rolling over *before* the basket price is an early
  internal-deterioration warning.
- **Rotation intensity** = cross-sectional std-dev of RS-Momentum across included
  entries over time. Higher = more active rotation between entries.

### Correlation & divergence (find / confirm / monitor)

- **Correlation matrix** — pairwise Pearson correlation of daily returns over the
  window across all included entries (sectors, groups, indexes, cross-assets),
  computed on date-intersected returns. Amber = move together, blue = move
  opposite. This is the *find / validate / confirm* view.
- **Rolling pair correlation** — pick any two entries (sector-vs-sector,
  software-vs-BTC, GLD-vs-BTC, TLT-vs-SPY…) and watch their N-day rolling
  correlation against the full-window **baseline**. A **21d−63dΔ** and a status
  badge classify it: `Coupled — holding`, `Divergence starting ⚠` (recent corr
  dropping well below baseline), `Decoupled`, or `Inverted ⚠` (flipped negative).
  This is the *monitor continue / divergence-starts* view — the confirmation that
  capital is actually rotating **between** two areas.
- **Avg pairwise corr** (KPI) — the mean off-diagonal correlation. When it is
  high, everything moves together (risk-on/off, little room to rotate); when it
  falls, dispersion opens up and sector selection matters.
- **Cross-asset symbols** — crypto/fx symbols differ per provider (Yahoo
  `BTC-USD` vs Twelve Data `BTC/USD`); the tool resolves them automatically from
  a canonical ticker (`BTC`) via each entry's `alt` map, so correlation works
  across equities and crypto. Crypto trades 7 days/week — correlation uses only
  overlapping weekdays.

### Excess return &amp; blend

- Trailing 1M / 3M / 6M / 12M returns (calendar lookback via as-of value) minus
  the benchmark's = the **excess-return heatmap**.
- **Blend** = weighted excess (0.2·1M + 0.3·3M + 0.3·6M + 0.2·12M). These windows
  overlap, so they are correlated, not independent, signals.

### Risk flags (per entry)

`stretched` (>12% above 50-DMA) · `RSI>72` · `vol spike` (21-d vol / 63-d vol
&gt; 1.6) · `flow diverg.` (price up 1M but OBV falling) · `dd` (>8% off the
63-day high) · `weak breadth` (group &lt;40% above 50-DMA). A clean/accumulation
tag shows when none fire.

## Input levers

Data source + key · analysis window (3M…Max) · benchmark (SPY / RSP / QQQ / IWM /
ACWI) · **RS-Ratio lookback** L · **momentum span** M · focus entry (drives the
money-flow &amp; breadth panels) · **correlation pair A / B** + **rolling window**
(21 / 42 / 63 / 126 d). Universe include/exclude + quick filters (sectors /
groups / indexes / cross-asset / all / none / reset), **add any ETF / stock**,
and a **custom-group builder** (name + member tickers → your own equal-weight
basket with its own RRG dot, breadth and correlation).

## Rotation suggestions (ETF-first)

The **Rotation suggestions** panel turns the RRG + acceleration read into an
action list: **Rotate INTO** (Improving / Basing, or Leading with rising
momentum) and **Rotate OUT / trim** (Weakening / Peaking). Each names the
**tradeable vehicle** — a proxy entry's own ETF (XLK, QQQ…) or a thematic group's
representative ETF (`etf` in the universe: MAG7→MAGS, SEMIS→SMH, SOFTWARE→IGV,
BANKS→KBWB, HOMEBUILD→ITB, NUCLEAR→NLR) — **never a raw basket of stocks**. An
**individual member** is surfaced only on an *extreme* case: its blended 3M/6M excess leads the group by a wide margin (>12pp), it is at 63-day highs, and group breadth is thin (<50% above 50-DMA) — the move is concentrated in one name.
Otherwise the panel explicitly says *prefer the ETF*.

## Sector drill-down: company heatmap + ETF selector

Two panels answer the two questions that follow a rotation call — *which names are
driving the sector I want, and which ETF do I actually buy?* Both read a
`sectorMap` catalog in [`../sector-universe.json`](../sector-universe.json)
(keyed by the 11 GICS sector ids) and fetch their tickers from their **own**
button, so they never slow the core rotation pull. Both reuse the shared
throttle/cache/proxy layer (a refactored `pumpFetch` core drives the core fetch
and these two).

### Companies by sector — momentum heatmap

For the selected sector (or **All sectors**), the top constituents
(`sectorMap[XLx].constituents`, sorted by index weight) are drawn as a coloured
cell grid: rows = sector, cells = companies. The colour metric is chosen (1M /
3M / 6M **excess vs the benchmark**, the 1/3/6/12M **blend**, or 3M / 6M
**absolute** return); green = leading, red = lagging, on a ±cap diverging scale.
Each row shows how many members are fetched, the intra-sector **leader**, and the
cross-member **dispersion** (std-dev of the metric) — a high dispersion means the
sector move is concentrated in a few names, a low one means broad participation.
Every cell links to Yahoo. All values are from `tickerPerf(tk)`, computed from
the same live cache as everything else.

### Sector ETF selector — pick the vehicle

For the selected sector, its candidate ETFs (`sectorMap[XLx].etfs`) are ranked on
the parameters that matter when choosing a rotation vehicle:

- **size** — AUM (log-scaled) → liquidity and tight spreads;
- **cost** — expense ratio (lower is better);
- **coverage** — holdings count (capped at 250) + a `segment` tag distinguishing
  a broad sector tracker from a narrower slice (semis, software, biotech,
  regional banks, homebuilders, gold miners…);
- **live momentum** — fetched 3M / 6M return, 3M excess and 63-day volatility
  from `tickerPerf`.

Each parameter is **min-max-normalised across that sector's candidates**, then a
**Fit** score blends them: `0.34·momentum + 0.24·size + 0.20·low-cost +
0.12·coverage + 0.10·low-vol`, renormalised over whatever components are
available (so size/cost/coverage rank the table even *before* you fetch prices —
momentum-less rows are marked `*`). The top row is flagged **BEST FIT**. The
score is a transparent trade-off aid, not advice: a big cheap broad tracker (VGT)
and a smaller high-momentum segment fund (SMH) sit side by side so you can see
why you might pick either.

## Charts (hand-drawn canvas, no libraries)

Relative Rotation Graph (hero, quadrants + tails) · momentum-acceleration
diverging bars · relative-strength lines (rebased to 100) · excess-return heatmap
(entries × 1M/3M/6M/12M) · rotation-intensity (dispersion) area · volume + OBV +
price money-flow · breadth (focus group %&gt;50-DMA over time, else current
%&gt;50-DMA bars across groups) · **correlation matrix** · **rolling pair
correlation + divergence monitor**. Every `<canvas>` carries an `aria-label` +
fallback text (WebKit-safe). Charts render **synchronously** on every update (no
`requestAnimationFrame` wrapper) so they draw even in a background/hidden tab.
The **company-by-sector heatmap** and **sector-ETF selector** are plain HTML
(coloured cell grid + ranked table), not canvas, for easy tooltips + Yahoo links.
Ticker symbols throughout (leaderboard, universe chips, RS legend, pair badge,
suggestions, heatmap cells, ETF table) link to **Yahoo Finance** with a details
tooltip (name + description);
synthetic group baskets are labels, not links.

## Universe (editable JSON)

`sector-universe.json` ships the 11 GICS SPDR sectors (default-on) + SPY/RSP/QQQ/
IWM/DIA/MDY indexes + thematic groups (MAG7 default-on; SEMIS, MEMORY, SOFTWARE,
AIINFRA, BANKS, HOMEBUILD, NUCLEAR default-off) + a **Cross-Asset** group
(BTC, ETH, GLD, SLV, TLT, HYG, USO, UUP; default-off) for correlation work.
Add/remove by editing `entries[]`. Only `id` + (`ticker` for proxies, or
`members` for groups) are required; a proxy may carry an `alt` map for
provider-specific symbols (e.g. BTC `{yahoo:'BTC-USD', twelvedata:'BTC/USD'}`).
Members are approximate, US-listed only (Samsung / SK Hynix are not US-listed, so
`MEMORY` is MU/WDC/STX/SIMO). Thematic groups carry an optional **`etf`** (their
representative tradeable ETF) consumed by the rotation-suggestions panel. You can
also **add your own** single ETF/stock or an equal-weight **custom group** at
runtime (persisted in `localStorage`).

The file also carries a `sectorMap` object, keyed by the 11 GICS sector ids
(`XLK`…`XLU`). Each entry has `constituents` (top companies: `ticker`, `name`,
approx index `weight`) feeding the **company heatmap**, and `etfs` (candidate
sector/segment ETFs: `ticker`, `name`, `issuer`, `aum` $M, `expense`, `holdings`,
`weighting`, `segment`, `desc`) feeding the **ETF selector**. These are
**reference/label** data only — approximate, US-listed, ~2026-07; all momentum is
recomputed live from the fetch. Edit `sectorMap[XLx].constituents` / `.etfs` to
curate what the two drill-down panels show. A slimmer inline copy (minus the ETF
descriptions) ships in the HTML so the panels still work offline / on `file://`.

## Known limitations

- Twelve Data free is **unadjusted** (no dividends); sectors pay meaningful
  dividends, so total-return excess is slightly understated vs Yahoo adjusted.
- Group baskets are **equal-weight** synthetic proxies, not the real cap-weighted
  index; they exist to read momentum/breadth of a *theme*, not to price an ETF.
- RS-Ratio / RS-Momentum is a **simplified** JdK normalization; absolute values
  depend on L / M and are only comparable within one run's settings.
- All signals are lagging statistical constructs on noisy, delayed / EOD data.
- Yahoo proxies are unreliable on hosted origins; prefer a Twelve Data key on
  GitHub Pages.

## Next-run checklist

- [ ] Re-verify group memberships in `sector-universe.json` (spin-offs, IPOs,
      index reconstitutions) and re-date `asOf`.
- [ ] Re-verify `sectorMap` per-sector **constituents** and **ETF** lists
      (issuer AUM / expense / holdings drift; new funds; sub-industry
      reclassifications) and re-date `asOf`. Keep the slim inline
      `FALLBACK_SECTORMAP` in the HTML in sync with the JSON.
- [ ] Sanity-check the RRG against a known rotation (e.g. defensives leading into
      a risk-off tape) after a fresh fetch.
- [ ] Revisit default L (63 d) / M (10 d) for the current volatility regime.
- [ ] Consider a keyed **adjusted**-close historical source if going deeper on
      total-return excess.
- [ ] Optional: add a cap-weight mode for groups if reliable market caps become
      available to the page.

## Version history

- **v1.2 (2026-07-05)** — sector drill-down: a **company-by-sector momentum
  heatmap** (top constituents per GICS sector, coloured by 1M/3M/6M excess or
  blend or absolute return, with per-sector leader + dispersion) and a **sector
  ETF selector** that ranks each sector's prominent ETFs on size (AUM), cost
  (expense), coverage (holdings/segment) and live momentum into one **Fit**
  score. Both driven by a new `sectorMap` catalog in the universe JSON (11
  sectors × top constituents + candidate ETFs) with a slim inline fallback;
  both fetch on their own button (opt-in, never slows the core pull) via a
  refactored shared `pumpFetch` throttle core.
- **v1.1 (2026-07-02)** — rotation-suggestions panel (ETF-first: names a sector /
  index / group ETF to rotate into/out of, individual stock only on an extreme
  concentrated-leadership case; groups gain an `etf` proxy — MAGS/SMH/IGV/KBWB/
  ITB/NLR); a runtime **custom-group builder** + add-any-ETF/stock + a cross-asset
  quick filter; Yahoo-Finance ticker links with **detail tooltips** across this
  tool and the ETF-Momentum / AI-Capex tools.
- **v1.0 (2026-07-02)** — initial: 11 GICS sectors + indexes + 8 thematic groups
  - a cross-asset group (BTC/ETH/GLD/SLV/TLT/HYG/USO/UUP), Yahoo / Twelve Data
  data layer with per-provider symbol resolution for crypto, synthetic
  equal-weight daily-rebalanced group baskets with breadth, simplified JdK RRG,
  momentum-acceleration ranking, excess-return heatmap, RS lines, OBV/money-flow,
  rotation-intensity dispersion, a correlation matrix + rolling pair-correlation
  divergence monitor, per-entry risk flags, rotation-snapshot KPIs, CSV export,
  editable external universe.

## Edit / validate / ship

1. Edit `sector-research-lab.html` (tool) or `sector-universe.json` (universe).
2. Syntax check:
   `node -e "new Function(require('fs').readFileSync('sector-research-lab.html','utf8').match(/<script>([\s\S]*?)<\/script>/)[1])"`
   and `node -e "JSON.parse(require('fs').readFileSync('sector-universe.json'))"`.
3. Open the file in a browser, paste a Twelve Data key, click **Fetch price
   history**, confirm the RRG + leaderboard + charts populate.
4. Commit &amp; push — the `pages` workflow redeploys.
