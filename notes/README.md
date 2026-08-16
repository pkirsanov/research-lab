# Tool notes

One **notes file per tool**, named by tool id:

```text
notes/<tool-id>.md
```

where `<tool-id>` is the tool's `id` in [`../tools.json`](../tools.json) / the `TOOLS` array in [`../index.html`](../index.html) (it also matches the tool's HTML basename, e.g. `msft-july-print-model`).

## What a notes file contains

Each notes file is the **handoff for the next analysis run** — enough detail to continue, extend horizons, update dates, or add new factors without re-deriving everything:

- Purpose &amp; what the tool computes
- Verified source data (with dates &amp; primary sources)
- The model math / methodology
- Every input lever, its default, and the presets
- Key findings &amp; corrections to carry forward
- Known limitations / simplifications
- A **next-run checklist**
- Version history
- How to edit, validate &amp; ship

## Common referencing convention

A tool is wired to its notes in three consistent places:

1. **Footer link** in the tool's HTML → `notes/<tool-id>.md` (small, in the footer).
2. **Landing-card Notes link** rendered from the same `notes` field in the `index.html` `TOOLS` array.
3. **Registry field** `notes` in both `tools.json` and the `index.html` `TOOLS` array.
4. **This folder**, `notes/<tool-id>.md`.

On the live GitHub Pages site a `.md` link serves raw markdown (readable); on github.com it renders. Keeping notes as relative `.md` files preserves the site's offline-capable, no-dependency ethos.

## Cross-cutting notes

A few notes span several tools rather than describing one. They live in this folder under a descriptive name instead of a tool id, and are not listed in the per-tool index below.

| Note | Covers |
| --- | --- |
| [shared-data-layer.md](shared-data-layer.md) | The shared fetch/cache/proxy data layer used by every tool. |
| [volatility-drag-research.md](volatility-drag-research.md) | Where volatility drag is depended on but not shown. Live item: the undisclosed `μ ∝ σ` assumption behind vol-targeting (`1/σ`) versus Kelly (`1/σ²`). Also the two documented-but-unreconciled Sharpe conventions and the missing shared drag primitive. |
| [us-iran-oil-market-intervention-patterns.md](us-iran-oil-market-intervention-patterns.md) | Evidence-led U.S. and Iranian oil-market intervention chronology, actor reaction functions, current Hormuz regime, scenario estimates, and confirmation rules. |
| [defense-earnings-acceleration-research.md](defense-earnings-acceleration-research.md) | Stockpile-replenishment thesis behind the `defense-earnings-acceleration` agenda topic, and the correction that ranking must follow the consensus-versus-funded estimate-revision gap rather than demand exposure. Snapshot 2026-08-10. |
| [food-inputs-outlook-research.md](food-inputs-outlook-research.md) | Fertilizer-cost transmission behind the `food-inputs-outlook` agenda topic: which claims of a bullish 2026 agricultural thesis held, which did not, and why input costs hit farm margins now but supply only through 2027 planting. Snapshot 2026-07-23. |

## Index

