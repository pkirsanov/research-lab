# Swing Structure & Market-Regime Lab — notes

> **Status: LIVE — shipped and registered in `index.html` / `tools.json`.
> Analyst brief updated 2026-07-05 to add the Volume-Profile *playbook* layer:
> Market-Profile shape classification (D / P / B / thin) and the naked-POC /
> HVN-shelf pullback entry with 20/50/200-day MA confluence (stop beyond the
> low-volume gap, target the next shelf).** **Educational only — not investment
> advice.** Everything here is a hypothetical, delayed / EOD, structure-derived
> read from public data you fetch yourself.
>
> Sibling of the intraday tool ([`intraday-tape-lab.md`](intraday-tape-lab.md));
> both consume the shared data layer ([`shared-data-layer.md`](shared-data-layer.md))
> and reuse the options tool's walls/GEX so nothing is re-fetched.

Proposed single-file tool: `../swing-structure-lab.html` (not yet created)
Proposed editable watchlist: `../swing-structure-universe.json` (not yet created)

---

## Purpose

Answer one question well, over a **days-to-weeks** horizon: **what is the market
structure and the market regime, and — given both — where is durable support and
resistance, which formed/forming pattern is in play, and is smart money
accumulating or distributing into retail?**

Where the intraday tool reads the live session, this tool reads the **swing
structure**: the **composite volume profile** over the swing window (durable HVN
shelves, LVN air-pockets, naked POCs), the **20/50/200-day moving-average stack**
(the user's stated best S/R), **market structure** (higher-highs/lows vs lower-
highs/lows and the classic chart patterns with probabilities and measured-move
targets), an **accumulation/distribution** read (Wyckoff-lite: effort vs result,
OBV, up/down volume), and a **regime engine** (Fear & Greed's seven components +
VIX level & term structure + breadth + margin/short context). It distills all of
it to **one positioning verdict with a confidence score** — the "simple" view —
while keeping every signal inspectable in a "power" view, like the AI Capex Lab's
Simple / Power toggle.

---

## Outcome Contract

- **Intent.** Give a swing researcher a fast, honest read of **the trend regime,
  the durable support/resistance shelves, and whether the structure is being
  accumulated or distributed**, so they can name the levels that matter, state
  the regime, and get one positioning bias — without leaving the page.
- **Success signal.** For a liquid name or index ETF, after one fetch the tool
  renders: the **20/50/200-day MA stack** with alignment/cross state, a
  **composite volume profile** with POC + HVN/LVN shelves, the current **market
  structure** (trend direction + the active chart pattern with a probability and
  a measured-move target), an **accumulation/distribution** meter, a **regime
  badge** (risk-on trend / distribution-topping / risk-off-fear / accumulation-
  basing) from the shared gauge, the **swing options magnets** (monthly-OPEX walls
  - short-interest/squeeze, shared), and **one Simple verdict**: *"Uptrend —
  buy dips to ⟨MA/shelf⟩ · resistance ⟨X⟩ · regime: greed/late · confidence 58%"*.
- **Hard constraints.** (1) All structure math is recomputed in-browser from the
  fetched daily bars; no stored/blackbox numbers. (2) Pattern probabilities are
  labeled **historical/analog base rates, not predictions**, and each shows its
  sample size. (3) Options magnets and the market gauge come from the shared layer
  — never re-fetched. (4) Margin-debt/retail-crowding context is annotated
  monthly data, never presented as live. (5) No new endpoints beyond the shared
  stack.
- **Failure condition.** The tool is a failure if it presents a pattern
  probability as a forecast, calls "uptrend, buy dips" while the regime is a
  high-Fear distribution top (ignoring the regime layer), or blends adjusted and
  raw closes silently. Modest and correct beats pretty and misleading.

---

## Actors & Personas

