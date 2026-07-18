# Volatility Regime & Vol-Targeting Sizing Lab — notes

Tool id: `volatility-sizing-lab` · File: [`../volatility-sizing-lab.html`](../volatility-sizing-lab.html) · Data: [`../volatility-sizing-universe.json`](../volatility-sizing-universe.json) · Capability: `rlvol.js` (RLVOL)

Educational research only — **not** investment advice. The model forecasts **magnitude only** and carries **zero** directional information.

## Purpose & what it computes

Research Lab measures *realized* risk in several tools ([etf-momentum-lab](../etf-momentum-lab.html)) and tests vol-targeting as a *strategy lever* ([strategy-validation-lab](../strategy-validation-lab.html)). This tool owns the one uncovered primitive: a forward **conditional-volatility forecaster**, a window-relative **volatility regime percentile** ("storm gauge"), a **persistence / half-life** decomposition, and a **capped, conditional vol-targeting sizing multiplier**. It publishes one normalized owner read that [market-brief](../market-brief.html) consumes without recomputing the model, and it deep-links the "does vol-targeting make money" question to the more rigorous Strategy Validation Lab rather than re-implementing a backtest.

The tool is a Simple/Power projection of one immutable `VolDecisionReadV1` produced by the pure `rlvol.js` (RLVOL) capability:

- **Simple** — a storm-gauge cockpit: the one-day-ahead annualized forecast, the regime band as a percentile that **always** shows its trailing window and observation count, a one-line conditional sizing suggestion, provenance chips, and a backtest CTA.
- **Power** — the forecast term structure, the persistence/half-life panel, the EWMA-vs-GARCH comparison, the full sizing card (with the visible `min(cap, targetVol/max(floor, forecastVol))` expression and a worked cash example), a provenance ledger, the backtest hand-off, and the owner-read link.

## Verified source data

- Daily bars come from the **existing** shared `rldata.js` cache (`ensureBars`/`getBars`, cache-first, automatic delta hydration, `range "5y"` default). Same-origin snapshots live under [`../data/bars/`](../data/bars/). RLVOL never fetches; the page adapts cached bars into RLVOL inputs.
- A longer-history control (`10y`/`max`) is Yahoo-only, **best-effort**, and clearly caveated — no multi-decade single-path outperformance number is ever reproduced as evidence of edge.

## The model math (RLVOL)

- **Log returns**: `ln(cₜ/cₜ₋₁)` on finite positive closes; a gap drops that single return.
- **EWMA / RiskMetrics** (the default estimator): `σ²ₜ = λ·σ²ₜ₋₁ + (1−λ)·r²ₜ₋₁`, `λ = 0.94` (policy). EWMA is integrated, so it has **no** finite long-run variance and its multi-day forecast is **flat** — stated honestly.
- **GARCH(1,1)** (optional, **labeled lightweight optimizer** — never MLE): a bounded, capped-iteration, variance-targeting grid search that enforces stationarity `α+β < maxPersistence`. Non-convergence → `FIT_NONCONVERGENT` → the labeled EWMA closed-form fallback. GARCH's term structure decays geometrically toward `ω/(1−α−β)`.
- **Annualization**: `σ_ann = σ_daily × √252` (factor stated on every displayed volatility).
- **Realized volatility** (typed `realized`, never relabeled `forecast`): sample std of daily returns over a rolling window × √252.
- **Regime percentile**: `p = 100 × #{h ≤ current} / |history|` against a **declared** trailing window (`windowRef` with observation count + start/end dates). `regimeBand` maps `p` to `calm/normal/elevated/storm`.
- **Persistence / half-life**: `t½ = ln(0.5)/ln(persistence)` where persistence is `λ` (EWMA) or `α+β` (GARCH).
- **Managed suppression**: a peg/band/halt heuristic (zero-return fraction, sub-floor daily range, identical-close run) that marks a low-vol read `MANAGED_SUPPRESSED` and withholds sizing — never "calm/full size".
- **Sizing multiplier**: `m = min(cap, targetVol / max(floor, forecastVol))` — cap `2.0`, forecast-vol floor `0.05` (policy). `forecastVol → 0` hits the cap, never infinity. Conditional: "apply only if a separate signal fires"; no account currency size, no order.

## Input levers, defaults & presets

| Lever | Default | Notes |
| --- | --- | --- |
| Asset | first universe asset | from `volatility-sizing-universe.json` |
| Mode | Simple | Simple cockpit / Power detail — one computation, cannot disagree |
| Estimator | EWMA | EWMA closed-form default; GARCH(1,1) optional labeled optimizer |
| Term length | 21 days | `1..maxHorizonDays` (63) |
| Target vol | per-asset `defaultTargetVol` | the controlled account-risk variable (user-assumption) |
| Notional | user-entered | worked-example illustration only; never a real-account size |
| History range | 5y | `10y`/`max` best-effort, caveated |

Policy values (`λ`, seed window, GARCH bounds, regime thresholds `25/75/95`, sizing cap/floor, managed-suppression heuristics, history) are **required versioned research policy** in the universe file — not code fallbacks.

## Key findings to carry forward

- ~60% of the source "GARCH / storm gauge" retail method is already in Research Lab; the differentiated primitive is the **forecaster + regime + capped sizing**, delegating the backtest by deep-link.
- Persistence is why the one-day forecast is informative and why the GARCH term decays slowly — present it honestly, never as directional prediction skill.
- EWMA and a fitted GARCH can disagree; that disagreement is an explicit `EWMA_GARCH_PERSISTENCE_DIVERGENCE` conflict, shown, **never averaged**.

## Known limitations / simplifications

- Browser-side GARCH is a **lightweight optimizer**, not `arch`/R-grade MLE.
- Default 5y reach (~1,250 daily bars) is statistically fine but is **not** the source method's 15y/50y/150y claims; long history is best-effort.
- Daily-close model — it does not observe intraday gaps; single names can gap on earnings.
- Managed/pegged/halt-suppressed low volatility is a limitation, not a green light for full size.

## Next-run checklist

- Re-verify universe assets + per-asset `defaultTargetVol` / `regimeWindowObs` / `minForecastObs` / `reviewWindowHours` in `volatility-sizing-universe.json`.
- Sanity-check EWMA-vs-GARCH persistence on a known calm and a known storm asset after a fresh fetch.
- Confirm the managed-reference (`CNY=X`) read stays marked managed-suppressed and never full-size.
- Confirm the backtest CTA remains a **deep-link** into `strategy-validation-lab.html` (never an in-tool verdict).
- Confirm Simple and Power render one `decisionId` and never disagree.

## Version history

- **v1 (2026-07-17)** — Initial release: RLVOL foundation (`rlvol.js`), the Simple storm-gauge + Power model/persistence/sizing tool, the closed universe, and the Market Brief owner read.

## How to edit, validate & ship

1. Edit the universe (`volatility-sizing-universe.json`) or the RLVOL contract (`rlvol.js`); the page is a projection of one `VolDecisionReadV1`.
2. Validate the math + registry + owner read: `node scripts/selftest.mjs`.
3. Validate the browser route: `npx --no-install playwright test tests/volatility-sizing-lab.spec.mjs --reporter=list`.
4. Ship the single self-contained `volatility-sizing-lab.html` (no build, no external CDN, works from `file://`).
