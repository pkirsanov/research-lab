<!-- markdownlint-disable MD024 -->

# User Validation: 011 Volatility Regime And Vol-Targeting Sizing Lab

Evidence destination: [report.md](report.md)
Execution plan: [scopes.md](scopes.md)
Contracts: [spec.md](spec.md) | [design.md](design.md) | [scenario-manifest.json](scenario-manifest.json) | [test-plan.json](test-plan.json)

> Authored by `bubbles.validate` from the real, independently re-run validation
> evidence (this is an autonomous certification run; user-validation here is
> evidence-based confirmation that the tool satisfies the spec Success Signal).
> Every `[x]` cites a concrete `SCN-011-*` scenario proven by a passing
> assertion in `node scripts/selftest.mjs` (the additive `Feature 011 RLVOL
> foundation` group, re-run green this session) and/or the real-route Playwright
> suite `tests/volatility-sizing-lab.spec.mjs` (independently re-run **15
> passed / 0 failed**, exit 0, this session). No user quotes are fabricated.

## Checklist

- [x] With sufficient valid daily-bar history, the tool reads a one-day-ahead annualized volatility forecast and a short forecast term structure, typed `forecast` and kept elevated under high persistence. **Evidence:** SCN-011-001 — `RLVOL EWMA and GARCH forecasts keep high persistence elevated above the long-run and stay typed forecast` (selftest, re-run green); **Claim Source:** executed.
- [x] The storm-gauge regime is shown as an explicit percentile band that always renders its declared trailing window and observation count, never as a cross-asset absolute danger score. **Evidence:** SCN-011-002 — `RLVOL volPercentile always returns its trailing windowRef and regimeBand maps thresholds` (selftest) + E2E case 1 `Regression BS-002: storm-gauge percentile always renders its trailing window and observation count` (15/0 re-run); **Claim Source:** executed.
- [x] The model exposes its persistence decomposition (shock weight, memory weight, implied half-life) rather than a single opaque number. **Evidence:** SCN-011-001 / SCN-011-012 — `RLVOL material EWMA-vs-GARCH persistence divergence opens an evidence conflict and is never averaged` (selftest, re-run green); **Claim Source:** executed.
- [x] The conditional sizing multiplier is `min(cap, targetVol / max(floor, forecastVol))` and is presented with a worked cash example on the user notional. **Evidence:** SCN-011-003 — `RLVOL sizing multiplier is min(cap, targetVol over max(floor, forecastVol)) with a worked example` (selftest, re-run green); **Claim Source:** executed.
- [x] A near-zero forecast volatility floors the multiplier at the cap and never diverges toward infinity. **Evidence:** SCN-011-004 — `RLVOL near-zero forecast vol floors the multiplier at the cap and never diverges` (selftest) + E2E case 7 `Regression BS-004: near-zero forecast vol floors the multiplier at the cap` (15/0 re-run); **Claim Source:** executed.
- [x] The model forecasts magnitude only — no panel, label, badge, axis, or summary implies a price direction, target, top, or bottom. **Evidence:** SCN-011-005 — E2E case 2 `Regression BS-005: no directional element appears in Simple or Power` (15/0 re-run); **Claim Source:** executed.
- [x] EWMA/RiskMetrics is the closed-form default; any GARCH(1,1) fit is labeled a lightweight in-browser optimizer, never institutional MLE, and a non-convergent fit falls back to the labeled EWMA closed form. **Evidence:** SCN-011-006 / SCN-011-011 — `RLVOL GARCH fit is a labeled lightweight optimizer and never institutional MLE` + `RLVOL non-convergent GARCH resolves to the labeled EWMA closed-form fallback` (selftest) + E2E cases 8/9 (15/0 re-run); **Claim Source:** executed.
- [x] Every value is a typed `forecast` or typed `realized` estimate; a realized read is never relabeled a forecast in the owner read. **Evidence:** SCN-011-013 — `RLVOL realized reads are typed realized and never relabeled forecast in the owner read` (selftest) + E2E case 10 `Regression BS-013` (15/0 re-run); **Claim Source:** executed.
- [x] The "does vol-targeting make money" question deep-links to `strategy-validation-lab.html` and renders no in-tool single-path performance verdict. **Evidence:** SCN-011-007 — E2E case 3 `Regression BS-007: backtest is a deep-link with no in-tool verdict` (15/0 re-run); **Claim Source:** executed.
- [x] Insufficient history remains explicitly `Unavailable` with exact required-versus-available counts and never becomes a zero, a neutral, a flat "calm" regime, or an implicit full-size multiplier. **Evidence:** SCN-011-009 — `RLVOL below-minimum coverage is INSUFFICIENT_HISTORY with exact required-versus-available counts` (selftest) + E2E case 5 `Regression BS-009` (15/0 re-run); **Claim Source:** executed.
- [x] Low volatility from a peg, band, halt, or managed regime is marked managed-suppressed as a first-class limitation, never automatically "safe / full size". **Evidence:** SCN-011-008 — `RLVOL detectManagedSuppression flags peg band or halt low volatility as managed-suppressed` (selftest) + E2E case 4 `Regression BS-008` (15/0 re-run); **Claim Source:** executed.
- [x] Simple and Power views consume one computation and cannot disagree for the same asset, window, and controls, and a control change recomputes locally with zero market-data requests. **Evidence:** SCN-011-010 / SCN-011-017 — E2E case 6 `Regression BS-010: Simple and Power share one decision identity` + case 13 `Controls recompute one decision without any market-data request` (15/0 re-run); **Claim Source:** executed.
- [x] The tool publishes one normalized `rl-tool-read/v1` owner read (summary only, no raw bars) that `market-brief.html` renders without loading or recomputing the volatility model. **Evidence:** SCN-011-021 / SCN-011-019 — `RLVOL projectVolToolRead emits summary-only owner read...` + `Registry-wide Market Brief coverage...` (selftest) + E2E case 15 `publishes one owner read and Market Brief renders it without recompute` (15/0 re-run); **Claim Source:** executed.
- [x] Power canvases draw synchronously (no `requestAnimationFrame` dependency), each carrying an aria-label, an adjacent summary, and a same-data table on desktop and mobile. **Evidence:** SCN-011-016 / SCN-011-018 — E2E cases 12/14 (15/0 re-run); **Claim Source:** executed.
- [ ] Final `done` certification is confirmed by a green full-suite regression. **Status:** NOT confirmed this session — the shared `node scripts/selftest.mjs` is currently **546 passed / 2 failed** because of two **Feature 010** config-fingerprint assertions (external to Feature 011). Feature 011's own assertions are all green. See [report.md](report.md) "Validation Evidence" and Open Refinements below. **Claim Source:** executed.

