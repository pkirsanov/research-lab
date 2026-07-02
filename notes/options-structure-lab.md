# Options Structure &amp; Momentum Research Lab — notes

> **Status: LIVE (v1.0, 2026-07-02).** Single-file tool:
> [`../options-structure-lab.html`](../options-structure-lab.html). This document is
> both the original analyst discovery/design brief and the live tool's methodology
> handoff for the next run. **Educational only — not investment advice.** Everything
> is a hypothetical, delayed / EOD, positioning-derived read from public data you
> fetch yourself.

Single-file tool: [`../options-structure-lab.html`](../options-structure-lab.html)
Editable universe: [`../options-structure-universe.json`](../options-structure-universe.json)

---

## Purpose

Answer one question well: **where is resistance and where is support hiding in the
options + volume structure, and — given how dealers are positioned — will price
PIN at those levels or BREAK through them (momentum)?**

Most retail charts show *price* support/resistance. This tool shows the *forces
that create* support/resistance: the strikes where option open interest is
stacked (walls), where dealer gamma flips sign (pin vs trend regime), where the
most shares actually changed hands (volume profile / HVL), where the max-pain
magnet sits, and how far the options market thinks price can travel by each
expiry (expected-move "coverage"). It then reads **which way momentum is
resolving** from OI build direction, volatility skew, short-interest pressure,
and the underlying's own price/volume momentum.

It is the options-market-structure sibling to the
[Sector Rotation &amp; Momentum Lab](sector-research-lab.md) (rotation) and the
[ETF Momentum Lab](etf-momentum-lab.md) (risk/return). Same ethos: one
self-contained HTML file, no build step, hand-drawn canvas charts, everything
computed in-browser from data you fetch on demand.

---

## Outcome Contract

- **Intent.** Give a single-name (or index-ETF) researcher a fast, honest,
  in-browser read of the **support/resistance map implied by options positioning
  and traded volume**, plus a **regime read** (dealer long-gamma pin vs
  short-gamma trend) and a **directional momentum read**, across multiple
  expirations, with short-interest / squeeze context.
- **Success signal.** For a liquid optionable ticker (e.g. SPY, NVDA, TSLA), after
  one fetch the tool renders: a Call Wall, a Put Wall, a Gamma-Flip level, a
  Max-Pain level, an HVL / volume-profile POC, per-expiry expected-move cones, and
  a net-GEX regime badge — and a user can name the nearest resistance and support
  and say whether the current regime favors pinning or trending, **without leaving
  the page or reading a paywalled vendor**.
- **Hard constraints.** (1) All positioning math is transparent and recomputed
  in-browser from the fetched chain — no stored/blackbox numbers. (2) Every sign
  convention and every assumption (dealer-positioning sign, rate, dividend,
  greeks model) is documented and, where it matters, user-toggleable. (3) The tool
  never claims to see real order flow, dark pool, or trade-level bid/ask side — it
  is OI + volume + IV structure only. (4) No network calls except the same public
  endpoints/proxies the sibling tools already use; no keys required beyond the
  shared Twelve Data / (optional) Yahoo path.
- **Failure condition.** The tool is a failure if it presents dealer-gamma or
  "walls" as fact rather than as a **convention-dependent estimate**, if it implies
  intraday real-time flow it does not have, or if a wrong/ambiguous sign convention
  makes the regime read backwards. Being *pretty but misleading* is worse than
  being modest and correct.

---

## Actors &amp; Personas

| Actor | Description | Key goals | What they read first |
|---|---|---|---|
| **Level / structure trader** | Trades around known S/R; wants option-derived levels | "Where does price stall or bounce, and is the level real?" | Structure Map: Call Wall, Put Wall, HVL, Max Pain |
| **Regime / vol trader** | Cares whether the tape pins or trends | "Are dealers long or short gamma right now? Where's the flip?" | Net-GEX chart + gamma-flip level + regime badge |
| **Momentum / breakout trader** | Wants to know if a wall will break | "Is OI building above spot? Is the flip below me? Is SI fuel present?" | OI-change, skew, squeeze panel, price/volume momentum |
| **Swing / positioning researcher** | Multi-day; watches structure migrate | "Are walls migrating up/down day over day? Is OI accumulating or unwinding?" | Day-over-day OI/GEX/wall migration (localStorage history) |
| **Expiry / OPEX planner** | Trades around expirations | "Which expiry carries the gamma? How wide is the expected move by date?" | Expiration ladder + expected-move cones |
| **Squeeze hunter** | Hunts short-squeeze setups | "High short%float + rising calls + negative GEX + up momentum?" | Short-interest / squeeze gauge + call-skew build |
| **Educational / self-learner** | Learning market structure | "What do GEX / max pain / skew actually mean and look like?" | Every chart's plain-language caption + glossary footer |

