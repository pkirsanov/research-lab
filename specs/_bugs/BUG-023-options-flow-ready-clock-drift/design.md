# Bug Fix Design: BUG-023 Options Flow Ready Clock Drift

## Design Status

This document is the reconciled technical design for BUG-023. It replaces the
provisional discovery handoff with one active clock contract and one repair path.

No product source, test source, planning artifact, evidence artifact, or
certification state changed during this design stage.

## Design Brief

### Current State

`scripts/selftest.mjs` calls `buildOptionsFlowToolRead()` without `asOf` in its
positive owning-model map. That call therefore uses the wall clock.

`scripts/brief-refresh.mjs` rejects evidence when its age is greater than seven
days. The current owner evidence has crossed that boundary, so production returns
the correct unavailable shape.

The same selftest still requires `ready` and reads `contractsFlagged`,
`consideredCount`, and `top.length`. The captured run therefore reports three
failures from one state mismatch.

### Target State

The selftest will derive every options-flow decision instant from the newest
owner snapshot. The positive, boundary, and stale cases will call the unchanged
production builder with explicit ISO instants.

The live production default will continue to use the wall clock. Stale evidence
will remain unavailable and will never receive ready-only metrics.

### Patterns to Follow

- Use `brief-refresh.mjs#loadToolFunctions` to load the page-owned
   `parsePagesChain` function.
- Use `owner-state.mjs#optionsFlowOwnerState` to derive the owner evidence clock.
- Follow the explicit evidence-time pattern used by the AI-capex assertions in
   `scripts/selftest.mjs`.
- Continue to obtain counts, lean, scores, and ranking from
   `options.js#computeAnomalySummary` through the production builder.

### Patterns to Avoid

- Do not use a wall-clock call as a permanent positive fixture.
- Do not change `OWNER_SNAPSHOT_FRESH_MAX_DAYS` or its strict comparison.
- Do not refresh committed market data solely to restore a passing test.
- Do not add plausible counts, lean, scores, or arrays to unavailable results.
- Do not touch Feature 031, Horizon Ladder, registry, navigation, or Lab routes.

### Resolved Decisions

- `ownerState.nowMs` is the sole evidence-clock source.
- Age zero is the primary positive model case.
- Exactly seven days is inside the accepted boundary.
- Seven days plus one millisecond is the first stale case.
- Every options-flow call in this assertion group receives explicit `asOf`.
- Ready-only metrics are read only inside a `state === 'ready'` branch.
- The implementation boundary is the options-flow block in `scripts/selftest.mjs`.

### Open Questions

None found - the current source defines the clock source, threshold, comparison,
owner parser, owner state, and owner model needed for this repair.

## Purpose And Scope

This repair makes repository validation independent of the date it runs. It does
not change product freshness behavior or options-flow calculations.

The design covers one selftest consumer of the existing owner-read contract. It
also defines exact edge cases and failure reporting for that consumer.

## Requirement Coverage

| Requirement | Design contract |
| --- | --- |
| `FR-BUG023-001` | Keep the seven-day limit and reject only ages greater than seven days. |
| `FR-BUG023-002` | Build the clock source through `optionsFlowOwnerState()`. |
| `FR-BUG023-003` | Obtain all ready metrics through `computeAnomalySummary()`. |
| `FR-BUG023-004` | Pass `ownerState.nowMs` as the positive decision instant. |
| `FR-BUG023-005` | Pass `ownerState.nowMs + 7D + 1` as the stale decision instant. |
| `FR-BUG023-006` | Guard every ready-only metric read behind `state === 'ready'`. |
| `FR-BUG023-007` | Constrain product edits to the options-flow selftest block. |

## Root Cause Analysis

### Controlling Path

The failure crosses four existing owners:

1. `scripts/selftest.mjs` creates the positive read without `asOf`.
2. `scripts/brief-refresh.mjs#buildOptionsFlowToolRead` selects `deps.asOf` or the
    wall clock and computes age from `ownerState.nowMs`.
3. `scripts/owner-state.mjs#optionsFlowOwnerState` sets `nowMs` to the newest
    accepted snapshot observation.
4. `rlexperience-adapters/options.js#computeAnomalySummary` produces considered,
    flagged, lean, score, and ranking values after freshness admission.

### Failure Mechanism

The selftest combines a live-clock input with a timeless expected state. Finite
evidence must eventually make those contracts disagree.

The builder currently evaluates this predicate:

```text
ageDays is not finite OR ageDays > 7 => unavailable
```

The unavailable result contains only `metrics.state` and `metrics.reason`. The
selftest then reads ready-only properties from that result.

### Root Cause

The defect belongs to the test clock contract. Production applies the intended
finite-freshness rule and the test omits the time input needed for a stable
positive case.

