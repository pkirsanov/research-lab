# FX Regime & Currency Vehicle Lab

## Purpose

The FX Regime Lab answers one question: given a currency view, which listed
vehicle — if any — is an eligible way to express it? It is an ETF-first
workspace. It is not a spot-FX terminal, a carry-trade optimizer, a forecast, or
an execution surface. It never proposes a spot pair, a forward, an NDF, or a
margin position.

The lab's default answer is refusal. A recommendation is emitted only when every
eligibility fact is present, current, and rights-clear. Absent that, the reader
sees `Recommendation unavailable` with the exact reason codes that produced it.
No constraint is ever relaxed to manufacture an answer.

## Evidence Model

### Currency view, not ticker spelling

A pair read never infers orientation from how a ticker is written. `USDJPY` and
`JPYUSD` are the same economic relationship observed from two sides; the lab
resolves an explicit `base` and `quote` and derives direction from the resolved
economic relationship, never from string order. A vehicle whose economic side
contradicts the requested direction is dispositioned `DIRECTION_MISMATCH`, not
silently inverted.

### The dollar is three separate slots

There is no single "the dollar". The lab carries three distinct dollar
comparisons and never pools them:

- `Broad` — the broad trade-weighted comparison
- `AFE` — advanced foreign economies
- `EME` — emerging market economies

A reading taken against one slot is never restated against another. A vehicle
tracking one basket is dispositioned `BASKET_MISMATCH` against a view expressed
in a different basket, even when both are colloquially "dollar" exposure.

### Cohort boards never pool

`G10`, `liquid-EM`, and `managed-reference` are separate boards. A managed or
pegged reference currency is not comparable to a freely floating one, so the lab
refuses to rank them on a shared board. Cohort selection is a hard partition,
not a filter over one pooled list.

### Vehicle disposition is settled, never inferred

Every vehicle in `fx-vehicle-universe.json` carries a settled disposition with
its exact reason codes. The reason vocabulary is closed:

- `RIGHTS_UNCLEAR` — the observation's redistribution rights are not settled
- `REQUIRED_FACT_MISSING` — an eligibility fact the decision needs is absent
- `TRACKING_EVIDENCE_INCOMPLETE` — tracking residual cannot be attributed
- `DIRECTION_MISMATCH` — the vehicle's economic side contradicts the view
- `BASKET_MISMATCH` — the vehicle tracks a different dollar slot or basket
- `DAILY_RESET_BOUNDARY` — a daily-reset vehicle outside its holding window

`Eligible` requires the absence of every one of these. A vehicle is never
promoted by dropping a reason code.

### Daily reset is a boundary, not a footnote

Daily-reset vehicles (leveraged and inverse wrappers) compound path-dependently.
Their eligibility is bounded by `dailyResetPermission`:

- `exclude` — daily-reset vehicles are never eligible
- `permit-tactical` — eligible only inside the `tactical` horizon

A `swing` or `structural` horizon never admits a daily-reset vehicle, regardless
of permission. The horizon is the binding constraint.

### Tracking residual must be attributable

A vehicle's realized tracking difference is decomposed into explained components
(expense, financing, basket construction). Whatever remains unexplained is the
residual. A residual that cannot be attributed yields
`TRACKING_EVIDENCE_INCOMPLETE`; the lab does not treat an unexplained gap as
noise.

## Rights Gate

Every observation carries explicit redistribution rights. An observation whose
rights are `unknown` normalizes to `availability: unavailable` with
`RIGHTS_UNCLEAR`.

**Current committed posture:** all 95 vehicle observations in
`fx-vehicle-universe.json` carry `rights: "unknown"`. Every one therefore
normalizes to unavailable, all seven vehicles (FXY, FXE, UUP, UDN, USDU, CEW,
YCS) settle as `Unavailable`, and the reader decision is
`Recommendation unavailable`. This is the correct, intended behavior of the
rights gate on rights-unclear evidence — not a defect and not a placeholder.
Publishing rights-clear observations is what changes it; weakening the gate is
not.

## Views

Simple and Power are two compositions over one model. A view switch cannot
fetch, reset a control, or change a disposition. The thirteen controls recompute
synchronously and transactionally: a rejected value never lands, so a failed
recompute cannot wedge the route.

Brief consumes the tool read through the shared brief runtime. Journey runs two
DAGs — currency-vehicle-selection (wizard) and wrapper-mismatch (decision-tree)
— through the production Journey runtime.

## Relationship To Global Rotation

The FX lab owns currency. The Global Rotation Lab owns equity. The Brief states
their relationship — `Agreement`, `Divergence`, or `Insufficient Evidence` — by
reading both tool reads, never by synthesizing a direction. When either read is
missing, stale, non-current, or its direction is not attributable, the classifier
returns `Insufficient Evidence` with its blocking reasons rather than guessing.

## Boundaries

- No spot-FX, forward, NDF, or margin instrument is ever proposed.
- No cross-cohort ranking.
- No dollar-slot substitution.
- No rights-unclear observation is published or used as a decision fact.
- No recommendation without a settled `Eligible` vehicle.