| Actor | Description | Key goal | Reads first |
|---|---|---|---|
| **Trend / MA trader** | Trades with the 20/50/200 stack | "Is the trend aligned, and where's the MA support to buy?" | MA stack + alignment/cross badge |
| **Volume-profile / level trader** | Trades durable shelves | "Where are the HVN shelves and naked POCs that will hold or reject?" | Composite profile POC/HVN/LVN |
| **Pattern trader** | Trades formed/forming patterns | "What pattern is in play, what's the probability, and the target?" | Market-structure + pattern panel |
| **Regime allocator** | Sizes to the macro regime | "Risk-on or risk-off? Early or late in the cycle of emotions?" | Regime badge (F&G + VIX + breadth) |
| **Accumulation/distribution reader** | Wants smart-money footprint | "Is this being accumulated or distributed into retail?" | A/D meter + effort-vs-result |
| **Squeeze / positioning researcher** | Multi-day options + shorts | "Are monthly walls migrating? Is short interest fuel present?" | Swing options magnets + SI (shared) |
| **Event-aware swing trader** | Plans around catalysts | "Earnings, CPI/FOMC, monthly OPEX — what's coming and its effect?" | Event radar |

Non-actors (out of scope): an intraday tape reader (→ the intraday sibling), a
fundamentals/DCF model, an order router, a portfolio optimizer (→ AI Capex Lab).

---

## Domain Capability Model (AN5 — capability-first)

New capability referencing provider/variant patterns (multiple level types,
multiple pattern types, shared options + macro providers), so the model precedes
any chart.

**Primitives**

- **SwingWindow** — a daily-bar range (e.g. 3–6 months) with `{bars[], MAs,
  profile, structure, regime}`.
- **Bar** — a daily candle `{t,o,h,l,c,v}` with derived `updown` and range/ATR.
- **MAStack** — `{ma20, ma50, ma200, alignment ∈ {bull-stacked, bear-stacked,
  tangled}, crosses}`; MAs double as dynamic S/R.
- **Level** — a horizontal price with `type ∈ {compositePOC, HVN, LVN, nakedPOC,
  swingHigh, swingLow, ma20, ma50, ma200, callWall, putWall, maxPain,
  measuredMoveTarget}` + `source`.
- **Structure** — swing pivots → `{trend ∈ {up (HH/HL), down (LH/LL), range},
  activePattern}` where a pattern ∈ {double-top/bottom, head-&-shoulders, flag,
  pennant, triangle, wedge, cup-&-handle, range} carries `{stage: forming|
  confirmed, probability, sampleSize, target, invalidation}`.
- **ADRead** — accumulation/distribution `{score, evidence: OBV slope, up/down
  volume, effort-vs-result, churn-at-highs, gap character}`.
- **Regime** — `{band: risk-on-trend | distribution-topping | risk-off-fear |
  accumulation-basing, fearGreed, vixLevel, vixTerm, breadth}`.
- **Signal** — `{name, direction, probability, evidence}` with probability blended
  from recent-analog hit rate + documented base rate + confluence.

**Lifecycle:** `SwingWindow → fetch daily bars → MAs + composite profile → swing
pivots + pattern detect → A/D read → regime (shared gauge) → options magnets
(shared) → Signals → Verdict`.

**Provider-neutral behavior:** given a symbol a provider yields daily bars
(shared cache first); profile/MA/structure math is provider-agnostic; options and
macro come from the shared layer. Short interest is a separate capability that may
be absent → the squeeze read degrades, it never blocks the structure read.

**Business policies (invariant):**

1. Every Level and every pattern probability carries its `source` + sample size.
2. The regime layer can **override** a naive price read (an "uptrend" in a
   high-Fear distribution regime is flagged, not blindly bought).
3. Adjusted and raw closes are never blended (provider `src` is respected).
4. Pattern probabilities are labeled historical base rates, never forecasts.

---

## Use Cases

### UC-001 — Read the trend regime (MA stack + structure)

- **Actor:** Trend / MA trader
- **Main flow:** 1) Fetch daily bars (shared cache). 2) Compute 20/50/200-day MAs,
  alignment (bull-stacked / bear-stacked / tangled), and recent golden/death
  crosses. 3) Derive swing pivots → HH/HL vs LH/LL. 4) Name the nearest MA support
  and the structural resistance.
- **Postcondition:** A trend badge + the MA/structure levels that define it.

### UC-002 — Map durable support/resistance (composite volume profile)

