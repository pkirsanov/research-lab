# Feature 018 Execution Report

This report is a structural template created during planning. It is filled from
execution only. Nothing in it may be written from expectation, inference or
summary, and no anchor may be filled with a paraphrase of a run.

It is a **rollup**. Raw per-row terminal output lives in the six per-scope
reports under `scopes/*/report.md`, and this file links to those anchors rather
than copying them, because a second transcript of the same run is a second thing
that has to be kept true and the two drift the moment either is edited.

## Summary

Filled at execution. Must state the scope count delivered, the DoD items ticked
and unticked, and the published bond read's actual `state`, `durationPosture`,
`creditRegime` and `evidenceGaps` after the feature landed.

## What This Feature Does And Does Not Resolve

This section is pre-written because it is the one claim most likely to be
overstated at completion, and the repository already holds the evidence that
settles it.

**Resolved by this feature:** the curve level, the curve impulse, the inflation
family and the duration axis, supplied from a committed official artifact through
the existing injection seam, with the model unchanged.

**Not resolved by this feature:** the credit axis. It requires an independent
credit-spread family that `bond-regime-universe.json:41-50` marks
`restricted-local-view` and `memory-only`, and `spec.md` Non-Goal 5 forbids
changing that. `bond-regime-lab.html:1934` returns `null` from
`selectResearchExpression` while either axis is `Indeterminate`, and
`scripts/brief-refresh.mjs:1571` publishes `state: 'unavailable'` when no
preferred sleeve results.

**The expected published outcome, already asserted at
`scripts/selftest.mjs:5670-5682`:** `state` stays `"unavailable"`,
`durationPosture` resolves, `curveState`, `curveImpulse` and `inflationState`
resolve, and `evidenceGaps` narrows from three entries to the credit gap alone.
A completion statement claiming a resolved bond verdict is measuring the wrong
thing.

## Test Evidence Index

| Scope | Rows | Per-scope report |
| --- | --- | --- |
| 1 — Official Curve Artifact Contract And Validation Gate | TP-01-01 … TP-01-11 | [`scopes/01-official-curve-artifact-contract/report.md`](scopes/01-official-curve-artifact-contract/report.md) |
| 2 — Tier-A Official Curve Acquisition | TP-02-01 … TP-02-08 | [`scopes/02-tier-a-official-curve-acquisition/report.md`](scopes/02-tier-a-official-curve-acquisition/report.md) |
| 3 — Observed-Cadence Freshness Admission | TP-03-01 … TP-03-07 | [`scopes/03-observed-cadence-freshness-admission/report.md`](scopes/03-observed-cadence-freshness-admission/report.md) |
| 4 — Headless Consumption Path | TP-04-01 … TP-04-10 | [`scopes/04-headless-consumption-path/report.md`](scopes/04-headless-consumption-path/report.md) |
| 5 — Brief Read And Provenance Render | TP-05-01 … TP-05-08 | [`scopes/05-brief-read-and-provenance-render/report.md`](scopes/05-brief-read-and-provenance-render/report.md) |
| 6 — One-Model Parity Guarantee | TP-06-01 … TP-06-07 | [`scopes/06-one-model-parity-guarantee/report.md`](scopes/06-one-model-parity-guarantee/report.md) |

Total: **51 rows**. Every row's raw output belongs in its scope's report at the
anchor the Test Plan names.

## Scenario Coverage

Filled at execution from `scenario-manifest.json`. Must state, for each of
SCN-018-001 … SCN-018-038, whether its linked rows executed and passed. A
scenario with no executed row is recorded as such rather than assumed covered.

## Measured Figures Owed By The Design

`design.md` records two figures as arithmetic rather than measurement and names
the run that settles each. Both are filled here from execution.

| Figure | Design's stated basis | Measured value | Where measured |
| --- | --- | --- | --- |
| `maxObservedGapDays` and the derived `windowDays` | unmeasured; no committed Treasury artifact existed at design time | Filled at execution | `scopes/03-observed-cadence-freshness-admission/report.md` |
| Artifact byte size | estimated near 72 KB by arithmetic over a known row shape | Filled at execution | `scopes/02-tier-a-official-curve-acquisition/report.md` |
| First-load total against `briefFirstLoadMaxBytes` | measured 175,359 of 204,800 at design time, before the `curveAdmission` addition | Filled at execution | `scopes/04-headless-consumption-path/report.md` |

## Routed Items And Their Landing Sites

| Item | Routed by | Landed in | Recorded as |
| --- | --- | --- | --- |
| R-2 — the underivable-freshness wording states an observation count | `design.md`, to `bubbles.ux` | Scope 5 | SCN-018-035, TP-05-06, one Core Delivery item |
| R-3 — the sixth `Cannot be compared` reason, unequal observation windows | `design.md`, to `bubbles.ux` | Scope 6 | SCN-018-037, TP-06-04, one Core Delivery item |
| R-4 — the `persistence` field interpretation | `design.md`, to `bubbles.plan` | Scope 1 | SCN-018-020, TP-01-08, one Core Delivery item, and `scopes/_index.md` § *Routed Item R-4* |
| R-5 — the spec-test-path guard | `design.md`, to `bubbles.plan` | Scope 1 | SCN-018-022, TP-01-10, one Core Delivery item, and `scopes/_index.md` § *Test Surface Decision* |
| R-1 — the 2026-08-24 sleeve-characteristic expiry | `design.md`, to a separate spec | Owned by that separate spec, not by this feature | Named here so a reader who finds the bond read still unresolved knows there are two independent causes |

## Code Diff Evidence

Filled at execution with the verbatim `git --no-pager diff --stat` over the
files this feature's six Change Boundary tables allow.

## Findings Raised

Filled at execution. Each finding carries an id, the evidence that produced it,
its disposition and its owner.

## Completion Statement

Filled at execution. It must state the published `state`, `durationPosture`,
`creditRegime` and `evidenceGaps` verbatim from `market-brief.payload.json`, and
it must not describe a `state` of `unavailable` with a resolved duration axis as
a failure — that is the outcome this feature was built to reach.
