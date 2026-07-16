# Research Lab — Shared Cross-Tool Data Layer (`rlData` / `RLDATA`)

> **Status: LIVE — implemented by [`../rldata.js`](../rldata.js).** This is a
> cross-cutting architecture note, not a tool. It specifies the shared
> browser-side cache so that **data fetched by one tool is reused by every other
> tool** instead of being re-fetched. It is a prerequisite for the two proposed
> TA tools ([`intraday-tape-lab.md`](intraday-tape-lab.md) and
> [`swing-structure-lab.md`](swing-structure-lab.md)) and a non-breaking upgrade
> path for the five live tools. **Educational only — not investment advice.**
>
> Nothing here is registered in `index.html` / `tools.json`; every live market-data
> tool loads the shared module directly.

---

## Why

The Research Lab shares **API keys** through one `rlApiKeys` localStorage object
owned by `rldata.js`. Credentials are edited only on `index.html#data-settings`;
tool pages consume them and never persist their own copy. The same module owns the
shared data cache and request lifecycle surfaced by `rlapp.js`.

| Tool | Private cache keys today |
| --- | --- |
| `etf-momentum-lab` | `etfMomSeries` (5y daily bars), `etfMomQuotes`, `etfMomHoldings` |
| `options-structure-lab` | `optStructLab` (settings), `optSnaps` (day-over-day option snapshots) |
| `sector-research-lab` | `sectorLab` |
| `ai-capex-strategy-lab` | `aiCapexLab` |

So the same NVDA daily bars can be fetched three times, the option chain the
options tool already pulled is invisible to a TA tool that needs the call/put
walls, and there is no shared market-gauge (VIX / Fear & Greed) that every tool
could read. On GitHub Pages, where the no-key proxies are frequently blocked and
the keyed providers are quota-limited (Twelve Data 8/min, Alpha Vantage 25/day),
**re-fetching the same series from four tools is the single biggest avoidable
cost.**

The user requirement is explicit: *"all data needs to be shared across all
tools, so we don't refetch it multiple times."*

---

## The contract

A single localStorage object `rlData` (schema-versioned) plus the shared
[`rldata.js`](../rldata.js) module. Every page loads `rldata.js` before
[`rlapp.js`](../rlapp.js); no page carries a private copy of the key/status contract.

```js
localStorage['rlData'] = {
  v: 1,
  bars: {                         // OHLCV by symbol + interval
    "NVDA": {
      "1d": { at: 1751500000000, src: "yahoo", rows: [ {t,o,h,l,c,v}, … ] },  // ~5y
      "5m": { at: …, src: "yahoo", rows: [ … ] },                             // ~1mo
      "1m": { at: …, src: "yahoo", rows: [ … ] }                              // ~7d
    }
  },
  quotes:  { "NVDA": { at, price, chgPct, src } },
  options: {                      // the options tool's per-day snapshot (optSnaps), reused AS-IS
    "NVDA": { "2026-07-03": {
      spot, netGEX, atmIV, skew, pcOI, pcVol,      // aggregates (put/call ratio + skew = greed/squeeze inputs)
      callWall, putWall, flip, maxPain,            // derived LEVELS already persisted by snapshotOf()
      oi: { "120": {c,p}, "125": {c,p}, … }        // per-strike call/put OI (object keyed by strike)
      // NOT persisted: volume-profile POC, expected-move, greeks, HVL.
      // EM is reconstructable from atmIV + T; POC is re-derived from OHLCV.
    } }
  },
  si:     { "NVDA": { at, sharesShort, pctFloat, dtc, trend, source } },
  macro:  { at,
    vix: 14.2, vixTerm: { vix9d, vix, vix3m, vix6m },   // term structure → contango/backwardation
    fearGreed: { score: 63, band: "Greed", components: {…} },
    breadth: { advDec, newHiLo, pctAbove50d }, pcRatio: 0.83
  },
  events: {
    "NVDA": { at, earnings: [ {date, est, when} ], exDiv: [ {date} ] },
    macro:  { at, items: [ {date, type: "CPI|FOMC|NFP|OPEX", importance} ] }
   },
   toolReads: {
      "global-rotation-lab": {
         id: "global-rotation-lab", asOf: "<ISO8601>",
         read: "EWY leads global rotation...", metrics: {…},
         deepLink: "global-rotation-lab.html"
      }
   }
}
```

### Helper API (shared `RLDATA` module)