- **Actor:** Volume-profile / level trader
- **Main flow:** 1) Build a composite/visible-range profile over the window →
  POC, HVN shelves (consolidation → price slows/holds), LVN air-pockets (fast
  moves → reject or slice), naked POCs (unfilled magnets). 2) Flag where an HVN
  shelf **stacks on a 20/50/200 MA** (high-conviction confluence). 3) Name the two
  nearest durable levels.
- **Postcondition:** A labeled swing S/R map with confluence scoring.

### UC-003 — Identify the pattern and its odds

- **Actor:** Pattern trader
- **Main flow:** 1) From swing pivots, detect the active formed/forming pattern
  (double top/bottom, H&S, flag, triangle, wedge, cup-&-handle, range). 2) Assign
  a **probability** from recent analogs + a documented base rate, with the sample
  size. 3) Compute the measured-move target and the invalidation level. 4) Require
  **volume confirmation** for a breakout (expansion) vs flag a suspect low-volume
  break.
- **Postcondition:** A pattern call with odds, target, invalidation, and a
  confirmation flag.

### UC-004 — Read accumulation vs distribution (who's absorbing)

- **Actor:** Accumulation/distribution reader
- **Main flow:** 1) Compute OBV slope, up/down volume balance, effort-vs-result
  (big volume / small progress = absorption), churn at highs, and gap character
  (breakaway vs exhaustion). 2) Classify accumulation vs distribution and pair it
  with the regime + short-interest/margin context. 3) Anticipate: distribution at
  a high-Fear top → reduce; accumulation at a basing low → watch the trigger.
- **Postcondition:** An A/D meter + a "who's likely winning" read with evidence.

### UC-005 — Classify the market regime (cycle of emotions)

- **Actor:** Regime allocator
- **Main flow:** 1) Pull the shared gauge (`RLDATA.macro`): the in-browser Fear &
  Greed proxy (seven components), VIX level + term structure (contango vs
  backwardation), breadth, put/call. 2) Map to a regime band: **risk-on trend /
  distribution-topping / risk-off-fear / accumulation-basing** (the market cycle of
  emotions — optimism → euphoria → complacency → anxiety → panic → despair →
  hope). 3) The regime reshapes which signals to trust (see the signal engine).
- **Postcondition:** A regime badge that conditions the whole verdict.

### UC-006 — Read swing options positioning (magnets + squeeze)

- **Actor:** Squeeze / positioning researcher
- **Main flow:** 1) Pull the shared option snapshot (`RLDATA.options`): monthly-
  OPEX call/put walls, max-pain, gamma-flip, plus short interest / days-to-cover.
  2) Overlay the walls as multi-day magnets; combine SI + rising calls + negative
  GEX + up structure into a bounded squeeze read. 3) Flag day-over-day wall
  migration (ceiling rising / floor eroding) from the options tool's history.
- **Alt flow:** No snapshot cached → "run the Options Structure Lab first"; the
  price/profile/MA structure still renders.
- **Postcondition:** Swing magnets + a squeeze read with no extra fetch.

### UC-007 — Learn from recent analogs

- **Actor:** any swing trader
- **Main flow:** 1) Characterize the current setup (pattern × regime × A/D ×
  MA-alignment). 2) Scan the last *N* months (user-set) for similar setups in the
  same regime. 3) Show empirically how they resolved (forward return distribution,
  hit rate, time-to-target) — the user's "use recent X periods to see how similar
  patterns worked out."
- **Postcondition:** An analog table that turns each pattern into odds with a
  visible sample size.

### UC-008 — Get the one-line positioning verdict + event radar

- **Actor:** Event-aware swing trader
- **Main flow:** 1) The signal engine weights the sub-reads (trend, profile,
  pattern, A/D, regime, options, analogs). 2) Emit ONE verdict: bias, the 2–3
  levels that matter, the dominant driver, and a confidence %. 3) The **event
  radar** (shared events) warns of the next earnings, CPI/FOMC/NFP, monthly/
  quarterly OPEX, and short-interest settlement with the expected effect and why;
  it de-rates confidence into a binary catalyst.
- **Postcondition:** A single decision-ready card; full evidence on demand.

---

## Business Scenarios

### BS-001 — Structure map after one fetch

Given a liquid ticker and a completed daily fetch
When the chart renders
Then the 20/50/200-day MAs, composite POC + HVN/LVN shelves, swing pivots, and the
active pattern are drawn with numeric labels and the two nearest durable levels
are highlighted.

