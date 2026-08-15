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

## Registry and shared script order

**Registry:** `tools.json`, `index.html::TOOLS`, `rlnav.js::TOOLS` — one entry each, identical order, group `Rotation & Macro`.

**Shared script order:** `rldata.js` -> `rlapp.js` -> `rlg.js` -> `rlvalidation.js` -> `rlchart.js` -> `rlticker.js` -> inline script -> `rlnav.js`. `rldata.js` must precede `rlapp.js`, and `rlapp.js` must precede `rlnav.js`. `rlvalidation.js` supplies the seven generic `RLVALID` primitives; the page consumes them and never copies one inline.

## Simple and Power projection

Both modes read the **same** view model. `projectionIdentity` covers the result only — mode, sort, disclosure and focus are deliberately outside it, which is what makes switching modes provably display-only. Switching triggers no fetch and no recompute, and the preference persists in `localStorage` under `tad-view-mode`.

## Key formulas

- Expectancy: `E = p*W - (1-p)*L`; total `= E*N`. For `p=.71`, `W=6R`, `L=1.8R`: `E = 3.738R`, and 50 trades total `186.9R` gross under equal risk.
- Breakeven win rate: `L / (W + L)`. For the same inputs: `23.08%`.
- Loss streaks compound: ten 1% losses leave `0.99^10 = 90.44%`, a `9.56%` drawdown, not 10%. Recovery always needs a larger gain than the drawdown.
- Relative strength: normalized total-return ratio. Raw-price similarity is refused as a comparison result.

## Owner, comparison and cost boundaries

| Area | Rule |
| --- | --- |
| Owners | Six specialist pages publish a nested `rl-ta-owner-read/v1` passport. This page admits or refuses it; it never recomputes an owner formula, calls a private function, loads another page's script, inspects an iframe, or parses owner DOM. |
| Option convention | `options-structure-lab` bakes the dealer convention into its stored values (`signApplied: true`) and must not be re-signed. `gamma-trading-lab` stores raw base-convention values and applies the flip at read time (`signApplied: false`), so it cannot supply option positioning on its own. |
| Microstructure | Footprint needs tick volume-at-price with bid/ask or aggressor classification; depth needs time-stamped full-book events; large-trade needs per-trade size/price/time/classification. OHLCV and an option snapshot satisfy none, so those modules stay unavailable rather than being filled with a proxy. |
| Comparison | Broad-market, sector/industry, direct-peer and optional-context stay separate. A peer percentile requires the declared minimum denominator; below it the named pairwise ratios survive and the percentile is withheld. No comparator is auto-replaced. |
| Dow | The industrial/transport confirmation rule was a claim about two specific averages. It is not generalized to an arbitrary pair of modern symbols. |
| Costs | An unstated cost and a stated zero are different claims. A missing component makes net expectancy unavailable and caps the passport at `descriptive-only`. Gross never fills the net slot. |
| Process | Observable plan deviation only. The guard publishes `inferredEmotion: null`, `inferredIntent: null` and `suitabilityAssessed: false`. |

## Controls

- `#modeSeg` — Simple / Power, persisted under `tad-view-mode`, display-only.
- Foundation receipt selector — chooses which analytic or source-qualified fixture to project.

## Fixture posture

Every view is a checked-in deterministic fixture under `tests/fixtures/technical-analysis-decision/`. The band states `TEST FIXTURE` and the truth state is `degraded`. No current-market claim is made and no instrument is named. Comparison and validation series are generated by explicit closed formulas, so every ratio, expectancy and identity is reproducible by hand.

## Privacy

Local preferences hold the view mode only. The export is sanitized: credentials, tokens, auth state, holdings, positions, account data, balances, cost basis, P&L and private notes are dropped, and the dropped paths are listed so a reader can see that something was withheld rather than wondering whether it was absent.

## Accessibility

The gate canvas has an equivalent accessible table carrying the same facts. Gate state is carried by fill **and** a text label, so meaning never depends on colour alone. Mode buttons meet the 44px target. `prefers-reduced-motion` disables transitions and animations. The Simple facts grid collapses to one column below 600 CSS px.

## Validation commands

```bash
node scripts/selftest.mjs
node scripts/validate-technical-analysis-decision.mjs
node scripts/audit-reader-legibility.mjs
npx --no-install playwright test tests/technical-analysis-decision-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
```

Page integrity (`TAD-PAGE-INLINE-ID`) parses every inline script and requires every literal `getElementById` target to exist. This page routes element lookups through a `byId()` wrapper, so the selftest additionally resolves every `byId("...")` reference against the document's declared ids — the literal-only form passes vacuously here and that limit is stated rather than hidden.

## Known limitations

- Every projection is fixture-backed; no live provider path is wired.
- Gate inputs come from the gate fixture rather than being derived from technique outcomes and candidate lifecycle. That composition remains open.
- The multi-symbol slice breakdown and cross-instrument robustness need a population the single analytic series does not provide.
- Two owner pages had no data in the test harness, so their envelopes are covered at source and fixture level but not by an observed runtime publication.

## Next-run focus

- Re-verify the source-qualified stock universe and comparison sets in `technical-analysis-decision-universe.json`; confirm the daily source-qualified series still resolves (intraday remains best-effort/source-constrained per `rldata.js`).
- Sanity-check the five-gate synthesis and setup-state transitions on a known trend day vs a known chop day; confirm no gate can pass on correlated-indicator agreement alone.
- Keep the rejected-claim registry visible so unsupported transcript universals cannot silently re-enter the model.
- Formal Bubbles certification for Feature 007 is still in progress; the tool is registered as a working, test-passing lab (selftest + `tests/technical-analysis-decision-lab.spec.mjs`).
