# Global Rotation Lab

Single-file tool: [`../global-rotation-lab.html`](../global-rotation-lab.html)  
Editable universe: [`../global-rotation-universe.json`](../global-rotation-universe.json)

## Purpose

The Global Rotation Lab answers a different question from the US factor-oriented ETF Momentum Lab: **which country or region currently deserves the next research slot?** It ranks liquid US-listed country ETFs using benchmark-relative momentum, moving-average structure, realized risk, and local-currency confirmation.

The default Simple view is a decision queue. Power view exposes every score component, country row, session/FX context, and the correlation map.

Educational research only. The outputs are model reads, not investment advice or trade instructions.

## Universe

The country sleeve includes South Korea (`EWY`), Singapore (`EWS`), Philippines (`EPHE`), Germany (`EWG`), Japan (`EWJ`), Taiwan (`EWT`), India (`INDA`), China (`MCHI`), United Kingdom (`EWU`), Australia (`EWA`), Canada (`EWC`), Brazil (`EWZ`), and Mexico (`EWW`).

Broad controls are `ACWI`, `EFA`, and `EEM`. Each entry declares:

- its represented country and region;
- the indicative home-market cash close;
- a Yahoo Finance currency proxy;
- whether that FX quote must be inverted so positive always means local-currency strength versus USD.

## Data flow

The page loads `rldata.js` and reads `RLDATA.bars(symbol, "1d")` first. It paints from whatever the shared cache already holds, then calls `RLDATA.ensureBars` only for missing or stale ETF, benchmark, and FX series. A control change recomputes locally and never refetches.

Every render publishes the Simple decision through:

```js
RLDATA.putToolRead("global-rotation-lab", {
  asOf,
  read,
  metrics,
  deepLink: "global-rotation-lab.html"
});
```

That normalized read is available to the Actionable Market Brief without duplicating this model.

## Model

### Relative momentum

For each country and horizon $h \in \{21,63,126\}$ trading days:

$$
R_{rel,h}=R_{country,h}-R_{benchmark,h}
$$

The selected primary horizon receives 55% of the momentum sub-score; the two secondary horizons receive 22.5% each. Values are clipped to a bounded scale so one outlier cannot dominate the model.

### Trend

The trend state uses price versus 20-, 50-, and 200-day moving averages plus their ordering. The Simple-view strictness lever changes the acceptance gate:

- `Flexible`: price above the 50-day and at least two averages;
- `Balanced`: price above the 50- and 200-day, with the 50-day above the 200-day;
- `Strict`: price above all three with a full $20>50>200$ stack.

### Risk quality

Risk quality combines 63-day annualized realized volatility and trailing 252-bar maximum drawdown. Defense posture puts more weight on this component; offense puts more weight on momentum.

### FX confirmation

The currency series is oriented so positive means the local currency strengthened versus USD. It confirms or contradicts the primary relative-equity signal.

**Do not add the ETF return and FX return together.** A US-listed unhedged country ETF already embeds currency translation in its USD return. FX is deliberately a confirmation input, not a second return forecast. Raising the FX weight can still double-count the same impulse, so the default is restrained at 14%.

### Composite

The country score maps bounded momentum, trend, risk, and FX components to $0$-$100$, with 50 neutral. Missing components are omitted and remaining weights are renormalized; missing data is never converted to zero.

## Simple controls

- **Benchmark**: `ACWI` default; `EFA` and `EEM` isolate developed or emerging relative leadership.
- **Primary lookback**: 21, 63 (default), or 126 trading days.
- **FX confirmation weight**: 0-30%, default 14%.
- **Trend strictness**: flexible, balanced (default), strict.
- **Risk posture**: offense, balanced (default), defense.

All controls update the verdict, queue, model read, and Power diagnostics through one `render()` call.

## Power view

Power exposes:

- the full country/control leaderboard;
- relative 21/63/126-day returns;
- the 20/50/200 trend state;
- FX direction and confirmation state;
- realized volatility and max drawdown;
- score-component anatomy;
- pairwise 63-session country ETF correlations;
- the local-session and currency map.

## Timing and data caveats

- A same-date US ETF bar is not a synchronized local-market observation. Asia may be nearly a full session old at the New York close, Europe several hours old, and the Americas partly overlapping.
- FX trades longer than the local cash market and can move after its close.
- Country ETFs add fees, tracking difference, sector concentration, holidays, and US-hours price discovery.
- Correlations use overlapping US-listed ETF sessions, not synchronized local closes.
- Daily adjusted bars are delayed and can be incomplete. Free proxy/API availability can vary.
- The model has no valuation, local rates, capital-flow, earnings-revision, political-risk, or geopolitical-news feed. Those remain external research inputs.

## Next-run checklist

1. Verify each country ETF remains liquid and still represents the intended market.
2. Check Yahoo currency symbol direction, especially `JPY=X`, `KRW=X`, and the broad dollar control.
3. Compare the leader under `ACWI`, `EFA`, and `EEM`; flag benchmark-dependent calls.
4. Inspect local-close timing before acting on a New York-close signal.
5. Confirm leadership persists across at least two snapshots or breaks a structural level before elevating it in the brief.
6. Review correlations so a multi-country queue does not merely repeat one global-beta trade.

## Validation

```bash
node scripts/selftest.mjs
```

Also parse the inline script and verify every `getElementById`/`byId` reference has a matching HTML id. The repository self-test directly exercises the country return, volatility, drawdown, trend, FX-orientation, and composite-score helpers.

## Version history

- **1.0 (2026-07-12)**: initial FX/session-aware country-rotation tool, Simple/Power views, shared-cache auto-hydration, correlation map, and Market Brief tool-read publication.