### BS-002 — MA + shelf confluence is scored

Given an HVN shelf near a 50- or 200-day MA
When the S/R map renders
Then the confluence is flagged as higher-conviction than an isolated level, per the
"20/50/200 MA is often the best S/R" thesis.

### BS-003 — Pattern probability is honest

Given a detected chart pattern
When the pattern panel renders
Then it shows a probability WITH its sample size and a "historical base rate, not a
forecast" label, plus the measured-move target and invalidation.

### BS-004 — Breakout requires volume confirmation

Given a pattern breakout candidate
When volume on the breakout bar is below the recent average
Then the break is flagged "unconfirmed / suspect" rather than signaled as valid.

### BS-005 — Regime overrides a naive price read

Given price structure reads "uptrend" but the shared gauge reads high-Fear /
distribution
When the verdict renders
Then the regime layer flags the conflict ("uptrend into a distribution regime —
lower conviction") instead of a blind "buy dips."

### BS-006 — Accumulation/distribution from effort-vs-result

Given rising price on shrinking up-volume and churn at the highs
When the A/D meter renders
Then it leans "distribution" with the effort-vs-result evidence shown, not just a
single indicator.

### BS-007 — Swing options magnets are shared, not re-fetched

Given the Options Structure Lab cached a snapshot
When the swing-options panel renders
Then monthly walls + max-pain + SI appear from `RLDATA.options` with NO new fetch
and an age badge.

### BS-008 — Recent-analog odds with sample size

Given the current setup signature
When the analog panel renders
Then it shows how many similar setups occurred in the lookback, their forward
outcome distribution, and the hit rate — never a bare "high probability" claim.

### BS-009 — Event radar warns with the "why"

Given an upcoming earnings/CPI/FOMC/OPEX date
When the radar renders
Then it names the event, its expected effect on the name, and de-rates the verdict
confidence into the catalyst.

### BS-010 — Accessibility & background-tab rendering

Given any chart canvas
When the page renders (including in a hidden/background tab)
Then charts draw synchronously (no rAF-gated first paint) and every canvas has an
aria-label + text fallback.

---

## Signal engine (calculated TA → one simple summary)

Every signal is computed but the trader sees a **summary**. Each signal's
**probability** blends (a) a recent-**analog hit rate** over the last *N* months
in the same regime, (b) a documented base rate, and (c) a confluence count. The
**regime layer reweights** the engine — the same pattern is trusted differently in
a trend vs a topping vs a basing regime.

| Signal group | Inputs | Regime-conditioned anticipation |
|---|---|---|
| **Trend** | 20/50/200 alignment, crosses, HH/HL structure | continuation vs exhaustion |
| **Profile S/R** | composite POC, HVN/LVN, naked POC, MA confluence | hold/reject vs slice |
| **Pattern** | detected pattern, stage, volume confirm | breakout/target vs failed break |
| **Accum/Distribution** | OBV, up/down vol, effort-vs-result, churn | absorption vs supply |
| **Regime** | F&G (7 comp), VIX level + term, breadth, put/call | risk-on / topping / fear / basing |
| **Retail/crowding** | parabolic slope, FOMO gaps, margin & SI context | chase-exhaustion vs squeeze fuel |
| **Options positioning** | monthly walls, max-pain, gamma-flip, SI (shared) | magnet-pin vs break, squeeze |
| **Candle/structure patterns** | engulfing, hammer/hanging-man, star, doji at a level | each with analog probability + required next-bar confirmation |

Trader-psychology framing (researched): markets cycle through optimism → euphoria
(greed extreme, complacent, thin breadth, high margin) → anxiety → panic → despair
(fear extreme, capitulation volume) → hope → recovery. The regime badge places the
name on that cycle so the engine leans **contrarian at extremes** (fade euphoria
into resistance shelves; look for accumulation into panic at HVN support) and
**trend-following in the middle** — the documented contrarian-at-extremes,
trend-in-the-middle behavior.

---

## Data sources & feasibility (reuses the shared stack — no new endpoints)

| Need | Source | Notes / honesty |
|---|---|---|
| Daily bars (~5y) | Yahoo `chart?interval=1d&range=5y` (shared cache) | adjusted close; reused from etf/sector tools |
| MAs / profile / structure | computed in-browser | value-area 70% (standard) |
| Regime gauge (F&G, VIX term, breadth) | **shared** `RLDATA.macro` | in-browser F&G proxy; CNN feed optional |
| Options magnets + SI | **shared** `RLDATA.options` (options tool) | never re-fetched |
| Earnings / econ / OPEX | **shared** `RLDATA.events` (Finnhub, best-effort) | degrade to editable built-in date list |
| Margin debt / retail crowding | FINRA monthly (no clean API) | annotated context only — not live |

Pattern detection is heuristic (pivot-based), and its probabilities are honest
base rates with sample sizes, not guarantees — consistent with the Lab's ethos.

---

## Input levers

Provider + key · symbol · swing window (1–12 mo) · MA set (default 20/50/200) ·
value-area % (default 70) · pattern sensitivity · analog lookback *N* months ·
regime source (auto shared gauge / manual bull-base-bear like the AI page) ·
dealer-gamma sign (inherited) · Simple ⇄ Power.

---

## Competitive analysis

| Capability | This tool | TradingView (paid) | Finviz / screeners | Broker research |
|---|---|---|---|---|
| 20/50/200 MA + composite profile S/R | ✅ free, in-browser | ✅ (paid VP) | partial | partial |
| Pattern detection + probability + sample size | ✅ **honest odds** | partial (auto-patterns, no odds) | ✕ | ✕ |
| Regime engine (F&G 7-comp + VIX term + breadth) | ✅ **differentiator** | ✕ | ✕ | partial (commentary) |
| Accumulation/distribution (Wyckoff-lite) | ✅ | partial (indicators) | ✕ | ✕ |
| Options magnets + squeeze shared w/ options tool | ✅ **differentiator** | ✕ | ✕ | ✕ |
| Recent-analog outcome distribution | ✅ **differentiator** | ✕ | ✕ | ✕ |
| One-line positioning verdict | ✅ | ✕ | ✕ | partial |
| No account / offline-capable / free | ✅ | ✕ | partial | ✕ |

**Edge:** the free, in-browser, honest combination of *structure + regime +
accumulation/distribution + shared options positioning + recent-analog odds +
one-line verdict* is not assembled in one place by the mainstream free tools.

---

## Improvement proposals (ranked)

- **IP-001 ⭐ Regime engine (cycle of emotions).** F&G-7 + VIX term + breadth →
  a regime that reweights every signal and flags "trend into a topping regime."
  The headline differentiator. High / M.
- **IP-002 ⭐ Recent-analog outcome distributions.** "This setup, in this regime,
  resolved up X% (n=…)" turns patterns into odds with sample size. High / M.
- **IP-003 ⭐ Shared options magnets + squeeze.** Reuse `optSnaps` monthly walls +
  SI with zero refetch — satisfies the cross-tool data-sharing goal. High / S.
- **IP-004 MA × volume-shelf confluence scoring.** Directly operationalizes the
  "20/50/200 MA is the best S/R" thesis. High / S.
- **IP-005 Accumulation/distribution meter.** Effort-vs-result + OBV + churn →
  smart-money-vs-retail footprint. Medium / M.
- **IP-006 Simple verdict card.** One bias + levels + confidence, "why"
  expandable — the "simple + power" UX. High / S.

---

## UI scenario matrix

| Scenario | Actor | Entry point | Steps | Expected outcome | Screen |
|---|---|---|---|---|---|
| First read | swing trader | ticker box | type → fetch | verdict card + structure chart | Simple |
| Trend check | MA trader | MA stack | glance | alignment/cross badge + MA support | Simple |
| Level plan | level trader | composite profile | hover | POC/HVN/LVN + MA confluence | Power |
| Pattern odds | pattern trader | pattern panel | read | probability + target + invalidation | Power |
| Regime | allocator | regime badge | glance | risk-on/topping/fear/basing | Simple |
| A/D | A/D reader | A/D meter | glance | accumulation/distribution + evidence | Power |
| Positioning | squeeze researcher | options panel | read | walls + squeeze (shared) | Power |
| Catalyst | event trader | event radar | glance | next catalyst + effect + de-rate | Simple |

---

## Non-functional requirements

- **Performance:** full swing recompute < 200 ms for a 1-year daily window; no
  network on cache hit (bars reused from the shared layer).
- **Accessibility:** synchronous canvas draw (no rAF-gated first paint), aria-
  labels + text fallback on every chart, WCAG-AA contrast in dark theme.
- **Resilience:** every fetch best-effort with cache fallback + age badge; offline
  (`file://`) renders from cache + an inline fallback watchlist.
- **Honesty:** pattern odds show sample size; F&G is a labeled proxy; margin-debt
  context is labeled non-live; adjusted/raw closes never blended.

---

## Known limitations & honest-edge caveats (quant reality)

What a working quant would flag before trusting any of this — all must be visible
in-tool, not buried:

- **Overfitting / data-snooping is the main risk.** The analog engine matches the
  current setup against limited history and selects from many candidate
  signatures — that is in-sample and unstable. Mitigations (mandatory): gate
  probabilities to a minimum sample (`n ≥ N_min`), show the sample size **and**
  the outcome dispersion (not just a point estimate), prefer coarse buckets
  (**lean / mixed / strong**) over false-precise percentages, restrict to bars up
  to the signal time (no look-ahead), and label everything a **descriptive base
  rate, not a forecast**.
- **Pattern reliability is contested.** Auto chart-pattern detection (H&S, cup &
  handle, triangles) is subjective to codify from pivots, and the academic
  evidence on candlestick/chart-pattern profitability is weak and
  confirmation-dependent (potency decays ~3–5 bars after completion). Detected
  patterns are heuristics with base rates, never guarantees.
- **Regimes are clean only in hindsight.** The F&G / VIX / breadth classifier
  whipsaws near turns; a regime label lags the turn it is trying to catch. It
  reweights signals, it does not predict the pivot.
- **The Fear & Greed reading is a proxy.** It is an in-browser F&G-*style*
  composite — it will NOT equal CNN's number (different components, lookbacks,
  and a crude breadth basket vs full-NYSE 52-week highs/lows). Labeled as a proxy.
