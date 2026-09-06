# Bug Specification: BUG-023 Options Flow Ready Clock Drift

## Intent

Keep the options-flow owner read honest about stale committed evidence while making
its positive and negative repository regressions independent of the wall-clock date.

## Outcome Contract

**Intent:** Keep repository validation calendar-stable without weakening the live
options-flow freshness decision.

**Success Signal:** The owner read is `ready` at the owner evidence time and the
inclusive seven-day boundary, becomes `unavailable` one millisecond later, and
never exposes ready-only metrics from an unavailable result.

**Hard Constraints:**

- The live production default continues to use the current decision time and
  rejects evidence older than seven days.
- Missing or stale owner evidence remains unavailable. It never becomes a zero,
  neutral signal, plausible metric set, or fabricated ranking.
- Ready output continues to come from the existing owner state and owner model.
- The repair changes no Feature 031, Horizon Ladder, route, registry, navigation,
  production owner, or committed market-data behavior.

**Failure Condition:** The bug remains unresolved if a positive regression depends
on the wall-clock date, stale evidence can appear ready, or an unavailable result
can be consumed as though it carries ready-only metrics.

**External Finding Boundary:** BUG-017 certification drift, BUG-024 historical-path
classification, and the Feature 031 `TP-01-08` digest expectation are independent
repository findings. They do not change this clock contract or authorize changes
to those artifacts in BUG-023.

### Single-Capability Justification

BUG-023 repairs one calendar-sensitive selftest consumer of the existing
options-flow owner-read capability. It adds no provider, adapter, strategy,
screen, service, variant, or shared contract. A new domain capability model would
duplicate the established owner-state, freshness, and anomaly-model boundaries
without removing complexity.

## Current Failure Contract

The production builder rejects a chain when its age is greater than seven days.
The broad selftest invokes that builder without a decision time, requires `ready`,
then reads ready-only metrics. Once the committed chain ages out, one valid
production refusal becomes three broad failures.

## Expected Behavior

1. A live call with stale evidence returns a named unavailable result.
2. An unavailable result carries no fabricated contract count, premium, lean,
   ranking, or score.
3. A positive model regression supplies an explicit in-window decision time derived
   from the owner evidence and reaches the real owner model.
4. A stale model regression supplies an explicit out-of-window decision time and
   reaches the existing refusal.
5. Ready-only metric assertions execute only after the positive call proves ready.
6. The complete repository selftest produces the same options-flow result on any
   calendar date when source bytes and test inputs are unchanged.

## Stable Scenarios

### SCN-BUG023-001: Live stale evidence remains unavailable

Given committed options evidence older than the production freshness boundary,
when the live owner read evaluates at the current decision time, then it returns
`unavailable`, names the evidence age, and exposes no ready-only metrics.

### SCN-BUG023-002: Positive owner-model proof uses an explicit evidence clock

Given the same committed owner state and an explicit decision time inside the
seven-day boundary, when the options-flow read runs, then it reaches `ready` and
publishes the owner model's real considered, flagged, lean, and ranked-contract
values.

### SCN-BUG023-003: Repository validation is calendar-stable

Given unchanged repository bytes and explicit clocks for the positive and stale
cases, when `node scripts/selftest.mjs` runs on different calendar dates, then the
options-flow assertions keep the same outcome and no unavailable value is
dereferenced as a ready result.

## Functional Requirements

- `FR-BUG023-001`: Preserve the production freshness threshold and stale refusal.
- `FR-BUG023-002`: Preserve `optionsFlowOwnerState()` as the owner-input builder.
- `FR-BUG023-003`: Preserve `computeAnomalySummary()` as the owner-model calculation.
- `FR-BUG023-004`: Give the positive regression an explicit in-window decision time.
- `FR-BUG023-005`: Give the stale regression an explicit out-of-window decision time.
- `FR-BUG023-006`: Prevent secondary ready-only metric dereferences after an
  unavailable result.
- `FR-BUG023-007`: Keep Feature 031, Horizon Ladder, registry, navigation, and
  standalone-Lab boundaries unchanged.

## Non-Functional Requirements

- The test must execute production functions rather than restating freshness math.
- The negative control must fail if the positive case returns unavailable or if the
  stale case returns ready.
- The repair must not refresh or fabricate market data solely to make a test green.
- The broad selftest must remain the repository-level success signal.

## Acceptance Criteria

- The exact pre-fix broad command remains recorded with its three options-flow
  failures.
- Focused positive and stale cases both execute the same production builder.
- The positive case proves real owner metrics and ranking output.
- The stale case proves the named unavailable result and absent ready-only metrics.
- The complete selftest exits zero after all independently owned baseline groups
  are repaired.
- No protected Feature 031, Horizon Ladder, registry, navigation, or standalone-Lab
  path changes.

## Non-Goals

- Changing Feature 031 behavior or tests.
- Treating stale market evidence as current.
- Adding a new tool route or standalone Lab.
- Replacing the options-flow owner formula.
- Resolving BUG-017, BUG-024, or Feature 031 findings within this packet.
