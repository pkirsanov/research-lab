# Gamma Trading &amp; Dealer-Flow Playbook Lab — notes

> **Status: LIVE (v1.0, 2026-07-03).** Single-file tool:
> [`../gamma-trading-lab.html`](../gamma-trading-lab.html). This document is both
> the analyst discovery/design brief and the live tool's methodology handoff for
> the next run. **Educational only — not investment advice.** Everything is a
> hypothetical, delayed / EOD, positioning-derived read from public data you fetch
> yourself. It never claims access to real-time order flow, dark-pool, or
> trade-level bid/ask side.

Single-file tool: [`../gamma-trading-lab.html`](../gamma-trading-lab.html)
Editable universe: [`../gamma-trading-universe.json`](../gamma-trading-universe.json)
Structure sibling: [`options-structure-lab.md`](options-structure-lab.md) ·
Shared cache: [`shared-data-layer.md`](shared-data-layer.md)

---

## Purpose

Answer one question well: **given how dealers are positioned in gamma right now,
which of the three classic gamma trades is live today, and what is the plan?**

The [Options Structure Lab](options-structure-lab.md) *maps* the option-implied
structure (walls, gamma-flip, max pain, expected move). This tool is its
**trading sibling**: it takes that same dealer-gamma picture and turns it into an
actionable **playbook**, mirroring the three strategies a professional gamma
trader actually deploys (from the "ultimate guide to gamma" transcript this brief
was built against):

1. **JEX / gamma-flip waterfall** — the first close from positive gamma into
   negative gamma after an extended rally. Below the flip dealers hedge *with* the
   move (sell weakness, buy strength), so a break can waterfall. Two sub-trades:
   the **opening-drive short** (opening-range / pre-market-low break) and the
   **afternoon roll** (short the 11am–1pm chop-bounce while price holds under the
   flip).
2. **OVI — Option Volume Imbalance** — the transcript's proprietary tool solving
   gamma's one blind spot: open interest is a day old, only *volume* is real-time.
   OVI weights each contract's **volume** by its gamma, nets calls vs puts into a
   **ratio** (direction/quality) and a **weighted quantity** (impact), and ranks
   the impact as a **percentile** against history. High percentile + strong ratio
   = the rare, dealer-hedge-forcing breakout flow.
3. **Gamma × time / expiration cycle** — into an OPEX, dealer gamma gets more
   time-sensitive, so price either **pins** (max-pain magnet, compression) or, if
   an overextended move snaps, **waterfalls**. Includes the transcript's finding
   that overextension bottoms cluster on **Thursday/Friday** into the Friday
   expiration, and the quarterly-OPEX 14-/30-day windows (shakeout vs max-pain
   phase).

Same ethos as every Research Lab tool: one self-contained HTML file, no build
step, hand-drawn canvas charts, everything computed in-browser from data you
fetch on demand, and the shared key + shared data layer so **nothing is
re-fetched**.

---

## Why a separate tool (not just more panels on the Options Lab)

The Options Lab answers *"where is support/resistance and is the regime pin or
trend?"* — a **structure/mapping** question, read once. This tool answers
*"what do I do about it today, and how hard?"* — a **decision/timing** question,
steered by trader preference. Different actor, different job:

| | Options Structure Lab | Gamma Trading Lab (this) |
|---|---|---|
| Question | Where are the levels &amp; what's the regime? | Which gamma trade is live &amp; what's the plan? |
| Output | A labeled structure map | A steerable recommendation + the 3 playbooks |
| Time axis | A single snapshot | Days-in-regime + OVI percentile *history* + OPEX clock |
| Novel data | GEX, walls, flip, max pain | **OVI** (gamma-weighted option *volume*), regime *tenure*, OPEX *phase* |
| Simple mode | one structure verdict | an **interactive model** (stance / aggressiveness / horizon levers) |

They share the same fetched chain via the shared cache, so running one primes the
other.

---

## Outcome Contract

- **Intent.** Give a gamma-aware trader a fast, honest, in-browser read of **which
  dealer-gamma playbook is live today** (JEX-flip waterfall, OVI breakout, or the
  expiration pin/overextension), steerable by their own stance/aggressiveness/
  horizon, with a concrete trigger, invalidation and risk-based size — without
  leaving the page or paying a vendor.