- **Margin-debt / short-interest context is non-live.** FINRA margin debt is
  monthly and short interest is bi-monthly settlement — annotated context only,
  never presented as a live gauge.
- **No costs, no tradability claim.** Slippage, fees, borrow, and spread are
  unmodeled. The verdict describes structure and regime; it is not a trade
  recommendation.

## Build checklist (when this is built)

1. Implement / paste the shared `RLDATA` module (see
   [`shared-data-layer.md`](shared-data-layer.md)); reuse daily bars from the
   shared cache before any fetch.
2. 20/50/200 MAs + alignment/cross; composite volume profile (POC/HVN/LVN/naked).
3. Swing-pivot detection → market structure + pattern engine (probability +
   sample size + measured move + volume-confirm).
4. Accumulation/distribution meter (OBV, up/down vol, effort-vs-result, churn).
5. Regime engine from `RLDATA.macro` (F&G-7 proxy + VIX term + breadth) → regime
   band + signal reweighting.
6. Swing options magnets + squeeze from `RLDATA.options`; day-over-day wall
   migration.
7. Recent-analog engine (setup signature → forward-outcome distribution over *N*
   months in-regime).
8. Simple verdict card + Power evidence view (mode toggle like the AI page);
   bull/base/bear regime override.
9. Event radar from `RLDATA.events`; `.rlnav` header, footer notes link,
   disclaimer; add `swing-structure-universe.json`.
10. Validate offline + on Pages; confirm canvases draw in a background tab; run the
    no-CLI `new Function(...)` + `JSON.parse(universe)` checks.
11. **Only then** register in `index.html` `TOOLS`, `tools.json`, README, and add
    the cross-links in every tool's `.rlnav`.

---

## Version history

- **v0 (2026-07-03)** — Proposed. Swing sibling to the intraday tool; composite
  profile + 20/50/200 MA S/R, market-structure/pattern engine with analog
  probabilities, accumulation/distribution, a regime engine (F&G-7 + VIX term +
  breadth), shared options positioning, and a one-line positioning verdict.
  Depends on the shared data layer.
