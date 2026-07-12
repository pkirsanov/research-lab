# ETF Momentum Research Lab — notes

Single-file tool: [`../etf-momentum-lab.html`](../etf-momentum-lab.html)
Editable universe: [`../etf-universe.json`](../etf-universe.json)

## Purpose

Compare a universe of **momentum ETFs** (the etfdb *High Momentum* list, sorted
by AUM, plus **QQQ** and **VGT**) on real performance and risk, then stress
their expected returns under market regimes and a Monte-Carlo model. Everything
is computed **from live price history you fetch**, not from any stored number.

The default **Simple** view ranks a steerable sleeve by 3M/6M/12M or blended
momentum with raw/balanced/defensive risk treatment. **Power** preserves the full
leaderboard, strategy builder, charts, holdings, CAPM regimes and simulations.
Both views use the same `METRICS` compute path. Each render publishes the owning
Simple read to `RLDATA.toolReads['etf-momentum-lab']` for the Market Brief.

## International ETF split

`etf-universe.json` now includes an **International Country Rotation** section:
South Korea (`EWY`), Singapore (`EWS`), Philippines (`EPHE`), Germany (`EWG`),
Japan, Taiwan, India, China, UK, Australia, Canada, Brazil and Mexico, plus EFA/EEM
controls. They remain available in the ETF comparison engine, but country allocation
is materially different from US factor selection: USD ETF returns already embed FX,
local cash markets close asynchronously, and country sector concentration dominates.
The dedicated [Global Rotation Lab](global-rotation-lab.md) owns that deeper
FX/session-aware analysis.

## Data sources (cache-first, then on demand)

| Source | How | Gives | Notes |
|---|---|---|---|
| **Yahoo** `query1.finance.yahoo.com/v8/finance/chart/<tk>?range=5y&interval=1d&includeAdjustedClose=true` | direct, then `api.allorigins.win`, then `api.codetabs.com` proxies | OHLC, **adjusted close**, volume, live last price | No key. Public proxies are frequently blocked on hosted origins (github.io) — best-effort. |
| **Twelve Data** `api.twelvedata.com/time_series?symbol=<tk>&interval=1day&outputsize=1300` | native CORS with a free key | OHLC + volume (**unadjusted** close on free tier) | Works from GitHub Pages. Free tier = 8 req/min / 800 req/day → the app throttles ~8 s per symbol. |
| **Alpha Vantage** `alphavantage.co/query?function=ETF_PROFILE&symbol=<tk>` | native CORS with a free key (no proxy) | **full holdings + sector weights** + net assets, expense, dividend yield | Powers the Underlying-stocks panel. Free key = 25 req/day, 5/min → the app throttles ~13 s per symbol when fetching several. The literal key `demo` works for **QQQ only**. |

~5 years of daily bars are fetched once per ticker and cached in `localStorage`
(`etfMomSeries`); the **analysis window** (1M…Max) then slices the cache
locally, so changing the window never refetches. "force refresh" re-pulls;
otherwise a symbol is refetched only when its cache is >6 h old.

On boot the page imports any newer shared `RLDATA.bars` first and then appends only
missing/stale included symbols. Legacy manual fetches mirror their results back into
the shared cache, so sibling tools and the brief reuse them.

Because Yahoo uses **adjusted** close (dividends + splits) and Twelve Data free
uses **raw** close, total-return figures differ slightly between sources — Yahoo
is the more accurate total-return series.

### Live intraday quotes (the “↻ Live prices” button)

Separate from the historical series, the leaderboard shows a live **Price** + a
**1D%** column. The default source is **Twelve Data** (like the sibling AI Capex
Lab, which learned that no-key proxies are usually blocked on GitHub Pages — so a
keyed native-CORS provider is the default). Sources:

- **Twelve Data** `api.twelvedata.com/quote?symbol=<batched>` — ONE call for all
  included funds; returns `close` + `percent_change` (→ 1D%). Auto-runs right
  after a history fetch, and on the **↻ Live prices** button.
- **Yahoo** `.../chart?range=1d` meta (`regularMarketPrice` / `previousClose`)
  via the proxy chain — best-effort, per-symbol, only on the button.
- **Series seed** — immediately after any history fetch, a current price + last-
  session 1D% is seeded from the fetched bars (Yahoo `regularMarketPrice` when
  present, else last close), so a price shows even before a live refresh.