Non-actors (explicitly out of scope): a live intraday flow tape reader, a
strategy P/L builder (that is OptionStrat's job), an order-router, or anyone
needing real-time (sub-15-min) data.

---

## Domain Capability Model (AN5 — capability-first)

This is a brand-new capability *and* it references provider/adapter/variant
patterns (multiple data providers, multiple "level" types), so the domain model
is defined before any concrete provider/chart is built.

**Primitives**

- **Underlying** — a ticker with a spot price and a daily OHLCV series.
- **Expiration** — a date with a full option chain; carries an ATM IV and a
  day-count / time-to-expiry `T`.
- **Contract** — one (expiry, strike, right∈{call,put}) with `{OI, volume, IV,
  bid, ask, last, ITM}` from the provider, plus **derived** greeks
  `{delta, gamma, vega, theta, vanna, charm}` computed in-browser.
- **Level** — a horizontal price of interest with a `type` and a `source`:
  `type ∈ {callWall, putWall, gammaFlip, maxPain, HVL, volumeProfilePOC,
  expectedMove±, priorDayWall}`. Levels are the shared output surface every chart
  and the Structure Map consume.
- **Snapshot** — one fetched chain for an underlying at a timestamp, cached in
  `localStorage`; a sequence of snapshots is the **positioning history** (enables
  OI-change / wall-migration with no paid history API).
- **Regime** — a classification `{longGamma/pinning, shortGamma/trending}` with a
  `gammaFlip` boundary and a `netGEX` magnitude.
- **SqueezeContext** — `{shortPctFloat, daysToCover, siTrend, priceMomentum,
  callSkewBuild}` → a bounded squeeze score.

**Lifecycle**: `Underlying → fetch → Snapshot(Expirations[Contracts]) → derive
greeks → aggregate Levels + Regime + SqueezeContext → render`. Snapshots
accumulate into history on each fetch day.

**Provider-neutral behavior (every data provider must satisfy):** given an
underlying it yields spot + one or more Expirations, each a list of Contracts with
at least `{strike, right, OI, volume, IV}`. Providers differ only in symbol
formatting, expiry coverage, and whether they supply IV (if not, IV is solved
from mid price). GEX/wall/max-pain/expected-move math is **provider-agnostic** and
runs identically regardless of source. Short interest is a **separate capability**
with its own provider (may be absent → the squeeze panel degrades to "SI
unavailable", it never blocks the structure read).

**Business policies (invariant across providers/charts):**
1. A Level is never emitted without its `source` + the assumption set that
   produced it (so a chart can always explain itself).
2. Contracts below a liquidity floor (min OI / min volume / bid&gt;0) are excluded
   from wall/GEX aggregation and flagged, never silently mixed in.
3. The dealer-positioning **sign convention** is a single global setting that every
   GEX-derived Level and the Regime read share — they can never disagree.

---

## Use Cases

### UC-001 — Map option-implied support &amp; resistance
- **Actor:** Level / structure trader
- **Preconditions:** A liquid optionable ticker; at least one expiry chain fetched.
- **Main flow:** 1) Enter ticker, fetch chain(s). 2) Tool aggregates OI by strike,
  finds Call Wall (largest call-OI / max positive GEX above spot) and Put Wall
  (largest put-OI / max negative GEX below spot). 3) Overlays Max Pain, HVL, and
  volume-profile POC on the price axis. 4) User reads nearest resistance/support.
- **Alt flow:** Illiquid ticker → walls flagged low-confidence; volume-profile S/R
  still shown from underlying OHLCV.
- **Postcondition:** A labeled Structure Map with named levels and confidence.

### UC-002 — Read the dealer-gamma regime (pin vs trend)
- **Actor:** Regime / vol trader
- **Main flow:** 1) Tool computes net GEX by strike and the **gamma-flip** (zero-
  gamma) level. 2) Classifies regime: spot above flip &amp; net GEX&gt;0 = long-gamma
  (vol-suppressing / pinning); spot below flip / net GEX&lt;0 = short-gamma (vol-
  amplifying / trending). 3) Regime badge + the flip line on the Structure Map.
- **Postcondition:** User can state the regime and where it flips.

### UC-003 — Judge whether a wall will hold or break (momentum)
- **Actor:** Momentum / breakout trader
- **Main flow:** 1) Compare price to nearest wall in % and ATR units. 2) Read OI
  **change** vs prior snapshot (building above spot = fuel to break up). 3) Read
  call/put **skew** direction and short-interest fuel. 4) Combine into a
  break-vs-hold lean with the regime (short-gamma favors breaks; long-gamma favors
  holds/pins).
- **Postcondition:** A directional lean with the evidence that produced it.

### UC-004 — Plan around expirations &amp; expected move ("coverage")
- **Actor:** Expiry / OPEX planner
- **Main flow:** 1) Tool builds an expiration ladder (OI / GEX weight by expiry).
  2) Computes per-expiry expected move from the ATM straddle / ATM IV → ±1σ cones.
  3) Optionally shows the **dealer hedging-coverage** curve (shares dealers must
  buy/sell per 1% move given net gamma). 4) User picks the expiry that carries the
  structure and sizes expectations to the cone.
- **Postcondition:** Expected-move cones by date + the dominant-gamma expiry.

