# Intraday Tape & Volume-Profile Lab — notes

> **Status: LIVE — shipped and registered in `index.html` / `tools.json`.
> Analyst brief updated 2026-07-05 to add the Volume-Profile *playbook* layer:
> Market-Profile shape classification (D / P / B / thin), the first-test
> POC-pullback / value-area-edge entry (stop beyond the low-volume area, target
> the next shelf, reversal on a clean failure), and the trend-vs-rotation gate
> (in rotation the POC is a magnet, not a turning point).** **Educational only —
> not investment advice.** Everything here is a hypothetical, delayed /
> best-effort, positioning-derived read from public data you fetch yourself. It
> never claims access to real-time Level-2, dark-pool, or trade-level bid/ask
> flow.
>
> Sibling of the swing tool ([`swing-structure-lab.md`](swing-structure-lab.md));
> both consume the shared data layer ([`shared-data-layer.md`](shared-data-layer.md))
> and reuse the options tool's walls/GEX so nothing is re-fetched.

Proposed single-file tool: `../intraday-tape-lab.html` (not yet created)
Proposed editable watchlist: `../intraday-tape-universe.json` (not yet created)

---

## Purpose

Answer one question well, for **today's session**: **who is in control of the
tape right now — trend-following algos pinned to VWAP, or emotional retail flow —
and where are the intraday levels price will pin at, reject, or break through?**

Where the [Options Structure Lab](options-structure-lab.md) reads the multi-day
*positioning* map, this tool reads the *live session*: the session **volume
profile** (with a buy/sell delta), **VWAP and its σ-bands** (the institutional
execution anchor), the **opening range**, the **overnight gap vs the prior day's
value area**, and the **0DTE / same-day gamma** magnets pulled from the shared
options snapshot. It classifies the session into a regime (trend day / range day
/ reversal risk) and distills everything to **one tactical bias with a confidence
score** — the "simple" view — while keeping every signal inspectable in a "power"
view, exactly like the AI Capex Lab's Simple / Power mode toggle.

---

## Outcome Contract

- **Intent.** Give an intraday trader a fast, honest read of **who is driving
  the current session and where the session's support/resistance is**, so they
  can name the nearest intraday level, say whether the tape is algo-orderly or
  retail-emotional, and state a single tactical bias — without leaving the page.
- **Success signal.** For a liquid name (SPY, QQQ, NVDA, TSLA), after one fetch
  the tool renders: a session **VWAP + ±1/2σ bands**, a **session volume profile**
  with **POC / VAH / VAL** and a **buy/sell delta**, the **opening range**, the
  **prior-day POC/VAH/VAL/close + overnight-gap** overlay, the nearest **0DTE
  gamma wall** (from the shared options layer), and **one Simple verdict card**:
  *"Trend day up · ride VWAP dips · nearest resistance ⟨X⟩, support ⟨Y⟩ · confidence
  62%"* — plus a session event/OPEX warning.
- **Hard constraints.** (1) The buy/sell "delta" is an **up/down-volume
  approximation** (bar closes ≥ open → up-volume), the same proxy TradingView
  uses — it is NEVER labeled as true bid/ask-sided order flow. (2) All math is
  recomputed in-browser from the fetched intraday bars; no stored/blackbox
  numbers. (3) Intraday data is delayed/best-effort and proxy-gated — the tool
  degrades to the last cached session rather than faking live prices. (4) No new
  network endpoints or proxies beyond the shared stack.
- **Failure condition.** The tool is a failure if it implies it sees real order
  flow it does not have, presents the up/down-volume delta as literal buyer/seller
  aggression, or gives a confident "trend day" call on a range day because it
  ignored VWAP whipsaw and the volatility regime. Modest and correct beats pretty
  and misleading.

---

## Actors & Personas

