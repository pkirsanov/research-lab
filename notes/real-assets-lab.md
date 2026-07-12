# Real Assets Lab

Single-file tool: [`../real-assets-lab.html`](../real-assets-lab.html)  
Editable universe: [`../real-assets-universe.json`](../real-assets-universe.json)

## Purpose

The Real Assets Lab compares gold, silver, bitcoin/crypto, energy, broad commodities, industrial metals, agriculture, and platinum **without pretending they share one economic model**.

Simple view surfaces the strongest current setup and lets the user steer horizon, risk posture, volatility penalty, and confirmation weight. Power view exposes the common score scale, each asset's raw trend/risk readings, the distinct driver formula, and a focused relative-price chart.

Educational research only. Scores are research priorities, not forecasts or trade instructions.

## Universe

Visible assets include:

- gold: `GLD`, `IAU`;
- silver: `SLV`;
- bitcoin: `BTC-USD`, `IBIT`, optional `BITO`;
- crypto: `ETH-USD`;
- broad commodities: `DBC`, `PDBC`;
- energy: `USO`, `BNO`;
- industrial metals: `CPER`;
- agriculture: `DBA`;
- platinum: `PPLT`.

Hidden driver series are `UUP`, `TLT`, `TIP`, `QQQ`, `XLE`, and `XLI`. Hidden means they power named confirmations but are not ranked as real-asset candidates.

## Data flow

The tool reads shared daily bars through `RLDATA` first and auto-fetches only missing/stale symbols. Changing a model lever runs one local `render()` and does not refetch.

Each render publishes a compact owning-model read via `RLDATA.putToolRead("real-assets-lab", ...)`, allowing the scheduled Market Brief to consume the latest deterministic model result and deep-link here.

## Common observations

Every visible asset gets:

- 21-, 63-, and 126-bar trailing returns;
- horizon-weighted trend plus price versus 50- and 200-day averages;
- annualized realized volatility (365 sessions for spot crypto, 252 for listed funds);
- maximum drawdown over the horizon risk window;
- a risk deduction controlled by posture and the volatility-penalty lever.

The resulting family-specific score is clamped to $[0,100]$. Missing history remains missing.

## Distinct models

### Gold

Gold uses its own trend, inverse dollar direction (`UUP`), and a liquid duration/inflation-linked proxy mix (`TLT` and `TIP`). The latter is a rough price proxy, **not a direct real-yield series**.

$$
S_{gold}=0.60T+0.22D_{USD}^{-1}+0.18R_{proxy}-P_{risk}
$$

### Bitcoin

Bitcoin uses its own price trend, `QQQ` risk-appetite confirmation, and a deliberately stronger realized-volatility/drawdown deduction.

$$
S_{BTC}=0.72T+0.28Q_{risk}-P_{risk}
$$

No on-chain, funding-rate, liquidations, miner-flow, MVRV, or exchange-flow data is claimed or inferred.

### Silver

Silver is treated as a hybrid monetary/industrial metal. Its confirmations are a falling `GLD`/`SLV` ETF-price ratio (silver outperforming), gold direction, and `XLI` industrial-cycle direction.

The ETF-price ratio is directional and **not the physical gold/silver ounce ratio**.

### Crypto beyond bitcoin

The crypto model combines the asset's price trend, `QQQ` risk appetite, and bitcoin direction. It remains a price/proxy model only.

### Energy

Oil-linked vehicles use their own trend, `XLE` energy-equity confirmation, and cross-commodity breadth.

### Broad, industrial, agriculture, platinum

These families use distinct blends of own trend, commodity breadth, inverse USD, `DBC`, `XLI`, and/or gold confirmation as declared in `real-assets-universe.json`.

## Simple controls

- **Horizon**: tactical, swing (default), structural.
- **Risk posture**: cautious, balanced (default), aggressive.
- **Volatility penalty**: scales the realized-volatility/drawdown deduction.
- **Confirmation weight**: scales the named external proxies.
- **Model focus**: selects the explained Simple stance and Power chart.
- **Chart benchmark**: changes only the Power comparison line, never the model score.

## Power view

Power exposes:

- cross-asset coverage, breadth, score spread, and risk summary;
- a focused asset/benchmark path rebased to 100;
- the full model leaderboard;
- trend, 21/63/126 returns, volatility, max drawdown, and named confirmations;
- focused model score anatomy and formula.

## Important limitations

- `BTC-USD` and `ETH-USD` trade seven days; `QQQ`, `IBIT`, commodity ETFs, and other drivers trade US sessions. Weekend crypto moves therefore have no same-clock ETF confirmation.
- `IBIT` is a US-session spot-bitcoin vehicle; `BITO` is futures-linked. Fees, session gaps, futures basis, and roll can create material tracking differences.
- `DBC`, `PDBC`, `USO`, `BNO`, `CPER`, and `DBA` are futures-linked funds. Spot commodity direction, futures curve shape, collateral return, contract selection, and roll drag/benefit can diverge.
- `GLD`, `IAU`, `SLV`, and `PPLT` are listed proxies with fees and tracking differences, not physical spot quotes.
- The model omits inventory, futures curves, CFTC positioning, options skew, macro releases, weather, crop conditions, geopolitics, on-chain records, taxes, spreads, and execution costs.
- Proxy confirmation is correlation-sensitive. Raising confirmation weight can amplify one shared risk factor rather than add independent evidence.

## Next-run checklist

1. Compare spot bitcoin with `IBIT`; explicitly flag weekend/session divergence.
2. Compare `BITO` with spot before using any futures-ETF reading.
3. Check the dollar and rate-proxy directions before elevating a gold call.
4. Check `GLD`/`SLV` and `XLI` agreement before elevating silver.
5. Verify `XLE` confirmation and the oil curve externally before treating `USO`/`BNO` as spot-oil signals.
6. Require persistence or a structural break before the Market Brief turns a score change into a next-day action.

## Validation

```bash
node scripts/selftest.mjs
```

The self-test directly checks return, volatility, drawdown, trend, and the monotonic response of gold, bitcoin, silver, and energy models to their declared confirmations.

## Version history

- **1.0 (2026-07-12)**: initial distinct-model Real Assets Lab, Simple/Power views, shared-cache auto-hydration, model leaderboard, focused chart, and Market Brief tool-read publication.