The owner clock itself is not defective. `optionsFlowOwnerState()` anchors both
`asOf` and `nowMs` to the newest accepted snapshot observation.

## Architecture Overview

The repaired data flow remains inside existing functions:

```text
data/options/<ticker>.json
   -> optionSnapshot()
   -> snapshotClockMs()
   -> optionsFlowOwnerState(...parsePagesChain)
   -> ownerState.nowMs
   -> explicit test decision instants
   -> buildOptionsFlowToolRead({ asOf })
   -> computeAnomalySummary()
   -> ready or unavailable assertions
```

The selftest derives time from production owner input. It does not inject an owner
result, duplicate snapshot parsing, or bypass the production builder.

## Clock Contract

Let $T$ be `ownerState.nowMs` and let $D = 86,400,000$ milliseconds.

| Case | Explicit decision instant | Expected state | Required evidence |
| --- | --- | --- | --- |
| Positive | $T$ | `ready` | Real counts, lean, score, and ranking |
| Inclusive boundary | $T + 7D$ | `ready` | The same real owner-model output |
| First stale instant | $T + 7D + 1$ millisecond | `unavailable` | Named stale reason and no ready-only metrics |
| Invalid instant | An unparseable `asOf` | `unavailable` | Existing undated refusal behavior remains unchanged |

The exact seven-day case protects the current strict `>` comparison. The first
stale instant proves that finite freshness still rejects evidence beyond seven
days.

An omitted `asOf` remains valid production input and continues to select the wall
clock. The deterministic positive selftest does not use that input form.

## Data Model And Storage

This repair adds no persistent data and changes no snapshot schema.

The selftest uses these transient values:

| Value | Type | Source | Constraint |
| --- | --- | --- | --- |
| `flowOwnerState` | `options-owner-state/v1` object | `optionsFlowOwnerState()` | Non-null with a finite `nowMs` |
| `flowOwnerState.nowMs` | number | Newest accepted option snapshot | Finite epoch milliseconds |
| `positiveAsOf` | ISO 8601 string | `new Date(nowMs).toISOString()` | Age equals zero |
| `boundaryAsOf` | ISO 8601 string | `new Date(nowMs + 7D).toISOString()` | Age equals seven days |
| `staleAsOf` | ISO 8601 string | `new Date(nowMs + 7D + 1).toISOString()` | Age is greater than seven days |

No DDL, migration, cache write, network request, or fixture refresh is required.

## Function Contracts And Error Model

### Existing Production Inputs

`buildOptionsFlowToolRead(deps = {})` keeps its current contract:

| Input | Type | Behavior |
| --- | --- | --- |
| `root` | repository path | Selects the committed evidence root |
| `universe` | array of ticker strings | Restricts the owner evidence scan |
| `asOf` | parseable date string | Selects the freshness decision instant |

The repair passes only the existing `asOf` input. It adds no production parameter
and changes no export.

### Existing Output States

A ready result retains the current owner-model metrics. These include `tickers`,
`contractsFlagged`, `consideredCount`, `lean`, `maxScore`, and `top`.

An unavailable result retains only `metrics.state` and `metrics.reason`. The
selftest must verify that ready-only keys are absent.

The owner-state precondition fails loudly when owner evidence is absent or its
clock is not finite. It must not substitute a date or empty state.

## Selftest Integration Design

The options-flow setup moves before the general `reads` map. It uses the existing
exports and a local duration constant.

```javascript
const flowPage = refresh.loadToolFunctions(
   'options-flow-feed-lab.html',
   ['parsePagesChain']
);
const flowOwnerState = owner.optionsFlowOwnerState(ROOT, {
   parseChain: flowPage.parsePagesChain
});
if (!flowOwnerState || !Number.isFinite(flowOwnerState.nowMs)) {
   throw new Error('options-flow owner evidence requires a finite snapshot clock');
}

const optionsFlowDayMs = 86400000;
const optionsFlowAt = (offsetMs) => new Date(
   flowOwnerState.nowMs + offsetMs
).toISOString();
const flow = refresh.buildOptionsFlowToolRead({ asOf: optionsFlowAt(0) });
```

The `reads` map uses `flow` for `options-flow-feed-lab`. The existing `readyIds`
contract can therefore remain intact without depending on the wall clock.

The model assertions execute only when `flow.state === 'ready'`. A state mismatch
records the direct ready-state failure and cannot trigger a `top.length` exception.

The no-chain case also receives `asOf: optionsFlowAt(0)`. The boundary and stale
cases use `optionsFlowAt(7 * optionsFlowDayMs)` and
`optionsFlowAt(7 * optionsFlowDayMs + 1)`.

The stale assertions require `state === 'unavailable'`, a named stale reason, and
absence of every ready-only metric key. They do not add zero values or empty arrays.