| Actor | Description | Key goal | Reads first |
|---|---|---|---|
| **VWAP / mean-reversion trader** | Fades extension from VWAP | "Is price stretched from VWAP, and is this a reverting (range) or trending session?" | VWAP + σ-bands + session-type badge |
| **Opening-range trader** | Trades the first 15–60 min break | "Did the opening range break and hold, or fail back inside?" | Opening-range box + prior-day VA overlay |
| **Volume-profile / auction trader** | Trades acceptance/rejection at levels | "Where is today's POC, and is price accepting or rejecting the value area?" | Session profile POC/VAH/VAL + delta |
| **0DTE / gamma-pin trader** | Trades same-day option pins | "Which strike is the session magnet? Are we pinned or free to trend?" | 0DTE walls + gamma-flip (shared) |
| **"Who's driving?" tape reader** | Wants algo-vs-retail read | "Is this orderly algo control or an emotional retail tape?" | Algo/retail control meter |
| **Event-aware day trader** | Avoids scheduled landmines | "Is there a print, OPEX, or the lunch lull that changes behavior right now?" | Session event ribbon |

Non-actors (out of scope): a real-time Level-2/DOM tape reader, an order router,
a sub-second scalping engine, anyone needing true tick/bid-ask data.

---

## Domain Capability Model (AN5 — capability-first)

New capability that references provider/variant patterns (multiple bar intervals,
multiple level types, shared options provider), so the model is defined before
any chart.

**Primitives**

- **Session** — one trading day: `{open, high, low, last, bars[], vwap series,
  openingRange, priorDay}`; the unit everything is scoped to.
- **Bar** — one intraday candle `{t,o,h,l,c,v}` at an interval ∈ {1m, 5m, 15m};
  carries a derived `updown ∈ {+1,−1}` (close ≥ open) → the delta proxy.
- **Level** — a horizontal price with a `type` and `source`: `type ∈ {vwap,
  vwap±1σ, vwap±2σ, sessionPOC, VAH, VAL, priorPOC, priorVAH, priorVAL,
  priorClose, openingRangeHi, openingRangeLo, gammaWall0DTE, roundNumber}`. Levels
  are the shared surface the chart and the verdict card consume.
- **Delta** — cumulative up-volume − down-volume for the session and per price
  bucket (the "open buy/sell positions by price/volume" approximation).
- **ControlRead** — classification `{algo-controlled, retail-driven, mixed}` with
  an evidence vector (VWAP adherence, delta smoothness, round-number spikes, gap
  character, time-of-day).
- **SessionType** — `{trend-up, trend-down, range, reversal-risk}` with a
  confidence.
- **Signal** — a named intraday pattern `{name, direction, probability, evidence}`
  where probability is derived from recent-session analogs + documented base rate.

**Lifecycle:** `Session → fetch intraday bars → compute VWAP/profile/delta →
overlay prior-day + 0DTE levels → ControlRead + SessionType → Signals → Verdict`.

**Provider-neutral behavior:** given a symbol, a provider yields intraday bars at
one of the supported intervals; profile/VWAP/delta math is provider-agnostic.
Options magnets come from the shared layer (`RLDATA.options`), never re-fetched.

**Business policies (invariant):**

1. A Level always carries its `source` + assumption set (so a chart can explain
   itself).
2. The buy/sell delta is always labeled an up/down-volume proxy, never "aggressor
   flow".
3. The session-type and control reads use the same VWAP/profile inputs and can
   never contradict each other.
4. When intraday data is stale/blocked, the tool shows the last cached session
   with an explicit age badge — it never fabricates a live tape.

---

## Use Cases

### UC-001 — Read who controls the tape (algo vs retail)

- **Actor:** "Who's driving?" tape reader
- **Main flow:** 1) Fetch session bars. 2) Compute VWAP adherence (share of bars
  within ±1σ, mean absolute VWAP deviation), delta smoothness (variance of
  per-bar delta), round-number volume clustering, gap character, time-of-day
  bucket. 3) Classify **algo-controlled** (tight VWAP adherence, orderly
  stair-step delta, low variance) vs **retail-driven** (wide range, gap-and-go,
  volume spikes at round numbers, choppy delta). 4) Emit an anticipation: algo →
  fade extensions toward VWAP; retail → expect flush/chase and exhaustion at
  shelves.
