# Strategy Validation & Real-Data Walk-Forward Lab — **SHIPPED (v1)**

> **Status: SHIPPED (v1) · registered · live.** The tool exists at
> [`strategy-validation-lab.html`](../strategy-validation-lab.html) (+ `strategy-validation-universe.json`
> and a self-test group), passes the repo self-test (118/118), and is registered across all five
> surfaces (`index.html` / `tools.json` / `README.md` / `notes/README.md` / `rlnav.js`) with the
> registry reconcile (index == nav == tools.json) green. This brief captures a guided-journey
> finding: research-lab has a *discipline tutor* ([strategy-self-improvement-lab](../strategy-self-improvement-lab.html),
> synthetic) and a fleet of *real-data signal readers* (sector / gamma / swing / intraday /
> options / smart-money), but **nothing connects them** — no tool takes a rule + **real** data
> and runs walk-forward out-of-sample validation on it. This tool is that missing middle: the
> **real-data sibling** of the self-improvement lab, now shipped and registered.

## Why this exists (the gap it closes)

The honest chain from "an idea" to "a trade" is:

```
internalize the discipline   → strategy-self-improvement-lab   ✅ exists (SYNTHETIC)
apply it to REAL data        → ❌ THIS TOOL closes the gap
a rule that survives OOS      → produced here, on real history
size / risk / trade           → out of scope (see Non-goals)
```

The signal readers answer *"what does the market look like right now?"*. This tool answers the
question they can't: *"if I mechanize an idea, does its edge survive out-of-sample on real
history — or am I curve-fitting?"* It is the **enforcement arm** the discipline tutor lacks.

## What it computes

1. **A mechanical rule on a REAL instrument (or basket)** — MVP reuses the self-improvement lab's
   transparent rule verbatim so the engine is identical: long/flat when `fastMA > slowMA` **and**
   `momentum > 0`; exposure `= clamp(volTarget / realisedVol, 0, maxLeverage)`; trailing stop to
   cash on `stopDd` from the in-position peak.
2. **The same explicit goal scorecard** (PASS/FAIL): target CAGR, Sharpe floor, max-DD ceiling,
   min time-in-market — judged on the **out-of-sample** path only.
3. **A real-data walk-forward verdict** — the same `HEALTHY → WATCH → OVERFIT` IS−OOS meter, now
   on data the (optional) tuning never saw.
4. **A real-data "not luck" gate** — replaces the synthetic lab's *N-seed* robustness (you only get
   one real history) with the real-data analogs in Methodology below.

## Methodology — reuse vs real-data deltas

**Reuse unchanged from [strategy-self-improvement-lab](../strategy-self-improvement-lab.html)**
(lift the functions, do not re-derive): the no-look-ahead indicators, the strategy, the metrics
(CAGR / annualised vol / Sharpe / max-DD / time-in-market / hit-rate), `walkForward` (folds,
`trainRatio`, stitched-OOS scorecard), and `scorePass` / `allPass`.

**Replace** `genSeries` (synthetic `mulberry32` regime path) **with real daily adjusted-close bars**
(~5y) from the shared data layer. Everything downstream is identical.

**Add the real-data rigor the synthetic lab doesn't need:**

- **Purged & embargoed folds** (López de Prado) — drop train rows whose look-back/label window
  overlaps the OOS block, plus an embargo gap, so overlapping windows can't leak.
- **Cross-instrument robustness** — the real-data analog of "held k/N seeds": run the *fixed* rule
  across an editable **basket** and report **held on k/N instruments** (an edge that works on one
  ticker only is luck). Bands mirror the sibling: `≥0.67 ROBUST · ≥0.34 MIXED · else FRAGILE`.
- **Rolling- vs anchored-origin** walk-forward as a second robustness axis.
- **Deflated Sharpe Ratio** (Bailey & López de Prado) — the real-data multiple-testing correction
  that replaces the synthetic lab's "luck-Sharpe scale": discount the best OOS Sharpe by the number
  of trials and by non-normality (skew / kurtosis). This is the honest *"is the Sharpe significant,
  or inside the luck band?"* read.

## Data layer & offline parity

- **Live:** reuse the shared multi-provider fetch — Yahoo (no-key, best-effort via
  `fetchTextViaProxy`) → Twelve Data (keyed) — ~5y daily bars cached in `localStorage`. Canonical
  source of that code: [notes/shared-data-layer.md](shared-data-layer.md) + `etf-momentum-lab.html`.
- **Offline / proxy-gated (hosted origins):** ship an inline `FALLBACK_UNIVERSE` **byte-identical**
  to `strategy-validation-universe.json` (the sibling's offline-parity discipline), plus a small set
  of **bundled real historical series** so the tool is fully usable + reproducible with no network.

## MVP scope (v1)

One rule (the sibling's), a chosen instrument + an editable basket for cross-instrument robustness,
the goal scorecard, purged walk-forward OOS verdict, held-k/N-instruments, and the deflated Sharpe.
Simple + Power views like the other labs; everything in-browser; editable universe.

## Non-goals (explicit — keeps "educational, not investment advice")

- **No order execution, no broker, no "signal of the day," no position sizing** beyond the rule's
  vol-target exposure — same boundary as the sibling. It validates a rule's *edge*; it does not
  place or recommend trades.
- **No large parameter optimizer.** If a tuning loop ships, it is the sibling's *one-variable-at-a-
  time* search with the same OOS accept rule, and the deflated Sharpe counts every trial — because
  brute-force search is exactly the overfitting this tool exists to catch.

## Open questions / knobs (need your call before build)

1. **Name / id** — `strategy-validation-lab` (proposed) · `real-data-walk-forward-lab` · other?
2. **MVP rule** — reuse the sibling's exact trend+momentum rule (fastest, engine-identical) or offer
   a small rule menu?
3. **Robustness axis for v1** — cross-instrument basket (recommended) · rolling-origin · both?
4. **Deflated Sharpe** — in v1, or defer to v2 (ship purged-OOS + cross-instrument first)?

## Validation plan (when built, per repo convention)

- Declare tool math as top-level `function` decls so `scripts/selftest.mjs` `extractFn` can pull them;
  add a `group(...)` for the new pure helpers (purged-fold indexer, deflated-Sharpe, held-k/N).
- `node -e` parse the `<script>` + `JSON.parse` the universe; assert `FALLBACK_UNIVERSE` ≡ the JSON.
- Only after the HTML ships: register in `index.html` TOOLS, `tools.json`, `README.md`,
  `notes/README.md`, and add the shared `.rlnav` drawer.

## Version history

- **v1 (2026-07-05) — BUILT.** Shipped `strategy-validation-lab.html` + `strategy-validation-universe.json`
  and added the `strategy-validation-lab` self-test group (106/106 pass). Engine (backtest / metrics /
  walkForward / scorePass / allPass) lifted from the self-improvement lab with `genSeries` replaced by
  `seriesFromCloses` (real bars); fetch layer + `deflatedSharpe` lifted from etf-momentum-lab; new:
  embargoed folds, cross-instrument held-k/N, and a labelled synthetic-demo offline path. Deflated Sharpe
  was pulled INTO v1 (etf-momentum already implements it) rather than deferred. Offline parity verified
  (FALLBACK_UNIVERSE ≡ universe.json). Browser-rendered clean. Registered across all 5 surfaces; registry reconcile (index == nav == tools.json) green.
- **v0 (2026-07-05) — PROPOSED.** Brief captured from a guided journey (goal: make the discipline
  tool actually useful toward trading, within research-lab). Not built; not registered.
