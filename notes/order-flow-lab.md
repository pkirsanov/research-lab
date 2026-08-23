# Order Flow Lab — analyst brief

> **Status: PROPOSED (not yet built). Not registered in `index.html` / `tools.json` /
> `README.md` / `notes/README.md`, and it must not be until the HTML ships (P17).**
> **Educational only — not investment advice.**
>
> Proposed single-file tool: `../order-flow-lab.html` (not yet created)
> Proposed shared module: `../rlflow.js` (not yet created)
> Proposed editable universe: `../order-flow-universe.json` (not yet created)
> Proposed group: `Options & Flow` (existing group; no new group needed)
>
> Analyst pass 2026-08-22. Sibling of [`intraday-tape-lab.md`](intraday-tape-lab.md)
> (which owns the session auction read) and [`technical-analysis-decision-lab.md`](technical-analysis-decision-lab.md)
> (which already declared the microstructure eligibility contract this tool would satisfy).

---

## Honest findings first

These came out of reading the repo and checking every data source. They are ordered by how
much they should change the plan, not by how comfortable they are.

1. **The repository already ruled on this, and the ruling is conditional — not a ban.**
   Feature 007's Non-Goals exclude "Building a Level-2 terminal, footprint chart,
   time-and-sales reader, dark-pool feed, or order-book liquidity heatmap **from data the
   repository does not possess**"
   ([`specs/007-technical-analysis-decision-lab/spec.md`](../specs/007-technical-analysis-decision-lab/spec.md)).
   Its Claim Validation Ledger records "Footprints show bid/ask traded volume at each price
   | **Supported when proper data exists** | Unavailable without eligible feed." So the
   product does not forbid a footprint. It forbids **synthesizing** one from OHLCV, and it
   already built the honest `UNAVAILABLE` surface that a real feed would light up
   (scenario `SCN-007-017`, "Footprint and depth modules fail honestly"). This proposal is
   not a request to relitigate that ruling. It is a request to **satisfy its precondition**
   in the one place where a free public feed actually does.

2. **A free, keyless, browser-native feed with true aggressor side and full depth exists —
   for crypto, today.** Coinbase Exchange documents that "Market Data APIs provide market
   data and are public." Its `matches` channel is public and its `match` message states
   "The aggressor or `taker` order is the one executing immediately after being received
   and the `maker` order is a resting order on the book. The `side` field indicates the
   maker order side." That is **classified aggressor side with no inference**. Its
   `level2_batch` channel is documented as delivering level2 data "*without authenticating*",
   batched every 50 ms — that is **time-stamped depth-of-book**. Both of the data contracts
   Feature 007 named as missing are satisfied by a keyless WebSocket. (`level2`, `level3`,
   `full`, `user` and `balance` all require auth; the public set is `matches`, `ticker`,
   `ticker_batch`, `level2_batch`, `heartbeat`, `status`, `auction`.)

3. **Spot crypto is already in the committed universe, so this is not an asset-class
   expansion.** `real-assets-universe.json` carries `BTC-USD` and `ETH-USD` under a
   `crypto` model class, and `volatility-sizing-universe.json` carries both under a
   `crypto` cohort. The instruments are in scope already; only the *resolution* is new.

4. **No free US-equity path to the same contract exists, and the price of the paid one is
   knowable.** Massive (formerly Polygon) free Basic is 5 API calls/min, 2 years, **end-of-day
   data, minute aggregates, no Trades, no Quotes, no WebSockets**; Trades first appear on
   Developer at **$79/mo** (15-minute delayed) and Quotes on Advanced at **$199/mo**
   (real-time). Finnhub free is 60 calls/min with a 50-symbol WebSocket, and its pricing
   table leaves **Tick data blank in the free column**. So the naive assumption that
   "someone gives away US tick+quote data" is false, and the gap has a price tag.

5. **But there IS a free US-equity ground-truth sample, and it is the most valuable
   under-exploited fact in this brief.** Alpaca's Basic plan is free, covers US stocks and
   ETFs, gives **real-time IEX** coverage over a 30-symbol WebSocket, historical back to
   2016 with only "the latest 15 minutes" withheld, at 200 API calls/min. IEX trades **and**
   quotes mean Lee-Ready classification runs on genuine US equity prints — on one venue's
   subsample, in a real 390-minute session, at a real tick size. That is not the whole tape,
   and the coverage shortfall is not a guess: **IEX volume over a window divided by the
   consolidated 1-minute bar volume already in `rlData` is a measured number the tool can
   display** rather than a disclaimer it has to write.