| Tool | Notes | Next-run focus |
| --- | --- | --- |
| `options-structure-lab` | [options-structure-lab.md](options-structure-lab.md) | Re-verify the optionable-underlyings watchlist in `options-structure-universe.json`; confirm the Yahoo option-chain + short-interest endpoints still resolve through the public proxies; and sanity-check the dealer-gamma sign convention + gamma-flip against a known pin/trend day after a fresh fetch. |
| `gamma-trading-lab` | [gamma-trading-lab.md](gamma-trading-lab.md) | Re-confirm the Yahoo option-chain endpoint still resolves through the public proxies (for live OVI volume); sanity-check the dealer-gamma sign convention + gamma-flip against a known pin/trend day; note that days-in-regime + the OVI percentile need a few daily reads to accrue in `gammaHist`. Reuses the Options Structure Lab snapshot via the shared cache (no re-fetch). |
| `sector-research-lab` | [sector-research-lab.md](sector-research-lab.md) | Re-verify group memberships in `sector-universe.json` (spin-offs/IPOs/reconstitutions), sanity-check the RRG after a fresh fetch, and revisit default RS lookback / momentum span for the regime. |
| `global-rotation-lab` | [global-rotation-lab.md](global-rotation-lab.md) | Re-verify country ETF liquidity and the declared FX source orientation; compare ACWI/EFA/EEM benchmark sensitivity; inspect local-close timing before elevating a next-session action. Score and rank are equity-only — confirm any currency claim against the separate decomposition product, not the score. |
| `fx-regime-relative-value-lab` | [fx-regime-relative-value-lab.md](fx-regime-relative-value-lab.md) | Re-check whether any vehicle source has become rights-approved; every committed observation is currently `RIGHTS_UNCLEAR`, so no vehicle can be eligible. Verify direction, basket, wrapper, liquidity/cost and daily-reset facts per member before treating any disposition as settled. |
| `real-assets-lab` | [real-assets-lab.md](real-assets-lab.md) | Compare GLD/SLV/BTC spot/ETF paths, verify named driver confirmations, and externally check futures curves/roll before treating futures-linked fund moves as spot signals. |
| `bond-regime-lab` | [bond-regime-lab.md](bond-regime-lab.md) | Refresh source-stamped sleeve characteristics, verify official Treasury headers, inspect ratio alignment/duration confounds, and keep restricted optional observations memory-only. |
| `ai-capex-strategy-lab` | [ai-capex-strategy-lab.md](ai-capex-strategy-lab.md) | Refresh assets/presets, crowding friction, catalyst timing, and AI-infra bottleneck sources. |
| `msft-july-print-model` | [msft-july-print-model.md](msft-july-print-model.md) | Plug in actual FY26 Q4 print, refresh FY27 consensus/capex guide, and re-test cost-cycle assumptions. |
| `etf-momentum-lab` | [etf-momentum-lab.md](etf-momentum-lab.md) | Refresh `etf-universe.json` (AUM/price/expense + re-pull the etfdb High-Momentum screen), populate momentum-fund holdings, and revisit default regime assumptions. |
| `strategy-self-improvement-lab` | [strategy-self-improvement-lab.md](strategy-self-improvement-lab.md) | Add a transaction-cost lever + a multi-seed robustness accept-gate (score a candidate on the worst/mean OOS across N seeds before accepting); re-verify the synthetic regime params still produce the intended market shapes; optionally allow pasting a real return series (keep the synthetic default). |
| `strategy-validation-lab` | [strategy-validation-lab.md](strategy-validation-lab.md) | v1 shipped (real-data walk-forward, embargoed folds, held-k/N, Deflated Sharpe, synthetic-demo offline). Next: fold multi-instrument tuning trials into the DSR trial count; a small rule menu beyond the trend/momentum default; a purge-vs-OOS-length helper for short (5y) histories; a live-fetch smoke against a real key. |
| `volatility-sizing-lab` | [volatility-sizing-lab.md](volatility-sizing-lab.md) | Re-verify the universe assets and per-asset target-vol / regime-window / min-forecast policy in `volatility-sizing-universe.json`; sanity-check EWMA-vs-GARCH persistence on a known calm/storm asset after a fresh fetch; confirm the managed-reference (CNY=X) read stays marked managed-suppressed and never full-size; and keep the backtest a deep-link (never an in-tool verdict). |
| `technical-analysis-decision-lab` | [technical-analysis-decision-lab.md](technical-analysis-decision-lab.md) | Re-verify the source-qualified stock universe + comparison sets in `technical-analysis-decision-universe.json`; sanity-check the five-gate synthesis and setup-state transitions on a known trend vs chop day (no gate may pass on correlated-indicator agreement alone); keep confidence as evidence-quality (never a win probability); and keep the rejected-claim registry visible so unsupported transcript universals can't re-enter. Formal Feature 007 certification still in progress. |
| `research-agenda-lab` | [research-agenda-lab.md](research-agenda-lab.md) | Run the governed brief refresh, confirm every-generation selection, preserve named unavailable outcomes, and require canonical stored-versus-recomputed parity before reading any newly published model chart. Keep the August 10 dossier visibly historical. |
