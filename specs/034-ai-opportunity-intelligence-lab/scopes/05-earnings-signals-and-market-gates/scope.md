# Scope 5 — Earnings signals and market gates

Scope ID: `05-earnings-signals-and-market-gates`
**Status:** Not Started
Scope-Kind: runtime-behavior
Depends On: `04-scoped-economic-models`

## Outcome And Requirements

Qualify pre-event early watches, realization alerts, erosion warnings, surprise alerts, and abstentions. Independent competitive, earnings-realization, and expectations conclusions appear across next earnings, six months, and twelve months. Calendar and options context is quality-gated. Reader-visible in-tool/Brief notice records do not claim external delivery. FR-034-035–045, 058–082; SCN-034-015–020, 023–024; NFR-034-001–002, 014–015.

## Gherkin

```gherkin
Scenario: SCN-034-015 Operational gains do not imply a stock surprise
  Given live deployment supports approaching earnings realization
  And comparable market expectations are unavailable
  When the assessment publishes
  Then realization may be approaching while expectations remain unresolved
  And no stock-surprise alert is emitted

Scenario: SCN-034-016 Refuse an unsupported loser label
  Given one peer reports a benefit on a different geography and denominator
  When the peer comparison runs
  Then no winner or loser ranking is published
  And the missing common comparison basis is named

Scenario: SCN-034-018 Publish a supported pre-earnings realization alert
  Given live adoption, scope, quality, recognition lag, retained economics and counterevidence are reviewed
  And the effect belongs to a named reporting period
  When the signal gate evaluates the assessment
  Then a realization alert appears in the in-tool lane and Brief
  And it carries its falsifier and next evidence check

Scenario: SCN-034-019 Warn early without claiming imminent earnings
  Given a dated deployment has a plausible economic mechanism
  And retained benefit or recognition timing is incomplete
  When the signal gate evaluates the assessment
  Then an early watch appears with missing bridge inputs
  And no realization or surprise alert is implied

Scenario: SCN-034-020 Keep a refused destination visible
  Given a qualified owner signal and a destination refusal
  When delivery status is recorded
  Then the owner notice remains visible with the destination reason

Scenario: SCN-034-023 Normalize an invalid zero volatility observation
  Given a provider returns raw IV30 equal to zero
  And the observation fails the usable-volatility check
  When the options record is normalized
  Then raw IV30 remains zero
  And normalized IV30 is unavailable with the failure reason

Scenario: SCN-034-024 Suppress an unsupported event-only move
  Given option quotes have wide spreads or incompatible observation times
  When the event magnitude is assessed
  Then total-expiration premium may appear with its exact label
  And the earnings-only implied move remains unavailable
```

## Implementation Plan

1. Add independent conclusion, horizon, peer-basis, signal, routing, calendar, consensus, and market contracts. Rank next event first; preserve longer milestones, cutoffs and unavailable states.
2. Require dated mechanism for early watch; require adoption/erosion, quality, period, capture/materiality and countercase for realization; additionally require comparable dated consensus for surprise.
3. Normalize common business/geography/period/denominator before winner/loser ranking. Cancellation, deterioration and contradiction re-arm reviews as promptly as gains.
4. Calendar distinguishes confirmed/estimated, fiscal cutoff, earnings/revenue-only, release local time/timezone. No expired event can be next. Store incompatible consensus feeds separately.
5. Store raw/normalized options, deliverable, quote/trade clocks, IV units, spread and liquidity. Suppress event-only variance when maturity or clock quality fails; never use option magnitude as direction.
6. Deduplicate in-tool and Brief notices by entity/mechanism/period/evidence revision. Export read-only routing projection; external Feature 020/Red Alert state remains unavailable or refused.

## Test Plan

| ID | Type | Scenario ID | Persistent File and Exact Title | Command | Live system |
| --- | --- | --- | --- | --- | --- |
| TP-05-01 | unit | SCN-034-015 | `tests/ai-opportunity-signals.unit.mjs` — `operational gain leaves expectations unresolved without comparable baseline` | `node --test tests/ai-opportunity-signals.unit.mjs` | No |
| TP-05-02 | functional | SCN-034-016 | `tests/ai-opportunity-peers.functional.mjs` — `incomparable peer evidence refuses winner and loser ranking` | `node --test tests/ai-opportunity-peers.functional.mjs` | Yes, real peer-basis validator |
| TP-05-03 | e2e-api | SCN-034-018 | `tests/ai-opportunity-signals.e2e.mjs` — `Regression: qualified realization alert preserves period countercase falsifier and next check` | `node --test tests/ai-opportunity-signals.e2e.mjs` | Yes, production-format generation and notice graph |
| TP-05-04 | functional | SCN-034-019 | `tests/ai-opportunity-signals.functional.mjs` — `incomplete retained economics remain an early watch` | `node --test tests/ai-opportunity-signals.functional.mjs` | Yes, real signal composer |
| TP-05-05 | integration | SCN-034-020 | `tests/ai-opportunity-routing.integration.mjs` — `destination refusal preserves the owner signal and reason` | `node --test tests/ai-opportunity-routing.integration.mjs` | Yes, real owner signal and destination projection |
| TP-05-06 | functional | SCN-034-023 | `tests/ai-opportunity-market.functional.mjs` — `invalid vendor zero IV remains raw and normalizes to unavailable` | `node --test tests/ai-opportunity-market.functional.mjs` | Yes, real market normalizer |
| TP-05-07 | functional | SCN-034-024 | `tests/ai-opportunity-market.functional.mjs` — `wide unsynchronized quotes suppress event-only magnitude` | `node --test tests/ai-opportunity-market.functional.mjs` | Yes, real market normalizer |

### Definition of Done

- [ ] SCN-034-015: Operational gains do not imply a stock surprise is verified against the specified Given/When/Then behavior.
- [ ] SCN-034-016: Refuse an unsupported loser label is verified against the specified Given/When/Then behavior.
- [ ] SCN-034-018: Publish a supported pre-earnings realization alert is verified against the specified Given/When/Then behavior.
- [ ] SCN-034-019: Warn early without claiming imminent earnings is verified against the specified Given/When/Then behavior.
- [ ] SCN-034-020: Keep a refused destination visible is verified against the specified Given/When/Then behavior.
- [ ] SCN-034-023: Normalize an invalid zero volatility observation is verified against the specified Given/When/Then behavior.
- [ ] SCN-034-024: Suppress an unsupported event-only move is verified against the specified Given/When/Then behavior.
- [ ] TP-05-01 passes with independent-conclusion and expectations-gap evidence.
- [ ] TP-05-02 passes with common-basis peer refusal evidence.
- [ ] TP-05-03 passes with qualified notice and complete alert-gate evidence.
- [ ] TP-05-04 passes with early-watch and missing-input evidence.
- [ ] TP-05-05 passes with destination-refusal and owner-signal retention evidence.
- [ ] TP-05-06 passes with raw zero and unavailable normalized-IV evidence.
- [ ] TP-05-07 passes with quote-quality and event-isolation refusal evidence.
- [ ] Scenario-specific E2E regression tests for every new/changed/fixed behavior pass.
- [ ] Broader E2E regression suite passes.
- [ ] Build quality gate: selftest, brief/owner-read claim contract, artifact lint, privacy and methodology docs pass; no external delivery or stock direction is fabricated.