Quotes cache in `localStorage` (`etfMomQuotes`) and overlay the historical last
bar in the table.

## Universe (editable JSON)

`etf-universe.json` is fetched at load and overrides an inline fallback copy (so
the page still renders offline / on `file://`). Add or remove a fund by editing
`etfs[]`; only `ticker` + `name` are required. `on:true` default-includes it.
Reference `aum` ($M), `priceRef`, `avgVol` were captured from etfdb **2026-07-01**;
`expense`/`inception` are filled where confidently known, else `null`. `holdings`
is populated for QQQ and VGT only as a reference fallback — for any other fund
(the momentum funds rotate holdings), pull **live full holdings dynamically**
from Alpha Vantage (see below). You can also add any ticker at runtime with the
**＋ add** box (persisted; e.g. add `SPY`, `IWM`, individual stocks).

## Holdings (dynamic, Alpha Vantage)

The issuer holdings CSVs (iShares/Invesco/Vanguard) and Yahoo's `topHoldings`
module are **not usable** from a static browser page — the issuer CSVs are
CORS-blocked and per-fund-ID (not addressable by ticker), and Yahoo `quoteSummary`
is now crumb-locked (returns `Invalid Crumb`). The one free, CORS-clean,
ticker-addressable source is **Alpha Vantage `ETF_PROFILE`**, which returns the
**full** holdings list + sector weights + net assets / expense / yield and sends
`Access-Control-Allow-Origin: *` on a browser request (so it is called directly,
no proxy). In the Underlying-stocks panel: set *Holdings source* = Alpha Vantage,
paste a free key (or `demo` for QQQ), and **Fetch holdings** (focus fund) or
*fetch all included* (throttled ~13 s each for the 5/min free limit). Results are
cached in `localStorage` (`etfMomHoldings`) and **override** the JSON reference;
the table shows a `● live` badge with holding count, expense, yield, net assets
and as-of date. Live holdings also feed the cross-ETF overlap chart, so the
momentum funds' real overlap becomes visible once fetched.

Default-included: MTUM, SPMO, XMMO, XSMO, JMOM, PDP, VFMO, FDMO, DWAS, QMOM,
PTF, QQQ, VGT + benchmark SPY. The rest (international/EM, value-momentum,
small-cap factor) ship default-off; quick toggles: **all / none / momentum only /
US only / reset**.

## Methodology (all from windowed daily returns rₜ = adjₜ/adjₜ₋₁ − 1, 252/yr)

- **Window return** = adj_last/adj_first − 1; **CAGR** = (last/first)^(1/years) − 1.
- **Volatility** = stdev(r)·√252 (sample, n−1).
- **Max drawdown** = min over t of adjₜ/running-peak − 1; **Ulcer index** = √mean(ddₜ²).
- **Downside deviation** = √mean(min(r−rf_daily,0)²)·√252.
- **Sharpe** = (CAGR − rf)/vol · **Sortino** = (CAGR − rf)/downside-dev · **Calmar** = CAGR/|maxDD|.
- **VaR₉₅ / CVaR₉₅** = historical 5th-percentile daily loss / mean loss beyond it.
- **β, α, corr, R²** vs the chosen benchmark on **date-intersected** daily returns:
  β = cov(r,r_b)/var(r_b); α_annual = (mean(r) − β·mean(r_b) − rf_daily·(1−β))·252;
  residual σ = vol·√(1−R²) (drives the regime bands).
- **Up/down capture** = Σ fund-returns / Σ benchmark-returns on up / down benchmark days.
- **Trailing returns** (1M/3M/6M/YTD/1Y cumulative; 3Y/5Y annualized) use the
  full ~5 y cache and a calendar lookback (value as-of latest − N days).
- **Basket**: the included funds combined equal- or AUM-weighted, daily-rebalanced,
  then the same stats (an "own the whole momentum sleeve" proxy). AUM weighting is
  dominated by QQQ/VGT — use equal weight to see the momentum funds themselves.

### Market-regime estimator (CAPM-implied, 1-year)

For each regime you set a **market (benchmark) 1-year return** m and a probability.
Each fund's expected return is its CAPM line **E[fund] = α_annual + β·m**; the
blended EV is Σ pᵢ·Eᵢ. Bands (not plotted, used for context) are ±1.28·residual σ.
This is a *linear factor estimate*, not a forecast — momentum funds have unstable
β and fat left tails, so treat bear/crash bars as optimistic.