- **Postcondition:** A control meter + a one-line "what this regime typically
  does next" with a recent-session hit rate.

### UC-002 — Map the session's support/resistance (profile + VWAP + prior day)

- **Actor:** Volume-profile / VWAP trader
- **Main flow:** 1) Build the **session volume profile** (bucket volume by price,
  split up/down) → POC, VAH, VAL, HVN/LVN. 2) Overlay **VWAP ± σ bands**. 3)
  Overlay **prior-day POC/VAH/VAL/close** and the **overnight gap**. 4) Name the
  two nearest levels to price.
- **Postcondition:** A labeled intraday S/R map with numeric levels + confidence.

### UC-003 — Trade the open (opening range + gap vs prior value area)

- **Actor:** Opening-range trader
- **Main flow:** 1) Mark the opening-range hi/lo (first 15/30/60 min, selectable).
  2) Classify the open vs the prior day's value area: **above / below / inside**
  (the auction-market open-drive playbook — open outside prior VA → runner in the
  open's direction; open inside → rotation toward prior POC). 3) Signal
  break-and-hold vs failed-break with a probability from recent analogs.
- **Postcondition:** An opening bias with the level that invalidates it.

### UC-004 — Find the 0DTE / same-day gamma magnet

- **Actor:** 0DTE / gamma-pin trader
- **Main flow:** 1) Pull the nearest-expiry option snapshot from the shared layer
  (`RLDATA.options`) — call/put walls, gamma-flip, max-pain, expected-move. 2)
  Overlay the 0DTE walls on the session chart. 3) Read pin (spot in long-gamma
  zone between walls) vs breakout (spot through a wall / below the flip). 4) Draw
  the session expected-move cone.
- **Alt flow:** No option snapshot cached → panel shows "run the Options
  Structure Lab first, or fetch here" and the session profile S/R still renders.
- **Postcondition:** Session magnet + expected-move band with no extra fetch.

### UC-005 — Get the one-line tactical bias (Simple view)

- **Actor:** any intraday trader
- **Main flow:** 1) The signal engine weights the sub-reads (session type, control,
  VWAP position, profile acceptance, 0DTE pin, event risk). 2) Emit ONE verdict:
  bias (long/short/neutral-fade), the two levels that matter, a confidence %, and
  the single dominant driver. 3) "Why?" expands to the full evidence (Power view).
- **Postcondition:** A single decision-ready card; details on demand.

### UC-006 — Be warned about session landmines

- **Actor:** Event-aware day trader
- **Main flow:** 1) From the shared events cache: today's earnings (this name),
  scheduled macro prints (CPI/FOMC/NFP), monthly/0DTE OPEX, and the lunch-lull
  window. 2) Ribbon warns "FOMC 14:00 — expect VWAP whipsaw & wider σ; reduce
  size" with *why*. 3) Signals de-rate confidence around a scheduled print.
- **Postcondition:** A session event ribbon that adjusts the verdict's confidence.

---

## Business Scenarios

### BS-001 — Session map after one fetch

Given a liquid ticker and a completed intraday fetch
When the session chart renders
Then VWAP, ±1/2σ bands, session POC/VAH/VAL, opening range, and prior-day
POC/VAH/VAL/close are drawn with numeric labels and the two nearest levels to
price are highlighted.

### BS-002 — Delta is honestly an approximation

Given the session volume profile with a buy/sell delta
When the delta renders
Then it is labeled "up/down-volume proxy (close ≥ open), not bid/ask flow" and the
methodology footnote repeats it — never "buyers vs sellers" as literal fact.

