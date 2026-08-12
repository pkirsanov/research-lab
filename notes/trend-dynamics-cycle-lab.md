# Trend Dynamics & Cycle Lab

## Purpose

The Trend Dynamics Lab separates four things that are routinely collapsed into one word:
where a series is going (**direction**), what shape it is taking (**trend type**), whether
that movement is speeding up or slowing (**dynamics**), and whether the regime itself has
**changed**. A series can be rising and decelerating at the same time; it can be flat and
mid-break. Reporting a single "trend" hides both.

Simple and Power are two compositions over one frozen `AnalysisResultV1`. A mode switch
redraws; it never recomputes, refetches, or publishes. That is enforced in
`tdcApplyMode`, whose tests inject compute, fetch, and publish as spies and require them
to be uncalled — so the two views cannot drift onto different runs.

## Source And Vintage Posture

- The production route reads daily observations for `spy-daily` (SPY) from the shared
  `RLDATA` bar cache. It never fetches privately or holds a credential; provider access is
  configured centrally on `index.html#data-settings`.
- Each observation carries `observedAt`, `availableAt` (observation time plus the
  descriptor's `cadence.availabilityLagMs`), a `vintageId` derived from the cache retrieval
  stamp, and `qualityFlags`. The value is the adjusted close.
- `tdcResolveAsOfVintage` cuts observations at the decision time. A run refuses rather than
  reaching past its own cutoff.
- Source freshness and analytical truth are **different axes**. The owner read's top-level
  `availability` states source freshness (`current | stale | unavailable`); the nested
  `metrics.truthState` states the analytical reading (`current | stale | degraded |
  unavailable`). `degraded` is deliberately not a member of the shared availability enum:
  collapsing the axes would either hide a degraded conclusion behind a current source or
  falsely age a source that is genuinely current.

## Method Registry

Eighteen methods are declared in `trend-dynamics-cycle-universe.json`. The trend engine
runs M01–M12; M13–M18 are the season, cycle, and association engines.

| Id | Method | Family |
|----|--------|--------|
| M01 | Rolling OLS with HAC standard errors | trend-linear |
| M02 | Theil–Sen slope with Kendall's tau-b | trend-robust |
| M03 | Endpoint local quadratic | trend-curvature |
| M04 | Local linear state filter | trend-local-state |
| M05 | CUSUM | change-online |
| M06 | Bayesian online changepoint detection | change-online |
| M07 | Scale shift | change-scale-distribution |
| M08 | Distribution shift (KS) | change-scale-distribution |
| M09 | Correlation shift | change-dependence |
| M10 | Penalized linear segments | break-retrospective |
| M11 | Two-state Gaussian HMM | regime-latent |
| M12 | Prominent extrema | turn-extrema |
| M13 | Harmonic decomposition | season |
| M14 | Welch spectrum with ACF | season |
| M15 | Generalized Lomb–Scargle | season-irregular |
| M16 | Rolling spectrum | season-stability |
| M17 | Lead–lag | association |
| M18 | Event study | association |

A method that cannot run does not vanish. It is recorded with `availability: 'unavailable'`
and its own error, so an absent family is visible rather than silently reducing consensus.

### Eligibility and known failure modes

- Least squares uses deterministic Householder QR. A diagonal ratio below
  `limits.minimumQrDiagonalRatio` is `TDC-NUMERIC-SINGULAR`, not a silently poor fit.
- Scale floor is `max(absoluteVarianceFloor, relativeVarianceFloor · median|x|²)`, both
  supplied by config, so a near-constant series cannot manufacture a large standardized
  effect.
- Probabilities use log-sum-exp; a value outside $[-\epsilon, 1+\epsilon]$ is an error.
- No method uses `Math.random`. Grids and splits are declared.

## Direction, Type, Dynamics, Change

Direction is a family vote, not a single fit. `tdcClassifyTrend` counts eligible votes
across `trend-linear`, `trend-robust`, and `trend-local-state`; fewer than two eligible
families yields `unavailable`, and rising and falling votes together yield `mixed`.

Closed vocabularies:

- **direction** — `rising | falling | flat/range | mixed | unavailable`
- **trendType** — `linear | nonlinear | exponential | segmented | regime-dependent |
  mean-reverting/range | mixed/unavailable`
- **truthState** — `current | stale | degraded | unavailable`

`tdcBuildToolRead` clamps an unrecognised `truthState` to `unavailable` and withholds the
numerics with it. An undeclared state reaching a consumer is worse than an absent one: a
reader switching on the enum falls through every arm, or treats the unknown as healthy.

## Multiplicity And Held-Out Policy

Period and lag scans search broadly, so raw significance is not evidence. Discovery applies
Benjamini–Hochberg; activation applies Holm. An in-sample winner does not activate on its
own — it must survive a held-out window, and the recorded `heldOutMinimumGain` is what
distinguishes a real component from the best of many draws.

Association stays association. `tdcInfluenceDiagnostics` and the lead–lag output carry
`mechanismEstablished`, and no UI path promotes a lag relationship to causation.

## Cycle Taxonomy

Six cycle types, each with its own eligibility and its own evidence tier:
`deterministic-calendar`, `empirical-seasonality`, `quasi-periodic-oscillation`,
`lifecycle`, `regime`, `event`. A catalog entry keeps its declared type; nothing is
activated without the evidence its type requires, and a structural break blocks activation
of a cycle whose window the break contaminates.

## Fixtures Versus Live Evidence

Both compositions reach their verdict through **one** function, `tdcComputeTrendEngine`.
The fixture path generates its series from a declared generator; the production path reads
real observations. Nothing else differs.

Two consequences are deliberate and worth stating, because both are places where a
plausible stand-in would have produced a confident lie:

- **Detection speed is withheld on live data.** A fixture knows where its change was
  injected (`levelSteps[0].index`); real observations never do. Passing the series length
  as a stand-in target would have counted every genuine alarm as a false one, so
  `speedReliability` is `null` when there is no ground truth.
- **Correlation is unavailable on live data.** Only one series is configured, so M09 has
  nothing to compare against and reports `unavailable` rather than being handed a
  substitute series.

Fixture routes carry `TEST FIXTURE` in the status band and disable owner publication.

## Controls

| Control | Values | Effect |
|---------|--------|--------|
| Sensitivity profile | `early`, `balanced`, `cautious` | Effect threshold, consensus families, persistence, CUSUM reference and limit |
| Horizon | `h63`, `h126`, `h252`, `h504` | Regression window, short window, bandwidth |
| Mode | Simple, Power | View only — never recomputes |

Profile and horizon changes create a new request and a new result. The mode control does
not.

## Owner Read

`tdcBuildToolRead(result)` emits the shared `rl-tool-read/v1` transport under the id
`trend-dynamics-cycle-lab`, with tool state nested as `metrics.contractVersion =
tdc-tool-read/v1`.

Rules that hold regardless of state:

- A run with `complete !== true` publishes **nothing**. Completeness means every required
  work item resolved — eligible, unavailable, cancelled, or errored — not that every one
  succeeded.
- A `degraded` sentence is prefixed `Degraded:` so the Market Brief quotes it rather than
  recomputing the state.
- An `unavailable` read omits invalid numerics and carries `asOf: null`, `freshUntil: null`
  — never a zero, which a reader would take for a measurement.
- A rejected `putToolRead` surfaces `TDC-PUBLISH-REJECTED` and the page claims no Brief
  coverage. Both a throw and a plain `false` count as rejection.
- The deep link is an **allowlist** (`series`, `transform`, `horizon`, `profile`), so no
  credential or source payload can ride along in a shared URL.

`resultId` is derived from analysis content only. Timings and `computedAt` are excluded, so
the same analysis keeps one id across runs and two results stay comparable.

## Accessibility

- The mode control is a `role="tablist"` with `aria-selected` tracking the active view, so
  the state is announced structurally rather than shown by colour alone.
- It is operable from the keyboard; focus plus Enter switches modes.
- The status band is an `aria-live="polite"` region.
- The route is contained with no horizontal overflow at 390×844 and 1440×1000, measured in
  **both** modes — Power is the demanding case because that is where the dense panels
  render.
- The observed-series chart is drawn synchronously and carries a hover tooltip through the
  shared `RLCHART.attach` hit-test, plus a text equivalent stating the observation count,
  the date range, and the low/high/last values for anyone not reading pixels.

## Run Handoff

```bash
node scripts/selftest.mjs
node scripts/validate-trend-dynamics-cycle.mjs
PAGE=trend-dynamics-cycle-lab.html node -e '...'   # TDC-PAGE-INLINE-ID, see scopes.md
npx --no-install playwright test tests/trend-dynamics-cycle-lab.spec.mjs \
  --config=playwright.config.mjs --project=system-chrome --reporter=list
```

## Not Yet Delivered

Stated here so the note is not read as a completion claim:

- Scope 5 (as-of replay and revision records) is not started. The Power change-replay entry
  shows the current turning record's effective and detected observations and the delay
  between them; replaying a run at an earlier cutoff is Scope 5.
- The route is intentionally **not registered** in `tools.json`, `index.html`, or
  `rlnav.js`, and is listed in `site-exclusions.json`. Registration is Scope 4's own atomic
  step and moves together with the two selftest assertions that currently pin the exclusion.

**Educational research only. Not investment advice.**