### UC-005 — Screen a squeeze setup
- **Actor:** Squeeze hunter
- **Main flow:** 1) Fetch short interest (short%float, days-to-cover, trend).
  2) Combine with rising call OI/skew, negative GEX, and up-price momentum.
  3) Bounded squeeze score + the missing ingredients called out.
- **Alt flow:** SI provider unavailable → score shows "SI unavailable"; the rest
  of the setup (call-skew build + negative GEX + momentum) still displays.

### UC-006 — Track structure migration day over day
- **Actor:** Swing / positioning researcher
- **Main flow:** 1) Each fetch caches a snapshot. 2) Tool diffs today vs the last
  cached day: wall migration (up/down), net-GEX change, OI build/unwind by strike.
  3) User sees whether the ceiling is rising or the floor is eroding.
- **Postcondition:** A migration read from local history — no paid time-series API.

---

## Business Scenarios

### BS-001 — Nearest levels after one fetch
Given a liquid ticker and a completed chain fetch
When the Structure Map renders
Then the Call Wall, Put Wall, Gamma-Flip, Max-Pain, and HVL are drawn on the price
axis with numeric labels and the two nearest levels to spot are highlighted.

### BS-002 — Regime is unambiguous and self-consistent
Given a computed net-GEX profile
When the regime badge shows "long gamma / pinning" or "short gamma / trending"
Then the gamma-flip line, the regime badge, and every GEX-derived wall all use the
**same** sign convention and never contradict each other.

### BS-003 — Expected-move cones scale with expiry
Given ATM IV for each fetched expiry
When expected-move cones are drawn
Then a nearer expiry shows a narrower ±1σ cone than a farther expiry, and each cone
is labeled with its expiry date and ±% width.

### BS-004 — Low-liquidity honesty
Given a thin-OI ticker (or a far expiry with sparse quotes)
When walls/GEX are computed
Then contracts below the liquidity floor are excluded and flagged, and any level
built on thin data carries a low-confidence marker rather than a false precision.

### BS-005 — Sign-convention toggle flips the whole read coherently
Given the dealer-positioning sign toggle
When the user switches convention
Then net GEX, the gamma-flip level, the call/put wall designation, and the regime
badge all recompute together and remain mutually consistent.

### BS-006 — Day-over-day migration from local cache
Given at least two cached snapshots on different days
When the migration panel renders
Then it shows wall movement, net-GEX change, and per-strike OI build/unwind between
the two most recent snapshots, with no additional network call.

### BS-007 — Structure survives an options-fetch failure
Given the options endpoint/proxies are blocked (common on hosted origins)
When the fetch fails
Then the underlying price/volume momentum + volume-profile S/R still render from the
(Twelve Data / Yahoo) OHLCV path, and the options panels show a clear "chain
unavailable — paste/import or try a key/proxy" state instead of a blank screen.

### BS-008 — Max-pain magnet is visible and defined
Given a fetched expiry
When the max-pain curve renders
Then it plots total option-holder $ value across candidate settle prices and marks
the minimizing strike as Max Pain, with a caption defining it as a pinning
heuristic, not a prediction.

### BS-009 — Squeeze score degrades gracefully
Given short interest is unavailable
When the squeeze panel renders
Then it shows the available ingredients (call-skew build, negative GEX, price
momentum) and marks SI as unavailable, never blocking or faking the score.

### BS-010 — Accessibility &amp; background-tab rendering
Given any chart canvas
When the page renders (including in a hidden/background tab)
Then every `<canvas>` has an `aria-label` + fallback text and draws **synchronously**
(no `requestAnimationFrame` wrapper), matching the sibling tools.

---

## Competitive Analysis

| Capability | **This tool (proposed)** | SpotGamma | MenthorQ | Unusual Whales | Barchart | OptionStrat | Market Chameleon |
|---|---|---|---|---|---|---|---|
| Option walls (Call/Put Wall) | ✅ OI + GEX, in-browser | ✅ (core) | ✅ Call Resistance / Put Support / HVL | ~ | ~ | — | — |
| Gamma exposure / flip | ✅ computed, sign-toggle | ✅ | ✅ Net GEX + flip | ✅ MM Exposure / Periscope | — | — | — |
| Greeks (incl. vanna/charm) | ✅ BSM in-browser | ✅ | ✅ | ✅ dashboards | Δ only | ✅ net greeks | ~ |
| Max pain | ✅ | ~ | ~ | ~ | ✅ (premier) | ✅ implied | ✅ |
| Expected-move cones | ✅ per expiry | ✅ | ✅ | ~ | ~ | ✅ prob dist | ✅ |
| Volume profile / HVL (cash) | ✅ VPVR + POC | — | ✅ HVL | — | — | ✅ vol overlay | — |
| Unusual activity (Vol/OI) | ✅ Vol/OI + OI-change | ~ | ✅ | ✅ (core) | ✅ (core) | ✅ (core) | ✅ (core) |
| IV rank / skew / term / VRP | ✅ | ✅ | ✅ (VRP, smile, skew) | ✅ | ✅ IV rank/pctl | ✅ IV/exp | ✅ (core) |
| Short interest / squeeze | ✅ best-effort + gauge | — | ~ | ~ | ~ | — | ~ |
| Day-over-day migration | ✅ localStorage history | ✅ | ✅ | ✅ | ~ | ~ | ~ |
| Real-time trade-level flow | ❌ (out of scope) | ~ | ~ | ✅ (core) | ✅ delayed | ✅ OPRA 15m | ✅ delayed |
| Price | **Free, self-hosted, no login** | $$$ | $$$ | $$$ | $$ | $$ | $$ |
| Runs offline / single file | ✅ | — | — | — | — | — | — |