| Call | Returns / does |
| --- | --- |
| `RLDATA.bars(sym, interval, maxAgeH)` | cached rows if fresh enough, else `null` |
| `RLDATA.putBars(sym, interval, rows, src)` | store/merge bars (append newest, dedupe by `t`) |
| `RLDATA.quote(sym, maxAgeMin)` / `RLDATA.putQuote(…)` | live-quote cache |
| `RLDATA.options(sym[, day])` | latest (or specific-day) option snapshot; **also reads legacy `optSnaps`** |
| `RLDATA.putOptions(sym, day, snap)` | mirror an option snapshot into the shared layer |
| `RLDATA.si(sym)` / `RLDATA.putSI(…)` | short-interest cache |
| `RLDATA.macro(maxAgeMin)` / `RLDATA.putMacro(obj)` | shared market-gauge (VIX, F&G, breadth) |
| `RLDATA.events(sym)` / `RLDATA.putEvents(…)` | earnings / econ-calendar cache |
| `RLDATA.toolRead(id)` / `RLDATA.putToolRead(id, read)` | latest owning-tool Simple decision `{id,asOf,read,metrics,deepLink}` |
| `RLDATA.freshness()` | as-of map for bars, options, macro and tool reads |
| `RLDATA.key(provider)` / `setKey(provider, value)` / `migrateKeys()` | single provider-key store; migrates and scrubs legacy copies |
| `RLDATA.barInfo(sym, interval, maxAgeH)` | fresh/stale/missing state, source, timestamp and row count |
| `RLDATA.dataState()` / `reportData(resource, state, detail)` | normalized request lifecycle consumed by the shared status UI |
| `RLAPP.report(...)` / `RLAPP.autoRefresh(...)` | adapter seam for custom chain/quote fetchers and standard bar deltas |

### Freshness TTLs (defaults; each tool may pass a stricter `maxAge`)

| Kind | TTL | Rationale |
| --- | --- | --- |
| `bars.1d` | 6 h | matches `etf-momentum-lab` today |
| `bars.5m` | 5 min | intraday session refresh |
| `bars.1m` | 1 min | tape |
| `quotes` | 60 s | live overlay |
| `options` | end-of-day, 1/day | OI updates overnight (same as `optSnaps`) |
| `macro` | 30 min | VIX/F&G move slowly intraday |
| `si` | 1 day | short interest is bi-monthly settlement |
| `events` | 1 day | calendars change slowly |

### Rules (invariant across tools)