## UI And User Experience

None found - this defect is in the build-free repository selftest. The design
changes no page, route, component, visible copy, navigation, or responsive state.

## Security, Privacy, And Compliance

The repair reads the same committed option snapshots already used by production.
It adds no credential, personal data, remote source, or mutable storage path.

The stale refusal preserves source-qualified decision behavior. It prevents old
market evidence from appearing current and prevents unavailable data from looking
like a neutral signal.

## Configuration, Migration, And Rollout

No configuration key, dependency, package, environment value, or migration
changes. The repository selftest is the only integration surface.

The changed assertion block takes effect when its source change lands. No feature
flag, data rewrite, compatibility layer, or deployment action applies.

## Observability And Failure Handling

The selftest remains the observable contract. It must report the first state
mismatch directly instead of a secondary property-access exception.

The owner-clock precondition names a missing or invalid evidence clock. The stale
branch names stale tape and exposes no fabricated analysis.

The complete selftest may still report failures owned by other packets. BUG-023
validation must classify those failures without absorbing or editing them.

## Testing And Validation Strategy

| Scenario | Test type | Production path | Required assertion |
| --- | --- | --- | --- |
| `SCN-BUG023-001` | Functional regression | `buildOptionsFlowToolRead({ asOf: T + 7D + 1 })` | Unavailable, stale reason, no ready-only keys |
| `SCN-BUG023-002` | Functional regression | Builder at $T$ and $T + 7D$ | Ready with real considered, flagged, lean, score, and ranking output |
| `SCN-BUG023-003` | Repository regression | `node scripts/selftest.mjs` | No options-flow clock drift or unavailable-property exception |

Every branch uses the same production builder. The positive branch reaches
`computeAnomalySummary()` through real owner evidence.

The negative controls are:

- Remove the positive `asOf`. The current aged evidence must reproduce the state
   mismatch.
- Change the production comparison from `>` to `>=`. The exact seven-day case
   must fail.
- Move the stale instant to seven days or less. The stale assertion must fail.
- Replace owner-model output with a shaped value. The metric and ranking
   assertions must fail.
- Remove the ready-state guard. An unavailable result must expose the secondary
   property-access failure that this design eliminates.

This design stage ran no product test. Test execution and evidence ownership stay
with the implementation and test stages.

## Change Boundary

The only allowed product change is the options-flow owning-read block in
`scripts/selftest.mjs`.

The following product paths remain unchanged:

- `scripts/brief-refresh.mjs`
- `scripts/owner-state.mjs`
- `rlexperience-adapters/options.js`
- `data/options/**`
- `specs/031-shock-transmission-foundation/**`
- `rlshock.js` and all Feature 031 tests or fixtures
- every Horizon Ladder source, data, note, and test
- `tools.json`, `index.html`, and `rlnav.js`
- every page or route, including standalone Lab routes

Planning and evidence agents may update only their owned BUG-023 artifacts.

### Single-Implementation Justification

This is a narrow clock-contract repair for one existing selftest consumer. It
adds no provider, adapter, strategy, screen, service, or shared contract.

A new capability foundation would duplicate the existing owner-state and
options-anomaly foundations without removing complexity.

## Alternatives And Tradeoffs

### Refresh The Committed Snapshots

Rejected. New snapshots would hide the test defect and the same failure would
return after seven days.

### Remove Options Flow From `readyIds`

Rejected. That change would remove the positive owner-model proof and allow the
ready path to decay unnoticed.

### Raise Or Remove The Freshness Limit

Rejected. That change would weaken decision quality and permit stale market
evidence to appear current.

### Add Ready-Shaped Metrics To Unavailable Results

Rejected. Zero counts, balanced lean, and empty rankings would be plausible but
false analysis.

### Inject A Clock Into Production

Rejected. Production already accepts `asOf`, so another clock seam would expand
the public contract without adding control.

### Export The Freshness Constant

Rejected. The seven-day value is a required behavior that the regression should
protect independently. Importing the implementation constant would let an
unreviewed behavior change update both code and expectation together.

## Complexity Tracking

None — simplest viable approach used.

## Routing Contract

The next required owner is `bubbles.plan`. Planning must reconcile `scopes.md`,
`scenario-manifest.json`, and `test-plan.json` with the exact three clock cases,
ready-state guard, negative controls, and selftest-only change boundary.

After planning, `bubbles.implement` owns the bounded `scripts/selftest.mjs` edit.
`bubbles.test` owns current-session red and green execution evidence.

`F031-BROAD-OPTIONS-FLOW-001` remains unresolved until implementation and test
evidence prove the repaired options-flow group. This design does not pre-check a
Definition of Done item or change certification state.