### BS-003 — Session type and control agree

Given the same VWAP/profile inputs
When the session-type badge (trend/range/reversal) and the algo/retail control
meter both render
Then they are derived from one shared computation and never contradict (a "tight
algo trend day" cannot also read "range/reversal").

### BS-004 — Open-vs-value-area playbook

Given today's open relative to the prior day's value area
When the opening panel renders
Then open-above-VA / open-below-VA / open-inside-VA is stated with the matching
auction bias (runner vs rotation to POC) and the invalidation level.

### BS-005 — 0DTE magnet is shared, not re-fetched

Given the Options Structure Lab has cached a snapshot today
When the 0DTE panel renders
Then the call/put walls + gamma-flip appear from `RLDATA.options` with NO new
option fetch, and the "data age" badge shows the snapshot's timestamp.

### BS-006 — Graceful intraday degradation

Given the intraday endpoint/proxies are blocked (common on hosted origins)
When the fetch fails
Then the last cached session renders with an explicit age badge and a "re-fetch /
add a key" state — never a blank chart or a faked live price.

### BS-007 — Event ribbon de-rates confidence

Given a scheduled macro print in the session
When the verdict card renders
Then the event ribbon warns with the expected effect, and the verdict's confidence
is visibly reduced around the print window.

### BS-008 — Regime-aware behavior

Given the shared market-gauge (VIX / Fear & Greed) reads high-fear / high-VIX
When the session engine runs
Then it widens expected σ, favors "range/whipsaw" priors, and de-rates trend-
continuation signals — and does the opposite in low-VIX / greed.

### BS-009 — Accessibility & background-tab rendering

Given any chart canvas
When the page renders (including in a hidden/background tab)
Then charts draw synchronously (no requestAnimationFrame-gated first paint) and
every canvas has an aria-label + text fallback.

---

## Signal engine (calculated TA → one simple summary)

Every signal is computed but the trader sees a **summary**, not a wall of
indicators. Each signal carries a **probability** blended from (a) a recent-
session **analog hit rate** (how the same setup resolved over the last *N*
sessions, user-set), (b) a documented base rate, and (c) a confluence count.

| Signal group | Inputs | Anticipation it produces |
|---|---|---|
| **Session type** | VWAP slope, range/ATR, profile shape (P/b/D), delta trend | trend-up/down · range · reversal-risk |
| **Control read** | VWAP adherence, delta smoothness, round-# spikes, gap type, time-of-day | algo-orderly (fade extremes) vs retail-emotional (flush/chase) |
| **VWAP location** | distance from VWAP in σ | mean-revert vs ride |
| **Profile acceptance** | time/volume accepted inside vs rejected at VAH/VAL, naked POC | breakout vs rotation to POC |
| **Opening structure** | opening range, open vs prior VA, first-hour volume | open-drive vs failed-break |
| **0DTE gamma** | walls, gamma-flip, expected move (shared) | pin vs break |
| **Micro candle patterns** | opening drive, VWAP reclaim/loss, POC rejection, exhaustion wick, failed breakout | each with a recent-analog probability |
| **Event/regime** | session calendar, VIX/F&G gauge | confidence de-rate / prior shift |

MA context: 20/50/200-period MAs on the intraday timeframe (and the daily 20/50/200
from the shared cache) are drawn as slow S/R confluence — where an intraday level
stacks on a daily MA is flagged high-conviction, per the user's "20/50/200 MA is
often the best S/R" thesis.

---

## Data sources & feasibility (reuses the shared stack — no new endpoints)

| Need | Source | Notes / honesty |
|---|---|---|
| Intraday bars | Yahoo `chart?interval=5m&range=1mo` / `interval=1m&range=7d`; Twelve Data `interval=5min` | 1m ≈ 7d history cap; proxy-gated on Pages → best-effort, degrade to cache |
| Session VWAP / profile / delta | computed in-browser from those bars | delta is up/down-volume proxy (TradingView convention) — NOT bid/ask |
| Prior-day POC/VAH/VAL | computed from yesterday's intraday bars (or a daily-bar fallback) | value-area = 70% around POC (standard) |
| 0DTE walls / gamma | **shared** `RLDATA.options` (options tool's `optSnaps`) | never re-fetched |
| VIX / Fear & Greed regime | **shared** `RLDATA.macro` | in-browser F&G proxy; CNN feed optional |
| Session events / OPEX | **shared** `RLDATA.events` (Finnhub calendar, best-effort) | degrade to editable built-in date list |

True bid/ask-sided volume, dark-pool prints, and the DOM are **not available**
from free browser-reachable APIs; the tool is explicit that its delta is an
approximation and its "control read" is inference, not a printout of real flow.

---

## Input levers

Provider + key · symbol · interval (1m/5m/15m) · session vs 5-day view · opening-
range length (15/30/60 min) · value-area % (default 70) · VWAP band σ set ·
analog lookback *N* sessions · dealer-gamma sign (inherited from options snapshot)
· regime override (auto / bull / base / bear, like the AI page) · Simple ⇄ Power.

---

## Competitive analysis

| Capability | This tool | TradingView (paid VP/anchored VWAP) | Bookmap / order-flow suites | Broker DOM |
|---|---|---|---|---|
| Session volume profile + POC/VAH/VAL | ✅ in-browser, free | ✅ (paid tiers) | ✅ | partial |
| VWAP ± σ bands | ✅ | ✅ | ✅ | some |
| Buy/sell delta | ✅ up/down proxy (honest) | ✅ (paid) | ✅ real flow | ✅ real flow |
| Algo-vs-retail control read | ✅ **differentiator** | ✕ | partial (visual) | ✕ |
| 0DTE gamma magnet shared w/ options tool | ✅ **differentiator** | ✕ | ✕ | ✕ |
| Regime-aware priors (VIX/F&G) | ✅ **differentiator** | ✕ | ✕ | ✕ |
| One-line tactical verdict | ✅ | ✕ | ✕ | ✕ |
| No account / no install / offline-capable | ✅ | ✕ | ✕ | ✕ |
| Real Level-2 / true aggressor flow | ✕ (honest limit) | ✕ | ✅ | ✅ |

**Edge:** the free, in-browser, honest combination of *session structure +
algo/retail control read + shared 0DTE gamma + regime-aware one-line verdict* is
not something the mainstream free tools assemble in one place.

---

## Improvement proposals (ranked)

- **IP-001 ⭐ Algo-vs-retail control meter.** The headline differentiator; nothing
  free reads "who's driving" from VWAP adherence + delta smoothness + round-number
  clustering. High impact / M effort.
- **IP-002 ⭐ Shared 0DTE gamma overlay.** Reuse `optSnaps` for same-day pin/break
  levels with zero refetch — directly satisfies the cross-tool data-sharing goal.
  High / S.
- **IP-003 Recent-session analog probabilities.** For each signal, "this setup
  resolved up X% over the last N sessions" turns indicators into odds. High / M.
- **IP-004 Regime-aware priors.** VIX/F&G gauge reshapes σ and trend/range priors
  (bull/base/bear toggle from the AI page). Medium / S.
- **IP-005 Simple verdict card.** One bias + two levels + confidence, "why"
  expandable — the "simple + power" UX the user asked for. High / S.

---

## UI scenario matrix

| Scenario | Actor | Entry point | Steps | Expected outcome | Screen |
|---|---|---|---|---|---|
| First read | day trader | ticker box | type → fetch | verdict card + session chart | Simple |
| Control check | tape reader | control meter | glance | algo/retail badge + next-behavior | Simple |
| Level plan | VP trader | session profile | hover levels | labeled POC/VAH/VAL/VWAP | Power |
| Open plan | ORB trader | opening panel | read open-vs-VA | bias + invalidation | Power |
| Gamma pin | 0DTE trader | 0DTE panel | read walls | pin/break + EM cone | Power |
| Landmine | event trader | event ribbon | glance | warning + confidence de-rate | Simple |

---

## Non-functional requirements

- **Performance:** full session recompute < 150 ms for a 1m/390-bar session; no
  network on cache hit.
- **Accessibility:** synchronous canvas draw (no rAF-gated first paint — see the
  research-lab canvas gotcha), aria-labels + text fallback on every chart, WCAG-AA
  contrast in the dark theme.
- **Resilience:** every fetch best-effort with cache fallback + age badge; offline
  (`file://`) renders from cache and an inline fallback watchlist.
- **Honesty:** every approximation (delta, control read, F&G proxy) is labeled
  inline and in the footer glossary.

---

## Known limitations & honest-edge caveats (quant reality)

What a working quant would flag before trusting any of this — all must be visible
in-tool, not buried:

- **This is not order flow.** The buy/sell delta is an up/down-volume proxy
  (close ≥ open), not aggressor-sided flow. There is NO Level-2, DOM, dark-pool,
  or tick bid/ask from free delayed feeds. The only *real* resting-order data
  shown is **option OI walls** (the options market) — not equity limit orders.
- **0DTE gamma is stale-by-hours.** Exchange OI updates once daily after
  settlement, so intraday "gamma pin" levels use **prior-session OI**. Treat them
  as slow-moving context, not live dealer hedging.
- **Analog probabilities are thin and in-sample.** A handful of recent sessions
  is a small sample; selecting the best-matching setup from many candidates is
  data-snooping. Mitigations (mandatory): gate any probability to a minimum
  sample (`n ≥ N_min`, else show "insufficient history"), show the sample size
  and outcome dispersion, prefer coarse buckets (**lean / mixed / strong**) over
  false-precise percentages, and only use bars up to the signal time (no
  look-ahead).
- **Confidence % is a heuristic, not a calibrated probability.** It is a weighted
  confluence score; it is labeled as such and never implies a true win-rate.
- **Delayed / proxy data is not for execution.** On hosted origins the proxies
  are frequently blocked; the tool degrades to cache and is a *read of structure*,
  not an execution-timing signal.
- **No costs, no tradability claim.** Slippage, fees, borrow, and spread are
  unmodeled. The verdict describes structure; it is not a trade recommendation.

## Build checklist (when this is built)

1. Implement / paste the shared `RLDATA` module (see
   [`shared-data-layer.md`](shared-data-layer.md)); go shared-first before any fetch.
2. Intraday fetch (Yahoo 5m/1m + Twelve Data fallback) → `RLDATA.putBars`.
3. Session VWAP + σ bands; session volume profile (POC/VAH/VAL/HVN/LVN) + delta.
4. Prior-day VA overlay + overnight-gap classifier; opening-range box.
5. 0DTE overlay from `RLDATA.options`; expected-move cone.
6. Control read + session-type classifier; signal engine + recent-session analogs.
7. Simple verdict card + Power evidence view (mode toggle like the AI page).
8. Event ribbon from `RLDATA.events`; regime priors from `RLDATA.macro`.
9. `.rlnav` header, footer notes link, disclaimer; add `intraday-tape-universe.json`.
10. Validate offline + on Pages; confirm canvases draw in a background tab; run the
    `new Function(...script...)` + `JSON.parse(universe)` no-CLI checks.
11. **Only then** register in `index.html` `TOOLS`, `tools.json`, README, and add
    the cross-links in every tool's `.rlnav`.

---

## Version history

- **v0 (2026-07-03)** — Proposed. Intraday sibling to the swing tool; session
  profile + delta, VWAP σ-bands, opening-range/gap playbook, algo-vs-retail
  control read, shared 0DTE gamma, regime-aware one-line verdict. Depends on the
  shared data layer.