1. **Backward-compatible / non-breaking.** The new tools READ `optSnaps` (the
   options tool's existing store) directly, so nothing about the options tool
   has to change for the walls/GEX to be shared on day one — its `snapshotOf()`
   already persists `{spot, netGEX, pcOI, pcVol, skew, atmIV, callWall, putWall,
   flip, maxPain, oi:{K:{c,p}}}` per ticker per day (only POC/expected-move/greeks
   are absent and are re-derived). The persisted `netGEX` / `flip` are already
   **sign-applied** under whatever dealer-gamma convention was active when saved —
   consumers read them as-is and MUST NOT re-flip the sign. Going forward every
   tool ALSO writes into `rlData` (a one-line mirror), so the layer converges
   without a flag day. Existing private keys (`etfMomSeries`, …) keep working; a
   one-time `rlDataMigrate()` seeds `rlData.bars` from them on first load.
2. **Provider-tagged.** Every cached series records its `src` (yahoo adjusted vs
   twelvedata raw vs alphavantage) so a consumer knows whether closes are
   total-return-adjusted before mixing them. A tool must never silently blend
   adjusted and raw closes.
3. **Interval-keyed, never overwritten across intervals.** `1d`, `5m`, `1m` are
   independent; fetching intraday never evicts the daily cache.
4. **Quota-aware, single-writer-wins.** Writes are last-write; on `QuotaExceeded`
   the oldest-`at` symbol bucket is pruned first (localStorage ≈ 5 MB, so cap ~4
   MB and prune). No cross-tab locking is attempted (single-user, single-tab
   assumption — same as today).
5. **Honest staleness.** Consumers surface the as-of timestamp; a tool must show
   "data N min old / re-fetch" rather than presenting stale bars as live.
6. **One credential surface.** Provider keys are edited on the landing page only.
   A tool-specific key field or key copied into tool state is a defect.
7. **Automatic delta + visible lifecycle.** On open, paint cache first, request only
   stale/missing resources, and report the result through the shared data-status control.

---

## Shared market-gauge (computed in-browser)

There is no official free Fear & Greed API and CNN's endpoint is unofficial and
proxy-gated. So the shared layer proposes an **in-browser Fear & Greed proxy**,
computed from series the Lab can already fetch, cached once in `rlData.macro`,
and reused by every tool. CNN's index is an equal-weighted average of seven
components (0 = extreme fear, 100 = extreme greed; 0-24 extreme fear · 25-44 fear
· 45-55 neutral · 56-75 greed · 76-100 extreme greed). Feasible proxies:

| CNN component | In-browser proxy from fetchable data |
| --- | --- |
| Stock price momentum | SPX (`^GSPC`) vs its 125-day MA |
| Market volatility | VIX (`^VIX`) vs its 50-day MA (inverted) |
| Safe-haven demand | 20-day SPX return − 20-day TLT return |
| Junk-bond demand | 20-day HYG return − LQD return (spread proxy) |
| Stock-price strength | % of a breadth basket at 20-day highs vs lows (reuse `sector-universe` members) |
| Stock-price breadth | up-volume vs down-volume across the breadth basket |
| Put/call options | from the options tool's put/call OI/volume ratio (shared) |

The proxy is **documented as a proxy**, not the official index; the optional CNN
feed (`production.dataviz.cnn.io/index/fearandgreed/graphdata`, best-effort via
the proxy chain) can override it when it resolves. VIX term structure
(`^VIX9D` / `^VIX` / `^VIX3M` / `^VIX6M`) gives a contango-vs-backwardation regime
read that both TA tools consume.

---

## Data-source feasibility (reuses the existing fetch stack)

No new provider or proxy is introduced — the layer reuses the Yahoo→allorigins→
codetabs proxy chain and the shared Twelve Data / Finnhub / Alpha Vantage keys.

| Need | Endpoint | Notes |
| --- | --- | --- |
| Daily bars (~5y) | Yahoo `v8/finance/chart/<sym>?interval=1d&range=5y` | already used; adjusted close |
| Intraday bars | Yahoo `…?interval=5m&range=1mo` / `interval=1m&range=7d`; Twelve Data `interval=5min` | 1m limited to ~7d; proxy-gated on hosted origins → best-effort |
| Live quote | Yahoo `…?range=1d` meta; Twelve Data `/quote` (batched) | already used by etf lab |
| Option walls/GEX/OI | **read `optSnaps`** (options tool) / `rlData.options` | `callWall·putWall·flip·maxPain·netGEX·skew·pcOI·pcVol·oi{K:{c,p}}` already persisted → no refetch. POC / expected-move re-derived (EM from `atmIV`+T). |
| VIX + term | Yahoo `^VIX`, `^VIX9D`, `^VIX3M`, `^VIX6M` | same chart endpoint |
| Short interest | Nasdaq / stockanalysis.com / Yahoo (as in options tool) | reuse options tool's SI code path |
| Earnings / econ calendar | Finnhub `/calendar/earnings`, `/calendar/economic` (shared key) | best-effort; degrade to an editable built-in date list |
| Margin debt | FINRA monthly (no clean API) | annotated/manual context only — never presented as live |

---

## Build checklist (when this is implemented)

1. Write the `RLDATA` IIFE once; paste it into the two new tools first.
2. Add a one-time `rlDataMigrate()` that seeds `rlData.bars` from `etfMomSeries`
   and mirrors `optSnaps` → `rlData.options` (read-only for legacy tools).
3. New tools go **shared-first**: check `RLDATA.bars/options/macro` before any
   network call; only fetch (and then `putBars`) on a miss/stale.
4. Add a small "data age" badge (`RLDATA.freshness`) to each new tool's header.
5. Later, non-breaking: patch the five live tools to `putBars`/`putOptions` into
   `rlData` after their own fetches (a few lines each), so the cache converges.
6. Validate offline (`file://`) and on Pages; confirm no quota crash by loading
   ~30 symbols × 3 intervals then pruning.

---

## Version history

- **v0 (2026-07-03)** — Proposed. Schema, `RLDATA` helper API, freshness TTLs,
  in-browser Fear & Greed proxy, non-breaking migration path from `optSnaps` /
  `etfMomSeries`. Prerequisite for `intraday-tape-lab` and `swing-structure-lab`.