- **Success signal.** For a liquid optionable ticker (SPY, QQQ, NVDA, TSLA), after
  one read the tool renders: a gamma-environment badge (positive/negative + the
  flip), a net-gamma-by-strike chart, an OVI ratio + percentile (once a few days
  of history accrue), an OPEX clock with phase, the three playbooks marked
  live/watch/dormant, and **one steerable recommendation card** — *"Playbook A ·
  JEX-flip waterfall — press the short · confidence 64 · trigger … · invalidation
  reclaim the flip $X"* — that visibly changes when the user moves the stance /
  aggressiveness / horizon levers.
- **Hard constraints.** (1) All gamma/OVI math is transparent and recomputed
  in-browser from the fetched chain — no stored/blackbox numbers. (2) The
  dealer-gamma **sign convention** is a documented, user-toggleable global (Power)
  and matches the Options Lab so the shared snapshot never disagrees; the persisted
  shared snapshot is never re-signed. (3) OVI is explicitly a **gamma-weighted
  option-volume proxy**, never real-time aggressor/dark-pool flow; the percentile
  is small-sample and in-sample. (4) No new provider or proxy beyond the shared
  Yahoo→proxy chain + the shared Twelve Data key. (5) Simple and Power are
  **fully different surfaces** — Simple is an interactive high-level model with
  three levers + a recommendation; Power is the full quant dashboard with every
  chart, threshold and the raw snapshot.
- **Failure condition.** The tool is a failure if it presents dealer-gamma or OVI
  as *fact* rather than a **convention-dependent estimate**, implies real-time flow
  it does not have, gives a confident directional call from a wrong/ambiguous sign
  convention, or ships a "Simple" mode that is merely the Power dashboard with
  panels hidden. Modest and correct beats pretty and misleading.

---

## Actors &amp; Personas

| Actor | Description | Key goal | Reads first |
|---|---|---|---|
| **JEX-flip / waterfall trader** | Trades the positive→negative gamma flip | "Have we just flipped negative after a long positive run? Press the short?" | Regime badge + days-in-regime + Playbook A |
| **OVI / flow-breakout trader** | Rides real-time option-volume imbalance | "Is the flow historically significant and one-sided enough to force hedging?" | OVI ratio + percentile + Playbook B |
| **OPEX / expiration trader** | Trades the gamma-time pin or overextension | "Are we pinning into OPEX, or is something overextended into Friday?" | OPEX clock + pin strength + Playbook C |
| **"What do I do today?" trader** | Wants one steerable decision | "Given my stance and horizon, which play and what's the plan?" | Simple cockpit + recommendation card |
| **Quant / power user** | Wants every lever &amp; the raw math | "Show me GEX by strike, the OVI history, the sign toggle, the snapshot." | Power dashboard |
| **Educational / self-learner** | Learning dealer gamma | "What actually is the flip, OVI, and the expiration cycle?" | Footer methodology + each panel caption |

