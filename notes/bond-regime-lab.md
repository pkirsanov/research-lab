# Bond Regime & Fixed-Income Scenario Lab

## Purpose

The Bond Regime Lab separates observed credit, curve, inflation, and duration evidence from user assumptions and modeled sleeve estimates. It is a generic fixed-income research surface, not a portfolio optimizer, bond ladder, forecast, or execution tool.

Simple and Power are two compositions over one `BondLabViewModel`. A mode switch cannot fetch, reset assumptions, or change a regime. Scenario levers recompute synchronously and cannot rewrite observed records.

## Evidence Model

### Relative credit

- `JNK/LQD` and `HYG/LQD` use exact common UTC dates from distribution-adjusted closes when available.
- No leg is forward-filled, interpolated, or nearest-date matched.
- Both ratios are breadth inside one relative-price family. They do not count as two independent credit keys.
- Every ratio shows the effective-duration gap and the estimated same-window rate contribution:

$$
\Delta R_{duration} = -(D_{HY} - D_{IG})\Delta y
$$

A directional credit regime requires one usable relative-price pulse and one current independent family. OAS or financial-conditions observations are current-tab user observations or explicitly Unavailable. Raw values and source URLs are never persisted or published in the normalized tool read.

### Curve and inflation

- Nominal curve source: U.S. Treasury daily nominal par-yield CSV, current and prior UTC year, no key.
- Real curve source: U.S. Treasury daily real-yield CSV, current and prior UTC year, no key.
- Required nominal columns: Date, 3 Mo, 2 Yr, 5 Yr, 10 Yr, 30 Yr.
- Required real columns: Date, 5 Yr, 10 Yr, 20 Yr, 30 Yr.
- Ten-year breakeven is derived only on exact common dates:

$$
BE_{10Y} = y_{10Y,nominal} - y_{10Y,real}
$$

Curve level (`Inverted`, `Flat`, `Positive`, `Mixed`) remains separate from curve impulse (`Bull/Bear Steepener/Flattener`, `Mixed`, `Unavailable`). Inversion alone cannot create a duration posture.

## Scenario Model

The seven generic sleeves are bills/cash, short Treasury, intermediate Treasury, long Treasury, TIPS, investment-grade corporate, and high-yield corporate. Current proxy characteristics live in `bond-regime-universe.json` with source, as-of date, and review window.

Signed UI shocks are basis points. Internal shocks are decimals. Annual carry is scaled to the selected horizon once.

$$
R_{carry} = c_{annual}h
$$

$$
R_{rate} = -D_r\Delta r
$$

$$
R_{spread} = -D_s\Delta s
$$

$$
R_{convexity} = \frac{1}{2}C(\Delta r + \Delta s)^2
$$

$$
R_{scenario} = R_{carry} + R_{rate} + R_{spread} + R_{convexity}
$$

For TIPS, the modeled real-yield shock is nominal minus breakeven:

$$
\Delta r_{real} = \Delta y_{nominal} - \Delta BE
$$

Treasury and TIPS spread effects are Not applicable. Missing or stale characteristics make a sleeve Not rankable. Finite shocks outside the configured local bounds retain their arithmetic but become Reduced reliability and name nonparallel curves, optionality, defaults, liquidity, and tracking.

## Presets And Controls

- Soft Landing
- Growth Shock
- Inflation / Term-Premium Shock
- Credit Stress
- Custom

Controls: 3/6/12-month horizon, Treasury yield shock, investment-grade spread shock, high-yield spread shock, and breakeven shock. Positive values mean yields or spreads rise. Editing a populated field selects Custom.

Only these preferences may persist in `bondRegimeLabState`: schema version, mode, preset, horizon, four shocks, selected ratio, ratio window, and focused sleeve. No market observation, credential, account value, holding, source URL, OAS value, or financial-conditions value may enter it.

## Sources And Rights

| Family | Source | Rights / persistence |
| --- | --- | --- |
| ETF bars | Shared `RLDATA` cache and its existing provider path | Shared browser cache; adjustment/source metadata retained |
| Nominal Treasury | `home.treasury.gov` daily nominal CSV | Public official; versioned browser cache |
| Real Treasury | `home.treasury.gov` daily real-yield CSV | Public official; versioned browser cache |
| Breakeven | Exact-date nominal minus real | Derived; both official source ids retained |
| OAS | User-viewed current-tab observation | Restricted local view; memory-only |
| Financial conditions | User-viewed current-tab observation | Restricted local view; memory-only |

No FRED API key, FRED observation endpoint, ICE observation payload, or committed OAS/NFCI observation is part of this tool.

## Refresh Procedure

1. Review characteristic `asOf` and `reviewWindowDays` fields in `bond-regime-universe.json`; update only from the linked issuer source.
2. Run `node scripts/selftest.mjs`.
3. Run the committed Bond Regime Playwright suite through the repository's documented browser command surface.
4. Use Refresh in the page to request only missing or stale bars and official Treasury families.
5. Inspect Source, freshness and rights. A failed optional source must remain Unavailable or retain a validated stale cache with an explicit error code.
6. Never commit browser caches or restricted current-tab observations.

## Limitations

- Bond ETF shares have no maturity date or guaranteed redemption value.
- Parallel-shift duration/convexity arithmetic is a local approximation, not full cash-flow pricing.
- Nonparallel curves, changing duration, optionality, defaults, recoveries, liquidity, fund flows, taxes, fees not represented in carry, and tracking can change realized returns.
- The categorical regimes and thresholds are transparent research assumptions, not validated predictive claims.
- The normalized Market Brief read is derived and compact; it excludes raw restricted observations and URLs.

## Validation

The top-level pure helpers in `bond-regime-lab.html` are extracted by `scripts/selftest.mjs`. Browser tests in `tests/bond-regime-lab.spec.mjs` cover all 14 business scenarios, cache/source behavior, storage boundaries, mode and lever no-fetch behavior, canvas pixels, text-equivalent tables, keyboard semantics, and desktop/mobile containment.

## Version History

- 2026-07-13: Initial complete Bond Regime and Fixed-Income Scenario Lab.