**Gap read.** Every competitor is a paywalled SaaS. None is a free, single-file,
offline-capable, fully-transparent tool where the *math is readable* and the sign
conventions are yours to flip. That transparency + zero-cost + no-login + editable-
universe is the edge — same wedge the sibling labs already own, applied to options
market structure.

---

## Platform Direction &amp; Market Trends

### Industry trends
| Trend | Status | Relevance | Impact on this tool |
|---|---|---|---|
| Dealer-gamma / GEX going mainstream retail (SpotGamma, MenthorQ) | Growing | High | Table-stakes: walls + flip + regime must be first-class |
| 0DTE / short-dated options dominance | Growing | High | Expiry ladder + per-expiry expected move + front-expiry gamma weighting matter more than ever |
| "Positioning &gt; prediction" market-structure framing | Growing | High | Frame everything as *where hedging flows cluster*, not forecasts |
| Vanna/charm &amp; OPEX-cycle effects in commentary | Emerging | Medium | Include 2nd-order greeks + charm-into-expiry read |
| AI natural-language screeners (MenthorQ Quin, UW Mr. Whale) | Emerging | Low (for a single-file tool) | Out of scope now; a future "explain this level" caption is the lightweight analog |
| Free public data getting harder (Yahoo crumb-gating) | Growing | High | Design for graceful degradation + manual chain import |

### Strategic opportunities
| Opportunity | Type | Priority | Rationale |
|---|---|---|---|
| Transparent, toggleable GEX (show the assumption) | Differentiator | High | Competitors hide the sign convention; exposing it is trust + education |
| localStorage positioning history (free day-over-day) | Differentiator | High | Free migration analysis with no history API — unique for a single-file tool |
| Structure Map that fuses **option walls + cash volume profile** | Differentiator | High | Vendors do one or the other; fusing OI-walls with VPVR/POC is a stronger S/R read |
| Squeeze context (SI + skew + GEX + momentum) in one gauge | Differentiator | Medium | Squeeze ingredients are scattered across vendors; one bounded score is handy |
| Manual/paste chain import fallback | Table stakes | Medium | Keeps the tool usable when hosted proxies are blocked |

### Recommendations
1. **Immediate (v1 core):** Structure Map (walls + flip + max-pain + HVL + cones),
   net-GEX chart, OI-by-strike, greeks-by-strike, expected-move cones, IV
   rank/skew, price/volume momentum, editable universe, graceful options-fetch
   degradation.
2. **Near-term (v1.1):** localStorage day-over-day migration, short-interest /
   squeeze panel, volume profile / POC, expiry ladder, Vol/OI unusual highlight.
3. **Strategic (v2):** vanna/charm exposure profiles, dealer hedging-coverage curve,
   manual chain import, per-level plain-language "why this matters" captions.

---

## Improvement Proposals

### IP-001 — Fused Structure Map (option walls + cash volume profile) ⭐ Competitive Edge
- **Impact:** High · **Effort:** M
- **Edge:** No competitor overlays option-OI walls, gamma flip, max pain **and** the
  cash-traded volume-profile POC/value-area on one price axis. Fusing "where options
  are stacked" with "where shares actually traded" is a materially stronger S/R read.
- **Actors:** Level trader, momentum trader · **Scenarios:** BS-001, UC-001, UC-003

### IP-002 — Transparent, toggleable dealer-gamma sign convention ⭐ Competitive Edge
- **Impact:** High · **Effort:** S
- **Edge:** Every GEX vendor bakes in a hidden sign assumption; getting it backwards
  inverts the regime read. Exposing it as a documented toggle is both a trust signal
  and a teaching device — impossible in a closed SaaS. · **Scenarios:** BS-002, BS-005

### IP-003 — Free day-over-day positioning history via localStorage ⭐ Competitive Edge
- **Impact:** High · **Effort:** M
- **Edge:** Snapshot each fetched chain locally → wall migration, OI build/unwind,
  net-GEX drift with **zero** paid history API. Uniquely feasible for an offline
  single-file tool. · **Scenarios:** BS-006, UC-006

### IP-004 — Squeeze gauge (SI × skew × GEX × momentum)
- **Impact:** Medium · **Effort:** M
- **Edge:** Bundles scattered squeeze ingredients into one bounded, explainable
  score that degrades gracefully when SI is missing. · **Scenarios:** BS-009, UC-005

