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

## Simple vs Power (the rotation call)

Like the sibling tools (Intraday Tape, Swing Structure, Gamma Trading), the lab has
two modes, toggled top-left; the choice persists in `localStorage`.

- **Power** is the full dashboard documented above: the RRG, acceleration bars,
  leaderboard, the two drill-downs, money-flow, breadth and correlation.
- **Simple** (the default) digests the *same live computation* into one **steerable
  rotation call** — a curated, decision-first read, **not** the dashboard with panels
  hidden. It reuses the RRG quadrants + `rotationSuggestions()` classification
  unchanged, so Simple and Power can never disagree.

Simple is a guided four-step narrative under a one-line headline verdict:

1. **The tape** — `absMomRegime()` master switch + `cycleLean()` + `marketBreadth()`
   - avg pairwise correlation → risk-on/off and broadening-vs-narrowing in a line.
2. **Rotate into — two-clock timing.** For each INTO name, `entryTiming()` reads two
   independent clocks: a **rotation clock** (`early` former-laggard turning up =
   runway · `mid` · `late` = leading-but-rolling-over = Peaking) from RS-Ratio,
   6-month excess and acceleration; and a **price clock** (`ok` / `extended` /
   `overbought`) from RSI + stretch-over-50-DMA. They combine into an action —
   **BUY / SCALE IN / WAIT / CATALYST** — with scale-in / breakout levels derived
   from the 50-DMA and the 63-day high.
3. **Rotate out / trim** — the Peaking / Weakening names.
4. **Invalidation** — the level/condition that says the call is wrong (accel turns
   negative, RS-Ratio slips below 100, a close below the 50-DMA, or the trimmed
   leader reclaiming and turning relative-positive again).

**Steer levers** recompute the call live with no re-fetch: **Hold horizon**
(1–4 wk momentum-led vs 1–3 mo trend-led), **Style** (Offense = reward acceleration
· Balanced · Defense = tilt to low-beta defensives + penalize stretch),
**Aggressiveness** (Cautious / Normal / Aggressive shifts how much overbought is
tolerated), and a **Benchmark** quick-pick. The two decision functions
(`entryTiming`, `rotationVerdict`) are pure and pinned by `scripts/selftest.mjs`.

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
3M / 6M / **12M excess vs the benchmark**, the 1/3/6/12M **blend**, a
**risk-adjusted** blend÷vol read, or 3M / 6M **absolute** return); green =
leading, red = lagging, on a ±cap diverging scale. Each cell also carries small
status badges — a **▲** when the name is at a **63-day high**, and an **RSI**
badge when it is overbought (≥70) or oversold (≤30) — so a leader that is also
stretched, or a laggard that is washed out, is visible at a glance. Each row
shows how many members are fetched, the intra-sector **leader**, and the
cross-member **dispersion** (std-dev of the metric) — a high dispersion means the
sector move is concentrated in a few names, a low one means broad participation.
Every cell links to Yahoo. All values are from `tickerPerf(tk)`, computed from
the same live cache as everything else.

### Sector ETF selector — pick the vehicle

For the selected sector, its candidate ETFs (`sectorMap[XLx].etfs`) are ranked on
the **ten** parameters that matter when choosing a rotation vehicle — five
reference (available before any fetch) and five computed live from the same price
cache as everything else:

- **size** — AUM (log-scaled) → depth and tight spreads *(reference)*;
- **cost** — expense ratio, lower is better *(reference)*;
- **coverage** — holdings count (capped at 250) + a `segment` tag distinguishing
  a broad sector tracker from a narrower slice (semis, software, biotech,
  regional banks, homebuilders, gold miners…) *(reference)*;
- **concentration** (`Top10`) — the top-10 holdings' share of the fund: **lower =
  more diversified / deeper coverage**, higher = concentrated in a few names (a
  cap-weighted XLK ~72% vs an equal-weight RSPT ~20%) *(reference)*;
- **yield** (`Yld`) — approximate distribution yield: matters most when rotating
  **into income sectors** (utilities / REITs / staples / energy) *(reference)*;
- **liquidity** — average daily **dollar volume** (price × shares, 21-day) — real
  tradability, distinct from AUM (a big fund can still trade thin) *(live)*;
- **sector-tracking** (`Trk`) — daily-return **correlation to the sector's own
  headline SPDR** over ~189 days: 1.00 = pure sector exposure, a lower value is a
  deliberate narrower tilt (semis / biotech / miners), not necessarily worse *(live)*;
- **tracking-error** (`TE`) — **annualised stdev of the daily return *difference*
  vs the SPDR**: how far the vehicle *drifts* from the sector it represents (the
  SPDR itself = 0%). Distinct from correlation — a fund can be highly correlated
  yet still drift in magnitude (a leveraged/high-beta tilt) *(live)*;
- **downside** — **max drawdown** over the trailing ~year (peak-to-trough) *(live)*;
- **risk-adjusted momentum** — a **Sharpe-like** read: (annualized return −
  risk-free) ÷ 63-day annualized volatility over a **lookback you choose**
  (3M / 6M / 12M) — the return you actually *keep per unit of risk* *(live)*.

Two more live reads are **shown for context but not scored** (they are tilt /
active-return reads, not "higher = better"): **β** (beta to the sector SPDR — >1
amplifies the sector move, <1 dampens it) and the **information ratio** (`IR` —
annualised active return ÷ tracking error, the active return kept per unit of
drift).

