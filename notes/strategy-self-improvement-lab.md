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
- **Multi-seed robustness check (🎲 Run across N seeds)** — a read-only diagnostic
  that scores the **fixed current rule** (`state.improved` if the search has run,
  else the `state.baseline` levers — *not* a per-seed re-search) across `N`
  different synthetic seeds of the **same** scenario regimes (**default N = 9**,
  clamped to 2–20). The seed set is
  deterministic and reproducible: seed #1 is the current `#seed` value, then a
  fixed 32-bit LCG (`s = (s·1664525 + 1013904223) mod 2³²`, Numerical Recipes
  constants) derives the remaining `N−1` distinct seeds — so the **same base seed +
  same N ⇒ the identical seed set ⇒ the identical result**. For each seed it rebuilds
  the path with the existing `genSeries` and re-scores with the existing
  `walkForward`; a seed **“held”** iff the goal scorecard **all-passes** on that
  seed's OOS — the *same* `allPass(scorePass(wf.oos, goal))` basis the on-screen
  verdict uses, and the per-seed OOS Sharpe shown is `wf.oos.sharpe` (identical to
  the value in the single-seed verdict for that seed). **“Held k/N”** is the count of
  seeds that all-passed. The verdict bands on `k/N`: **≥ 0.67 → ROBUST**,
  **≥ 0.34 → MIXED**, **else FRAGILE** (“likely luck, not edge”). It also reports the
  **mean** and **worst** OOS Sharpe across the N seeds. Because the binary held-count
  is a **step function** that ties different-quality rules at small N, the headline
  adds a **continuous *Signal* read** alongside the held-k/N badge: the mean OOS
  Sharpe relative to the (user-editable) goal **Sharpe floor** (`state.goal.sharpeFloor`,
  the same field `scorePass` uses), banded `mean/floor ≥ 1.0× → strong ·
  ≥ 0.5× → moderate · else weak`. That continuous ratio is the reliable discriminator
  when two rules tie on the integer held-count. Because it reuses the engine
  verbatim and touches no global state (`trials`, `improved`, the ledger, the
  series `S` are all untouched), it changes nothing about the single-seed flow — it
  is purely a “did this edge only show up on the one seed you optimised?” probe.

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
- **`boom-bust-recovery` (seed 777) is the clearest honest stress test.** The
  trend rule overfits there — mean IS Sharpe **+0.14** vs mean OOS Sharpe
  **−1.34** (IS−OOS gap **+1.47 → OVERFIT**), and **no single-lever change
  survives out-of-sample** on the default seed. In-sample gains vanish OOS, which
  is exactly the failure mode the tool exists to expose.
- `choppy-range` (seed 2024) is whippy but **not** a clean overfitting demo on its
  default seed: the baseline gap is HEALTHY (−0.28) and three single-lever changes
  still survive OOS. Change the **seed** to watch trend rules break there — don't
  overclaim from one seed.
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
- [x] Consider a "multi-seed robustness" button that scores a candidate as the
      *mean/worst OOS across N seeds* before accepting (stronger overfit guard).
      **Shipped in v3 (P3)** as 🎲 *Run across N seeds* — a read-only diagnostic that
      scores the fixed current rule across N deterministic seeds and reports held
      k/N with ROBUST/MIXED/FRAGILE bands (it does not gate the accept logic).
- [ ] Optionally allow pasting a real return series in place of synthetic data
      (keep the synthetic default; label live data clearly).

## Version history

- **2026-07-05** — v3: **P3** — added the 🎲 *Run across N seeds* multi-seed
  robustness check (additive; no computation change to the single-seed flow). It
  scores the **fixed current rule** (`state.improved || state.baseline`, no
  per-seed re-search) across `N` deterministic seeds of the same scenario — seed #1
  is the `#seed` value, the rest derived by a fixed 32-bit LCG so the same base +
  same N reproduce the identical seed set. “Held k/N” reuses the on-screen verdict's
  `allPass(scorePass(wf.oos, goal))` basis and the `wf.oos.sharpe` OOS measure, so a
  per-seed ✓ matches what the single-seed verdict would show for that seed. Verdict
  bands: `k/N ≥ 0.67` ROBUST · `≥ 0.34` MIXED · else FRAGILE, plus mean/worst OOS
  Sharpe and a per-seed mini-table. The **default seed count is 9** (clamped 2–20),
  and the result headline adds a **continuous *Signal* read** alongside the binary
  held-k/N badge — mean OOS Sharpe vs the editable goal Sharpe floor
  (`state.goal.sharpeFloor`): **strong ≥ 1.0×**, **moderate ≥ 0.5×**, else **weak** —
  because the integer held-count is a step function that ties different-quality rules
  at small N, whereas the continuous mean/floor ratio discriminates them. Diagnostic
  only — it never writes the ledger and
  never mutates `trials`/`improved`/`S`, so P1/P2/P4 and the accept logic are
  unchanged. Engine (`genSeries`/`backtest`/`metrics`/`walkForward`/`scorePass`/
  `allPass`) reused verbatim; `FALLBACK_UNIVERSE` kept byte-identical to the JSON.
- **2026-07-05** — v2: presentation/docs pass (no computation change; verdict
  decisions and rendered numbers are byte-identical for the same inputs).
  - **P1** — corrected the "honest stress test" claim from `choppy-range` to
    `boom-bust-recovery` (seed 777: gap +1.47 OVERFIT, 0 single-lever changes
    survive OOS) in these notes, and added a subtle in-tool onboarding hint by the
    scenario selector routing new users Trending bull → Boom → bust → recovery.
  - **P2** — the overfit meter now states whether the already-computed headline
    OOS Sharpe sits **inside** the luck-Sharpe band (not yet significant) or
    **clears** it, reusing the values the model already renders.
  - **P4** — reframed the binary verdict: a "N of 4 targets met — <metric> is the
    gap" sub-line on GOAL NOT MET (derived from the existing scorecard pass/fail),
    a one-time dismissible "How to read this" OOS-methodology callout
    (`localStorage` seen-flag), and auto-expansion of the Power view on the first
    Improve/Run click of a session.
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