## Goal

- Goal: give a research user one truthful volatility workspace that forecasts an asset's conditional volatility, states the regime as a window-relative percentile, decomposes persistence into a half-life, and converts the forecast into a capped-and-floored conditional vol-targeting sizing multiplier — while making explicit that the model carries zero directional information and generates no entries.
- Success signal: the same typed forecast read is published as one normalized owner read that `market-brief.html` consumes without recomputing the model, and every degraded state (insufficient history, managed-suppression, non-convergent GARCH, stale cache) renders its exact reason instead of a false calm or a full-size default.

## Journey Steps

| Step | User Intent | Planned Observation | Evidence | Friction Vocabulary |
| --- | --- | --- | --- | --- |
| 1 | Open the volatility tool from cache | Simple storm-gauge paints synchronous non-blank canvases with text/table fallback | SCN-011-016 | works, unclear, inconvenient, missing, broken |
| 2 | Read tomorrow's volatility regime | Forecast is typed, elevated under persistence; regime percentile shows its trailing window + count | SCN-011-001, SCN-011-002 | works, unclear, inconvenient, missing, broken |
| 3 | Understand persistence and method | Half-life / shock-vs-memory shown; GARCH labeled a lightweight optimizer, EWMA the default, conflict never averaged | SCN-011-006, SCN-011-011, SCN-011-012 | works, unclear, inconvenient, missing, broken |
| 4 | Size a conditional signal | Multiplier is `min(cap, targetVol/max(floor, forecastVol))` with a worked cash example; near-zero forecast floors at the cap | SCN-011-003, SCN-011-004 | works, unclear, inconvenient, missing, broken |
| 5 | Trust the honesty guards | No direction is implied; realized never relabeled forecast; managed-suppression and insufficient history stay explicit, not "calm" | SCN-011-005, SCN-011-008, SCN-011-009, SCN-011-013 | works, unclear, inconvenient, missing, broken |
| 6 | Compare Simple and Power and change controls | One decision identity across views; controls recompute locally with zero market-data requests; accessible canvases on desktop and mobile | SCN-011-010, SCN-011-017, SCN-011-018 | works, unclear, inconvenient, missing, broken |
| 7 | Ask whether vol-targeting makes money | Backtest is a deep-link to strategy-validation-lab with no in-tool verdict | SCN-011-007 | works, unclear, inconvenient, missing, broken |
| 8 | Read the Market Brief relationship | One published owner read renders in the brief without recompute; no invented volatility synthesis | SCN-011-019, SCN-011-021 | works, unclear, inconvenient, missing, broken |

## Open Refinements

- The tool itself satisfies every Success-Signal component (Steps 1-8 above) — proven by the green `Feature 011 RLVOL foundation` selftest group (re-run this session) and the independently re-run real-route Playwright suite (**15 passed / 0 failed**, exit 0).
- One outstanding gate blocks final `done` sign-off and is **not a Feature 011 defect**: the shared `node scripts/selftest.mjs` regressed to **546 passed / 2 failed** because of two **Feature 010** ("company-fundamentals-and-brief-lab") config-fingerprint assertions (`Feature 010 production config validates and binds to the publication fingerprint`; `Feature 010 Scope 2 config binds formulas and the software-platform archetype to the regenerated publication fingerprint`). Feature 011's completion evidence requires a green full suite, so this external regression must be resolved by the Feature 010 owner before Feature 011 can certify. Routed in [report.md](report.md) "Validation Evidence".
- One Feature 011 artifact-hygiene item is routed to `bubbles.ux`: the `spec.md` UX heading `Screen: Managed-Suppressed Regime` collides with the `artifact-freshness-guard` reserved supersession vocabulary (`Superseded|Suppressed`) and needs a meaning-preserving rename (the screen's behavior and body text are correct and unchanged).
