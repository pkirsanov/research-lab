# Technical Analysis Decision Lab — notes

Tool id: `technical-analysis-decision-lab` · File: [`../technical-analysis-decision-lab.html`](../technical-analysis-decision-lab.html) · Data: [`../technical-analysis-decision-universe.json`](../technical-analysis-decision-universe.json) · Spec: [`../specs/007-technical-analysis-decision-lab/spec.md`](../specs/007-technical-analysis-decision-lab/spec.md)

## What it is

One coherent technical-analysis **decision framework** (not another indicator dashboard). For a source-qualified stock it moves from **primary context → regime → location → trigger → expectancy** and returns one plain-language setup state: `NO EDGE` · `WATCH` · `ARMED` · `TRIGGERED` · `INVALIDATED` · `EXPIRED` (plus first-class `MIXED` / `UNAVAILABLE`).

- **Five-gate workflow** (a modern Dow/Wyckoff-informed synthesis, NOT Dow's historical "five principles"): context, location/asymmetry, confirmation, validation, risk. A setup can only become `TRIGGERED` when each gate passes under the active model definition — **never** by averaging indicator votes.
- **Model-family clustering**: SMA/EMA, MACD, RSI, stochastic, Bollinger and related transforms are grouped by mathematical family so correlated indicators cannot manufacture confidence.
- **Specialist models** compose (not collapse): multi-timeframe structure, trend/momentum, price-volume/Wyckoff hypotheses, auction/value, breakout/reversal patterns, mean-reversion/volatility, relative confirmation, options positioning, psychology/risk.
- **Simple** = one overview read (direction, regime, setup state, five gate outcomes, timeframe agreement, trigger, invalidation, target path, gross + cost-adjusted reward-to-risk, strongest support/contradiction, unavailable evidence, what would change the read). **Power** = same result with synchronized detail, formulas, source/vintage, pattern lifecycle, comparison ratios, option assumptions, and as-of-safe validation records. Both share one computed result.

## Honesty invariants (do not erode)

- Confidence describes evidence **quality/coverage/agreement/stability/validation** — it is **never** a win probability. A hit rate appears only with an as-of-safe sample, denominator, horizon, costs, and uncertainty.
- Wicks are traded extremes, not proof of a stop-hunt / liquidity sweep / institution / intent. Volume-profile up/down split is an **OHLCV proxy** unless true bid/ask tick data exists. Dealer gamma / option walls are convention-dependent **positioning scenarios**; missing chain or unknown dealer sign ⇒ `UNAVAILABLE`, never neutral.
- A U.S. equity's 6.5h core session is **role-based and session-aware** — it never silently becomes one 4h bar + an unequal remainder. Closed-bar evidence and provisional open-bar evidence stay separate across reload.
- Trigger / invalidation / target are defined **before** a hypothetical entry; a target is never backfit to make reward-to-risk pass. A custom parameter change creates a distinct tested variant and cannot inherit another variant's validation passport.
- Educational research only — no order routing, no broker, no personalized advice.

## Next-run focus

- Re-verify the source-qualified stock universe and comparison sets in `technical-analysis-decision-universe.json`; confirm the daily source-qualified series still resolves (intraday remains best-effort/source-constrained per `rldata.js`).
- Sanity-check the five-gate synthesis and setup-state transitions on a known trend day vs a known chop day; confirm no gate can pass on correlated-indicator agreement alone.
- Keep the rejected-claim registry visible so unsupported transcript universals cannot silently re-enter the model.
- Formal Bubbles certification for Feature 007 is still in progress; the tool is registered as a working, test-passing lab (selftest + `tests/technical-analysis-decision-lab.spec.mjs`).