6. **The repo's four existing order-flow proxy reads are honestly labelled and completely
   unmeasured.** `intraday-tape-lab.html` implements `deltaDivergence` (line 1565),
   `absorptionProxy` (1580) and `imbalanceShelves` (1599) with hand-set thresholds —
   2.5× median volume, 3× one-sided imbalance, ≥3 adjacent buckets, wick ≥1.4× body. Every
   one carries a `PROXY` comment, which satisfies P1. **None carries an error rate**, which
   is where P3 ("confidence is evidence quality") and P5 ("a rate is withheld below its
   minimum sample") have nothing to withhold because nothing was ever measured. Labelling a
   proxy is necessary; it is not the same as knowing how wrong it is.

7. **That is the actual product gap, and no competitor fills it.** Bookmap, ATAS and Jigsaw
   sell you *real* flow and never quantify a proxy's error, because they do not use proxies.
   Every free delta/CVD indicator on a charting platform uses the bar-direction proxy and
   never quantifies its error either. **Nobody publishes the measured disagreement between a
   bar-derived flow estimate and the classified tape it approximates.** This repo is the one
   product whose principles (P4 misses at equal prominence, P5 withholding, P21 append-only
   history, P23 a guard that cannot fail is not a guard) make publishing that number
   natural rather than embarrassing.

8. **The calibration does not transfer between asset classes, and saying otherwise would be
   the exact fabrication this tool exists to prevent.** BVC error measured on `BTC-USD`
   1-minute bars is *not* BVC error on `NVDA` 1-minute bars: different tick size, 24/7
   versus a 390-minute session, one venue versus a fragmented consolidated tape, no auctions,
   no LULD. The crypto lane is therefore a **falsification harness**, not a calibration
   source: it can kill an estimator (an estimator that cannot beat a coin flip where truth
   is observable has no business being trusted where truth is not), and it can rank
   estimators against each other. Only the IEX lane (finding 5) produces an equity-side
   number, and even that is venue-scoped. Any wording that implies otherwise fails P1/P3.

9. **P19 is already at risk and this tool would break it if built naively.** There is no
   shared module for delta, CVD, or volume-profile math — 46 `rl*.js` modules exist and none
   of them own it. The math lives inline in `intraday-tape-lab.html` and `swing-structure-lab.html`.
   A new flow tool that re-implements CVD creates the third definition. **The consolidation
   into `rlflow.js` is not optional polish; it is a precondition.**

10. **This would be the repository's first WebSocket.** A repo-wide search returns zero
    `WebSocket` / `wss://` usages in research-lab. Everything is REST, cache-first, delta-append.
    A streaming tool is a genuine architectural first and its risks (P10 `file://` null-origin
    handshake, P12 first paint before any tick arrives, tab-backgrounding, unbounded buffer
    growth) belong in the spec, not in the build.

11. **This is three specs, not one.** P25 caps a spec at ~40 functional requirements or
    ~5 scopes. Capability foundation + a streaming venue lane + an estimator suite + a
    calibration ledger + a P19 consolidation is far past that. The split is proposed below.

---

## Purpose

Answer one question that none of the 29 live tools can currently answer:

**"Who is actually hitting the offer right now, how much resting size is really there, and —
when I cannot see either — how wrong is the number I am being shown instead?"**

Where [Intraday Tape](intraday-tape-lab.md) reads the *session auction* from bars and
[Options Structure](options-structure-lab.md) reads *dealer positioning* from a chain, this
tool reads the **transaction and book layer beneath both**, and — critically — reports its
own measured accuracy per lane instead of asking the reader to trust a label.

---

## Outcome Contract

- **Intent.** Give a day trader a single flow read whose **evidence tier is visible in the
  read itself**: observed classified flow where a public feed provides it, venue-scoped
  observed flow where a free equity feed provides a subsample, and named published
  estimators with a **measured disagreement rate** where only bars exist. The reader should
  never have to ask which one they are looking at.
- **Success signal.** For `BTC-USD`, within one minute of opening the page and with no key,
  no proxy and no account, the tool renders from the live public feed: a **footprint /
  cluster ladder** with true taker-side volume at price, a **true CVD** with divergence
  marks, a **depth heatmap** over time, a **DOM ladder**, a **time-and-sales tape** with a
  large-print filter, and one Simple verdict — *"Sellers are lifting bids into 63,4xx ·
  resting ask size 3.1× bid at the level · absorption, not breakout · observed, not
  estimated."* For `NVDA`, the same page renders the estimator lane instead, and every
  number carries its provenance class plus a band derived from the calibration ledger — or,
  where the ledger has too few samples, the withheld state required by P5.
- **Hard constraints.**
  1. **No tier ever borrows another tier's authority.** An estimate is never rendered in the
     visual language of an observation. Where a module's data contract is unsatisfied it
     renders `UNAVAILABLE`, never neutral, never interpolated — the rule Feature 007 already
     ratified.
  2. **A displayed error band must come from a stored measurement.** No hard-coded
     "typically ~70% accurate". If the ledger has fewer than the declared minimum samples in
     that regime bucket, the rate is **withheld with its sample count shown** (P5).
  3. **Crypto measurements are never presented as equity measurements** (finding 8). The
     ledger is keyed by venue and asset class and the UI never averages across them.
  4. **`rlflow.js` is the single definition** of delta, CVD, bucketing, imbalance and every
     estimator; `intraday-tape-lab.html` is migrated to consume it (P19). Two implementations
     of CVD in one repo is two chances to disagree in public.
  5. **Keyless operation is the baseline, not the fallback** (P9). The crypto lane and the
     bar-estimator lane must work with nothing. The IEX lane is an optional enhancement.
  6. **A trading-capable credential never enters the browser.** Alpaca issues a key *and
     secret*; that pair is not a read-only artifact. The IEX lane is **proxy-tier only**
     (Tier 1 of the existing two-tier provider model) and must refuse to accept a
     Tier-2 local secret at all.
  7. **Displayed liquidity is displayed, not promised.** Resting size may move, cancel or be
     non-bona-fide; the ledger row Feature 007 already wrote ("Liquidity heatmaps show likely
     future trades | Rejected") governs every string this tool renders.
  8. **A large print is `large executed trade`, never a named actor, never "institutions".**
- **Failure condition.** The tool fails — even if every chart renders — if it lets a crypto
  calibration number decorate an equity estimate, shows an error band that no stored sample
  supports, renders an estimator in the same visual language as an observation, implies it
  sees resting equity depth or dark-pool prints, calls displayed size a promised fill,
  attributes a print to an actor, or quietly drops a claim it could not score instead of
  emitting `not-evaluable` (P20).

---

## Exposure Contract

| Capability | Surface class | Surface id | Status | Plan |
| --- | --- | --- | --- | --- |
| Observed order flow (crypto lane) | uiRoute | `order-flow-lab.html` | planned | Spec 028 |
| Flow capability + estimators | internal | `rlflow.js` | planned | Spec 028/029; consumers `order-flow-lab.html`, `intraday-tape-lab.html` |
| Calibration ledger (append-only) | internal | `order-flow-calibration.jsonl` | planned | Spec 029 |
| Venue-scoped equity flow (IEX lane) | uiRoute | `order-flow-lab.html?lane=iex` | planned | Spec 030 |
| Flow read for the brief | internal | `RLDATA.putToolRead("order-flow-lab")` | planned | Spec 028; consumer `market-brief.html` |
| Migrated proxy reads | internal | `rlflow.js` (from `intraday-tape-lab.html`) | planned | Spec 030 |

No capability is proposed without a route or a named in-repo caller (P17, P18).

---

## Domain Capability Model (AN5 — capability-first)

The proportionality triggers apply on three counts: a brand-new capability with no existing
foundation, three distinct providers of the same capability, and a surface shared with an
already-live tool. So the capability is defined before any provider.

### Primitives

| Primitive | Definition | Lifecycle |
| --- | --- | --- |
| `FlowObservation` | One classified transaction: time, price, size, aggressor side, classification method, venue | `observed` → `classified` → `bucketed` → `aged-out` |
| `BookState` | Resting displayed size by price at a time, with the update that produced it | `snapshot` → `delta-applied` → `stale` → `resynced` |
| `FlowBucket` | Aggregation over a price level and an interval: buy volume, sell volume, delta, trade count, size distribution | `accumulating` → `closed` → `persisted` |
| `FlowEstimate` | A modelled quantity (BVC split, VPIN, λ, ILLIQ, spread) with its method, inputs and input tier | `computed` → `calibrated` → `withheld` |
| `CalibrationSample` | One estimate compared against a same-window observation: method, venue, asset class, regime bucket, error | `recorded` → `aggregated` → `superseded` |
| `EligibilityVerdict` | Whether a module's data contract is met for this instrument right now | `eligible` → `degraded` → `unavailable` |

### Provenance classes (this is the load-bearing part)

| Class | Meaning | Admissible modules |
| --- | --- | --- |
| `observed-full` | Classified taker side **and** full displayed depth from the venue | footprint, heatmap, DOM, CVD, absorption, iceberg, spoof/pull, sweep, tape |
| `observed-venue` | Classified side on **one venue's subsample**, coverage fraction measured | footprint, CVD, absorption, sweep, tape, size mix |
| `estimated-calibrated` | Modelled from bars, with a stored error band for this venue/class/regime | BVC split, VPIN, λ, ILLIQ, spread |
| `estimated-uncalibrated` | Modelled from bars, ledger below minimum sample | same, **rate withheld**, band replaced by sample count |
| `unavailable` | Data contract unsatisfied | renders the Feature 007 unavailable record, never neutral |

Every renderer takes the class as an input and refuses to render a module the class does not
admit. That is the mechanism by which hard constraint 1 is enforced in code rather than in
prose — and it is what makes an adversarial test possible (P23): feed the crypto renderer an
`estimated-uncalibrated` observation and it must refuse.

### Business policies every provider obeys

1. Classification method is a stored field, never an assumption of the consumer.
2. A book snapshot older than its declared staleness bound is `stale`, and a stale book
   cannot produce a heatmap, an iceberg or a spoof verdict.
3. Coverage fraction is measured against a consolidated reference where one exists, and is
   `null` — not `1.0` — where none exists.
4. Ledger samples are append-only; a correction references the prior sample (P21).
5. An estimator with no admissible ground-truth venue is permanently `estimated-uncalibrated`
   and says so.

### Providers (three, deliberately)

| Provider | Class produced | Auth | Notes |
| --- | --- | --- | --- |
| Coinbase Exchange public WS | `observed-full` | none | `matches` + `level2_batch`; keyless |
| Alpaca Basic (IEX) | `observed-venue` | proxy tier only | free; real-time IEX; 30-symbol WS; historical excludes latest 15 min |
| `rlData` 1m/5m bars | `estimated-*` | existing | already cached; no new fetch (P11) |

---

## Actors & Personas

| Actor | Goal | Reads first | Which lane serves them |
| --- | --- | --- | --- |
| **Absorption / exhaustion reader** | "Is this level being defended or is it about to go?" | Footprint ladder + resting size at level | `observed-full`; `observed-venue` partial |
| **Liquidity-map trader** | "Where is the real resting size, and did it just disappear?" | Depth heatmap + pull/spoof marks | `observed-full` only |
| **Delta-divergence trader** | "Is price making a high the flow does not confirm?" | CVD + divergence marks | all three, with the class stated |
| **Large-print watcher** | "Did something big just print, and on which side?" | Tape with size filter + size-mix chart | `observed-full`, `observed-venue` |
| **Toxicity / risk-off watcher** | "Is flow getting one-sided and dangerous?" | VPIN series + regime band | all three; band from ledger |
| **Cost-and-impact estimator** | "What will it cost me to get size done here?" | λ, ILLIQ, effective spread | all three |
| **The skeptic (the differentiating actor)** | "How wrong is this proxy, actually?" | Calibration scoreboard | ledger, always |
| **Existing Intraday Tape user** | "Should I still believe the delta read I have been using?" | Migrated proxy reads, now with a measured rate | ledger + `observed-venue` |

**Non-actors, explicitly out of scope:** anyone routing an order, anyone needing sub-second
execution latency, anyone wanting dark-pool prints, anyone wanting consolidated US depth
(Nasdaq TotalView is a paid proprietary feed and stays out under Product-Principles §6).

---

## Use cases

### UC-001 — Read a defended level with observed flow

**Actor:** absorption reader. **Precondition:** crypto lane eligible.
**Main flow:** open the tool → the public feed connects → the footprint ladder fills → price
retests a level → the ladder shows heavy sell aggression at the level while price does not
break → resting bid size at the level stays large → Simple reads *absorption, dip supported*.
**Alternative:** resting size vanishes before the prints arrive → read flips to *pull, not
absorption*. **Postcondition:** the verdict, its level, its invalidation and its horizon are
written as a scoreable claim (P20).

### UC-002 — Read the same setup on an equity, honestly

**Actor:** same reader, symbol `NVDA`. **Main flow:** the crypto modules render `UNAVAILABLE`
with the Feature 007 record; the estimator lane renders a BVC split and VPIN with a band from
the ledger; if the IEX lane is configured, an `observed-venue` footprint renders **with its
measured coverage fraction**. **Postcondition:** the reader can state which of the three they
just read without clicking anything.

### UC-003 — Find out how much the old proxy was lying

**Actor:** the skeptic. **Main flow:** open the calibration scoreboard → pick a method
(bar-direction proxy vs BVC) → see disagreement rate against classified side, by venue, by
asset class, by volatility regime, with sample counts → see which buckets are withheld for
insufficient sample. **Postcondition:** the reader knows whether to keep using the Intraday
Tape delta read, and the answer is a number.

### UC-004 — Detect hidden and non-bona-fide size

**Actor:** liquidity-map trader. **Main flow:** executed size at a price exceeds displayed
size by a threshold → `iceberg candidate`; size is added and then cancelled without execution
as price approaches → `pull` / `spoof candidate`, worded per the ratified SEC-grounded ledger
row. **Constraint:** both require `observed-full`; both are permanently unavailable for
equities here.

### UC-005 — Size a position against measured impact

**Actor:** cost estimator. **Main flow:** λ and ILLIQ over the recent window → an expected
impact for a stated size → deep-link to [Volatility Sizing](volatility-sizing-lab.md) rather
than re-implementing sizing (P16).

### UC-006 — Get the one-line read (Simple)

**Actor:** any. One verdict, one level, one invalidation, one provenance class, one band.
Everything dense behind Power (P14).

---

## Business scenarios

### BS-001 — Keyless first value

**Given** a browser with no key, no proxy and no account,
**When** the tool opens on `BTC-USD`,
**Then** observed footprint, CVD, heatmap, DOM and tape render from the public feed,
**And** no credential prompt is shown, and nothing is empty pending a click (P9, P12).

### BS-002 — First paint precedes first tick

**Given** a previously recorded session in cache,
**When** the page loads,
**Then** the recorded session paints immediately and the live stream appends the delta,
**And** the painted state is labelled with its recording time until the first live tick lands.

### BS-003 — Tiers never blend

**Given** an equity with no eligible tick feed,
**When** the footprint module is requested,
**Then** it renders the unavailable record with its stated data requirement,
**And** no bar-derived substitute appears in the footprint's place.

### BS-004 — A band requires a measurement

**Given** a regime bucket with fewer samples than the declared minimum,
**When** a BVC estimate renders,
**Then** the error band is replaced by the withheld state and the sample count is shown,
**And** no default or typical rate is substituted (P5).

### BS-005 — Cross-class contamination is refused

**Given** a full crypto ledger and an empty equity ledger,
**When** an equity estimate renders,
**Then** it is `estimated-uncalibrated`,
**And** the crypto rate is not shown next to it, averaged into it, or used as a prior.

### BS-006 — Coverage is measured, not asserted

**Given** the IEX lane is active for `SPY`,
**When** an `observed-venue` footprint renders,
**Then** IEX volume over the window as a fraction of the consolidated 1-minute bar volume is
displayed as a measured number,
**And** the read is labelled venue-scoped wherever it appears, including in the brief.

### BS-007 — Stale book blocks book-derived verdicts

**Given** the depth stream has gaps or the sequence breaks,
**When** the heatmap, iceberg or spoof module is requested,
**Then** each renders `stale` and no verdict is emitted until resync.

### BS-008 — Degradation is honest, not silent

**Given** the WebSocket cannot connect (blocked origin, offline, venue outage),
**When** the tool loads,
**Then** it paints the last recorded session with its age and states the connection failure,
**And** it does not present a bar-derived reconstruction as the live tape.

### BS-009 — One definition

**Given** `intraday-tape-lab.html` and `order-flow-lab.html` both display a delta read,
**When** the same window and instrument are selected in both,
**Then** the values are identical because both call `rlflow.js` (P19).

### BS-010 — Claims are scoreable or explicitly not

**Given** a Simple verdict,
**Then** it carries instrument, level, invalidation and horizon,
**Or** it is emitted `not-evaluable` — never silently unscoreable (P20).

### BS-011 — Accessibility and background tabs

**Given** the tool is open in a background or integrated browser tab,
**Then** every canvas has an `aria-label` and a text fallback, chart draws are synchronous
rather than `requestAnimationFrame`-gated, and the stream buffer is bounded so a tab left
open all day does not exhaust memory.

### BS-012 — A guard that can fail

**Given** the provenance-class renderer,
**When** an adversarial test feeds an estimate into an observation-only module,
**Then** the render refuses and the test fails if it does not (P23).

---

## Charts and models inventory

The request was for the tool "and related tools/charts/models". This is the full candidate
set with its data requirement, so scoping is a selection rather than a discovery exercise.

### Charts

| # | Chart | Requires | `observed-full` | `observed-venue` | `estimated` |
| --- | --- | --- | --- | --- | --- |
| 1 | Footprint / cluster ladder | classified side at price | yes | yes | no |
| 2 | Liquidity heatmap (depth over time) | time-stamped depth | yes | no | no |
| 3 | DOM ladder | current depth | yes | no | no |
| 4 | CVD + divergence | classified side | yes | yes | approximated |
| 5 | Volume profile with true buy/sell split | classified side | yes | yes | proxied (exists) |
| 6 | Time & sales with large-print filter | trade stream | yes | yes | no |
| 7 | Diagonal imbalance stacking (3× rule) | bid/ask volume at price | yes | yes | proxied (exists) |
| 8 | Volume bubbles / trade-size scatter | per-trade size | yes | yes | no |
| 9 | Depth imbalance and OFI series | L1/L2 updates | yes | L1 only | no |
| 10 | VPIN toxicity series | volume buckets | yes | yes | yes, banded |
| 11 | Absorption / exhaustion at level | side + resting size | yes | partial | proxied (exists) |
| 12 | Iceberg candidate detector | executed vs displayed | yes | no | no |
| 13 | Spoof / pull detector | add-then-cancel events | yes | no | no |
| 14 | Liquidity sweep / stop-run | price structure + side | yes | yes | proxied (exists) |
| 15 | Participation size mix | per-trade size | yes | yes | no |
| 16 | Price-impact curve (λ, ILLIQ) | signed volume + returns | yes | yes | yes, banded |
| 17 | Effective / realized spread | quotes, or OHLC estimator | yes | yes | yes, banded |
| 18 | **Calibration scoreboard** | ledger | always | always | always |

Chart 18 is the differentiator. Charts 1-17 exist in some form in commercial products; 18
does not exist anywhere the research found.

### Models

| Model | Author, year | What it buys | Tier |
| --- | --- | --- | --- |
| Tick rule / bar-direction proxy | classical | today's baseline in this repo | C |
| Bulk Volume Classification | Easley, López de Prado, O'Hara, 2012 | a principled buy/sell split from bars, strictly better founded than bar direction | C |
| VPIN | Easley, López de Prado, O'Hara, 2012 | flow toxicity / one-sidedness | C |
| Lee-Ready | Lee, Ready, 1991 | classification from trades + quotes; the equity ground truth | B |
| Kyle's λ | Kyle, 1985 | price impact per unit signed flow | C, validated on A/B |
| Amihud ILLIQ | Amihud, 2002 | illiquidity from returns and dollar volume | C |
| Roll spread | Roll, 1984 | effective spread from return autocovariance | C |
| Corwin-Schultz | Corwin, Schultz, 2012 | spread from high-low ratios | C |
| Abdi-Ranaldo | Abdi, Ranaldo, 2017 | spread from close-high-low | C |
| Order Flow Imbalance | Cont, Kukanov, Stoikov, 2014 | best-quote size dynamics → short-horizon price change | A, B (L1) |
| Trade-sign autocorrelation | order-flow long-memory literature | is signed flow persistent in this regime? | A, B |

**Exact parameterization of every model above must be verified against its primary source at
implementation time.** The authors, years and intents are recorded here as the research
result; the formulas are not reproduced here and must not be reconstructed from memory —
P7 (no blackbox numbers) applies to the analyst brief as much as to the tool.

**Explicitly deferred:** Hawkes self-excitation for trade arrivals, and Hasbrouck information
share. Both need either heavy fitting or genuine multi-venue data; neither fits a single-file
browser tool at first release. Recorded so they are not rediscovered as novel later.

---

## Data sources and feasibility

| Lane | Source | Auth | Gives | Verified |
| --- | --- | --- | --- | --- |
| A | Coinbase Exchange WS `matches` | none | trade, size, price, maker side ⇒ taker side | docs, 2026-08-22 |
| A | Coinbase Exchange WS `level2_batch` | **none** (documented) | full book snapshot + deltas, 50 ms batches | docs, 2026-08-22 |
| B | Alpaca Basic, IEX | key **+ secret**, proxy tier only | real-time IEX trades and quotes, 30-symbol WS, history ex-latest-15-min, 200 rpm | docs, 2026-08-22 |
| C | `rlData` 1m/5m bars | existing | OHLCV for the estimators; no new endpoint | repo |
| — | Massive/Polygon free | key | EOD + minute aggregates only; **no trades, no quotes, no WS** | pricing, 2026-08-22 |
| — | Finnhub free | key | 60 rpm, 50-symbol WS; **tick data blank in free column** | pricing, 2026-08-22 |

### Open risks that must be resolved before the spec, not during the build

1. **`file://` origin acceptance.** A page opened from disk sends a null origin. Whether the
   public Coinbase feed accepts that handshake is **unverified** and P10 makes it material.
   Resolve by testing before committing to the lane; if it fails, the crypto lane degrades to
   cached-replay under `file://` and the degradation is documented, not hidden.
2. **Alpaca secret handling.** The Basic key pair is not demonstrably read-only. Treat it as
   trading-capable and confine it to the proxy tier. This is a security constraint, not a
   preference.
3. **Cache budget.** A recorded tape plus a book series is orders of magnitude larger than
   any current `rlData` payload. `localStorage` is the wrong store; the spec must choose a
   bounded ring buffer, a downsampled persistence format, or IndexedDB, and it must state a
   byte budget with a **failing** test behind it (P22).
4. **Rate and connection limits.** Public feeds have connection and subscription limits that
   this research did not enumerate. Enumerate before scoping the symbol count.
5. **TradingView's footprint tier is unverified.** Its pricing tiers were confirmed
   (Essential $12.95, Plus $29.95, Premium $59.95, Ultimate $199.95, annual-billed special
   prices; tick-based and second-based intervals gated to upper tiers) but the specific
   help page for Volume Footprint returned 404, so **no claim about which tier includes it
   is made here.**

---

## Competitive analysis

| Capability | This proposal | Bookmap | ATAS | Jigsaw | TradingView | Existing Intraday Tape |
| --- | --- | --- | --- | --- | --- | --- |
| Liquidity heatmap | crypto lane | core feature | yes ("competes with Bookmap" per user review) | heatmaps | no | no |
| Footprint / cluster | crypto + IEX | volume bubbles | 400+ cluster variations | yes | yes (tier unverified) | no, by design |
| DOM ladder | crypto lane | Current Order Book, DOM Pro | Smart DOM | the flagship ladder | no | no |
| Iceberg / stop tracking | crypto lane | Stops & Icebergs Tracker | Smart Tape | yes | no | no |
| Replay | cached session replay | Record & Replay, tick-by-tick | Market Replay | sim | Bar Replay | no |
| US equity depth | **no — priced out, stated** | via paid feeds | via paid feeds | via paid feeds | no | no |
| Cost | free, keyless | subscription | subscription (free crypto per user review) | $579-$1979 + $50/mo live | $12.95-$199.95/mo | free |
| **Published proxy error rate** | **yes — the point** | **no** | **no** | **no** | **no** | **no** |
| Runs from a single HTML file, offline-capable | yes | no | no | no | no | yes |

The honest reading of this table: on eight of nine capability rows a funded competitor beats
this proposal, and the US-equity depth row is one this proposal openly concedes. The product
case rests on the last two rows — a measured, published error rate, in a file you can open on
a plane. If the owner does not value those two rows, this tool should not be built, and that
is a legitimate outcome of this analysis.

---

## Platform direction and market trends

| Trend | Status | Relevance | What it means here |
| --- | --- | --- | --- |
| Retail order-flow tooling has gone mainstream (footprints now sold to retail by ATAS, Bookmap, Jigsaw, and offered by a mass-market charting platform) | Established | High | The *concept* is no longer differentiating. Only the honesty layer is. |
| Market-data vendors keep tick and quote data behind $79-$199/mo tiers | Established | High | The free-tier gap is structural and will not close; design around it permanently. |
| Free public crypto venue APIs expose full L2 and classified trades with no key | Established | High | The only free path to genuine order flow in a browser. |
| Broker-sponsored free equity data limited to a single venue (IEX) | Established | Medium | Enables venue-scoped ground truth; never full-tape parity. |
| Reproducibility and error-disclosure pressure on quantitative claims | Growing | High | A published, append-only error rate is a durable trust asset, not a feature. |

**Strategic reading.** Table stakes here are already owned by funded desktop products, and
buying into that race is unwinnable. The defensible position is the one the repo's own
principles already push toward: be the product that **publishes how wrong its proxies are.**
That is cheap to build, impossible to copy without a cultural commitment competitors do not
have, and it makes every *existing* tool in the lineup more trustworthy — because the
calibration ledger retroactively puts a number on the Intraday Tape reads that ship today.

---

## Improvement proposals, ranked

### IP-001 — Calibration ledger and scoreboard ⭐ competitive edge

**Impact:** High · **Effort:** M · **Actors:** the skeptic, every existing tool user
**Advantage:** no competitor publishes proxy error; the repo's principles make it natural.
**Note:** this delivers value **even if the crypto lane is never built**, because the IEX lane
alone can score the existing bar-direction proxy on real equities.

### IP-002 — `rlflow.js` consolidation ⭐ prerequisite

**Impact:** High · **Effort:** M · **Actors:** all
Move CVD, bucketing, imbalance and the four proxy reads out of `intraday-tape-lab.html` into
one module with a production consumer. Fixes an existing latent P19 violation whether or not
the rest of this proposal proceeds. **This is the highest-value item that is pure cleanup.**

### IP-003 — Crypto observed-flow lane ⭐ competitive edge

**Impact:** High · **Effort:** L · **Actors:** absorption, liquidity-map, large-print
First genuine order flow in the repo; keyless; satisfies the Feature 007 eligibility contract.
Largest single build and carries the WebSocket-first-time risk.

### IP-004 — BVC and VPIN replacing bar-direction as the default estimator

**Impact:** Medium-High · **Effort:** S-M · **Actors:** divergence, toxicity
A published method displacing an ad-hoc one, with IP-001 proving the upgrade rather than
asserting it. **Do not ship this without IP-001** — an unmeasured replacement for an
unmeasured proxy is lateral motion.

### IP-005 — IEX venue-scoped equity lane

**Impact:** Medium · **Effort:** M · **Actors:** equity day traders, the skeptic
Real equity ground truth with a measured coverage fraction. Gated on the proxy-tier secret
constraint being satisfiable.

### IP-006 — Impact and spread estimator panel

**Impact:** Medium · **Effort:** S · **Actors:** cost estimator
λ, ILLIQ and the three spread estimators from bars already cached; deep-links sizing rather
than duplicating it. Cheapest genuinely new capability in the set.

### IP-007 — Session recorder and replay

**Impact:** Medium · **Effort:** M · **Actors:** all
Satisfies P12 for a streaming tool and doubles as the review workflow every competitor sells.
Gated on the storage-budget decision.

**Recommended first cut if only one thing ships: IP-002 + IP-001.** Together they are a
smaller build than IP-003, they fix an existing defect, they produce the differentiating
artifact, and they raise the trustworthiness of tools that are already live. IP-003 is the
exciting one; it is not the one with the best value-to-risk ratio.

---

## UI scenario matrix

| Scenario | Actor | Entry | Steps | Expected outcome | Surface |
| --- | --- | --- | --- | --- | --- |
| Observed absorption | absorption reader | `order-flow-lab.html` | open → connect → retest | Simple verdict, class `observed-full` | Simple |
| Honest equity fallback | same | `?ticker=NVDA` | open | footprint `UNAVAILABLE`, estimator lane with band | Simple |
| Proxy audit | skeptic | `#calibration` | pick method → pick bucket | rate or withheld state, with sample count | Power |
| Depth pull | liquidity-map | `#heatmap` | watch level | `pull` mark, no fill promise | Power |
| Impact sizing | cost estimator | `#impact` | enter size | impact estimate, deep-link to sizing | Power |
| Replay yesterday | all | `#replay` | choose session | recorded session with its age | Power |
| Offline open | all | `file://` | open | cached session paints, connection state stated | Simple |

---

## Non-functional requirements

- **Access:** crypto and estimator lanes work with no key, no proxy, no account (P9).
- **Delivery:** one HTML file, UMD shared modules, no bundler, `file://`-openable (P10).
- **First paint:** meaningful view from cache on load, before any tick (P12).
- **Reuse:** bars come from `rlData`; the estimator lane fetches nothing new (P11).
- **Explanation:** every term, badge, axis, value and canvas region carries a contextual
  tooltip stating both what it is and what the current value means (P15).
- **Privacy:** tickers and instrument ids only; no size, no basis, no P&L (P13).
- **Budgets:** stream buffer bytes, book depth retained, tape length and redraw cost each get
  a number with a failing test behind it (P22).
- **Guards:** every provenance-class refusal has an adversarial case that fails when the
  refusal is removed (P23).
- **Accessibility:** canvas `aria-label` plus text fallback; synchronous draws; keyboard
  reachable Simple/Power toggle.
- **Selftest:** pure helpers declared as top-level `function` declarations so
  `scripts/selftest.mjs` `extractFn` can pull them; a new group added for every new module.

---

## Known limitations, stated up front

1. No consolidated US equity depth. Ever, at this price point.
2. No dark-pool or off-exchange prints.
3. IEX is a venue subsample; its coverage fraction is measured, not flattering.
4. Crypto calibration does not transfer to equities and is never presented as if it does.
5. Displayed depth is displayed, not promised; spoofing is documented market behaviour.
6. A large print is a large executed trade and never a named participant.
7. Estimators are estimators; where the ledger is thin the rate is withheld, not softened.
8. Crypto trades 24/7 with no auction; several session-structure reads from the equity tools
   simply do not apply and must be suppressed rather than reinterpreted.
9. This is educational research tooling. It does not route orders and never will.

---

## Open questions for the owner

These are genuine decisions, not rhetorical framing. Each blocks a different amount of work.

1. **Does Product-Principles §6 "Real-time options flow — vendors own it via proprietary
   feeds" extend to free public crypto spot order flow?** Reading it narrowly, no: it names
   options, and the crypto feed is neither proprietary nor vendor-owned. Reading it as a
   posture about live streaming, maybe. **Blocks IP-003 entirely.**
2. **Is a persistent WebSocket acceptable in a repo whose identity is cache-first, no-server,
   file://-openable?** P12 is satisfiable via recorded-session first paint, but this is a new
   architectural class and the answer should be deliberate. **Blocks IP-003, IP-007.**
3. **Is a trading-capable credential acceptable at the proxy tier?** If not, IP-005 dies and
   the equity ground truth with it, leaving crypto as the only observed lane.
4. **Is the calibration ledger worth building on its own?** The analysis says yes and says it
   is the best value-to-risk item in the set. Confirming this unlocks IP-001 + IP-002
   immediately, without waiting on questions 1-3.
5. **Storage substrate for recorded tape:** bounded `localStorage` ring, downsampled format,
   or IndexedDB (which would be a second architectural first)?

---

## Proposed spec split (P25 respects ~40 FR / ~5 scopes per spec)

Next free number is **028** (`specs/` currently ends at 027, and note that 021 is already
duplicated across `021-execution-receipts-and-session-review-adoption` and
`021-lifetime-tax-strategy-lab` — do not add a third collision).

| Spec | Scope | Depends on |
| --- | --- | --- |
| **028** — Flow capability foundation and observed crypto lane | `rlflow.js` capability, provenance classes, eligibility verdicts, Coinbase adapter, footprint, CVD, tape, DOM, heatmap, Simple/Power, recorded-session first paint | owner answers 1, 2, 5 |
| **029** — Flow estimators and the calibration ledger | BVC, VPIN, λ, ILLIQ, three spread estimators, append-only ledger, error bands, withholding, scoreboard, adversarial guards | 028 for the capability contract; **ledger is independently valuable** |
| **030** — Venue-scoped equity lane and P19 consolidation | Alpaca IEX adapter at proxy tier, measured coverage fraction, migration of the four `intraday-tape-lab.html` proxy reads into `rlflow.js`, cross-tool parity test | owner answer 3 |

If the owner answers "no" to questions 1-3, **029 still ships** as an estimator-and-honesty
feature over existing bars, and the P19 consolidation from 030 can be split forward into it.
That is the fallback path, and it is a good one.

---

## Build checklist (when promoting PROPOSED → LIVE)

- [ ] Owner has answered the five open questions above.
- [ ] `file://` null-origin handshake tested against the public feed before the lane is scoped.
- [ ] `rlflow.js` created with a **production** consumer, not just a test (P18).
- [ ] `intraday-tape-lab.html` migrated to `rlflow.js`; parity test proves both tools agree.
- [ ] Provenance-class renderer refuses cross-tier rendering, with an adversarial test that
      fails when the refusal is removed (P23).
- [ ] Calibration ledger is append-only and keyed by venue, asset class and regime bucket.
- [ ] Withholding path exercised: a thin bucket shows sample count, never a default rate.
- [ ] Storage budget asserted by a failing test (P22).
- [ ] Every canvas has `aria-label` plus text fallback; draws are synchronous.
- [ ] `node scripts/selftest.mjs` passes with a new group for every new pure helper.
- [ ] Registered in `index.html` TOOLS, `tools.json`, `README.md`, `notes/README.md`, and the
      shared `.rlnav` — **only at ship time** (P17).
- [ ] `RLDATA.putToolRead("order-flow-lab", …)` published so the brief deep-links rather than
      duplicating (P16).
- [ ] This note's status line changed from PROPOSED to LIVE in the same change (P24).

---

## Version history

- **2026-08-22** — Analyst brief created. Verified: Coinbase Exchange public `matches` and
  `level2_batch` channels (keyless, classified taker side, 50 ms depth batches); Alpaca Basic
  free IEX real-time with the latest-15-minutes historical restriction; Massive/Polygon free
  tier excludes trades, quotes and WebSockets with trades at $79/mo and quotes at $199/mo;
  Finnhub free excludes tick data; Bookmap, ATAS, Jigsaw and TradingView feature and price
  positions. Established that Feature 007's footprint exclusion is conditional on data
  possession, that spot `BTC-USD` / `ETH-USD` are already in the committed universe, that no
  shared module owns delta or CVD today, and that the repo contains no WebSocket usage.
  Identified the published-proxy-error-rate ledger as the only differentiating capability
  found, and recommended IP-002 + IP-001 as the first cut ahead of the streaming lane.