### Monte-Carlo (GBM)

For the chosen subject (a fund or the basket): simulate Sₜ = S₀·exp(Σ (μ−½σ²)dt +
σ√dt·Z), dt = 1/252, over the horizon. σ = window volatility; μ = window CAGR /
arithmetic mean / CAPM (rf+β·ERP) / manual. Outputs the P5/P25/median/P75/P95 fan,
the terminal-value histogram, and probability of loss. GBM assumes constant μ,σ
and lognormal returns — it understates crash risk and momentum reversals.

## Input levers

Data source + key · analysis window · benchmark (SPY/QQQ/VOO/IWM/ACWI) ·
risk-free % · focus ETF (single-fund charts) · basket weighting · per-regime
market return + probability · Monte-Carlo subject / horizon / paths / drift / ERP.
State (selection, params, scenarios, key) persists in `localStorage` (`etfMomLab`).

## Charts (10, hand-drawn canvas, no libraries)

Cumulative return overlay · drawdown underwater · risk-vs-return scatter (bubble =
AUM) · correlation heatmap · volume+price · rolling 21-day vol · trailing returns ·
daily-return distribution + normal + VaR · regime expected-return bars · Monte-Carlo
fan + terminal histogram · **sector-weight bars (live, Alpha Vantage)** · cross-ETF
holding-overlap bars.

## Known limitations

- Free-tier data is delayed/EOD; Twelve Data free is unadjusted (no dividends).
- Holdings: JSON reference ships for QQQ/VGT; **live full holdings + sector weights for any fund are pulled on demand from Alpha Vantage** (free key, 25/day, 5/min). AV `net_assets`/expense/yield are its own figures and can differ from the issuer.
- β/α/regime/MC are linear-Gaussian models; momentum has non-normal, regime-dependent risk.
- Reference AUM/expense/price are approximate snapshots — verify with the issuer.
- Yahoo proxies are unreliable on hosted origins; prefer a Twelve Data key on GitHub Pages. Alpha Vantage (holdings) is native-CORS and needs no proxy.

## Next-run checklist

- [ ] Refresh `etf-universe.json` AUM/price/expense from etfdb / issuers; re-date `asOf`.
- [ ] Re-pull the etfdb High-Momentum list (funds enter/leave the screen).
- [ ] Pull live holdings from Alpha Vantage for the momentum funds when a real overlap/sector view is wanted (JSON `holdings` stay as the fallback).
- [ ] Consider a keyed historical source with adjusted close if going deeper on total return.
- [ ] Revisit default regime returns/probabilities for the current cycle.

## Version history

- **v1.2 (2026-07-01)** — live intraday quotes: default source switched to Twelve
  Data (keyed native-CORS, works when hosted; Yahoo demoted to best-effort), a
  batched `/quote` live refresh + Yahoo-meta fallback, a series-seeded current
  price, and a **1D%** leaderboard column. Mirrors the AI Capex Lab's keyed-
  provider lesson.
- **v1.1 (2026-07-01)** — dynamic holdings: Alpha Vantage `ETF_PROFILE` provider (full
  holdings + sector weights, native-CORS, cached), a sector-weight chart, live-aware
  cross-ETF overlap, and a live/reference badge. Fixed a `windowOf` crash on
  cached series (OHLC fields the cache doesn't persist).
- **v1.0 (2026-07-01)** — initial: 25 momentum ETFs (etfdb, AUM desc) + QQQ + VGT,
  Yahoo/Twelve Data data layer, full performance/risk/β/regime/Monte-Carlo engine,
  10 charts, editable external universe.

## Edit / validate / ship

1. Edit `etf-momentum-lab.html` (tool) or `etf-universe.json` (universe).
2. Syntax check: `node -e "new Function(require('fs').readFileSync('etf-momentum-lab.html','utf8').match(/<script>([\s\S]*?)<\/script>/)[1])"` and `node -e "JSON.parse(require('fs').readFileSync('etf-universe.json'))"`.
3. Open the file in a browser, pick a source, click **Fetch price history**, confirm the leaderboard + charts populate.
4. Commit & push — the `pages` workflow redeploys.