Each parameter is **min-max-normalised across that sector's candidates**, then a
**Fit** score blends them with the **default weights** `0.22·risk-adj-momentum +
0.12·size + 0.12·liquidity + 0.13·low-cost + 0.06·coverage + 0.06·low-concentration

- 0.08·sector-tracking + 0.06·low-tracking-error + 0.05·low-drawdown + 0.05·yield`,
renormalised over whatever components are available (so the five reference
parameters rank the table even *before* you fetch prices — rows missing the live
metrics are marked`*`). The weights are **fully adjustable at runtime** via the
**⚙ Fit weights** tray (ten sliders + six one-click presets — *balanced, momentum,
liquidity, low-cost, tracking, income* — and a reset); each slider's shown % is
that parameter's share of the current blend. A **momentum-lookback** selector
(3M / 6M / 12M) drives the Sharpe read, and **⭳ CSV** exports the whole ranked
table (every parameter). The top row is flagged **BEST FIT**. The score is a
transparent trade-off aid, not advice: a big cheap broad tracker (VGT) and a
smaller high-momentum segment fund (SMH) sit side by side so you can see why you
might pick either. The table also shows raw 3M / 6M return and a combined`Risk`
cell (vol · max-DD) so nothing is hidden behind the single score.

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
- The ETF selector's **liquidity** (dollar ADV) uses unadjusted volume × adjusted
  close as a proxy; **sector-tracking** correlation, **tracking-error**, **beta**,
  the **information ratio** and the **Sharpe-like** risk-adjusted momentum depend
  on the fetched window and are only comparable within one run's settings. The
  **concentration** (top-10 weight) and **distribution yield** are approximate
  reference figures curated in `sectorMap` (no premium/discount, spread, or SEC
  30-day-yield feed) — verify with the issuer before trading.

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

- **v1.5 (2026-07-05)** — **Simple / Power split.** A new **Simple mode** (default;
  toggle top-left, persisted) digests the live RRG + momentum-acceleration into one
  **steerable rotation call**: a headline verdict + a guided four-step narrative
  (tape → rotate-into with two-clock entry timing → rotate-out → invalidation),
  reusing the existing `rotationSuggestions()` classification so the two modes never
  disagree. Two pure decision helpers — `entryTiming` (rotation clock
  early/mid/late × price clock ok/extended/overbought → BUY/SCALE/WAIT/CATALYST) and
  `rotationVerdict` (Hold-horizon / Style / Aggressiveness levers, recomputed live
  with no re-fetch) — are covered by 12 new `scripts/selftest.mjs` checks
  (**138 total**). The full dashboard is unchanged, now under the **Power** toggle.
- **v1.4 (2026-07-05)** — **major sector-drill-down upgrade + a load-time fix.**
  **Fix:** the company-heatmap and ETF-selector **sector dropdowns were never
  populated and the two panels were not drawn on load**, so they appeared blank
  until a manual fetch — now `fillDrillSelects()` populates both sector pickers
  (plus the colour-metric and momentum-lookback selects) and `render()` draws
  both panels on every update. **Sector-ETF selector:** the Fit blend grows from
  seven to **ten** parameters — adds **low-concentration** (top-10 weight), **low
  tracking-error** (annualised drift vs the SPDR) and **yield** (distribution) —
  and now also displays **β** (beta to the SPDR) and the **information ratio**
  (`IR`). The ten weights are **operator-adjustable** (⚙ Fit-weights sliders + six
  presets: balanced / momentum / liquidity / low-cost / tracking / income), the
  Sharpe-like momentum takes a **3M / 6M / 12M lookback**, and **⭳ CSV** exports
  the full ranked table. New columns: `Top10`, `Yld`, `TE`, `β`, `IR`. **Company
  heatmap:** cells gain **▲ new-high** and **RSI** overbought/oversold badges.
  **Data:** every sector ETF gains reference `yield` + `top10` fields, four
  prominent funds are added (RSPT equal-weight tech, KBE banks, PPH pharma, IYT
  transports) and the per-sector constituent lists are deepened — in **both**
  `sector-universe.json` and the inline `FALLBACK_SECTORMAP`. New pure helper
  `activeStats` (tracking error / beta / information ratio) is covered by 7 new
  `scripts/selftest.mjs` checks (**126 total**).
- **v1.3 (2026-07-05)** — deeper **sector-ETF selector**: the Fit score now folds
  in four more decision parameters computed live from the price cache — **liquidity**
  (21-day dollar ADV), **sector-tracking** (`Trk`, daily-return correlation to the
  sector SPDR), **max drawdown**, and a **Sharpe-like risk-adjusted momentum** that
  replaces raw momentum + standalone low-vol — re-weighted to
  `0.26·risk-adj-mom + 0.16·size + 0.14·liquidity + 0.16·low-cost + 0.10·coverage +
  0.10·tracking + 0.08·low-drawdown`; new `ADV/d`, `Risk` (vol·DD), `Trk` and
  `Sharpe` table columns. The **company heatmap** gains **12M-excess** and a
  **risk-adjusted (blend÷vol)** colour metric. New pure helpers (`maxDD`,
  `advDollar`, `annualize`, `sharpeLike`) are covered by the `scripts/selftest.mjs`
  math harness.
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