### IP-005 — Expected-move "coverage" cones + dealer hedging-flow curve
- **Impact:** Medium · **Effort:** M
- **Edge:** Two readings of the user's "expected coverage": (a) ±1σ expected-move
  cones per expiry, (b) the shares dealers must trade per 1% move to stay hedged
  (gamma coverage). Together they show *how far* and *how sticky*. · **Scenarios:** UC-004, BS-003

### IP-006 — Graceful options-fetch degradation + manual chain import
- **Impact:** Medium · **Effort:** S
- **Edge:** Hosted Yahoo proxies are unreliable; the tool stays useful (price/volume
  + VPVR) and accepts a pasted/imported chain JSON. · **Scenarios:** BS-007

---

## Data sources &amp; feasibility (the crux)

Reuses the sibling tools' exact data layer + proxy chain — **no new proxy, no new
key required**. The generic `fetchTextViaProxy(target)` helper (direct →
`api.allorigins.win/raw` → `api.codetabs.com/v1/proxy`, 9 s timeout, sequential
fallback) already fetches non-price JSON (Alpha Vantage holdings, US Treasury CSV)
in `etf-momentum-lab.html`, so pointing it at Yahoo's options + quoteSummary
endpoints is a proven extension.

| Datum | Source | Endpoint (via proxy) | Notes |
|---|---|---|---|
| **Option chain** (calls/puts: strike, OI, volume, IV, bid/ask, last, ITM) | Yahoo | `query1.finance.yahoo.com/v7/finance/options/<SYM>` and `…?date=<epoch>` per expiry | Also returns `expirationDates[]`, `strikes[]`, and underlying `quote`. **No key.** Best-effort on hosted origins (proxy-gated). |
| **Underlying OHLCV** (spot, price/volume, VWAP, RSI, MAs, OBV, VPVR) | Twelve Data (keyed) or Yahoo chart | reuse existing `yahooUrls` / Twelve Data path | Reliable keyed source already wired; drives all price/volume analytics. |
| **Greeks** (delta, gamma, vega, theta, vanna, charm) | **computed in-browser** | — | Yahoo does **not** return greeks → solve Black-Scholes-Merton from spot, strike, `T`, IV, rate `r`, dividend `q`. This is a *feature*, not a gap (fits the "computed in-browser" ethos and enables GEX/DEX). |
| **Short interest** (short%float, days-to-cover, SI trend, float, shares out) | Yahoo | `query2.finance.yahoo.com/v10/finance/quoteSummary/<SYM>?modules=defaultKeyStatistics` → `sharesShort`, `shortRatio`, `shortPercentOfFloat`, `sharesShortPriorMonth`, `dateShortInterest`, `floatShares` | **Best-effort:** increasingly crumb/cookie-gated; may fail via proxy → manual-entry fallback field. Bi-monthly FINRA data (~2-wk lag). |
| **Positioning history** (day-over-day) | `localStorage` | — | Each fetch snapshots the chain; diffs give migration/OI-change with no history API. |

**Provider caveat (important, must be surfaced in-tool):** the *options chain is
Yahoo-only* here (Twelve Data has no free options), and hosted-origin proxies are
frequently blocked — so the options panels are explicitly **best-effort**, while the
price/volume/VPVR analytics work reliably from the keyed OHLCV path. See BS-007 /
IP-006 for the degradation contract.

---

## Methodology (the math — all in-browser, unit-testable)

All from the fetched chain + underlying OHLCV. Everything below is a documented,
convention-dependent **estimate**, not a fact.

### Greeks — Black-Scholes-Merton
With spot `S`, strike `K`, time-to-expiry `T` (yrs), rate `r`, dividend yield `q`,
IV `σ`; `d1 = [ln(S/K) + (r − q + σ²/2)T] / (σ√T)`, `d2 = d1 − σ√T`, `N`=normal CDF,
`n`=pdf:
- **Delta** call `e^{−qT}N(d1)`, put `e^{−qT}(N(d1)−1)`.
- **Gamma** `e^{−qT} n(d1) / (S σ √T)` (calls = puts) — drives GEX.
- **Vega** `S e^{−qT} n(d1) √T` (per 1.00 vol; /100 for per-point).
- **Theta** standard BSM closed form (per-day = /365).
- **Vanna** `∂Δ/∂σ` and **Charm** `∂Δ/∂t` — standard closed forms; used for the
  2nd-order exposure profiles and the charm-into-expiry read.
Assumes European, constant `r`/`σ`, flat `q` (editable) — fine for *structure*;
American equity options differ marginally.

### Gamma Exposure (GEX) &amp; gamma flip
Per strike, with a **dealer-positioning sign convention** (default: dealers **long
calls, short puts** → calls add +gamma, puts add −gamma; toggle to the alternative):
`GEX_K = 100 · S² · 0.01 · ( Σ_calls γ·OI − Σ_puts γ·OI )` (≈ $ per 1% move).
- **Net GEX** = `Σ_K GEX_K`. **Gamma-flip / zero-gamma** = the spot level where
  cumulative dealer gamma crosses zero (scan candidate spots, recompute γ at each).
