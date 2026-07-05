# Strategy Self-Improvement & Walk-Forward Lab — Methodology Notes

> **Handoff for the next run.** This tool is the *honest* version of the viral
> "self-improving trading agent" idea: it keeps the good parts (explicit numeric
> goal, change-one-variable scientific-method loop, learn-from-outcomes) and adds
> the guardrail those demos skip — **out-of-sample walk-forward scoring** plus a
> **multiple-testing / overfitting discount**. Everything is synthetic and
> deterministic; no live data.

## Purpose & what it computes

A single-file, offline lab that demonstrates a defensible self-improvement loop:

1. **Explicit goal scorecard** (numbers, not vibes): target CAGR, Sharpe floor,
   max-drawdown ceiling, minimum time-in-market. Each is a hard PASS/FAIL.
2. **A transparent rule strategy** on a synthetic index — long/flat trend +
   momentum with vol-targeted exposure and a trailing stop. Six levers.
3. **A scientific-method search**: change exactly **one lever at a time**, score
   every candidate, and accept only the change that most improves the
   **out-of-sample** objective by at least an accept-margin without blowing up
   the in-sample→out-of-sample gap. Accepted steps become the new baseline and
   accrue in a per-scenario `localStorage` ledger.
4. **Overfitting meter**: mean in-sample vs out-of-sample Sharpe, the IS−OOS gap
   (HEALTHY / WATCH / OVERFIT), and a search-breadth "luck-Sharpe" scale that
   grows with the number of candidates evaluated.

The verdict, scorecard, and all headline stats are judged on the concatenated
**walk-forward out-of-sample** segments — never on the fitted in-sample path.

## Model math / methodology

- **Synthetic paths** — deterministic PRNG (`mulberry32`) + Box–Muller gaussian
  drive a regime-switching geometric process: per day, log-return
  `r = (μ/252 − ½σ²/252) + (σ/√252)·z`. Regimes are `{frac, muAnnual, sigAnnual}`
  segments. Same `seed` ⇒ same path (reproducibility, the "accuracy" pillar).
- **Indicators (no look-ahead)** — fast/slow SMA via price prefix sums; momentum
  = `px[i]/px[i−lookback] − 1`; realised vol = annualised std of the trailing
  20-day **past** returns. The decision at close `i` uses only data through `i`
  and earns the forward return `px[i+1]/px[i] − 1`.
- **Strategy** — go long when `fastMA > slowMA` **and** `momentum > 0`; exposure
  = `clamp(volTarget / realisedVol, 0, maxLeverage)`; a trailing stop flattens to
  cash when equity falls `stopDd` from its in-position peak and re-arms on the
  next flat signal.
- **Metrics** — CAGR (annualised from terminal equity), annualised vol, Sharpe
  (rf = 0), max drawdown, time-in-market, hit-rate.
- **Walk-forward** — the usable range (after warm-up) is split into `folds`
  contiguous blocks; each block is `trainRatio` in-sample / remainder
  out-of-sample. Headline OOS Sharpe = mean of per-fold OOS Sharpes; scorecard
  metrics = the stitched OOS equity path.
- **Accept rule** — a candidate is accepted iff `OOS_cand > OOS_base + acceptMargin`
  **and** `(IS_cand − OOS_cand) ≤ oosGapTolerance`.

## Levers, defaults & scenarios

| Lever | Default | Range (min/max/step) |
|---|---|---|
| Fast MA (days) | 20 | 5 / 60 / 5 |
| Slow MA (days) | 100 | 50 / 250 / 10 |
| Momentum lookback (days) | 120 | 20 / 250 / 10 |
| Vol target (annualised) | 0.15 | 0.05 / 0.35 / 0.025 |
| Trailing stop (draw-down) | 0.15 | 0.05 / 0.40 / 0.025 |
| Max exposure | 1.5× | 0.5 / 3.0 / 0.25 |

Goal defaults: CAGR ≥ 12%, Sharpe ≥ 1.0, max DD ≤ 20%, time-in-market ≥ 25%.
Walk-forward defaults: 5 folds, 0.6 train ratio, 0.05 accept-margin, 0.8 gap
tolerance. Scenarios: `trending-bull`, `choppy-range`, `boom-bust-recovery`,
`secular-grind` — all editable in
[`../strategy-self-improvement-universe.json`](../strategy-self-improvement-universe.json).

## Key findings to carry forward

- The single most important lesson the tool teaches: **an "improvement" that only
  shows up in-sample is not an improvement.** Watch the IS−OOS gap.
- `choppy-range` is the honest stress test — trend rules overfit fastest there,
  so the gap widens and few single-lever changes survive OOS.
- Change the **seed** and re-run: a lever value that helps on one seed but not
  others is luck, not edge (a poor-man's robustness check).

## Known limitations / simplifications

- Synthetic, stationary-within-regime data with **no costs, slippage, capacity,
  or real non-stationarity**. Real markets are harder.
- The search is greedy single-lever hill-climbing; it finds *a* local optimum,
  not the global one (by design — it mirrors the scientific method).
- The "luck-Sharpe" figure is an intuition scale, not a rigorous deflated-Sharpe
  significance test.

## Next-run checklist

- [ ] Re-verify scenario regime params still produce the intended market shapes.
- [ ] Consider adding a transaction-cost lever (bps per exposure change) to show
      how costs punish over-trading found by the search.
- [ ] Consider a "multi-seed robustness" button that scores a candidate as the
      *mean/worst OOS across N seeds* before accepting (stronger overfit guard).
- [ ] Optionally allow pasting a real return series in place of synthetic data
      (keep the synthetic default; label live data clearly).

## Version history

- **2026-07-05** — v1: initial release. Six-lever trend/momentum rule, goal
  scorecard, one-variable walk-forward improvement loop, overfitting meter,
  per-scenario localStorage ledger, Simple + Power views.

## How to edit, validate & ship

- Tune scenarios/goal/lever ranges in
  [`../strategy-self-improvement-universe.json`](../strategy-self-improvement-universe.json)
  and keep the inline `FALLBACK_UNIVERSE` in the HTML identical (offline parity).
- Open `strategy-self-improvement-lab.html` directly (`file://`) to validate — it
  needs no server and makes no network calls for computation.
- Registered in [`../index.html`](../index.html) `TOOLS`, [`../tools.json`](../tools.json),
  and [`../README.md`](../README.md).
