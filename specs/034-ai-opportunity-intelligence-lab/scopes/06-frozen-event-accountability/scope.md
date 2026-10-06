# Scope 6 — Frozen event accountability

Scope ID: `06-frozen-event-accountability`
**Status:** Not Started
Scope-Kind: runtime-behavior
Depends On: `05-earnings-signals-and-market-gates`

## Outcome And Requirements

Freeze pre-event expectations/assumptions/return windows, retire completed events, append actuals, and score eligible dimensions without hindsight. Opening gaps and regular close-to-close returns stay separate. Abstentions count as coverage, not zero error or hits. FR-034-072–073, 081–082, 092–096; SCN-034-021–022, 025–026; NFR-034-001, 011, 014–015.

## Gherkin

```gherkin
Scenario: SCN-034-021 Retire a completed earnings event
  Given a previously approaching event has completed
  When the next generation publishes
  Then the event appears in completed-event accountability
  And it no longer appears as the next event or receives a new option selection

Scenario: SCN-034-022 Do not retain an expired event date
  Given the last event completed and its successor date is unverified
  When the company calendar publishes
  Then the next date is unavailable with a reason
  And the completed date remains only in event history

Scenario: SCN-034-025 Use the frozen return window
  Given a pre-event forecast declares regular close-to-close scoring
  And an event has opposite opening-gap and close-return signs
  When outcomes are scored
  Then the declared closing window controls stock-error scoring
  And the opening gap remains a separately sourced observation

Scenario: SCN-034-026 Abstention is not a hit
  Given the pre-event record contains no eligible numerical stock forecast
  When actuals arrive
  Then numeric error stays unavailable and abstention coverage increments
  And no hit credit or zero-error claim is recorded
```

## Implementation Plan

1. Store immutable forecast records with pre-release publication/freeze clocks, source evidence, consensus basis, assumptions, eligibility, dimension and return window.
2. Append event actuals separately. Keep fiscal release, guidance and revenue-only outcomes distinct. Retire completed events before the approaching-event list or option selection runs.
3. Source verified regular-session prices with split/corporate-action basis. Compute opening and close-to-close windows separately, never from intraday last trade.
4. Score operating direction, money bridge, timing, surprise and stock return independently. A conditional sensitivity cannot enter unconditional return error. Publish sample size, abstentions and insufficient-calibration status.
5. Preserve withdrawal/revision lineage. Do not claim probability calibration until genuine frozen out-of-sample outcomes support it.

## Test Plan

| ID | Type | Scenario ID | Persistent File and Exact Title | Command | Live system |
| --- | --- | --- | --- | --- | --- |
| TP-06-01 | functional | SCN-034-021 | `tests/ai-opportunity-outcomes.functional.mjs` — `completed event leaves the approaching queue and option selection` | `node --test tests/ai-opportunity-outcomes.functional.mjs` | Yes, real calendar/outcome composer |
| TP-06-02 | integration | SCN-034-022 | `tests/ai-opportunity-outcomes.integration.mjs` — `unverified successor date remains unavailable while history is retained` | `node --test tests/ai-opportunity-outcomes.integration.mjs` | Yes, real generation and event history |
| TP-06-03 | unit | SCN-034-025 | `tests/ai-opportunity-outcomes.unit.mjs` — `frozen declared window controls scoring while opening gap stays separate` | `node --test tests/ai-opportunity-outcomes.unit.mjs` | No |
| TP-06-04 | e2e-api | SCN-034-026 | `tests/ai-opportunity-outcomes.e2e.mjs` — `Regression: numerical abstention receives neither error nor hit credit` | `node --test tests/ai-opportunity-outcomes.e2e.mjs` | Yes, frozen production-format records and verified market observations |

### Definition of Done

- [ ] SCN-034-021: Retire a completed earnings event is verified against the specified Given/When/Then behavior.
- [ ] SCN-034-022: Do not retain an expired event date is verified against the specified Given/When/Then behavior.
- [ ] SCN-034-025: Use the frozen return window is verified against the specified Given/When/Then behavior.
- [ ] SCN-034-026: Abstention is not a hit is verified against the specified Given/When/Then behavior.
- [ ] TP-06-01 passes with actual completion, queue retirement, and expired-option proof.
- [ ] TP-06-02 passes with unknown successor-date and retained-history proof.
- [ ] TP-06-03 passes with freeze, declared-window, and separate-reaction evidence.
- [ ] TP-06-04 passes with abstention, unavailable error, and no-hit-credit proof.
- [ ] Scenario-specific E2E regression tests for every new/changed/fixed behavior pass.
- [ ] Broader E2E regression suite passes.
- [ ] Build quality gate: selftest, outcome/source-clock validator, artifact lint, append-only history and methodology docs pass; no after-event forecast edit exists.