- **Regime:** net GEX &gt; 0 &amp; spot above flip → **long-gamma / pinning** (dealers
  sell rallies, buy dips → vol suppressed); net GEX &lt; 0 → **short-gamma /
  trending** (dealers chase → vol amplified, walls more likely to break).
- **Call Wall** = strike of max positive GEX above spot (resistance);
  **Put Wall** = strike of max |negative| GEX / max put-OI below spot (support).
  (MenthorQ calls these Call Resistance / Put Support; HVL = highest-volume level.)

### DEX (delta exposure)
`Σ Δ·OI·100·S` — net directional positioning skew; sign/tilt over strikes.

### Max pain
For an expiry, over candidate settle prices `P`:
`pain(P) = Σ_calls OI·max(0, P−K)·100 + Σ_puts OI·max(0, K−P)·100`;
**Max Pain** = `argmin_P pain(P)` — the settle where option holders lose most /
writers pay least. A pinning heuristic, **not** a forecast.

### Expected move ("coverage") + dealer hedging curve
- Per expiry: expected move ≈ `0.85·(ATM_call_mid + ATM_put_mid)` (straddle) or
  `S·σ_ATM·√T` → **±1σ cones**. Nearer expiry = narrower cone.
- **Dealer hedging coverage:** shares to re-hedge per 1% move ≈ `GEX_$ / S`; sign
  flips at the gamma flip. Shows *how sticky* levels are (the 2nd reading of
  "expected coverage actions").

### Volume &amp; unusual activity
- **OI by strike** (mirrored calls/puts); **Volume by strike** (today);
  **Vol/OI** per contract (&gt;1–2 = new positioning / unusual);
  **OI change** vs prior snapshot (build vs unwind — localStorage day-over-day).
- **Put/Call ratio** (volume and OI based) as a sentiment gauge.

### IV structure
- **IV Rank** `(σ_now − σ_min,1y)/(σ_max − σ_min)`, **IV Percentile** (% of days
  below now) — needs the localStorage IV history to mature.
- **Vol smile** (IV by strike, per expiry), **term structure** (ATM IV by expiry;
  contango vs backwardation), **skew** (put IV − call IV at ±Xσ/±X%),
  **VRP** = ATM IV − realized vol (e.g. 20-d close-to-close).

### Volume profile (cash S/R)
Histogram of underlying traded volume by price bucket over the window → **POC**
(highest-volume price = magnet S/R) + **value area** (70% of volume). Fused with
option walls on the Structure Map (IP-001).

### Short interest / squeeze
`shortPctFloat`, **days-to-cover** (short ratio), SI trend vs prior month; bounded
**squeeze score** = f(short%float↑, DTC↑, price momentum↑, call-skew build,
negative GEX). Bi-monthly, lagging — surfaced as context, never a trigger.

### Price/volume momentum (underlying)
RSI(14), price vs 20/50/200-DMA, OBV, **anchored VWAP** (from a chosen date / last
OPEX), rel-vol, up/down volume, and **distance-to-wall** in % and ATR units — this
is what ties the options structure back to actual price action and answers "which
way is momentum resolving into the walls."

---

## Input levers

Ticker (+ add-any / universe include) · data source + shared key · expirations to
include (front / next / monthly / all, with a cap) · **dealer-positioning sign
toggle** · rate `r` &amp; dividend `q` (greeks) · liquidity floor (min OI / min vol /
bid&gt;0) · analysis window for price/volume &amp; VPVR (3M…Max) · anchored-VWAP anchor
date · expected-move basis (straddle vs ATM-IV) · squeeze weightings · strike-range
zoom around spot (±N% / ±N strikes).

---

## Charts (hand-drawn canvas, no libraries; synchronous render; aria-labeled)

Every `<canvas>` carries an `aria-label` + fallback text (WebKit-safe) and draws
**synchronously** on every update (no `requestAnimationFrame` wrapper) so it renders
in a background/hidden tab — matching `sector-research-lab.html`.

1. **Structure Map (hero)** — price (line/candles) with horizontal level bands:
   Call Wall, Put Wall, Gamma Flip, Max Pain, HVL / VPVR POC, ±expected-move cones;
   long-gamma / short-gamma zones shaded; nearest-two levels highlighted.