Non-actors (explicitly out of scope): a real-time Level-2/flow tape reader, a
multi-leg options P/L builder (that is OptionStrat's job), an order router, anyone
needing sub-15-min data or true trade-level aggressor side.

---

## Domain Capability Model (AN5 — capability-first)

Adds a **strategy/playbook** capability on top of the Options Lab's **structure**
capability; both consume the same `Snapshot` primitive via the shared layer.

**Primitives**

- **Snapshot** — one fetched option chain for an underlying → `{spot, netGEX,
  flip, callWall, putWall, maxPain, pcOI, atmIV, oi{K:{c,p}}, gexRows[{K,gex}],
  ovi, oviQty, callVol, putVol}`. Read from / mirrored to the shared `rlData.options`
  (`optSnaps`) store, so it is provider- and tool-agnostic.
- **Regime** — `{env: positive|negative, flip, netGEX}` from spot-vs-flip under the
  active sign convention.
- **RegimeTenure** — `{daysInRegime, flippedToday, priorRun}` from the rolling
  per-ticker daily history (`gammaHist` in localStorage). The **first negative-gamma
  close after ≥N positive days** is the JEX-flip trigger.
- **OVI** — `{ratio ∈ [−1,1], weightedQuantity, percentile}` = Σ(gamma·callVol)
  vs Σ(gamma·putVol), the quantity ranked against the ticker's snapshot history.
- **OpexClock** — `{daysToMonthly, daysToQuarterly, nearest, phase ∈
  {shakeout(14–30d), maxpain(≤14d), open}, pinStrength}` from third-Friday date
  math + max-pain distance + gamma magnitude.
- **Playbook** — one of `{A: JEX-flip waterfall, B: OVI breakout, C: expiration
  pin/overextension}` with `{live, watch, dormant, dir, score, why}`.
- **Verdict** — the chosen playbook + `{trigger, invalidation, entry, stop,
  targets, R:R, confidence}`, selected by the Simple **levers** (stance /
  aggressiveness / horizon).

**Lifecycle:** `Underlying → read Snapshot (shared or fresh) → push to history →
Regime + RegimeTenure + OVI(+percentile) + OpexClock → evaluate 3 Playbooks →
choose Verdict by levers → render`.

**Provider-neutral behavior:** the Snapshot comes from the shared store or a fresh
Yahoo chain; all gamma/OVI/OPEX math is provider-agnostic. OVI additionally needs
per-contract **volume** (present on a fresh Yahoo fetch; a shared snapshot that
predates OVI degrades to "Refresh for live OVI").

**Business policies (invariant):**

1. A playbook is never marked *live* without the evidence (`why`) that qualified
   it, so the recommendation can always explain itself.
2. The dealer-sign convention is a single global that the environment read, the
   flip, the GEX chart and every playbook share — they can never disagree; the
   persisted shared snapshot is never re-signed.
3. OVI is always labeled a gamma-weighted *option-volume* proxy with a
   small-sample percentile, never real-time aggressor flow.
4. Simple and Power are different surfaces, not the same panels toggled.

---

## Use Cases

### UC-001 — Catch the JEX-flip waterfall

- **Actor:** JEX-flip trader. **Precondition:** a liquid index/mega-cap with a few
  days of history. **Main flow:** read the ticker; the tool computes the
  environment and days-in-regime; if the latest close is the **first negative-gamma
  close after ≥3–5 positive days**, Playbook A goes *live* and the recommendation
  is the opening-drive short + afternoon-roll plan under the flip. **Postcondition:**
  a short plan with the flip as invalidation.

### UC-002 — Rank the option-volume flow (OVI)

- **Actor:** OVI trader. **Main flow:** on a fresh read the tool weights each
  contract's volume by gamma, nets call vs put into a ratio, and ranks the weighted
  quantity as a percentile against the ticker's snapshot history; a high percentile
  - a strong one-sided ratio flags Playbook B (flow breakout in the ratio's
  direction, entering on the wall break). **Alt flow:** <3 days of history → the
  percentile shows "need ≥3 days"; the raw ratio still displays.

### UC-003 — Trade the expiration cycle

- **Actor:** OPEX trader. **Main flow:** the tool maps the monthly + quarterly
  third-Friday OPEX, the 14-/30-day windows, and a max-pain-anchored pin strength;
  inside the max-pain window with positive gamma → Playbook C recommends fading the
  range toward max pain; a Thu/Fri overextension (large recent move + high IV) →
  Playbook C flips to a capitulation-reversal into the expiration.

### UC-004 — Steer the model (Simple)

- **Actor:** "what do I do today" trader. **Main flow:** move the **stance**
  (with/neutral/against the dealers), **aggressiveness** (how weak a read triggers)
  and **horizon** (intraday vs into-OPEX) levers; the recommendation card and
  chosen playbook recompute live with no re-fetch; size it from the invalidation
  with the account/risk inputs.

### UC-005 — Inspect every lever (Power)

- **Actor:** quant. **Main flow:** read the net-gamma-by-strike chart, the OVI
  percentile history, the full OPEX ladder + KPIs, the playbook table, the
  dealer-sign toggle, and the raw shared snapshot.

---

## Business Scenarios

- **BS-001 — First negative-gamma close is flagged.** Given a ticker that closed
  positive-gamma for ≥5 days and today prints its first negative-gamma close, when
  the read completes, then Playbook A is *live*, "just flipped" shows on the regime
  gauge, and the recommendation is the JEX-flip waterfall short with the flip as
  invalidation.
- **BS-002 — OVI needs history, and says so.** Given <3 cached daily snapshots for
  the ticker, when OVI renders, then the ratio shows but the percentile reads "need
  ≥3 days" and Playbook B stays *watch*, never fabricating a percentile.
- **BS-003 — Levers change the call.** Given the same snapshot, when the user
  switches stance from "with" to "against" and raises aggressiveness, then a
  directional playbook (A or B) can overtake the pin play and the recommendation
  card + confidence update live with no network call.
- **BS-004 — Pin into OPEX.** Given positive gamma inside the 14-day max-pain
  window, when the read completes, then Playbook C recommends fading the range
  toward max pain and warns against chasing breakouts until OPEX clears.
- **BS-005 — Sign convention is honest.** Given the Power dealer-sign toggle is
  flipped, when the environment re-classifies, then the GEX chart, flip line and
  every playbook flip consistently, a note explains the shared snapshot is not
  re-signed, and nothing silently disagrees.
- **BS-006 — Nothing lines up.** Given positive gamma, a thin OVI history and an
  open OPEX window at low aggressiveness, when the verdict resolves, then it reads
  "Stand aside — no gamma edge today" rather than forcing a low-conviction trade.

---

## Data-source feasibility (reuses the existing stack — no new provider)

| Need | Source | Notes |
|---|---|---|
| Dealer-gamma snapshot (walls/flip/GEX/max-pain) | **shared** `rlData.options` / `optSnaps`, else fresh Yahoo `v7/finance/options/<sym>` | reused from the Options Lab with no re-fetch; mirrored back after a fresh read |
| Per-contract **volume** (for OVI) | fresh Yahoo option chain (`.volume` per contract) | only on a live fetch here; a shared snapshot predating OVI degrades to "Refresh" |
| Greeks (gamma) | computed in-browser (Black-Scholes) from chain IV | same `bsmGamma` as the Options / Swing labs |
| Days-in-regime + OVI percentile | rolling `gammaHist` in localStorage (per ticker, ≤160 days) | one snapshot per day; accrues with use — no paid history API |
| OPEX dates | computed locally (third-Friday date math) | monthly + quarterly (Mar/Jun/Sep/Dec) |
| VIX context | **shared** `rlData.macro` | best-effort; degrades silently |

Index options (`^SPX`/`^NDX`) frequently do **not** resolve on the public Yahoo
endpoint — the tool (and this universe) steer to the **ETF proxies** (SPY/QQQ),
which the transcript itself recommends ("reference the S&amp;P 500 complex").

---

## Simple vs Power (the "fully different" requirement)

- **Simple = an interactive high-level model to play with.** A cockpit with three
  levers — **stance** (with / neutral / against the dealers), **aggressiveness**
  (how weak a read you'll act on) and **horizon** (intraday 0DTE vs into-OPEX
  swing) — plus account/risk sizing. It outputs **one steerable recommendation**
  (the chosen playbook, plan, invalidation, confidence, size) and three compact
  gauges (gamma regime, OVI, OPEX clock). Moving a lever recomputes the
  recommendation live, with **no re-fetch**. This mirrors the AI Capex Lab's
  Simple mode (opinionated, playable, decision-first) — it is **not** the Power
  dashboard with panels hidden.
- **Power = the full quant dashboard.** Net-gamma-by-strike canvas, OVI percentile
  history canvas, the OPEX ladder + regime KPIs, the three-playbook evidence
  table, the dealer-sign convention toggle, and the raw shared snapshot.

---

## Build checklist (what shipped)

1. Copy-pasted shared `rlKeys()` / `rlMigrate()` and the `RLDATA` accessor
   (options/macro) from the sibling tools — same shared key + data contract.
2. Extended the Options Lab's `computeOptLevels` into `computeGamma` — adds
   per-strike GEX rows and the gamma-weighted OVI (ratio + quantity + raw volume).
3. Added the rolling per-ticker `gammaHist` (days-in-regime + OVI percentile) with
   a ≤160-day cap.
4. Implemented the OPEX clock (monthly + quarterly third-Friday math), pin strength
   and the Thu/Fri overextension flag.
5. Implemented the three playbooks + the lever-driven verdict chooser.
6. Simple cockpit (three levers + recommendation + gauges, delegated event wiring,
   no re-fetch on lever change); Power dashboard (2 canvases + KPIs + tables +
   sign toggle + snapshot).
7. Registered in `index.html` TOOLS, `tools.json`, `README.md`, `notes/README.md`,
   and the shared `.rlnav` in all tools; added `gamma-trading-universe.json`.
8. Validated: JS parses (`new Function` on the inline script); canvases draw
   synchronously in `render()` (never wrapped in `requestAnimationFrame`, so they
   paint in hidden/background tabs).

---

## Version history

- **v1.0 (2026-07-03)** — Built &amp; registered. The JEX-flip waterfall, OVI
  (gamma-weighted option-volume imbalance, percentile-ranked), and the gamma×time
  expiration cycle, on top of the shared Options Lab snapshot; a fully interactive
  Simple cockpit distinct from the Power dashboard. Reuses the shared keys + data
  layer (no re-fetch).