2. **Net GEX by strike** — signed bars (green above flip, red below), flip line + spot.
3. **Cumulative dealer-gamma curve** — GEX vs spot; zero-crossing = flip; slope = pin strength.
4. **Open interest by strike** — mirrored calls/puts around spot; wall highlights.
5. **Volume by strike (today) + Vol/OI heat** — unusual-activity highlight.
6. **OI change (Δ vs prior snapshot)** — build/unwind by strike (localStorage).
7. **Volume profile (VPVR)** — horizontal histogram by price + POC + value area.
8. **Greeks by strike** — delta / gamma / vanna / charm small-multiples.
9. **IV smile + term structure + IV-rank gauge**.
10. **Expected-move cones** across expiries (the "coverage" fan).
11. **Dealer hedging-flow curve** — shares to hedge per 1% move vs spot.
12. **Max-pain curve** — total option $ value vs settle price (min = max pain).
13. **Expiration ladder** — GEX / OI weight stacked by expiration (where's the OPEX weight).
14. **Short-interest / squeeze panel** — short%float, DTC, SI trend bars + squeeze gauge.
15. **Price/volume momentum** — price + MAs + anchored VWAP + OBV + rel-vol + wall distances.
16. **Put/Call &amp; skew history** — as the localStorage snapshot history matures.

---

## UI Scenario Matrix

| Scenario | Actor | Entry point | Steps | Expected outcome | Chart(s) |
|---|---|---|---|---|---|
| Find nearest S/R | Level trader | Ticker box | enter → fetch | Named Call/Put Wall, HVL, Max Pain on price axis | Structure Map, OI-by-strike |
| Read pin-vs-trend regime | Regime trader | after fetch | glance regime badge | "long/short gamma" + flip level | Net GEX, gamma curve |
| Will the wall break? | Momentum trader | after fetch | check OI-change + skew + SI + regime | break-vs-hold lean w/ evidence | OI-change, skew, squeeze, momentum |
| Plan the expiry | OPEX planner | expiry selector | pick expiries | expected-move cones + dominant-gamma expiry | Expected-move cones, expiration ladder |
| Screen a squeeze | Squeeze hunter | after fetch | read gauge | bounded squeeze score + missing pieces | Squeeze panel, IV skew |
| Watch migration | Swing researcher | 2+ days | reopen + fetch | wall/OI drift vs last snapshot | OI-change, Structure Map |
| Learn the concepts | Self-learner | any chart | read caption + footer glossary | plain-language definition per level | all + glossary footer |

---

## Non-Functional Requirements

- **Performance.** One chain fetch per expiry (proxy-throttled like the sibling
  tools); greeks/GEX/max-pain for a full multi-expiry chain compute in-browser in
  well under a second on a laptop; all charts render synchronously.
- **Resilience / degradation.** Options-fetch failure never blanks the page
  (BS-007); SI failure never blocks the squeeze read (BS-009); illiquid data is
  flagged, not faked (BS-004).
- **Accessibility.** Every canvas has `aria-label` + text fallback; color choices
  keep call/put and +/−GEX distinguishable; no color-only encoding of the regime.
- **Transparency / trust.** Every level shows its `source` + assumptions; the sign
  convention, rate, and dividend are visible and toggleable; "educational only"
  disclaimer + a glossary footer.
- **Offline / portability.** Single self-contained HTML, no build, no dependencies,
  runs from `file://`; state + snapshot history + shared API key persist in
  `localStorage` (shared `rlApiKeys` store like the siblings).
- **Privacy.** No analytics/telemetry; only the on-demand public data endpoints.

---

## Universe (editable JSON — `options-structure-universe.json`)

A watchlist of **liquid, optionable** underlyings (index ETFs + high-OI single
names), default-on subset + editable `entries[]`. Only `id` (+ `ticker`, optional
`alt` provider-symbol map, optional `label`) required. Suggested seed:
SPY, QQQ, IWM, DIA (index ETFs); NVDA, TSLA, AAPL, MSFT, AMZN, META, GOOGL, AMD,
MU, AVGO, SMCI, PLTR, COIN, MSTR, NFLX (high-OI single names). Kept small on
purpose — options fetching is per-expiry and proxy-throttled, so a broad basket is
slow; this universe is a curated launchpad, not an all-market screener.

---

## Known limitations (state these honestly, in-tool)

- **Positioning ≠ order flow.** OI + volume + IV structure only; **no** trade-level
  bid/ask side, **no** dark pool, **no** real-time flow (that needs OPRA tick data /
  a paid vendor). "Unusual" here = Vol/OI + OI-change heuristics.
- **GEX sign is a convention, not a fact.** The dealer long-calls/short-puts default
  is a common retail proxy; real dealer inventory is unobservable. The toggle exists
  precisely because getting it wrong inverts the regime.
- **Greeks are BSM estimates** (European, flat `q`, constant `r`/`σ`); American
  early-exercise and vol surface curvature are not modeled.
- **Data is delayed / EOD and best-effort.** Yahoo options via public proxies are
  frequently blocked on hosted origins; IV can be stale for illiquid strikes.
- **Short interest is bi-monthly FINRA data** (~2-week lag) and often crumb-gated.
- **Max pain / walls are magnets, not predictions**; they fail regularly, especially
  in short-gamma regimes and around catalysts (earnings, macro).
- **localStorage history only accrues from when you start using it** — no backfill.

---

## Open questions (for the owner, before/at build)

1. **"Expected coverage actions"** — confirmed interpretation? This spec covers
   **both** (a) expected-move ±1σ cones per expiry and (b) the dealer gamma-hedging
   "coverage" curve. Keep both, or prioritize one?
2. **Short-interest source** — accept Yahoo `defaultKeyStatistics` best-effort +
   manual-entry fallback, or wire an optional keyed provider (e.g. Finnhub, already
   referenced by `ai-capex-strategy-lab.html`) for more reliable SI?
3. **Dealer-gamma default convention** — ship default = "dealers long calls / short
   puts" (calls +γ, puts −γ)? Or the "all-customer-long / dealers-short-both"
   variant as default? (Both available via toggle regardless.)
4. **Scope of v1** — is the "Immediate (v1 core)" list the right MVP cut, deferring
   migration-history + squeeze + VPVR to v1.1?
5. **Index options** — SPX/NDX (cash-settled, European, richer term structure) via a
   provider that exposes them, or stay ETF/single-name (SPY/QQQ) only for v1?
6. **Universe size** — start with the ~20-name seed above, or narrower (indexes +
   Mag-7) to keep proxy-throttled fetches fast?

---

## Build / validate / ship checklist (when promoted to implementation)

- [ ] Create `options-structure-lab.html` (single file) + `options-structure-universe.json`.
- [ ] Reuse the sibling data layer: `fetchTextViaProxy` chain for the Yahoo options
      (`/v7/finance/options`) + short-interest (`/v10/finance/quoteSummary`)
      endpoints; reuse the OHLCV path + shared `rlApiKeys` store.
- [ ] Implement BSM greeks + GEX (with sign toggle) + gamma-flip + max-pain +
      expected-move + VPVR as **unit-testable** pure functions.
- [ ] Snapshot each fetched chain to `localStorage`; diff for OI-change / migration.
- [ ] All 16 charts hand-drawn, **synchronous** (no rAF), each with `aria-label` +
      fallback text.
- [ ] Degradation states: options-fetch fail → price/volume still renders; SI fail →
      squeeze panel degrades; illiquid → low-confidence flags.
- [ ] Footer: notes link → `notes/options-structure-lab.md`, glossary, "educational
      only" disclaimer.
- [ ] Register the tool: add to the `TOOLS` array in `index.html` **and**
      `tools.json` (id `options-structure-lab`, notes path, data path), add a README
      "Live tools" row, and this notes file's Index row in `notes/README.md`.
- [ ] Validate (no CLI):
      `node -e "new Function(require('fs').readFileSync('options-structure-lab.html','utf8').match(/<script>([\s\S]*?)<\/script>/)[1])"`
      and `node -e "JSON.parse(require('fs').readFileSync('options-structure-universe.json'))"`.
- [ ] Open in a browser, paste a key, fetch a liquid ticker (SPY/NVDA), confirm the
      Structure Map + net-GEX + walls + cones populate; commit &amp; push (Pages redeploys).

---

## Version history

- **v1.0 — LIVE (2026-07-02)** — initial build shipped &amp; registered (index.html /
  tools.json / README / notes). Multi-provider underlying-price layer (Yahoo no-key
  + Twelve Data / Alpha Vantage / Finnhub keys, shared via the cross-tool
  `rlApiKeys` store); Yahoo option-chain fetch (front + N nearest expiries through
  the shared allorigins/codetabs proxy chain) + Yahoo short interest
  (`defaultKeyStatistics`, best-effort) with a manual %-float fallback; in-browser
  Black-Scholes greeks (Δ Γ ν Θ + vanna/charm); net-GEX with a documented
  dealer-sign toggle + a gamma-flip scan; call/put walls, max-pain curve,
  expected-move cones + a dealer-hedging/gamma curve, cash volume profile / POC, IV
  smile + term structure + VRP, put/call + skew, a bounded short-interest squeeze
  score, and price/volume momentum (RSI, 20/50/200-DMA, anchored VWAP, OBV, ATR);
  16 hand-drawn **synchronous** canvases (aria-labelled); day-over-day OI/wall
  migration + P/C &amp; skew history from `localStorage`; every ticker a Yahoo link
  with a rich tooltip; editable external universe; CSV export. **Validated in Node**
  (research-lab has no browser CI): JS syntax, universe JSON, greeks checked
  numerically against known Black-Scholes values (ATM Δ 0.56 / −0.44, Γ call=put &gt;0,
  deep-ITM Δ→1, OTM Δ→0, θ&lt;0), and DOM id wiring (all `el()` refs resolve). The
  live in-browser canvas render + live Yahoo fetch still want a one-time visual
  smoke test (the Playwright browser tool was unavailable at build time).
- **v0 — PROPOSED (2026-07-02)** — analyst discovery + design brief. Actors, use
  cases, business scenarios, competitive analysis (SpotGamma / MenthorQ / Unusual
  Whales / Barchart / OptionStrat / Market Chameleon), platform direction, 6
  improvement proposals, full methodology (BSM greeks, GEX + gamma flip, max pain,
  expected-move + dealer-coverage, VPVR, IV rank/skew/term/VRP, short-interest /
  squeeze, price/volume momentum), 16-chart suite, data-feasibility assessment
  (Yahoo options + quoteSummary via existing proxy chain; greeks computed
  in-browser; short interest best-effort), NFRs, known limitations, and open
  questions. **Not yet built** — no HTML, not registered in `index.html` /
  `tools.json`.
